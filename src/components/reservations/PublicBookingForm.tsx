"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { publicBookingSchema, type PublicBookingValues } from "@/lib/validations/reservation";
import { SERVICE_OPTIONS } from "@/lib/validations/service-log";
import { CheckCircle2 } from "lucide-react";

export function PublicBookingForm({
  slug,
  storeName,
}: {
  slug: string;
  storeName: string;
}) {
  const [done, setDone] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const form = useForm<PublicBookingValues>({
    resolver: zodResolver(publicBookingSchema),
    defaultValues: {
      guest_name: "",
      guest_phone: "",
      scheduled_at: "",
      duration_min: 60,
      services: [],
      notes: "",
    },
  });

  function toggleService(service: string, current: string[]) {
    return current.includes(service)
      ? current.filter((s) => s !== service)
      : [...current, service];
  }

  async function onSubmit(values: PublicBookingValues) {
    setIsPending(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/book?slug=${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "오류가 발생했습니다");
        return;
      }
      setDone(true);
    } catch {
      setErrorMsg("네트워크 오류가 발생했습니다. 다시 시도해 주세요");
    } finally {
      setIsPending(false);
    }
  }

  if (done) {
    return (
      <Card>
        <CardContent className="pt-8 pb-6 text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold">예약 신청 완료</h2>
            <p className="text-sm text-muted-foreground">
              {storeName}에서 확인 후 연락드릴 예정입니다.
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => { setDone(false); form.reset(); }}>
            다시 예약하기
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guest_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름 *</FormLabel>
                    <FormControl>
                      <Input placeholder="홍길동" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guest_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>연락처 *</FormLabel>
                    <FormControl>
                      <Input placeholder="010-0000-0000" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="scheduled_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>희망 예약 일시 *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>원하시는 서비스</FormLabel>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {SERVICE_OPTIONS.map((s) => (
                      <Badge
                        key={s}
                        variant={field.value.includes(s) ? "default" : "outline"}
                        className="cursor-pointer select-none"
                        onClick={() =>
                          field.onChange(toggleService(s, field.value))
                        }
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>요청사항</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="반려동물 이름, 특이사항, 요청사항 등"
                      rows={3}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorMsg && (
              <p className="text-sm text-destructive">{errorMsg}</p>
            )}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "신청 중..." : "예약 신청"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          예약 신청 후 매장 확인이 완료되면 연락드립니다
        </p>
      </form>
    </Form>
  );
}
