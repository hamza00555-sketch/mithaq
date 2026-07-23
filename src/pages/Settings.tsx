import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useApp } from '../context/AppContext'
import { BADGES } from '../lib/content'
import { resetCoupleData } from '../lib/data'
import { getStoredPin, hashPin, setStoredPin } from '../components/PinLock'
import { Modal } from './Schedule'
import BrandArt from '../components/BrandArt'
import Icon, { type IconName } from '../components/Icon'

const BADGE_ICONS: Record<string, IconName> = {
  first_date: 'moon',
  streak5: 'flame',
  streak10: 'flame',
  dates20: 'spark',
  first_win: 'medal',
  matches10: 'games',
  wishes5: 'wish',
  challenge_won: 'target',
}

const toArabicNum = (n: number) => new Intl.NumberFormat('ar-SA-u-ca-gregory-nu-arab').format(n)

export default function Settings() {
  const { myName, partnerName, couple, badges, game } = useApp()
  const [pinModal, setPinModal] = useState(false)
  const [pin, setPin] = useState('')
  const [hasPin, setHasPin] = useState(Boolean(getStoredPin()))
  const [resetModal, setResetModal] = useState(false)
  const [resetting, setResetting] = useState(false)

  const earned = new Set(badges.map(b => b.badgeKey))

  return (
    <div className="p-4 pb-28 space-y-3 relative z-10">
      <div className="page-title-row">
        <div className="page-title">
          <span className="icon-orb lavender"><Icon name="settings" size={21} /></span>
          <h1>الإعدادات</h1>
        </div>
      </div>
      <BrandArt name="achievements" />

      <div className="glass p-4 flex items-center gap-3">
        <div className="flex">
          <span className="w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 border-night-950 z-10"
            style={{ background: 'linear-gradient(135deg,#c9876b,#ad6652)' }}>{myName.charAt(0)}</span>
          <span className="w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 border-night-950 -mr-2"
            style={{ background: 'linear-gradient(135deg,#c98790,#9f5665)' }}>{partnerName.charAt(0)}</span>
        </div>
        <div className="flex-1">
          <div className="font-extrabold text-sm inline-flex items-center gap-2">{myName} <Icon name="heart" size={14} className="text-rose-soft" /> {partnerName}</div>
          <div className="text-[11px] text-lavender/60">ميثاقكم قائم منذ {couple?.createdAt ? new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-arab', { dateStyle: 'long' }).format(couple.createdAt.toDate()) : '...'}</div>
        </div>
      </div>

      {/* الأوسمة */}
      <div className="glass p-4">
        <div className="text-sm font-extrabold mb-3 flex items-center gap-2"><Icon name="medal" size={18} className="text-gold" /> الأوسمة ({toArabicNum(earned.size)} / {toArabicNum(BADGES.length)})</div>
        <div className="grid grid-cols-3 gap-2">
          {BADGES.map(b => {
            const got = earned.has(b.key)
            return (
              <div key={b.key} className={`rounded-2xl p-2.5 text-center border ${got ? 'border-gold/50 bg-gold/10' : 'border-lavender/15 bg-[#fffaf5]/55 opacity-45'}`}>
                <div className={`mb-1 flex justify-center ${got ? 'text-gold' : 'text-lavender/35'}`}><Icon name={got ? BADGE_ICONS[b.key] ?? 'medal' : 'lock'} size={20} /></div>
                <div className="text-[10px] font-bold leading-4">{b.title}</div>
                <div className="text-[8.5px] text-lavender/60 leading-3.5 mt-0.5">{b.desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* إحصائيات */}
      <div className="glass p-4 text-xs space-y-1.5 text-lavender/80">
        <div className="text-sm font-extrabold text-ink mb-2 flex items-center gap-2"><Icon name="target" size={17} className="text-gold" /> أرقامكم</div>
        <div className="flex justify-between"><span>مواعيد مكتملة</span><b>{toArabicNum(game?.counters?.completedDates ?? 0)}</b></div>
        <div className="flex justify-between"><span>مباريات ملعوبة</span><b>{toArabicNum(game?.counters?.matches ?? 0)}</b></div>
        <div className="flex justify-between"><span>أماني محققة</span><b>{toArabicNum(game?.counters?.wishesDone ?? 0)}</b></div>
        <div className="flex justify-between"><span>أفضل سلسلة</span><b className="inline-flex items-center gap-1"><Icon name="flame" size={13} className="text-rose-soft" /> {toArabicNum(game?.bestStreak ?? 0)}</b></div>
      </div>

      {/* الخصوصية */}
      <div className="glass p-4">
        <div className="text-sm font-extrabold mb-1 flex items-center gap-2"><Icon name="lock" size={18} className="text-gold" /> قفل التطبيق (PIN)</div>
        <p className="text-[11px] text-lavender/60 mb-3">رقم سري من ٤ أرقام يُطلب عند فتح التطبيق — يخزن على جهازك فقط</p>
        {hasPin ? (
          <button className="btn-ghost w-full py-2.5 text-sm" onClick={() => { setStoredPin(null); setHasPin(false) }}>
            إلغاء القفل
          </button>
        ) : (
          <button className="btn-primary w-full py-2.5 text-sm" onClick={() => setPinModal(true)}>تفعيل القفل</button>
        )}
      </div>

      {/* بداية جديدة */}
      <div className="glass p-4">
        <div className="text-sm font-extrabold mb-1 flex items-center gap-2"><Icon name="reset" size={18} className="text-rose-soft" /> بداية جديدة</div>
        <p className="text-[11px] text-lavender/60 mb-3">
          تصفير السجل بالكامل: المواعيد، العقوبات المعلّقة، الإشارات، المباريات، الأماني، الأوسمة، والنقاط.
          يبقى: حسابكم، أسماؤكم، قائمة العقوبات، وجدولكم الأسبوعي.
        </p>
        <button className="btn-ghost w-full py-2.5 text-sm text-[#a65353]" onClick={() => setResetModal(true)}>
          تصفير البيانات
        </button>
      </div>

      <button className="btn-ghost w-full py-3 text-sm text-[#a65353] inline-flex items-center justify-center gap-2" onClick={() => signOut(auth())}>
        <Icon name="logout" size={17} /> تسجيل الخروج
      </button>

      {resetModal && (
        <Modal onClose={() => !resetting && setResetModal(false)}>
          <div className="text-lg font-extrabold mb-2 flex items-center gap-2"><Icon name="reset" size={20} className="text-rose-soft" /> تأكيد البداية الجديدة</div>
          <p className="text-sm text-lavender/75 leading-6 mb-4">
            متأكدين؟ بيُحذف كل السجل (مواعيد، مباريات، أماني، أوسمة، نقاط) ولا يمكن التراجع.
            حسابكم وأسماؤكم وجدولكم الأسبوعي يبقون كما هم.
          </p>
          <button className="btn-primary w-full py-3 mb-2" disabled={resetting}
            onClick={async () => {
              if (!couple) return
              setResetting(true)
              try { await resetCoupleData(couple.id); setResetModal(false) } finally { setResetting(false) }
            }}>
            {resetting ? 'يتم التصفير...' : 'نعم، ابدأوا من جديد'}
          </button>
          <button className="btn-ghost w-full py-2.5 text-sm" disabled={resetting} onClick={() => setResetModal(false)}>
            تراجع
          </button>
        </Modal>
      )}

      {pinModal && (
        <Modal onClose={() => setPinModal(false)}>
          <div className="text-lg font-extrabold mb-3 flex items-center gap-2"><Icon name="lock" size={20} className="text-gold" /> تعيين رقم سري</div>
          <input className="field text-center tracking-[10px] font-extrabold text-lg" dir="ltr" maxLength={4}
            inputMode="numeric" placeholder="••••" value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))} />
          <button className="btn-primary w-full py-3 mt-3" disabled={pin.length !== 4}
            onClick={async () => { setStoredPin(await hashPin(pin)); setHasPin(true); setPin(''); setPinModal(false) }}>
            حفظ القفل
          </button>
        </Modal>
      )}
    </div>
  )
}
