"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const editDistance = computeEditDistance(aiDraft, finalText);

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      store_id: store.id,
      customer_id: customerId,
      keywords,
      image_url: imageUrl || null,
      ai_draft: aiDraft,
      final_text: finalText,
      tokens_used: tokensUsed ?? null,
      latency_ms: latencyMs ?? null,
      draft_accepted_as_is: editDistance === 0,
      edit_distance: editDistance,
      estimated_seconds_saved: 240,
      is_sent: false,
    })
    .select()
    .single();

  if (error) return { error: "알림장 저장에 실패했습니다" };

  revalidatePath("/notifications");
  return { id: data.id };
}

export async function markNotificationSent(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const { error } = await supabase
    .from("notifications")
    .update({ is_sent: true, sent_at: new Date().toISOString() })
    .eq("id", id)
    .eq("store_id", store.id);

  if (error) return { error: "전송 표시에 실패했습니다" };

  revalidatePath("/notifications");
  return { success: true };
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
