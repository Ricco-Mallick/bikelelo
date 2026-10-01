import type { ReactNode } from 'react'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { CompareTray } from '@/components/common/CompareTray'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 pb-24">{children}</main>
      <SiteFooter />
      <CompareTray />
    </div>
  )
}
