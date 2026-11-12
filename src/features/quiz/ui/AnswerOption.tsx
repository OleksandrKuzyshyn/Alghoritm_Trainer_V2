import type { QuizOption } from '../model/types'
import { cn } from '../lib/format'

const BUTTON_GEOMETRY =
  '[clip-path:polygon(14px_0%,calc(100%-14px)_0%,100%_18%,100%_82%,calc(100%-14px)_100%,14px_100%,0%_82%,0%_18%)] apple:[clip-path:none] apple:rounded-2xl transition-all duration-200'

const DEFAULT_OPTION =
  'cursor-pointer border-yellow-500/20 bg-zinc-800/90 text-zinc-100 hover:bg-yellow-400 hover:text-zinc-950 font-mono dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:bg-white dark:hover:text-neutral-950 dark:font-sans apple:border-white/15 apple:bg-white/10 apple:text-slate-100 apple:hover:bg-sky-500 apple:hover:text-white apple:font-sans'

const CORRECT_OPTION =
  'border-yellow-400 bg-yellow-400 text-zinc-950 font-bold dark:border-emerald-500 dark:bg-emerald-500 dark:text-neutral-950 apple:border-emerald-500 apple:bg-emerald-500 apple:text-white'

const WRONG_OPTION =
  'border-rose-600 bg-rose-600 text-white dark:border-rose-500/40 dark:bg-rose-500/25 dark:text-rose-200 apple:border-rose-500 apple:bg-rose-500 apple:text-white'

const MUTED_OPTION =
  'border-yellow-500/10 bg-zinc-800/50 text-zinc-500 opacity-60 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-500 apple:border-white/10 apple:bg-white/5 apple:text-slate-400'

interface AnswerOptionProps {
  option: QuizOption
  index: number
  isSelected: boolean
  isCorrectOption: boolean
  isAnswered: boolean
  onSelect: (optionId: string) => void
}

export function AnswerOption({
  option,
  index,
  isSelected,
  isCorrectOption,
  isAnswered,
  onSelect,
}: AnswerOptionProps) {
  const showCorrect = isAnswered && isCorrectOption
  const showWrong = isAnswered && isSelected && !isCorrectOption
  const isMuted = isAnswered && !showCorrect && !showWrong

  return (
    <button
      type="button"
      disabled={isAnswered}
      onClick={() => onSelect(option.id)}
      aria-pressed={isSelected}
      className={cn(
        'group flex w-full items-start gap-3 rounded-none border px-3.5 py-3 text-left sm:items-center',
        BUTTON_GEOMETRY,
        !isAnswered && DEFAULT_OPTION,
        showCorrect && CORRECT_OPTION,
        showWrong && WRONG_OPTION,
        isMuted && MUTED_OPTION,
        isAnswered && 'cursor-default',
      )}
    >
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-none border font-mono text-xs font-semibold transition-colors dark:rounded-lg dark:font-sans apple:rounded-full apple:font-sans',
          !isAnswered &&
            'border-yellow-500/30 bg-zinc-950 text-yellow-400 group-hover:text-yellow-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400 dark:group-hover:text-white apple:border-white/20 apple:bg-white/10 apple:text-sky-300 apple:group-hover:text-white',
          showCorrect &&
            'border-yellow-300/60 bg-yellow-300/20 text-yellow-950 dark:border-emerald-500/60 dark:bg-emerald-500/15 dark:text-emerald-300 apple:border-emerald-400/50 apple:bg-emerald-500/20 apple:text-emerald-100',
          showWrong &&
            'border-rose-500/60 bg-rose-500/20 text-white dark:border-rose-500/60 dark:bg-rose-500/15 dark:text-rose-300 apple:border-rose-400/50 apple:bg-rose-500/20 apple:text-rose-100',
          isMuted &&
            'border-yellow-500/10 bg-zinc-950/60 text-zinc-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-600 apple:border-white/10 apple:bg-white/5 apple:text-slate-500',
        )}
      >
        {String.fromCharCode(65 + index)}
      </span>
      <span
        className={cn(
          'min-w-0 flex-1 text-sm leading-relaxed',
          showCorrect
            ? 'text-yellow-950 dark:text-neutral-950 apple:text-white'
            : showWrong
              ? 'text-white dark:text-rose-200 apple:text-white'
              : isMuted
                ? 'text-zinc-500 dark:text-neutral-500 apple:text-slate-500'
                : 'text-zinc-100 group-hover:text-zinc-950 dark:text-neutral-200 dark:group-hover:text-neutral-950 apple:text-slate-100 apple:group-hover:text-white',
        )}
      >
        {option.label}
      </span>
      {showCorrect && (
        <span
          className="shrink-0 text-base font-bold text-yellow-950 dark:text-neutral-950 apple:text-white"
          aria-hidden="true"
        >
          ✓
        </span>
      )}
      {showWrong && (
        <span
          className="shrink-0 text-base font-bold text-white dark:text-rose-200 apple:text-white"
          aria-hidden="true"
        >
          ✕
        </span>
      )}
    </button>
  )
}
