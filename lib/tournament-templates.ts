// lib/tournament-templates.ts
// ============================================================
// Reusable tournament template catalog for TournaOps
// This file is the source of truth for template metadata and
// sensible default stage structures.
// ============================================================

export type TournamentTemplateKey =
  | "QUICK_16"
  | "CUP_32"
  | "CUP_64"
  | "CUP_128"
  | "COMMUNITY_CUP"
  | "PMPL_STYLE"
  | "PMGC_STYLE"
  | "KILL_HEAVY"
  | "PLACEMENT_HEAVY"
  | "CUSTOM";

export interface TournamentStageTemplate {
  name: string;
  type: string;
  numGroups: number;
  teamsPerGroup: number;
  matchesPerGroup: number;
  totalTeams: number;
  teamsAdvancing: number;
  qualificationRule: {
    type: "TOP_N_PER_GROUP" | "TOP_N_OVERALL";
    count: number;
  };
  description?: string;
}

export interface TournamentTemplateDefinition {
  key: TournamentTemplateKey;
  label: string;
  description: string;
  category: "standard" | "community" | "pro" | "custom";
  recommendedTeamCounts: number[];
  defaultScoringPreset:
    | "PMGC"
    | "PMPL"
    | "COMMUNITY"
    | "KILL_HEAVY"
    | "PLACEMENT_HEAVY"
    | "CUSTOM";
  defaultMaps: string[];
  defaultDays: number;
  build: (teamCount: number) => TournamentStageTemplate[];
}

const DEFAULT_MAPS = ["Erangel", "Miramar", "Sanhok", "Rondo"];

function clampTeamCount(teamCount: number): number {
  if (!Number.isFinite(teamCount) || teamCount < 1) return 16;
  return Math.min(128, Math.max(1, Math.floor(teamCount)));
}

function groupsFor(teamCount: number, groupSize = 16): number {
  return Math.max(1, Math.ceil(teamCount / groupSize));
}

function stage(
  name: string,
  type: string,
  numGroups: number,
  teamsPerGroup: number,
  matchesPerGroup: number,
  teamsAdvancing: number,
  qualificationRuleType: "TOP_N_PER_GROUP" | "TOP_N_OVERALL",
  qualificationCount: number,
  description?: string
): TournamentStageTemplate {
  return {
    name,
    type,
    numGroups,
    teamsPerGroup,
    matchesPerGroup,
    totalTeams: numGroups * teamsPerGroup,
    teamsAdvancing,
    qualificationRule: {
      type: qualificationRuleType,
      count: qualificationCount,
    },
    description,
  };
}

function buildQuick16(teamCount: number): TournamentStageTemplate[] {
  const capped = Math.min(16, clampTeamCount(teamCount));
  return [
    stage(
      "Main Event",
      "GRAND_FINAL",
      1,
      Math.max(16, capped),
      6,
      1,
      "TOP_N_OVERALL",
      1,
      "Single-lobby quick cup"
    ),
  ];
}

function build32Cup(teamCount: number): TournamentStageTemplate[] {
  const capped = Math.min(32, clampTeamCount(teamCount));
  if (capped <= 16) return buildQuick16(capped);

  return [
    stage(
      "Qualifier",
      "OPEN_QUALIFIER",
      2,
      16,
      4,
      16,
      "TOP_N_PER_GROUP",
      8,
      "Two groups qualify to the grand final"
    ),
    stage(
      "Grand Final",
      "GRAND_FINAL",
      1,
      16,
      6,
      1,
      "TOP_N_OVERALL",
      1,
      "Grand final lobby"
    ),
  ];
}

function build64Cup(teamCount: number): TournamentStageTemplate[] {
  const capped = Math.min(64, clampTeamCount(teamCount));
  if (capped <= 16) return buildQuick16(capped);
  if (capped <= 32) return build32Cup(capped);

  const firstStageGroups = groupsFor(capped, 16);

  return [
    stage(
      "Qualifier",
      "OPEN_QUALIFIER",
      firstStageGroups,
      16,
      4,
      32,
      "TOP_N_PER_GROUP",
      8,
      "Top 8 from each group advance"
    ),
    stage(
      "Semi Final",
      "SEMI_FINAL",
      2,
      16,
      6,
      16,
      "TOP_N_PER_GROUP",
      8,
      "Top 8 from each semifinal group advance"
    ),
    stage(
      "Grand Final",
      "GRAND_FINAL",
      1,
      16,
      6,
      1,
      "TOP_N_OVERALL",
      1,
      "Grand final lobby"
    ),
  ];
}

