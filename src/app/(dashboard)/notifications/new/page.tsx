import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/actions/stores";
import { NotificationForm } from "@/components/notifications/NotificationForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default async function NewNotificationPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;
  const supabase = await createClient();
  const store = await getCurrentStore();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("store_id", store!.id)
    .order("pet_name");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/notifications"><ChevronLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold">AI 알림장 생성</h1>
      </div>
      <NotificationForm customers={customers ?? []} defaultCustomerId={customerId} />
    </div>
  );
}
