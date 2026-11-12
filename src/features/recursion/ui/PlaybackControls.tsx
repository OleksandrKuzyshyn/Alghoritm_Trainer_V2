import { useId } from 'react'
import {
  PauseIcon,
  PlayIcon,
  RestartIcon,
  StepBackIcon,
  StepForwardIcon,
} from './Icons'

type PlaybackAccent = 'sky' | 'emerald'

export interface PlaybackControlsProps {
  readonly isPlaying: boolean
  readonly isFinished: boolean
  readonly canStepBackward: boolean
  readonly canStepForward: boolean
  readonly currentStep: number
  readonly totalSteps: number
  readonly speed: number
  readonly minSpeed: number
  readonly maxSpeed: number
  readonly accent?: PlaybackAccent
  readonly timelineLabel?: string
  readonly onTogglePlayback: () => void
  readonly onStepBackward: () => void
  readonly onStepForward: () => void
  readonly onSeek: (step: number) => void
  readonly onReset: () => void
  readonly onSpeedChange: (speed: number) => void
}

const GEOMETRY =
  '[clip-path:polygon(12px_0%,calc(100%-12px)_0%,100%_35%,100%_65%,calc(100%-12px)_100%,12px_100%,0%_65%,0%_35%)] apple:[clip-path:none] apple:rounded-full transition-all duration-200'

const PRIMARY_BUTTON = `inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-yellow-400 text-zinc-950 hover:bg-yellow-300 font-mono font-bold uppercase dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 dark:font-sans apple:bg-sky-500 apple:text-white apple:hover:bg-sky-400 apple:font-sans apple:normal-case focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:focus-visible:ring-white apple:focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 ${GEOMETRY}`

const SECONDARY_BUTTON = `inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-zinc-800 text-yellow-400 hover:bg-zinc-700 font-mono dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:font-sans apple:bg-white/10 apple:text-slate-200 apple:hover:bg-white/20 apple:font-sans focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:focus-visible:ring-neutral-400 apple:focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-zinc-800 dark:disabled:hover:bg-neutral-800 apple:disabled:hover:bg-white/10 ${GEOMETRY}`

const ACCENTS = {
  sky: {
    primary: PRIMARY_BUTTON,
    secondary: SECONDARY_BUTTON,
    range: 'accent-yellow-400 dark:accent-white apple:accent-sky-500',
    value: 'text-yellow-400 dark:text-neutral-300 apple:text-sky-300',
  },
  emerald: {
    primary: PRIMARY_BUTTON,
    secondary: SECONDARY_BUTTON,
    range: 'accent-yellow-400 dark:accent-white apple:accent-emerald-500',
    value: 'text-amber-400 dark:text-neutral-300 apple:text-emerald-300',
  },
} as const

const RESET_BUTTON = `${SECONDARY_BUTTON} sm:ml-auto`

export function PlaybackControls({
  isPlaying,
  isFinished,
  canStepBackward,
  canStepForward,
  currentStep,
  totalSteps,
  speed,
  minSpeed,
  maxSpeed,
  accent = 'sky',
  timelineLabel = 'Часова шкала',
  onTogglePlayback,
  onStepBackward,
  onStepForward,
  onSeek,
  onReset,
  onSpeedChange,
}: PlaybackControlsProps) {
  const styles = ACCENTS[accent]
  const idPrefix = useId()
  const maxStep = Math.max(totalSteps - 1, 0)
  const sliderValue = Math.min(currentStep, maxStep)
  const percent = maxStep === 0 ? 100 : Math.round((sliderValue / maxStep) * 100)

  return (
    <div className="bg-zinc-900/90 border border-yellow-500/25 rounded-none dark:bg-neutral-900/60 dark:border-neutral-800 dark:rounded-xl apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15 apple:rounded-3xl p-4 shadow-lg sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={styles.primary} onClick={onTogglePlayback}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
          {isPlaying ? 'Пауза' : isFinished ? 'Спочатку' : 'Грати'}
        </button>

        <button
          type="button"
          className={styles.secondary}
          onClick={onStepBackward}
          disabled={!canStepBackward}
        >
          <StepBackIcon />
          Крок назад
        </button>

        <button
          type="button"
          className={styles.secondary}
          onClick={onStepForward}
          disabled={!canStepForward}
        >
          Крок уперед
          <StepForwardIcon />
        </button>

        <button type="button" className={RESET_BUTTON} onClick={onReset}>
          <RestartIcon />
          Скинути
        </button>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
          <label htmlFor={`${idPrefix}-timeline`}>{timelineLabel}</label>
          <span className="font-mono text-zinc-200 dark:text-neutral-200 apple:text-slate-100">
            {sliderValue + 1} / {totalSteps} · {percent}%
          </span>
        </div>

        <input
          id={`${idPrefix}-timeline`}
          type="range"
          min={0}
          max={maxStep}
          step={1}
          value={sliderValue}
          onChange={(event) => onSeek(Number(event.target.value))}
          className={`w-full cursor-pointer ${styles.range}`}
        />

        <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-zinc-600 dark:text-neutral-600 apple:text-slate-400">
          <span>Старт</span>
          <span>Фініш</span>
        </div>
      </div>

      <div className="mt-4 border-t border-yellow-500/25 pt-4 dark:border-neutral-800 apple:border-white/10">
        <div className="flex items-center justify-between">
          <label
            htmlFor={`${idPrefix}-speed`}
            className="text-xs text-zinc-400 dark:text-neutral-400 apple:text-slate-300"
          >
            Швидкість
          </label>
          <span className={`font-mono text-xs ${styles.value}`}>
            {speed} крок/с
          </span>
        </div>

        <input
          id={`${idPrefix}-speed`}
          type="range"
          min={minSpeed}
          max={maxSpeed}
          step={1}
          value={speed}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
          className={`mt-2 w-full cursor-pointer ${styles.range}`}
        />
      </div>
    </div>
  )
}
