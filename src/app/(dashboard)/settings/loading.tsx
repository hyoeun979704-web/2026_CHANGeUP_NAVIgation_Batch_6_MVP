import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Skeleton className="h-7 w-16" />
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex items-center gap-3 px-5 py-4 ${i < 4 ? "border-b" : ""}`}>
              <Skeleton className="h-4 w-4 rounded" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
