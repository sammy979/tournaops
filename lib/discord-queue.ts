// lib/discord-queue.ts
// ============================================================
// Fire-and-forget Discord sender for TournaOps
// All tournament operations MUST succeed even if Discord fails.
// This module ensures Discord is never on the critical path.
// ============================================================

export interface DiscordPayload {
  content?: string;
  embeds?: any[];
}

export interface DiscordSendResult {
  success: boolean;
  status?: number;
  error?: string;
}

// ============================================================
// CORE SEND — single webhook call, never throws
// ============================================================

export async function sendToDiscord(
  webhookUrl: string,
  payload: DiscordPayload
): Promise<DiscordSendResult> {
  if (!webhookUrl || !isValidWebhookUrl(webhookUrl)) {
    return { success: false, error: "Invalid webhook URL" };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok || res.status === 204) {
      return { success: true, status: res.status };
    }

    const body = await res.text().catch(() => "");
    console.warn(
      `[DISCORD] Send failed — HTTP ${res.status}:`,
      body.slice(0, 200)
    );
    return { success: false, status: res.status, error: `HTTP ${res.status}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.warn("[DISCORD] Send exception:", msg);
    return { success: false, error: msg };
  }
}

// ============================================================
// FIRE AND FORGET — schedules send without blocking caller
// Results are logged but never thrown to the caller
// ============================================================

export function fireAndForget(
  webhookUrl: string,
  payload: DiscordPayload,
  context?: string
): void {
  if (!webhookUrl || !isValidWebhookUrl(webhookUrl)) return;

  Promise.resolve()
    .then(() => sendToDiscord(webhookUrl, payload))
    .then((result) => {
      if (!result.success) {
        console.warn(
          `[DISCORD${context ? ` ${context}` : ""}] Failed:`,
          result.error || result.status
        );
      }
    })
    .catch((err) => {
      console.warn(
        `[DISCORD${context ? ` ${context}` : ""}] Unhandled:`,
        err instanceof Error ? err.message : err
      );
    });
}

// ============================================================
// VALIDATE WEBHOOK URL — only allow real Discord webhook URLs
// ============================================================

export function isValidWebhookUrl(url: string): boolean {
  if (typeof url !== "string") return false;
  return (
    url.startsWith("https://discord.com/api/webhooks/") ||
    url.startsWith("https://discordapp.com/api/webhooks/")
  );
}

// ============================================================
// SEND MULTIPLE EMBEDS — splits into batches of 10 (Discord limit)
// ============================================================

export async function sendEmbedBatches(
  webhookUrl: string,
  embeds: any[],
  content?: string
): Promise<DiscordSendResult[]> {
  if (!isValidWebhookUrl(webhookUrl)) {
    return [{ success: false, error: "Invalid webhook URL" }];
  }

  const results: DiscordSendResult[] = [];
  const BATCH_SIZE = 10;

  for (let i = 0; i < embeds.length; i += BATCH_SIZE) {
    const batch = embeds.slice(i, i + BATCH_SIZE);
    const payload: DiscordPayload = { embeds: batch };
    if (i === 0 && content) payload.content = content;

    const result = await sendToDiscord(webhookUrl, payload);
    results.push(result);

    // Brief pause between batches to avoid rate limiting
    if (i + BATCH_SIZE < embeds.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return results;
}

// ============================================================
// RESULT SUMMARY — for logging multiple sends
// ============================================================

export function summarizeResults(results: DiscordSendResult[]): string {
  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  if (failed === 0) return `All ${succeeded} Discord message(s) sent`;
  return `${succeeded} sent, ${failed} failed`;
}