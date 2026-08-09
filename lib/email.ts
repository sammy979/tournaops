import { Resend } from "resend";

// ============================================================
// lib/email.ts
// TournaOps Email System powered by Resend
// REQUIRES: RESEND_API_KEY environment variable
// ============================================================

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}
const FROM = process.env.EMAIL_FROM || "TournaOps <noreply@tournaops.com>";
const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://www.tournaops.com";

// ============================================================
// SHARED STYLES
// ============================================================

function emailWrapper(content: string, primaryColor = "#f59e0b"): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TournaOps</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111116;border-radius:16px;border:1px solid #1f2937;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0a0a0f,#111116);padding:32px;border-bottom:1px solid #1f2937;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:${primaryColor};letter-spacing:-0.02em;">TournaOps</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;letter-spacing:0.1em;text-transform:uppercase;">Tournament Operations Platform</div>
        </td></tr>

        <!-- Content -->
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 32px;border-top:1px solid #1f2937;text-align:center;">
          <p style="margin:0;font-size:12px;color:#4b5563;">
            Powered by <a href="${BASE_URL}" style="color:${primaryColor};text-decoration:none;font-weight:600;">TournaOps</a>
            &nbsp;&middot;&nbsp; The professional tournament management platform
          </p>
          <p style="margin:8px 0 0;font-size:11px;color:#374151;">
            You received this because you have an account on TournaOps.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(text: string, href: string, color = "#f59e0b"): string {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#000;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-top:20px;">${text}</a>`;
}

function heading(text: string, color = "#fff"): string {
  return `<h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:${color};">${text}</h1>`;
}

function para(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#9ca3af;line-height:1.6;">${text}</p>`;
}

function badge(text: string, color = "#f59e0b"): string {
  return `<span style="display:inline-block;background:${color}20;color:${color};border:1px solid ${color}40;padding:4px 12px;border-radius:9999px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${text}</span>`;
}

function infoBox(rows: Array<{ label: string; value: string }>): string {
  const rowsHtml = rows.map(r => `
    <tr>
      <td style="padding:10px 16px;font-size:13px;color:#6b7280;font-weight:600;border-right:1px solid #1f2937;width:40%;">${r.label}</td>
      <td style="padding:10px 16px;font-size:13px;color:#e5e7eb;font-weight:500;">${r.value}</td>
    </tr>`).join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;border:1px solid #1f2937;border-radius:8px;margin:20px 0;overflow:hidden;"><tbody>${rowsHtml}</tbody></table>`;
}

// ============================================================
// SAFE SEND — never throws, logs failures
// ============================================================

async function safeSend(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn("[EMAIL] RESEND_API_KEY not set — skipping email to", params.to);
    return false;
  }
  try {
    const result = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    if (result.error) {
      console.error("[EMAIL] Send failed:", result.error);
      return false;
    }
    console.info("[EMAIL] Sent:", params.subject, "to", params.to);
    return true;
  } catch (err) {
    console.error("[EMAIL] Exception:", err);
    return false;
  }
}

// ============================================================
// WELCOME EMAIL
// ============================================================

export async function sendWelcomeEmail(to: string, username: string): Promise<boolean> {
  const html = emailWrapper(`
    ${heading("Welcome to TournaOps! \uD83C\uDFC6")}
    ${para(`Hey <strong style="color:#fff;">${username}</strong>, your account is ready. You can now create and manage professional PUBG Mobile tournaments.`)}
    ${infoBox([
      { label: "Platform", value: "TournaOps" },
      { label: "Account", value: username },
      { label: "Features", value: "Tournaments, Teams, OBS, Discord, AI" },
    ])}
    ${para("Start by creating your first tournament. It takes less than 2 minutes.")}
    ${btn("Go to Dashboard", `${BASE_URL}/dashboard`)}
  `);

  return safeSend({ to, subject: "Welcome to TournaOps! \uD83C\uDFC6", html });
}

// ============================================================
// TOURNAMENT REGISTRATION CONFIRMATION
// ============================================================

export async function sendTournamentRegistrationEmail(
  to: string,
  teamName: string,
  tournamentName: string,
  tournamentSlug: string
): Promise<boolean> {
  const html = emailWrapper(`
    ${badge("Registration Confirmed", "#4ade80")}
    <div style="margin-top:16px;"></div>
    ${heading("\u2705 You're registered!")}
    ${para(`<strong style="color:#fff;">${teamName}</strong> has been registered for <strong style="color:#fff;">${tournamentName}</strong>.`)}
    ${infoBox([
      { label: "Team", value: teamName },
      { label: "Tournament", value: tournamentName },
      { label: "Status", value: "Registered" },
    ])}
    ${para("Check the tournament page for match schedules, rules, and updates.")}
    ${btn("View Tournament", `${BASE_URL}/tournaments/${tournamentSlug}`)}
  `);

  return safeSend({ to, subject: `Registration confirmed: ${tournamentName}`, html });
}

