import type { SortSnapshot } from '../model/types'

export interface MetricsPanelProps {
  readonly snapshot: SortSnapshot
  readonly currentStep: number
  readonly totalSteps: number
  readonly progress: number
}

interface MetricCardProps {
  readonly abbreviation: string
  readonly label: string
  readonly value: number
  readonly accent: 'rose' | 'emerald'
}

const PANEL =
  'bg-zinc-900/90 border border-yellow-500/25 rounded-none dark:bg-neutral-900/60 dark:border-neutral-800 dark:rounded-xl apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15 apple:rounded-3xl apple:shadow-2xl'

const TELEMETRY_BADGE =
  'bg-zinc-950 text-yellow-400 border border-yellow-500/30 font-mono px-3 py-1 dark:bg-neutral-950 dark:text-neutral-200 dark:border-neutral-800 apple:bg-white/10 apple:text-sky-300 apple:border-white/15 apple:rounded-full'

const METRIC_ACCENTS = {
  rose: {
    label: 'text-rose-400 dark:text-rose-300 apple:text-rose-300',
    value: 'text-rose-400 dark:text-rose-300 apple:text-rose-300',
  },
  emerald: {
    label: 'text-emerald-400 dark:text-emerald-300 apple:text-emerald-300',
    value: 'text-emerald-400 dark:text-emerald-300 apple:text-emerald-300',
  },
} as const

function MetricCard({ abbreviation, label, value, accent }: MetricCardProps) {
  const styles = METRIC_ACCENTS[accent]

  return (
    <div className={TELEMETRY_BADGE}>
      <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${styles.label}`}>
        {abbreviation} · {label}
      </p>
      <p className={`mt-1 font-mono text-2xl font-semibold ${styles.value}`}>{value}</p>
    </div>
  )
}

export function MetricsPanel({
  snapshot,
  currentStep,
  totalSteps,
  progress,
}: MetricsPanelProps) {
  const percent = Math.round(progress * 100)

  return (
    <section className={`${PANEL} p-4 sm:p-5`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-500 dark:text-neutral-500 apple:text-sky-300">
          Метрики
        </h3>
        <span
          className={`rounded-none border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider dark:rounded-full apple:rounded-full ${
            snapshot.done
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 apple:border-emerald-400/30 apple:bg-emerald-400/15 apple:text-emerald-300'
              : 'border-yellow-500/30 bg-yellow-400/10 text-yellow-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 apple:border-sky-400/30 apple:bg-sky-500/20 apple:text-sky-300'
          }`}
        >
          {snapshot.done ? 'Завершено' : 'У процесі'}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MetricCard
          abbreviation="Cmp"
          label="Порівняння"
          value={snapshot.comparisons}
          accent="rose"
        />
        <MetricCard
          abbreviation="Mov"
          label="Переміщення"
          value={snapshot.movements}
          accent="emerald"
        />
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
          <span>Прогрес</span>
          <span className="font-mono text-yellow-400 dark:text-neutral-300 apple:text-sky-300">
            {currentStep + 1} / {totalSteps} · {percent}%
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="Прогрес сортування"
          className="h-2 w-full overflow-hidden rounded-none bg-zinc-800 dark:rounded-full dark:bg-neutral-800 apple:rounded-full apple:bg-white/15"
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
              className="fill-yellow-400 dark:fill-white apple:fill-sky-400"
            />
          </svg>
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
        Cmp рахує кожне порівняння, Mov — обміни (2) та записи (1). Обидва лічильники
        відновлюються під час кроку назад.
      </p>
    </section>
  )
}
