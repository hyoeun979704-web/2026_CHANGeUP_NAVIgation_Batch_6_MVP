"use client";

import { useTransition } from "react";
import { LogOut, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth";
import type { Store } from "@/types/database";

export function Topbar({ store }: { store: Store | null }) {
  const [isPending, startTransition] = useTransition();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-background md:hidden sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <PawPrint className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">{store?.name ?? "PetNoti"}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        disabled={isPending}
        onClick={() => startTransition(() => logout())}
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  );
}

export function SidebarFooter({ store }: { store: Store | null }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="p-3 border-t">
      <p className="text-xs text-muted-foreground px-2 mb-2 truncate">{store?.name ?? ""}</p>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-muted-foreground"
        disabled={isPending}
        onClick={() => startTransition(() => logout())}
      >
        <LogOut className="h-4 w-4" />
        로그아웃
      </Button>
    </div>
  );
}
