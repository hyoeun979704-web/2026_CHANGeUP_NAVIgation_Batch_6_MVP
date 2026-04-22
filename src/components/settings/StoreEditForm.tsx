"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateStore } from "@/actions/stores";
import { useToast } from "@/hooks/use-toast";
import type { Store } from "@/types/database";

const STORE_TYPE_LABELS: Record<string, string> = {
  grooming: "미용실",
  daycare: "데이케어",
  kindergarten: "유치원",
  mixed: "복합 서비스",
};

export function StoreEditForm({ store }: { store: Store }) {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateStore(fd);
      if (result && "error" in result) {
        toast({ title: "오류", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "저장 완료" });
        router.refresh();
      }
    });
  }

  async function copyLink() {
    if (!store.slug) return;
    await navigator.clipboard.writeText(`${appUrl}/book/${store.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">매장 이름 *</Label>
            <Input id="name" name="name" defaultValue={store.name} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>업종</Label>
              <Input
                value={STORE_TYPE_LABELS[store.store_type] ?? store.store_type}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">연락처</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={store.phone ?? ""}
                placeholder="041-000-0000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            공개 예약 링크
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="slug">예약 페이지 주소</Label>
            <div className="flex gap-0">
              <span className="flex items-center text-sm text-muted-foreground bg-muted px-3 rounded-l-md border border-r-0 whitespace-nowrap">
                /book/
              </span>
              <Input
                id="slug"
                name="slug"
                defaultValue={store.slug ?? ""}
                placeholder="my-grooming-shop"
                className="rounded-l-none"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              영문 소문자, 숫자, 하이픈(-) 만 사용. 예: puppy-salon-bucheon
            </p>
          </div>
          {store.slug && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="text-xs font-mono flex-1 truncate text-muted-foreground">
                {appUrl}/book/{store.slug}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={copyLink}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-1">
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "저장 중..." : "변경사항 저장"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/settings">취소</Link>
        </Button>
      </div>
    </form>
  );
}
