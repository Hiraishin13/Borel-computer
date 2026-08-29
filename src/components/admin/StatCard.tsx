import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  hint,
  trend,
}: {
  label: string
  value: string
  hint?: string
  trend?: number
}) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {(hint || trend !== undefined) && (
        <p className="mt-1 text-xs text-muted">
          {trend !== undefined && (
            <span className={cn('font-semibold', trend >= 0 ? 'text-success' : 'text-danger')}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%{' '}
            </span>
          )}
          {hint}
        </p>
      )}
    </div>
  )
}
