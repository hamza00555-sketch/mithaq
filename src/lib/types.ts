import type { Timestamp } from 'firebase/firestore'

export interface UserProfile {
  name: string
  coupleId: string | null
}

export interface WeeklySchedule {
  days: number[] // 0=الأحد .. 6=السبت (getDay)
  hour: number
  minute: number
}

export interface Couple {
  id: string
  members: string[]
  memberNames: Record<string, string>
  inviteCode: string
  createdAt: Timestamp
  weeklySchedule?: WeeklySchedule | null
}

export type AppointmentStatus = 'proposed' | 'confirmed' | 'declined' | 'completed' | 'missed'

export interface Appointment {
  id: string
  scheduledAt: Timestamp
  proposedBy: string
  status: AppointmentStatus
  note?: string
  missedBy?: string
  resolvedAt?: Timestamp
  fromPrize?: boolean
  fromSchedule?: boolean
}

export interface Punishment {
  id: string
  text: string
  addedBy: string
  active: boolean
}

export type PenaltyStatus = 'pending_spin' | 'assigned' | 'done' | 'forgiven'

export interface Penalty {
  id: string
  appointmentId: string
  offenderUid: string
  status: PenaltyStatus
  punishmentText?: string
  createdAt: Timestamp
  spunAt?: Timestamp
}

export type SignalStatus = 'sent' | 'seen' | 'accepted' | 'later'

export interface MoodSignal {
  id: string
  fromUid: string
  createdAt: Timestamp
  status: SignalStatus
  respondedAt?: Timestamp
}

export type GameType = 'xo' | 'rps' | 'who_of_us' | 'truth_cards'
export type MatchStatus = 'waiting' | 'playing' | 'finished' | 'abandoned'
export type Prize = 'decide_date' | 'wish' | 'none'

export interface XoState {
  board: string[] // '' | 'x' | 'o'
  xUid: string
  oUid: string
  turn: string // uid
  round: number
}

export type RpsPick = 'rock' | 'paper' | 'scissors'
export interface RpsState {
  round: number // 1..3 (أفضل من 3)
  picks: Record<string, RpsPick | ''>
  scores: Record<string, number>
  lastResult?: { picks: Record<string, RpsPick>; winner: string | 'draw' }
}

export interface WhoState {
  qIndex: number // 0..9
  questionIds: number[]
  answers: Record<string, string[]> // 'me' | 'partner' per q
  matched: number
  lastReveal?: { q: number; match: boolean }
}

export interface TruthState {
  round: number // 0..9 (10 بطاقات، 5 لكل طرف بالتناوب)
  drawerUid: string
  cardId: number | null
  cardKind: 'truth' | 'dare' | null
  usedCards: number[]
  scores: Record<string, number>
  phase: 'draw' | 'judge' // draw: الساحب يسحب، judge: الآخر يقيّم
}

export interface Match {
  id: string
  gameType: GameType
  createdBy: string
  status: MatchStatus
  prize: Prize
  state: XoState | RpsState | WhoState | TruthState | null
  winnerUid?: string | 'draw'
  prizeSettled: boolean
  createdAt: Timestamp
}

export interface Wish {
  id: string
  fromUid: string
  toUid: string
  text: string
  matchId: string
  status: 'pending' | 'fulfilled'
  createdAt: Timestamp
}

export interface GameDoc {
  points: number
  streak: number
  bestStreak: number
  lastCompletedAt?: Timestamp
  counters: Record<string, number> // completedDates, missedDates, matches, wishesDone, forgives_{uid}, wins_{uid}
}

export interface Badge {
  id: string
  badgeKey: string
  earnedAt: Timestamp
}

export interface Challenge {
  id: string // YYYY-MM
  targetCount: number
  doneCount: number
  rewardText: string
  status: 'active' | 'won'
}

export type Tab = 'home' | 'schedule' | 'games' | 'wishes' | 'settings'
