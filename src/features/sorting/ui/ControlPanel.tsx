export interface ControlPanelProps {
  readonly isPlaying: boolean
  readonly isFinished: boolean
  readonly canStepBackward: boolean
  readonly canStepForward: boolean
  readonly currentStep: number
  readonly totalSteps: number
  readonly onTogglePlayback: () => void
  readonly onStepBackward: () => void
  readonly onStepForward: () => void
  readonly onSeek: (step: number) => void
  readonly onGenerate: () => void
}

const BUTTON_GEOMETRY =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm [clip-path:polygon(12px_0%,calc(100%-12px)_0%,100%_35%,100%_65%,calc(100%-12px)_100%,12px_100%,0%_65%,0%_35%)] apple:[clip-path:none] apple:rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-zinc-950 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950 apple:focus-visible:ring-sky-400 apple:focus-visible:ring-offset-slate-950'

const PRIMARY_BUTTON =
  `${BUTTON_GEOMETRY} bg-yellow-400 text-zinc-950 hover:bg-yellow-300 font-mono font-bold uppercase tracking-wider dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 dark:font-sans apple:bg-sky-500 apple:text-white apple:hover:bg-sky-400 apple:font-sans apple:tracking-normal apple:normal-case apple:shadow-md apple:shadow-sky-500/25`

const SECONDARY_BUTTON =
  `${BUTTON_GEOMETRY} bg-zinc-800 text-yellow-400 hover:bg-zinc-700 font-mono dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:font-sans apple:bg-white/10 apple:text-slate-200 apple:hover:bg-white/20 apple:font-sans disabled:cursor-not-allowed disabled:opacity-40`

const GENERATE_BUTTON = SECONDARY_BUTTON

const PANEL =
  'bg-zinc-900/90 border border-yellow-500/25 rounded-none dark:bg-neutral-900/60 dark:border-neutral-800 dark:rounded-xl apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15 apple:rounded-3xl apple:shadow-2xl'

const RANGE_SLIDER =
  'w-full cursor-pointer accent-yellow-400 dark:accent-white apple:accent-sky-400 bg-zinc-800 dark:bg-neutral-800 apple:bg-white/15 rounded-lg'

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" focusable="false">
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" focusable="false">
      <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" />
    </svg>
  )
}

function StepBackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" focusable="false">
      <path d="M6 5h2v14H6zM19 5v14l-9-7z" fill="currentColor" />
    </svg>
  )
}

function StepForwardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" focusable="false">
      <path d="M16 5h2v14h-2zM5 5v14l9-7z" fill="currentColor" />
    </svg>
  )
}

function ShuffleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  )
}

export function ControlPanel({
  isPlaying,
  isFinished,
  canStepBackward,
  canStepForward,
  currentStep,
  totalSteps,
  onTogglePlayback,
  onStepBackward,
  onStepForward,
  onSeek,
  onGenerate,
}: ControlPanelProps) {
  const maxStep = Math.max(totalSteps - 1, 0)
  const sliderValue = Math.min(currentStep, maxStep)

  return (
    <div className={`${PANEL} p-4 sm:p-6`}>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={PRIMARY_BUTTON} onClick={onTogglePlayback}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
          {isPlaying ? 'Пауза' : isFinished ? 'Спочатку' : 'Грати'}
        </button>

        <button
          type="button"
          className={SECONDARY_BUTTON}
          onClick={onStepBackward}
          disabled={!canStepBackward}
        >
          <StepBackIcon />
          Крок назад
        </button>

        <button
          type="button"
          className={SECONDARY_BUTTON}
          onClick={onStepForward}
          disabled={!canStepForward}
        >
          Крок уперед
          <StepForwardIcon />
        </button>

        <button type="button" className={`${GENERATE_BUTTON} sm:ml-auto`} onClick={onGenerate}>
          <ShuffleIcon />
          Новий масив
        </button>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs text-zinc-400 dark:text-neutral-400 apple:text-slate-400">
          <span>Часова шкала</span>
          <span className="font-mono text-yellow-400 dark:text-neutral-200 apple:text-sky-300">
            {currentStep + 1} / {totalSteps}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={maxStep}
          step={1}
          value={sliderValue}
          onChange={(event) => onSeek(Number(event.target.value))}
          className={RANGE_SLIDER}
          aria-label="Позиція відтворення алгоритму"
        />

        <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-zinc-600 dark:text-neutral-600 apple:text-slate-500">
          <span>Старт</span>
          <span>Фініш</span>
        </div>
      </div>
    </div>
  )
}
