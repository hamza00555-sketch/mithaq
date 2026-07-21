/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore'
import { auth, db, demoMode, firebaseReady } from '../lib/firebase'
import {
  DEMO_UID, demoAppointments, demoBadges, demoChallenge, demoCouple, demoGame,
  demoMatches, demoPenalties, demoPunishments, demoSignals, demoWishes,
} from '../lib/demo'
import type {
  Appointment, Badge, Challenge, Couple, GameDoc, Match, MoodSignal, Penalty, Punishment, UserProfile, Wish,
} from '../lib/types'
import { monthKey } from '../lib/data'

interface AppState {
  loading: boolean
  user: User | null
  profile: UserProfile | null
  couple: Couple | null
  partnerUid: string | null
  partnerName: string
  myName: string
  appointments: Appointment[]
  punishments: Punishment[]
  penalties: Penalty[]
  signals: MoodSignal[]
  matches: Match[]
  wishes: Wish[]
  game: GameDoc | null
  badges: Badge[]
  challenge: Challenge | null
}

const AppCtx = createContext<AppState>({
  loading: true, user: null, profile: null, couple: null, partnerUid: null,
  partnerName: '', myName: '', appointments: [], punishments: [], penalties: [],
  signals: [], matches: [], wishes: [], game: null, badges: [], challenge: null,
})

export const useApp = () => useContext(AppCtx)

export function AppProvider({ children }: { children: ReactNode }) {
  if (demoMode) return <DemoProvider>{children}</DemoProvider>
  return <LiveProvider>{children}</LiveProvider>
}

function DemoProvider({ children }: { children: ReactNode }) {
  const value: AppState = {
    loading: false,
    user: { uid: DEMO_UID } as User,
    profile: { name: 'حمزة', coupleId: 'demo' },
    couple: demoCouple,
    partnerUid: demoCouple.members[1],
    partnerName: 'أسماء',
    myName: 'حمزة',
    appointments: demoAppointments,
    punishments: demoPunishments,
    penalties: demoPenalties,
    signals: demoSignals,
    matches: demoMatches,
    wishes: demoWishes,
    game: demoGame,
    badges: demoBadges,
    challenge: demoChallenge,
  }
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

function LiveProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [couple, setCouple] = useState<Couple | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [punishments, setPunishments] = useState<Punishment[]>([])
  const [penalties, setPenalties] = useState<Penalty[]>([])
  const [signals, setSignals] = useState<MoodSignal[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [wishes, setWishes] = useState<Wish[]>([])
  const [game, setGame] = useState<GameDoc | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [challenge, setChallenge] = useState<Challenge | null>(null)

  useEffect(() => {
    if (!firebaseReady) { setLoading(false); return }
    return onAuthStateChanged(auth(), u => {
      setUser(u)
      if (!u) { setProfile(null); setCouple(null); setLoading(false) }
    })
  }, [])

  useEffect(() => {
    if (!user) return
    return onSnapshot(doc(db(), 'users', user.uid), snap => {
      setProfile(snap.exists() ? (snap.data() as UserProfile) : null)
      setLoading(false)
    }, () => setLoading(false))
  }, [user])

  const cid = profile?.coupleId ?? null

  useEffect(() => {
    if (!cid) { setCouple(null); return }
    return onSnapshot(doc(db(), 'couples', cid), snap => {
      setCouple(snap.exists() ? ({ id: snap.id, ...snap.data() } as Couple) : null)
    })
  }, [cid])

  const paired = Boolean(cid && couple && couple.members.length === 2)

  useEffect(() => {
    if (!cid || !paired) return
    const c = (name: string) => collection(db(), 'couples', cid, name)
    const map = (snap: { docs: { id: string; data(): unknown }[] }) =>
      snap.docs.map(d => ({ id: d.id, ...(d.data() as Record<string, unknown>) }))

    const subs = [
      onSnapshot(query(c('appointments'), orderBy('scheduledAt', 'desc')), s => setAppointments(map(s) as Appointment[])),
      onSnapshot(c('punishments'), s => setPunishments(map(s) as Punishment[])),
      onSnapshot(query(c('penalties'), orderBy('createdAt', 'desc')), s => setPenalties(map(s) as Penalty[])),
      onSnapshot(query(c('signals'), orderBy('createdAt', 'desc')), s => setSignals(map(s) as MoodSignal[])),
      onSnapshot(query(c('matches'), orderBy('createdAt', 'desc')), s => setMatches(map(s) as Match[])),
      onSnapshot(query(c('wishes'), orderBy('createdAt', 'desc')), s => setWishes(map(s) as Wish[])),
      onSnapshot(doc(db(), 'couples', cid, 'meta', 'game'), s => setGame(s.exists() ? (s.data() as GameDoc) : null)),
      onSnapshot(c('badges'), s => setBadges(map(s) as Badge[])),
      onSnapshot(doc(db(), 'couples', cid, 'challenges', monthKey()), s =>
        setChallenge(s.exists() ? ({ id: s.id, ...s.data() } as Challenge) : null)),
    ]
    return () => subs.forEach(u => u())
  }, [cid, paired])

  const partnerUid = useMemo(
    () => (user && couple ? couple.members.find(m => m !== user.uid) ?? null : null),
    [user, couple],
  )

  const value: AppState = {
    loading, user, profile, couple, partnerUid,
    partnerName: partnerUid ? couple?.memberNames?.[partnerUid] ?? 'شريكك' : 'شريكك',
    myName: user ? couple?.memberNames?.[user.uid] ?? profile?.name ?? '' : '',
    appointments, punishments, penalties, signals, matches, wishes, game, badges, challenge,
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}
