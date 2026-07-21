// اختبار قواعد أمان Firestore (اختياري — أدوات الاختبار ليست ضمن تبعيات التطبيق).
// للتشغيل محليًا:
//   npm i -D firebase-tools @firebase/rules-unit-testing --legacy-peer-deps
//   npx firebase emulators:exec --only firestore --project demo-mithaq "node rules.test.mjs"
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { readFileSync } from 'fs'
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, getDocs } from 'firebase/firestore'

const env = await initializeTestEnvironment({
  projectId: 'demo-mithaq',
  firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
})
const H = env.authenticatedContext('hamza').firestore()
const A = env.authenticatedContext('asma').firestore()
const O = env.authenticatedContext('outsider').firestore()

const CID = 'couple1'
const CODE = 'ABC123'
let pass = 0, fail = 0
async function check(name, promise) {
  try { await promise; console.log(`  ✓ ${name}`); pass++ }
  catch (e) { console.log(`  ✗ ${name} — ${e.message?.slice(0,80)}`); fail++ }
}

// تجهيز بيانات أولية بتجاوز القواعد
await env.withSecurityRulesDisabled(async ctx => {
  const db = ctx.firestore()
  await setDoc(doc(db, 'users', 'hamza'), { name: 'حمزة', coupleId: null })
  await setDoc(doc(db, 'users', 'asma'), { name: 'أسماء', coupleId: null })
  await setDoc(doc(db, 'users', 'outsider'), { name: 'غريب', coupleId: null })
})

console.log('\n── المصادقة والملفات ──')
await check('حمزة يكتب ملفه الشخصي', assertSucceeds(setDoc(doc(H, 'users', 'hamza'), { name: 'حمزة', coupleId: null })))
await check('حمزة لا يقدر يكتب ملف أسماء', assertFails(setDoc(doc(H, 'users', 'asma'), { name: 'x' })))

console.log('\n── إنشاء الميثاق ──')
await check('حمزة ينشئ الميثاق (عضو وحيد)', assertSucceeds(setDoc(doc(H, 'couples', CID),
  { members: ['hamza'], memberNames: { hamza: 'حمزة' }, inviteCode: CODE, createdAt: new Date() })))
await check('حمزة يسجل كود الدعوة', assertSucceeds(setDoc(doc(H, 'inviteCodes', CODE), { coupleId: CID, createdBy: 'hamza' })))
await check('غريب لا يقدر ينشئ ميثاق باسم غيره', assertFails(setDoc(doc(O, 'couples', 'evil'),
  { members: ['hamza'], inviteCode: 'x', createdAt: new Date() })))

console.log('\n── الخصوصية: منع الغرباء ──')
await check('غريب لا يقدر يقرأ وثيقة الميثاق', assertFails(getDoc(doc(O, 'couples', CID))))
await check('غريب لا يقدر يعدد كل المواثيق', assertFails(getDocs(collection(O, 'couples'))))
await check('غريب لا يقدر يعدد أكواد الدعوة', assertFails(getDocs(collection(O, 'inviteCodes'))))
await check('لكن أي مسجل يقدر يجيب كودًا معروفًا (للانضمام)', assertSucceeds(getDoc(doc(O, 'inviteCodes', CODE))))

console.log('\n── الانضمام ──')
await check('غريب لا يقدر يزيح حمزة (يستبدل الأعضاء)', assertFails(
  updateDoc(doc(O, 'couples', CID), { members: ['outsider', 'evil'], inviteCode: CODE })))
await check('غريب لا يقدر يغيّر كود الدعوة أثناء الانضمام', assertFails(
  updateDoc(doc(O, 'couples', CID), { members: arrayUnion('outsider'), inviteCode: 'HACKED' })))
await check('أسماء تنضم بشكل شرعي (تحفظ حمزة)', assertSucceeds(
  updateDoc(doc(A, 'couples', CID), { members: arrayUnion('asma'), 'memberNames.asma': 'أسماء' })))

console.log('\n── بعد اكتمال الميثاق ──')
await check('غريب لا يقدر ينضم لميثاق مكتمل', assertFails(
  updateDoc(doc(O, 'couples', CID), { members: arrayUnion('outsider') })))
await check('أسماء (عضو) تقرأ الميثاق', assertSucceeds(getDoc(doc(A, 'couples', CID))))
await check('حمزة يكتب موعد داخل الميثاق', assertSucceeds(
  setDoc(doc(H, 'couples', CID, 'appointments', 'ap1'), { proposedBy: 'hamza', status: 'proposed' })))
await check('أسماء تقرأ المواعيد', assertSucceeds(getDocs(collection(A, 'couples', CID, 'appointments'))))
await check('غريب لا يقدر يقرأ مواعيد الميثاق', assertFails(getDocs(collection(O, 'couples', CID, 'appointments'))))
await check('غريب لا يقدر يكتب في الميثاق', assertFails(
  setDoc(doc(O, 'couples', CID, 'appointments', 'evil'), { x: 1 })))
await check('أسماء تكتب مباراة (لعبة)', assertSucceeds(
  setDoc(doc(A, 'couples', CID, 'matches', 'm1'), { gameType: 'xo', status: 'waiting' })))

console.log(`\n═══ النتيجة: ${pass} نجح / ${fail} فشل ═══`)
await env.cleanup()
process.exit(fail === 0 ? 0 : 1)
