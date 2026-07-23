// احتفال بسيط بدون مكتبات
const COLORS = ['#d8a65a', '#b8737f', '#c9876b', '#9f5665', '#7c9a86', '#edc985']

export default function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    left: `${(i * 37) % 100}%`,
    delay: `${(i % 10) * 0.15}s`,
    duration: `${2 + (i % 5) * 0.4}s`,
    color: COLORS[i % COLORS.length],
    size: 6 + (i % 3) * 3,
  }))
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', top: 0, left: p.left, width: p.size, height: p.size * 0.6,
          background: p.color, borderRadius: 2,
          animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
        }} />
      ))}
    </div>
  )
}
