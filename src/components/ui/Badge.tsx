import type { StatusBadgeStyle } from '../../utils/documentStatus'

export function Badge({ style, children }: { style: StatusBadgeStyle; children?: React.ReactNode }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${style.className}`}>
      {children ?? style.label}
    </span>
  )
}
