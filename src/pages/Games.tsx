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
          <h1 className="text-lg font-extrabold">{GAME_META[activeMatch.gameType].icon} {GAME_META[activeMatch.gameType].name}</h1>
          <button className="text-xs text-lavender/60" onClick={() => abandonMatch(cid, activeMatch.id)}>إنهاء ✕</button>
        </div>
        <div className="glass px-4 py-2.5 text-xs text-lavender/80">
          الرهان: {PRIZE_META[activeMatch.prize].icon} {PRIZE_META[activeMatch.prize].name}
        </div>
        <G match={activeMatch} />
      </div>
    )
  }

  return (
    <div className="p-4 pb-28 space-y-3 relative z-10">
      <h1 className="text-lg font-extrabold">🎮 صالة الألعاب</h1>

      {/* دعوة واردة */}
      {activeMatch?.status === 'waiting' && activeMatch.createdBy !== uid && (
        <div className="glass p-4 anim-popin" style={{ borderColor: 'rgba(240,217,168,.55)' }}>
          <div className="font-extrabold mb-1">
            {GAME_META[activeMatch.gameType].icon} {partnerName} يتحداك في {GAME_META[activeMatch.gameType].name}!
          </div>
          <div className="text-xs text-lavender/70 mb-3">
            الرهان: {PRIZE_META[activeMatch.prize].icon} {PRIZE_META[activeMatch.prize].name}
          </div>
          <div className="flex gap-2">
            <button className="btn-primary shimmer flex-1 py-2.5 text-sm" onClick={() => acceptMatch(cid, activeMatch, uid)}>
              أقبل التحدي 😤
            </button>
            <button className="btn-ghost px-4 text-sm" onClick={() => abandonMatch(cid, activeMatch.id)}>لاحقًا</button>
          </div>
        </div>
      )}

      {/* بانتظار قبول الطرف الثاني */}
      {activeMatch?.status === 'waiting' && activeMatch.createdBy === uid && (
        <div className="glass p-4">
          <div className="text-sm">⏳ بانتظار {partnerName} يقبل تحدي {GAME_META[activeMatch.gameType].name}...</div>
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
      <button className="glass p-3.5 flex items-center gap-3 w-full text-right active:scale-[.98] transition-transform anim-popin"
        style={{ borderColor: 'rgba(240,217,168,.5)', background: 'linear-gradient(120deg, rgba(148,66,122,.22), rgba(84,66,148,.18))' }}
        onClick={() => setMoodView(true)}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: 'rgba(148,66,122,.35)', border: '1px solid rgba(240,217,168,.4)' }}>
          🔥
        </div>
        <div className="flex-1">
          <div className="text-sm font-extrabold">ألعاب الأجواء</div>
          <div className="text-[11px] text-lavender/65">نرد الجو، بطاقات، وعجلة — سوا من جوال واحد لتدفئة الجو 😏</div>
        </div>
        <span className="opacity-40">‹</span>
      </button>

      {/* قائمة الألعاب */}
      {!activeMatch && (
        <>
          <p className="text-xs text-lavender/60">أو تحدَّ {partnerName} — تلعبونها كل واحد من جواله 📱</p>
          {(Object.keys(GAME_META) as GameType[]).map(g => (
            <button key={g} className="glass p-3.5 flex items-center gap-3 w-full text-right active:scale-[.98] transition-transform"
              onClick={() => setCreating(g)}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: 'rgba(84,66,148,.3)', border: '1px solid rgba(122,92,201,.4)' }}>
                {GAME_META[g].icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-extrabold">{GAME_META[g].name}</div>
                <div className="text-[11px] text-lavender/65">{GAME_META[g].desc}</div>
              </div>
              <span className="opacity-40">‹</span>
            </button>
          ))}
        </>
      )}

      {/* اختيار الرهان */}
      {creating && (
        <Modal onClose={() => setCreating(null)}>
          <div className="text-lg font-extrabold mb-1">{GAME_META[creating].icon} {GAME_META[creating].name}</div>
          <p className="text-xs text-lavender/70 mb-4">وش الرهان؟ 😏</p>
          <div className="space-y-2 mb-4">
            {(Object.keys(PRIZE_META) as Prize[]).map(p => (
              <button key={p} onClick={() => setPrize(p)}
                className={`w-full text-right p-3 rounded-2xl border transition-colors ${prize === p ? 'border-gold bg-gold/10' : 'border-lavender/20 bg-white/5'}`}>
                <div className="text-sm font-bold">{PRIZE_META[p].icon} {PRIZE_META[p].name}</div>
                <div className="text-[11px] text-lavender/60">{PRIZE_META[p].desc}</div>
              </button>
            ))}
          </div>
          <button className="btn-primary shimmer w-full py-3"
            onClick={async () => { await createMatch(cid, uid, creating, prize); setCreating(null) }}>
            🎮 إرسال التحدي لـ{partnerName}
          </button>
        </Modal>
      )}

      {pickDate && (
        <DatePickerModal
          title="🏆 فزت! حدد الموعد الجاي"
          confirmLabel="اعتماد الموعد (مؤكد تلقائيًا) 🏆"
          onClose={() => setPickDate(null)}
          onPick={async (when, note) => { await settlePrizeDate(cid, pickDate, uid, when, note); setPickDate(null) }}
        />
      )}

      {/* آخر النتائج */}
      {matches.filter(m => m.status === 'finished').slice(0, 5).map(m => (
        <div key={m.id} className="glass px-4 py-2.5 flex items-center justify-between text-xs text-lavender/70">
          <span>{GAME_META[m.gameType].icon} {GAME_META[m.gameType].name}</span>
          <span>
            {m.winnerUid === 'draw' ? '🤝 تعادل' : m.winnerUid === uid ? '🏆 فزت أنت' : `🏆 فاز ${partnerName}`}
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
        <div className="text-sm">🤝 انتهت بالتعادل — ما فيه جايزة هالمرة</div>
        <button className="btn-ghost w-full py-2 mt-2 text-sm" onClick={onSkip}>تمام</button>
      </div>
    )
  }
  if (!iWon) {
    return (
      <div className="glass p-4 text-sm">
        😅 فاز {partnerName}! بانتظاره يحدد {m.prize === 'wish' ? 'أمنيته...' : 'الموعد...'}
      </div>
    )
  }
  return (
    <div className="glass p-4 anim-popin" style={{ borderColor: 'rgba(240,217,168,.55)' }}>
      <Confetti />
      <div className="font-extrabold mb-2">🎉 مبروك، فزت!</div>
      {m.prize === 'wish' ? (
        <>
          <p className="text-xs text-lavender/70 mb-3">اكتب أمنيتك — و{partnerName} ملزم يحققها 😎</p>
          <input className="field mb-2" placeholder="أمنيتي هي..." value={wishText} onChange={e => setWishText(e.target.value)} />
          <button className="btn-gold w-full py-2.5 text-sm" disabled={!wishText.trim()} onClick={onWish}>
            تسجيل الأمنية 💝
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-lavender/70 mb-3">من حقك تحدد الموعد الجاي — وينحط مؤكد بدون نقاش 😏</p>
          <button className="btn-gold w-full py-2.5 text-sm" onClick={onDate}>📅 تحديد الموعد</button>
        </>
      )}
    </div>
  )
}
