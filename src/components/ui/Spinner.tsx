export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand ${className}`}
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner />
    </div>
  )
}
