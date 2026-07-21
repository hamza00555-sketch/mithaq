import type { Tab } from '../lib/types'

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'home', icon: '🏠', label: 'الرئيسية' },
  { id: 'schedule', icon: '📅', label: 'المواعيد' },
  { id: 'games', icon: '🎮', label: 'الألعاب' },
  { id: 'wishes', icon: '💝', label: 'الأماني' },
  { id: 'settings', icon: '⚙️', label: 'الإعدادات' },
]

export default function BottomNav({ tab, onTab, badges }: {
  tab: Tab
  onTab: (t: Tab) => void
  badges?: Partial<Record<Tab, number>>
}) {
  return (
    <nav className="bottom-nav fixed bottom-0 inset-x-0 z-40 flex justify-around items-center px-2 pt-2 pb-[max(14px,env(safe-area-inset-bottom))]">
      {TABS.map(t => {
        const n = badges?.[t.id] ?? 0
        return (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            className={`relative flex flex-col items-center gap-0.5 text-[10px] w-14 transition-opacity ${tab === t.id ? 'opacity-100 text-lavender' : 'opacity-50 text-lavender'}`}
          >
            <span className={`text-lg ${tab === t.id ? 'nav-glow' : ''}`}>{t.icon}</span>
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
