import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentStore } from "@/actions/stores";
import { StoreEditForm } from "@/components/settings/StoreEditForm";
import { redirect } from "next/navigation";

export default async function StoreEditPage() {
  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  return (
    <div className="space-y-5 max-w-xl">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link href="/settings"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-xl font-bold">매장 정보 수정</h1>
      </div>

      <StoreEditForm store={store} />
    </div>
  );
}
