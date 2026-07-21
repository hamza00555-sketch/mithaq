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

      {/* شرح مبسط */}
      <div className="glass p-4" style={{ borderColor: 'rgba(240,217,168,.4)' }}>
        <div className="text-sm font-extrabold mb-2">وش هي الأماني؟ 🤔</div>
        <div className="text-[12.5px] text-lavender/85 leading-6 space-y-1.5">
          <div>١. تلعبون لعبة في <b>صالة الألعاب</b> وتختارون الرهان «<b>أمنية للفائز</b>» 🎮</div>
          <div>٢. اللي يفوز يكتب <b>أمنية</b> يبيها من الثاني 🌟</div>
          <div>٣. الخاسر <b>ملزم يحققها</b>، ولما يسويها يضغط «نفذتها» ✅</div>
        </div>
        <div className="text-[11px] text-lavender/55 mt-2.5">هنا تلقون كل الأماني المعلّقة — التزامات حلوة ما تنتسى 😄</div>
      </div>

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
