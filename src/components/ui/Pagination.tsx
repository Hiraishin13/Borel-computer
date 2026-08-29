'use client'

import { cn } from '@/lib/utils'

export function Pagination({
  page,
  pageCount,
  onChange,
  className,
}: {
  page: number
  pageCount: number
  onChange: (page: number) => void
  className?: string
}) {
  if (pageCount <= 1) return null

  const pages = pageWindow(page, pageCount)

  return (
    <nav className={cn('flex items-center justify-center gap-1 text-sm', className)}>
      <Btn disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ‹
      </Btn>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-2 text-muted">
            …
          </span>
        ) : (
          <Btn key={p} active={p === page} onClick={() => onChange(p)}>
            {p}
          </Btn>
        ),
      )}
      <Btn disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
        ›
      </Btn>
    </nav>
  )
}

function Btn({
  children,
  onClick,
  active,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'min-w-8 rounded-md px-2 py-1 transition-colors disabled:opacity-30',
        active ? 'bg-accent text-light' : 'text-muted hover:bg-white/10 hover:text-light',
      )}
    >
      {children}
    </button>
  )
}

function pageWindow(page: number, count: number): (number | '…')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)
  const out: (number | '…')[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(count - 1, page + 1)
  if (start > 2) out.push('…')
  for (let i = start; i <= end; i++) out.push(i)
  if (end < count - 1) out.push('…')
  out.push(count)
  return out
}
