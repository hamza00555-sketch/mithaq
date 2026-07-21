import { useMemo, useState } from 'react'
import { firebaseReady } from './lib/firebase'
import { useApp } from './context/AppContext'
import type { Tab } from './lib/types'
import NightSky from './components/NightSky'
import SetupScreen from './components/SetupScreen'
import PinLock, { getStoredPin } from './components/PinLock'
import BottomNav from './components/BottomNav'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Schedule from './pages/Schedule'
import Games from './pages/Games'
import Wheel from './pages/Wheel'
import Wishes from './pages/Wishes'
import Settings from './pages/Settings'
import { tsDate } from './lib/dates'

export default function App() {
  const { loading, user, profile, couple, penalties, matches, wishes, appointments } = useApp()
  const [tab, setTab] = useState<Tab>('home')
  const [locked, setLocked] = useState(Boolean(getStoredPin()))
  const [gamesView, setGamesView] = useState<'games' | 'wheel'>('games')

  const uid = user?.uid

  // شارات التنبيه على التبويبات
  const navBadges = useMemo(() => {
    if (!uid) return {}
    const games =
      matches.filter(m => m.status === 'waiting' && m.createdBy !== uid).length +
      penalties.filter(p => p.offenderUid === uid && p.status === 'pending_spin').length
    const wishesN = wishes.filter(w => w.toUid === uid && w.status === 'pending').length
    const schedule = appointments.filter(a =>
      (a.status === 'proposed' && a.proposedBy !== uid) ||
      (a.status === 'confirmed' && tsDate(a.scheduledAt).getTime() < Date.now())).length
    return { games, wishes: wishesN, schedule }
  }, [uid, matches, penalties, wishes, appointments])

  if (!firebaseReady) return <><NightSky /><SetupScreen /></>

  if (locked) return <PinLock onUnlock={() => setLocked(false)} />

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 relative z-10">
        <NightSky />
        <div className="text-4xl anim-floaty">🌙</div>
        <div className="gold-glow text-2xl font-extrabold">ميثاق</div>
      </div>
    )
  }

  const paired = user && profile?.coupleId && couple && couple.members.length === 2
  if (!paired) return <><NightSky /><Onboarding /></>

  const hasPenaltyFlow = penalties.some(p => p.status === 'pending_spin' || p.status === 'assigned')

  return (
    <div className="max-w-md mx-auto min-h-dvh relative">
      <NightSky />
      {tab === 'home' && <Home onTab={t => { setTab(t); setGamesView('games') }} />}
      {tab === 'schedule' && <Schedule />}
      {tab === 'games' && (
        <>
          <div className="px-4 pt-3 relative z-10 flex gap-2">
            <button className={`chip ${gamesView === 'games' ? 'chip-done' : 'btn-ghost px-3 py-1 text-[11px]'}`}
              onClick={() => setGamesView('games')}>🎮 الألعاب</button>
            <button className={`chip ${gamesView === 'wheel' ? 'chip-done' : 'btn-ghost px-3 py-1 text-[11px]'}`}
              onClick={() => setGamesView('wheel')}>
              🎡 العجلة{hasPenaltyFlow ? ' •' : ''}
            </button>
          </div>
          {gamesView === 'games' ? <Games /> : <Wheel />}
        </>
      )}
      {tab === 'wishes' && <Wishes />}
      {tab === 'settings' && <Settings />}
      <BottomNav tab={tab} onTab={setTab} badges={navBadges} />
    </div>
  )
}
