"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { serviceLogSchema } from "@/lib/validations/service-log";
import { getCurrentStore } from "./stores";

export async function createServiceLog(customerId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  // Verify customer belongs to store
  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("id", customerId)
    .eq("store_id", store.id)
    .single();

  if (!customer) return { error: "고객을 찾을 수 없습니다" };

  const services = formData.getAll("services") as string[];
  const raw = {
    service_date: formData.get("service_date") as string,
    services,
    notes: formData.get("notes") as string,
  };

  const parsed = serviceLogSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요" };
  }

  const { error } = await supabase.from("service_logs").insert({
    customer_id: customerId,
    service_date: parsed.data.service_date,
    services: parsed.data.services,
    notes: parsed.data.notes || null,
  });

  if (error) return { error: "서비스 이력 저장에 실패했습니다" };

  // Update last_visit_at
  await supabase
    .from("customers")
    .update({ last_visit_at: new Date().toISOString() })
    .eq("id", customerId);

  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}

export async function deleteServiceLog(logId: string, customerId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("service_logs").delete().eq("id", logId);

  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}
