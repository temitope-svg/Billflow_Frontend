import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Building2, PenLine, SlidersHorizontal, LayoutTemplate, User, LogOut } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { PhoneField } from '../components/ui/PhoneField'
import { Card, SectionHead } from '../components/ui/Card'
import { PageLoader, Spinner } from '../components/ui/Spinner'
import { AccountSettingsPanel } from '../components/settings/AccountSettingsPanel'
import { SignatureSettingsPanel } from '../components/settings/SignatureSettingsPanel'
import { TemplatesSettingsPanel } from '../components/settings/TemplatesSettingsPanel'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { useAlertModal } from '../hooks/useAlertModal'
import { updateProfile } from '../services/profile'
import { uploadLogo } from '../services/storage'
import { signOut } from '../services/auth'
import { getTemplates } from '../services/documents'
import { defaultTemplateFieldFor } from '../utils/defaultTemplate'
import { CURRENCIES, CURRENCY_SYMBOLS } from '../constants/currencies'
import { DEFAULT_COUNTRY, splitPhone, type Country } from '../constants/countries'
import type { DocumentType, Template, UserProfile } from '../types/database'

const tabs = [
  { id: 'account', label: 'Account settings', icon: User },
  { id: 'business', label: 'Business profile', icon: Building2 },
  { id: 'signature', label: 'Signature', icon: PenLine },
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
] as const

type TabId = (typeof tabs)[number]['id']

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', example: '31/12/2025' },
  { value: 'MM/DD/YYYY', example: '12/31/2025' },
  { value: 'YYYY-MM-DD', example: '2025-12-31' },
  { value: 'DD MMM YYYY', example: '31 Dec 2025' },
] as const

const isTabId = (value: string | null): value is TabId =>
  tabs.some((t) => t.id === value)

