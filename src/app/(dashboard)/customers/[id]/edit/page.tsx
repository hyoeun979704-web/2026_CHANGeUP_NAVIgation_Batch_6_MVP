import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/actions/stores";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const store = await getCurrentStore();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("store_id", store!.id)
    .single();

  if (!customer) notFound();

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/customers/${id}`}><ChevronLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold">{customer.pet_name} 정보 수정</h1>
      </div>
      <CustomerForm customer={customer} />
    </div>
  );
}
