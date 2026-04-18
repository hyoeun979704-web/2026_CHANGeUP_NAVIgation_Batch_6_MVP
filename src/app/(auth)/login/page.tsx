"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { login } from "@/actions/auth";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import { useToast } from "@/hooks/use-toast";
import { PawPrint } from "lucide-react";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginValues) {
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        toast({ title: "로그인 실패", description: result.error, variant: "destructive" });
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <PawPrint className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">PUPPY NOTE</CardTitle>
          <CardDescription>매장 계정으로 로그인하세요</CardDescription>
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
                    <div className="flex items-center justify-between">
                      <FormLabel>비밀번호</FormLabel>
                      <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground underline">
                        비밀번호 재설정
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          </Form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            계정이 없으신가요?{" "}
            <Link href="/signup" className="underline hover:text-foreground">
              회원가입
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
