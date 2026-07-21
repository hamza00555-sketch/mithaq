import {
  addDoc, arrayUnion, collection, doc, getDoc, getDocs, increment, limit as qLimit,
  query, runTransaction, serverTimestamp, setDoc, Timestamp, updateDoc, where,
} from 'firebase/firestore'
import { db } from './firebase'
import type {
  GameType, Match, Prize, RpsPick, RpsState, TruthState, WhoState, XoState,
} from './types'
import { DEFAULT_PUNISHMENTS, TRUTH_CARDS, WHO_QUESTIONS } from './content'

// ═══════════ مراجع ═══════════
export const coupleRef = (cid: string) => doc(db(), 'couples', cid)
export const col = (cid: string, name: string) => collection(db(), 'couples', cid, name)
export const gameRef = (cid: string) => doc(db(), 'couples', cid, 'meta', 'game')

// ═══════════ الإقران ═══════════
const genCode = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function createCouple(uid: string, name: string): Promise<string> {
  const ref = await addDoc(collection(db(), 'couples'), {
    members: [uid],
    memberNames: { [uid]: name },
    inviteCode: genCode(),
    createdAt: serverTimestamp(),
  })
  // العقوبات الافتراضية
  await Promise.all(DEFAULT_PUNISHMENTS.map(text =>
    addDoc(collection(db(), 'couples', ref.id, 'punishments'), { text, addedBy: uid, active: true })
  ))
  await setDoc(doc(db(), 'couples', ref.id, 'meta', 'game'), {
    points: 0, streak: 0, bestStreak: 0, counters: {},
  })
  await updateDoc(doc(db(), 'users', uid), { coupleId: ref.id })
  return ref.id
}

export async function joinCouple(uid: string, name: string, code: string): Promise<string> {
  const q = query(collection(db(), 'couples'), where('inviteCode', '==', code.toUpperCase().trim()), qLimit(1))
  const snap = await getDocs(q)
  if (snap.empty) throw new Error('الكود غير صحيح — تأكد منه وحاول مرة ثانية')
  const c = snap.docs[0]
  const members: string[] = c.data().members
  if (members.includes(uid)) {
    await updateDoc(doc(db(), 'users', uid), { coupleId: c.id })
    return c.id
  }
  if (members.length >= 2) throw new Error('هذا الميثاق مكتمل بطرفيه')
  await updateDoc(c.ref, { members: arrayUnion(uid), [`memberNames.${uid}`]: name })
  await updateDoc(doc(db(), 'users', uid), { coupleId: c.id })
  return c.id
}

// ═══════════ التحفيز: نقاط/سلسلة/أوسمة (transaction) ═══════════
export type GameEvent =
  | { type: 'date_completed' }
  | { type: 'date_missed' }
  | { type: 'penalty_done' }
  | { type: 'wish_fulfilled' }
  | { type: 'match_completed'; winnerUid?: string }
  | { type: 'forgive'; byUid: string }

const POINTS: Record<string, number> = {
  date_completed: 10, date_missed: -5, penalty_done: 3, wish_fulfilled: 5, match_completed: 2, forgive: 0,
}

