"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Mail, ArrowLeft } from "lucide-react";

const schema = z.object({
  email: z.string().email("유효한 이메일을 입력해 주세요"),
});

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState<string | null>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  function onSubmit({ email }: z.infer<typeof schema>) {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      });
      setSent(email);
    });
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-7 w-7 text-primary" />
              </div>
            </div>
            <CardTitle>메일을 확인해주세요</CardTitle>
            <CardDescription>
              <span className="font-semibold text-foreground">{sent}</span>
              <br />위 주소로 재설정 링크를 보냈습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => startTransition(async () => {
                const supabase = createClient();
                await supabase.auth.resetPasswordForEmail(sent, {
                  redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
                });
              })}
              disabled={isPending}
            >
              다시 보내기
            </Button>
            <Link href="/login" className="block text-sm text-muted-foreground text-center hover:text-foreground underline">
              로그인으로 돌아가기
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>비밀번호 재설정</CardTitle>
          <CardDescription>
            가입 시 사용한 이메일로 재설정 링크를 보내드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input placeholder="example@email.com" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "전송 중..." : "재설정 링크 보내기"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center">
            <Link href="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              로그인으로 돌아가기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
