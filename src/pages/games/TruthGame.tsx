import { useApp } from '../../context/AppContext'
import { TRUTH_CARDS } from '../../lib/content'
import { truthDraw, truthJudge } from '../../lib/data'
import type { Match, TruthState } from '../../lib/types'
import Icon from '../../components/Icon'

const toArabicNum = (n: number) => new Intl.NumberFormat('ar-SA-u-ca-gregory-nu-arab').format(n)

export default function TruthGame({ match }: { match: Match }) {
  const { user, couple, partnerName } = useApp()
  const uid = user!.uid
  const s = match.state as TruthState
  const other = Object.keys(s.scores).find(k => k !== uid)!
  const myDraw = s.drawerUid === uid
  const card = s.cardId != null ? TRUTH_CARDS.find(c => c.id === s.cardId) : null

  return (
    <div className="glass p-5">
      <div className="flex justify-between text-xs text-lavender/60 mb-4">
        <span className="inline-flex items-center gap-1">نقاطك: {toArabicNum(s.scores[uid] ?? 0)} <Icon name="star" size={12} /></span>
        <span>البطاقة {toArabicNum(s.round + 1)} / ١٠</span>
        <span className="inline-flex items-center gap-1">{partnerName}: {toArabicNum(s.scores[other] ?? 0)} <Icon name="star" size={12} /></span>
      </div>

      {s.phase === 'draw' && (
        myDraw ? (
          <>
            <p className="text-center text-sm mb-5 text-gold font-bold animate-pulse">دورك — اسحب بطاقة</p>
            <div className="grid grid-cols-2 gap-3">
              <button className="btn-primary py-6 text-base" onClick={() => truthDraw(couple!.id, match, 'truth')}>
                <span className="inline-flex items-center gap-2"><Icon name="chat" size={19} /> صارحني</span>
              </button>
              <button className="btn-gold py-6 text-base" onClick={() => truthDraw(couple!.id, match, 'dare')}>
                <span className="inline-flex items-center gap-2"><Icon name="flame" size={19} /> تحدي</span>
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-sm text-lavender/60 py-8">دور {partnerName} يسحب بطاقة...</p>
        )
      )}

      {s.phase === 'judge' && card && (
        <>
          <div className="glass p-5 text-center anim-popin mb-4"
            style={{ borderColor: card.kind === 'dare' ? 'rgba(216,166,90,.28)' : 'rgba(184,115,127,.28)' }}>
            <div className="text-[10px] text-lavender/60 mb-2 inline-flex items-center gap-1"><Icon name={card.kind === 'dare' ? 'flame' : 'chat'} size={13} /> {card.kind === 'dare' ? 'تحدي' : 'صارحني'} — على {myDraw ? 'ك أنت' : ` ${partnerName}`}</div>
            <div className="text-base font-extrabold leading-8">{card.text}</div>
          </div>
          {myDraw ? (
            <p className="text-center text-sm text-lavender/60">
              {card.kind === 'dare' ? 'نفّذ التحدي' : 'جاوب بصدق'} قدام {partnerName}... وهو يحكم عليك
            </p>
          ) : (
            <>
              <p className="text-center text-sm mb-3">أنت الحَكَم — {partnerName} {card.kind === 'dare' ? 'نفّذ التحدي؟' : 'جاوب بصدق وقنعك؟'}</p>
              <div className="grid grid-cols-2 gap-3">
                <button className="btn-primary py-3 text-sm" onClick={() => truthJudge(couple!.id, match, uid, true)}>
                  <span className="inline-flex items-center gap-1"><Icon name="check" size={15} /> قبلت (+١ له)</span>
                </button>
                <button className="btn-ghost py-3 text-sm" onClick={() => truthJudge(couple!.id, match, uid, false)}>
                  <span className="inline-flex items-center gap-1"><Icon name="close" size={15} /> ما قنعني</span>
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
