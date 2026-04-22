import Link from "next/link";
import { CheckCircle2, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function BookingSuccessPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <Card>
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold">예약 신청 완료</h1>
              <p className="text-sm text-muted-foreground">
                예약이 접수되었습니다.
                <br />
                확정 후 매장에서 연락드릴 예정입니다.
              </p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/book/${params.slug}`}>
                <PawPrint className="h-4 w-4 mr-2" />
                다시 예약하기
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
