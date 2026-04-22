"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createReservation } from "@/actions/reservations";
import { reservationSchema, type ReservationValues } from "@/lib/validations/reservation";
import { SERVICE_OPTIONS } from "@/lib/validations/service-log";
import { useToast } from "@/hooks/use-toast";
import type { Customer } from "@/types/database";

type CustomerOption = Pick<Customer, "id" | "pet_name" | "owner_name" | "owner_phone">;

export function ReservationForm({
  customers,
  defaultCustomerId,
}: {
  customers: CustomerOption[];
  defaultCustomerId?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<ReservationValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      customer_id: defaultCustomerId ?? null,
      scheduled_at: "",
      duration_min: 60,
      services: [],
      status: "pending",
      notes: "",
    },
  });

  function toggleService(service: string, current: string[]) {
    return current.includes(service)
      ? current.filter((s) => s !== service)
      : [...current, service];
  }

  function onSubmit(values: ReservationValues) {
    startTransition(async () => {
      const fd = new FormData();
      if (values.customer_id) fd.append("customer_id", values.customer_id);
      fd.append("scheduled_at", values.scheduled_at);
      fd.append("duration_min", String(values.duration_min));
      values.services.forEach((s) => fd.append("services", s));
      fd.append("status", values.status ?? "pending");
      if (values.deposit_amount != null) fd.append("deposit_amount", String(values.deposit_amount));
      if (values.notes) fd.append("notes", values.notes);

      const result = await createReservation(fd);
      if (result?.error) {
        toast({ title: "오류", description: result.error, variant: "destructive" });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
        <Card>
          <CardContent className="pt-5 space-y-4">
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>반려동물 / 고객</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="고객 선택 (선택사항)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.pet_name} ({c.owner_name} 보호자)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduled_at"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>예약 일시 *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>소요 시간</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      defaultValue={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[30, 60, 90, 120, 150, 180].map((m) => (
                          <SelectItem key={m} value={String(m)}>
                            {m}분
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>서비스 항목</FormLabel>
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
                  <FormLabel>메모</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="특이사항, 요청사항 등"
                      rows={2}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? "저장 중..." : "예약 등록"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => history.back()}
            disabled={isPending}
          >
            취소
          </Button>
        </div>
      </form>
    </Form>
  );
}
