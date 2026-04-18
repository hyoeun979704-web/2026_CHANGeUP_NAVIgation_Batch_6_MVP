import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentStore } from "@/actions/stores";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check } from "lucide-react";

const PLANS = [
  {
    id: "free",
    title: "무료",
    price: "₩0",
    desc: "시작하는 원장님용",
    features: ["알림장 월 30건", "고객 무제한", "기본 AI 말투"],
  },
  {
    id: "pro",
    title: "프로",
    price: "₩19,900",
    suffix: "/월",
    desc: "일반 매장에 추천",
    features: ["알림장 월 300건", "템플릿 10개", "말투 커스터마이즈", "우선 AI"],
    highlight: true,
  },
  {
    id: "pro_pg",
    title: "프리미엄",
    price: "₩49,900",
    suffix: "/월",
    desc: "프랜차이즈 · 대형 매장",
    features: ["무제한 알림장", "직원 5명", "API 액세스", "전용 상담"],
  },
];

export default async function PlanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link href="/settings"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">플랜 / 결제</h1>
          <p className="text-sm text-muted-foreground">매장 규모에 맞는 플랜을 선택하세요</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {PLANS.map((p) => {
          const isCurrent = p.id === store.plan;
          return (
            <Card key={p.id} className={isCurrent ? "border-2 border-primary relative" : ""}>
              {isCurrent && (
                <div className="absolute -top-3 left-4">
                  <Badge className="text-xs">현재 플랜</Badge>
                </div>
              )}
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="font-bold text-base">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
                <p className="text-2xl font-bold">
                  {p.price}
                  {p.suffix && <span className="text-sm font-normal text-muted-foreground">{p.suffix}</span>}
                </p>
                <div className="border-t pt-4 space-y-2">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <Button
                  variant={isCurrent ? "outline" : "default"}
                  className="w-full"
                  disabled={isCurrent}
                >
                  {isCurrent ? "사용 중" : "업그레이드"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          💡 연간 결제 시 2개월 무료. 언제든지 변경/해지할 수 있습니다.
        </CardContent>
      </Card>
    </div>
  );
}
