"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createStore } from "@/actions/stores";
import { onboardingSchema, type OnboardingValues } from "@/lib/validations/auth";
import { useToast } from "@/hooks/use-toast";
import { PawPrint } from "lucide-react";

const STORE_TYPES = [
  { value: "grooming", label: "반려동물 미용실" },
  { value: "daycare", label: "반려동물 데이케어" },
  { value: "kindergarten", label: "반려동물 유치원" },
  { value: "mixed", label: "복합 서비스" },
] as const;

export default function OnboardingForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: "", phone: "", store_type: "grooming" },
  });

  function onSubmit(values: OnboardingValues) {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("phone", values.phone ?? "");
    formData.set("store_type", values.store_type);

    startTransition(async () => {
      const result = await createStore(formData);
      if (result?.error) {
        toast({ title: "매장 등록 실패", description: result.error, variant: "destructive" });
      }
    });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <PawPrint className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">매장 정보 등록</CardTitle>
        <CardDescription>매장 정보를 입력하면 바로 시작할 수 있어요</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="store_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>매장 유형</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="유형 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STORE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>매장 이름 *</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 행복한 펫 미용실" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>연락처</FormLabel>
                  <FormControl>
                    <Input placeholder="041-000-0000" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "등록 중..." : "매장 등록 후 시작하기"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
