"use client";

import Link from "next/link";
import { useState } from "react";
import { useSignUp } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signupSchema, type SignupValues } from "@/lib/validations/auth";
import { useToast } from "@/hooks/use-toast";
import { PawPrint } from "lucide-react";

export default function SignupPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: SignupValues) {
    if (!isLoaded) return;
    setIsPending(true);
    try {
      await signUp.create({ emailAddress: values.email, password: values.password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message: string }> };
      const msg = clerkErr?.errors?.[0]?.message ?? "가입에 실패했습니다";
      toast({ title: "가입 실패", description: msg, variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  }

  async function onVerify() {
    if (!isLoaded) return;
    setIsPending(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/onboarding");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message: string }> };
      const msg = clerkErr?.errors?.[0]?.message ?? "인증에 실패했습니다";
      toast({ title: "인증 실패", description: msg, variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <PawPrint className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">이메일 인증</CardTitle>
            <CardDescription>이메일로 발송된 6자리 코드를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="인증 코드 6자리"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isPending}
              maxLength={6}
            />
            <Button onClick={onVerify} className="w-full" disabled={isPending || code.length < 6}>
              {isPending ? "확인 중..." : "인증 완료"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <PawPrint className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">PUPPY NOTE</CardTitle>
          <CardDescription>새 계정을 만들고 매장을 등록하세요</CardDescription>
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
                      <Input type="email" placeholder="example@email.com" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="8자 이상" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 확인</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="비밀번호 재입력" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "가입 중..." : "가입하기"}
              </Button>
            </form>
          </Form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="underline hover:text-foreground">
              로그인
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
