// app/dashboard/page.tsx
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import OrganizerCommandCenter from "@/components/organizer/OrganizerCommandCenter"
import CommandPalette from "@/components/CommandPalette"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session?.user) redirect("/login")

  const { role } = session.user
  if (role !== "ORGANIZER" && role !== "SUPER_ADMIN") {
    redirect("/")
  }

  return (
    <>
      <CommandPalette />
      <OrganizerCommandCenter />
    </>
  )
}