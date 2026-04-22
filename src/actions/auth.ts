"use server";

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export async function logout() {
  // Clerk sign-out is handled client-side via useClerk().signOut()
  // This action is kept for compatibility but redirects to login
  redirect("/login");
}

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) redirect("/login");
  return userId;
}
