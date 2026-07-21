import { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  proposeAppointment, rescheduleAppointment, setAppointmentStatus, settleCompleted, settleMissed,
} from '../lib/data'
import { dayName, dayNum, defaultWhen, monthShort, timeStr, tsDate } from '../lib/dates'
import type { Appointment } from '../lib/types'
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
  const uid = user!.uid
  const cid = couple!.id

  const needsSettle = appointments.filter(a => a.status === 'confirmed' && tsDate(a.scheduledAt).getTime() < Date.now())

  return (
    <div className="p-4 pb-28 space-y-3 relative z-10">
      {celebrate && <Confetti />}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-extrabold">📅 المواعيد</h1>
        <button className="btn-gold px-4 py-2 text-sm" onClick={() => setShowAdd(true)}>＋ موعد جديد</button>
      </div>

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
                {a.fromPrize ? '🏆 جايزة لعبة' : mine ? 'اقترحته أنت' : `اقترحه ${partnerName}`}
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
    </div>
  )
}

export function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="glass p-5 w-full max-w-sm anim-slideup" style={{ background: 'rgba(22,17,41,.92)' }} onClick={e => e.stopPropagation()}>
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
