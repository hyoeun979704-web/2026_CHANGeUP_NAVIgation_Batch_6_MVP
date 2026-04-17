import { createClient } from "@/lib/supabase/server";

export interface CustomerContext {
  pet_name: string;
  breed: string | null;
  pet_birthday: string | null;
  pet_weight_kg: number | null;
  neutered: boolean | null;
  allergies: string | null;
  medical_notes: string | null;
  special_notes: string | null;
  owner_name: string;
  recent_logs: Array<{
    service_date: string;
    services: string[];
    notes: string | null;
  }>;
}

export async function retrieveCustomerContext(
  customerId: string,
  storeId: string
): Promise<CustomerContext | null> {
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .eq("store_id", storeId)
    .single();

  if (error || !customer) return null;

  const { data: logs } = await supabase
    .from("service_logs")
    .select("service_date, services, notes")
    .eq("customer_id", customerId)
    .order("service_date", { ascending: false })
    .limit(3);

  return {
    pet_name: customer.pet_name,
    breed: customer.breed,
    pet_birthday: customer.pet_birthday,
    pet_weight_kg: customer.pet_weight_kg,
    neutered: customer.neutered,
    allergies: customer.allergies,
    medical_notes: customer.medical_notes,
    special_notes: customer.special_notes,
    owner_name: customer.owner_name,
    recent_logs: logs ?? [],
  };
}
