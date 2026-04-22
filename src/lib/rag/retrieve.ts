import { sql } from "@/lib/db";

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
  const customers = await sql`
    SELECT * FROM customers WHERE id = ${customerId} AND store_id = ${storeId}
  `;
  const customer = customers[0] as Record<string, unknown> | undefined;
  if (!customer) return null;

  const logs = await sql`
    SELECT service_date, services, notes FROM service_logs
    WHERE customer_id = ${customerId}
    ORDER BY service_date DESC
    LIMIT 3
  `;

  return {
    pet_name: customer.pet_name as string,
    breed: customer.breed as string | null,
    pet_birthday: customer.pet_birthday as string | null,
    pet_weight_kg: customer.pet_weight_kg as number | null,
    neutered: customer.neutered as boolean | null,
    allergies: customer.allergies as string | null,
    medical_notes: customer.medical_notes as string | null,
    special_notes: customer.special_notes as string | null,
    owner_name: customer.owner_name as string,
    recent_logs: (logs as Array<{ service_date: string; services: unknown; notes: string | null }>).map((l) => ({
      service_date: l.service_date,
      services: Array.isArray(l.services) ? l.services as string[] : JSON.parse(String(l.services)) as string[],
      notes: l.notes,
    })),
  };
}
