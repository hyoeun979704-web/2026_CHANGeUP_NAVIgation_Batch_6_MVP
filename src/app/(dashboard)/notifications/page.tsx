import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/actions/stores";
import { NotificationHistory } from "@/components/notifications/NotificationHistory";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import type { NotificationWithCustomer } from "@/types/database";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const store = await getCurrentStore();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*, customers(pet_name, breed, owner_name, owner_phone)")
    .eq("store_id", store!.id)
    .order("created_at", { ascending: false });

  const all = (notifications ?? []) as NotificationWithCustomer[];
  const sent = all.filter((n) => n.is_sent);
  const pending = all.filter((n) => !n.is_sent);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">알림장 관리</h1>
          <p className="text-sm text-muted-foreground">총 {all.length}건</p>
        </div>
        <Button asChild>
          <Link href="/notifications/new">
            <Plus className="h-4 w-4" />
            새 알림장
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">전체 ({all.length})</TabsTrigger>
          <TabsTrigger value="pending">미전송 ({pending.length})</TabsTrigger>
          <TabsTrigger value="sent">전송 완료 ({sent.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all"><NotificationHistory notifications={all} /></TabsContent>
        <TabsContent value="pending"><NotificationHistory notifications={pending} /></TabsContent>
        <TabsContent value="sent"><NotificationHistory notifications={sent} /></TabsContent>
      </Tabs>
    </div>
  );
}
