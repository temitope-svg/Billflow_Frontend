import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Users } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { getClients } from '../services/clients'

type ClientRow = {
  id: string
  name: string
  email: string | null
  phone: string | null
  docCount: number
}

export default function ClientsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [clients, setClients] = useState<ClientRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getClients(user.id, { search: search || undefined }).then(({ data }) => {
      setClients((data as ClientRow[]) ?? [])
      setLoading(false)
    })
  }, [user, search])

  if (loading) return <AppShell><PageLoader /></AppShell>

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Clients</h1>
        <Button className="text-xs" onClick={() => navigate('/clients/new')}>
          <Plus className="h-3.5 w-3.5" /> Add client
        </Button>
      </div>

      <div className="mb-4 flex max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          className="flex-1 bg-transparent text-xs outline-none"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {clients.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400">No clients yet</p>
        ) : (
          clients.map((client) => (
            <Link
              key={client.id}
              to={`/clients/${client.id}`}
              className="flex items-center gap-3 border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50">
                <Users className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{client.name}</p>
                <p className="text-xs text-slate-400">{client.email ?? client.phone ?? 'No contact info'}</p>
              </div>
              <span className="text-xs text-slate-400">{client.docCount} docs</span>
            </Link>
          ))
        )}
      </div>
    </AppShell>
  )
}
