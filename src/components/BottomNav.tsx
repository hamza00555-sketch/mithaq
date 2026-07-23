import type { Tab } from '../lib/types'
import Icon, { type IconName } from './Icon'

const TABS: { id: Tab; icon: IconName; label: string }[] = [
  { id: 'home', icon: 'home', label: 'الرئيسية' },
  { id: 'schedule', icon: 'calendar', label: 'المواعيد' },
  { id: 'games', icon: 'games', label: 'الألعاب' },
  { id: 'wishes', icon: 'wish', label: 'الأماني' },
  { id: 'settings', icon: 'settings', label: 'الإعدادات' },
]

export default function BottomNav({ tab, onTab, badges }: {
  tab: Tab
  onTab: (t: Tab) => void
  badges?: Partial<Record<Tab, number>>
}) {
  return (
    <nav className="bottom-nav fixed bottom-0 inset-x-0 z-40 flex justify-around items-center px-2 pt-2.5 pb-[max(14px,env(safe-area-inset-bottom))]">
      {TABS.map(t => {
        const n = badges?.[t.id] ?? 0
        return (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            className={`nav-button ${tab === t.id ? 'active' : ''} flex flex-col items-center gap-0.5 text-[10px] transition-colors`}
          >
            <span className="nav-icon-wrap"><Icon name={t.icon} size={20} /></span>
            {t.label}
            {n > 0 && (
              <span className="absolute -top-1 left-1 bg-plum text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                {n}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
