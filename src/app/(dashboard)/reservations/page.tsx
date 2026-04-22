import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentStore } from "@/actions/stores";
import { getReservationsForWeek } from "@/actions/reservations";
import { ReservationList } from "@/components/reservations/ReservationList";
import { WeekPicker } from "@/components/reservations/WeekPicker";
import { redirect } from "next/navigation";

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const { week } = await searchParams;
  const weekOffset = week ? parseInt(week, 10) : 0;
  const reservations = await getReservationsForWeek(isNaN(weekOffset) ? 0 : weekOffset);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">예약 관리</h1>
          <p className="text-sm text-muted-foreground">예약을 확인하고 관리하세요</p>
        </div>
        <Button asChild size="sm">
          <Link href="/reservations/new">
            <Plus className="h-4 w-4 mr-1.5" />새 예약
          </Link>
        </Button>
      </div>

      <WeekPicker currentOffset={isNaN(weekOffset) ? 0 : weekOffset} />

      <ReservationList reservations={reservations} />

      <p className="text-xs text-muted-foreground pt-2">
        공개 예약 링크:{" "}
        {store.slug ? (
          <span className="font-mono">
            {process.env.NEXT_PUBLIC_APP_URL ?? ""}/book/{store.slug}
          </span>
        ) : (
          <Link href="/settings/store" className="underline">
            설정 → 매장 정보에서 예약 링크 주소를 설정하세요
          </Link>
        )}
      </p>
    </div>
  );
}
