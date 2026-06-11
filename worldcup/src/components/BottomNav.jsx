import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', icon: '🏠', label: 'الرئيسية' },
  { path: '/matches', icon: '⚽', label: 'المباريات' },
  { path: '/groups', icon: '📊', label: 'المجموعات' },
  { path: '/settings', icon: '⚙️', label: 'الإعدادات' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ path, icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `nav-item flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? 'text-emerald-400 bg-emerald-400/10'
                  : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
