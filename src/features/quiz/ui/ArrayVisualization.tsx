import { cn } from '../lib/format'

interface ArrayVisualizationProps {
  array: readonly number[]
  activeIndices?: readonly number[]
  sortedIndices?: readonly number[]
}

export function ArrayVisualization({
  array,
  activeIndices = [],
  sortedIndices = [],
}: ArrayVisualizationProps) {
  return (
    <div className="flex flex-wrap items-end gap-1.5">
      {array.map((value, index) => {
        const isActive = activeIndices.includes(index)
        const isSorted = sortedIndices.includes(index)
        const cellClass = isActive
          ? 'border-yellow-400 bg-yellow-400/15 text-yellow-200 dark:border-sky-400/50 dark:bg-sky-400/15 dark:text-sky-200 apple:border-sky-400/50 apple:bg-sky-500/20 apple:text-sky-100'
          : isSorted
            ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200 dark:border-emerald-400/50 dark:bg-emerald-400/10 dark:text-emerald-200 apple:border-emerald-400/50 apple:bg-emerald-400/15 apple:text-emerald-100'
            : 'border-yellow-500/20 bg-zinc-950 text-zinc-300 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 apple:border-white/15 apple:bg-white/5 apple:text-slate-200'
        const indexClass = isActive
          ? 'text-yellow-400 dark:text-sky-400 apple:text-sky-300'
          : isSorted
            ? 'text-emerald-500 dark:text-emerald-400 apple:text-emerald-300'
            : 'text-zinc-600 dark:text-neutral-600 apple:text-slate-500'

        return (
          <div
            key={index}
            className="flex flex-col items-center gap-1"
          >
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-none border font-mono text-sm font-semibold tabular-nums transition-colors dark:rounded-lg dark:font-mono apple:rounded-xl apple:font-sans',
                cellClass,
              )}
            >
              {value}
            </span>
            <span
              className={cn(
                'font-mono text-[10px] tabular-nums dark:font-mono apple:font-sans',
                indexClass,
              )}
            >
              {index}
            </span>
          </div>
        )
      })}
    </div>
  )
}
