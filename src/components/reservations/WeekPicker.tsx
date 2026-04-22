"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addWeeks, startOfWeek, endOfWeek, format } from "date-fns";
import { ko } from "date-fns/locale";

export function WeekPicker({ currentOffset }: { currentOffset: number }) {
  const base = addWeeks(new Date(), currentOffset);
  const weekStart = startOfWeek(base, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(base, { weekStartsOn: 1 });

  const label = `${format(weekStart, "M월 d일", { locale: ko })} – ${format(weekEnd, "M월 d일", { locale: ko })}`;
  const isCurrentWeek = currentOffset === 0;

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" className="h-8 w-8" asChild>
        <Link href={`/reservations?week=${currentOffset - 1}`}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>
      <span className="text-sm font-medium min-w-[160px] text-center">{label}</span>
      <Button variant="outline" size="icon" className="h-8 w-8" asChild>
        <Link href={`/reservations?week=${currentOffset + 1}`}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
      {!isCurrentWeek && (
        <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
          <Link href="/reservations">이번 주</Link>
        </Button>
      )}
    </div>
  );
}
