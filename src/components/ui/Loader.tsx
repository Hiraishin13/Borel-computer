import { cn } from '@/lib/utils'

export function Loader({
  label = 'Chargement…',
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-h-[40vh] flex-col items-center justify-center gap-4 text-sm text-muted',
        className,
      )}
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-accent" />
      {label}
    </div>
  )
}
