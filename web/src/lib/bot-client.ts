/**
 * Secure BFF client for communicating with Python trading workers.
 * SERVER-SIDE ONLY — never import this in Client Components.
 * All requests are authenticated via INTERNAL_API_SECRET.
 */

import { env } from "@/lib/env";

const TIMEOUT_MS = 5_000;

export interface BotStatus {
  status: "online" | "offline" | "standby" | "error";
  capital: number;
  activeTrades: number;
  mode: "live" | "standby" | "maintenance";
  lastUpdated: string;
}

export const OFFLINE_STATUS: BotStatus = {
  status: "offline",
  capital: 0,
  activeTrades: 0,
  mode: "standby",
  lastUpdated: new Date().toISOString(),
};

/**
 * Fetch data from a Python backend endpoint.
 * Returns OFFLINE_STATUS on any failure — the caller site never crashes.
 */
export async function fetchBotData(endpoint: string): Promise<BotStatus> {
  const baseUrl = env.PYTHON_BACKEND_URL;

  // No backend configured yet — return standby silently
  if (!baseUrl) {
    return OFFLINE_STATUS;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${env.INTERNAL_API_SECRET}`,
        "Content-Type": "application/json",
        "X-Spear5-Source": "bff",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { ...OFFLINE_STATUS, status: "error" };
    }

    return (await res.json()) as BotStatus;
  } catch {
    // Timeout or network failure — bot is offline, site stays up
    return OFFLINE_STATUS;
  } finally {
    clearTimeout(timeoutId);
  }
}
