"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { searchGlobal, type SearchResult } from "@/actions/search";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    startTransition(async () => {
      const r = await searchGlobal(query.trim());
      setResults(r);
    });
  }, [query]);

  function handleSelect(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const customers = results.filter((r) => r.type === "customer");
  const notifications = results.filter((r) => r.type === "notification");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 h-8 text-sm text-muted-foreground border rounded-lg bg-background hover:bg-muted/50 transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span>검색...</span>
        <span className="ml-2 text-xs font-mono border rounded px-1">⌘K</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-lg overflow-hidden gap-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              placeholder="반려동물, 알림장 검색..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-xs text-muted-foreground border rounded px-1 font-mono">ESC</button>
            )}
          </div>

          {results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto py-2">
              {customers.length > 0 && (
                <>
                  <p className="px-4 py-1.5 text-xs text-muted-foreground uppercase tracking-wider font-mono">반려동물 · {customers.length}</p>
                  {customers.map((r) => (
                    <button key={r.id} onClick={() => handleSelect(r.href)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 text-left">
                      <div className="w-7 h-7 rounded-full bg-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{r.title}</p>
                        <p className="text-xs text-muted-foreground">{r.sub}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">↵</span>
                    </button>
                  ))}
                </>
              )}
              {notifications.length > 0 && (
                <>
                  <p className="px-4 py-1.5 text-xs text-muted-foreground uppercase tracking-wider font-mono">알림장 · {notifications.length}</p>
                  {notifications.map((r) => (
                    <button key={r.id} onClick={() => handleSelect(r.href)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 text-left">
                      <div className="w-5 h-5 border rounded shrink-0 flex items-center justify-center text-xs">📝</div>
                      <p className="flex-1 text-sm truncate">{r.sub}</p>
                      <span className="text-xs text-muted-foreground">↵</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          ) : query ? (
            <div className="py-10 text-center text-sm text-muted-foreground">결과 없음</div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">검색어를 입력하세요</div>
          )}

          <div className="flex gap-4 px-4 py-2 border-t text-xs text-muted-foreground font-mono">
            <span>↑↓ 이동</span><span>↵ 선택</span><span>⌘K 닫기</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
