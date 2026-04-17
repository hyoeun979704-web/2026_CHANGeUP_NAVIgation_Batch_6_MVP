"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">오류가 발생했습니다</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error.message || "예상치 못한 오류가 발생했습니다. 다시 시도해 주세요."}
        </p>
      </div>
      <Button onClick={reset} variant="outline" size="sm">
        다시 시도
      </Button>
    </div>
  );
}
