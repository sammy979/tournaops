// lib/notifications/service.ts
// Centralized notification dispatcher for Discord, Email, and In-app

export type NotificationType = "REGISTRATION" | "MATCH_START" | "RESULTS_PUBLISHED" | "ANNOUNCEMENT";

interface NotificationPayload {
  title: string;
  message: string;
  tournamentId?: string;
  teamId?: string;
  link?: string;
}

export async function sendNotification(type: NotificationType, payload: NotificationPayload) {
  console.log(`[Notification] Sending ${type}: ${payload.title}`);
  
  // 1. Discord Webhook (if configured)
  try {
    if (payload.tournamentId) {
      await fetch(`/api/discord/send`, {
        method: "POST",
        body: JSON.stringify({ type, ...payload }),
      }).catch(() => {});
    }
  } catch (e) {}

  // 2. In-App Notification (Database push)
  // TODO: Implement model in schema.prisma first
}