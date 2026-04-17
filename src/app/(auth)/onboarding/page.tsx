"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createStore } from "@/actions/stores";
import { PawPrint } from "lucide-react";

const STORE_TYPES = [
  { value: "grooming", label: "반려동물 미용실" },
  { value: "daycare", label: "반려동물 데이케어" },
  { value: "kindergarten", label: "반려동물 유치원" },
  { value: "mixed", label: "복합 서비스" },
] as const;

export default function OnboardingPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [storeType, setStoreType] = useState("grooming");

  async function handleSubmit(formData: FormData) {
    formData.set("store_type", storeType);
    setError(null);
    startTransition(async () => {
      const result = await createStore(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <PawPrint className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">매장 정보 등록</CardTitle>
          <CardDescription>
            매장 정보를 입력하면 바로 시작할 수 있어요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store_type">매장 유형</Label>
              <Select value={storeType} onValueChange={setStoreType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STORE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">매장 이름 *</Label>
              <Input
                id="name"
                name="name"
                placeholder="예: 행복한 펫 미용실"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">연락처</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="041-000-0000"
                disabled={isPending}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "등록 중..." : "매장 등록 후 시작하기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
