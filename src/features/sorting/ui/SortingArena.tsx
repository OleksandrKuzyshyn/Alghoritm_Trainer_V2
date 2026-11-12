import { useSortingEngine } from '../model/useSortingEngine'
import { ArrayVisualizer } from './ArrayVisualizer'
import { ControlPanel } from './ControlPanel'
import { MetricsPanel } from './MetricsPanel'
import { SettingsPanel } from './SettingsPanel'

const LEGEND = [
  {
    label: 'Не оброблено',
    dotClassName: 'bg-yellow-400/75 dark:bg-neutral-500 apple:bg-sky-400/80',
  },
  { label: 'Порівняння', dotClassName: 'bg-rose-500 dark:bg-white apple:bg-indigo-400' },
  {
    label: 'Обмін / відсортовано',
    dotClassName: 'bg-amber-300 dark:bg-emerald-400 apple:bg-emerald-400',
  },
] as const

const PANEL =
  'bg-zinc-900/90 border border-yellow-500/25 rounded-none dark:bg-neutral-900/60 dark:border-neutral-800 dark:rounded-xl apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15 apple:rounded-3xl apple:shadow-2xl'

export function SortingArena() {
  const engine = useSortingEngine()
  const maxValue = Math.max(...engine.values, 1)

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 text-zinc-100 dark:text-neutral-100 apple:text-slate-100">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-yellow-400 dark:text-neutral-400 apple:text-sky-300">
            Алгоритми сортування
          </p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-100 dark:text-white apple:text-white sm:text-3xl">
            Сортувальна арена
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
            Порівнюйте шість алгоритмів у реальному часі, керуйте відтворенням і
            подорожуйте історією виконання крок за кроком.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-none border border-yellow-500/30 bg-zinc-900 px-3 py-1 text-xs text-yellow-400 dark:rounded-full dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 apple:rounded-full apple:border-white/15 apple:bg-white/10 apple:text-slate-200">
            6 алгоритмів
          </span>
          <span className="rounded-none border border-yellow-500/30 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-400 dark:rounded-full dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 apple:rounded-full apple:border-sky-400/30 apple:bg-sky-500/20 apple:text-sky-300">
            Time travel
          </span>
          <span className="rounded-none border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 dark:rounded-full dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 apple:rounded-full apple:border-emerald-400/30 apple:bg-emerald-400/15 apple:text-emerald-300">
            {engine.algorithmInfo.complexity.average}
          </span>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className={`${PANEL} p-4 sm:p-6`}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-zinc-100 dark:text-neutral-100 apple:text-white">
                  Візуалізація масиву
                </h3>
                <p className="mt-1 min-h-5 text-xs text-zinc-400 dark:text-neutral-400 apple:text-slate-400">
                  {engine.snapshot.message}
                </p>
              </div>

              <span className="shrink-0 rounded-none border border-yellow-500/30 bg-zinc-950/60 px-3 py-1 font-mono text-xs text-yellow-400 dark:rounded-full dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-300 apple:rounded-full apple:border-white/15 apple:bg-white/10 apple:text-sky-300">
                {engine.algorithmInfo.name}
              </span>
            </div>

            <div className="h-64 w-full rounded-none border border-yellow-500/20 bg-zinc-950/80 p-3 dark:rounded-xl dark:border-neutral-800 dark:bg-neutral-950/80 apple:rounded-2xl apple:border-white/10 apple:bg-white/[0.04] apple:backdrop-blur-2xl sm:h-80">
              <ArrayVisualizer snapshot={engine.snapshot} maxValue={maxValue} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              {LEGEND.map((item) => (
                <span
                  key={item.label}
                  className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-neutral-400 apple:text-slate-400"
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-sm dark:rounded-full apple:rounded-full ${item.dotClassName}`}
                    aria-hidden="true"
                  />
                  {item.label}
                </span>
              ))}

              <span className="ml-auto font-mono text-[11px] text-zinc-600 dark:text-neutral-600 apple:text-slate-500">
                {engine.snapshot.array.length} елементів
              </span>
            </div>
          </div>

          <ControlPanel
            isPlaying={engine.isPlaying}
            isFinished={engine.isFinished}
            canStepBackward={engine.canStepBackward}
            canStepForward={engine.canStepForward}
            currentStep={engine.currentStep}
            totalSteps={engine.totalSteps}
            onTogglePlayback={engine.togglePlayback}
            onStepBackward={engine.stepBackward}
            onStepForward={engine.stepForward}
            onSeek={engine.seek}
            onGenerate={engine.generateNewArray}
          />
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <SettingsPanel
            algorithm={engine.algorithm}
            algorithmInfo={engine.algorithmInfo}
            arraySize={engine.arraySize}
            speed={engine.speed}
            onAlgorithmChange={engine.setAlgorithm}
            onArraySizeChange={engine.setArraySize}
            onSpeedChange={engine.setSpeed}
          />

          <MetricsPanel
            snapshot={engine.snapshot}
            currentStep={engine.currentStep}
            totalSteps={engine.totalSteps}
            progress={engine.progress}
          />
        </aside>
      </div>
    </section>
  )
}
