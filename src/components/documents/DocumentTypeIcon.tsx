import { ClipboardList, FileText, FileWarning, type LucideIcon } from 'lucide-react'
import receiptIcon from '../../assets/receipt.jpeg'
import type { DocumentStatus, DocumentType } from '../../types/database'
import { getDisplayStatus } from '../../utils/documentStatus'

const SIZE = {
  sm: { box: 'h-7 w-7 rounded-lg', icon: 'h-3.5 w-3.5', img: 'h-3.5 w-3.5' },
  md: { box: 'h-8 w-8 rounded-lg', icon: 'h-4 w-4', img: 'h-4 w-4' },
  lg: { box: 'h-10 w-10 rounded-lg', icon: 'h-5 w-5', img: 'h-5 w-5' },
} as const

type IconVisual = {
  bgClass: string
  iconClass: string
  Icon: LucideIcon | null
  image: string | null
}

function getVisual(
  type: DocumentType,
  status?: DocumentStatus,
  dueDate?: string | null,
): IconVisual {
  if (
    status &&
    getDisplayStatus({ document_type: type, status, due_date: dueDate }) === 'overdue'
  ) {
    return {
      bgClass: 'bg-red-100',
      iconClass: 'text-slate-700',
      Icon: FileWarning,
      image: null,
    }
  }

  if (type === 'estimate') {
    return {
      bgClass: 'bg-amber-100',
      iconClass: 'text-amber-500',
      Icon: ClipboardList,
      image: null,
    }
  }

  if (type === 'receipt') {
    return {
      bgClass: 'bg-emerald-100',
      iconClass: '',
      Icon: null,
      image: receiptIcon,
    }
  }

  return {
    bgClass: 'bg-indigo-50',
    iconClass: 'text-brand',
    Icon: FileText,
    image: null,
  }
}

export function DocumentTypeIcon({
  type,
  status,
  dueDate,
  size = 'md',
  className = '',
}: {
  type: DocumentType
  status?: DocumentStatus
  dueDate?: string | null
  size?: keyof typeof SIZE
  className?: string
}) {
  const visual = getVisual(type, status, dueDate)
  const dims = SIZE[size]

  return (
    <div
      className={`flex shrink-0 items-center justify-center ${dims.box} ${visual.bgClass} ${className}`}
      aria-hidden
    >
      {visual.image ? (
        <img src={visual.image} alt="" className={`${dims.img} object-contain`} />
      ) : (
        visual.Icon && <visual.Icon className={`${dims.icon} ${visual.iconClass}`} />
      )}
    </div>
  )
}
