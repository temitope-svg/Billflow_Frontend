import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Files, Users, Settings, Plus } from 'lucide-react'
import { LogoBrand } from '../BillflowLogo'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/documents', label: 'Documents', icon: Files },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [avatarFailed, setAvatarFailed] = useState(false)

  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split('@')[0] ??
    'User'

  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const avatarUrl = (user?.user_metadata?.avatar_url as string | undefined) ?? null

  const go = (path: string) => {
    navigate(path)
    onNavigate?.()
  }

  return (
    <aside className="flex h-full w-52 shrink-0 flex-col border-r border-slate-200 bg-white p-3">
      <LogoBrand className="hidden px-2 pb-4 text-sm md:block" />

      <nav className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => onNavigate?.()}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition ${isActive ? 'bg-indigo-50 font-medium text-brand' : 'text-slate-600 hover:bg-slate-50'}`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3">
          <Button
            fullWidth
            className="py-2 text-xs"
            onClick={() => go('/new')}
          >
            <Plus className="h-3.5 w-3.5" />
            New document
          </Button>
        </div>
      </nav>

      <button
        type="button"
        onClick={() => go('/settings?tab=account')}
        className="mt-auto flex w-full shrink-0 items-center gap-2 rounded-lg px-2 py-2 pt-4 text-left transition hover:bg-slate-50"
      >
        {avatarUrl && !avatarFailed ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-7 w-7 shrink-0 rounded-full object-cover"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-semibold text-brand">
            {initials}
          </div>
        )}
        <span className="truncate text-xs font-medium text-slate-900">{displayName}</span>
      </button>
    </aside>
  )
}