function build128Cup(teamCount: number): TournamentStageTemplate[] {
  const capped = Math.min(128, clampTeamCount(teamCount));
  if (capped <= 16) return buildQuick16(capped);
  if (capped <= 32) return build32Cup(capped);
  if (capped <= 64) return build64Cup(capped);

  return [
    stage(
      "Qualifier",
      "OPEN_QUALIFIER",
      8,
      16,
      4,
      64,
      "TOP_N_PER_GROUP",
      8,
      "Top 8 from each group advance"
    ),
    stage(
      "Round 2",
      "GROUP_STAGE",
      4,
      16,
      4,
      32,
      "TOP_N_PER_GROUP",
      8,
      "Top 8 from each group advance"
    ),
    stage(
      "Semi Final",
      "SEMI_FINAL",
      2,
      16,
      6,
      16,
      "TOP_N_PER_GROUP",
      8,
      "Top 8 from each semifinal group advance"
    ),
    stage(
      "Grand Final",
      "GRAND_FINAL",
      1,
      16,
      6,
      1,
      "TOP_N_OVERALL",
      1,
      "Grand final lobby"
    ),
  ];
}

function buildCommunityCup(teamCount: number): TournamentStageTemplate[] {
  const capped = clampTeamCount(teamCount);
  const g = groupsFor(capped, 16);

  if (g === 1) {
    return [
      stage(
        "Community Cup",
        "GROUP_STAGE",
        1,
        16,
        5,
        1,
        "TOP_N_OVERALL",
        1,
        "Simple community format"
      ),
    ];
  }

  return [
    stage(
      "Community Groups",
      "GROUP_STAGE",
      g,
      16,
      4,
      16,
      "TOP_N_PER_GROUP",
      Math.max(1, Math.floor(16 / g)),
      "Community group stage"
    ),
    stage(
      "Community Final",
      "GRAND_FINAL",
      1,
      16,
      5,
      1,
      "TOP_N_OVERALL",
      1,
      "Community final lobby"
    ),
  ];
}

function buildPmplStyle(teamCount: number): TournamentStageTemplate[] {
  const capped = clampTeamCount(teamCount);
  if (capped <= 16) {
    return [
      stage(
        "League Stage",
        "GROUP_STAGE",
        1,
        16,
        6,
        1,
        "TOP_N_OVERALL",
        1,
        "PMPL-style league stage"
      ),
    ];
  }

  const g = Math.min(4, groupsFor(capped, 16));
  return [
    stage(
      "League Stage",
      "GROUP_STAGE",
      g,
      16,
      6,
      16,
      "TOP_N_PER_GROUP",
      Math.max(4, Math.floor(16 / g)),
      "PMPL-style league stage"
    ),
    stage(
      "Grand Final",
      "GRAND_FINAL",
      1,
      16,
      6,
      1,
      "TOP_N_OVERALL",
      1,
      "PMPL-style grand final"
    ),
  ];
}

function buildPmgcStyle(teamCount: number): TournamentStageTemplate[] {
  const capped = clampTeamCount(teamCount);
  if (capped <= 16) {
    return [
      stage(
        "Finals",
        "GRAND_FINAL",
        1,
        16,
        8,
        1,
        "TOP_N_OVERALL",
        1,
        "PMGC-style final stage"
      ),
    ];
  }

  if (capped <= 32) {
    return [
      stage(
        "League Stage",
        "GROUP_STAGE",
        2,
        16,
        6,
        16,
        "TOP_N_PER_GROUP",
        8,
        "PMGC-style league stage"
      ),
      stage(
        "Grand Final",
        "GRAND_FINAL",
        1,
        16,
        8,
        1,
        "TOP_N_OVERALL",
        1,
        "PMGC-style grand final"
      ),
    ];
  }

  return [
    stage(
      "League Stage",
      "GROUP_STAGE",
      Math.min(4, groupsFor(capped, 16)),
      16,
      6,
      32,
      "TOP_N_PER_GROUP",
      8,
      "PMGC-style league stage"
    ),
    stage(
      "Survival Stage",
      "SEMI_FINAL",
      2,
      16,
      6,
      16,
      "TOP_N_PER_GROUP",
      8,
      "PMGC-style survival stage"
    ),
    stage(
      "Grand Final",
      "GRAND_FINAL",
      1,
      16,
      8,
      1,
      "TOP_N_OVERALL",
      1,
      "PMGC-style grand final"
    ),
  ];
}

