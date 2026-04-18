import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/actions/stores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Users, Bell, Clock, Plus, Zap } from "lucide-react";
import type { NotificationWithCustomer } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const store = await getCurrentStore();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: customerCount },
    { count: monthlyCount },
    { count: sentCount },
    { data: recentNotifications },
  ] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }).eq("store_id", store!.id),
    supabase.from("notifications").select("*", { count: "exact", head: true }).eq("store_id", store!.id).gte("created_at", monthStart),
    supabase.from("notifications").select("*", { count: "exact", head: true }).eq("store_id", store!.id).eq("is_sent", true).gte("created_at", monthStart),
    supabase.from("notifications").select("*, customers(pet_name, breed, owner_name, owner_phone)").eq("store_id", store!.id).order("created_at", { ascending: false }).limit(5),
  ]);

  const quota = store!.monthly_ai_quota;
  const used = monthlyCount ?? 0;
  const savedMinutes = Math.round((used * 240) / 60);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{store!.name}</h1>
        <p className="text-sm text-muted-foreground">오늘도 좋은 하루 되세요</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />등록 반려동물
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">{customerCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">마리</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <Bell className="h-3.5 w-3.5" />이번 달 알림장
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">{used}</p>
            <p className="text-xs text-muted-foreground">/ {quota}건 사용</p>
            <Progress value={(used / quota) * 100} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />절약한 시간
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">{savedMinutes}</p>
            <p className="text-xs text-muted-foreground">분 이번 달</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" />전송 완료
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">{sentCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">건 이번 달</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link href="/notifications/new">
            <Plus className="h-4 w-4" />
            알림장 생성
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/customers/new">
            <Users className="h-4 w-4" />
            고객 등록
          </Link>
        </Button>
      </div>

      {/* first-run empty state */}
      {used === 0 && (customerCount ?? 0) === 0 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="font-bold text-base mb-1">첫 알림장을 만들어 보세요</p>
              <p className="text-sm text-muted-foreground">3분이면 원장님의 업무가 완전히 달라집니다.</p>
            </div>
            <div className="space-y-2">
              {[
                { n: 1, t: "고객 등록", d: "반려동물과 보호자 정보를 입력하세요. 알러지·의료 기록은 AI 프롬프트에 자동 반영됩니다.", href: "/customers/new", cta: "+ 첫 고객 등록" },
                { n: 2, t: "알림장 생성", d: "키워드 몇 개만 입력하면 AI가 보호자에게 보낼 메시지 초안을 만들어 드려요." },
                { n: 3, t: "카카오톡 복사", d: "초안을 검수한 뒤 복사 버튼 한 번으로 카톡에 붙여넣기." },
              ].map((s) => (
                <div key={s.n} className="flex gap-3 p-3 border rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">{s.n}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{s.t}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.d}</p>
                  </div>
                  {s.href && s.cta && (
                    <Button size="sm" asChild><Link href={s.href}>{s.cta}</Link></Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recentNotifications && recentNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">최근 알림장</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {(recentNotifications as NotificationWithCustomer[]).map((n) => (
              <Link key={n.id} href={`/notifications/${n.id}`} className="flex items-center justify-between px-6 py-3 hover:bg-muted/40 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.customers.pet_name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">
                    {n.final_text || n.ai_draft || n.keywords}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(n.created_at), "M/d HH:mm", { locale: ko })}
                  </span>
                  {n.is_sent ? (
                    <Badge className="text-xs">전송</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">대기</Badge>
                  )}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
