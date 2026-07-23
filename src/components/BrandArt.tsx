export type BrandAsset =
  | 'connection'
  | 'signal'
  | 'schedule'
  | 'games'
  | 'mood-games'
  | 'wheel'
  | 'wishes'
  | 'achievements'

export default function BrandArt({ name, className = '', alt = '' }: {
  name: BrandAsset
  className?: string
  alt?: string
}) {
  return (
    <div className={`brand-art ${className}`} aria-hidden={alt ? undefined : true}>
      <img src={`/brand/${name}.webp`} alt={alt} decoding="async" />
    </div>
  )
}
