"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Bell, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "대시보드" },
  { href: "/customers", icon: Users, label: "반려동물 / 고객" },
  { href: "/notifications", icon: Bell, label: "알림장 관리" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-4 border-b">
        <PawPrint className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">PetNoti</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Button
            key={href}
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start gap-2",
              pathname.startsWith(href) && "bg-accent text-accent-foreground"
            )}
          >
            <Link href={href}>
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          </Button>
        ))}
      </nav>
    </aside>
  );
}
