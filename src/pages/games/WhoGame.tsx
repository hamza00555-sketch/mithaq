import { useApp } from '../../context/AppContext'
import { WHO_QUESTIONS } from '../../lib/content'
import { whoAnswer } from '../../lib/data'
import type { Match, WhoState } from '../../lib/types'

const toArabicNum = (n: number) => new Intl.NumberFormat('ar-SA-u-ca-gregory-nu-arab').format(n)

export default function WhoGame({ match }: { match: Match }) {
  const { user, couple, partnerName } = useApp()
  const uid = user!.uid
  const s = match.state as WhoState
  const other = Object.keys(s.answers).find(k => k !== uid)!
  const iAnswered = (s.answers[uid]?.length ?? 0) > s.qIndex
  const theyAnswered = (s.answers[other]?.length ?? 0) > s.qIndex
  const q = WHO_QUESTIONS[s.questionIds[s.qIndex]]

  return (
    <div className="glass p-5">
      <div className="flex justify-between text-xs text-lavender/60 mb-3">
        <span>السؤال {toArabicNum(s.qIndex + 1)} / ١٠</span>
        <span>تطابقتوا: {toArabicNum(s.matched)} 💞</span>
      </div>

      {s.lastReveal && s.lastReveal.q === s.qIndex - 1 && (
        <div className={`glass px-3 py-2 mb-3 text-center text-sm anim-popin ${s.lastReveal.match ? 'text-mint' : 'text-lavender/70'}`}>
          {s.lastReveal.match ? '💞 تطابقتوا بالسؤال اللي فات!' : '🙈 اختلفتوا بالسؤال اللي فات'}
        </div>
      )}

      <div className="text-center text-lg font-extrabold leading-9 my-6">{q}</div>

      {!iAnswered ? (
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-primary py-4" onClick={() => whoAnswer(couple!.id, match, uid, 'me')}>أنا 🙋</button>
          <button className="btn-ghost py-4" onClick={() => whoAnswer(couple!.id, match, uid, 'partner')}>{partnerName} 👉</button>
        </div>
      ) : (
        <p className="text-center text-sm text-lavender/60">
          {theyAnswered ? '...' : `جاوبت ✓ — بانتظار ${partnerName} يجاوب... ⏳`}
        </p>
      )}
    </div>
  )
}
