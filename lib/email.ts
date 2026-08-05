import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "TournaOps <noreply@tournaops.com>";

export async function sendWelcomeEmail(to: string, username: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to TournaOps! 🎮",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #EAB308;">Welcome to TournaOps, ${username}! 🏆</h1>
        <p>You are now ready to organize professional PUBG Mobile tournaments.</p>
        <a href="https://www.tournaops.com/dashboard" 
           style="background: #EAB308; color: black; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
          Go to Dashboard
        </a>
        <p style="color: #666; margin-top: 24px;">Good luck on the battlefield!</p>
        <p style="color: #666;">— The TournaOps Team</p>
      </div>
    `,
  });
}

export async function sendTournamentRegistrationEmail(
  to: string,
  teamName: string,
  tournamentName: string,
  tournamentSlug: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Registration confirmed: ${tournamentName} 🎮`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #EAB308;">Registration Confirmed! ✅</h1>
        <p><strong>${teamName}</strong> has been registered for <strong>${tournamentName}</strong>.</p>
        <a href="https://www.tournaops.com/tournaments/${tournamentSlug}" 
           style="background: #EAB308; color: black; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
          View Tournament
        </a>
        <p style="color: #666; margin-top: 24px;">See you in the battleground!</p>
        <p style="color: #666;">— The TournaOps Team</p>
      </div>
    `,
  });
}

export async function sendTournamentLiveEmail(
  to: string,
  tournamentName: string,
  tournamentSlug: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${tournamentName} is now LIVE! 🔴`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #EF4444;">Tournament is LIVE! 🔴</h1>
        <p><strong>${tournamentName}</strong> has started!</p>
        <a href="https://www.tournaops.com/tournaments/${tournamentSlug}/results" 
           style="background: #EF4444; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 16px;">
          Watch Live Results
        </a>
        <p style="color: #666; margin-top: 24px;">May the best team win!</p>
        <p style="color: #666;">— The TournaOps Team</p>
      </div>
    `,
  });
}