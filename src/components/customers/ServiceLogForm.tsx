"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createServiceLog } from "@/actions/service-logs";
import { SERVICE_OPTIONS } from "@/lib/validations/service-log";
import { useToast } from "@/hooks/use-toast";

export function ServiceLogForm({ customerId, onSuccess }: { customerId: string; onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const { toast } = useToast();

  function toggleService(s: string) {
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedServices.length === 0) {
      toast({ title: "서비스 항목을 선택해 주세요", variant: "destructive" });
      return;
    }
    const formData = new FormData(e.currentTarget);
    selectedServices.forEach((s) => formData.append("services", s));

    startTransition(async () => {
      const result = await createServiceLog(customerId, formData);
      if (result?.error) {
        toast({ title: "오류", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "서비스 이력이 저장되었습니다" });
        setSelectedServices([]);
        (e.target as HTMLFormElement).reset();
        onSuccess?.();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>날짜 *</Label>
        <Input
          type="date"
          name="service_date"
          defaultValue={new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>서비스 항목 *</Label>
        <div className="flex flex-wrap gap-2">
          {SERVICE_OPTIONS.map((s) => (
            <Badge
              key={s}
              variant={selectedServices.includes(s) ? "default" : "outline"}
              className="cursor-pointer select-none"
              onClick={() => toggleService(s)}
            >
              {s}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>메모</Label>
        <Textarea name="notes" placeholder="오늘 특이사항, 다음 방문 시 참고사항..." rows={2} className="resize-none" />
      </div>

      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? "저장 중..." : "이력 저장"}
      </Button>
    </form>
  );
}
