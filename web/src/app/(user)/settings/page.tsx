import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { maskApiKey } from "@/lib/encryption";
import { SettingsClient } from "@/components/settings/SettingsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "الإعدادات" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { onboarding?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const botConfig = await db.botConfig.findUnique({
    where: { userId: session.user.id },
    select: {
      binanceApiKeyEncrypted: true,
      binanceSecretEncrypted: true,
      telegramBotTokenEncrypted: true,
      telegramChatId: true,
      riskLevel: true,
      initialCapital: true,
      currentCapital: true,
      vault: true,
      isLaunched: true,
      isLiveMode: true,
    },
  });

  const maskedSettings = {
    binanceApiKeyMasked: maskApiKey(botConfig?.binanceApiKeyEncrypted ?? null),
    binanceSecretMasked: maskApiKey(botConfig?.binanceSecretEncrypted ?? null),
    telegramBotTokenMasked: maskApiKey(botConfig?.telegramBotTokenEncrypted ?? null),
    telegramChatId: botConfig?.telegramChatId ?? "",
    riskLevel: botConfig?.riskLevel ?? "BALANCED",
    initialCapital: botConfig?.initialCapital ?? 0,
    currentCapital: botConfig?.currentCapital ?? 0,
    vault: botConfig?.vault ?? 0,
    isLaunched: botConfig?.isLaunched ?? false,
    isLiveMode: botConfig?.isLiveMode ?? false,
    hasApiKeys: !!(
      botConfig?.binanceApiKeyEncrypted && botConfig?.binanceSecretEncrypted
    ),
  };

  return (
    <SettingsClient
      settings={maskedSettings}
      isOnboarding={searchParams.onboarding === "true"}
    />
  );
}
