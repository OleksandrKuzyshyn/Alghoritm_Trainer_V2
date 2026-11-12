import type { BinarySearchStep } from '../model/types'

export interface BinarySearchMetricsProps {
  readonly step: BinarySearchStep
  readonly currentStep: number
  readonly totalSteps: number
  readonly progress: number
  readonly maxSteps: number
  readonly targetExists: boolean
}

type MetricAccent = 'sky' | 'rose' | 'emerald'

interface MetricCardProps {
  readonly abbreviation: string
  readonly label: string
  readonly value: number | string
  readonly accent: MetricAccent
}

const METRIC_ACCENTS: Record<
  MetricAccent,
  { card: string; label: string; value: string }
> = {
  sky: {
    card: 'border-yellow-400/30 bg-yellow-400/10 dark:border-neutral-700 dark:bg-neutral-800/60 apple:border-sky-400/30 apple:bg-sky-500/10 apple:backdrop-blur-xl',
    label: 'text-yellow-400 dark:text-neutral-400 apple:text-sky-300',
    value: 'text-yellow-300 dark:text-neutral-100 apple:text-sky-200',
  },
  rose: {
    card: 'border-amber-500/30 bg-amber-500/10 dark:border-neutral-600 dark:bg-neutral-800/60 apple:border-emerald-400/30 apple:bg-emerald-500/10 apple:backdrop-blur-xl',
    label: 'text-amber-400 dark:text-neutral-300 apple:text-emerald-300',
    value: 'text-amber-300 dark:text-neutral-200 apple:text-emerald-200',
  },
  emerald: {
    card: 'border-amber-400/30 bg-amber-400/10 dark:border-neutral-700 dark:bg-neutral-800/60 apple:border-emerald-300/30 apple:bg-emerald-400/10 apple:backdrop-blur-xl',
    label: 'text-amber-400 dark:text-neutral-400 apple:text-emerald-300',
    value: 'text-amber-300 dark:text-neutral-100 apple:text-emerald-200',
  },
}

function MetricCard({
  abbreviation,
  label,
  value,
  accent,
}: MetricCardProps) {
  const styles = METRIC_ACCENTS[accent]

  return (
    <div className={`rounded-xl border p-3 ${styles.card}`}>
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${styles.label}`}
      >
        {abbreviation} · {label}
      </p>
      <p className={`mt-1 font-mono text-xl font-semibold ${styles.value}`}>
        {value}
      </p>
    </div>
  )
}

export function BinarySearchMetrics({
  step,
  currentStep,
  totalSteps,
  progress,
  maxSteps,
  targetExists,
}: BinarySearchMetricsProps) {
  const percent = Math.round(progress * 100)
  const status = step.found
    ? 'Знайдено'
    : step.done
      ? 'Не знайдено'
      : 'Пошук'
  const statusClass = step.found
    ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 dark:border-neutral-500/50 dark:bg-neutral-500/10 dark:text-neutral-300 apple:border-emerald-400/30 apple:bg-emerald-500/10 apple:text-emerald-300'
    : step.done
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-300 apple:border-emerald-400/30 apple:bg-emerald-500/10 apple:text-emerald-300'
      : 'border-yellow-400/30 bg-yellow-400/10 text-yellow-300 dark:border-white/30 dark:bg-white/10 dark:text-white apple:border-sky-400/30 apple:bg-sky-500/10 apple:text-sky-300'

  return (
    <section className="bg-zinc-900/90 border border-yellow-500/25 rounded-none dark:bg-neutral-900/60 dark:border-neutral-800 dark:rounded-xl apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15 apple:rounded-3xl p-4 shadow-lg sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
          Метрики
        </h3>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusClass}`}
        >
          {status}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MetricCard
          abbreviation="Cmp"
          label="Порівнянь"
          value={step.comparisons}
          accent="sky"
        />
        <MetricCard
          abbreviation="Left"
          label="Кандидатів"
          value={step.remaining}
          accent="rose"
        />
        <MetricCard
          abbreviation="Range"
          label="Межі"
          value={step.done ? '—' : `${step.left}…${step.right}`}
          accent="emerald"
        />
        <MetricCard
          abbreviation="Max"
          label="Кроків (теорія)"
          value={maxSteps}
          accent="sky"
        />
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
          <span>Прогрес</span>
          <span className="font-mono text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
            {currentStep + 1} / {totalSteps} · {percent}%
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="Прогрес двійкового пошуку"
          className="h-2 w-full overflow-hidden rounded-full bg-zinc-800 dark:bg-neutral-800 apple:bg-white/10"
        >
          <svg
            viewBox="0 0 100 4"
            preserveAspectRatio="none"
            className="h-full w-full"
            aria-hidden="true"
          >
            <rect
              x={0}
              y={0}
              width={Math.max(progress * 100, 0)}
              height={4}
              className="fill-amber-400 dark:fill-neutral-300 apple:fill-emerald-500"
            />
          </svg>
        </div>
      </div>

      <div className="mt-4 space-y-1 border-t border-yellow-500/25 pt-3 text-[11px] leading-relaxed text-zinc-500 dark:border-neutral-800 dark:text-neutral-500 apple:border-white/10 apple:text-slate-400">
        <p className="flex items-center justify-between">
          <span>Ціль у масиві</span>
          <span
            className={`font-mono ${
              targetExists
                ? 'text-amber-400 dark:text-neutral-300 apple:text-emerald-300'
                : 'text-amber-300 dark:text-neutral-300 apple:text-emerald-200'
            }`}
          >
            {targetExists ? 'так' : 'ні'}
          </span>
        </p>
        <p className="flex items-center justify-between">
          <span>Складність</span>
          <span className="font-mono text-yellow-400 dark:text-neutral-300 apple:text-sky-300">
            O(log n)
          </span>
        </p>
      </div>
    </section>
  )
}
