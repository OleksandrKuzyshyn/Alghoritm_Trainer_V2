import { cn, formatNumber } from '../lib/format'
import { useOperationsEstimator } from '../model/useOperationsEstimator'
import { IconClock } from './Icons'
import { BIG_O_BADGE } from './theme'

function formatSlowdown(value: number): string {
  if (value < 1.05) return 'базова лінія'
  if (value < 10) return `×${value.toFixed(1).replace('.', ',')}`
  return `×${formatNumber(value)}`
}

export function OperationsEstimator() {
  const estimator = useOperationsEstimator()
  const exponents = Array.from(
    { length: estimator.maxExponent - estimator.minExponent + 1 },
    (_, index) => estimator.minExponent + index,
  )

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-zinc-100 dark:text-neutral-100 apple:text-white">
            <IconClock className="h-4 w-4 text-yellow-400 dark:text-neutral-300 apple:text-sky-300" />
            Скільки операцій насправді?
          </p>
          <p className="mt-1 max-w-lg text-xs leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
            Порівняння для випадкових даних. Пересуньте повзунок і подивіться, як
            квадратичні алгоритми відриваються від n log n.
          </p>
        </div>

        <div className="border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-right rounded-none dark:border-neutral-700 dark:bg-neutral-800 dark:rounded-xl apple:border-sky-400/30 apple:bg-sky-500/20 apple:backdrop-blur-2xl apple:rounded-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-yellow-400/80 dark:text-neutral-400 apple:text-sky-300/80">
            Розмір масиву
          </p>
          <p className="font-mono text-lg font-bold text-yellow-300 dark:text-neutral-100 apple:text-sky-200">
            n = {estimator.nLabel}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="complexity-size-range" className="sr-only">
          Показник степеня розміру масиву
        </label>
        <input
          id="complexity-size-range"
          type="range"
          min={estimator.minExponent}
          max={estimator.maxExponent}
          step={1}
          value={estimator.exponent}
          onChange={(event) => estimator.setExponent(Number(event.target.value))}
          className="w-full cursor-pointer accent-yellow-400 dark:accent-white apple:accent-sky-400"
        />
        <div className="mt-1 flex justify-between font-mono text-[10px] text-zinc-600 dark:text-neutral-600 apple:text-slate-500">
          {exponents.map((exponent) => (
            <span key={exponent}>
              10<sup>{exponent}</sup>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {estimator.rows.map((row) => (
          <div key={row.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-zinc-200 dark:text-neutral-200 apple:text-slate-200">
                  {row.name}
                </span>
                <span className="font-mono text-[10px] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
                  {row.formula}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-zinc-100 dark:text-neutral-100 apple:text-white">
                  {row.display}
                </span>
                <span className={cn('inline-flex items-center text-[10px]', BIG_O_BADGE)}>
                  {formatSlowdown(row.slowdown)}
                </span>
              </div>
            </div>

            <div className="mt-1.5 grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1">
              {Array.from({ length: 20 }, (_, index) => (
                <span
                  key={index}
                  className={cn(
                    'h-2 rounded-full',
                    index < row.segments
                      ? 'bg-yellow-400 dark:bg-white apple:bg-sky-400'
                      : 'bg-zinc-800 dark:bg-neutral-800 apple:bg-white/10',
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
        Оцінка орієнтовна: кількість порівнянь для випадкового масиву. Для Counting
        Sort і Radix Sort додається залежність від діапазону k та кількості розрядів d.
      </p>
    </div>
  )
}
