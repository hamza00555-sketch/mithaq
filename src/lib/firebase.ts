import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

// إعداد Firebase لتطبيق الويب — قيم عامة بطبيعتها (تُشحن ضمن حزمة المتصفح)،
// والحماية الفعلية من قواعد أمان Firestore التي تقصر الوصول على عضوي الميثاق.
// متغيرات البيئة (إن وُجدت) تتجاوز هذه القيم الافتراضية.
const FALLBACK = {
  apiKey: 'AIzaSyDB2X8GXaYEPysIHBh5bTmN9jpjHgDwnQ0',
  authDomain: 'mithaq-87151.firebaseapp.com',
  projectId: 'mithaq-87151',
  storageBucket: 'mithaq-87151.firebasestorage.app',
  messagingSenderId: '155487516051',
  appId: '1:155487516051:web:1d63bf4bec66becbece466',
}

const env = import.meta.env
const cfg = {
  apiKey: (env.VITE_FIREBASE_API_KEY as string) || FALLBACK.apiKey,
  authDomain: (env.VITE_FIREBASE_AUTH_DOMAIN as string) || FALLBACK.authDomain,
  projectId: (env.VITE_FIREBASE_PROJECT_ID as string) || FALLBACK.projectId,
  storageBucket: (env.VITE_FIREBASE_STORAGE_BUCKET as string) || FALLBACK.storageBucket,
  messagingSenderId: (env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || FALLBACK.messagingSenderId,
  appId: (env.VITE_FIREBASE_APP_ID as string) || FALLBACK.appId,
}

// وضع تجريبي: يعرض التطبيق ببيانات وهمية بدون Firebase (VITE_DEMO=1)
export const demoMode = import.meta.env.VITE_DEMO === '1'

export const firebaseReady = demoMode || Boolean(cfg.apiKey && cfg.projectId && cfg.appId)

let app: FirebaseApp | null = null
let _auth: Auth | null = null
let _db: Firestore | null = null

if (firebaseReady && !demoMode) {
  app = initializeApp(cfg as Record<string, string>)
  _auth = getAuth(app)
  _db = getFirestore(app)
}

// لا تُستخدم إلا بعد التأكد من firebaseReady (شاشة الإعداد تمنع الوصول قبلها)
export const auth = () => _auth!
export const db = () => _db!
