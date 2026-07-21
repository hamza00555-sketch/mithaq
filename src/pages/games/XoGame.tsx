import { useApp } from '../../context/AppContext'
import { xoMove } from '../../lib/data'
import type { Match, XoState } from '../../lib/types'

export default function XoGame({ match }: { match: Match }) {
  const { user, couple, partnerName } = useApp()
  const uid = user!.uid
  const s = match.state as XoState
  const myMark = uid === s.xUid ? 'x' : 'o'
  const myTurn = s.turn === uid

  return (
    <div className="glass p-5">
      <div className="flex justify-between text-xs mb-4">
        <span className={myMark === 'x' ? 'text-gold font-bold' : 'text-lavender/70'}>✕ {myMark === 'x' ? 'أنت' : partnerName}</span>
        <span className="text-lavender/50">الجولة {new Intl.NumberFormat('ar-SA-u-ca-gregory-nu-arab').format(s.round)}</span>
        <span className={myMark === 'o' ? 'text-lavender font-bold' : 'text-lavender/70'}>◯ {myMark === 'o' ? 'أنت' : partnerName}</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5 max-w-70 mx-auto">
        {s.board.map((c, i) => (
          <button key={i} className="xo-cell" disabled={!myTurn || c !== ''}
            onClick={() => xoMove(couple!.id, match, uid, i)}>
            {c === 'x' && <span className="xo-x anim-popin">✕</span>}
            {c === 'o' && <span className="xo-o anim-popin">◯</span>}
          </button>
        ))}
      </div>
      <div className="text-center text-sm mt-4">
        {myTurn
          ? <span className="text-gold font-bold animate-pulse">دورك — العب! 🎯</span>
          : <span className="text-lavender/60">دور {partnerName}... ⏳</span>}
      </div>
    </div>
  )
}
