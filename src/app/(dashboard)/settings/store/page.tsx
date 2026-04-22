import Link from "next/link";
import { getCurrentStore } from "@/actions/stores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default async function StoreEditPage() {
  const store = await getCurrentStore();
  if (!store) return null;

  const storeTypeLabels: Record<string, string> = {
    grooming: "미용실",
    daycare: "데이케어",
    kindergarten: "유치원",
    mixed: "복합 서비스",
  };

  return (
    <div className="space-y-5 max-w-xl">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link href="/settings"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-xl font-bold">매장 정보 수정</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>매장 이름 *</Label>
            <Input defaultValue={store.name} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>업종</Label>
              <Input defaultValue={storeTypeLabels[store.store_type] ?? store.store_type} />
            </div>
            <div className="space-y-1.5">
              <Label>연락처</Label>
              <Input defaultValue={store.phone ?? ""} placeholder="041-000-0000" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-1">
        <Button className="flex-1">변경사항 저장</Button>
        <Button variant="outline" asChild><Link href="/settings">취소</Link></Button>
      </div>

      <p className="text-xs text-muted-foreground">
        * 매장 정보 수정 기능은 추후 업데이트 예정입니다.
      </p>
    </div>
  );
}
