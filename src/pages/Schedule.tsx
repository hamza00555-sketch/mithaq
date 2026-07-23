import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  ensureScheduledAppointments, proposeAppointment, rescheduleAppointment,
  setAppointmentStatus, setWeeklySchedule, settleCompleted, settleMissed,
} from '../lib/data'
import { dayName, dayNum, defaultWhen, hmStr, monthShort, timeStr, tsDate, WEEKDAYS, WEEKDAYS_SHORT } from '../lib/dates'
import type { Appointment, WeeklySchedule } from '../lib/types'
import Confetti from '../components/Confetti'
import BrandArt from '../components/BrandArt'
import Icon, { type IconName } from '../components/Icon'

const STATUS_CHIP: Record<string, { cls: string; label: string; icon: IconName }> = {
  proposed: { cls: 'chip-wait', label: 'بانتظار', icon: 'clock' },
  confirmed: { cls: 'chip-ok', label: 'مؤكد', icon: 'check' },
  completed: { cls: 'chip-done', label: 'تم', icon: 'spark' },
  missed: { cls: 'chip-miss', label: 'ما تم', icon: 'close' },
  declined: { cls: 'chip-miss', label: 'اعتُذر عنه', icon: 'alert' },
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
      <div className="page-title-row">
        <div className="page-title">
          <span className="icon-orb"><Icon name="calendar" size={21} /></span>
          <h1>المواعيد</h1>
        </div>
        <button className="btn-gold px-3.5 py-2 text-xs inline-flex items-center gap-1.5" onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={15} /> موعد جديد
        </button>
      </div>
      <BrandArt name="schedule" />

      {/* الجدول الأسبوعي */}
      <button className="glass p-3.5 w-full active:scale-[.98] transition-transform feature-row"
        style={{ borderColor: 'rgba(184,115,127,.24)' }} onClick={() => setShowSchedule(true)}>
        <span className="icon-orb lavender"><Icon name="refresh" size={20} /></span>
        <span className="feature-row-copy">
          {sched && sched.days?.length ? (
            <>
              <span className="feature-row-title block">جدولكم الأسبوعي</span>
              <span className="text-[11px] text-lavender/75">
                {sched.days.map(d => WEEKDAYS[d]).join('، ')} · {hmStr(sched.hour, sched.minute)}
                <span className="text-lavender/50"> — تنضاف تلقائيًا كل أسبوع</span>
              </span>
            </>
          ) : (
            <>
              <span className="feature-row-title block">حددوا جدولكم الأسبوعي</span>
              <span className="feature-row-desc">بدل ما ترسلون طلب كل مرة، اتفقوا على أيام ثابتة</span>
            </>
          )}
        </span>
        <Icon name="arrow" size={17} className="opacity-35 rotate-180" />
      </button>

      {needsSettle.map(a => (
        <div key={`settle-${a.id}`} className="glass p-4 anim-popin" style={{ borderColor: 'rgba(216,166,90,.28)' }}>
          <div className="text-sm font-bold mb-1 flex items-center gap-2"><Icon name="clock" size={17} className="text-gold" /> موعد {dayName(tsDate(a.scheduledAt))} {timeStr(tsDate(a.scheduledAt))} مرّ وقته</div>
          <div className="text-xs text-lavender/70 mb-3">صارحونا... تم الموعد؟</div>
          <div className="flex gap-2">
            <button className="btn-primary flex-1 py-2.5 text-sm"
              onClick={async () => { await settleCompleted(cid, a.id); setCelebrate(true); setTimeout(() => setCelebrate(false), 3500) }}>
              تم (+١٠ نقاط)
            </button>
            <button className="btn-ghost flex-1 py-2.5 text-sm" onClick={() => setSettling(a)}>ما تم</button>
          </div>
        </div>
      ))}

      {appointments.length === 0 && (
        <div className="glass p-8 text-center text-sm text-lavender/70">
          <span className="icon-orb mx-auto mb-3"><Icon name="moon" size={21} /></span>
          ما فيه مواعيد بعد — اقترح أول موعد لكم!
        </div>
      )}

      {appointments.map(a => {
        const d = tsDate(a.scheduledAt)
        const chip = STATUS_CHIP[a.status] ?? STATUS_CHIP.proposed
        const mine = a.proposedBy === uid
        const detailIcon: IconName | null = a.fromSchedule ? 'refresh' : a.fromPrize ? 'trophy' : null
        const detail = a.fromSchedule ? 'من جدولكم الأسبوعي' : a.fromPrize ? 'جايزة لعبة' : mine ? 'اقترحته أنت' : `اقترحه ${partnerName}`
        return (
          <div key={a.id} className="glass p-3.5 flex items-center gap-3">
            <div className="w-12 h-13 rounded-xl flex flex-col items-center justify-center shrink-0 py-1.5"
              style={{ background: '#f1dfd3', border: '1px solid rgba(139,91,76,.15)' }}>
              <span className="text-base font-extrabold leading-5">{dayNum(d)}</span>
              <span className="text-[9px] opacity-70">{monthShort(d)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-extrabold">{dayName(d)} {timeStr(d)}</div>
              <div className="text-[11px] text-lavender/70 truncate flex items-center gap-1">
                {detailIcon && <Icon name={detailIcon} size={12} className="shrink-0" />}
                <span className="truncate">{detail}{a.note ? ` · ${a.note}` : ''}</span>
              </div>
              {a.status === 'proposed' && !mine && (
                <div className="flex gap-1.5 mt-2">
                  <button className="chip chip-ok inline-flex items-center gap-1" onClick={() => setAppointmentStatus(cid, a.id, 'confirmed')}><Icon name="check" size={12} /> أأكد</button>
                  <button className="chip chip-wait inline-flex items-center gap-1" onClick={() => setReschedule(a)}><Icon name="refresh" size={12} /> وقت ثاني</button>
                  <button className="chip chip-miss inline-flex items-center gap-1" onClick={() => setAppointmentStatus(cid, a.id, 'declined')}><Icon name="close" size={12} /> أعتذر</button>
                </div>
              )}
            </div>
            <span className={`chip ${chip.cls} inline-flex items-center gap-1`}><Icon name={chip.icon} size={12} />{a.status === 'proposed' && mine ? `بانتظار ${partnerName}` : chip.label}</span>
          </div>
        )
      })}

      {(showAdd || reschedule) && (
        <DatePickerModal
          title={reschedule ? 'اقتراح وقت بديل' : 'موعد جديد'}
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
          <div className="text-lg font-extrabold mb-1 flex items-center gap-2"><Icon name="alert" size={20} className="text-rose-soft" /> ما تم الموعد</div>
          <p className="text-sm text-lavender/70 mb-4">طيب... مين السبب؟ بكل صراحة — اللي خلف عليه عقوبة من العجلة.</p>
          <div className="space-y-2">
            <button className="btn-ghost w-full py-3" onClick={async () => { await settleMissed(cid, settling.id, uid); setSettling(null) }}>
              أنا السبب
            </button>
            <button className="btn-ghost w-full py-3" onClick={async () => {
              const other = couple!.members.find(m => m !== uid)!
              await settleMissed(cid, settling.id, other); setSettling(null)
            }}>
              {partnerName} السبب
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
      <div className="text-lg font-extrabold mb-1 flex items-center gap-2"><Icon name="calendar" size={20} className="text-gold" /> الجدول الأسبوعي</div>
      <p className="text-xs text-lavender/70 mb-4">اختاروا أيامكم الثابتة ووقتها — التطبيق يضيفها لكم مؤكدة كل أسبوع تلقائيًا.</p>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {WEEKDAYS_SHORT.map((name, d) => (
          <button key={d} onClick={() => toggle(d)}
            className={`py-2.5 rounded-xl text-xs font-bold border transition-colors ${days.includes(d) ? 'border-gold bg-gold/15 text-gold' : 'border-lavender/20 bg-[#fffaf5]/70 text-lavender/70'}`}>
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
        <span className="inline-flex items-center gap-2"><Icon name="check" size={17} /> حفظ الجدول</span>
      </button>
      {current && (
        <button className="btn-ghost w-full py-2.5 text-sm text-[#a65353]" disabled={busy}
          onClick={async () => { setBusy(true); try { await onSave(null) } finally { setBusy(false) } }}>
          إيقاف الجدول الأسبوعي
        </button>
      )}
    </Modal>
  )
}

export function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#49363c]/35 p-4" onClick={onClose}>
      <div className="glass p-5 w-full max-w-sm anim-slideup max-h-[85dvh] overflow-y-auto no-scrollbar"
        style={{ background: 'rgba(255,250,245,.98)' }} onClick={e => e.stopPropagation()}>
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
        <input className="field" placeholder="ملاحظة حلوة (اختياري)" value={note} onChange={e => setNote(e.target.value)} />
        <button className="btn-primary w-full py-3" disabled={busy || !val}
          onClick={async () => {
            setBusy(true)
            try { await onPick(new Date(val), note.trim() || undefined) } finally { setBusy(false) }
          }}>
          <span className="inline-flex items-center gap-2"><Icon name="check" size={17} />{confirmLabel ?? 'إرسال الاقتراح'}</span>
        </button>
      </div>
    </Modal>
  )
}
