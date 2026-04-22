"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { getCurrentStore } from "./stores";

export async function saveNotification({
  customerId,
  keywords,
  imageUrl,
  aiDraft,
  finalText,
  tokensUsed,
  latencyMs,
}: {
  customerId: string;
  keywords: string;
  imageUrl?: string;
  aiDraft: string;
  finalText: string;
  tokensUsed?: number;
  latencyMs?: number;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const editDistance = computeEditDistance(aiDraft, finalText);

  const rows = await sql`
    INSERT INTO notifications (
      store_id, customer_id, keywords, image_url, ai_draft, final_text,
      tokens_used, latency_ms, draft_accepted_as_is, edit_distance,
      estimated_seconds_saved, is_sent
    ) VALUES (
      ${store.id}, ${customerId}, ${keywords}, ${imageUrl || null},
      ${aiDraft}, ${finalText}, ${tokensUsed ?? null}, ${latencyMs ?? null},
      ${editDistance === 0}, ${editDistance}, 240, false
    )
    RETURNING id
  `;

  if (!rows[0]) return { error: "알림장 저장에 실패했습니다" };

  revalidatePath("/notifications");
  return { id: (rows[0] as { id: string }).id };
}

export async function markNotificationSent(id: string) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  await sql`
    UPDATE notifications SET is_sent = true, sent_at = NOW()
    WHERE id = ${id} AND store_id = ${store.id}
  `;

  revalidatePath("/notifications");
  return { success: true, error: null };
}

function computeEditDistance(a: string, b: string): number {
  if (a === b) return 0;
  const la = a.length, lb = b.length;
  const dp: number[][] = Array.from({ length: la + 1 }, (_, i) => [i, ...Array(lb).fill(0)]);
  for (let j = 0; j <= lb; j++) dp[0][j] = j;
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[la][lb];
}
