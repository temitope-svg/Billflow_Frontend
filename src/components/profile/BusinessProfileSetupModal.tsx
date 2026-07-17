import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface BusinessProfileSetupModalProps {
  open: boolean
  onSkip: () => void
  onClose: () => void
  title?: string
  description?: string
  skipLabel?: string
  hideSkip?: boolean
}

export function BusinessProfileSetupModal({
  open,
  onSkip,
  onClose,
  title = 'Finish setting up your business profile',
  description = "Add your business name and logo in your profile settings and we'll auto-fill them on every estimate, invoice and receipt — so you never have to enter them manually again.",
  skipLabel = 'Skip for now',
  hideSkip = false,
}: BusinessProfileSetupModalProps) {
  const navigate = useNavigate()

  const goToBusinessProfile = () => {
    onClose()
    navigate('/settings?tab=business')
  }

  return (
    <Modal open={open} onClose={onSkip}>
      <div className="p-6">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-brand">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          {!hideSkip && (
            <Button type="button" variant="ghost" className="flex-1" onClick={onSkip}>
              {skipLabel}
            </Button>
          )}
          <Button type="button" className="flex-1" onClick={goToBusinessProfile}>
            Set up profile
          </Button>
        </div>
      </div>
    </Modal>
  )
}
