import DodoPayments from "dodopayments";

export const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY!,
  environment: "live_mode",
});

export const DODO_CONFIG = {
  productId: process.env.NEXT_PUBLIC_DODO_PRODUCT_ID!,
  webhookSecret: process.env.DODO_WEBHOOK_SECRET!,
  returnUrl: `${process.env.NEXT_PUBLIC_URL || "https://www.tournaops.com"}/dashboard?upgraded=true`,
  cancelUrl: `${process.env.NEXT_PUBLIC_URL || "https://www.tournaops.com"}/dashboard/settings?cancelled=true`,
};

export const PRO_FEATURES = {
  maxTournaments: 999,
  maxTeams: 400,
  aiEnabled: true,
  overlaysEnabled: true,
  discordEnabled: true,
  prioritySupport: true,
};

export const FREE_FEATURES = {
  maxTournaments: 3,
  maxTeams: 32,
  aiEnabled: false,
  overlaysEnabled: true,
  discordEnabled: true,
  prioritySupport: false,
};