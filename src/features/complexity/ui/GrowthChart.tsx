import { cn } from '../lib/format'
import { useGrowthChart } from '../model/useGrowthChart'
import { IconScale } from './Icons'
import { CLIPPED_FOCUS, FOCUS_RING, INACTIVE_FILTER, OCTAGON_BUTTON } from './theme'

export function GrowthChart() {
  const chart = useGrowthChart()

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-100 dark:text-neutral-100 apple:text-white">
            Криві зростання
          </p>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
            Усі функції на одному графіку. Зверніть увагу, як O(n²) відривається вже на n = 64.
          </p>
        </div>

        <button
          type="button"
          onClick={chart.toggleScale}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 text-[11px]',
            OCTAGON_BUTTON,
            CLIPPED_FOCUS,
            INACTIVE_FILTER,
          )}
          aria-label="Перемкнути шкалу графіка"
        >
          <IconScale className="h-3.5 w-3.5" />
          {chart.scale === 'log' ? 'Логарифмічна шкала' : 'Лінійна шкала'}
        </button>
      </div>

      <div className="mt-4 border border-yellow-500/25 bg-zinc-950/70 p-2 rounded-none dark:border-neutral-800 dark:bg-neutral-950/70 dark:rounded-xl apple:border-white/10 apple:bg-white/[0.04] apple:backdrop-blur-2xl apple:rounded-2xl transition-all">
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          className="h-auto w-full"
          role="img"
          aria-label="Графік зростання складності O(1), O(log n), O(n), O(n log n) та O(n²)"
        >
          {chart.yTicks.map((tick) => (
            <line
              key={`grid-${tick.position}`}
              x1={chart.padding.left}
              x2={chart.width - chart.padding.right}
              y1={tick.position}
              y2={tick.position}
              className="stroke-zinc-800 dark:stroke-neutral-800 apple:stroke-white/10"
              strokeDasharray="3 6"
            />
          ))}

          {chart.yTicks.map((tick) => (
            <text
              key={`y-${tick.position}`}
              x={chart.padding.left - 10}
              y={tick.position + 3}
              textAnchor="end"
              className="fill-zinc-500 text-[9px] dark:fill-neutral-500 apple:fill-slate-400"
            >
              {tick.label}
            </text>
          ))}

          {chart.xTicks.map((tick) => (
            <text
              key={`x-${tick.position}`}
              x={tick.position}
              y={chart.height - chart.padding.bottom + 17}
              textAnchor="middle"
              className="fill-zinc-500 text-[9px] dark:fill-neutral-500 apple:fill-slate-400"
            >
              {tick.label}
            </text>
          ))}

          <text
            x={chart.padding.left}
            y={12}
            className="fill-zinc-500 text-[9px] uppercase tracking-[0.18em] dark:fill-neutral-500 apple:fill-slate-400"
          >
            операцій
          </text>
          <text
            x={chart.width - chart.padding.right}
            y={chart.height - 4}
            textAnchor="end"
            className="fill-zinc-500 text-[9px] uppercase tracking-[0.18em] dark:fill-neutral-500 apple:fill-slate-400"
          >
            n
          </text>

          {chart.series
            .filter((item) => !chart.isHidden(item.id))
            .map((item) => (
              <path
                key={item.id}
                d={item.path}
                fill="none"
                strokeWidth={2.4}
                strokeLinecap="round"
                className={item.strokeClassName}
              />
            ))}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {chart.series.map((item) => {
          const hidden = chart.isHidden(item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => chart.toggleSeries(item.id)}
              aria-pressed={!hidden}
              className={cn(
                'inline-flex items-center gap-2 border px-3 py-1.5 text-[11px] font-medium transition rounded-none dark:rounded-lg apple:rounded-full',
                FOCUS_RING,
                hidden
                  ? 'border-yellow-500/15 bg-zinc-950 text-zinc-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-600 apple:border-white/10 apple:bg-white/[0.03] apple:text-slate-500'
                  : 'border-yellow-500/25 bg-zinc-900 text-zinc-200 hover:border-yellow-400/60 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700 apple:border-white/15 apple:bg-white/[0.06] apple:text-slate-200 apple:hover:border-white/30',
              )}
            >
              <span
                className={cn('h-2 w-2 rounded-full', hidden ? 'bg-zinc-700 dark:bg-neutral-700 apple:bg-white/20' : item.dotClassName)}
                aria-hidden="true"
              />
              <span className={hidden ? 'line-through' : undefined}>{item.label}</span>
            </button>
          )
        })}
      </div>

      <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
        <IconScale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600 dark:text-neutral-600 apple:text-slate-500" />
        {chart.scale === 'log'
          ? 'Логарифмічна шкала стискає великі значення, тому всі криві видно одночасно. Порядок зростання від цього не змінюється.'
          : 'Лінійна шкала показує реальні пропорції: O(n²) поглинає майже весь графік, а O(log n) майже не відрізняється від нуля.'}
      </p>
    </div>
  )
}
