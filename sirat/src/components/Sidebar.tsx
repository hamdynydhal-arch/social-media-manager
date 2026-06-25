import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarCheck, TrendingUp, Heart, Compass, Moon, Sun } from 'lucide-react'
import clsx from 'clsx'

const links = [
  { to: '/',           icon: LayoutDashboard, label: 'لوحة التحكم' },
  { to: '/routine',    icon: CalendarCheck,   label: 'الروتين اليومي' },
  { to: '/performance',icon: TrendingUp,      label: 'الأداء' },
  { to: '/state',      icon: Heart,           label: 'الحالة' },
  { to: '/guidance',   icon: Compass,         label: 'التوجيه' },
]

interface Props {
  darkMode: boolean
  onToggleDark: () => void
}

export default function Sidebar({ darkMode, onToggleDark }: Props) {
  return (
    <aside className="w-64 min-h-screen bg-sirat-950 dark:bg-gray-950 flex flex-col">
      <div className="p-6 border-b border-sirat-800">
        <h1 className="text-2xl font-bold text-gold-400 font-arabic text-center tracking-wide">سِراط</h1>
        <p className="text-sirat-400 text-xs text-center mt-1">الطريق إلى الأفضل</p>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-3">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sirat-700 text-white shadow-lg shadow-sirat-900'
                  : 'text-sirat-300 hover:bg-sirat-800 hover:text-white'
              )
            }
          >
            <Icon size={18} />
            <span className="font-arabic">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sirat-800">
        <button
          onClick={onToggleDark}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sirat-300 hover:bg-sirat-800 hover:text-white transition-all text-sm"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          <span className="font-arabic">{darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
        </button>
      </div>
    </aside>
  )
}
