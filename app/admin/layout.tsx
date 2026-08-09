import { getSession } from "@/lib/auth/session";
import { requireSuperAdmin } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";

// Server-side layout protection: only SUPER_ADMIN can access /admin/*
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const { authorized } = await requireSuperAdmin(session);

  if (!authorized) {
    // Redirect non-super-admins to their normal dashboard
    // Non-authenticated users → login
    if (!session) {
      redirect("/login?from=/admin");
    }
    redirect("/dashboard");
  }

  return <>{children}</>;
}