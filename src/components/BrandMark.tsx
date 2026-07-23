export default function BrandMark({ size = 48, className = '' }: {
  size?: number
  className?: string
}) {
  return (
    <span
      className={`brand-mark ${className}`}
      style={{ width: size, height: size }}
      aria-label="ميثاق"
    >
      <img src="/brand/app-mark.webp" alt="" />
    </span>
  )
}
