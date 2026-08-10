// app/dashboard/command-center/page.tsx
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import OrganizerCommandCenter from "@/components/organizer/OrganizerCommandCenter"
import CommandPalette from "@/components/CommandPalette"

export default async function CommandCenterPage() {
  const session = await getSession()
  if (!session?.userId) redirect("/login")

  const role = session.role
  if (role !== "ORGANIZER" && role !== "SUPER_ADMIN") {
    redirect("/dashboard")
  }

  return (
    <>
      <CommandPalette />
      <OrganizerCommandCenter />
    </>
  )
}