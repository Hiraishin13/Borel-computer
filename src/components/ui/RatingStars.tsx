import { cn } from '@/lib/utils'

export function RatingStars({
  rating,
  count,
  className,
}: {
  rating: number
  count?: number
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex text-warning" aria-label={`Note ${rating} sur 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} aria-hidden>
            {i < Math.round(rating) ? '★' : '☆'}
          </span>
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-muted">({count})</span>}
    </div>
  )
}