export async function applyGameEvent(cid: string, ev: GameEvent): Promise<string[]> {
  const newBadges: string[] = []
  await runTransaction(db(), async tx => {
    const gRef = gameRef(cid)
    const gSnap = await tx.get(gRef)
    const g = gSnap.exists() ? gSnap.data() : { points: 0, streak: 0, bestStreak: 0, counters: {} }
    const counters: Record<string, number> = { ...(g.counters ?? {}) }
    let { points = 0, streak = 0, bestStreak = 0 } = g

    points = Math.max(0, points + (POINTS[ev.type] ?? 0))

    if (ev.type === 'date_completed') {
      streak += 1
      bestStreak = Math.max(bestStreak, streak)
      counters.completedDates = (counters.completedDates ?? 0) + 1
    } else if (ev.type === 'date_missed') {
      streak = 0
      counters.missedDates = (counters.missedDates ?? 0) + 1
    } else if (ev.type === 'match_completed') {
      counters.matches = (counters.matches ?? 0) + 1
      if (ev.winnerUid) counters[`wins_${ev.winnerUid}`] = (counters[`wins_${ev.winnerUid}`] ?? 0) + 1
    } else if (ev.type === 'wish_fulfilled') {
      counters.wishesDone = (counters.wishesDone ?? 0) + 1
    } else if (ev.type === 'forgive') {
      counters[`forgives_${ev.byUid}`] = (counters[`forgives_${ev.byUid}`] ?? 0) + 1
    }

    // فحص الأوسمة الجديدة
    const earned: string[] = []
    if ((counters.completedDates ?? 0) >= 1) earned.push('first_date')
    if (streak >= 5) earned.push('streak5')
    if (streak >= 10) earned.push('streak10')
    if ((counters.completedDates ?? 0) >= 20) earned.push('dates20')
    if ((counters.matches ?? 0) >= 10) earned.push('matches10')
    if (ev.type === 'match_completed' && ev.winnerUid && (counters[`wins_${ev.winnerUid}`] ?? 0) >= 1) earned.push('first_win')
    if (ev.type === 'forgive' && (counters[`forgives_${ev.byUid}`] ?? 0) >= 3) earned.push('forgiver3')
    if ((counters.wishesDone ?? 0) >= 5) earned.push('wishes5')

    tx.set(gRef, { points, streak, bestStreak, counters, lastCompletedAt: serverTimestamp() }, { merge: true })
    for (const key of earned) {
      const bRef = doc(db(), 'couples', cid, 'badges', key)
      tx.set(bRef, { badgeKey: key, earnedAt: serverTimestamp() }, { merge: true })
      newBadges.push(key)
    }
  })
  return newBadges
}

// ═══════════ المواعيد ═══════════
export async function proposeAppointment(cid: string, uid: string, when: Date, note?: string, autoConfirm = false, fromPrize = false) {
  await addDoc(col(cid, 'appointments'), {
    scheduledAt: Timestamp.fromDate(when),
    proposedBy: uid,
    status: autoConfirm ? 'confirmed' : 'proposed',
    note: note ?? '',
    fromPrize,
    createdAt: serverTimestamp(),
  })
}

export async function setAppointmentStatus(cid: string, id: string, status: string) {
  await updateDoc(doc(db(), 'couples', cid, 'appointments', id), { status })
}

export async function rescheduleAppointment(cid: string, id: string, uid: string, when: Date) {
  await updateDoc(doc(db(), 'couples', cid, 'appointments', id), {
    scheduledAt: Timestamp.fromDate(when), proposedBy: uid, status: 'proposed',
  })
}

export async function settleCompleted(cid: string, id: string) {
  await updateDoc(doc(db(), 'couples', cid, 'appointments', id), {
    status: 'completed', resolvedAt: serverTimestamp(),
  })
  const badges = await applyGameEvent(cid, { type: 'date_completed' })
  await bumpChallenge(cid)
  return badges
}

export async function settleMissed(cid: string, id: string, missedBy: string) {
  await updateDoc(doc(db(), 'couples', cid, 'appointments', id), {
    status: 'missed', missedBy, resolvedAt: serverTimestamp(),
  })
  await addDoc(col(cid, 'penalties'), {
    appointmentId: id, offenderUid: missedBy, status: 'pending_spin', createdAt: serverTimestamp(),
  })
  await applyGameEvent(cid, { type: 'date_missed' })
}

// ═══════════ العقوبات ═══════════
export async function addPunishment(cid: string, uid: string, text: string) {
  await addDoc(col(cid, 'punishments'), { text, addedBy: uid, active: true })
}
export async function togglePunishment(cid: string, id: string, active: boolean) {
  await updateDoc(doc(db(), 'couples', cid, 'punishments', id), { active })
}

