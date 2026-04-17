"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signUp } from "@/actions/auth";
import { PawPrint } from "lucide-react";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const action = mode === "login" ? login : signUp;
      const result = await action(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <PawPrint className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">PetNoti</CardTitle>
          <CardDescription>
            {mode === "login" ? "매장 계정으로 로그인하세요" : "새 계정을 만드세요"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={isPending}
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "처리 중..." : mode === "login" ? "로그인" : "가입하기"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "login" ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
            <button
              type="button"
              className="underline hover:text-foreground"
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
            >
              {mode === "login" ? "회원가입" : "로그인"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
