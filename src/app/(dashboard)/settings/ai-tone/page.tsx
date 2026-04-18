import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentStore } from "@/actions/stores";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default async function AITonePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const sliders = [
    { label: "친근함", left: "정중함", right: "친근함", value: 70 },
    { label: "자세함", left: "간결함", right: "자세함", value: 50 },
    { label: "따뜻함", left: "사무적", right: "따뜻함", value: 65 },
  ];

  const emojiOptions = ["사용 안 함", "가끔", "적극"];

  return (
    <div className="space-y-5 max-w-xl">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link href="/settings"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">AI 말투 설정</h1>
          <p className="text-sm text-muted-foreground">알림장 초안의 기본 말투를 조절하세요</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          {sliders.map((s) => (
            <div key={s.label}>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">{s.left}</span>
                <span className="font-medium text-sm">{s.label}</span>
                <span className="text-muted-foreground">{s.right}</span>
              </div>
              <div className="relative h-1.5 bg-muted rounded-full">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-2 border-white shadow-sm"
                  style={{ left: `calc(${s.value}% - 8px)` }}
                />
                <div className="absolute inset-y-0 left-0 rounded-full bg-primary/40" style={{ width: `${s.value}%` }} />
              </div>
            </div>
          ))}

          <div className="space-y-1.5 pt-2">
            <Label>인사말 (필요시 직접 작성)</Label>
            <Input defaultValue="안녕하세요 {{보호자이름}} 보호자님" />
          </div>
          <div className="space-y-1.5">
            <Label>맺음말</Label>
            <Input defaultValue="오늘도 믿고 맡겨주셔서 감사합니다 🐾" />
          </div>
          <div className="space-y-1.5">
            <Label>이모지 사용</Label>
            <div className="flex gap-2">
              {emojiOptions.map((opt, i) => (
                <button
                  key={opt}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${i === 1 ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* preview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">미리보기</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
            {`안녕하세요 김지연 보호자님!\n오늘 몽이가 목욕이랑 미용 잘 마쳤어요 🐾 털도 보송보송해졌고, 기분도 좋아 보였습니다.\n오늘도 믿고 맡겨주셔서 감사합니다 🐾`}
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-1">
        <Button className="flex-1">저장</Button>
        <Button variant="outline">기본값으로</Button>
      </div>
      <p className="text-xs text-muted-foreground">* AI 말투 커스터마이즈는 추후 업데이트 예정입니다.</p>
    </div>
  );
}
