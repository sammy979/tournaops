// ============================================================
// lib/discord-broadcaster.ts
// Centralized Discord auto-post helpers
// ============================================================

interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  thumbnail?: { url: string };
  image?: { url: string };
  author?: { name: string; url?: string; icon_url?: string };
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
}

function colorFromBranding(branding: any): number {
  const hex = (branding?.primaryColor || "#f59e0b").replace("#", "");
  return parseInt(hex, 16) || 0xf59e0b;
}

function tournamentUrls(tournament: any) {
  const base = "https://www.tournaops.com/tournaments/" + tournament.slug;
  return {
    public: base,
    register: base + "/register",
    results: base + "/results",
    report: base + "/report",
  };
}

function baseEmbed(tournament: any): Partial<DiscordEmbed> {
  const branding = tournament.brandingData || {};
  const urls = tournamentUrls(tournament);
  return {
    author: {
      name: tournament.name,
      url: urls.public,
      icon_url: branding.orgLogo || undefined,
    },
    color: colorFromBranding(branding),
    footer: {
      text: "TournaOps \u2022 Live tournament management",
      icon_url: "https://www.tournaops.com/logo.png",
    },
    timestamp: new Date().toISOString(),
  };
}

async function sendToWebhook(webhookUrl: string, payload: any): Promise<boolean> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok || res.status === 204;
  } catch (e) {
    console.warn("[DISCORD_BROADCAST] Failed:", e);
    return false;
  }
}

// ============================================================
// SLOT LIST — When teams get registered
// ============================================================

export async function broadcastSlotList(webhookUrl: string, tournament: any) {
  const teams = tournament.teams || [];
  if (teams.length === 0) return false;
  const urls = tournamentUrls(tournament);
  const branding = tournament.brandingData || {};

  const sortedTeams = [...teams].sort((a: any, b: any) => (a.seed || 999) - (b.seed || 999));
  const slotLines = sortedTeams.map((t: any, i: number) => {
    const slot = t.seed || i + 1;
    const tag = t.tag ? "[" + t.tag + "] " : "";
    return "`Slot " + String(slot).padStart(2, "0") + "` \u2014 **" + tag + t.name + "**";
  });

  // Split into chunks of 20 slots per field (Discord field limit)
  const chunks: string[][] = [];
  for (let i = 0; i < slotLines.length; i += 20) {
    chunks.push(slotLines.slice(i, i + 20));
  }

  const embed: DiscordEmbed = {
    ...baseEmbed(tournament),
    title: "\uD83D\uDCCB SLOT LIST \u2014 " + teams.length + " Team" + (teams.length !== 1 ? "s" : "") + " Registered",
    description: "**Tournament:** " + tournament.name +
      (tournament.prizePool ? "\n\uD83D\uDCB0 **Prize Pool:** " + tournament.prizePool : "") +
      "\n\uD83C\uDFC6 **Format:** " + (tournament.format || "Squad").toUpperCase() +
      "\n\uD83D\uDCCA **Max Teams:** " + tournament.maxTeams,
    url: urls.public,
    fields: chunks.map((chunk, i) => ({
      name: chunks.length > 1 ? "Slots " + (i * 20 + 1) + "\u2013" + Math.min((i + 1) * 20, slotLines.length) : "Teams",
      value: chunk.join("\n"),
      inline: false,
    })),
  };

  embed.fields!.push({
    name: "\uD83D\uDD17 LINKS",
    value: "\uD83C\uDFC6 [Tournament Page](" + urls.public + ")" +
      (tournament.status === "registration" ? " \u2022 \uD83D\uDCDD [Register Team](" + urls.register + ")" : ""),
    inline: false,
  });

  if (tournament.bannerImage) embed.thumbnail = { url: tournament.bannerImage };

  return sendToWebhook(webhookUrl, { embeds: [embed] });
}

// ============================================================
// GROUP STAGE — When teams are grouped
// ============================================================

export async function broadcastGroupStage(webhookUrl: string, tournament: any, stage: any, groups: any[]) {
  if (!groups || groups.length === 0) return false;
  const teams = tournament.teams || [];
  const teamMap = new Map(teams.map((t: any) => [t.id, t]));
  const urls = tournamentUrls(tournament);

  const embed: DiscordEmbed = {
    ...baseEmbed(tournament),
    title: "\uD83C\uDFAF " + (stage.name || "GROUP STAGE").toUpperCase() + " \u2014 Groups Announced",
    description: "**" + tournament.name + "** \u2014 " + groups.length + " Group" + (groups.length !== 1 ? "s" : "") +
      " \u2022 " + (stage.matchesPerGroup || "?") + " matches per group",
    url: urls.public,
    fields: groups.map((g: any) => {
      const teamNames = (g.teamIds || []).map((id: string, i: number) => {
        const t = teamMap.get(id) as any;
        if (!t) return null;
        const tag = t.tag ? "[" + t.tag + "] " : "";
        return "`" + String(i + 1).padStart(2, " ") + "` " + tag + t.name;
      }).filter(Boolean).join("\n");
      return {
        name: "\uD83D\uDD37 " + (g.name || "Group"),
        value: teamNames || "_No teams assigned_",
        inline: true,
      };
    }),
  };

  return sendToWebhook(webhookUrl, { embeds: [embed] });
}

