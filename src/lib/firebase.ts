import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
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