export const TOURNAMENT_TEMPLATES: TournamentTemplateDefinition[] = [
  {
    key: "QUICK_16",
    label: "16 TEAM QUICK CUP",
    description: "Single-lobby quick cup for 16 teams",
    category: "standard",
    recommendedTeamCounts: [16],
    defaultScoringPreset: "PMGC",
    defaultMaps: DEFAULT_MAPS,
    defaultDays: 1,
    build: buildQuick16,
  },
  {
    key: "CUP_32",
    label: "32 TEAM CUP",
    description: "Qualifier into grand final",
    category: "standard",
    recommendedTeamCounts: [32],
    defaultScoringPreset: "PMGC",
    defaultMaps: DEFAULT_MAPS,
    defaultDays: 2,
    build: build32Cup,
  },
  {
    key: "CUP_64",
    label: "64 TEAM CUP",
    description: "Qualifier, semi final, and grand final",
    category: "standard",
    recommendedTeamCounts: [64],
    defaultScoringPreset: "PMGC",
    defaultMaps: DEFAULT_MAPS,
    defaultDays: 3,
    build: build64Cup,
  },
  {
    key: "CUP_128",
    label: "128 TEAM CUP",
    description: "Large multi-stage cup for open tournaments",
    category: "standard",
    recommendedTeamCounts: [128],
    defaultScoringPreset: "PMGC",
    defaultMaps: DEFAULT_MAPS,
    defaultDays: 4,
    build: build128Cup,
  },
  {
    key: "COMMUNITY_CUP",
    label: "COMMUNITY CUP",
    description: "Friendly, community-first default structure",
    category: "community",
    recommendedTeamCounts: [16, 32, 64],
    defaultScoringPreset: "COMMUNITY",
    defaultMaps: DEFAULT_MAPS,
    defaultDays: 2,
    build: buildCommunityCup,
  },
  {
    key: "PMPL_STYLE",
    label: "PMPL STYLE",
    description: "League stage into grand final",
    category: "pro",
    recommendedTeamCounts: [16, 32, 64],
    defaultScoringPreset: "PMPL",
    defaultMaps: DEFAULT_MAPS,
    defaultDays: 3,
    build: buildPmplStyle,
  },
  {
    key: "PMGC_STYLE",
    label: "PMGC STYLE",
    description: "League, survival, and grand final",
    category: "pro",
    recommendedTeamCounts: [32, 64],
    defaultScoringPreset: "PMGC",
    defaultMaps: DEFAULT_MAPS,
    defaultDays: 4,
    build: buildPmgcStyle,
  },
  {
    key: "KILL_HEAVY",
    label: "KILL HEAVY",
    description: "Aggressive format with kill-heavy scoring defaults",
    category: "community",
    recommendedTeamCounts: [16, 32, 64],
    defaultScoringPreset: "KILL_HEAVY",
    defaultMaps: DEFAULT_MAPS,
    defaultDays: 2,
    build: buildCommunityCup,
  },
  {
    key: "PLACEMENT_HEAVY",
    label: "PLACEMENT HEAVY",
    description: "Survival-focused format with placement-heavy scoring",
    category: "community",
    recommendedTeamCounts: [16, 32, 64],
    defaultScoringPreset: "PLACEMENT_HEAVY",
    defaultMaps: DEFAULT_MAPS,
    defaultDays: 2,
    build: buildCommunityCup,
  },
  {
    key: "CUSTOM",
    label: "CUSTOM",
    description: "Start from an empty template and configure manually",
    category: "custom",
    recommendedTeamCounts: [16, 32, 64, 128],
    defaultScoringPreset: "CUSTOM",
    defaultMaps: DEFAULT_MAPS,
    defaultDays: 1,
    build: () => [],
  },
];

export function getTournamentTemplate(
  key: TournamentTemplateKey
): TournamentTemplateDefinition {
  return (
    TOURNAMENT_TEMPLATES.find((t) => t.key === key) ||
    TOURNAMENT_TEMPLATES.find((t) => t.key === "COMMUNITY_CUP")!
  );
}

export function listTournamentTemplates(): TournamentTemplateDefinition[] {
  return TOURNAMENT_TEMPLATES;
}

export function buildTemplateStages(
  key: TournamentTemplateKey,
  teamCount: number
): TournamentStageTemplate[] {
  return getTournamentTemplate(key).build(clampTeamCount(teamCount));
}