import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { auth } from "@/lib/auth";

// TODO: Re-enable strict authentication after UI development phase
const DEV_USER = {
  id: "dev-preview",
  name: "مدير الثروة",
  email: "preview@spear5.dev",
  image: null as string | null,
  isSuperAdmin: false,
};

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  // TODO: Re-enable strict authentication after UI development phase
  // const session = await auth();
  // if (!session?.user) redirect("/login");
  // if (!session.user.isActive) redirect("/login?error=AccountDisabled");
  let user: typeof DEV_USER;
  try {
    const session = await auth();
    user = (session?.user as typeof DEV_USER) ?? DEV_USER;
  } catch {
    user = DEV_USER;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar user={user} />
      <div className="flex-1 flex flex-col min-h-screen mr-64 max-lg:mr-0">
        <AppHeader user={user} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
