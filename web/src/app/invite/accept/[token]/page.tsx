import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InviteAcceptClient } from "@/components/shared/InviteAcceptClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "قبول دعوة Super Admin" };

export default async function InviteAcceptPage({
  params,
}: {
  params: { token: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/invite/accept/${params.token}`);
  }

  const invite = await db.superAdminInvite.findUnique({
    where: { token: params.token },
    include: { invitedBy: { select: { name: true } } },
  });

  if (!invite) {
    return <InviteAcceptClient status="invalid" />;
  }

  if (invite.acceptedAt) {
    return <InviteAcceptClient status="already_accepted" />;
  }

  if (invite.revokedAt || invite.expiresAt < new Date()) {
    return <InviteAcceptClient status="expired" />;
  }

  if (invite.email !== session.user.email) {
    return <InviteAcceptClient status="wrong_user" expectedEmail={invite.email} />;
  }

  return (
    <InviteAcceptClient
      status="pending"
      inviterName={invite.invitedBy.name ?? "مدير"}
      token={params.token}
    />
  );
}
