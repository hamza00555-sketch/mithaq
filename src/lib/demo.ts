// بيانات الوضع التجريبي — تعرض التطبيق بدون Firebase
import { Timestamp } from 'firebase/firestore'
import type {
  Appointment, Badge, Challenge, Couple, GameDoc, Match, MoodSignal, Penalty, Punishment, Wish, XoState,
} from './types'
import { DEFAULT_PUNISHMENTS } from './content'

const U1 = 'demo-user-1'
const U2 = 'demo-user-2'
const at = (h: number) => Timestamp.fromDate(new Date(Date.now() + h * 3600000))

export const DEMO_UID = U1

export const demoCouple: Couple = {
  id: 'demo', members: [U1, U2],
  memberNames: { [U1]: 'حمزة', [U2]: 'أسماء' },
  inviteCode: 'MTQ123',
  createdAt: Timestamp.fromDate(new Date(Date.now() - 90 * 86400000)),
}

export const demoAppointments: Appointment[] = [
  { id: 'a1', scheduledAt: at(50), proposedBy: U2, status: 'confirmed', note: '', fromPrize: false } as Appointment,
  { id: 'a2', scheduledAt: at(150), proposedBy: U1, status: 'proposed', note: 'ليلة خاصة 💜', fromPrize: false } as Appointment,
  { id: 'a3', scheduledAt: at(-60), proposedBy: U1, status: 'completed', fromPrize: false } as Appointment,
  { id: 'a4', scheduledAt: at(-160), proposedBy: U2, status: 'missed', missedBy: U1, fromPrize: false } as Appointment,
]

export const demoPunishments: Punishment[] = DEFAULT_PUNISHMENTS.map((text, i) => ({
  id: `p${i}`, text, addedBy: U1, active: true,
}))

export const demoPenalties: Penalty[] = [
  { id: 'pen1', appointmentId: 'a4', offenderUid: U1, status: 'assigned', punishmentText: '💆 مساج نص ساعة', createdAt: at(-150) } as Penalty,
]

export const demoSignals: MoodSignal[] = []

export const demoMatches: Match[] = [
  {
    id: 'm1', gameType: 'xo', createdBy: U2, status: 'waiting', prize: 'wish', prizeSettled: false,
    createdAt: at(-1),
    state: {
      board: ['x', 'o', '', 'o', 'x', '', '', '', ''],
      xUid: U1, oUid: U2, turn: U1, round: 1,
    } satisfies XoState,
  } as Match,
  { id: 'm2', gameType: 'rps', createdBy: U1, status: 'finished', prize: 'decide_date', prizeSettled: true, winnerUid: U2, createdAt: at(-30), state: null } as Match,
]

export const demoWishes: Wish[] = [
  { id: 'w1', fromUid: U2, toUid: U1, text: 'عشاء على السطح تحت النجوم', matchId: 'm2', status: 'pending', createdAt: at(-29) } as Wish,
]

export const demoGame: GameDoc = {
  points: 120, streak: 5, bestStreak: 7,
  counters: { completedDates: 11, matches: 6, wishesDone: 2, [`wins_${U2}`]: 4, [`wins_${U1}`]: 2 },
}

export const demoBadges: Badge[] = [
  { id: 'first_date', badgeKey: 'first_date', earnedAt: at(-2000) } as Badge,
  { id: 'streak5', badgeKey: 'streak5', earnedAt: at(-500) } as Badge,
  { id: 'first_win', badgeKey: 'first_win', earnedAt: at(-800) } as Badge,
]

export const demoChallenge: Challenge = {
  id: '2026-07', targetCount: 12, doneCount: 8, rewardText: 'عشاء فاخر 🍽️', status: 'active',
}
