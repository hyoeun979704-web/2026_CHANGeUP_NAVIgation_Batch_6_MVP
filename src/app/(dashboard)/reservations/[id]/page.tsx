import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, Clock, User, Phone, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentStore } from "@/actions/stores";
import { sql } from "@/lib/db";
import { StatusChangeButtons } from "@/components/reservations/StatusChangeButtons";
import type { ReservationWithCustomer } from "@/types/database";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "대기", variant: "secondary" },
  confirmed: { label: "확정", variant: "default" },
  completed: { label: "완료", variant: "default" },
  no_show: { label: "노쇼", variant: "destructive" },
  cancelled: { label: "취소", variant: "outline" },
};

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const { id } = await params;
  const rows = await sql`
    SELECT r.*,
      json_build_object(
        'pet_name', c.pet_name,
        'owner_name', c.owner_name,
        'owner_phone', c.owner_phone
      ) as customers
    FROM reservations r
    LEFT JOIN customers c ON c.id = r.customer_id
    WHERE r.id = ${id} AND r.store_id = ${store.id}
    LIMIT 1
  `;

  const reservation = rows[0] as ReservationWithCustomer | undefined;
  if (!reservation) notFound();

  const status = STATUS_LABELS[reservation.status] ?? { label: reservation.status, variant: "outline" as const };
  const petName = reservation.customers?.pet_name ?? reservation.guest_name ?? "이름 없음";
  const ownerName = reservation.customers?.owner_name ?? reservation.guest_name ?? "-";
  const ownerPhone = reservation.customers?.owner_phone ?? reservation.guest_phone ?? "-";
  const services = (reservation.services as string[]) ?? [];

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reservations">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{petName}</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(reservation.scheduled_at), "M월 d일 (EEE) HH:mm", { locale: ko })}
          </p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">예약 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>
              {format(new Date(reservation.scheduled_at), "yyyy년 M월 d일 HH:mm")} · {reservation.duration_min}분
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{ownerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{ownerPhone}</span>
          </div>
          {services.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {services.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
          )}
          {reservation.notes && (
            <div className="flex gap-2">
              <StickyNote className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{reservation.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <StatusChangeButtons reservationId={id} currentStatus={reservation.status} />
    </div>
  );
}
