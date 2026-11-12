import { useId } from 'react'
import { MAX_TARGET, MIN_TARGET } from '../model/binarySearch'
import type { BinarySearchComparison } from '../model/types'
import {
  MAX_BINARY_SEARCH_SPEED,
  MIN_BINARY_SEARCH_SPEED,
  useBinarySearch,
} from '../model/useBinarySearch'
import { BinarySearchMetrics } from './BinarySearchMetrics'
import { BinarySearchVisualizer } from './BinarySearchVisualizer'
import { SearchIcon, ShuffleIcon } from './Icons'
import { PlaybackControls } from './PlaybackControls'

const PANEL =
  'bg-zinc-900/90 border border-yellow-500/25 rounded-none dark:bg-neutral-900/60 dark:border-neutral-800 dark:rounded-xl apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15 apple:rounded-3xl'

const GEOMETRY =
  '[clip-path:polygon(12px_0%,calc(100%-12px)_0%,100%_35%,100%_65%,calc(100%-12px)_100%,12px_100%,0%_65%,0%_35%)] apple:[clip-path:none] apple:rounded-full transition-all duration-200'

const SECONDARY_BUTTON = `inline-flex items-center justify-center gap-2 px-3 py-2 text-xs bg-zinc-800 text-yellow-400 hover:bg-zinc-700 font-mono dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:font-sans apple:bg-white/10 apple:text-slate-200 apple:hover:bg-white/20 apple:font-sans focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:focus-visible:ring-neutral-400 apple:focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 ${GEOMETRY}`

const COMPARISON_STYLES: Record<
  BinarySearchComparison,
  { readonly label: string; readonly className: string }
> = {
  less: {
    label: 'A[mid] < ціль',
    className:
      'border-yellow-400/40 bg-yellow-400/10 text-yellow-300 dark:border-white/30 dark:bg-white/10 dark:text-white apple:border-sky-400/40 apple:bg-sky-500/15 apple:text-sky-200',
  },
  greater: {
    label: 'A[mid] > ціль',
    className:
      'border-amber-500/40 bg-amber-500/10 text-amber-400 dark:border-neutral-500/50 dark:bg-neutral-500/10 dark:text-neutral-300 apple:border-emerald-400/40 apple:bg-emerald-500/15 apple:text-emerald-300',
  },
  equal: {
    label: 'A[mid] = ціль',
    className:
      'border-amber-500/40 bg-amber-500/10 text-amber-400 dark:border-neutral-500/50 dark:bg-neutral-500/10 dark:text-neutral-300 apple:border-emerald-400/40 apple:bg-emerald-500/15 apple:text-emerald-300',
  },
  none: {
    label: 'очікування',
    className:
      'border-zinc-800 bg-zinc-950/60 text-zinc-400 dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-400 apple:border-white/10 apple:bg-white/10 apple:text-slate-300',
  },
}

const SHUFFLE_BUTTON = SECONDARY_BUTTON

const TARGET_BUTTON = SECONDARY_BUTTON