export async function assignPenalty(cid: string, penaltyId: string, punishmentText: string) {
  await updateDoc(doc(db(), 'couples', cid, 'penalties', penaltyId), {
    status: 'assigned', punishmentText, spunAt: serverTimestamp(),
  })
}
export async function forgivePenalty(cid: string, penaltyId: string, byUid: string) {
  await updateDoc(doc(db(), 'couples', cid, 'penalties', penaltyId), { status: 'forgiven' })
  return applyGameEvent(cid, { type: 'forgive', byUid })
}
export async function penaltyDone(cid: string, penaltyId: string) {
  await updateDoc(doc(db(), 'couples', cid, 'penalties', penaltyId), { status: 'done' })
  return applyGameEvent(cid, { type: 'penalty_done' })
}

// ═══════════ إشارة المزاج ═══════════
export async function sendSignal(cid: string, uid: string) {
  await addDoc(col(cid, 'signals'), { fromUid: uid, status: 'sent', createdAt: serverTimestamp() })
}
export async function respondSignal(cid: string, id: string, status: 'seen' | 'accepted' | 'later') {
  await updateDoc(doc(db(), 'couples', cid, 'signals', id), { status, respondedAt: serverTimestamp() })
}

// ═══════════ المباريات ═══════════
function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function createMatch(cid: string, uid: string, gameType: GameType, prize: Prize) {
  await addDoc(col(cid, 'matches'), {
    gameType, prize, createdBy: uid, status: 'waiting', state: null,
    prizeSettled: prize === 'none', createdAt: serverTimestamp(),
  })
}

export async function acceptMatch(cid: string, m: Match, accepterUid: string) {
  const p1 = m.createdBy, p2 = accepterUid
  let state: XoState | RpsState | WhoState | TruthState
  if (m.gameType === 'xo') {
    state = { board: Array(9).fill(''), xUid: p1, oUid: p2, turn: p1, round: 1 }
  } else if (m.gameType === 'rps') {
    state = { round: 1, picks: { [p1]: '', [p2]: '' }, scores: { [p1]: 0, [p2]: 0 } }
  } else if (m.gameType === 'who_of_us') {
    state = {
      qIndex: 0,
      questionIds: shuffled(WHO_QUESTIONS.map((_, i) => i)).slice(0, 10),
      answers: { [p1]: [], [p2]: [] }, matched: 0,
    }
  } else {
    state = {
      round: 0, drawerUid: p1, cardId: null, cardKind: null, usedCards: [],
      scores: { [p1]: 0, [p2]: 0 }, phase: 'draw',
    }
  }
  await updateDoc(doc(db(), 'couples', cid, 'matches', m.id), { status: 'playing', state })
}

export async function abandonMatch(cid: string, id: string) {
  await updateDoc(doc(db(), 'couples', cid, 'matches', id), { status: 'abandoned' })
}

async function finishMatch(cid: string, id: string, winnerUid: string | 'draw') {
  await updateDoc(doc(db(), 'couples', cid, 'matches', id), { status: 'finished', winnerUid })
  return applyGameEvent(cid, { type: 'match_completed', winnerUid: winnerUid === 'draw' ? undefined : winnerUid })
}

// —— إكس-أو ——
const XO_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

export async function xoMove(cid: string, m: Match, uid: string, cell: number) {
  const s = m.state as XoState
  if (m.status !== 'playing' || s.turn !== uid || s.board[cell] !== '') return
  const mark = uid === s.xUid ? 'x' : 'o'
  const board = [...s.board]
  board[cell] = mark
  const other = uid === s.xUid ? s.oUid : s.xUid
  const won = XO_LINES.some(l => l.every(i => board[i] === mark))
  if (won) {
    await updateDoc(doc(db(), 'couples', cid, 'matches', m.id), { state: { ...s, board } })
    await finishMatch(cid, m.id, uid)
  } else if (board.every(c => c !== '')) {
    // تعادل → جولة جديدة (التعادل يعيد الجولة)
    await updateDoc(doc(db(), 'couples', cid, 'matches', m.id), {
      state: { ...s, board: Array(9).fill(''), turn: other, round: s.round + 1 },
    })
  } else {
    await updateDoc(doc(db(), 'couples', cid, 'matches', m.id), { state: { ...s, board, turn: other } })
  }
}

