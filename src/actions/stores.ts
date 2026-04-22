"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import type { Store } from "@/types/database";

export async function createStore(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const store_type = (formData.get("store_type") as string) || "grooming";

  if (!name?.trim()) return { error: "매장 이름을 입력해 주세요" };

  const rows = await sql`
    INSERT INTO stores (name, phone, store_type)
    VALUES (${name.trim()}, ${phone?.trim() || null}, ${store_type})
    RETURNING *
  `;
  const store = rows[0] as Store | undefined;
  if (!store) return { error: "매장 생성에 실패했습니다" };

  await sql`
    INSERT INTO store_members (store_id, user_id, role)
    VALUES (${store.id}, ${userId}, 'owner')
  `;

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function getCurrentStore(): Promise<Store | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const rows = await sql`
    SELECT s.* FROM stores s
    JOIN store_members sm ON sm.store_id = s.id
    WHERE sm.user_id = ${userId}
    LIMIT 1
  `;
  return (rows[0] as Store) ?? null;
}

export async function updateStore(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  if (!name?.trim()) return { error: "매장 이름을 입력해 주세요" };

  await sql`
    UPDATE stores SET name = ${name.trim()}, phone = ${phone?.trim() || null}
    WHERE id = ${store.id}
  `;

  revalidatePath("/settings/store");
  revalidatePath("/settings");
  return { success: true };
}
