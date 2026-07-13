import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>{children}</div>
  )
}

export function SectionHead({ children, badge }: { children: ReactNode; badge?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold text-slate-900">
      {children}
      {badge}
    </div>
  )
}