// ============================================================
// TOURNAMENT MILESTONE — Started / Registration Open / Completed
// ============================================================

export async function broadcastMilestone(
  webhookUrl: string,
  tournament: any,
  type: "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | "TOURNAMENT_STARTED" | "TOURNAMENT_COMPLETED"
) {
  const urls = tournamentUrls(tournament);
  const teams = tournament.teams || [];
  const branding = tournament.brandingData || {};

  const configs = {
    REGISTRATION_OPEN: {
      emoji: "\uD83D\uDCE2",
      title: "REGISTRATION OPEN",
      color: 0x3b82f6,
      description: "**" + tournament.name + "** is now accepting team registrations!",
      ping: "@everyone",
    },
    REGISTRATION_CLOSED: {
      emoji: "\uD83D\uDD12",
      title: "REGISTRATION CLOSED",
      color: 0x9333ea,
      description: "Registration for **" + tournament.name + "** is now closed. Final team list below.",
      ping: undefined,
    },
    TOURNAMENT_STARTED: {
      emoji: "\uD83D\uDD34",
      title: "TOURNAMENT IS LIVE",
      color: 0xef4444,
      description: "**" + tournament.name + "** has officially begun! Follow live standings below.",
      ping: "@everyone",
    },
    TOURNAMENT_COMPLETED: {
      emoji: "\uD83C\uDFC6",
      title: "TOURNAMENT COMPLETE",
      color: 0xc084fc,
      description: "**" + tournament.name + "** has concluded! Check the final report for full results.",
      ping: undefined,
    },
  };
  const cfg = configs[type];

  const embed: DiscordEmbed = {
    ...baseEmbed(tournament),
    title: cfg.emoji + " " + cfg.title,
    description: cfg.description,
    color: cfg.color,
    url: urls.public,
    fields: [
      {
        name: "\uD83D\uDCCA Details",
        value:
          "\uD83D\uDC65 **Teams:** " + teams.length + "/" + tournament.maxTeams +
          (tournament.prizePool ? "\n\uD83D\uDCB0 **Prize:** " + tournament.prizePool : "") +
          (tournament.format ? "\n\uD83C\uDFAE **Format:** " + tournament.format.toUpperCase() : ""),
        inline: false,
      },
      {
        name: "\uD83D\uDD17 Links",
        value: "\uD83C\uDFC6 [Tournament Page](" + urls.public + ")" +
          (type === "REGISTRATION_OPEN" ? " \u2022 \uD83D\uDCDD [Register](" + urls.register + ")" : "") +
          (type === "TOURNAMENT_STARTED" || type === "TOURNAMENT_COMPLETED" ? " \u2022 \uD83D\uDCCA [Live Standings](" + urls.results + ")" : "") +
          (type === "TOURNAMENT_COMPLETED" ? " \u2022 \uD83D\uDCCB [Full Report](" + urls.report + ")" : ""),
        inline: false,
      },
    ],
  };

  if (tournament.bannerImage) embed.thumbnail = { url: tournament.bannerImage };

  const payload: any = { embeds: [embed] };
  if (cfg.ping) payload.content = cfg.ping;

  return sendToWebhook(webhookUrl, payload);
}

// ============================================================
// STANDINGS IMAGE — Uses /preview/[id] page rendered as PNG
// Note: uses Vercel OG or external screenshot service
// ============================================================

export async function broadcastStandingsImage(webhookUrl: string, tournament: any, stageId?: string) {
  const urls = tournamentUrls(tournament);
  const timestamp = Date.now();
  const stageParam = stageId ? "&stage=" + stageId : "";
  const imageUrl = "https://www.tournaops.com/api/tournaments/" + tournament.id + "/standings-image?t=" + timestamp + stageParam;

  // Detect stage label
  let stageName = "Live Standings";
  if (stageId && tournament.stages) {
    const s = tournament.stages.find((x: any) => x.id === stageId);
    if (s) stageName = s.name + " Standings";
  }

  const embed: DiscordEmbed = {
    ...baseEmbed(tournament),
    title: "\uD83D\uDCCA " + stageName.toUpperCase(),
    description: "**" + tournament.name + "**\n\uD83D\uDD17 [View Full Standings](" + urls.results + ")",
    url: urls.results,
    image: { url: imageUrl },
  };

  return sendToWebhook(webhookUrl, { embeds: [embed] });
}