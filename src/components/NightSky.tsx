export default function NightSky({ showMoon = true }: { showMoon?: boolean }) {
  return (
    <>
      <div className="ambient-glow top" />
      <div className="ambient-glow bottom" />
      {showMoon && <div className="ambient-thread" />}
    </>
  )
}
