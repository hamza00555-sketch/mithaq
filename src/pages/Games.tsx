import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { GAME_META, PRIZE_META } from '../lib/content'
import {
  abandonMatch, acceptMatch, createMatch, settlePrizeDate, settlePrizeWish, skipPrize,
} from '../lib/data'
import type { GameType, Match, Prize } from '../lib/types'
import { DatePickerModal, Modal } from './Schedule'
import Confetti from '../components/Confetti'
import MoodGames from './MoodGames'
import XoGame from './games/XoGame'
import RpsGame from './games/RpsGame'
import WhoGame from './games/WhoGame'
import TruthGame from './games/TruthGame'
import BrandArt from '../components/BrandArt'
import Icon, { type IconName } from '../components/Icon'

const GAME_ICONS: Record<GameType, IconName> = {
  xo: 'grid',
  rps: 'hand',
  who_of_us: 'people',
  truth_cards: 'cards',
}

const PRIZE_ICONS: Record<Prize, IconName> = {
  decide_date: 'calendar',
  wish: 'wish',
  none: 'spark',
}

export default function Games() {
  const { user, couple, matches, partnerName } = useApp()
  const uid = user!.uid
  const cid = couple!.id
  const [creating, setCreating] = useState<GameType | null>(null)
  const [prize, setPrize] = useState<Prize>('wish')
  const [wishText, setWishText] = useState('')
  const [pickDate, setPickDate] = useState<Match | null>(null)
  const [moodView, setMoodView] = useState(false)

  const activeMatch = matches.find(m => m.status === 'waiting' || m.status === 'playing')
  const unsettled = matches.find(m => m.status === 'finished' && !m.prizeSettled)

  // ═══ ألعاب الأجواء (محلية — من جوال واحد) ═══
  if (moodView) return <MoodGames onBack={() => setMoodView(false)} />

  // ═══ مباراة جارية ═══
  if (activeMatch?.status === 'playing') {
    const G = { xo: XoGame, rps: RpsGame, who_of_us: WhoGame, truth_cards: TruthGame }[activeMatch.gameType]
    return (
      <div className="p-4 pb-28 space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="page-title">
            <span className="icon-orb lavender"><Icon name={GAME_ICONS[activeMatch.gameType]} size={21} /></span>
            <h1>{GAME_META[activeMatch.gameType].name}</h1>
          </div>
          <button className="text-xs text-lavender/60 inline-flex items-center gap-1" onClick={() => abandonMatch(cid, activeMatch.id)}>إنهاء <Icon name="close" size={14} /></button>
        </div>
        <div className="glass px-4 py-2.5 text-xs text-lavender/80">
          <span className="inline-flex items-center gap-2">الرهان: <Icon name={PRIZE_ICONS[activeMatch.prize]} size={15} className="text-gold" /> {PRIZE_META[activeMatch.prize].name}</span>
        </div>
        <G match={activeMatch} />
      </div>
    )
  }

  return (
    <div className="p-4 pb-28 space-y-3 relative z-10">
      <div className="page-title-row">
        <div className="page-title">
          <span className="icon-orb lavender"><Icon name="games" size={21} /></span>
          <h1>صالة الألعاب</h1>
        </div>
      </div>
      <BrandArt name="games" />

      {/* دعوة واردة */}
      {activeMatch?.status === 'waiting' && activeMatch.createdBy !== uid && (
        <div className="glass p-4 anim-popin" style={{ borderColor: 'rgba(159,86,101,.24)' }}>
          <div className="font-extrabold mb-1">
            <span className="inline-flex items-center gap-2"><Icon name={GAME_ICONS[activeMatch.gameType]} size={18} className="text-gold" /> {partnerName} يتحداك في {GAME_META[activeMatch.gameType].name}</span>
          </div>
          <div className="text-xs text-lavender/70 mb-3">
            <span className="inline-flex items-center gap-1.5">الرهان: <Icon name={PRIZE_ICONS[activeMatch.prize]} size={14} /> {PRIZE_META[activeMatch.prize].name}</span>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary shimmer flex-1 py-2.5 text-sm" onClick={() => acceptMatch(cid, activeMatch, uid)}>
              أقبل التحدي
            </button>
            <button className="btn-ghost px-4 text-sm" onClick={() => abandonMatch(cid, activeMatch.id)}>لاحقًا</button>
          </div>
        </div>
      )}

      {/* بانتظار قبول الطرف الثاني */}
      {activeMatch?.status === 'waiting' && activeMatch.createdBy === uid && (
        <div className="glass p-4">
          <div className="text-sm flex items-center gap-2"><Icon name="clock" size={17} className="text-gold" /> بانتظار {partnerName} يقبل تحدي {GAME_META[activeMatch.gameType].name}...</div>
          <button className="text-xs text-lavender/60 mt-2" onClick={() => abandonMatch(cid, activeMatch.id)}>إلغاء التحدي</button>
        </div>
      )}

      {/* تسوية جايزة */}
      {unsettled && (
        <PrizeSettlement
          m={unsettled} uid={uid} partnerName={partnerName}
          wishText={wishText} setWishText={setWishText}
          onWish={async () => {
            const loser = couple!.members.find(x => x !== uid)!
            await settlePrizeWish(cid, unsettled, uid, loser, wishText.trim())
            setWishText('')
          }}
          onDate={() => setPickDate(unsettled)}
          onSkip={() => skipPrize(cid, unsettled.id)}
        />
      )}

      {/* ألعاب الأجواء */}
      <button className="glass p-0 overflow-hidden w-full text-right active:scale-[.98] transition-transform anim-popin"
        style={{ borderColor: 'rgba(139,91,76,.16)' }}
        onClick={() => setMoodView(true)}>
        <BrandArt name="mood-games" className="!rounded-none !border-0 !aspect-[16/5.8]" />
        <div className="feature-row p-3.5">
          <span className="icon-orb rose"><Icon name="flame" size={20} /></span>
          <div className="feature-row-copy">
            <div className="feature-row-title">ألعاب الأجواء</div>
            <div className="feature-row-desc">نرد، بطاقات، وعجلة — سوا من جوال واحد</div>
          </div>
          <Icon name="arrow" size={17} className="opacity-35 rotate-180" />
        </div>
      </button>

      {/* قائمة الألعاب */}
      {!activeMatch && (
        <>
          <p className="text-xs text-lavender/60">أو تحدَّ {partnerName} — تلعبونها كل واحد من جواله</p>
          {(Object.keys(GAME_META) as GameType[]).map(g => (
            <button key={g} className="glass p-3.5 flex items-center gap-3 w-full text-right active:scale-[.98] transition-transform"
              onClick={() => setCreating(g)}>
              <span className="icon-orb lavender"><Icon name={GAME_ICONS[g]} size={20} /></span>
              <div className="flex-1">
                <div className="text-sm font-extrabold">{GAME_META[g].name}</div>
                <div className="text-[11px] text-lavender/65">{GAME_META[g].desc}</div>
              </div>
              <Icon name="arrow" size={17} className="opacity-35 rotate-180" />
            </button>
          ))}
        </>
      )}

      {/* اختيار الرهان */}
      {creating && (
        <Modal onClose={() => setCreating(null)}>
          <div className="text-lg font-extrabold mb-1 flex items-center gap-2"><Icon name={GAME_ICONS[creating]} size={20} className="text-gold" /> {GAME_META[creating].name}</div>
          <p className="text-xs text-lavender/70 mb-4">وش الرهان؟</p>
          <div className="space-y-2 mb-4">
            {(Object.keys(PRIZE_META) as Prize[]).map(p => (
              <button key={p} onClick={() => setPrize(p)}
                className={`w-full text-right p-3 rounded-2xl border transition-colors ${prize === p ? 'border-gold bg-gold/10' : 'border-lavender/20 bg-[#fffaf5]/70'}`}>
                <div className="text-sm font-bold inline-flex items-center gap-2"><Icon name={PRIZE_ICONS[p]} size={16} /> {PRIZE_META[p].name}</div>
                <div className="text-[11px] text-lavender/60">{PRIZE_META[p].desc}</div>
              </button>
            ))}
          </div>
          <button className="btn-primary shimmer w-full py-3"
            onClick={async () => { await createMatch(cid, uid, creating, prize); setCreating(null) }}>
            <span className="inline-flex items-center gap-2"><Icon name="games" size={17} /> إرسال التحدي لـ{partnerName}</span>
          </button>
        </Modal>
      )}

      {pickDate && (
        <DatePickerModal
          title="فزت! حدد الموعد الجاي"
          confirmLabel="اعتماد الموعد تلقائيًا"
          onClose={() => setPickDate(null)}
          onPick={async (when, note) => { await settlePrizeDate(cid, pickDate, uid, when, note); setPickDate(null) }}
        />
      )}

      {/* آخر النتائج */}
      {matches.filter(m => m.status === 'finished').slice(0, 5).map(m => (
        <div key={m.id} className="glass px-4 py-2.5 flex items-center justify-between text-xs text-lavender/70">
          <span className="inline-flex items-center gap-1.5"><Icon name={GAME_ICONS[m.gameType]} size={14} /> {GAME_META[m.gameType].name}</span>
          <span>
            {m.winnerUid === 'draw' ? 'تعادل' : m.winnerUid === uid ? 'فزت أنت' : `فاز ${partnerName}`}
          </span>
        </div>
      ))}
    </div>
  )
}

