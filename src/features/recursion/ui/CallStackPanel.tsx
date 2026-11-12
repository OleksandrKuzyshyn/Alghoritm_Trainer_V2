import type {
  CallNodeStatus,
  CallStackEntry,
} from '../model/types'

export interface CallStackPanelProps {
  readonly stack: readonly CallStackEntry[]
  readonly maxDepth: number
  readonly depthLimit: number
}

const STATUS_LABELS: Record<CallNodeStatus, string> = {
  pending: 'Очікує',
  active: 'Активний',
  base: 'База',
  done: 'Повернуто',
  memo: 'Мемо',
  blocked: 'Ліміт',
}

const ROW_STYLES: Record<CallNodeStatus, string> = {
  pending:
    'border-zinc-800 bg-zinc-950/40 dark:border-neutral-800 dark:bg-neutral-950/40 apple:border-white/10 apple:bg-white/[0.03]',
  active:
    'border-yellow-400/60 bg-yellow-400/10 dark:border-white/50 dark:bg-white/10 apple:border-sky-400/60 apple:bg-sky-500/15',
  base:
    'border-amber-500/60 bg-amber-500/10 dark:border-neutral-500/60 dark:bg-neutral-500/10 apple:border-emerald-400/60 apple:bg-emerald-500/15',
  done:
    'border-amber-500/50 bg-amber-500/10 dark:border-neutral-500/50 dark:bg-neutral-500/10 apple:border-emerald-400/50 apple:bg-emerald-500/10',
  memo:
    'border-amber-500/50 bg-amber-500/10 dark:border-neutral-500/50 dark:bg-neutral-500/10 apple:border-emerald-400/50 apple:bg-emerald-500/10',
  blocked:
    'border-amber-500/60 bg-amber-500/15 dark:border-neutral-400/60 dark:bg-neutral-400/10 apple:border-emerald-400/60 apple:bg-emerald-500/15',
}

const LABEL_STYLES: Record<CallNodeStatus, string> = {
  pending: 'text-zinc-500 dark:text-neutral-500 apple:text-slate-400',
  active: 'text-yellow-300 dark:text-white apple:text-sky-300',
  base: 'text-amber-400 dark:text-neutral-300 apple:text-emerald-300',
  done: 'text-amber-400 dark:text-neutral-300 apple:text-emerald-300',
  memo: 'text-amber-400 dark:text-neutral-300 apple:text-emerald-300',
  blocked: 'text-amber-300 dark:text-neutral-200 apple:text-emerald-200',
}

export function CallStackPanel({
  stack,
  maxDepth,
  depthLimit,
}: CallStackPanelProps) {
  const topFirst = [...stack].reverse()

  return (
    <section className="flex h-full flex-col bg-zinc-900/90 border border-yellow-500/25 rounded-none dark:bg-neutral-900/60 dark:border-neutral-800 dark:rounded-xl apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15 apple:rounded-3xl p-4 shadow-lg sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
          Стек викликів (LIFO)
        </h3>
        <span className="rounded-full border border-yellow-500/25 bg-zinc-950/60 px-2 py-0.5 font-mono text-[10px] text-yellow-400 dark:border-neutral-700 dark:bg-neutral-950/60 dark:text-neutral-300 apple:border-white/10 apple:bg-white/10 apple:text-sky-300 apple:font-sans">
          {stack.length} / {maxDepth}
        </span>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1.5">
        {topFirst.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-zinc-800 px-4 py-8 text-center text-xs text-zinc-500 dark:border-neutral-800 dark:text-neutral-500 apple:border-white/15 apple:bg-white/[0.02] apple:text-slate-400">
            Стек порожній — виконання завершено або ще не почалося.
          </div>
        ) : (
          topFirst.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${ROW_STYLES[entry.status]}`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 rounded bg-zinc-950/70 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 dark:bg-neutral-950/70 dark:text-neutral-400 apple:bg-white/10 apple:text-slate-300">
                  #{entry.depth + 1}
                </span>

                <span className="truncate font-mono text-xs text-zinc-200 dark:text-neutral-200 apple:text-slate-100">
                  {entry.label}
                </span>

                {index === 0 ? (
                  <span className="shrink-0 rounded border border-yellow-400/40 bg-yellow-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-yellow-300 dark:border-white/30 dark:bg-white/10 dark:text-white apple:border-sky-400/40 apple:bg-sky-500/15 apple:text-sky-200">
                    top
                  </span>
                ) : null}
              </div>

              <span
                className={`shrink-0 text-[10px] uppercase tracking-wider ${LABEL_STYLES[entry.status]}`}
              >
                {STATUS_LABELS[entry.status]}
              </span>
            </div>
          ))
        )}
      </div>

      <p className="mt-3 border-t border-yellow-500/25 pt-3 text-[11px] leading-relaxed text-zinc-500 dark:border-neutral-800 dark:text-neutral-500 apple:border-white/10 apple:text-slate-400">
        Кожен новий виклик кладе кадр на вершину стека, а повернення знімає
        його. Ліміт безпеки — {depthLimit} кадрів.
      </p>
    </section>
  )
}
