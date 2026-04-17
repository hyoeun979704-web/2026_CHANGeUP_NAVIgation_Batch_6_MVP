"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { Store } from "@/types/database";

export async function createStore(formData: FormData) {
  // Use anon client only for auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const store_type = (formData.get("store_type") as string) || "grooming";

  if (!name?.trim()) return { error: "매장 이름을 입력해 주세요" };

  // Service client bypasses RLS so .select() works before store_members is inserted
  const service = await createServiceClient();

  const { data: store, error } = await service
    .from("stores")
    .insert({
      name: name.trim(),
      phone: phone?.trim() || null,
      store_type: store_type as "grooming" | "daycare" | "kindergarten" | "mixed",
    })
    .select()
    .single();

  if (error || !store) return { error: "매장 생성에 실패했습니다" };

  // store_members RLS: insert allowed when user_id = auth.uid() — use anon client
  const { error: memberError } = await supabase.from("store_members").insert({
    store_id: store.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) return { error: "매장 멤버 등록에 실패했습니다" };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function getCurrentStore(): Promise<Store | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("store_members")
    .select("store_id, stores(*)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!data?.stores) return null;
  const stores = data.stores as Store | Store[];
  return Array.isArray(stores) ? (stores[0] ?? null) : stores;
}
