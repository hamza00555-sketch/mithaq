import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { createCouple, joinCouple } from '../lib/data'
import { useApp } from '../context/AppContext'
import BrandArt from '../components/BrandArt'
import BrandMark from '../components/BrandMark'
import Icon from '../components/Icon'

const AR_ERRORS: Record<string, string> = {
  'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
  'auth/user-not-found': 'ما فيه حساب بهذا البريد',
  'auth/wrong-password': 'كلمة المرور غير صحيحة',
  'auth/invalid-credential': 'البريد أو كلمة المرور غير صحيحة',
  'auth/email-already-in-use': 'البريد مستخدم من قبل — جرب تسجيل الدخول',
  'auth/weak-password': 'كلمة المرور ضعيفة — ٦ أحرف على الأقل',
  'auth/network-request-failed': 'مشكلة بالاتصال — تأكد من الإنترنت',
}
const arError = (e: unknown) => {
  const code = (e as { code?: string })?.code ?? ''
  return AR_ERRORS[code] ?? (e as Error)?.message ?? 'صار خطأ غير متوقع'
}

export default function Onboarding() {
  const { user, profile, couple } = useApp()
  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setError('')
    try { await fn() } catch (e) { setError(arError(e)) } finally { setBusy(false) }
  }

  // ═══ الخطوة 1: تسجيل ═══
  if (!user) {
    return (
      <Shell>
        <h2 className="text-xl font-extrabold mb-1">{mode === 'signup' ? 'أهلًا في ميثاق' : 'نورت ميثاق'}</h2>
        <p className="text-sm text-lavender/80 mb-5">
          {mode === 'signup' ? 'أنشئوا حسابين — واحد لك وواحد لشريكك، ثم اربطوهما بكود' : 'سجل دخولك وكمّل من وين ما وقفت'}
        </p>
        <form className="space-y-3" onSubmit={e => { e.preventDefault()
          run(async () => {
            if (mode === 'signup') {
              if (!name.trim()) throw new Error('اكتب اسمك أول')
              const cred = await createUserWithEmailAndPassword(auth(), email, password)
              await setDoc(doc(db(), 'users', cred.user.uid), { name: name.trim(), coupleId: null })
            } else {
              await signInWithEmailAndPassword(auth(), email, password)
            }
          })
        }}>
          {mode === 'signup' && (
            <input className="field" placeholder="اسمك (مثال: حمزة)" value={name} onChange={e => setName(e.target.value)} />
          )}
          <input className="field" dir="ltr" type="email" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="field" dir="ltr" type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="text-sm text-[#a65353]">{error}</p>}
          <button className="btn-primary shimmer w-full py-3.5" disabled={busy}>
            {busy ? '...' : mode === 'signup' ? 'إنشاء الحساب' : 'دخول'}
          </button>
        </form>
        <button className="text-sm text-gold mt-4 w-full text-center" onClick={() => { setMode(m => m === 'signup' ? 'signin' : 'signup'); setError('') }}>
          {mode === 'signup' ? 'عندي حساب — تسجيل دخول' : 'ما عندي حساب — إنشاء جديد'}
        </button>
      </Shell>
    )
  }

  // ═══ الخطوة 2: إنشاء / انضمام ═══
  if (!profile?.coupleId) {
    return (
      <Shell>
        <h2 className="text-xl font-extrabold mb-1">نجهّز مساحتكم؟</h2>
        <p className="text-sm text-lavender/80 mb-5">واحد منكم ينشئ الميثاق ويشارك الكود، والثاني يدخله هنا</p>
        <button className="btn-primary shimmer w-full py-4 mb-4" disabled={busy}
          onClick={() => run(() => createCouple(user.uid, profile?.name ?? ''))}>
          إنشاء ميثاق جديد
        </button>
        <div className="flex items-center gap-3 my-4 text-lavender/50 text-xs">
          <div className="flex-1 h-px bg-lavender/20" /> أو <div className="flex-1 h-px bg-lavender/20" />
        </div>
        <form className="space-y-3" onSubmit={e => { e.preventDefault()
          run(() => joinCouple(user.uid, profile?.name ?? '', code))
        }}>
          <input className="field text-center tracking-[6px] font-bold" dir="ltr" maxLength={6}
            placeholder="كود الدعوة" value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
          {error && <p className="text-sm text-[#a65353]">{error}</p>}
          <button className="btn-gold w-full py-3.5" disabled={busy || code.length < 6}>الانضمام بالكود</button>
        </form>
      </Shell>
    )
  }

  // ═══ الخطوة 3: بانتظار الطرف الثاني ═══
  return (
    <Shell>
      <h2 className="text-xl font-extrabold mb-1">باقي تكتمل مساحتكم</h2>
      <p className="text-sm text-lavender/80 mb-6">شارك هذا الكود مع شريكك عشان ينضم ويكتمل الميثاق:</p>
      <div className="glass py-5 text-center mb-4">
        <div className="text-3xl font-extrabold tracking-[8px] gold-glow" dir="ltr">{couple?.inviteCode ?? '...'}</div>
      </div>
      <button className="btn-ghost w-full py-3"
        onClick={() => navigator.clipboard?.writeText(couple?.inviteCode ?? '')}>
        <span className="inline-flex items-center justify-center gap-2"><Icon name="copy" size={17} /> نسخ الكود</span>
      </button>
      <p className="text-xs text-lavender/60 mt-6 text-center animate-pulse">بانتظار انضمام شريكك... الصفحة تتحدث تلقائيًا</p>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 relative z-10">
      <div className="glass p-5 w-full max-w-sm anim-slideup">
        <div className="text-center mb-5">
          <BrandMark size={64} className="mx-auto mb-3" />
          <div className="gold-glow text-3xl font-extrabold">ميثاق</div>
          <div className="text-[11px] text-lavender/60 mt-1">مساحة دافئة لشخصين</div>
        </div>
        <BrandArt name="connection" className="onboarding-art mb-5" />
        {children}
      </div>
    </div>
  )
}
