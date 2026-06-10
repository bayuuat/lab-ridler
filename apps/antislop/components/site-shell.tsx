import type { ReactNode } from 'react'

import { SiteHeader } from '@/components/site-header'

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="container py-10">{children}</main>
    </div>
  )
}
