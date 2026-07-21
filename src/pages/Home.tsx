import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { proposeAppointment, respondSignal, sendSignal, setChallenge } from '../lib/data'
import { dayName, relDays, timeStr, tsDate } from '../lib/dates'
import { levelForPoints, SIGNAL_RESPONSES } from '../lib/content'
import type { Tab } from '../lib/types'
import { Modal } from './Schedule'

const toArabicNum = (n: number) => new Intl.NumberFormat('ar-SA-u-ca-gregory-nu-arab').format(n)
const SIGNAL_TTL = 12 * 3600000

export default function Home({ onTab }: { onTab: (t: Tab) => void }) {
  const { user, couple, myName, partnerName, appointments, signals, penalties, wishes, game, matches, challenge } = useApp()
  const uid = user!.uid
  const cid = couple!.id
  const [showChallenge, setShowChallenge] = useState(false)
  const [target, setTarget] = useState('8')
  const [reward, setReward] = useState('')

  const next = useMemo(() =>
    [...appointments]
      .filter(a => (a.status === 'confirmed' || a.status === 'proposed') && tsDate(a.scheduledAt).getTime() > Date.now())
      .sort((a, b) => tsDate(a.scheduledAt).getTime() - tsDate(b.scheduledAt).getTime())[0],
  [appointments])

  const activeSignals = useMemo(() =>
    signals.filter(s => Date.now() - tsDate(s.createdAt).getTime() < SIGNAL_TTL),
  [signals])
  const incoming = activeSignals.find(s => s.fromUid !== uid && (s.status === 'sent' || s.status === 'seen'))
  const outgoing = activeSignals.find(s => s.fromUid === uid)
  const matchedTonight = activeSignals.find(s => s.status === 'accepted')

  const myPendingSpin = penalties.find(p => p.offenderUid === uid && p.status === 'pending_spin')
  const myWishesTodo = wishes.filter(w => w.toUid === uid && w.status === 'pending')
  const invite = matches.find(m => m.status === 'waiting' && m.createdBy !== uid)

  const lvl = levelForPoints(game?.points ?? 0)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء النور' : 'مساء الخير'

  return (
    <div className="p-4 pb-28 space-y-3 relative z-10">
      {/* الترويسة */}
      <div className="flex items-center justify-between">
        <div>
          <div className="gold-glow text-2xl font-extrabold">ميثاق</div>
          <div className="text-xs text-lavender/70">{greeting} {myName} 👋</div>
        </div>
        <div className="flex items-center">
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-night-950 z-10"
            style={{ background: 'linear-gradient(135deg,#6a55b5,#544294)' }}>{myName.charAt(0) || 'أ'}</span>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-night-950 -mr-2"
            style={{ background: 'linear-gradient(135deg,#b0568f,#94427a)' }}>{partnerName.charAt(0) || 'ش'}</span>
        </div>
      </div>

      {/* تنبيهات مهمة */}
      {myPendingSpin && (
        <button className="glass p-3.5 w-full text-right anim-popin" style={{ borderColor: 'rgba(240,217,168,.55)' }}
          onClick={() => onTab('games')}>
          <span className="text-sm font-bold">😅 عليك عقوبة! </span>
          <span className="text-xs text-lavender/70">ادخل دوّر العجلة 🎡</span>
        </button>
      )}
      {invite && (
        <button className="glass p-3.5 w-full text-right anim-popin" style={{ borderColor: 'rgba(240,217,168,.55)' }}
          onClick={() => onTab('games')}>
          <span className="text-sm font-bold">🎮 {partnerName} يتحداك! </span>
          <span className="text-xs text-lavender/70">ادخل صالة الألعاب واقبل التحدي</span>
        </button>
      )}

      {/* الموعد القادم */}
      <div className="glass p-4 flex items-center gap-3.5">
        {next ? (
          <>
            <div className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center"
              style={{ background: 'conic-gradient(#f0d9a8 0 70%, rgba(240,217,168,.15) 70% 100%)' }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-[10px] font-extrabold text-center leading-3.5"
                style={{ background: '#161129' }}>
                {relDays(tsDate(next.scheduledAt))}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-lavender/60 mb-0.5">موعدكم القادم</div>
              <div className="text-base font-extrabold">{dayName(tsDate(next.scheduledAt))} {timeStr(tsDate(next.scheduledAt))}</div>
              <div className="text-[11px] text-lavender/70">
                {next.status === 'confirmed' ? '✓ مؤكد' : '⏳ بانتظار التأكيد'}
                {next.fromPrize ? ' · 🏆 جايزة لعبة' : ''}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1">
            <div className="text-sm font-bold mb-0.5">ما فيه موعد قادم 🌙</div>
            <button className="text-xs text-gold" onClick={() => onTab('schedule')}>+ اقترح موعد الحين</button>
          </div>
        )}
      </div>

      {/* إشارة المزاج */}
      {matchedTonight ? (
        <div className="glass p-4 anim-popin" style={{ borderColor: 'rgba(64,201,176,.5)' }}>
          <div className="text-sm font-extrabold mb-1">💞 إشارتكم تطابقت الليلة!</div>
          {!next || tsDate(next.scheduledAt).getTime() > Date.now() + 20 * 3600000 ? (
            <button className="btn-primary shimmer w-full py-2.5 text-sm mt-1"
              onClick={() => {
                const d = new Date(); d.setHours(22, 0, 0, 0)
                if (d.getTime() < Date.now()) d.setTime(Date.now() + 45 * 60000)
                proposeAppointment(cid, uid, d, 'من تطابق الإشارة 💞', true)
              }}>
              🌙 اعتماد موعد الليلة بضغطة
            </button>
          ) : <div className="text-xs text-lavender/70">وموعدكم جاهز — ليلة موفقة 😉</div>}
        </div>
      ) : incoming ? (
        <div className="glass p-4 anim-popin" style={{ borderColor: 'rgba(148,66,122,.6)' }}>
          <div className="text-sm font-extrabold mb-2.5">🌙 {partnerName} أرسل لك إشارة الليلة...</div>
          <div className="grid grid-cols-1 gap-2">
            <button className="btn-primary shimmer py-2.5 text-sm" onClick={() => respondSignal(cid, incoming.id, 'accepted')}>
              {SIGNAL_RESPONSES.accepted}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn-ghost py-2 text-xs" onClick={() => respondSignal(cid, incoming.id, 'seen')}>
                {SIGNAL_RESPONSES.seen}
              </button>
              <button className="btn-ghost py-2 text-xs" onClick={() => respondSignal(cid, incoming.id, 'later')}>
                {SIGNAL_RESPONSES.later}
              </button>
            </div>
          </div>
        </div>
      ) : outgoing ? (
        <div className="glass p-4">
          <div className="text-sm font-bold">🌙 إشارتك مرسلة</div>
          <div className="text-xs text-lavender/70 mt-1">
            {outgoing.status === 'sent' && `بانتظار ${partnerName} يشوفها...`}
            {outgoing.status === 'seen' && `${partnerName} شافها 👀`}
            {outgoing.status === 'later' && `${partnerName}: الليلة صعبة، يعوّضك 🌙`}
            {outgoing.status === 'accepted' && 'تطابقتوا! ❤️'}
          </div>
        </div>
      ) : (
        <button className="btn-primary shimmer w-full py-4 text-base" onClick={() => sendSignal(cid, uid)}>
          🌙 أرسل إشارة الليلة
          <span className="block text-[10px] font-normal opacity-85 mt-0.5">تظهر لـ{partnerName} فورًا وبسرية تامة</span>
        </button>
      )}

      {/* اختصارات */}
      <div className="grid grid-cols-3 gap-2.5">
        <button className="glass py-3 flex flex-col items-center gap-1 active:scale-95 transition-transform" onClick={() => onTab('games')}>
          <span className="text-xl">🎮</span><span className="text-[11px] font-bold">الألعاب</span>
        </button>
        <button className="glass py-3 flex flex-col items-center gap-1 active:scale-95 transition-transform" onClick={() => onTab('games')}>
          <span className="text-xl">🎡</span><span className="text-[11px] font-bold">العجلة</span>
        </button>
        <button className="glass py-3 flex flex-col items-center gap-1 active:scale-95 transition-transform relative" onClick={() => onTab('wishes')}>
          <span className="text-xl">💝</span><span className="text-[11px] font-bold">الأماني</span>
          {myWishesTodo.length > 0 && (
            <span className="absolute top-1.5 left-2 bg-plum text-[9px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
              {toArabicNum(myWishesTodo.length)}
            </span>
          )}
        </button>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="glass py-2.5 text-center">
          <div className="text-sm font-extrabold">🔥 {toArabicNum(game?.streak ?? 0)}</div>
          <div className="text-[9px] text-lavender/60 mt-0.5">السلسلة (أفضل: {toArabicNum(game?.bestStreak ?? 0)})</div>
        </div>
        <div className="glass py-2.5 text-center">
          <div className="text-sm font-extrabold">⭐ {toArabicNum(game?.points ?? 0)}</div>
          <div className="text-[9px] text-lavender/60 mt-0.5">النقاط</div>
        </div>
        <div className="glass py-2.5 text-center">
          <div className="text-sm font-extrabold">{lvl.title}</div>
          <div className="text-[9px] text-lavender/60 mt-0.5">المستوى {toArabicNum(lvl.level)}</div>
        </div>
      </div>

      {/* التحدي الشهري */}
      {challenge ? (
        <div className="glass p-3.5">
          <div className="flex justify-between text-[11px] mb-2">
            <span>🎯 تحدي الشهر: {toArabicNum(challenge.doneCount)} / {toArabicNum(challenge.targetCount)} موعد</span>
            <span className="text-lavender/60">{challenge.status === 'won' ? '🏆 فزتوا!' : `الجايزة: ${challenge.rewardText}`}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.12)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (challenge.doneCount / challenge.targetCount) * 100)}%`,
                background: 'linear-gradient(90deg,#f0d9a8,#e8919f)',
              }} />
          </div>
        </div>
      ) : (
        <button className="glass p-3.5 w-full text-right" onClick={() => setShowChallenge(true)}>
          <span className="text-sm font-bold">🎯 حطوا تحدي الشهر </span>
          <span className="text-xs text-lavender/60">— هدف مواعيد + جايزة تتفقون عليها</span>
        </button>
      )}

      {showChallenge && (
        <Modal onClose={() => setShowChallenge(false)}>
          <div className="text-lg font-extrabold mb-3">🎯 تحدي الشهر</div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-lavender/70 block mb-1">كم موعد هدفكم هالشهر؟</label>
              <input type="number" min={1} max={31} className="field" dir="ltr" value={target} onChange={e => setTarget(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-lavender/70 block mb-1">وجايزتكم إذا حققتوه؟</label>
              <input className="field" placeholder="عشاء فاخر، رحلة، هدية..." value={reward} onChange={e => setReward(e.target.value)} />
            </div>
            <button className="btn-primary w-full py-3" disabled={!reward.trim() || !Number(target)}
              onClick={async () => { await setChallenge(cid, Number(target), reward.trim()); setShowChallenge(false) }}>
              اعتماد التحدي 🎯
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
