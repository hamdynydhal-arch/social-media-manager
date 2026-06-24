// TODO: Re-enable strict authentication and live DB queries after UI development phase
import { PortfolioOverview } from "@/components/dashboard/PortfolioOverview";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "نظرة عامة — Spear5" };

export default function DashboardPage() {
  return <PortfolioOverview />;
}