export default function SettingsPage() {
  const { user } = useAuth()
  const { profile, setProfile } = useProfile()
  const { showSuccess, showError, askConfirm, AlertHost } = useAlertModal()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const tab: TabId = isTabId(tabParam) ? tabParam : 'account'
  const setTab = (id: TabId) => setSearchParams({ tab: id }, { replace: true })
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoLoadFailed, setLogoLoadFailed] = useState(false)
  const [phoneCountry, setPhoneCountry] = useState<Country>(DEFAULT_COUNTRY)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [vatInput, setVatInput] = useState('')

  const [form, setForm] = useState<Partial<UserProfile>>({})
  const [templates, setTemplates] = useState<Record<DocumentType, Template[]>>({
    estimate: [],
    invoice: [],
    receipt: [],
  })

  useEffect(() => {
    if (!profile) return
    setForm(profile)
    const { country, number } = splitPhone(profile.phone)
    setPhoneCountry(country)
    setPhoneNumber(number)
    setLogoLoadFailed(false)
    setVatInput(profile.default_vat_rate != null ? String(profile.default_vat_rate) : '')
  }, [profile])

  useEffect(() => {
    Promise.all([
      getTemplates('estimate'),
      getTemplates('invoice'),
      getTemplates('receipt'),
    ]).then(([e, i, r]) => {
      setTemplates({
        estimate: (e.data as Template[]) ?? [],
        invoice: (i.data as Template[]) ?? [],
        receipt: (r.data as Template[]) ?? [],
      })
    })
  }, [])

  const save = async (updates: Partial<UserProfile>, successMessage = 'Your changes have been saved.') => {
    if (!user) return
    setSaving(true)
    const { data, error } = await updateProfile(user.id, updates)
    setSaving(false)
    if (error) {
      showError('Could not save', error.message)
      return
    }
    if (data) setProfile(data as UserProfile)
    showSuccess('Saved', successMessage)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !user) return
    setUploadingLogo(true)
    try {
      const { url, error } = await uploadLogo(user.id, await file.arrayBuffer(), file.type)
      if (error) {
        showError('Upload failed', error.message)
        return
      }
      await save({ logo_url: url }, 'Your logo has been updated.')
      setLogoLoadFailed(false)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleBusinessSave = () => {
    const businessName = form.business_name?.trim() ?? ''
    if (!businessName) {
      showError('Required', 'Business name is required')
      return
    }
    const phone = phoneNumber.trim()
      ? `${phoneCountry.dial} ${phoneNumber.trim()}`
      : null
    void save({
      business_name: businessName,
      phone,
      website: form.website?.trim() || null,
      address: form.address?.trim() || null,
      tax_id: form.tax_id?.trim() || null,
    }, 'Your business profile has been saved.')
  }

  const handlePreferencesSave = () => {
    const trimmed = vatInput.trim()
    const vat = trimmed ? parseFloat(trimmed) : null
    if (trimmed && Number.isNaN(vat!)) {
      showError('Invalid', 'VAT rate must be a number')
      return
    }
    void save({
      currency: form.currency ?? 'NGN',
      date_format: form.date_format ?? 'DD/MM/YYYY',
      default_vat_rate: vat,
    }, 'Your preferences have been saved.')
  }

  const handleSignOut = () => {
    askConfirm({
      tone: 'info',
      title: 'Sign out?',
      message: 'You will need to sign in again to access your documents.',
      confirmLabel: 'Sign out',
      icon: LogOut,
      onConfirm: () => { void signOut() },
    })
  }

  if (!profile) return <AppShell><PageLoader /></AppShell>

  return (
    <AppShell>
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <div className="lg:w-44 lg:shrink-0">
          <h1 className="mb-3 text-base font-semibold">Settings</h1>
          <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:space-y-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-xs whitespace-nowrap lg:w-full ${
                  tab === id ? 'bg-indigo-50 font-medium text-brand' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" /> {label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-0 flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-xs whitespace-nowrap text-red-700 hover:bg-red-50 lg:mt-3 lg:w-full"
            >
              <LogOut className="h-4 w-4 shrink-0" /> Sign out
            </button>
          </nav>
        </div>

        <div className={`min-w-0 flex-1 ${tab === 'templates' ? 'max-w-2xl' : 'max-w-lg'}`}>
          {tab === 'business' && (
            <>
              <h2 className="text-sm font-semibold">Business profile</h2>
              <p className="mb-4 text-xs text-slate-500">This information appears on all your documents</p>
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-brand bg-indigo-50">
                  {uploadingLogo ? (
                    <Spinner className="h-5 w-5" />
                  ) : form.logo_url && !logoLoadFailed ? (
                    <img
                      src={form.logo_url}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={() => setLogoLoadFailed(true)}
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-brand" />
                  )}
                </div>
                <div>
                  <label className={`inline-block ${uploadingLogo ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}>
                    <span className="inline-block rounded-lg border border-slate-200 px-3 py-1.5 text-xs">
                      {form.logo_url ? 'Change logo' : 'Upload logo'}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      disabled={uploadingLogo}
                      onChange={(e) => void handleLogoUpload(e)}
                    />
                  </label>
                  <p className="mt-1 text-[10px] text-slate-400">PNG or JPG, max 2 MB</p>
                </div>
              </div>
              <Card className="mb-3 space-y-3">
                <SectionHead>Business info</SectionHead>
                <Input
                  label="Business name"
                  value={form.business_name ?? ''}
                  placeholder="e.g. Acme Design Studio"
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                />
                <div className="space-y-1">
                  <Input
                    label="Email"
                    value={form.email ?? ''}
                    placeholder="business@example.com"
                    readOnly
                    className="cursor-not-allowed text-slate-400"
                  />
                  <p className="text-[10px] text-slate-400">Change email in Account Settings</p>
                </div>
                <PhoneField
                  country={phoneCountry}
                  number={phoneNumber}
                  onChangeCountry={setPhoneCountry}
                  onChangeNumber={setPhoneNumber}
                />
                <Textarea
                  label="Address"
                  value={form.address ?? ''}
                  placeholder="Street, City, State"
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={3}
                />
                <Input
                  label="Website"
                  value={form.website ?? ''}
                  placeholder="https://yoursite.com"
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </Card>
              <Card className="mb-3 space-y-3">
                <SectionHead>Tax</SectionHead>
                <Input
                  label="Tax ID / RC number"
                  value={form.tax_id ?? ''}
                  placeholder="e.g. RC-1234567"
                  onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
                />
              </Card>
              <Button disabled={saving || uploadingLogo} onClick={handleBusinessSave}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </>
          )}

          {tab === 'signature' && user && (
            <SignatureSettingsPanel
              userId={user.id}
              profile={profile}
              setProfile={setProfile}
            />
          )}

          {tab === 'preferences' && (
            <>
              <h2 className="text-sm font-semibold">Preferences</h2>
              <p className="mb-4 text-xs text-slate-500">Currency, VAT, and date format for your documents</p>

              <p className="mb-2 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Currency</p>
              <div className="flex flex-wrap gap-2">
                {CURRENCIES.map((c) => {
                  const active = (form.currency ?? 'NGN') === c
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, currency: c })}
                      className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                        active
                          ? 'border-brand bg-indigo-50 font-semibold text-brand'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white'
                      }`}
                    >
                      {c}
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 mb-5 text-[11px] text-slate-400">
                Amounts will display as {CURRENCY_SYMBOLS[form.currency ?? 'NGN'] ?? '₦'}
              </p>

              <p className="mb-2 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Date format</p>
              <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {DATE_FORMATS.map((f, idx) => {
                  const active = (form.date_format ?? 'DD/MM/YYYY') === f.value
                  return (
                    <div key={f.value}>
                      {idx > 0 && <div className="mx-3.5 h-px bg-slate-100" />}
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, date_format: f.value })}
                        className="flex w-full items-center gap-3 px-3.5 py-3.5 text-left hover:bg-slate-50"
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            active ? 'border-brand' : 'border-slate-300'
                          }`}
                        >
                          {active && <span className="h-2 w-2 rounded-full bg-brand" />}
                        </span>
                        <span className="flex-1 text-sm text-slate-900">{f.value}</span>
                        <span className="text-[11px] text-slate-400">{f.example}</span>
                      </button>
                    </div>
                  )
                })}
              </div>

              <p className="mb-2 text-[10px] font-bold tracking-wide text-slate-400 uppercase">Tax</p>
              <Card className="mb-4 space-y-2">
                <Input
                  label="Default VAT rate (%)"
                  value={vatInput}
                  placeholder="e.g. 7.5"
                  inputMode="decimal"
                  onChange={(e) => setVatInput(e.target.value)}
                />
                <p className="text-[11px] text-slate-400">
                  Applied automatically on new invoices. Leave blank to disable.
                </p>
              </Card>

              <Button disabled={saving} onClick={handlePreferencesSave}>
                {saving ? 'Saving…' : 'Save preferences'}
              </Button>
            </>
          )}

          {tab === 'templates' && (
            <TemplatesSettingsPanel
              templates={templates}
              form={form}
              saving={saving}
              onSetDefault={(docType, templateId) => {
                const field = defaultTemplateFieldFor(docType)
                if (form[field] === templateId) return
                void save(
                  { [field]: templateId },
                  `${docType.charAt(0).toUpperCase() + docType.slice(1)} default template updated.`,
                )
              }}
            />
          )}

          {tab === 'account' && user && <AccountSettingsPanel user={user} />}
        </div>
      </div>
      {AlertHost}
    </AppShell>
  )
}
