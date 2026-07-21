import { useApp } from '../context/AppContext'
import { fulfillWish } from '../lib/data'

export default function Wishes() {
  const { user, couple, wishes, partnerName } = useApp()
  const uid = user!.uid
  const cid = couple!.id

  const onMe = wishes.filter(w => w.toUid === uid)
  const onPartner = wishes.filter(w => w.toUid !== uid)

  return (
    <div className="p-4 pb-28 space-y-3 relative z-10">
      <h1 className="text-lg font-extrabold">💝 قائمة الأماني</h1>
      <p className="text-xs text-lavender/60">أماني الفائزين من الألعاب — التزامات ما تنتسى 😄</p>

      {wishes.length === 0 && (
        <div className="glass p-8 text-center text-sm text-lavender/70">
          <div className="text-3xl mb-2">💫</div>
          ما فيه أماني بعد — العبوا وتراهنوا عليها من صالة الألعاب!
        </div>
      )}

      {onMe.length > 0 && <div className="text-sm font-extrabold mt-2">عليك أنت 🙈</div>}
      {onMe.map(w => (
        <div key={w.id} className={`glass p-4 ${w.status === 'fulfilled' ? 'opacity-55' : ''}`}>
          <div className="text-xs text-lavender/60 mb-1">أمنية {partnerName} — من فوزه بلعبة 🏆</div>
          <div className="font-bold mb-2">«{w.text}»</div>
          {w.status === 'pending' ? (
            <button className="btn-primary w-full py-2.5 text-sm" onClick={() => fulfillWish(cid, w.id)}>
              نفذتها ✅ (+٥ نقاط)
            </button>
          ) : (
            <span className="chip chip-done">✓ منفذة — كفو!</span>
          )}
        </div>
      ))}

      {onPartner.length > 0 && <div className="text-sm font-extrabold mt-2">على {partnerName} 😎</div>}
      {onPartner.map(w => (
        <div key={w.id} className={`glass p-4 ${w.status === 'fulfilled' ? 'opacity-55' : ''}`}>
          <div className="text-xs text-lavender/60 mb-1">أمنيتك — {partnerName} ملزم فيها</div>
          <div className="font-bold mb-2">«{w.text}»</div>
          {w.status === 'pending'
            ? <span className="chip chip-wait">⏳ بانتظار التنفيذ</span>
            : <span className="chip chip-done">✓ حققها لك 💝</span>}
        </div>
      ))}
    </div>
  )
}
