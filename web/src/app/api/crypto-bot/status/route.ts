import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchBotData, OFFLINE_STATUS } from "@/lib/bot-client";

/**
 * GET /api/crypto-bot/status
 * BFF proxy — returns live status from the Python Crypto Worker.
 * Falls back to mock standby data while the worker is not yet deployed.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  // Attempt live fetch; OFFLINE_STATUS returned automatically if worker is down
  const data = await fetchBotData("/crypto/status");

  // Mock overlay: if backend is not configured, return structured standby data
  if (data.status === "offline" && !process.env.PYTHON_BACKEND_URL) {
    return NextResponse.json({
      ...OFFLINE_STATUS,
      vertical: "crypto",
      coins: ["SOL", "BTC", "TAO", "RENDER", "FET"],
      note: "Worker not yet deployed — standby mode",
    });
  }

  return NextResponse.json({ ...data, vertical: "crypto" });
}
