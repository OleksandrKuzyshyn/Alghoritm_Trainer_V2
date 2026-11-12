import type { ReactNode } from 'react'
import { cn } from '../lib/format'
import { BIG_O_BADGE } from './theme'

export type BadgeTone = 'sky' | 'emerald' | 'rose' | 'amber' | 'violet' | 'slate'

const TONE_CLASSES: Record<BadgeTone, string> = {
  sky: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 apple:border-sky-400/30 apple:bg-sky-500/20 apple:text-sky-300',
  emerald:
    'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 apple:border-emerald-400/30 apple:bg-emerald-500/20 apple:text-emerald-200',
  rose: 'border-rose-500/40 bg-rose-500/10 text-rose-300 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 apple:border-rose-400/30 apple:bg-rose-500/20 apple:text-rose-200',
  amber:
    'border-yellow-500/40 bg-yellow-500/10 text-yellow-300 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 apple:border-amber-400/30 apple:bg-amber-500/20 apple:text-amber-200',
  violet:
    'border-yellow-500/40 bg-yellow-500/10 text-yellow-300 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 apple:border-violet-400/30 apple:bg-violet-500/20 apple:text-violet-200',
  slate:
    'border-yellow-500/20 bg-zinc-950 text-zinc-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 apple:border-white/15 apple:bg-white/10 apple:text-slate-300',
}

export function Badge({
  tone = 'slate',
  children,
  className,
}: {
  readonly tone?: BadgeTone
  readonly children: ReactNode
  readonly className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-medium rounded-none dark:rounded-full apple:backdrop-blur-2xl apple:rounded-full',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function ComplexityToken({
  prefix,
  value,
}: {
  readonly prefix: string
  readonly value: string
  readonly tone: BadgeTone
}) {
  return (
    <span className={cn('inline-flex items-baseline gap-1', BIG_O_BADGE)}>
      <span className="text-[11px] font-semibold">{prefix}</span>
      <span>{value}</span>
    </span>
  )
}

export function ComplexityCell({
  label,
  prefix,
  value,
  tone,
}: {
  readonly label: string
  readonly prefix: string
  readonly value: string
  readonly tone: BadgeTone
}) {
  return (
    <div className="border border-yellow-500/25 bg-zinc-900/95 px-3 py-2.5 rounded-none dark:border-neutral-800 dark:bg-neutral-900/50 dark:rounded-xl apple:border-white/15 apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:rounded-2xl transition-all">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
        {label}
      </p>
      <div className="mt-1.5">
        <ComplexityToken prefix={prefix} value={value} tone={tone} />
      </div>
    </div>
  )
}
