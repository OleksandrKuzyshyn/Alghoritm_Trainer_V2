import { SORTING_ALGORITHMS } from '../model/algorithms'
import {
  MAX_ARRAY_SIZE,
  MAX_SPEED,
  MIN_ARRAY_SIZE,
  MIN_SPEED,
} from '../model/useSortingEngine'
import type { AlgorithmInfo, SortingAlgorithmId } from '../model/types'

export interface SettingsPanelProps {
  readonly algorithm: SortingAlgorithmId
  readonly algorithmInfo: AlgorithmInfo
  readonly arraySize: number
  readonly speed: number
  readonly onAlgorithmChange: (algorithm: SortingAlgorithmId) => void
  readonly onArraySizeChange: (size: number) => void
  readonly onSpeedChange: (speed: number) => void
}

const BUTTON_GEOMETRY =
  '[clip-path:polygon(12px_0%,calc(100%-12px)_0%,100%_35%,100%_65%,calc(100%-12px)_100%,12px_100%,0%_65%,0%_35%)] apple:[clip-path:none] apple:rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-zinc-950 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950 apple:focus-visible:ring-sky-400 apple:focus-visible:ring-offset-slate-950'

const ACTIVE_ALGORITHM_BUTTON =
  `${BUTTON_GEOMETRY} bg-yellow-400 text-zinc-950 hover:bg-yellow-300 font-mono font-bold uppercase tracking-wider dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 dark:font-sans apple:bg-sky-500 apple:text-white apple:hover:bg-sky-400 apple:font-sans apple:tracking-normal apple:normal-case apple:shadow-md apple:shadow-sky-500/25`

const INACTIVE_ALGORITHM_BUTTON =
  `${BUTTON_GEOMETRY} bg-zinc-800 text-yellow-400 hover:bg-zinc-700 font-mono dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:font-sans apple:bg-white/10 apple:text-slate-200 apple:hover:bg-white/20 apple:font-sans`

const PANEL =
  'bg-zinc-900/90 border border-yellow-500/25 rounded-none dark:bg-neutral-900/60 dark:border-neutral-800 dark:rounded-xl apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15 apple:rounded-3xl apple:shadow-2xl'

const RANGE_SLIDER =
  'mt-3 w-full cursor-pointer accent-yellow-400 dark:accent-white apple:accent-sky-400 bg-zinc-800 dark:bg-neutral-800 apple:bg-white/15 rounded-lg'

const TELEMETRY_BADGE =
  'bg-zinc-950 text-yellow-400 border border-yellow-500/30 font-mono px-3 py-1 dark:bg-neutral-950 dark:text-neutral-200 dark:border-neutral-800 apple:bg-white/10 apple:text-sky-300 apple:border-white/15 apple:rounded-full'

export function SettingsPanel({
  algorithm,
  algorithmInfo,
  arraySize,
  speed,
  onAlgorithmChange,
  onArraySizeChange,
  onSpeedChange,
}: SettingsPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <section className={`${PANEL} p-4 sm:p-5`}>
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-500 dark:text-neutral-500 apple:text-sky-300">
          Алгоритм
        </h3>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {SORTING_ALGORITHMS.map((info) => {
            const isActive = info.id === algorithm

            return (
              <button
                key={info.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onAlgorithmChange(info.id)}
                className={`flex w-full flex-col items-start justify-center px-3 py-2 text-left ${
                  isActive ? ACTIVE_ALGORITHM_BUTTON : INACTIVE_ALGORITHM_BUTTON
                }`}
              >
                <span className="block text-sm font-medium">{info.name}</span>
                <span
                  className={`mt-0.5 block font-mono text-[11px] ${
                    isActive
                      ? 'text-zinc-800 dark:text-neutral-600 apple:text-sky-100'
                      : 'text-yellow-500/70 dark:text-neutral-500 apple:text-slate-400'
                  }`}
                >
                  {info.complexity.average}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 rounded-none border border-yellow-500/15 bg-zinc-950/60 p-3 dark:rounded-xl dark:border-neutral-800 dark:bg-neutral-950/60 apple:rounded-2xl apple:border-white/10 apple:bg-white/[0.04] apple:backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-zinc-100 dark:text-neutral-100 apple:text-white">
              {algorithmInfo.ukrainianName}
            </p>
            <span
              className={`shrink-0 rounded-none border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider dark:rounded-full apple:rounded-full ${
                algorithmInfo.stable
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 apple:border-emerald-400/30 apple:bg-emerald-400/15 apple:text-emerald-300'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-400 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300 apple:border-rose-400/30 apple:bg-rose-400/15 apple:text-rose-300'
              }`}
            >
              {algorithmInfo.stable ? 'Стабільний' : 'Нестабільний'}
            </span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-neutral-400 apple:text-slate-400">
            {algorithmInfo.description}
          </p>

          <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <dt className="text-zinc-500 dark:text-neutral-500 apple:text-slate-400">Найкращий</dt>
              <dd className="font-mono text-emerald-400 dark:text-emerald-300 apple:text-emerald-300">
                {algorithmInfo.complexity.best}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 dark:text-neutral-500 apple:text-slate-400">Середній</dt>
              <dd className="font-mono text-yellow-400 dark:text-neutral-200 apple:text-sky-300">
                {algorithmInfo.complexity.average}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 dark:text-neutral-500 apple:text-slate-400">Найгірший</dt>
              <dd className="font-mono text-rose-400 dark:text-rose-300 apple:text-rose-300">
                {algorithmInfo.complexity.worst}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 dark:text-neutral-500 apple:text-slate-400">Пам'ять</dt>
              <dd className="font-mono text-zinc-300 dark:text-neutral-300 apple:text-slate-200">
                {algorithmInfo.complexity.space}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={`${PANEL} p-4 sm:p-5`}>
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-500 dark:text-neutral-500 apple:text-sky-300">
          Налаштування
        </h3>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="sorting-array-size"
              className="text-sm text-zinc-300 dark:text-neutral-300 apple:text-slate-200"
            >
              Розмір масиву
            </label>
            <span className={TELEMETRY_BADGE}>{arraySize}</span>
          </div>

          <input
            id="sorting-array-size"
            type="range"
            min={MIN_ARRAY_SIZE}
            max={MAX_ARRAY_SIZE}
            step={1}
            value={arraySize}
            onChange={(event) => onArraySizeChange(Number(event.target.value))}
            className={RANGE_SLIDER}
          />

          <div className="mt-1 flex justify-between text-[10px] text-zinc-600 dark:text-neutral-600 apple:text-slate-500">
            <span>{MIN_ARRAY_SIZE}</span>
            <span>{MAX_ARRAY_SIZE}</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="sorting-speed"
              className="text-sm text-zinc-300 dark:text-neutral-300 apple:text-slate-200"
            >
              Швидкість
            </label>
            <span className={TELEMETRY_BADGE}>{speed} крок/с</span>
          </div>

          <input
            id="sorting-speed"
            type="range"
            min={MIN_SPEED}
            max={MAX_SPEED}
            step={1}
            value={speed}
            onChange={(event) => onSpeedChange(Number(event.target.value))}
            className={RANGE_SLIDER}
          />

          <div className="mt-1 flex justify-between text-[10px] text-zinc-600 dark:text-neutral-600 apple:text-slate-500">
            <span>Повільно</span>
            <span>Швидко</span>
          </div>
        </div>
      </section>
    </div>
  )
}
