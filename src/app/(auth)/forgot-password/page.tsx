"use client";

import { useState } from "react";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, PawPrint } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emailSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해 주세요"),
});

const resetSchema = z.object({
  code: z.string().min(6, "코드를 입력해 주세요"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다"),
});

export default function ForgotPasswordPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [isPending, setIsPending] = useState(false);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { code: "", password: "" },
  });

  async function onRequestReset({ email }: z.infer<typeof emailSchema>) {
    if (!isLoaded) return;
    setIsPending(true);
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: email });
      setStep("reset");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message: string }> };
      const msg = clerkErr?.errors?.[0]?.message ?? "이메일 전송에 실패했습니다";
      toast({ title: "실패", description: msg, variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  }

  async function onReset({ code, password }: z.infer<typeof resetSchema>) {
    if (!isLoaded) return;
    setIsPending(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message: string }> };
      const msg = clerkErr?.errors?.[0]?.message ?? "비밀번호 재설정에 실패했습니다";
      toast({ title: "실패", description: msg, variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <PawPrint className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {step === "email" ? "비밀번호 재설정" : "새 비밀번호 설정"}
          </CardTitle>
          <CardDescription>
            {step === "email"
              ? "가입 시 사용한 이메일을 입력하세요"
              : "이메일로 발송된 코드와 새 비밀번호를 입력하세요"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "email" && (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onRequestReset)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="example@email.com" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                  <Mail className="h-4 w-4 mr-2" />
                  {isPending ? "전송 중..." : "재설정 코드 받기"}
                </Button>
              </form>
            </Form>
          )}

          {step === "reset" && (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
                <FormField
                  control={resetForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>인증 코드</FormLabel>
                      <FormControl>
                        <Input placeholder="6자리 코드" maxLength={6} disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={resetForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>새 비밀번호</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="8자 이상" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "변경 중..." : "비밀번호 변경"}
                </Button>
              </form>
            </Form>
          )}

          <Link href="/login" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" />로그인으로 돌아가기
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
