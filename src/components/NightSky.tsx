// الخلفية الحية: نجوم تتلألأ + قمر ذهبي + هالات بنفسجية
const STARS = [
  { top: '9%', right: '12%', size: 3, delay: 0 },
  { top: '14%', right: '38%', size: 2, delay: 0.8 },
  { top: '7%', right: '64%', size: 2, delay: 1.5 },
  { top: '22%', right: '80%', size: 3, delay: 0.4 },
  { top: '30%', right: '8%', size: 2, delay: 2 },
  { top: '42%', right: '90%', size: 2, delay: 1.1 },
  { top: '55%', right: '15%', size: 3, delay: 0.6 },
  { top: '63%', right: '70%', size: 2, delay: 1.8 },
  { top: '76%', right: '30%', size: 2, delay: 0.2 },
  { top: '85%', right: '85%', size: 3, delay: 1.3 },
  { top: '48%', right: '48%', size: 2, delay: 2.4 },
]

export default function NightSky() {
  return (
    <>
      <div className="halo anim-floaty" style={{ width: 280, height: 280, top: -90, right: -80, background: 'radial-gradient(circle, rgba(84,66,148,.4), transparent 70%)' }} />
      <div className="halo" style={{ width: 250, height: 250, bottom: 30, left: -90, background: 'radial-gradient(circle, rgba(148,66,122,.27), transparent 70%)', animation: 'floaty 10s ease-in-out infinite reverse' }} />
      <div className="moon" />
      {STARS.map((s, i) => (
        <div key={i} className="star" style={{ top: s.top, right: s.right, width: s.size, height: s.size, animationDelay: `${s.delay}s` }} />
      ))}
    </>
  )
}
