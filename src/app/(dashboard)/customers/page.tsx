import Link from "next/link";
import { sql } from "@/lib/db";
import { getCurrentStore } from "@/actions/stores";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Customer } from "@/types/database";

export default async function CustomersPage() {
  const store = await getCurrentStore();
  if (!store) return null;

  const rows = await sql`
    SELECT * FROM customers WHERE store_id = ${store.id} ORDER BY created_at DESC
  `;
  const customers = rows as Customer[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">반려동물 / 고객 관리</h1>
          <p className="text-sm text-muted-foreground">총 {customers.length}마리</p>
        </div>
        <Button asChild>
          <Link href="/customers/new">
            <Plus className="h-4 w-4" />
            새 고객 등록
          </Link>
        </Button>
      </div>

      <CustomerTable customers={customers} />
    </div>
  );
}
