"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Bell, Settings, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "대시보드" },
  { href: "/customers", icon: Users, label: "반려동물 / 고객" },
  { href: "/reservations", icon: CalendarDays, label: "예약 관리" },
  { href: "/notifications", icon: Bell, label: "알림장 관리" },
  { href: "/settings", icon: Settings, label: "설정" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col flex-1 overflow-hidden bg-sidebar">
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/puppy-note-logo.png" alt="" width={26} height={26} className="rounded-md object-cover" />
        <span className="font-bold text-sm tracking-tight">PUPPY NOTE</span>
      </div>
      <nav className="flex-1 p-2.5 space-y-0.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors",
                active
                  ? "bg-white font-semibold text-foreground border border-border/60 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  : "text-[#5a6048] hover:bg-white/60 font-medium"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
