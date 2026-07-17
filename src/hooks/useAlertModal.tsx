import { useCallback, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertModal, type AlertTone } from '../components/ui/AlertModal'

type FeedbackState = {
  tone: AlertTone
  title: string
  message: string
  onClose?: () => void
}

export type ConfirmOptions = {
  tone?: AlertTone
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  icon?: LucideIcon
  onConfirm: () => void | Promise<void>
}

export function useAlertModal() {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const showSuccess = useCallback((title: string, message: string, onClose?: () => void) => {
    setFeedback({ tone: 'success', title, message, onClose })
  }, [])

  const showError = useCallback((title: string, message: string, onClose?: () => void) => {
    setFeedback({ tone: 'error', title, message, onClose })
  }, [])

  const showInfo = useCallback((title: string, message: string, onClose?: () => void) => {
    setFeedback({ tone: 'info', title, message, onClose })
  }, [])

  const askConfirm = useCallback((options: ConfirmOptions) => {
    setConfirm(options)
  }, [])

  const closeConfirm = useCallback(() => {
    if (confirmLoading) return
    setConfirm(null)
  }, [confirmLoading])

  const closeFeedback = () => {
    const onClose = feedback?.onClose
    setFeedback(null)
    onClose?.()
  }

  const runConfirm = async () => {
    if (!confirm) return
    setConfirmLoading(true)
    try {
      await confirm.onConfirm()
    } finally {
      setConfirmLoading(false)
      setConfirm(null)
    }
  }

  const AlertHost = (
    <>
      <AlertModal
        open={Boolean(feedback)}
        onClose={closeFeedback}
        tone={feedback?.tone ?? 'info'}
        title={feedback?.title ?? ''}
        message={feedback?.message ?? ''}
      />
      <AlertModal
        open={Boolean(confirm)}
        onClose={closeConfirm}
        tone={confirm?.tone ?? 'info'}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.confirmLabel}
        cancelLabel={confirm?.cancelLabel}
        icon={confirm?.icon}
        loading={confirmLoading}
        onConfirm={confirm ? () => void runConfirm() : undefined}
      />
    </>
  )

  return {
    showSuccess,
    showError,
    showInfo,
    askConfirm,
    AlertHost,
  }
}
