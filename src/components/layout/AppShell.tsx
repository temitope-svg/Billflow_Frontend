import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { ProfileSetupPrompt } from '../profile/ProfileSetupPrompt'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-svh overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-6">{children}</main>
      <ProfileSetupPrompt />
    </div>
  )
}
