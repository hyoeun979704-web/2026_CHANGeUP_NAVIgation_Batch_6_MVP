import Link from "next/link";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function NewCustomerPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/customers"><ChevronLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold">새 고객 등록</h1>
      </div>
      <CustomerForm />
    </div>
  );
}
