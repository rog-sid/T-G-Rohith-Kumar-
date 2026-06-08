import * as React from 'react'
import { Card } from '@/components/ui/card'
import { useCountUp } from '@/hooks/useCountUp'
import { cn } from '@/lib/utils'

const ACCENTS = [
  'from-teal-500/15 to-teal-500/0 text-teal-600 dark:text-teal-400',
  'from-cyan-500/15 to-cyan-500/0 text-cyan-600 dark:text-cyan-400',
  'from-violet-500/15 to-violet-500/0 text-violet-600 dark:text-violet-400',
  'from-amber-500/15 to-amber-500/0 text-amber-600 dark:text-amber-400',
  'from-rose-500/15 to-rose-500/0 text-rose-600 dark:text-rose-400',
]

function AnimatedNumber({
  value,
  format,
}: {
  value: number
  format: (n: number) => string
}) {
  const animated = useCountUp(value)
  return <span>{format(animated)}</span>
}

export interface KpiCardProps {
  label: string
  icon: React.ReactNode
  numericValue?: number
  format?: (n: number) => string
  text?: string
  sub?: string
  colorIndex?: number
  testId?: string
}

export function KpiCard({
  label,
  icon,
  numericValue,
  format = (n) => Math.round(n).toString(),
  text,
  sub,
  colorIndex = 0,
  testId,
}: KpiCardProps) {
  const accent = ACCENTS[colorIndex % ACCENTS.length]
  return (
    <Card
      data-testid={testId}
      className="group relative animate-slide-up overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-80 blur-xl transition-opacity group-hover:opacity-100',
          accent,
        )}
      />
      <div className="relative flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <span className={cn('rounded-lg bg-gradient-to-br p-2', accent)}>{icon}</span>
      </div>
      <div className="relative mt-3">
        <div className="text-2xl font-bold tracking-tight text-foreground" data-testid={testId ? `${testId}-value` : undefined}>
          {numericValue !== undefined ? (
            <AnimatedNumber value={numericValue} format={format} />
          ) : (
            <span className="line-clamp-1" title={text}>
              {text || '—'}
            </span>
          )}
        </div>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </Card>
  )
}
