import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { optimizeImage } from "@/lib/image/optimize";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  // Auth check using anon client
  const anonSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { user } } = await anonSupabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: member } = await anonSupabase
    .from("store_members")
    .select("store_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!member) {
    return NextResponse.json({ error: "No store found" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const customerId = formData.get("customerId") as string | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const optimized = await optimizeImage(buffer);

  const fileName = `${member.store_id}/${customerId ?? "general"}/${Date.now()}.webp`;

  const { error: uploadError } = await supabase.storage
    .from("pet-photos")
    .upload(fileName, optimized, { contentType: "image/webp", upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: signedUrlData } = await supabase.storage
    .from("pet-photos")
    .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days

  return NextResponse.json({ url: signedUrlData?.signedUrl ?? "", path: fileName });
}
