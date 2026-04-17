"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIDraftEditor } from "./AIDraftEditor";
import { useToast } from "@/hooks/use-toast";
import type { Customer } from "@/types/database";
import { Camera, Sparkles, AlertTriangle } from "lucide-react";

interface NotificationFormProps {
  customers: Customer[];
  defaultCustomerId?: string;
}

export function NotificationForm({ customers, defaultCustomerId }: NotificationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedCustomerId, setSelectedCustomerId] = useState(defaultCustomerId ?? "");
  const [keywords, setKeywords] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [generationMeta, setGenerationMeta] = useState<{
    latencyMs: number;
    tokensUsed?: number;
    imageUrl?: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleGenerate() {
    if (!selectedCustomerId) {
      toast({ title: "반려동물을 선택해 주세요", variant: "destructive" });
      return;
    }
    if (!keywords.trim()) {
      toast({ title: "오늘 서비스 키워드를 입력해 주세요", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      let imageUrl = "";

      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        fd.append("customerId", selectedCustomerId);
        const uploadRes = await fetch("/api/upload-image", { method: "POST", body: fd });
        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          toast({ title: "사진 업로드 실패", description: data.error, variant: "destructive" });
          return;
        }
        const { url } = await uploadRes.json();
        imageUrl = url;
      }

      const res = await fetch("/api/generate-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: selectedCustomerId, keywords, imageUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "AI 생성 실패", description: data.error, variant: "destructive" });
        return;
      }

      setDraft(data.draft);
      setGenerationMeta({ latencyMs: data.latencyMs, tokensUsed: data.tokensUsed, imageUrl });
    });
  }

  if (draft !== null && generationMeta) {
    return (
      <AIDraftEditor
        draft={draft}
        customerId={selectedCustomerId}
        keywords={keywords}
        imageUrl={generationMeta.imageUrl}
        latencyMs={generationMeta.latencyMs}
        tokensUsed={generationMeta.tokensUsed}
        onReset={() => { setDraft(null); setGenerationMeta(null); }}
      />
    );
  }

  return (
    <div className="max-w-xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">반려동물 선택</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
            <SelectTrigger>
              <SelectValue placeholder="반려동물을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.pet_name} ({c.owner_name} 보호자)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCustomer?.allergies && (
            <div className="flex items-start gap-2 p-2 bg-orange-50 rounded-md border border-orange-200">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
              <div className="text-xs text-orange-800">
                <span className="font-medium">알러지 정보:</span> {selectedCustomer.allergies}
                <p className="text-orange-600 mt-0.5">AI 초안에 자동 반영됩니다</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">오늘 서비스</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>서비스 키워드 *</Label>
            <Input
              placeholder="예: 목욕, 전체미용, 발톱정리 완료, 상태 양호"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>사진 첨부 (선택)</Label>
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative w-full aspect-video">
                  <Image src={imagePreview} alt="preview" fill className="object-contain rounded" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Camera className="h-8 w-8" />
                  <p className="text-sm">클릭하여 사진 추가</p>
                  <p className="text-xs">최대 10MB (자동 WebP 최적화)</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleGenerate}
        disabled={isPending}
        className="w-full gap-2"
        size="lg"
      >
        <Sparkles className="h-4 w-4" />
        {isPending ? "AI 초안 생성 중..." : "알림장 초안 생성"}
      </Button>

      {isPending && (
        <p className="text-center text-sm text-muted-foreground">
          AI가 {selectedCustomer?.pet_name}의 정보를 바탕으로 초안을 작성하고 있습니다...
        </p>
      )}
    </div>
  );
}
