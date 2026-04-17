"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { saveNotification, markNotificationSent } from "@/actions/notifications";
import { useToast } from "@/hooks/use-toast";
import { Copy, Save, CheckCircle, RotateCcw, Zap } from "lucide-react";

interface AIDraftEditorProps {
  draft: string;
  customerId: string;
  keywords: string;
  imageUrl?: string;
  latencyMs?: number;
  tokensUsed?: number;
  onReset: () => void;
}

export function AIDraftEditor({
  draft,
  customerId,
  keywords,
  imageUrl,
  latencyMs,
  tokensUsed,
  onReset,
}: AIDraftEditorProps) {
  const [text, setText] = useState(draft);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const charCount = text.length;
  const isOverLimit = charCount > 180;

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    toast({ title: "클립보드에 복사되었습니다", description: "카카오톡에 붙여넣기 하세요" });
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveNotification({
        customerId,
        keywords,
        imageUrl,
        aiDraft: draft,
        finalText: text,
        latencyMs,
        tokensUsed,
      });

      if (result?.error) {
        toast({ title: "저장 실패", description: result.error, variant: "destructive" });
      } else if (result?.id) {
        setSavedId(result.id);
        toast({ title: "알림장이 저장되었습니다" });
      }
    });
  }

  function handleMarkSent() {
    if (!savedId) {
      toast({ title: "먼저 저장해 주세요", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      const result = await markNotificationSent(savedId);
      if (result?.error) {
        toast({ title: "오류", description: result.error, variant: "destructive" });
      } else {
        setIsSent(true);
        toast({ title: "전송 완료로 표시되었습니다" });
      }
    });
  }

  return (
    <div className="max-w-xl space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">AI 초안 검수</CardTitle>
            <div className="flex items-center gap-2">
              {latencyMs && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Zap className="h-3 w-3" />
                  {(latencyMs / 1000).toFixed(1)}초
                </Badge>
              )}
              {isSent && <Badge variant="success">전송 완료</Badge>}
              {savedId && !isSent && <Badge variant="secondary">저장됨</Badge>}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            내용을 검토하고 수정한 뒤, 카카오톡에 복사해서 보내세요
          </p>
        </CardHeader>

        <CardContent>
          <div className="relative">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="resize-none pr-16"
            />
            <span
              className={`absolute bottom-3 right-3 text-xs ${
                isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"
              }`}
            >
              {charCount}/180
            </span>
          </div>
          {isOverLimit && (
            <p className="mt-1 text-xs text-destructive">
              180자를 초과했습니다. 카카오톡 발송 전 줄여주세요.
            </p>
          )}
        </CardContent>

        <Separator />

        <CardFooter className="pt-3 flex flex-wrap gap-2">
          <Button onClick={handleCopy} className="gap-2 flex-1">
            <Copy className="h-4 w-4" />
            복사 (카카오톡용)
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isPending || !!savedId}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {savedId ? "저장됨" : "저장"}
          </Button>
          <Button
            variant="outline"
            onClick={handleMarkSent}
            disabled={isPending || isSent || !savedId}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {isSent ? "전송 완료" : "전송 표시"}
          </Button>
        </CardFooter>
      </Card>

      <Button variant="ghost" size="sm" className="gap-2" onClick={onReset}>
        <RotateCcw className="h-4 w-4" />
        다시 생성
      </Button>
    </div>
  );
}
