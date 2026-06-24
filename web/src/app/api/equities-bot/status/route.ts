import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchBotData, OFFLINE_STATUS } from "@/lib/bot-client";

/**
 * GET /api/equities-bot/status
 * BFF proxy — returns live status from the Python Halal Equities Worker.
 * Falls back to mock standby data while Phase 2 is not yet deployed.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  // Attempt live fetch; OFFLINE_STATUS returned automatically if worker is down
  const data = await fetchBotData("/equities/status");

  // Mock overlay: Phase 2 not yet live — return structured standby data
  if (data.status === "offline" && !process.env.PYTHON_BACKEND_URL) {
    return NextResponse.json({
      ...OFFLINE_STATUS,
      vertical: "equities",
      phase: 2,
      compliance: "Sharia-Compliant — Riba-Free Screening",
      note: "Phase 2 not yet deployed — standby mode",
    });
  }

  return NextResponse.json({ ...data, vertical: "equities" });
}
