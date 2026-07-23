import { useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { addPunishment, assignPenalty, penaltyDone, togglePunishment } from '../lib/data'
import type { Penalty } from '../lib/types'
import BrandArt from '../components/BrandArt'
import Icon, { type IconName } from '../components/Icon'

const SEG_COLORS = ['#c9876b', '#b8737f', '#d8a65a', '#d3a083', '#9f5665', '#e1b87a', '#a96e5a', '#7d5a60']
const SEG_ICONS: IconName[] = ['spark', 'moon', 'wish', 'games', 'calendar', 'heart', 'flame', 'star']

export default function Wheel() {
  const { user, couple, penalties, punishments, partnerName } = useApp()
  const uid = user!.uid
  const cid = couple!.id
  const [newText, setNewText] = useState('')
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [landed, setLanded] = useState<string | null>(null)
  const pendingRef = useRef<Penalty | null>(null)

  const active = useMemo(() => punishments.filter(p => p.active), [punishments])
  const myPending = penalties.find(p => p.offenderUid === uid && p.status === 'pending_spin')
  const partnerPending = penalties.find(p => p.offenderUid !== uid && p.status === 'pending_spin')
  const assigned = penalties.filter(p => p.status === 'assigned')

  const spin = () => {
    if (!myPending || active.length === 0 || spinning) return
    pendingRef.current = myPending
    const idx = Math.floor(Math.random() * active.length)
    const seg = 360 / active.length
    const target = 360 * 5 + (360 - (idx + 0.5) * seg)
    setSpinning(true)
    setLanded(null)
    setRotation(r => r + target - (r % 360))
    setTimeout(async () => {
      setSpinning(false)
      setLanded(active[idx].text)
      await assignPenalty(cid, pendingRef.current!.id, active[idx].text)
    }, 4200)
  }

  const wheelBg = useMemo(() => {
    if (active.length === 0) return '#c9876b'
    const seg = 360 / active.length
    const stops = active.map((_, i) =>
      `${SEG_COLORS[i % SEG_COLORS.length]} ${i * seg}deg ${(i + 1) * seg}deg`)
    return `conic-gradient(${stops.join(',')})`
  }, [active])

  return (
    <div className="p-4 pb-28 space-y-3 relative z-10">
      <div className="page-title-row">
        <div className="page-title">
          <span className="icon-orb rose"><Icon name="wheel" size={21} /></span>
          <h1>عجلة العقاب</h1>
        </div>
      </div>
      <BrandArt name="wheel" />

      {myPending ? (
        <div className="glass p-4" style={{ borderColor: 'rgba(159,86,101,.24)' }}>
          <div className="text-sm font-bold flex items-center gap-2"><Icon name="alert" size={17} className="text-rose-soft" /> عليك عقوبة معلقة</div>
          <div className="text-xs text-lavender/70 mt-1">خلفت الموعد... العجلة بتقرر مصيرك</div>
        </div>
      ) : partnerPending ? (
        <div className="glass p-4">
          <div className="text-sm flex items-center gap-2"><Icon name="clock" size={17} className="text-gold" /> في انتظار {partnerName} يدور العجلة على عقوبته</div>
        </div>
      ) : assigned.length === 0 ? (
        <div className="glass p-4 text-sm text-lavender/70 flex items-center gap-2"><Icon name="spark" size={17} className="text-gold" /> ما فيه عقوبات معلقة — استمروا بالالتزام</div>
      ) : null}

      {/* العجلة */}
      <div className="glass p-5 flex flex-col items-center gap-4">
        <div className="wheel-pointer -mb-2 z-10" />
        <div className="relative">
          <div className="wheel-face w-56 h-56 relative overflow-hidden"
            style={{
              background: wheelBg,
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4.2s cubic-bezier(.12,.68,.15,1)' : 'none',
            }}>
            {active.map((p, i) => {
              const seg = 360 / active.length
              return (
                <div key={p.id} className="absolute inset-0 flex justify-center pt-2.5"
                  style={{ transform: `rotate(${(i + 0.5) * seg}deg)` }}>
                  <span className="text-[13px]" style={{ filter: 'drop-shadow(0 1px 2px rgba(73,54,60,.2))' }}><Icon name={SEG_ICONS[i % SEG_ICONS.length]} size={14} /></span>
                </div>
              )
            })}
          </div>
          <div className="absolute inset-0 m-auto w-13 h-13 rounded-full flex items-center justify-center text-xl"
            style={{ background: '#fffaf5', border: '3px solid #d7b38d', width: 52, height: 52 }}>
            <Icon name="target" size={20} className="text-gold" />
          </div>
        </div>

        {landed && (
          <div className="glass p-3 text-center anim-popin w-full" style={{ borderColor: 'rgba(159,86,101,.24)' }}>
            <div className="text-xs text-lavender/70 mb-1">العجلة حكمت! عقوبتك:</div>
            <div className="font-extrabold text-gold">{landed}</div>
          </div>
        )}

        {myPending && (
          <button className="btn-gold px-10 py-3 text-base" onClick={spin} disabled={spinning || active.length === 0}>
            <span className="inline-flex items-center gap-2"><Icon name="wheel" size={18} /> {spinning ? 'تدور...' : 'دوّر العجلة'}</span>
          </button>
        )}
      </div>

      {/* العقوبات المعينة */}
      {assigned.map(p => {
        const mine = p.offenderUid === uid
        return (
          <div key={p.id} className="glass p-4">
            <div className="text-xs text-lavender/70 mb-1">{mine ? 'عقوبتك الحالية:' : `عقوبة ${partnerName}:`}</div>
            <div className="font-extrabold mb-3">{p.punishmentText}</div>
            <div className="flex gap-2">
              {mine ? (
                <button className="btn-primary flex-1 py-2.5 text-sm" onClick={() => penaltyDone(cid, p.id)}>
                  <span className="inline-flex items-center gap-2"><Icon name="check" size={16} /> نفذتها (+٣ نقاط)</span>
                </button>
              ) : (
                <button className="btn-ghost flex-1 py-2.5 text-sm" onClick={() => penaltyDone(cid, p.id)}>
                  <span className="inline-flex items-center gap-2"><Icon name="check" size={16} /> تم التنفيذ</span>
                </button>
              )}
            </div>
          </div>
        )
      })}

      {/* إدارة قائمة العقوبات */}
      <div className="glass p-4">
        <div className="text-sm font-extrabold mb-3 flex items-center gap-2"><Icon name="cards" size={17} className="text-gold" /> قائمة العقوبات المتفق عليها</div>
        <div className="space-y-2 mb-3">
          {punishments.map(p => (
            <label key={p.id} className="flex items-center gap-2.5 text-sm">
              <input type="checkbox" checked={p.active} onChange={e => togglePunishment(cid, p.id, e.target.checked)}
                className="accent-[#9f5665] w-4 h-4" />
              <span className={p.active ? '' : 'opacity-40 line-through'}>{p.text}</span>
            </label>
          ))}
        </div>
        <form className="flex gap-2" onSubmit={async e => {
          e.preventDefault()
          if (!newText.trim()) return
          await addPunishment(cid, uid, newText.trim())
          setNewText('')
        }}>
          <input className="field flex-1" placeholder="عقوبة جديدة..." value={newText} onChange={e => setNewText(e.target.value)} />
          <button className="btn-ghost px-4">إضافة</button>
        </form>
      </div>
    </div>
  )
}
