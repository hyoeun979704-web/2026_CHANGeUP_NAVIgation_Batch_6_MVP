import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { getCurrentStore } from "@/actions/stores";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Store, Sparkles, FileText, CreditCard, HelpCircle } from "lucide-react";
import { LogoutButton } from "@/components/layout/LogoutButton";

const SETTING_SECTIONS = [
  { href: "/settings/store", icon: Store, label: "매장 정보 수정", desc: "이름, 연락처, 주소, 영업 시간" },
  { href: "/settings/ai-tone", icon: Sparkles, label: "AI 말투 설정", desc: "친근함·정중함·간결함 조절" },
  { href: "/settings/templates", icon: FileText, label: "알림장 템플릿", desc: "자주 쓰는 문구 저장" },
  { href: "/settings/plan", icon: CreditCard, label: "플랜 / 결제", desc: "현재 플랜 및 업그레이드" },
];

export default async function SettingsPage() {
  const [user, store] = await Promise.all([currentUser(), getCurrentStore()]);
  if (!store) return null;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const rows = await sql`
    SELECT COUNT(*) as cnt FROM notifications
    WHERE store_id = ${store.id} AND created_at >= ${monthStart}
  `;
  const used = Number((rows[0] as { cnt: string }).cnt ?? 0);
  const quota = store.monthly_ai_quota;
  const usagePercent = Math.min(100, Math.round((used / quota) * 100));
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold">설정</h1>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">🏪</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base">{store.name}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings/store">수정</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-mono">AI 사용량</p>
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>이번 달 사용량</span>
              <span className="font-semibold">{used} / {quota}건</span>
            </div>
            <Progress value={usagePercent} className="h-1.5" />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">매월 1일 초기화 · 현재 <span className="font-semibold text-foreground">{store.plan} 플랜</span></p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings/plan">플랜 변경</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-mono">설정 메뉴</p>
        <Card>
          <CardContent className="p-0">
            {SETTING_SECTIONS.map(({ href, icon: Icon, label, desc }, i) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-5 py-4 hover:bg-muted/50 transition-colors ${i < SETTING_SECTIONS.length - 1 ? "border-b" : ""}`}
              >
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-mono">계정</p>
        <Card>
          <CardContent className="p-0">
            <LogoutButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
