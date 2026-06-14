import type { ReactNode } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-10 flex min-h-16 flex-wrap items-center gap-2 border-b bg-background/80 px-4 py-2 backdrop-blur md:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 h-6" />
      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="truncate text-base font-semibold md:text-lg">{title}</h1>
        {description ? (
          <p className="truncate text-xs text-muted-foreground md:text-sm">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  )
}
