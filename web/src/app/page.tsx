import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LandingHero } from "@/components/layout/LandingHero";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return <LandingHero />;
}
