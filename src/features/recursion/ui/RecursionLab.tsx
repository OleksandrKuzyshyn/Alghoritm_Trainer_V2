import type { CallEventType } from '../model/types'
import {
  MAX_TRACE_SPEED,
  MIN_TRACE_SPEED,
  useRecursionTracer,
} from '../model/useRecursionTracer'
import { AlgorithmPanel } from './AlgorithmPanel'
import { CallStackPanel } from './CallStackPanel'
import { CallTreeDiagram } from './CallTreeDiagram'
import { PlaybackControls } from './PlaybackControls'
import { RecursionMetrics } from './RecursionMetrics'

const PANEL =
  'bg-zinc-900/90 border border-yellow-500/25 rounded-none dark:bg-neutral-900/60 dark:border-neutral-800 dark:rounded-xl apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15 apple:rounded-3xl'

const CHIP =
  'rounded-full border border-yellow-500/25 bg-zinc-950/60 px-3 py-1 font-mono text-xs text-yellow-400 dark:border-neutral-700 dark:bg-neutral-950/60 dark:text-neutral-300 apple:border-white/10 apple:bg-white/10 apple:text-sky-300 apple:font-sans'

const LEGEND = [
  { label: 'Очікує', dotClassName: 'bg-zinc-700 dark:bg-neutral-600 apple:bg-slate-500' },
  { label: 'Активний', dotClassName: 'bg-yellow-400 dark:bg-white apple:bg-sky-500' },
  { label: 'База', dotClassName: 'bg-amber-500 dark:bg-neutral-500 apple:bg-emerald-500' },
  { label: 'Повернено', dotClassName: 'bg-amber-400 dark:bg-neutral-400 apple:bg-emerald-400' },
  { label: 'Мемо', dotClassName: 'bg-amber-500/60 dark:bg-neutral-500/60 apple:bg-emerald-500/60' },
] as const

const EVENT_STYLES: Record<
  CallEventType,
  { readonly label: string; readonly className: string }
> = {
  call: {
    label: 'Виклик',
    className:
      'border-yellow-400/40 bg-yellow-400/10 text-yellow-300 dark:border-white/30 dark:bg-white/10 dark:text-white apple:border-sky-400/40 apple:bg-sky-500/15 apple:text-sky-200',
  },
  base: {
    label: 'Базовий випадок',
    className:
      'border-amber-500/40 bg-amber-500/10 text-amber-400 dark:border-neutral-500/50 dark:bg-neutral-500/10 dark:text-neutral-300 apple:border-emerald-400/40 apple:bg-emerald-500/15 apple:text-emerald-300',
  },
  move: {
    label: 'Переміщення',
    className:
      'border-yellow-400/40 bg-yellow-400/10 text-yellow-300 dark:border-white/30 dark:bg-white/10 dark:text-white apple:border-sky-400/40 apple:bg-sky-500/15 apple:text-sky-200',
  },
  memo: {
    label: 'Мемо',
    className:
      'border-amber-500/40 bg-amber-500/10 text-amber-400 dark:border-neutral-500/50 dark:bg-neutral-500/10 dark:text-neutral-300 apple:border-emerald-400/40 apple:bg-emerald-500/15 apple:text-emerald-300',
  },
  guard: {
    label: 'Ліміт глибини',
    className:
      'border-amber-500/40 bg-amber-500/20 text-amber-300 dark:border-neutral-400/50 dark:bg-neutral-400/10 dark:text-neutral-200 apple:border-emerald-400/40 apple:bg-emerald-500/20 apple:text-emerald-200',
  },
  return: {
    label: 'Повернення',
    className:
      'border-amber-500/40 bg-amber-500/10 text-amber-400 dark:border-neutral-500/50 dark:bg-neutral-500/10 dark:text-neutral-300 apple:border-emerald-400/40 apple:bg-emerald-500/15 apple:text-emerald-300',
  },
}

const DETAIL_BOX =
  'rounded-lg border border-yellow-500/15 bg-zinc-950/50 px-2 py-1.5 dark:border-neutral-800 dark:bg-neutral-950/50 apple:border-white/10 apple:bg-white/[0.04] apple:rounded-xl'

