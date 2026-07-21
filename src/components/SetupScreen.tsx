// تظهر عندما لا توجد مفاتيح Firebase في .env
export default function SetupScreen() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6 relative z-10">
      <div className="glass p-6 max-w-md w-full anim-slideup">
        <div className="text-3xl mb-3 text-center">🌙</div>
        <h1 className="gold-glow text-2xl font-extrabold text-center mb-4">ميثاق — يحتاج إعداد</h1>
        <p className="text-sm leading-7 text-lavender mb-4">
          التطبيق جاهز، بس يحتاج ربطه بمشروع Firebase (مجاني):
        </p>
        <ol className="text-sm leading-8 pr-4 list-decimal space-y-1">
          <li>افتح <span className="text-gold font-bold" dir="ltr">console.firebase.google.com</span> وأنشئ مشروعًا جديدًا</li>
          <li>فعّل <b>Authentication → Email/Password</b></li>
          <li>فعّل <b>Cloud Firestore</b> (وضع الإنتاج)</li>
          <li>الصق قواعد الأمان من ملف <span dir="ltr" className="text-gold">firestore.rules</span></li>
          <li>أنشئ تطبيق ويب وانسخ الإعدادات إلى ملف <span dir="ltr" className="text-gold">.env</span> (مثاله في <span dir="ltr" className="text-gold">.env.example</span>)</li>
          <li>أعد تشغيل التطبيق</li>
        </ol>
      </div>
    </div>
  )
}
