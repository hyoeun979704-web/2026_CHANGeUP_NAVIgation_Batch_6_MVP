"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { customerSchema } from "@/lib/validations/customer";
import { getCurrentStore } from "./stores";

export async function createCustomer(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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

  const { error } = await supabase.from("customers").insert({
    store_id: store.id,
    owner_name: parsed.data.owner_name,
    owner_phone: parsed.data.owner_phone,
    pet_name: parsed.data.pet_name,
    breed: parsed.data.breed || null,
    pet_birthday: parsed.data.pet_birthday || null,
    pet_weight_kg: parsed.data.pet_weight_kg ? Number(parsed.data.pet_weight_kg) : null,
    neutered: parsed.data.neutered ?? null,
    allergies: parsed.data.allergies || null,
    medical_notes: parsed.data.medical_notes || null,
    special_notes: parsed.data.special_notes || null,
  });

  if (error) return { error: "고객 등록에 실패했습니다" };

  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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

  const { error } = await supabase
    .from("customers")
    .update({
      owner_name: parsed.data.owner_name,
      owner_phone: parsed.data.owner_phone,
      pet_name: parsed.data.pet_name,
      breed: parsed.data.breed || null,
      pet_birthday: parsed.data.pet_birthday || null,
      pet_weight_kg: parsed.data.pet_weight_kg ? Number(parsed.data.pet_weight_kg) : null,
      neutered: parsed.data.neutered ?? null,
      allergies: parsed.data.allergies || null,
      medical_notes: parsed.data.medical_notes || null,
      special_notes: parsed.data.special_notes || null,
    })
    .eq("id", id)
    .eq("store_id", store.id);

  if (error) return { error: "고객 수정에 실패했습니다" };

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .eq("store_id", store.id);

  if (error) return { error: "고객 삭제에 실패했습니다" };

  revalidatePath("/customers");
  redirect("/customers");
}
