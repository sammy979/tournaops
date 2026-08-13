import { cookies } from "next/headers";
import { validateToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getServerUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tournaops_session")?.value;
  if (!token) return null;
  try {
    const { user } = validateToken(token);
    return user;
  } catch { return null; }
}

export async function requireServerUser() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login");
  return user;
}