import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentStore } from "@/actions/stores";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

const DEMO_TEMPLATES = [
  { title: "일반 미용", desc: "목욕 + 컷 + 발톱정리 완료. 상태 양호...", used: 42 },
  { title: "부분 미용", desc: "부분미용 진행. 털 관리 안내 포함...", used: 18 },
  { title: "처음 방문 인사", desc: "첫 방문 환영 인사와 다음 예약 안내...", used: 8 },
  { title: "귀/발 케어", desc: "귀청소와 발바닥 털 정리 후 피부 상태...", used: 12 },
];

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  return (
    <div className="space-y-5 max-w-xl">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link href="/settings"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">알림장 템플릿</h1>
          <p className="text-sm text-muted-foreground">자주 쓰는 내용을 저장해 빠르게 초안 생성</p>
        </div>
        <Button size="sm">+ 새 템플릿</Button>
      </div>

      <div className="space-y-2">
        {DEMO_TEMPLATES.map((t) => (
          <Card key={t.title}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{t.title}</p>
                <p className="text-xs text-muted-foreground truncate">{t.desc}</p>
              </div>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-1 shrink-0">{t.used}회 사용</span>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">* 알림장 템플릿 관리 기능은 추후 업데이트 예정입니다.</p>
    </div>
  );
}
