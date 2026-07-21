import type { Timestamp } from 'firebase/firestore'

const fmtDay = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-arab', { weekday: 'long' })
const fmtDate = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-arab', { day: 'numeric', month: 'long' })
const fmtTime = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-arab', { hour: 'numeric', minute: '2-digit', hour12: true })
const fmtDayNum = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-arab', { day: 'numeric' })
const fmtMonth = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-arab', { month: 'short' })

export const dayName = (d: Date) => fmtDay.format(d)
export const dateStr = (d: Date) => fmtDate.format(d)
export const timeStr = (d: Date) => fmtTime.format(d)
export const dayNum = (d: Date) => fmtDayNum.format(d)
export const monthShort = (d: Date) => fmtMonth.format(d)

export const tsDate = (t: Timestamp | undefined | null): Date => t?.toDate?.() ?? new Date(0)

export function relDays(d: Date): string {
  const now = new Date()
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000)
  if (diff === 0) return 'الليلة'
  if (diff === 1) return 'بكرة'
  if (diff === 2) return 'بعد يومين'
  if (diff > 2) return `بعد ${new Intl.NumberFormat('ar-SA-u-ca-gregory-nu-arab').format(diff)} أيام`
  if (diff === -1) return 'أمس'
  return 'فات وقته'
}

// قيمة datetime-local الافتراضية: الليلة 9:30م أو بعد ساعتين
export function defaultWhen(): string {
  const d = new Date()
  d.setHours(21, 30, 0, 0)
  if (d.getTime() < Date.now()) d.setTime(Date.now() + 2 * 3600000)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}
