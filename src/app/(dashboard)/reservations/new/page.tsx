import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentStore } from "@/actions/stores";
import { sql } from "@/lib/db";
import { ReservationForm } from "@/components/reservations/ReservationForm";
import type { Customer } from "@/types/database";
import { redirect } from "next/navigation";

export default async function NewReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const { customerId } = await searchParams;

  const rows = await sql`
    SELECT id, pet_name, owner_name, owner_phone FROM customers
    WHERE store_id = ${store.id} ORDER BY pet_name
  `;
  const customers = rows as Pick<Customer, "id" | "pet_name" | "owner_name" | "owner_phone">[];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reservations">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">새 예약 등록</h1>
      </div>
      <ReservationForm customers={customers} defaultCustomerId={customerId} />
    </div>
  );
}
