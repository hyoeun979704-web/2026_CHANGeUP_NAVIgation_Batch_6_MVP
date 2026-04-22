"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { reservationServerSchema as reservationSchema } from "@/lib/validations/reservation";
import { getCurrentStore } from "./stores";
import type { ReservationWithCustomer } from "@/types/database";
import { startOfWeek, endOfWeek, addWeeks } from "date-fns";

export async function createReservation(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const raw = {
    customer_id: formData.get("customer_id") as string || null,
    scheduled_at: formData.get("scheduled_at") as string,
    duration_min: formData.get("duration_min") as string,
    services: formData.getAll("services") as string[],
    status: (formData.get("status") as string) || "pending",
    deposit_amount: formData.get("deposit_amount") as string || null,
    notes: formData.get("notes") as string,
  };

  const parsed = reservationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요" };
  }

  const d = parsed.data;
  try {
    const rows = await sql`
      INSERT INTO reservations (
        store_id, customer_id, scheduled_at, duration_min,
        services, status, deposit_amount, notes
      ) VALUES (
        ${store.id}, ${d.customer_id ?? null},
        ${d.scheduled_at}, ${d.duration_min},
        ${JSON.stringify(d.services)}, ${d.status},
        ${d.deposit_amount ?? null}, ${d.notes ?? null}
      )
      RETURNING id
    `;

    if (d.customer_id && d.status === "completed") {
      await sql`
        UPDATE customers SET last_visit_at = NOW()
        WHERE id = ${d.customer_id} AND store_id = ${store.id}
      `;
    }

    revalidatePath("/reservations");
    redirect(`/reservations/${(rows[0] as { id: string }).id}`);
  } catch (err: unknown) {
    const pgErr = err as { code?: string };
    if (pgErr?.code === "23505") {
      return { error: "이미 해당 시간에 예약이 있습니다" };
    }
    throw err;
  }
}

export async function updateReservationStatus(id: string, status: string) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  await sql`
    UPDATE reservations SET status = ${status}
    WHERE id = ${id} AND store_id = ${store.id}
  `;

  if (status === "completed") {
    const rows = await sql`
      SELECT customer_id FROM reservations
      WHERE id = ${id} AND store_id = ${store.id}
    `;
    const customerId = (rows[0] as { customer_id: string | null })?.customer_id;
    if (customerId) {
      await sql`
        UPDATE customers SET last_visit_at = NOW()
        WHERE id = ${customerId} AND store_id = ${store.id}
      `;
    }
  }

  revalidatePath("/reservations");
  revalidatePath(`/reservations/${id}`);
  return { success: true };
}

export async function deleteReservation(id: string) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  await sql`
    DELETE FROM reservations WHERE id = ${id} AND store_id = ${store.id}
  `;

  revalidatePath("/reservations");
  return { success: true };
}

export async function getReservationsForWeek(weekOffset = 0): Promise<ReservationWithCustomer[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const store = await getCurrentStore();
  if (!store) return [];

  const now = new Date();
  const base = addWeeks(now, weekOffset);
  const weekStart = startOfWeek(base, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(base, { weekStartsOn: 1 });

  const rows = await sql`
    SELECT r.*,
      json_build_object(
        'pet_name', c.pet_name,
        'owner_name', c.owner_name,
        'owner_phone', c.owner_phone
      ) as customers
    FROM reservations r
    LEFT JOIN customers c ON c.id = r.customer_id
    WHERE r.store_id = ${store.id}
      AND r.scheduled_at >= ${weekStart.toISOString()}
      AND r.scheduled_at <= ${weekEnd.toISOString()}
    ORDER BY r.scheduled_at ASC
  `;

  return rows as ReservationWithCustomer[];
}
