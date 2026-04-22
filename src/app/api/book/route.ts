import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { publicBookingSchema } from "@/lib/validations/reservation";

export async function POST(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "매장을 찾을 수 없습니다" }, { status: 400 });
  }

  const stores = await sql`SELECT id FROM stores WHERE slug = ${slug} LIMIT 1`;
  const store = stores[0] as { id: string } | undefined;
  if (!store) {
    return NextResponse.json({ error: "매장을 찾을 수 없습니다" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }

  const parsed = publicBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요" },
      { status: 422 }
    );
  }

  const d = parsed.data;

  // 같은 전화번호 24시간 내 3건 초과 방지
  const recentCount = await sql`
    SELECT COUNT(*)::int AS cnt FROM reservations
    WHERE store_id = ${store.id}
      AND guest_phone = ${d.guest_phone}
      AND created_at > NOW() - INTERVAL '24 hours'
  `;
  if ((recentCount[0] as { cnt: number }).cnt >= 3) {
    return NextResponse.json(
      { error: "예약 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요" },
      { status: 429 }
    );
  }

  try {
    const rows = await sql`
      INSERT INTO reservations (
        store_id, scheduled_at, duration_min, services,
        status, notes, guest_name, guest_phone
      ) VALUES (
        ${store.id}, ${d.scheduled_at}, ${d.duration_min},
        ${JSON.stringify(d.services)}, 'pending',
        ${d.notes ?? null}, ${d.guest_name}, ${d.guest_phone}
      )
      RETURNING id, scheduled_at
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err: unknown) {
    const pgErr = err as { code?: string };
    if (pgErr?.code === "23505") {
      return NextResponse.json(
        { error: "이미 해당 시간에 예약이 있습니다. 다른 시간을 선택해 주세요" },
        { status: 409 }
      );
    }
    console.error("[POST /api/book]", err);
    return NextResponse.json({ error: "예약 처리 중 오류가 발생했습니다" }, { status: 500 });
  }
}
