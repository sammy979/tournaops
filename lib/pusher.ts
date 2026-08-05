import Pusher from "pusher";
import PusherJs from "pusher-js";

// Server-side Pusher
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER || "ap2",
  useTLS: true,
});

// Client-side Pusher
export const pusherClient = new PusherJs(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2",
  }
);

export const CHANNELS = {
  tournament: (id: string) => `tournament-${id}`,
};

export const EVENTS = {
  MATCH_UPDATED: "match-updated",
  STANDINGS_UPDATED: "standings-updated",
  STATUS_CHANGED: "status-changed",
  TEAM_ADDED: "team-added",
};