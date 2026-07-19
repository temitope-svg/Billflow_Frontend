import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { BackButton } from '../components/ui/BackButton'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { PageLoader } from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { useAlertModal } from '../hooks/useAlertModal'
import { createClient, getClient, updateClient } from '../services/clients'

export default function ClientFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showError, AlertHost } = useAlertModal()
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!id) return
    getClient(id).then(({ data }) => {
      if (data) {
        setName(data.name)
        setEmail(data.email ?? '')
        setPhone(data.phone ?? '')
        setAddress(data.address ?? '')
        setNotes(data.notes ?? '')
      }
      setLoading(false)
    })
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const payload = { name, email: email || null, phone: phone || null, address: address || null, notes: notes || null }
    if (isEdit && id) {
      const { error } = await updateClient(id, payload)
      setSaving(false)
      if (error) {
        showError('Could not update client', error.message)
        return
      }
      navigate(`/clients/${id}`)
      return
    }
    const { data, error } = await createClient({ ...payload, user_id: user.id })
    setSaving(false)
    if (error) {
      showError('Could not create client', error.message)
      return
    }
    if (data) navigate(`/clients/${data.id}`)
  }

  if (loading) return <AppShell><PageLoader /></AppShell>

  return (
    <AppShell>
      <BackButton fallback={isEdit ? `/clients/${id}` : '/clients'} />
      <h1 className="mb-4 text-lg font-semibold">{isEdit ? 'Edit client' : 'New client'}</h1>
      <form onSubmit={handleSave} className="max-w-md space-y-3">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Textarea label="Address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save client'}</Button>
      </form>
      {AlertHost}
    </AppShell>
  )
}
