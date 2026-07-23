import { useMemo, useRef, useState } from 'react'
import { MOOD_CARDS, MOOD_DICE_ACTIONS, MOOD_DICE_TARGETS, MOOD_WHEEL } from '../lib/content'
import BrandArt from '../components/BrandArt'
import Icon, { type IconName } from '../components/Icon'

// ألعاب الأجواء 🔥 — محلية بالكامل (تلعبونها سوا من جوال واحد، بدون إنترنت)

type MoodTab = 'dice' | 'cards' | 'wheel'

export default function MoodGames({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<MoodTab>('dice')
  return (
    <div className="p-4 pb-28 space-y-3 relative z-10">
      <div className="page-title-row">
        <div className="page-title">
          <span className="icon-orb rose"><Icon name="flame" size={21} /></span>
          <h1>ألعاب الأجواء</h1>
        </div>
        <button className="text-xs text-lavender/60 inline-flex items-center gap-1" onClick={onBack}><Icon name="arrow" size={14} /> رجوع</button>
      </div>
      <BrandArt name="mood-games" />
      <p className="text-xs text-lavender/60">تلعبونها سوا من جوال واحد — مهمتها وحدة: تدفئة الجو.</p>

      <div className="flex gap-2">
        {([
          ['dice', 'dice', 'نرد الجو'],
          ['cards', 'cards', 'بطاقات'],
          ['wheel', 'wheel', 'عجلة'],
        ] as [MoodTab, IconName, string][]).map(([t, icon, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`chip inline-flex items-center gap-1 ${tab === t ? 'chip-done' : 'btn-ghost px-3 py-1 text-[11px]'}`}><Icon name={icon} size={13} />{label}</button>
        ))}
      </div>

      {tab === 'dice' && <MoodDice />}
      {tab === 'cards' && <MoodCards />}
      {tab === 'wheel' && <MoodWheel />}
    </div>
  )
}

/* ═══ 🎲 نرد الجو ═══ */
function MoodDice() {
  const [rolling, setRolling] = useState(false)
  const [action, setAction] = useState<number | null>(null)
  const [target, setTarget] = useState<number | null>(null)
  const [turn, setTurn] = useState(0) // 0 = الطرف الأول، 1 = الثاني
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const roll = () => {
    if (rolling) return
    setRolling(true)
    let ticks = 0
    timer.current = setInterval(() => {
      setAction(Math.floor(Math.random() * MOOD_DICE_ACTIONS.length))
      setTarget(Math.floor(Math.random() * MOOD_DICE_TARGETS.length))
      if (++ticks >= 12) {
        clearInterval(timer.current!)
        setRolling(false)
        setTurn(t => 1 - t)
      }
    }, 90)
  }

  return (
    <div className="glass p-5 text-center">
      <p className="text-xs text-lavender/60 mb-4">ارم النردين... والنتيجة تنفذونها على طول، بالتناوب.</p>
      <div className="flex justify-center gap-4 mb-4">
        <div className={`glass w-28 h-28 flex flex-col items-center justify-center gap-1 ${rolling ? 'animate-[popin_.12s_ease-in-out_infinite]' : ''}`}
          style={{ borderColor: 'rgba(216,166,90,.32)' }}>
          <span className="text-3xl">{action != null ? MOOD_DICE_ACTIONS[action].icon : '❓'}</span>
          <span className="text-xs font-bold">{action != null ? MOOD_DICE_ACTIONS[action].text : 'الفعل'}</span>
        </div>
        <div className={`glass w-28 h-28 flex flex-col items-center justify-center gap-1 px-2 ${rolling ? 'animate-[popin_.12s_ease-in-out_infinite]' : ''}`}
          style={{ borderColor: 'rgba(184,115,127,.32)' }}>
          <Icon name="target" size={30} className="text-rose-soft" />
          <span className="text-xs font-bold leading-5">{target != null ? MOOD_DICE_TARGETS[target] : 'المكان / المدة'}</span>
        </div>
      </div>
      {action != null && !rolling && (
        <div className="text-sm font-extrabold text-gold mb-3 anim-popin">
          {MOOD_DICE_ACTIONS[action].icon} {MOOD_DICE_ACTIONS[action].text} {MOOD_DICE_TARGETS[target!]} — بدون نقاش!
        </div>
      )}
      <button className="btn-primary shimmer px-10 py-3" onClick={roll} disabled={rolling}>
        <span className="inline-flex items-center gap-2"><Icon name="dice" size={18} />{rolling ? '...' : `${turn === 0 ? 'الدور الأول' : 'الدور الثاني'} — ارم النرد`}</span>
      </button>
    </div>
  )
}

/* ═══ 💌 بطاقات الأجواء ═══ */
function MoodCards() {
  const deck = useMemo(() => {
    const a = [...MOOD_CARDS.keys()]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }, [])
  const [idx, setIdx] = useState(-1)
  const done = idx >= deck.length - 1

  return (
    <div className="glass p-5 text-center">
      <p className="text-xs text-lavender/60 mb-4">اسحبوا بطاقة ونفذوها سوا... وحدة ورا وحدة.</p>
      {idx === -1 ? (
        <div className="glass w-52 h-64 mx-auto mb-4 flex flex-col items-center justify-center gap-2"
          style={{ background: 'linear-gradient(150deg, rgba(201,135,107,.22), rgba(184,115,127,.18))' }}>
          <Icon name="cards" size={40} className="text-rose-soft" />
          <span className="text-xs text-lavender/80">{MOOD_CARDS.length} بطاقة بانتظاركم</span>
        </div>
      ) : (
        <div key={idx} className="glass w-52 h-64 mx-auto mb-4 flex flex-col items-center justify-center gap-3 px-4 anim-popin"
          style={{ borderColor: 'rgba(216,166,90,.30)' }}>
          <span className="text-[10px] text-lavender/50">بطاقة {new Intl.NumberFormat('ar-SA-u-ca-gregory-nu-arab').format(idx + 1)}</span>
          <span className="text-sm font-extrabold leading-7">{MOOD_CARDS[deck[idx]]}</span>
        </div>
      )}
      <button className="btn-gold px-10 py-3" disabled={done} onClick={() => setIdx(i => i + 1)}>
        {idx === -1 ? 'اسحب أول بطاقة' : done ? 'خلصت البطاقات... كملوا بدونها' : 'البطاقة الجاية ←'}
      </button>
    </div>
  )
}

/* ═══ 🎡 عجلة الأجواء ═══ */
const WHEEL_COLORS = ['#c9876b', '#b8737f', '#d8a65a', '#ad806d', '#9f5665', '#b88745', '#7c9a86', '#c47758']

function MoodWheel() {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [landed, setLanded] = useState<string | null>(null)
  const n = MOOD_WHEEL.length
  const seg = 360 / n

  const bg = useMemo(() =>
    `conic-gradient(${MOOD_WHEEL.map((_, i) => `${WHEEL_COLORS[i % WHEEL_COLORS.length]} ${i * seg}deg ${(i + 1) * seg}deg`).join(',')})`,
  [seg])

  const spin = () => {
    if (spinning) return
    const idx = Math.floor(Math.random() * n)
    setSpinning(true)
    setLanded(null)
    setRotation(r => r + 360 * 5 + (360 - (idx + 0.5) * seg) - (r % 360))
    setTimeout(() => { setSpinning(false); setLanded(MOOD_WHEEL[idx]) }, 3700)
  }

  return (
    <div className="glass p-5 flex flex-col items-center gap-4">
      <p className="text-xs text-lavender/60">دورها... واللي تطلع تنفذونه على بعض فورًا.</p>
      <div className="wheel-pointer -mb-2 z-10" />
      <div className="relative">
        <div className="wheel-face w-52 h-52 relative overflow-hidden"
          style={{ background: bg, transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 3.7s cubic-bezier(.12,.68,.15,1)' : 'none' }}>
          {MOOD_WHEEL.map((t, i) => (
            <div key={i} className="absolute inset-0 flex justify-center pt-2"
              style={{ transform: `rotate(${(i + 0.5) * seg}deg)` }}>
              <span className="text-sm" style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,.5))' }}>{t.split(' ')[0]}</span>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 m-auto rounded-full flex items-center justify-center text-lg"
          style={{ background: '#fffaf5', border: '3px solid #d7b38d', width: 46, height: 46 }}><Icon name="flame" size={21} className="text-rose-soft" /></div>
      </div>
      {landed && (
        <div className="glass p-3 text-center anim-popin w-full" style={{ borderColor: 'rgba(216,166,90,.30)' }}>
          <div className="font-extrabold text-gold text-sm">{landed}</div>
        </div>
      )}
      <button className="btn-primary shimmer px-10 py-3" onClick={spin} disabled={spinning}>
        <span className="inline-flex items-center gap-2"><Icon name="wheel" size={18} />{spinning ? '...' : 'دوّر عجلة الأجواء'}</span>
      </button>
    </div>
  )
}
