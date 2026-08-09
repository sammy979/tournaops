// lib/tournament-generator.ts
// ============================================================
// Safe tournament plan generator built on top of reusable
// templates. This does NOT write to the database.
// It generates and validates a tournament plan that later phases
// can persist atomically.
// ============================================================

import {
  buildTemplateStages,
  getTournamentTemplate,
  TournamentStageTemplate,
  TournamentTemplateKey,
} from "@/lib/tournament-templates";

export interface TournamentGenerationInput {
  teamCount: number;
  templateKey: TournamentTemplateKey;
  mapRotation?: string[];
  customStages?: TournamentStageTemplate[];
}

export interface TournamentGenerationWarning {
  code:
    | "TEAM_COUNT_CLAMPED"
    | "FIRST_STAGE_CAPACITY_EXCEEDS_TEAM_COUNT"
    | "EMPTY_CUSTOM_TEMPLATE";
  message: string;
}

export interface TournamentGenerationResult {
  templateKey: TournamentTemplateKey;
  templateLabel: string;
  teamCount: number;
  mapRotation: string[];
  stages: TournamentStageTemplate[];
  warnings: TournamentGenerationWarning[];
  summary: {
    stageCount: number;
    totalMatches: number;
    firstStageGroups: number;
    firstStageCapacity: number;
  };
}

const DEFAULT_MAPS = ["Erangel", "Miramar", "Sanhok", "Rondo"];

function clampTeamCount(teamCount: number): number {
  if (!Number.isFinite(teamCount) || teamCount < 1) return 16;
  return Math.min(128, Math.max(1, Math.floor(teamCount)));
}

function validateStages(stages: TournamentStageTemplate[]): string[] {
  const errors: string[] = [];
  const seenNames = new Set<string>();

  stages.forEach((stage, idx) => {
    if (!stage.name?.trim()) {
      errors.push(`Stage ${idx + 1} is missing a name`);
    }
    if (seenNames.has(stage.name.trim().toLowerCase())) {
      errors.push(`Duplicate stage name: ${stage.name}`);
    }
    seenNames.add(stage.name.trim().toLowerCase());

    if (stage.numGroups < 1) errors.push(`${stage.name}: numGroups must be at least 1`);
    if (stage.teamsPerGroup < 1) errors.push(`${stage.name}: teamsPerGroup must be at least 1`);
    if (stage.matchesPerGroup < 1) errors.push(`${stage.name}: matchesPerGroup must be at least 1`);

    const capacity = stage.numGroups * stage.teamsPerGroup;
    if (capacity < 1) {
      errors.push(`${stage.name}: invalid capacity`);
    }

    if (stage.teamsAdvancing < 0) {
      errors.push(`${stage.name}: teamsAdvancing cannot be negative`);
    }

    if (!stage.qualificationRule?.type) {
      errors.push(`${stage.name}: qualificationRule.type is required`);
    }
  });

  return errors;
}

export function generateTournamentPlan(
  input: TournamentGenerationInput
): TournamentGenerationResult {
  const teamCount = clampTeamCount(input.teamCount);
  const template = getTournamentTemplate(input.templateKey);
  const mapRotation =
    Array.isArray(input.mapRotation) && input.mapRotation.length > 0
      ? input.mapRotation.slice(0, 10)
      : DEFAULT_MAPS;

  const warnings: TournamentGenerationWarning[] = [];

  if (teamCount !== input.teamCount) {
    warnings.push({
      code: "TEAM_COUNT_CLAMPED",
      message: `Requested team count ${input.teamCount} was clamped to ${teamCount}.`,
    });
  }

  const stages =
    input.templateKey === "CUSTOM"
      ? input.customStages || []
      : buildTemplateStages(input.templateKey, teamCount);

  if (input.templateKey === "CUSTOM" && stages.length === 0) {
    warnings.push({
      code: "EMPTY_CUSTOM_TEMPLATE",
      message: "Custom template has no stages yet.",
    });
  }

  const errors = validateStages(stages);
  if (errors.length > 0) {
    throw new Error(errors.join(" | "));
  }

  const firstStage = stages[0];
  if (firstStage) {
    const firstStageCapacity = firstStage.numGroups * firstStage.teamsPerGroup;
    if (firstStageCapacity > teamCount) {
      warnings.push({
        code: "FIRST_STAGE_CAPACITY_EXCEEDS_TEAM_COUNT",
        message: `First stage capacity is ${firstStageCapacity} teams but current team count is ${teamCount}. Unused slots will remain empty until teams are assigned.`,
      });
    }
  }

  const totalMatches = stages.reduce(
    (sum, stage) => sum + stage.numGroups * stage.matchesPerGroup,
    0
  );

  return {
    templateKey: template.key,
    templateLabel: template.label,
    teamCount,
    mapRotation,
    stages,
    warnings,
    summary: {
      stageCount: stages.length,
      totalMatches,
      firstStageGroups: firstStage?.numGroups || 0,
      firstStageCapacity: firstStage
        ? firstStage.numGroups * firstStage.teamsPerGroup
        : 0,
    },
  };
}

export function toLegacyStageConfig(
  result: TournamentGenerationResult
): Array<{
  name: string;
  type: string;
  groups: number;
  teamsPerGroup: number;
  matches: number;
  totalTeams: number;
  teamsAdvancing: number;
  qualificationRule: {
    type: "TOP_N_PER_GROUP" | "TOP_N_OVERALL";
    count: number;
  };
}> {
  return result.stages.map((stage) => ({
    name: stage.name,
    type: stage.type,
    groups: stage.numGroups,
    teamsPerGroup: stage.teamsPerGroup,
    matches: stage.matchesPerGroup,
    totalTeams: stage.totalTeams,
    teamsAdvancing: stage.teamsAdvancing,
    qualificationRule: stage.qualificationRule,
  }));
}