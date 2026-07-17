import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  showClose?: boolean
}

export function Modal({ open, onClose, children, className = '', showClose = true }: ModalProps) {
  if (!open) return null

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className={`animate-scale-in relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
