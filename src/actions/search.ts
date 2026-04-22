"use server";

import { sql } from "@/lib/db";
import { getCurrentStore } from "./stores";

export interface SearchResult {
  type: "customer" | "notification";
  id: string;
  title: string;
  sub: string;
  href: string;
}

export async function searchGlobal(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const store = await getCurrentStore();
  if (!store) return [];

  const q = `%${query.trim()}%`;

  const [customers, notifications] = await Promise.all([
    sql`
      SELECT id, pet_name, breed, owner_name FROM customers
      WHERE store_id = ${store.id}
        AND (pet_name ILIKE ${q} OR owner_name ILIKE ${q} OR breed ILIKE ${q})
      LIMIT 5
    `,
    sql`
      SELECT n.id, n.keywords, n.final_text, n.ai_draft, c.pet_name
      FROM notifications n
      JOIN customers c ON c.id = n.customer_id
      WHERE n.store_id = ${store.id}
        AND (n.keywords ILIKE ${q} OR n.final_text ILIKE ${q})
      LIMIT 4
    `,
  ]);

  const results: SearchResult[] = [];

  for (const c of customers as Array<{ id: string; pet_name: string; breed: string | null; owner_name: string }>) {
    results.push({
      type: "customer",
      id: c.id,
      title: c.pet_name,
      sub: `${c.breed ?? ""} · ${c.owner_name} 보호자`,
      href: `/customers/${c.id}`,
    });
  }

  for (const n of notifications as Array<{ id: string; keywords: string; final_text: string | null; ai_draft: string | null; pet_name: string }>) {
    const preview = (n.final_text ?? n.ai_draft ?? n.keywords).slice(0, 50);
    results.push({
      type: "notification",
      id: n.id,
      title: n.pet_name ?? "알림장",
      sub: preview,
      href: `/notifications/${n.id}`,
    });
  }

  return results;
}
