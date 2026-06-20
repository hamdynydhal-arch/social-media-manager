import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginCard } from "@/components/shared/LoginCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  const session = await auth();
  if (session?.user) redirect(searchParams.callbackUrl ?? "/dashboard");

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(34,197,94,0.3) 0%, transparent 60%)",
      }} />
      <LoginCard callbackUrl={searchParams.callbackUrl} error={searchParams.error} />
    </div>
  );
}
