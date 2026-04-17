"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { NotificationWithCustomer } from "@/types/database";

export function NotificationHistory({ notifications }: { notifications: NotificationWithCustomer[] }) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">아직 생성된 알림장이 없습니다.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>반려동물</TableHead>
          <TableHead>내용 미리보기</TableHead>
          <TableHead>생성 시각</TableHead>
          <TableHead>상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {notifications.map((n) => (
          <TableRow key={n.id}>
            <TableCell>
              <div className="font-medium text-sm">{n.customers.pet_name}</div>
              <div className="text-xs text-muted-foreground">{n.customers.owner_name}</div>
            </TableCell>
            <TableCell className="max-w-xs">
              <p className="text-sm truncate text-muted-foreground">
                {n.final_text || n.ai_draft || "-"}
              </p>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {format(new Date(n.created_at), "M월 d일 HH:mm", { locale: ko })}
            </TableCell>
            <TableCell>
              {n.is_sent ? (
                <Badge variant="success">전송 완료</Badge>
              ) : n.final_text ? (
                <Badge variant="secondary">저장됨</Badge>
              ) : (
                <Badge variant="outline">초안</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
