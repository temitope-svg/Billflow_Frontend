import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LogoBrand } from '../BillflowLogo'

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <header className="flex justify-center border-b border-slate-200 bg-white py-3">
        <Link to="/">
          <LogoBrand />
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center p-6">{children}</div>
    </div>
  )
}
