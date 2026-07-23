import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { proposeAppointment, respondSignal, sendSignal, setChallenge } from '../lib/data'
import { dayName, relDays, timeStr, tsDate } from '../lib/dates'
import { levelForPoints, SIGNAL_RESPONSES } from '../lib/content'
import type { Tab } from '../lib/types'
import { Modal } from './Schedule'
import BrandArt from '../components/BrandArt'
import BrandMark from '../components/BrandMark'
import Icon from '../components/Icon'

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
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-3">
          <BrandMark size={48} />
          <div>
            <div className="gold-glow text-2xl font-extrabold leading-7">ميثاق</div>
            <div className="text-[11px] text-lavender/55">{greeting} {myName}</div>
          </div>
        </div>
        <div className="flex items-center">
          <span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 border-night-950 z-10 shadow-lg"
            style={{ background: 'linear-gradient(135deg,#c9876b,#ad6652)' }}>{myName.charAt(0) || 'أ'}</span>
          <span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 border-night-950 -mr-2 shadow-lg"
            style={{ background: 'linear-gradient(135deg,#c98790,#9f5665)' }}>{partnerName.charAt(0) || 'ش'}</span>
        </div>
      </div>

      {/* تنبيهات مهمة */}
      {myPendingSpin && (
        <button className="glass p-3.5 w-full text-right anim-popin feature-row" style={{ borderColor: 'rgba(159,86,101,.22)' }}
          onClick={() => onTab('games')}>
          <span className="icon-orb rose"><Icon name="alert" size={20} /></span>
          <span className="feature-row-copy">
            <span className="feature-row-title block">عليك عقوبة معلقة</span>
            <span className="feature-row-desc">ادخل ودوّر العجلة</span>
          </span>
          <Icon name="arrow" size={17} className="opacity-35 rotate-180" />
        </button>
      )}
      {invite && (
        <button className="glass p-3.5 w-full text-right anim-popin feature-row" style={{ borderColor: 'rgba(159,86,101,.22)' }}
          onClick={() => onTab('games')}>
          <span className="icon-orb lavender"><Icon name="games" size={20} /></span>
          <span className="feature-row-copy">
            <span className="feature-row-title block">{partnerName} يتحداك</span>
            <span className="feature-row-desc">ادخل صالة الألعاب واقبل التحدي</span>
          </span>
          <Icon name="arrow" size={17} className="opacity-35 rotate-180" />
        </button>
      )}

      {/* الموعد القادم */}
      <div className="glass p-4 flex items-center gap-3.5">
        {next ? (
          <>
            <div className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center"
              style={{ background: 'conic-gradient(#d8a65a 0 70%, rgba(216,166,90,.14) 70% 100%)' }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-[10px] font-extrabold text-center leading-3.5"
                style={{ background: '#fffaf5' }}>
                {relDays(tsDate(next.scheduledAt))}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-lavender/60 mb-0.5">موعدكم القادم</div>
              <div className="text-base font-extrabold">{dayName(tsDate(next.scheduledAt))} {timeStr(tsDate(next.scheduledAt))}</div>
              <div className="text-[11px] text-lavender/70 flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <Icon name={next.status === 'confirmed' ? 'check' : 'clock'} size={12} />
                  {next.status === 'confirmed' ? 'مؤكد' : 'بانتظار التأكيد'}
                </span>
                {next.fromPrize && <span className="inline-flex items-center gap-1"><Icon name="trophy" size={12} /> جايزة لعبة</span>}
              </div>
            </div>
          </>
        ) : (
          <>
            <span className="icon-orb"><Icon name="calendar" size={21} /></span>
            <div className="flex-1">
              <div className="text-sm font-bold mb-0.5">ما فيه موعد قادم</div>
              <button className="text-xs text-gold inline-flex items-center gap-1" onClick={() => onTab('schedule')}>
                <Icon name="plus" size={13} /> اقترح موعد الحين
              </button>
            </div>
          </>
        )}
      </div>

      {/* إشارة المزاج */}
      <div className="glass signal-card overflow-hidden">
        <BrandArt name="signal" className="home-signal-art !rounded-b-none !border-0" />
        <div className="p-4 pt-3 relative">
      {matchedTonight ? (
        <div className="anim-popin">
          <div className="flex items-center gap-2 text-sm font-extrabold mb-2"><Icon name="spark" size={18} className="text-mint" /> إشارتكم تطابقت الليلة</div>
          {!next || tsDate(next.scheduledAt).getTime() > Date.now() + 20 * 3600000 ? (
            <button className="btn-primary shimmer w-full py-2.5 text-sm"
              onClick={() => {
                const d = new Date(); d.setHours(22, 0, 0, 0)
                if (d.getTime() < Date.now()) d.setTime(Date.now() + 45 * 60000)
                proposeAppointment(cid, uid, d, 'من تطابق الإشارة', true)
              }}>
              <span className="inline-flex items-center gap-2"><Icon name="moon" size={17} /> اعتماد موعد الليلة</span>
            </button>
          ) : <div className="text-xs text-lavender/65">وموعدكم جاهز — ليلة موفقة</div>}
        </div>
      ) : incoming ? (
        <div className="anim-popin">
          <div className="flex items-center gap-2 text-sm font-extrabold mb-3"><Icon name="signal" size={18} className="text-rose-soft" /> {partnerName} أرسل لك إشارة</div>
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
        <div>
          <div className="flex items-center gap-2 text-sm font-bold"><Icon name="signal" size={18} className="text-gold" /> إشارتك في الطريق</div>
          <div className="text-xs text-lavender/65 mt-1.5">
            {outgoing.status === 'sent' && `بانتظار ${partnerName} يشوفها...`}
            {outgoing.status === 'seen' && `${partnerName} شافها`}
            {outgoing.status === 'later' && `${partnerName}: الليلة صعبة، يعوّضك`}
            {outgoing.status === 'accepted' && 'تطابقتوا'}
          </div>
        </div>
      ) : (
        <button className="btn-primary shimmer w-full py-3.5 text-base" onClick={() => sendSignal(cid, uid)}>
          <span className="inline-flex items-center gap-2"><Icon name="signal" size={19} /> أرسل إشارة الليلة</span>
          <span className="block text-[10px] font-normal opacity-75 mt-0.5">تظهر لـ{partnerName} فورًا وبخصوصية</span>
        </button>
      )}
        </div>
      </div>

      {/* اختصارات */}
      <div className="grid grid-cols-3 gap-2.5">
        <button className="glass py-3 flex flex-col items-center gap-1 active:scale-95 transition-transform" onClick={() => onTab('games')}>
          <span className="icon-orb lavender !w-9 !h-9"><Icon name="games" size={18} /></span><span className="text-[11px] font-bold">الألعاب</span>
        </button>
        <button className="glass py-3 flex flex-col items-center gap-1 active:scale-95 transition-transform" onClick={() => onTab('games')}>
          <span className="icon-orb rose !w-9 !h-9"><Icon name="wheel" size={18} /></span><span className="text-[11px] font-bold">العجلة</span>
        </button>
        <button className="glass py-3 flex flex-col items-center gap-1 active:scale-95 transition-transform relative" onClick={() => onTab('wishes')}>
          <span className="icon-orb !w-9 !h-9"><Icon name="wish" size={18} /></span><span className="text-[11px] font-bold">الأماني</span>
          {myWishesTodo.length > 0 && (
            <span className="absolute top-1.5 left-2 bg-plum text-[9px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
              {toArabicNum(myWishesTodo.length)}
            </span>
          )}
        </button>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="glass py-2.5 text-center stat-card">
          <div className="text-sm font-extrabold stat-value"><Icon name="flame" size={15} className="text-rose-soft" /> {toArabicNum(game?.streak ?? 0)}</div>
          <div className="text-[9px] text-lavender/60 mt-0.5">السلسلة (أفضل: {toArabicNum(game?.bestStreak ?? 0)})</div>
        </div>
        <div className="glass py-2.5 text-center stat-card">
          <div className="text-sm font-extrabold stat-value"><Icon name="star" size={15} /> {toArabicNum(game?.points ?? 0)}</div>
          <div className="text-[9px] text-lavender/60 mt-0.5">النقاط</div>
        </div>
        <div className="glass py-2.5 text-center stat-card">
          <div className="text-sm font-extrabold">{lvl.title}</div>
          <div className="text-[9px] text-lavender/60 mt-0.5">المستوى {toArabicNum(lvl.level)}</div>
        </div>
      </div>

      {/* التحدي الشهري */}
      {challenge ? (
        <div className="glass p-3.5">
          <div className="flex justify-between gap-2 text-[11px] mb-2">
            <span className="inline-flex items-center gap-1.5"><Icon name="target" size={14} /> تحدي الشهر: {toArabicNum(challenge.doneCount)} / {toArabicNum(challenge.targetCount)}</span>
            <span className="text-lavender/60">{challenge.status === 'won' ? 'فزتوا' : `الجايزة: ${challenge.rewardText}`}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill transition-all duration-700"
              style={{ width: `${Math.min(100, (challenge.doneCount / challenge.targetCount) * 100)}%` }} />
          </div>
        </div>
      ) : (
        <button className="glass p-3.5 feature-row" onClick={() => setShowChallenge(true)}>
          <span className="icon-orb"><Icon name="target" size={20} /></span>
          <span className="feature-row-copy">
            <span className="feature-row-title block">حطوا تحدي الشهر</span>
            <span className="feature-row-desc">هدف مواعيد + جايزة تتفقون عليها</span>
          </span>
          <Icon name="plus" size={17} className="text-gold" />
        </button>
      )}

      {showChallenge && (
        <Modal onClose={() => setShowChallenge(false)}>
          <div className="text-lg font-extrabold mb-3 flex items-center gap-2"><Icon name="target" size={20} className="text-gold" /> تحدي الشهر</div>
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
              اعتماد التحدي
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
