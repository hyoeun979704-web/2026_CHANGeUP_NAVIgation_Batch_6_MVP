"use client";

import Link from "next/link";
import { format, isToday, isTomorrow } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarDays, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ReservationWithCustomer } from "@/types/database";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: "대기", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  confirmed: { label: "확정", className: "bg-blue-100 text-blue-800 border-blue-200" },
  completed: { label: "완료", className: "bg-green-100 text-green-800 border-green-200" },
  no_show: { label: "노쇼", className: "bg-red-100 text-red-800 border-red-200" },
  cancelled: { label: "취소", className: "bg-gray-100 text-gray-500 border-gray-200" },
};

function formatScheduledAt(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return `오늘 ${format(d, "HH:mm")}`;
  if (isTomorrow(d)) return `내일 ${format(d, "HH:mm")}`;
  return format(d, "M월 d일 (EEE) HH:mm", { locale: ko });
}

function groupByDate(reservations: ReservationWithCustomer[]) {
  const groups: Record<string, ReservationWithCustomer[]> = {};
  for (const r of reservations) {
    const key = format(new Date(r.scheduled_at), "yyyy-MM-dd");
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }
  return groups;
}

export function ReservationList({ reservations }: { reservations: ReservationWithCustomer[] }) {
  if (reservations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-2">
          <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">이번 주 예약이 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  const groups = groupByDate(reservations);

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([dateKey, items]) => {
        const date = new Date(dateKey + "T00:00:00");
        const dayLabel = isToday(date)
          ? "오늘"
          : isTomorrow(date)
          ? "내일"
          : format(date, "M월 d일 (EEE)", { locale: ko });

        return (
          <div key={dateKey}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {dayLabel}
            </p>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {items.map((r) => {
                    const statusCfg = STATUS_CONFIG[r.status] ?? { label: r.status, className: "" };
                    const petName = r.customers?.pet_name ?? r.guest_name ?? "이름 없음";
                    const ownerName = r.customers?.owner_name ?? r.guest_name ?? "-";
                    const services = (r.services as string[]) ?? [];

                    return (
                      <Link
                        key={r.id}
                        href={`/reservations/${r.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 shrink-0">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{petName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {ownerName} · {formatScheduledAt(r.scheduled_at)}
                          </p>
                          {services.length > 0 && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {services.join(", ")}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs shrink-0 ${statusCfg.className}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
