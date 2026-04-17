import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PawPrint } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <PawPrint className="h-14 w-14 text-muted-foreground" />
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-lg font-medium">페이지를 찾을 수 없습니다</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">대시보드로 돌아가기</Link>
      </Button>
    </div>
  );
}