export function RecursionLab() {
  const tracer = useRecursionTracer()
  const eventStyle = EVENT_STYLES[tracer.frame.event.type]

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <section className={`${PANEL} p-4 shadow-lg sm:p-6`}>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-zinc-100 dark:text-neutral-200 apple:text-slate-100">
                Дерево рекурсивних викликів
              </h3>
              <p className="mt-1 min-h-5 text-xs text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
                {tracer.frame.message}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className={CHIP}>
                {tracer.currentStep + 1} / {tracer.totalSteps}
              </span>
              <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300 dark:border-white/30 dark:bg-white/10 dark:text-white apple:border-sky-400/30 apple:bg-sky-500/15 apple:text-sky-200 apple:font-sans">
                {tracer.algorithmInfo.name}
              </span>
            </div>
          </div>

          <div className="h-[360px] w-full overflow-auto rounded-xl border border-zinc-800 bg-zinc-950/80 p-2 dark:border-neutral-800 dark:bg-neutral-950/60 dark:rounded-xl apple:border-white/10 apple:bg-black/20 apple:rounded-2xl sm:h-[420px]">
            <CallTreeDiagram
              layout={tracer.layout}
              nodeStatuses={tracer.frame.nodeStatuses}
              nodeValues={tracer.frame.nodeValues}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGEND.map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-neutral-400 apple:text-slate-300"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-sm ${item.dotClassName}`}
                  aria-hidden="true"
                />
                {item.label}
              </span>
            ))}

            <span className="ml-auto font-mono text-[11px] text-zinc-600 dark:text-neutral-600 apple:text-slate-400">
              {tracer.totalCalls} викликів · глибина {tracer.maxDepth}
            </span>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <CallStackPanel
            stack={tracer.callStack}
            maxDepth={tracer.maxDepth}
            depthLimit={tracer.depthLimit}
          />

          <section className={`${PANEL} flex h-full flex-col p-4 shadow-lg sm:p-5`}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
                Поточний крок
              </h3>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${eventStyle.className}`}
              >
                {eventStyle.label}
              </span>
            </div>

            <p className="mt-3 font-mono text-sm text-zinc-100 dark:text-neutral-200 apple:text-slate-100">
              {tracer.frame.event.label}
            </p>

            <p className="mt-2 flex-1 text-xs leading-relaxed text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
              {tracer.frame.message}
            </p>

            <dl className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
              <div className={DETAIL_BOX}>
                <dt className="text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
                  Значення
                </dt>
                <dd className="font-mono text-amber-400 dark:text-neutral-300 apple:text-emerald-300">
                  {tracer.frame.event.value ?? '—'}
                </dd>
              </div>
              <div className={DETAIL_BOX}>
                <dt className="text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
                  Глибина
                </dt>
                <dd className="font-mono text-amber-400 dark:text-neutral-300 apple:text-emerald-300">
                  {tracer.currentDepth}
                </dd>
              </div>
              <div className={DETAIL_BOX}>
                <dt className="text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
                  Повернень
                </dt>
                <dd className="font-mono text-yellow-400 dark:text-neutral-300 apple:text-sky-300">
                  {tracer.completedCalls}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <PlaybackControls
          isPlaying={tracer.isPlaying}
          isFinished={tracer.isFinished}
          canStepBackward={tracer.canStepBackward}
          canStepForward={tracer.canStepForward}
          currentStep={tracer.currentStep}
          totalSteps={tracer.totalSteps}
          speed={tracer.speed}
          minSpeed={MIN_TRACE_SPEED}
          maxSpeed={MAX_TRACE_SPEED}
          accent="sky"
          timelineLabel="Крок трасування"
          onTogglePlayback={tracer.togglePlayback}
          onStepBackward={tracer.stepBackward}
          onStepForward={tracer.stepForward}
          onSeek={tracer.seek}
          onReset={tracer.reset}
          onSpeedChange={tracer.setSpeed}
        />
      </div>

      <aside className="flex min-w-0 flex-col gap-6">
        <AlgorithmPanel
          algorithm={tracer.algorithm}
          info={tracer.algorithmInfo}
          input={tracer.input}
          onAlgorithmChange={tracer.setAlgorithm}
          onPrimaryChange={tracer.setPrimary}
          onSecondaryChange={tracer.setSecondary}
        />

        <RecursionMetrics
          frame={tracer.frame}
          currentStep={tracer.currentStep}
          totalSteps={tracer.totalSteps}
          progress={tracer.progress}
          maxDepth={tracer.maxDepth}
          totalCalls={tracer.totalCalls}
          finalResult={tracer.finalResult}
          isFinished={tracer.isFinished}
          depthLimit={tracer.depthLimit}
          depthLimitReached={tracer.depthLimitReached}
        />
      </aside>
    </div>
  )
}
