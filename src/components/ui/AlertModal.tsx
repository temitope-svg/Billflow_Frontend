import { CheckCircle2, AlertTriangle, Info, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

export type AlertTone = 'success' | 'error' | 'info' | 'danger'

export interface AlertModalProps {
  open: boolean
  onClose: () => void
  tone?: AlertTone
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  loading?: boolean
  icon?: LucideIcon
}

const toneStyles: Record<
  AlertTone,
  { iconWrap: string; icon: LucideIcon; confirmClass?: string }
> = {
  success: {
    iconWrap: 'bg-emerald-50 text-emerald-600',
    icon: CheckCircle2,
  },
  error: {
    iconWrap: 'bg-red-50 text-red-600',
    icon: AlertTriangle,
  },
  info: {
    iconWrap: 'bg-indigo-50 text-brand',
    icon: Info,
  },
  danger: {
    iconWrap: 'bg-red-50 text-red-600',
    icon: Trash2,
    confirmClass: 'border-red-600 bg-red-600 text-white hover:bg-red-700',
  },
}

export function AlertModal({
  open,
  onClose,
  tone = 'info',
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  loading = false,
  icon,
}: AlertModalProps) {
  const style = toneStyles[tone]
  const Icon = icon ?? style.icon
  const isConfirm = Boolean(onConfirm && confirmLabel)

  return (
    <Modal open={open} onClose={loading ? () => undefined : onClose} showClose={!isConfirm}>
      <div className="p-6">
        <div className="mb-5 flex items-start gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 pt-0.5 pr-6">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{message}</p>
          </div>
        </div>

        {isConfirm ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              disabled={loading}
              onClick={onClose}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              className={`flex-1 ${style.confirmClass ?? ''}`}
              disabled={loading}
              onClick={onConfirm}
            >
              {loading ? 'Please wait…' : confirmLabel}
            </Button>
          </div>
        ) : (
          <Button type="button" fullWidth onClick={onClose}>
            Got it
          </Button>
        )}
      </div>
    </Modal>
  )
}