export function BinarySearchLab() {
  const search = useBinarySearch()
  const idPrefix = useId()
  const comparison = COMPARISON_STYLES[search.step.comparison]

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <section className={`${PANEL} p-4 shadow-lg sm:p-6`}>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-zinc-100 dark:text-neutral-200 apple:text-slate-100">
                Масив і покажчики
              </h3>
              <p className="mt-1 min-h-5 text-xs text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
                {search.step.message}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-yellow-500/25 bg-zinc-950/60 px-3 py-1 font-mono text-xs text-yellow-400 dark:border-neutral-700 dark:bg-neutral-950/60 dark:text-neutral-300 apple:border-white/10 apple:bg-white/10 apple:text-sky-300 apple:font-sans">
              A[{search.step.middle ?? '—'}] ={' '}
              {search.step.middleValue ?? '—'}
            </span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 dark:border-neutral-800 dark:bg-neutral-950/60 dark:rounded-xl apple:border-white/10 apple:bg-black/20 apple:rounded-2xl sm:p-4">
            <BinarySearchVisualizer array={search.array} step={search.step} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-yellow-400/30 bg-yellow-400/10 px-2 py-0.5 font-mono text-[10px] text-yellow-300 dark:border-white/20 dark:bg-white/10 dark:text-white apple:border-sky-400/30 apple:bg-sky-500/10 apple:text-sky-300 apple:rounded-full">
              L = {search.step.done ? '—' : search.step.left}
            </span>
            <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-400 dark:border-neutral-600 dark:bg-neutral-600/20 dark:text-neutral-300 apple:border-emerald-400/30 apple:bg-emerald-500/10 apple:text-emerald-300 apple:rounded-full">
              M = {search.step.middle ?? '—'}
            </span>
            <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] text-amber-300 dark:border-neutral-700 dark:bg-neutral-700/20 dark:text-neutral-300 apple:border-emerald-300/30 apple:bg-emerald-400/10 apple:text-emerald-200 apple:rounded-full">
              R = {search.step.done ? '—' : search.step.right}
            </span>

            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${comparison.className}`}
            >
              {comparison.label}
            </span>

            <span className="ml-auto text-[10px] text-zinc-600 dark:text-neutral-600 apple:text-slate-400">
              Наступні межі:{' '}
              <span className="font-mono text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
                {search.step.nextLeft ?? '—'}…{search.step.nextRight ?? '—'}
              </span>
            </span>
          </div>
        </section>

        <PlaybackControls
          isPlaying={search.isPlaying}
          isFinished={search.isFinished}
          canStepBackward={search.canStepBackward}
          canStepForward={search.canStepForward}
          currentStep={search.currentStep}
          totalSteps={search.totalSteps}
          speed={search.speed}
          minSpeed={MIN_BINARY_SEARCH_SPEED}
          maxSpeed={MAX_BINARY_SEARCH_SPEED}
          accent="emerald"
          timelineLabel="Крок пошуку"
          onTogglePlayback={search.togglePlayback}
          onStepBackward={search.stepBackward}
          onStepForward={search.stepForward}
          onSeek={search.seek}
          onReset={search.reset}
          onSpeedChange={search.setSpeed}
        />
      </div>

      <aside className="flex min-w-0 flex-col gap-6">
        <section className={`${PANEL} p-4 shadow-lg sm:p-5`}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
              Параметри пошуку
            </h3>
            <span className="rounded-md border border-yellow-500/25 bg-zinc-950/60 px-2 py-0.5 font-mono text-[11px] text-yellow-400 dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-300 apple:border-white/10 apple:bg-white/10 apple:text-sky-300 apple:rounded-full apple:font-sans">
              n = {search.array.length}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <label
                htmlFor={`${idPrefix}-target`}
                className="text-sm text-zinc-200 dark:text-neutral-300 apple:text-slate-200"
              >
                Ціль
              </label>
              <span className="rounded-md border border-yellow-500/25 bg-zinc-950/60 px-2 py-0.5 font-mono text-xs text-amber-400 dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-300 apple:border-white/10 apple:bg-white/10 apple:text-emerald-300 apple:rounded-full">
                {search.target}
              </span>
            </div>

            <input
              id={`${idPrefix}-target`}
              type="range"
              min={MIN_TARGET}
              max={MAX_TARGET}
              step={1}
              value={search.target}
              onChange={(event) => search.setTarget(Number(event.target.value))}
              className="mt-2 w-full cursor-pointer accent-yellow-400 dark:accent-white apple:accent-emerald-500"
            />

            <div className="mt-1 flex justify-between text-[10px] text-zinc-600 dark:text-neutral-600 apple:text-slate-400">
              <span>{MIN_TARGET}</span>
              <span>{MAX_TARGET}</span>
            </div>

            <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
              {search.targetExists
                ? 'Ціль присутня в масиві — пошук завершиться успішно.'
                : 'Цілі немає в масиві — побачите сценарій «не знайдено».'}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={SHUFFLE_BUTTON}
              onClick={search.generateArray}
            >
              <ShuffleIcon className="h-3.5 w-3.5" />
              Нова послідовність
            </button>

            <button
              type="button"
              className={TARGET_BUTTON}
              onClick={search.chooseExistingTarget}
            >
              <SearchIcon className="h-3.5 w-3.5" />
              Ціль із масиву
            </button>
          </div>
        </section>

        <BinarySearchMetrics
          step={search.step}
          currentStep={search.currentStep}
          totalSteps={search.totalSteps}
          progress={search.progress}
          maxSteps={search.maxSteps}
          targetExists={search.targetExists}
        />

        <section className={`${PANEL} p-4 shadow-lg sm:p-5`}>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
            Як працює бінарний пошук
          </h3>

          <div className="mt-3 rounded-lg border border-yellow-500/15 bg-zinc-950/60 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950/50 apple:border-white/10 apple:bg-white/[0.04] apple:rounded-xl">
            <p className="font-mono text-xs text-yellow-300 dark:text-neutral-200 apple:text-sky-300">
              mid = ⌊(L + R) / 2⌋
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
              <span className="text-amber-400 dark:text-neutral-300 apple:text-emerald-300">
                Умова:
              </span>{' '}
              масив відсортований за зростанням.
            </p>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
            Кожне порівняння відкидає половину кандидатів. Покажчики{' '}
            <span className="text-yellow-400 dark:text-neutral-200 apple:text-sky-300">
              L
            </span>{' '}
            та{' '}
            <span className="text-amber-400 dark:text-neutral-300 apple:text-emerald-300">
              R
            </span>{' '}
            звужують діапазон, а{' '}
            <span className="text-amber-300 dark:text-neutral-400 apple:text-emerald-200">
              M
            </span>{' '}
            показує середину.
          </p>

          <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <dt className="text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
                Час
              </dt>
              <dd className="font-mono text-yellow-400 dark:text-neutral-300 apple:text-sky-300">
                O(log n)
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
                Пам'ять
              </dt>
              <dd className="font-mono text-amber-400 dark:text-neutral-300 apple:text-emerald-300">
                O(1)
              </dd>
            </div>
          </dl>
        </section>
      </aside>
    </div>
  )
}
