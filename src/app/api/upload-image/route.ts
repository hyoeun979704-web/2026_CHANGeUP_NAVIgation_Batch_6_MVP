import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { optimizeImage } from "@/lib/image/optimize";
import { getCurrentStore } from "@/actions/stores";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await getCurrentStore();
  if (!store) return NextResponse.json({ error: "No store found" }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const customerId = formData.get("customerId") as string | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const optimized = await optimizeImage(buffer);

  const fileName = `pet-photos/${store.id}/${customerId ?? "general"}/${Date.now()}.webp`;

  const blob = await put(fileName, optimized, {
    access: "public",
    contentType: "image/webp",
  });

  return NextResponse.json({ url: blob.url, path: fileName });
}
