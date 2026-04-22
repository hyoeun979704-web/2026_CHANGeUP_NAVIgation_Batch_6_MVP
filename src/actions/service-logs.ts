"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { serviceLogSchema } from "@/lib/validations/service-log";
import { getCurrentStore } from "./stores";

export async function createServiceLog(customerId: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  // Verify customer belongs to store
  const rows = await sql`
    SELECT id FROM customers WHERE id = ${customerId} AND store_id = ${store.id}
  `;
  if (!rows[0]) return { error: "고객을 찾을 수 없습니다" };

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

  await sql`
    INSERT INTO service_logs (customer_id, service_date, services, notes)
    VALUES (
      ${customerId},
      ${parsed.data.service_date},
      ${JSON.stringify(parsed.data.services)},
      ${parsed.data.notes || null}
    )
  `;

  await sql`
    UPDATE customers SET last_visit_at = NOW() WHERE id = ${customerId}
  `;

  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}

export async function deleteServiceLog(logId: string, customerId: string) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  await sql`DELETE FROM service_logs WHERE id = ${logId}`;

  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}
