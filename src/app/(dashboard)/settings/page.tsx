import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/actions/stores";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Store, Sparkles, FileText, CreditCard, HelpCircle, LogOut } from "lucide-react";
import { logout } from "@/actions/auth";

const SETTING_SECTIONS = [
  { href: "/settings/store", icon: Store, label: "매장 정보 수정", desc: "이름, 연락처, 주소, 영업 시간" },
  { href: "/settings/ai-tone", icon: Sparkles, label: "AI 말투 설정", desc: "친근함·정중함·간결함 조절" },
  { href: "/settings/templates", icon: FileText, label: "알림장 템플릿", desc: "자주 쓰는 문구 저장" },
  { href: "/settings/plan", icon: CreditCard, label: "플랜 / 결제", desc: "현재 플랜 및 업그레이드" },
  { href: "/settings/help", icon: HelpCircle, label: "도움말 / FAQ", desc: "자주 묻는 질문" },
];

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  // monthly AI usage count
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { count: usedCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("store_id", store.id)
    .gte("created_at", monthStart);

  const used = usedCount ?? 0;
  const quota = store.monthly_ai_quota;
  const usagePercent = Math.min(100, Math.round((used / quota) * 100));

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold">설정</h1>
      </div>

      {/* store summary card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">🏪</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base">{store.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings/store">수정</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI usage */}
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

      {/* nav items */}
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

      {/* account */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-mono">계정</p>
        <Card>
          <CardContent className="p-0">
            <Link href="/forgot-password" className="flex items-center justify-between px-5 py-4 border-b hover:bg-muted/50 transition-colors text-sm">
              비밀번호 변경 <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <form action={logout}>
              <button type="submit" className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors text-sm text-destructive">
                <span className="flex items-center gap-2"><LogOut className="h-4 w-4" />로그아웃</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
