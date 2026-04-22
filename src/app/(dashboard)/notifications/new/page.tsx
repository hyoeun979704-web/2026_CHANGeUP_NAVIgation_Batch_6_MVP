import { sql } from "@/lib/db";
import { getCurrentStore } from "@/actions/stores";
import { NotificationForm } from "@/components/notifications/NotificationForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import type { Customer } from "@/types/database";

export default async function NewNotificationPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;
  const store = await getCurrentStore();
  if (!store) return null;

  const rows = await sql`
    SELECT * FROM customers WHERE store_id = ${store.id} ORDER BY pet_name
  `;
  const customers = rows as Customer[];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/notifications"><ChevronLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold">AI 알림장 생성</h1>
      </div>
      <NotificationForm customers={customers} defaultCustomerId={customerId} />
    </div>
  );
}
