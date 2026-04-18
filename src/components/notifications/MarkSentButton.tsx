"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";
import { markNotificationSent } from "@/actions/notifications";
import { useToast } from "@/hooks/use-toast";

export function MarkSentButton({ notificationId }: { notificationId: string }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleMark() {
    startTransition(async () => {
      const result = await markNotificationSent(notificationId);
      if (result?.error) {
        toast({ title: "오류", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "전송 완료로 표시됐습니다" });
      }
    });
  }

  return (
    <Button size="sm" onClick={handleMark} disabled={isPending} className="gap-1.5">
      <CheckCheck className="h-3.5 w-3.5" />
      전송 완료
    </Button>
  );
}
