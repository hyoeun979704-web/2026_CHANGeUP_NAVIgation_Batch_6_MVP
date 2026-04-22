"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ChevronRight } from "lucide-react";

export function LogoutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => signOut(() => router.push("/login"))}
      className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors text-sm text-destructive"
    >
      <span className="flex items-center gap-2"><LogOut className="h-4 w-4" />로그아웃</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
