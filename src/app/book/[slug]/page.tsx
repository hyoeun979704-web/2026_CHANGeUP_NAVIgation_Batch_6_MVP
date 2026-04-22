import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { PublicBookingForm } from "@/components/reservations/PublicBookingForm";
import { PawPrint } from "lucide-react";

export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const rows = await sql`
    SELECT id, name, store_type FROM stores WHERE slug = ${slug} LIMIT 1
  `;
  const store = rows[0] as { id: string; name: string; store_type: string } | undefined;
  if (!store) notFound();

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="w-full max-w-md space-y-6 pt-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <PawPrint className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{store.name}</h1>
          <p className="text-sm text-muted-foreground">예약 신청</p>
        </div>

        <PublicBookingForm slug={slug} storeName={store.name} />
      </div>
    </div>
  );
}
