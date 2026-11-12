import { cn } from '../lib/format'

type StatsGridTone = 'sky' | 'emerald' | 'rose' | 'slate'

interface StatsGridProps {
  items: Array<{
    label: string
    value: string
    hint?: string
    tone?: StatsGridTone
  }>
}

const MAIN_CARD =
  'bg-zinc-900/95 border border-yellow-500/30 rounded-none dark:bg-neutral-900/60 dark:border-neutral-800 dark:rounded-xl apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15 apple:rounded-3xl apple:shadow-2xl'

const TONE_CLASSES: Record<StatsGridTone, string> = {
  sky: 'text-yellow-400 dark:text-white apple:text-sky-300',
  emerald: 'text-emerald-400 dark:text-emerald-400 apple:text-emerald-300',
  rose: 'text-rose-400 dark:text-rose-400 apple:text-rose-300',
  slate: 'text-zinc-100 dark:text-neutral-100 apple:text-slate-100',
}

export function StatsGrid({ items }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} data-snow-surface="true" className={`${MAIN_CARD} p-4`}>
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
            {item.label}
          </p>
          <p
            className={cn(
              'mt-2 font-mono text-xl font-semibold tabular-nums dark:font-sans apple:font-sans',
              TONE_CLASSES[item.tone ?? 'slate'],
            )}
          >
            {item.value}
          </p>
          {item.hint && (
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
              {item.hint}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
