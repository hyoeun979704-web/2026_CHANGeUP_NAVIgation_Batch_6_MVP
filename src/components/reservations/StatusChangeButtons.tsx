"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateReservationStatus, deleteReservation } from "@/actions/reservations";
import { useToast } from "@/hooks/use-toast";
import { CheckCheck, X, Ban, Trash2, CalendarCheck } from "lucide-react";

const NEXT_ACTIONS: Record<string, { status: string; label: string; icon: React.ReactNode; variant: "default" | "outline" | "destructive" }[]> = {
  pending: [
    { status: "confirmed", label: "예약 확정", icon: <CalendarCheck className="h-4 w-4" />, variant: "default" },
    { status: "cancelled", label: "예약 취소", icon: <X className="h-4 w-4" />, variant: "outline" },
  ],
  confirmed: [
    { status: "completed", label: "방문 완료", icon: <CheckCheck className="h-4 w-4" />, variant: "default" },
    { status: "no_show", label: "노쇼 처리", icon: <Ban className="h-4 w-4" />, variant: "outline" },
    { status: "cancelled", label: "예약 취소", icon: <X className="h-4 w-4" />, variant: "outline" },
  ],
  completed: [],
  no_show: [],
  cancelled: [],
};

export function StatusChangeButtons({
  reservationId,
  currentStatus,
}: {
  reservationId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const actions = NEXT_ACTIONS[currentStatus] ?? [];

  function handleStatusChange(status: string, label: string) {
    startTransition(async () => {
      const result = await updateReservationStatus(reservationId, status);
      if (result.success) {
        toast({ title: `${label} 처리 완료` });
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!confirm("예약을 삭제하시겠습니까?")) return;
    startTransition(async () => {
      await deleteReservation(reservationId);
      router.push("/reservations");
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ status, label, icon, variant }) => (
        <Button
          key={status}
          variant={variant}
          size="sm"
          disabled={isPending}
          onClick={() => handleStatusChange(status, label)}
        >
          {icon}
          <span className="ml-1.5">{label}</span>
        </Button>
      ))}
      {(currentStatus === "cancelled" || currentStatus === "no_show") && (
        <Button variant="destructive" size="sm" disabled={isPending} onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          <span className="ml-1.5">삭제</span>
        </Button>
      )}
    </div>
  );
}