// —— حجرة ورقة مقص ——
const RPS_BEATS: Record<RpsPick, RpsPick> = { rock: 'scissors', paper: 'rock', scissors: 'paper' }

export async function rpsPick(cid: string, m: Match, uid: string, pick: RpsPick) {
  const s = m.state as RpsState
  if (m.status !== 'playing' || s.picks[uid]) return
  const other = Object.keys(s.picks).find(k => k !== uid)!
  const picks = { ...s.picks, [uid]: pick }
  if (!picks[other]) {
    await updateDoc(doc(db(), 'couples', cid, 'matches', m.id), { state: { ...s, picks } })
    return
  }
  // الطرفان اختارا → كشف وحسم الجولة
  const a = picks[uid] as RpsPick, b = picks[other] as RpsPick
  let winner: string | 'draw' = 'draw'
  if (a !== b) winner = RPS_BEATS[a] === b ? uid : other
  const scores = { ...s.scores }
  if (winner !== 'draw') scores[winner] = (scores[winner] ?? 0) + 1
  const lastResult = { picks: { [uid]: a, [other]: b }, winner }
  const matchWinner = Object.entries(scores).find(([, v]) => v >= 2)
  if (matchWinner) {
    await updateDoc(doc(db(), 'couples', cid, 'matches', m.id), {
      state: { ...s, picks, scores, lastResult },
    })
    await finishMatch(cid, m.id, matchWinner[0])
  } else {
    await updateDoc(doc(db(), 'couples', cid, 'matches', m.id), {
      state: { round: s.round + (winner === 'draw' ? 0 : 1), picks: { [uid]: '', [other]: '' }, scores, lastResult },
    })
  }
}

// —— من منا؟ ——
export async function whoAnswer(cid: string, m: Match, uid: string, answer: 'me' | 'partner') {
  const s = m.state as WhoState
  if (m.status !== 'playing') return
  const other = Object.keys(s.answers).find(k => k !== uid)!
  const mine = [...(s.answers[uid] ?? [])]
  if (mine.length > s.qIndex) return // جاوبت على هذا السؤال
  mine.push(answer)
  const answers = { ...s.answers, [uid]: mine }
  const theirs = answers[other] ?? []
  if (theirs.length <= s.qIndex) {
    await updateDoc(doc(db(), 'couples', cid, 'matches', m.id), { state: { ...s, answers } })
    return
  }
  // الطرفان جاوبا — التطابق يعني اتفقا على نفس الشخص (me عندي = partner عنده)
  const match = mine[s.qIndex] !== theirs[s.qIndex]
  const matched = s.matched + (match ? 1 : 0)
  const lastReveal = { q: s.qIndex, match }
  if (s.qIndex >= 9) {
    await updateDoc(doc(db(), 'couples', cid, 'matches', m.id), {
      state: { ...s, answers, matched, lastReveal },
    })
    // فائز الحظ (إذا فيه رهان) — عشوائي
    const uids = Object.keys(s.answers)
    const lucky = m.prize === 'none' ? 'draw' : uids[Math.floor(Math.random() * uids.length)]
    await finishMatch(cid, m.id, lucky)
  } else {
    await updateDoc(doc(db(), 'couples', cid, 'matches', m.id), {
      state: { ...s, answers, matched, lastReveal, qIndex: s.qIndex + 1 },
    })
  }
}

