import { redirect } from "next/navigation";
import { getCurrentStore } from "@/actions/stores";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  // Server-side: if store already exists, skip onboarding
  const store = await getCurrentStore();
  if (store) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <OnboardingForm />
    </div>
  );
}
