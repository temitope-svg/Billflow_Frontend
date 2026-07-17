import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun, Sunset, type LucideIcon } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { DocumentTypeIcon } from '../components/documents/DocumentTypeIcon'
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

function getGreeting(date = new Date()): {
  text: string
  Icon: LucideIcon
  iconClass: string
  wrapClass: string
} {
  const hour = date.getHours()
  if (hour < 12) {
    return {
      text: 'Good morning',
      Icon: Sun,
      iconClass: 'text-amber-500',
      wrapClass: 'bg-amber-100',
    }
  }
  if (hour < 17) {
    return {
      text: 'Good afternoon',
      Icon: Sunset,
      iconClass: 'text-orange-500',
      wrapClass: 'bg-orange-100',
    }
  }
  return {
    text: 'Good evening',
    Icon: Moon,
    iconClass: 'text-indigo-500',
    wrapClass: 'bg-indigo-50',
  }
}

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

  const [greeting, setGreeting] = useState(() => getGreeting())

  useEffect(() => {
    const syncGreeting = () => setGreeting(getGreeting())
    syncGreeting()

    const now = new Date()
    const msUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
    let intervalId: number | undefined
    const timeoutId = window.setTimeout(() => {
      syncGreeting()
      intervalId = window.setInterval(syncGreeting, 60_000)
    }, msUntilNextMinute)

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId !== undefined) window.clearInterval(intervalId)
    }
  }, [])

  const name =
    user?.user_metadata?.full_name?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'there'

  const symbol = symbolFor(profile?.currency)
  const { text: greetingText, Icon: GreetingIcon, iconClass, wrapClass } = greeting

  if (loading) return <AppShell><PageLoader /></AppShell>

  return (
    <AppShell>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${wrapClass}`}
            aria-hidden
          >
            <GreetingIcon className={`h-4 w-4 ${iconClass}`} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              {greetingText}, {name}
            </h1>
            <p className="text-xs text-slate-500">Here&apos;s what&apos;s happening with your documents</p>
          </div>
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
                <DocumentTypeIcon
                  type={doc.document_type}
                  status={doc.status}
                  dueDate={doc.due_date}
                />
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
