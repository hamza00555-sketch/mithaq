import { useApp } from '../../context/AppContext'
import { rpsPick } from '../../lib/data'
import type { Match, RpsPick, RpsState } from '../../lib/types'

const PICKS: { id: RpsPick; icon: string; name: string }[] = [
  { id: 'rock', icon: '🪨', name: 'حجرة' },
  { id: 'paper', icon: '📄', name: 'ورقة' },
  { id: 'scissors', icon: '✂️', name: 'مقص' },
]
const ICON: Record<RpsPick, string> = { rock: '🪨', paper: '📄', scissors: '✂️' }
const toArabicNum = (n: number) => new Intl.NumberFormat('ar-SA-u-ca-gregory-nu-arab').format(n)

export default function RpsGame({ match }: { match: Match }) {
  const { user, couple, partnerName } = useApp()
  const uid = user!.uid
  const s = match.state as RpsState
  const other = Object.keys(s.picks).find(k => k !== uid)!
  const iPicked = Boolean(s.picks[uid])
  const theyPicked = Boolean(s.picks[other])

  return (
    <div className="glass p-5">
      <div className="flex justify-between text-sm font-bold mb-1">
        <span>أنت: {toArabicNum(s.scores[uid] ?? 0)}</span>
        <span className="text-xs text-lavender/50 font-normal">أفضل من ٣ · الجولة {toArabicNum(s.round)}</span>
        <span>{partnerName}: {toArabicNum(s.scores[other] ?? 0)}</span>
      </div>

      {s.lastResult && (
        <div className="glass px-3 py-2 my-3 flex items-center justify-center gap-4 text-2xl anim-popin">
          <span>{ICON[s.lastResult.picks[uid]]}</span>
          <span className="text-xs text-lavender/70">
            {s.lastResult.winner === 'draw' ? '🤝 تعادل — نعيد' : s.lastResult.winner === uid ? '🎉 لك' : `👏 لـ${partnerName}`}
          </span>
          <span>{ICON[s.lastResult.picks[other]]}</span>
        </div>
      )}

      <p className="text-center text-sm my-4">
        {!iPicked
          ? <span className="text-gold font-bold animate-pulse">اختر سرًا — {partnerName} ما يشوف اختيارك 🤫</span>
          : theyPicked
            ? 'انكشفت الأوراق! 👆'
            : <span className="text-lavender/60">اخترت ✓ — بانتظار {partnerName}... ⏳</span>}
      </p>

      <div className="grid grid-cols-3 gap-3">
        {PICKS.map(p => (
          <button key={p.id} disabled={iPicked}
            className={`glass p-4 flex flex-col items-center gap-1 active:scale-95 transition-transform ${iPicked && s.picks[uid] === p.id ? 'border-gold!' : ''} ${iPicked ? 'opacity-50' : ''}`}
            onClick={() => rpsPick(couple!.id, match, uid, p.id)}>
            <span className="text-3xl">{p.icon}</span>
            <span className="text-xs font-bold">{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
