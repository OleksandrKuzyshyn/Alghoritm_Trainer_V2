import type { BinarySearchStep } from '../model/types'

export interface BinarySearchVisualizerProps {
  readonly array: readonly number[]
  readonly step: BinarySearchStep
}

type PointerColor = 'sky' | 'rose' | 'emerald'

interface PointerBadgeProps {
  readonly text: string
  readonly color: PointerColor
}

const POINTER_CLASSES: Record<PointerColor, string> = {
  sky: 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300 dark:border-white/30 dark:bg-white/10 dark:text-white apple:border-sky-400/40 apple:bg-sky-500/10 apple:text-sky-300',
  rose: 'border-amber-500/40 bg-amber-500/10 text-amber-400 dark:border-neutral-500/50 dark:bg-neutral-500/10 dark:text-neutral-300 apple:border-emerald-400/40 apple:bg-emerald-500/10 apple:text-emerald-300',
  emerald:
    'border-amber-400/40 bg-amber-400/10 text-amber-300 dark:border-neutral-600/50 dark:bg-neutral-600/10 dark:text-neutral-300 apple:border-emerald-300/40 apple:bg-emerald-400/10 apple:text-emerald-200',
}

function PointerBadge({ text, color }: PointerBadgeProps) {
  return (
    <span
      className={`rounded border px-1 text-[9px] font-semibold leading-4 ${POINTER_CLASSES[color]}`}
    >
      {text}
    </span>
  )
}

export function BinarySearchVisualizer({
  array,
  step,
}: BinarySearchVisualizerProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-end gap-1.5 px-1 pb-1">
        {array.map((value, index) => {
          const inRange = !step.done && index >= step.left && index <= step.right
          const isMiddle = step.middle === index
          const isFound = step.found && isMiddle
          const isLeft = !step.done && step.left === index
          const isRight = !step.done && step.right === index
          const isMiddlePointer = !step.done && isMiddle

          const cellClass = isFound
            ? 'border-amber-500 bg-amber-500/15 text-amber-200 dark:border-neutral-400 dark:bg-neutral-400/15 dark:text-neutral-100 apple:border-emerald-400 apple:bg-emerald-500/25 apple:text-emerald-100'
            : isMiddlePointer
              ? 'border-yellow-400 bg-yellow-400/15 text-yellow-200 dark:border-white dark:bg-white/15 dark:text-white apple:border-sky-400 apple:bg-sky-500/25 apple:text-sky-100'
              : inRange
                ? 'border-zinc-700 bg-zinc-950 text-zinc-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 apple:border-white/20 apple:bg-white/10 apple:text-slate-100'
                : 'border-zinc-800 bg-zinc-950/40 text-zinc-600 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-600 apple:border-white/10 apple:bg-white/[0.03] apple:text-slate-500'

          const indexClass = isFound
            ? 'text-amber-500 dark:text-neutral-300 apple:text-emerald-300'
            : isMiddlePointer
              ? 'text-yellow-400 dark:text-white apple:text-sky-300'
              : inRange
                ? 'text-zinc-600 dark:text-neutral-600 apple:text-slate-400'
                : 'text-zinc-700 dark:text-neutral-700 apple:text-slate-600'

          return (
            <div
              key={index}
              className="flex w-11 flex-col items-center gap-1"
            >
              <div className="flex h-5 items-center gap-0.5">
                {isLeft ? <PointerBadge text="L" color="sky" /> : null}
                {isMiddlePointer ? <PointerBadge text="M" color="rose" /> : null}
                {isRight ? <PointerBadge text="R" color="emerald" /> : null}
              </div>

              <span
                className={`flex h-11 w-11 items-center justify-center rounded-lg border font-mono text-sm font-semibold tabular-nums transition-colors ${cellClass}`}
                title={`A[${index}] = ${value}`}
              >
                {value}
              </span>

              <span className={`font-mono text-[10px] tabular-nums ${indexClass}`}>
                {index}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
