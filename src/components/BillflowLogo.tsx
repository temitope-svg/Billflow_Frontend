export function BillflowLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="1" y="1" width="4" height="6" rx="1" fill="white" opacity=".95" />
      <rect x="8" y="1" width="4" height="3.5" rx="1" fill="white" opacity=".7" />
      <rect x="8" y="6" width="4" height="5.5" rx="1" fill="white" opacity=".85" />
      <rect x="1" y="9" width="4" height="3.5" rx="1" fill="white" opacity=".55" />
    </svg>
  )
}

export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-md bg-brand ${className}`}
      style={{ width: 24, height: 24 }}
    >
      <BillflowLogo size={14} />
    </div>
  )
}

export function LogoBrand({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-semibold text-slate-900 ${className}`}>
      <LogoMark />
      <span>Billflow</span>
    </div>
  )
}
