import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/actions/stores";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function CustomersPage() {
  const supabase = await createClient();
  const store = await getCurrentStore();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("store_id", store!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">반려동물 / 고객 관리</h1>
          <p className="text-sm text-muted-foreground">총 {customers?.length ?? 0}마리</p>
        </div>
        <Button asChild>
          <Link href="/customers/new">
            <Plus className="h-4 w-4" />
            새 고객 등록
          </Link>
        </Button>
      </div>

      <CustomerTable customers={customers ?? []} />
    </div>
  );
}