// ============================================================
// TOURNAMENT LIVE
// ============================================================

export async function sendTournamentLiveEmail(
  to: string,
  tournamentName: string,
  tournamentSlug: string
): Promise<boolean> {
  const html = emailWrapper(`
    ${badge("Tournament Live", "#ef4444")}
    <div style="margin-top:16px;"></div>
    ${heading("\uD83D\uDD34 Tournament is LIVE!", "#ef4444")}
    ${para(`<strong style="color:#fff;">${tournamentName}</strong> has officially started! Follow the live standings and results.`)}
    ${btn("Watch Live Results", `${BASE_URL}/tournaments/${tournamentSlug}/results`, "#ef4444")}
  `, "#ef4444");

  return safeSend({ to, subject: `${tournamentName} is now LIVE! \uD83D\uDD34`, html });
}

// ============================================================
// MATCH RESULT PUBLISHED
// ============================================================

export async function sendMatchResultEmail(
  to: string,
  tournamentName: string,
  tournamentSlug: string,
  matchName: string,
  teamResult: {
    placement: number;
    kills: number;
    points: number;
  }
): Promise<boolean> {
  const medalEmoji = teamResult.placement === 1 ? "\uD83E\uDD47" : teamResult.placement === 2 ? "\uD83E\uDD48" : teamResult.placement === 3 ? "\uD83E\uDD49" : `#${teamResult.placement}`;

  const html = emailWrapper(`
    ${badge("Match Results", "#f59e0b")}
    <div style="margin-top:16px;"></div>
    ${heading(`${medalEmoji} ${matchName} Results`)}
    ${infoBox([
      { label: "Placement", value: `#${teamResult.placement}` },
      { label: "Kills", value: `${teamResult.kills}` },
      { label: "Points Earned", value: `${teamResult.points} pts` },
    ])}
    ${btn("View Full Standings", `${BASE_URL}/tournaments/${tournamentSlug}/results`)}
  `);

  return safeSend({ to, subject: `Match results: ${matchName} - ${tournamentName}`, html });
}

// ============================================================
// STAGE ADVANCEMENT
// ============================================================

export async function sendStageAdvancementEmail(
  to: string,
  teamName: string,
  tournamentName: string,
  tournamentSlug: string,
  fromStage: string,
  toStage: string
): Promise<boolean> {
  const html = emailWrapper(`
    ${badge("Stage Advanced", "#a855f7")}
    <div style="margin-top:16px;"></div>
    ${heading("\uD83C\uDF89 Congratulations! You advanced!")}
    ${para(`<strong style="color:#fff;">${teamName}</strong> has qualified from <strong style="color:#fff;">${fromStage}</strong> to the <strong style="color:#fff;">${toStage}</strong>!`)}
    ${infoBox([
      { label: "Team", value: teamName },
      { label: "From", value: fromStage },
      { label: "Advanced To", value: toStage },
      { label: "Tournament", value: tournamentName },
    ])}
    ${btn("View Tournament", `${BASE_URL}/tournaments/${tournamentSlug}`, "#a855f7")}
  `, "#a855f7");

  return safeSend({ to, subject: `${teamName} advanced to ${toStage}! - ${tournamentName}`, html });
}

// ============================================================
// TOURNAMENT COMPLETED
// ============================================================

export async function sendTournamentCompletedEmail(
  to: string,
  tournamentName: string,
  tournamentSlug: string,
  champion?: string
): Promise<boolean> {
  const html = emailWrapper(`
    ${badge("Tournament Complete", "#c084fc")}
    <div style="margin-top:16px;"></div>
    ${heading("\uD83C\uDFC6 Tournament Complete!")}
    ${para(`<strong style="color:#fff;">${tournamentName}</strong> has concluded.`)}
    ${champion ? infoBox([{ label: "Champion", value: champion }]) : ""}
    ${para("View the final standings and full tournament report.")}
    ${btn("View Final Results", `${BASE_URL}/tournaments/${tournamentSlug}/report`, "#c084fc")}
  `, "#c084fc");

  return safeSend({ to, subject: `${tournamentName} - Tournament Complete!`, html });
}

// ============================================================
// PASSWORD RESET (future use)
// ============================================================

export async function sendPasswordResetEmail(
  to: string,
  resetLink: string
): Promise<boolean> {
  const html = emailWrapper(`
    ${heading("Reset Your Password")}
    ${para("You requested a password reset for your TournaOps account. Click below to set a new password.")}
    ${para("This link expires in 1 hour. If you did not request this, ignore this email.")}
    ${btn("Reset Password", resetLink, "#ef4444")}
  `);

  return safeSend({ to, subject: "Reset your TournaOps password", html });
}