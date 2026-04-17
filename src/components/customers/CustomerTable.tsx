"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteCustomer } from "@/actions/customers";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, Pencil, Trash2, AlertTriangle } from "lucide-react";
import type { Customer } from "@/types/database";

export function CustomerTable({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const filtered = customers.filter(
    (c) =>
      c.pet_name.toLowerCase().includes(search.toLowerCase()) ||
      c.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.breed ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteCustomer(deleteTarget.id);
      if (result?.error) {
        toast({ title: "삭제 실패", description: result.error, variant: "destructive" });
      }
      setDeleteTarget(null);
    });
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">등록된 반려동물이 없습니다.</p>
        <p className="text-sm">새 고객을 등록해 보세요.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="이름, 견종으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>반려동물</TableHead>
            <TableHead>견종</TableHead>
            <TableHead>보호자</TableHead>
            <TableHead>알러지</TableHead>
            <TableHead>최근 방문</TableHead>
            <TableHead className="text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.pet_name}</TableCell>
              <TableCell>{c.breed ?? "-"}</TableCell>
              <TableCell>
                <div className="text-sm">{c.owner_name}</div>
                <div className="text-xs text-muted-foreground">{c.owner_phone}</div>
              </TableCell>
              <TableCell>
                {c.allergies ? (
                  <Badge variant="destructive" className="gap-1 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    {c.allergies.length > 15 ? c.allergies.slice(0, 15) + "…" : c.allergies}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">없음</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {c.last_visit_at
                  ? format(new Date(c.last_visit_at), "M월 d일", { locale: ko })
                  : "-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/customers/${c.id}`}><Eye className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/customers/${c.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(c)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>고객 삭제</DialogTitle>
            <DialogDescription>
              {deleteTarget?.pet_name}({deleteTarget?.owner_name}) 고객을 삭제합니다.
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>취소</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
