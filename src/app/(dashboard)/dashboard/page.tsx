import Link from "next/link";
import { sql } from "@/lib/db";
import { getCurrentStore } from "@/actions/stores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Users, Bell, Clock, Plus, Zap } from "lucide-react";
import type { NotificationWithCustomer } from "@/types/database";

export default async function DashboardPage() {
  const store = await getCurrentStore();
  if (!store) return null;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [customerRows, monthlyRows, sentRows, recentRows] = await Promise.all([
    sql`SELECT COUNT(*) as cnt FROM customers WHERE store_id = ${store.id}`,
    sql`SELECT COUNT(*) as cnt FROM notifications WHERE store_id = ${store.id} AND created_at >= ${monthStart}`,
    sql`SELECT COUNT(*) as cnt FROM notifications WHERE store_id = ${store.id} AND is_sent = true AND created_at >= ${monthStart}`,
    sql`
      SELECT n.*, c.pet_name, c.breed, c.owner_name, c.owner_phone
      FROM notifications n
      JOIN customers c ON c.id = n.customer_id
      WHERE n.store_id = ${store.id}
      ORDER BY n.created_at DESC
      LIMIT 5
    `,
  ]);

  const customerCount = Number((customerRows[0] as { cnt: string }).cnt ?? 0);
  const used = Number((monthlyRows[0] as { cnt: string }).cnt ?? 0);
  const sentCount = Number((sentRows[0] as { cnt: string }).cnt ?? 0);
  const quota = store.monthly_ai_quota;
  const savedMinutes = Math.round((used * 240) / 60);

  const recentNotifications = recentRows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      ...row,
      customers: {
        pet_name: row.pet_name,
        breed: row.breed,
        owner_name: row.owner_name,
        owner_phone: row.owner_phone,
      },
    } as unknown as NotificationWithCustomer;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{store.name}</h1>
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
            <p className="text-2xl font-bold">{customerCount}</p>
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
            <p className="text-2xl font-bold">{sentCount}</p>
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

      {used === 0 && customerCount === 0 && (
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

      {recentNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">최근 알림장</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {recentNotifications.map((n) => (
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
