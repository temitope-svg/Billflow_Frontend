import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Files, Users, Settings, Plus } from 'lucide-react'
import { LogoBrand } from '../BillflowLogo'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../hooks/useProfile'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/documents', label: 'Documents', icon: Files },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile } = useProfile()

  const initials = (profile?.business_name ?? user?.email ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const displayName =
    profile?.business_name?.split(' ')[0] ?? user?.user_metadata?.full_name?.split(' ')[0] ?? 'User'

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-slate-200 bg-white p-3">
      <LogoBrand className="px-2 pb-4 text-sm" />

      <nav className="flex flex-col gap-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition ${isActive ? 'bg-indigo-50 font-medium text-brand' : 'text-slate-600 hover:bg-slate-50'}`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <Button
          fullWidth
          className="py-2 text-xs"
          onClick={() => navigate('/new')}
        >
          <Plus className="h-3.5 w-3.5" />
          New document
        </Button>
      </div>

      <div className="mt-auto flex items-center gap-2 px-2 pt-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-semibold text-brand">
          {initials}
        </div>
        <span className="truncate text-xs font-medium text-slate-900">{displayName}</span>
      </div>
    </aside>
  )
}
