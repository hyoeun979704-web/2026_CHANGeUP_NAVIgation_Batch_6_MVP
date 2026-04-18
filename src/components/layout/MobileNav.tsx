"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "대시보드" },
  { href: "/customers", icon: Users, label: "고객" },
  { href: "/notifications", icon: Bell, label: "알림장" },
  { href: "/settings", icon: Settings, label: "설정" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-sidebar safe-area-inset-bottom">
      <div className="flex">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors",
                active ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
