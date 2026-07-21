import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  ensureScheduledAppointments, proposeAppointment, rescheduleAppointment,
  setAppointmentStatus, setWeeklySchedule, settleCompleted, settleMissed,
} from '../lib/data'
import { dayName, dayNum, defaultWhen, hmStr, monthShort, timeStr, tsDate, WEEKDAYS, WEEKDAYS_SHORT } from '../lib/dates'
import type { Appointment, WeeklySchedule } from '../lib/types'
import Confetti from '../components/Confetti'

const STATUS_CHIP: Record<string, { cls: string; label: string }> = {
  proposed: { cls: 'chip-wait', label: '⏳ بانتظار' },
  confirmed: { cls: 'chip-ok', label: '✓ مؤكد' },
  completed: { cls: 'chip-done', label: '✓ تم 🎉' },
  missed: { cls: 'chip-miss', label: '✗ ما تم' },
  declined: { cls: 'chip-miss', label: 'اعتُذر عنه' },
}

export default function Schedule() {
  const { user, couple, appointments, partnerName } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [reschedule, setReschedule] = useState<Appointment | null>(null)
  const [settling, setSettling] = useState<Appointment | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const uid = user!.uid
  const cid = couple!.id
  const sched = couple?.weeklySchedule ?? null

  const needsSettle = appointments.filter(a => a.status === 'confirmed' && tsDate(a.scheduledAt).getTime() < Date.now())

  // توليد مواعيد الجدول الأسبوعي تلقائيًا
  useEffect(() => {
    if (!sched || !sched.days?.length) return
    const ids = new Set(appointments.map(a => a.id))
    ensureScheduledAppointments(cid, sched, ids, uid).catch(() => {})
  }, [cid, uid, sched, appointments])

  return (
    <div className="p-4 pb-28 space-y-3 relative z-10">
      {celebrate && <Confetti />}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-extrabold">📅 المواعيد</h1>
        <button className="btn-gold px-4 py-2 text-sm" onClick={() => setShowAdd(true)}>＋ موعد جديد</button>
      </div>

      {/* الجدول الأسبوعي */}
      <button className="glass p-3.5 w-full text-right active:scale-[.98] transition-transform"
        style={{ borderColor: 'rgba(122,92,201,.45)' }} onClick={() => setShowSchedule(true)}>
        {sched && sched.days?.length ? (
          <>
            <div className="text-sm font-extrabold mb-0.5">🗓️ جدولكم الأسبوعي</div>
            <div className="text-[11px] text-lavender/75">
              {sched.days.map(d => WEEKDAYS[d]).join('، ')} · {hmStr(sched.hour, sched.minute)}
              <span className="text-lavender/50"> — تنضاف تلقائيًا كل أسبوع ✨</span>
            </div>
          </>
        ) : (
          <>
            <span className="text-sm font-bold">🗓️ حددوا جدولكم الأسبوعي </span>
            <span className="text-[11px] text-lavender/60">— بدل ما ترسلون طلب كل مرة، اتفقوا على أيام ثابتة</span>
          </>
        )}
      </button>

      {needsSettle.map(a => (
        <div key={`settle-${a.id}`} className="glass p-4 anim-popin" style={{ borderColor: 'rgba(240,217,168,.5)' }}>
          <div className="text-sm font-bold mb-1">🌙 موعد {dayName(tsDate(a.scheduledAt))} {timeStr(tsDate(a.scheduledAt))} مرّ وقته</div>
          <div className="text-xs text-lavender/70 mb-3">صارحونا... تم الموعد؟ 😄</div>
          <div className="flex gap-2">
            <button className="btn-primary flex-1 py-2.5 text-sm"
              onClick={async () => { await settleCompleted(cid, a.id); setCelebrate(true); setTimeout(() => setCelebrate(false), 3500) }}>
              تم ✅ (+١٠ نقاط)
            </button>
            <button className="btn-ghost flex-1 py-2.5 text-sm" onClick={() => setSettling(a)}>ما تم 😔</button>
          </div>
        </div>
      ))}

      {appointments.length === 0 && (
        <div className="glass p-8 text-center text-sm text-lavender/70">
          <div className="text-3xl mb-2">🌙</div>
          ما فيه مواعيد بعد — اقترح أول موعد لكم!
        </div>
      )}

      {appointments.map(a => {
        const d = tsDate(a.scheduledAt)
        const chip = STATUS_CHIP[a.status] ?? STATUS_CHIP.proposed
        const mine = a.proposedBy === uid
        return (
          <div key={a.id} className="glass p-3.5 flex items-center gap-3">
            <div className="w-12 h-13 rounded-xl flex flex-col items-center justify-center shrink-0 py-1.5"
              style={{ background: 'rgba(84,66,148,.28)', border: '1px solid rgba(122,92,201,.4)' }}>
              <span className="text-base font-extrabold leading-5">{dayNum(d)}</span>
              <span className="text-[9px] opacity-70">{monthShort(d)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-extrabold">{dayName(d)} {timeStr(d)}</div>
              <div className="text-[11px] text-lavender/70 truncate">
                {a.fromSchedule ? '🗓️ من جدولكم الأسبوعي' : a.fromPrize ? '🏆 جايزة لعبة' : mine ? 'اقترحته أنت' : `اقترحه ${partnerName}`}
                {a.note ? ` · ${a.note}` : ''}
              </div>
              {a.status === 'proposed' && !mine && (
                <div className="flex gap-1.5 mt-2">
                  <button className="chip chip-ok" onClick={() => setAppointmentStatus(cid, a.id, 'confirmed')}>أأكد ✓</button>
                  <button className="chip chip-wait" onClick={() => setReschedule(a)}>وقت ثاني 🔄</button>
                  <button className="chip chip-miss" onClick={() => setAppointmentStatus(cid, a.id, 'declined')}>أعتذر</button>
                </div>
              )}
            </div>
            <span className={`chip ${chip.cls}`}>{a.status === 'proposed' && mine ? `⏳ بانتظار ${partnerName}` : chip.label}</span>
          </div>
        )
      })}

      {(showAdd || reschedule) && (
        <DatePickerModal
          title={reschedule ? '🔄 اقتراح وقت بديل' : '🌙 موعد جديد'}
          onClose={() => { setShowAdd(false); setReschedule(null) }}
          onPick={async (when, note) => {
            if (reschedule) await rescheduleAppointment(cid, reschedule.id, uid, when)
            else await proposeAppointment(cid, uid, when, note)
            setShowAdd(false); setReschedule(null)
          }}
        />
      )}

      {settling && (
        <Modal onClose={() => setSettling(null)}>
          <div className="text-lg font-extrabold mb-1">😔 ما تم الموعد</div>
          <p className="text-sm text-lavender/70 mb-4">طيب... مين السبب؟ (بكل صراحة 😄) — اللي خلف عليه عقوبة من العجلة 🎡</p>
          <div className="space-y-2">
            <button className="btn-ghost w-full py-3" onClick={async () => { await settleMissed(cid, settling.id, uid); setSettling(null) }}>
              أنا السبب 🙋
            </button>
            <button className="btn-ghost w-full py-3" onClick={async () => {
              const other = couple!.members.find(m => m !== uid)!
              await settleMissed(cid, settling.id, other); setSettling(null)
            }}>
              {partnerName} السبب 👀
            </button>
          </div>
        </Modal>
      )}

      {showSchedule && (
        <WeeklyScheduleModal
          current={sched}
          onClose={() => setShowSchedule(false)}
          onSave={async s => { await setWeeklySchedule(cid, s); setShowSchedule(false) }}
        />
      )}
    </div>
  )
}

function WeeklyScheduleModal({ current, onClose, onSave }: {
  current: WeeklySchedule | null
  onClose: () => void
  onSave: (s: WeeklySchedule | null) => Promise<void>
}) {
  const [days, setDays] = useState<number[]>(current?.days ?? [])
  const [time, setTime] = useState(
    `${String(current?.hour ?? 21).padStart(2, '0')}:${String(current?.minute ?? 30).padStart(2, '0')}`,
  )
  const [busy, setBusy] = useState(false)
  const toggle = (d: number) => setDays(x => x.includes(d) ? x.filter(y => y !== d) : [...x, d].sort())

  return (
    <Modal onClose={onClose}>
      <div className="text-lg font-extrabold mb-1">🗓️ الجدول الأسبوعي</div>
      <p className="text-xs text-lavender/70 mb-4">اختاروا أيامكم الثابتة ووقتها — التطبيق يضيفها لكم مؤكدة كل أسبوع تلقائيًا 💜</p>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {WEEKDAYS_SHORT.map((name, d) => (
          <button key={d} onClick={() => toggle(d)}
            className={`py-2.5 rounded-xl text-xs font-bold border transition-colors ${days.includes(d) ? 'border-gold bg-gold/15 text-gold' : 'border-lavender/20 bg-white/5 text-lavender/70'}`}>
            {name}
          </button>
        ))}
      </div>
      <label className="text-xs text-lavender/70 block mb-1">الوقت</label>
      <input type="time" className="field mb-4" dir="ltr" value={time} onChange={e => setTime(e.target.value)} />
      <button className="btn-primary w-full py-3 mb-2" disabled={busy || days.length === 0}
        onClick={async () => {
          setBusy(true)
          const [h, m] = time.split(':').map(Number)
          try { await onSave({ days, hour: h || 21, minute: m || 0 }) } finally { setBusy(false) }
        }}>
        حفظ الجدول 🗓️
      </button>
      {current && (
        <button className="btn-ghost w-full py-2.5 text-sm text-[#f5a3a3]" disabled={busy}
          onClick={async () => { setBusy(true); try { await onSave(null) } finally { setBusy(false) } }}>
          إيقاف الجدول الأسبوعي
        </button>
      )}
    </Modal>
  )
}

export function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="glass p-5 w-full max-w-sm anim-slideup max-h-[85dvh] overflow-y-auto no-scrollbar"
        style={{ background: 'rgba(22,17,41,.95)' }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function DatePickerModal({ title, onClose, onPick, confirmLabel }: {
  title: string
  onClose: () => void
  onPick: (when: Date, note?: string) => Promise<void>
  confirmLabel?: string
}) {
  const [val, setVal] = useState(defaultWhen())
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <Modal onClose={onClose}>
      <div className="text-lg font-extrabold mb-3">{title}</div>
      <div className="space-y-3">
        <input type="datetime-local" className="field" dir="ltr" value={val} onChange={e => setVal(e.target.value)} />
        <input className="field" placeholder="ملاحظة حلوة (اختياري) 💌" value={note} onChange={e => setNote(e.target.value)} />
        <button className="btn-primary w-full py-3" disabled={busy || !val}
          onClick={async () => {
            setBusy(true)
            try { await onPick(new Date(val), note.trim() || undefined) } finally { setBusy(false) }
          }}>
          {confirmLabel ?? 'إرسال الاقتراح 💜'}
        </button>
      </div>
    </Modal>
  )
}
