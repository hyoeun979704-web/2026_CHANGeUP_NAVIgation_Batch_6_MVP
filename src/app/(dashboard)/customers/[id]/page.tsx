import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/actions/stores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ServiceLogForm } from "@/components/customers/ServiceLogForm";
import { ChevronLeft, Pencil, Bell, AlertTriangle } from "lucide-react";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const store = await getCurrentStore();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("store_id", store!.id)
    .single();

  if (!customer) notFound();

  const { data: logs } = await supabase
    .from("service_logs")
    .select("*")
    .eq("customer_id", id)
    .order("service_date", { ascending: false });

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/customers"><ChevronLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{customer.pet_name}</h1>
          <p className="text-sm text-muted-foreground">{customer.owner_name} 보호자</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/customers/${id}/edit`}>
              <Pencil className="h-4 w-4 mr-1" />수정
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/notifications/new?customerId=${id}`}>
              <Bell className="h-4 w-4 mr-1" />알림장 생성
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">반려동물 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="이름" value={customer.pet_name} />
            <Row label="견종" value={customer.breed} />
            <Row label="생년월일" value={customer.pet_birthday} />
            <Row label="체중" value={customer.pet_weight_kg ? `${customer.pet_weight_kg}kg` : null} />
            <Row label="중성화" value={customer.neutered === true ? "완료" : customer.neutered === false ? "미완료" : null} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">보호자 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="이름" value={customer.owner_name} />
            <Row label="연락처" value={customer.owner_phone} />
          </CardContent>
        </Card>
      </div>

      {(customer.allergies || customer.medical_notes || customer.special_notes) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              안전 정보 (AI 프롬프트에 자동 반영)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {customer.allergies && <Row label="알러지" value={customer.allergies} valueClass="text-red-700 font-medium" />}
            {customer.medical_notes && <Row label="의료 기록" value={customer.medical_notes} />}
            {customer.special_notes && <Row label="특이사항" value={customer.special_notes} />}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">서비스 이력 기록</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceLogForm customerId={id} />
        </CardContent>
      </Card>

      {logs && logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">방문 이력</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {logs.map((log) => (
              <div key={log.id} className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    {format(new Date(log.service_date), "yyyy년 M월 d일 (E)", { locale: ko })}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(log.services as string[]).map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
                {log.notes && <p className="mt-1 text-xs text-muted-foreground">{log.notes}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string | null | undefined; valueClass?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={valueClass}>{value ?? "-"}</span>
    </div>
  );
}