function PrizeSettlement({ m, uid, partnerName, wishText, setWishText, onWish, onDate, onSkip }: {
  m: Match; uid: string; partnerName: string
  wishText: string; setWishText: (s: string) => void
  onWish: () => Promise<void>; onDate: () => void; onSkip: () => void
}) {
  const iWon = m.winnerUid === uid
  if (m.winnerUid === 'draw') {
    return (
      <div className="glass p-4">
        <div className="text-sm flex items-center gap-2"><Icon name="people" size={17} className="text-lavender" /> انتهت بالتعادل — ما فيه جايزة هالمرة</div>
        <button className="btn-ghost w-full py-2 mt-2 text-sm" onClick={onSkip}>تمام</button>
      </div>
    )
  }
  if (!iWon) {
    return (
      <div className="glass p-4 text-sm">
        <span className="inline-flex items-center gap-2"><Icon name="clock" size={17} className="text-gold" /> فاز {partnerName}! بانتظاره يحدد {m.prize === 'wish' ? 'أمنيته...' : 'الموعد...'}</span>
      </div>
    )
  }
  return (
    <div className="glass p-4 anim-popin" style={{ borderColor: 'rgba(159,86,101,.24)' }}>
      <Confetti />
      <div className="font-extrabold mb-2 flex items-center gap-2"><Icon name="trophy" size={20} className="text-gold" /> مبروك، فزت!</div>
      {m.prize === 'wish' ? (
        <>
          <p className="text-xs text-lavender/70 mb-3">اكتب أمنيتك — و{partnerName} ملزم يحققها</p>
          <input className="field mb-2" placeholder="أمنيتي هي..." value={wishText} onChange={e => setWishText(e.target.value)} />
          <button className="btn-gold w-full py-2.5 text-sm" disabled={!wishText.trim()} onClick={onWish}>
            <span className="inline-flex items-center gap-2"><Icon name="wish" size={16} /> تسجيل الأمنية</span>
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-lavender/70 mb-3">من حقك تحدد الموعد الجاي — وينحط مؤكد مباشرة</p>
          <button className="btn-gold w-full py-2.5 text-sm" onClick={onDate}><span className="inline-flex items-center gap-2"><Icon name="calendar" size={16} /> تحديد الموعد</span></button>
        </>
      )}
    </div>
  )
}
