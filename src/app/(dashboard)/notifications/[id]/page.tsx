import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/actions/stores";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy, Zap, Clock, CheckCheck } from "lucide-react";
import { CopyButton } from "@/components/notifications/CopyButton";
import { MarkSentButton } from "@/components/notifications/MarkSentButton";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export default async function NotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const { data: notification } = await supabase
    .from("notifications")
    .select("*, customers(pet_name, owner_name, owner_phone, allergies)")
    .eq("id", id)
    .eq("store_id", store.id)
    .single();

  if (!notification) notFound();

  const customer = notification.customers as {
    pet_name: string;
    owner_name: string;
    owner_phone: string;
    allergies: string | null;
  } | null;

  const createdAt = new Date(notification.created_at);
  const displayText = notification.final_text ?? notification.ai_draft ?? "";
  const keywords = notification.keywords
    ? notification.keywords.split(/[,、]/).map((k: string) => k.trim()).filter(Boolean)
    : [];

  const statusBadge = notification.is_sent
    ? { label: "전송 완료", variant: "default" as const }
    : notification.final_text
    ? { label: "저장됨", variant: "secondary" as const }
    : { label: "초안", variant: "outline" as const };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link href="/notifications"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold">
            {customer?.pet_name} · {createdAt.toLocaleDateString("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </h1>
          <p className="text-sm text-muted-foreground">{customer?.owner_name} 보호자 · <Badge variant={statusBadge.variant} className="text-xs">{statusBadge.label}</Badge></p>
        </div>
        <CopyButton text={displayText} />
        {!notification.is_sent && (
          <MarkSentButton notificationId={id} />
        )}
      </div>

      <div className="grid md:grid-cols-[1fr_280px] gap-4">
        {/* main content */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">알림장 내용</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap bg-muted/30 min-h-[160px]">
              {displayText || <span className="text-muted-foreground">내용 없음</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {notification.latency_ms && (
                <span className="inline-flex items-center gap-1 text-xs border rounded-full px-2.5 py-1">
                  <Zap className="h-3 w-3 text-primary" />
                  {(notification.latency_ms / 1000).toFixed(1)}초
                </span>
              )}
              {notification.final_text && (
                <span className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-2.5 py-1">
                  {notification.final_text.length}자
                </span>
              )}
              {notification.ai_draft && customer?.allergies && (
                <span className="inline-flex items-center gap-1 text-xs bg-warn border border-warn-ink/30 rounded-full px-2.5 py-1">
                  알러지 반영됨
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* sidebar */}
        <div className="space-y-3">
          {/* photo placeholder */}
          {notification.image_url && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">첨부 사진</CardTitle>
              </CardHeader>
              <CardContent>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={notification.image_url} alt="" className="w-full rounded-lg object-cover aspect-square" />
              </CardContent>
            </Card>
          )}

          {/* keywords */}
          {keywords.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">서비스 키워드</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((k: string) => (
                    <span key={k} className="text-xs bg-muted rounded px-2 py-1">{k}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">전송 이력</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Clock className="h-3 w-3 shrink-0" />
                  {formatDistanceToNow(createdAt, { addSuffix: true, locale: ko })} AI 초안 생성
                </li>
                {notification.final_text && (
                  <li className="flex items-center gap-2">
                    <Copy className="h-3 w-3 shrink-0" />
                    검수 후 저장됨
                  </li>
                )}
                {notification.is_sent && notification.sent_at && (
                  <li className="flex items-center gap-2 text-primary font-medium">
                    <CheckCheck className="h-3 w-3 shrink-0" />
                    {formatDistanceToNow(new Date(notification.sent_at), { addSuffix: true, locale: ko })} 전송 완료로 표시
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
