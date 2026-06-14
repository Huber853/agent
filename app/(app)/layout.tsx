import type { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { api } from "@/lib/api"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const subjects = await api.subjects()

  return (
    <SidebarProvider>
      <AppSidebar subjects={subjects} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
