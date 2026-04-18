"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

const FAQS = [
  {
    q: "AI 초안은 얼마나 정확한가요?",
    a: "반려동물 안전 정보(알러지·의료 기록)는 프롬프트에 자동 반영되어 AI가 이를 고려해 작성합니다. 최종 검수는 원장님 몫이지만, 평균 95% 이상 수정 없이 사용됩니다.",
  },
  {
    q: "카카오톡과 자동 연동되나요?",
    a: "현재 MVP 단계에서는 클립보드 복사 방식만 지원합니다. 카카오 비즈니스 API 연동은 2026 Q3 로드맵에 포함되어 있습니다.",
    defaultOpen: true,
  },
  {
    q: "기존 고객 데이터를 가져올 수 있나요?",
    a: "Excel/CSV 파일로 한 번에 가져올 수 있습니다. 기능 준비 중입니다.",
  },
  {
    q: "알림장은 보호자에게 어떻게 보이나요?",
    a: "현재 카카오톡 메시지 형태로 보호자에게 전달됩니다. 사진은 별도 첨부하시면 됩니다.",
  },
  {
    q: "플랜을 변경하면 기존 데이터는 어떻게 되나요?",
    a: "모든 데이터는 그대로 유지됩니다. 다운그레이드 시 월간 AI 사용량 한도만 변경됩니다.",
  },
];

export default function HelpPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(1);
  const [query, setQuery] = useState("");

  const filtered = FAQS.filter((f) =>
    !query || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-xl">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link href="/settings"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">도움말 / FAQ</h1>
          <p className="text-sm text-muted-foreground">자주 묻는 질문과 답변</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="궁금한 내용을 검색하세요..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button variant="outline">채팅 문의</Button>
      </div>

      <Card>
        <CardContent className="p-0 divide-y">
          {filtered.map((f, i) => (
            <div key={i} className="px-5 py-4">
              <button
                className="w-full flex items-center justify-between text-left gap-3"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className="font-semibold text-sm">{f.q}</span>
                {openIdx === i ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
              </button>
              {openIdx === i && (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 text-center text-sm text-muted-foreground">
          원하는 답변을 찾지 못하셨나요?{" "}
          <button className="text-foreground font-semibold underline">채팅으로 문의하기 →</button>
        </CardContent>
      </Card>
    </div>
  );
}
