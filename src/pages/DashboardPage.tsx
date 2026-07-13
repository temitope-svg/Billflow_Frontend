import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Badge } from '../components/ui/Badge'
import { PageLoader } from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { getRecentDocuments, getMonthlyStats } from '../services/documents'
import { symbolFor } from '../constants/currencies'
import { getStatusBadge } from '../utils/documentStatus'
import { formatDate } from '../utils/formatDate'
import { useDateFormat } from '../hooks/useProfile'
import type { DocumentStatus, DocumentType } from '../types/database'

interface RecentDoc {
  id: string
  document_number: string
  document_type: DocumentType
  status: DocumentStatus
  total_amount: number
  currency: string
  issue_date: string
  due_date?: string | null
  recipient: { name: string } | null
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const dateFormat = useDateFormat()
  const [recent, setRecent] = useState<RecentDoc[]>([])
  const [stats, setStats] = useState({ invoiceCount: 0, paidCount: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getRecentDocuments(user.id, 5),
      getMonthlyStats(user.id),
    ]).then(([recentRes, statsRes]) => {
      if (recentRes.data) setRecent(recentRes.data as unknown as RecentDoc[])
      if (statsRes.data) {
        const rows = statsRes.data
        const invoices = rows.filter((r) => r.document_type === 'invoice')
        setStats({
          invoiceCount: invoices.length,
          paidCount: invoices.filter((r) => r.status === 'paid').length,
          revenue: invoices.filter((r) => r.status === 'paid').reduce((s, r) => s + (r.total_amount ?? 0), 0),
        })
      }
      setLoading(false)
    })
  }, [user])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const name =
    profile?.business_name?.split(' ')[0] ??
    user?.user_metadata?.full_name?.split(' ')[0] ??
    'there'

  const symbol = symbolFor(profile?.currency)

  if (loading) return <AppShell><PageLoader /></AppShell>

  return (
    <AppShell>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            {greeting()}, {name}
          </h1>
          <p className="text-xs text-slate-500">Here&apos;s what&apos;s happening with your documents</p>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard value={String(stats.invoiceCount)} label="Invoices this month" />
        <StatCard value={String(stats.paidCount)} label="Paid" valueClass="text-emerald-600" />
        <StatCard value={`${symbol}${stats.revenue.toLocaleString()}`} label="Revenue" valueClass="text-brand" />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <span className="text-sm font-semibold">Recent documents</span>
          <Link to="/documents" className="text-xs font-medium text-brand">View all</Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400">No documents yet</p>
        ) : (
          recent.map((doc) => {
            const badge = getStatusBadge(doc)
            return (
              <Link
                key={doc.id}
                to={`/documents/${doc.id}`}
                className="flex items-center gap-3 border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                  <Receipt className="h-4 w-4 text-brand" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {doc.document_number} · {doc.recipient?.name ?? 'No client'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatDate(doc.issue_date, dateFormat)} · {symbolFor(doc.currency)}
                    {doc.total_amount.toLocaleString()}
                  </p>
                </div>
                <Badge style={badge} />
              </Link>
            )
          })
        )}
      </div>
    </AppShell>
  )
}

function StatCard({
  value,
  label,
  valueClass = 'text-slate-900',
}: {
  value: string
  label: string
  valueClass?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className={`text-xl font-semibold ${valueClass}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}
