import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCurrentStore } from "@/actions/stores";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar, SidebarFooter } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { GlobalSearch } from "@/components/layout/GlobalSearch";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex md:flex-col w-56 shrink-0 border-r bg-sidebar h-screen sticky top-0">
        <Sidebar />
        <SidebarFooter store={store} />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar store={store} />
        <div className="hidden md:flex items-center h-11 px-6 border-b bg-background gap-3">
          <GlobalSearch />
        </div>
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
