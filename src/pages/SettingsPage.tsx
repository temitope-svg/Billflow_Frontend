import { useEffect, useState } from 'react'
import { Building2, PenLine, SlidersHorizontal, LayoutTemplate, LogOut } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Card, SectionHead } from '../components/ui/Card'
import { PageLoader } from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { updateProfile } from '../services/profile'
import { uploadLogo, uploadSignature } from '../services/storage'
import { signOut } from '../services/auth'
import { getTemplates } from '../services/documents'
import { defaultTemplateFieldFor } from '../utils/defaultTemplate'
import { CURRENCIES } from '../constants/currencies'
import type { DocumentType, Template, UserProfile } from '../types/database'

const tabs = [
  { id: 'business', label: 'Business profile', icon: Building2 },
  { id: 'signature', label: 'Signature', icon: PenLine },
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
] as const

type TabId = (typeof tabs)[number]['id']

export default function SettingsPage() {
  const { user } = useAuth()
  const { profile, setProfile } = useProfile()
  const [tab, setTab] = useState<TabId>('business')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState<Partial<UserProfile>>({})
  const [templates, setTemplates] = useState<Record<DocumentType, Template[]>>({
    estimate: [],
    invoice: [],
    receipt: [],
  })

  useEffect(() => {
    if (profile) setForm(profile)
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

  const save = async (updates: Partial<UserProfile>) => {
    if (!user) return
    setSaving(true)
    setMessage('')
    const { data, error } = await updateProfile(user.id, updates)
    setSaving(false)
    if (error) {
      setMessage(error.message)
      return
    }
    if (data) setProfile(data as UserProfile)
    setMessage('Saved successfully')
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const { url, error } = await uploadLogo(user.id, await file.arrayBuffer(), file.type)
    if (error) {
      setMessage(error.message)
      return
    }
    await save({ logo_url: url })
  }

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const { url, error } = await uploadSignature(user.id, await file.arrayBuffer(), file.type)
    if (error) {
      setMessage(error.message)
      return
    }
    await save({ signature_url: url, signature_type: 'uploaded' })
  }

  if (!profile) return <AppShell><PageLoader /></AppShell>

  return (
    <AppShell>
      <div className="flex gap-6">
        <div className="w-44 shrink-0">
          <h1 className="mb-3 text-base font-semibold">Settings</h1>
          <nav className="space-y-0.5">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs ${tab === id ? 'bg-indigo-50 font-medium text-brand' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => signOut()}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </div>

        <div className="max-w-lg flex-1">
          {message && (
            <p className={`mb-3 text-xs ${message.includes('success') ? 'text-emerald-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          {tab === 'business' && (
            <>
              <h2 className="text-sm font-semibold">Business profile</h2>
              <p className="mb-4 text-xs text-slate-500">This information appears on all your documents</p>
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed border-brand bg-indigo-50">
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="" className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <Building2 className="h-6 w-6 text-brand" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer">
                    <span className="inline-block rounded-lg border border-slate-200 px-3 py-1.5 text-xs">Upload logo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  <p className="mt-1 text-[10px] text-slate-400">PNG or JPG, max 5MB</p>
                </div>
              </div>
              <Card className="mb-3 space-y-3">
                <SectionHead>Business info</SectionHead>
                <Input label="Business name" value={form.business_name ?? ''} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
                <Input label="Email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Phone" value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <Input label="Website" value={form.website ?? ''} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                </div>
                <Textarea label="Address" value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
              </Card>
              <Button disabled={saving} onClick={() => save({
                business_name: form.business_name,
                email: form.email,
                phone: form.phone,
                website: form.website,
                address: form.address,
              })}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </>
          )}

          {tab === 'signature' && (
            <>
              <h2 className="text-sm font-semibold">Signature</h2>
              <p className="mb-4 text-xs text-slate-500">Used on documents when signature is enabled</p>
              {form.signature_url && (
                <img src={form.signature_url} alt="Signature" className="mb-4 max-h-20 rounded border border-slate-200 bg-white p-2" />
              )}
              <label className="cursor-pointer">
                <span className="inline-block rounded-lg border border-slate-200 px-3 py-2 text-xs">Upload signature image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
              </label>
            </>
          )}

          {tab === 'preferences' && (
            <>
              <h2 className="text-sm font-semibold">Preferences</h2>
              <Card className="mt-4 space-y-3">
                <label className="block text-xs font-medium">Currency</label>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  value={form.currency ?? 'NGN'}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <label className="block text-xs font-medium">Date format</label>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  value={form.date_format ?? 'DD/MM/YYYY'}
                  onChange={(e) => setForm({ ...form, date_format: e.target.value })}
                >
                  {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD MMM YYYY'].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <Input
                  label="Default VAT (%)"
                  value={form.default_vat_rate != null ? String(form.default_vat_rate) : ''}
                  onChange={(e) => setForm({ ...form, default_vat_rate: parseFloat(e.target.value) || null })}
                />
              </Card>
              <Button className="mt-3" disabled={saving} onClick={() => save({
                currency: form.currency,
                date_format: form.date_format,
                default_vat_rate: form.default_vat_rate,
              })}>
                Save preferences
              </Button>
            </>
          )}

          {tab === 'templates' && (
            <>
              <h2 className="text-sm font-semibold">Default templates</h2>
              <p className="mb-4 text-xs text-slate-500">Pre-selected when creating new documents</p>
              {(['estimate', 'invoice', 'receipt'] as DocumentType[]).map((docType) => (
                <Card key={docType} className="mb-3">
                  <SectionHead>{docType.charAt(0).toUpperCase() + docType.slice(1)}</SectionHead>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm capitalize"
                    value={
                      docType === 'estimate'
                        ? form.default_estimate_template_id ?? ''
                        : docType === 'invoice'
                          ? form.default_invoice_template_id ?? ''
                          : form.default_receipt_template_id ?? ''
                    }
                    onChange={(e) => save({ [defaultTemplateFieldFor(docType)]: e.target.value || null })}
                  >
                    <option value="">None</option>
                    {templates[docType].map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}
