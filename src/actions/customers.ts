"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { customerSchema } from "@/lib/validations/customer";
import { getCurrentStore } from "./stores";

export async function createCustomer(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const raw = {
    owner_name: formData.get("owner_name") as string,
    owner_phone: formData.get("owner_phone") as string,
    pet_name: formData.get("pet_name") as string,
    breed: formData.get("breed") as string,
    pet_birthday: formData.get("pet_birthday") as string,
    pet_weight_kg: formData.get("pet_weight_kg") as string,
    neutered: formData.get("neutered") === "true",
    allergies: formData.get("allergies") as string,
    medical_notes: formData.get("medical_notes") as string,
    special_notes: formData.get("special_notes") as string,
  };

  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요" };
  }

  const d = parsed.data;
  await sql`
    INSERT INTO customers (
      store_id, owner_name, owner_phone, pet_name, breed,
      pet_birthday, pet_weight_kg, neutered, allergies, medical_notes, special_notes
    ) VALUES (
      ${store.id}, ${d.owner_name}, ${d.owner_phone}, ${d.pet_name},
      ${d.breed || null}, ${d.pet_birthday || null},
      ${d.pet_weight_kg ? Number(d.pet_weight_kg) : null},
      ${d.neutered ?? null}, ${d.allergies || null},
      ${d.medical_notes || null}, ${d.special_notes || null}
    )
  `;

  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const raw = {
    owner_name: formData.get("owner_name") as string,
    owner_phone: formData.get("owner_phone") as string,
    pet_name: formData.get("pet_name") as string,
    breed: formData.get("breed") as string,
    pet_birthday: formData.get("pet_birthday") as string,
    pet_weight_kg: formData.get("pet_weight_kg") as string,
    neutered: formData.get("neutered") === "true",
    allergies: formData.get("allergies") as string,
    medical_notes: formData.get("medical_notes") as string,
    special_notes: formData.get("special_notes") as string,
  };

  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요" };
  }

  const d = parsed.data;
  await sql`
    UPDATE customers SET
      owner_name = ${d.owner_name}, owner_phone = ${d.owner_phone},
      pet_name = ${d.pet_name}, breed = ${d.breed || null},
      pet_birthday = ${d.pet_birthday || null},
      pet_weight_kg = ${d.pet_weight_kg ? Number(d.pet_weight_kg) : null},
      neutered = ${d.neutered ?? null}, allergies = ${d.allergies || null},
      medical_notes = ${d.medical_notes || null}, special_notes = ${d.special_notes || null}
    WHERE id = ${id} AND store_id = ${store.id}
  `;

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}

export async function deleteCustomer(id: string) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  await sql`DELETE FROM customers WHERE id = ${id} AND store_id = ${store.id}`;

  revalidatePath("/customers");
  return { success: true, error: null };
}