// —— صارحني / تحدي ——
export async function truthDraw(cid: string, m: Match, kind: 'truth' | 'dare') {
  const s = m.state as TruthState
  if (m.status !== 'playing' || s.phase !== 'draw') return
  const pool = TRUTH_CARDS.filter(c => c.kind === kind && !s.usedCards.includes(c.id))
  const card = pool[Math.floor(Math.random() * pool.length)] ?? TRUTH_CARDS.find(c => c.kind === kind)!
  await updateDoc(doc(db(), 'couples', cid, 'matches', m.id), {
    state: { ...s, cardId: card.id, cardKind: kind, usedCards: [...s.usedCards, card.id], phase: 'judge' },
  })
}

export async function truthJudge(cid: string, m: Match, judgeUid: string, accepted: boolean) {
  const s = m.state as TruthState
  if (m.status !== 'playing' || s.phase !== 'judge' || judgeUid === s.drawerUid) return
  const scores = { ...s.scores }
  if (accepted) scores[s.drawerUid] = (scores[s.drawerUid] ?? 0) + 1
  const round = s.round + 1
  if (round >= 10) {
    await updateDoc(doc(db(), 'couples', cid, 'matches', m.id), { state: { ...s, scores, round } })
    const uids = Object.keys(scores)
    const [a, b] = uids
    let winner: string | 'draw'
    if (scores[a] === scores[b]) winner = m.prize === 'none' ? 'draw' : uids[Math.floor(Math.random() * 2)]
    else winner = scores[a] > scores[b] ? a : b
    await finishMatch(cid, m.id, winner)
  } else {
    await updateDoc(doc(db(), 'couples', cid, 'matches', m.id), {
      state: { ...s, scores, round, drawerUid: judgeUid, cardId: null, cardKind: null, phase: 'draw' },
    })
  }
}

// —— تسوية الجوائز ——
export async function settlePrizeWish(cid: string, m: Match, winnerUid: string, loserUid: string, text: string) {
  await addDoc(col(cid, 'wishes'), {
    fromUid: winnerUid, toUid: loserUid, text, matchId: m.id, status: 'pending', createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db(), 'couples', cid, 'matches', m.id), { prizeSettled: true })
}

export async function settlePrizeDate(cid: string, m: Match, winnerUid: string, when: Date, note?: string) {
  await proposeAppointment(cid, winnerUid, when, note, true, true)
  await updateDoc(doc(db(), 'couples', cid, 'matches', m.id), { prizeSettled: true })
}

export async function skipPrize(cid: string, matchId: string) {
  await updateDoc(doc(db(), 'couples', cid, 'matches', matchId), { prizeSettled: true })
}

export async function fulfillWish(cid: string, wishId: string) {
  await updateDoc(doc(db(), 'couples', cid, 'wishes', wishId), { status: 'fulfilled' })
  return applyGameEvent(cid, { type: 'wish_fulfilled' })
}

// ═══════════ التحدي الشهري ═══════════
export const monthKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export async function setChallenge(cid: string, targetCount: number, rewardText: string) {
  await setDoc(doc(db(), 'couples', cid, 'challenges', monthKey()), {
    targetCount, rewardText, doneCount: 0, status: 'active',
  }, { merge: true })
}

async function bumpChallenge(cid: string) {
  const ref = doc(db(), 'couples', cid, 'challenges', monthKey())
  const snap = await getDoc(ref)
  if (!snap.exists() || snap.data().status !== 'active') return
  const done = (snap.data().doneCount ?? 0) + 1
  if (done >= snap.data().targetCount) {
    await updateDoc(ref, { doneCount: increment(1), status: 'won' })
    await setDoc(doc(db(), 'couples', cid, 'badges', 'challenge_won'),
      { badgeKey: 'challenge_won', earnedAt: serverTimestamp() }, { merge: true })
  } else {
    await updateDoc(ref, { doneCount: increment(1) })
  }
}
