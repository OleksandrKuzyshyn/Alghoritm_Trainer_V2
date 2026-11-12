import { useState } from 'react'
import type {
  QuizAnswerRecord,
  QuizProgress,
  QuizQuestion,
} from '../model/types'
import { cn, formatDuration, formatPercent } from '../lib/format'
import { StatsGrid } from './StatsGrid'

const MAIN_CARD =
  'bg-zinc-900/95 border border-yellow-500/30 rounded-none dark:bg-neutral-900/60 dark:border-neutral-800 dark:rounded-xl apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15 apple:rounded-3xl apple:shadow-2xl'

const BUTTON_GEOMETRY =
  '[clip-path:polygon(12px_0%,calc(100%-12px)_0%,100%_35%,100%_65%,calc(100%-12px)_100%,12px_100%,0%_65%,0%_35%)] apple:[clip-path:none] apple:rounded-full transition-all duration-200'

const PRIMARY_BUTTON =
  'bg-yellow-400 text-zinc-950 font-mono font-bold uppercase hover:bg-yellow-300 dark:bg-white dark:text-neutral-950 dark:font-sans apple:bg-sky-500 apple:text-white apple:hover:bg-sky-400 apple:font-sans apple:normal-case'

const SECONDARY_BUTTON =
  'border border-yellow-500/20 bg-zinc-900/90 text-zinc-300 hover:border-yellow-400/60 hover:text-yellow-400 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-white apple:border-white/15 apple:bg-white/10 apple:text-slate-200 apple:hover:border-white/25 apple:hover:bg-white/20 apple:hover:text-white'

interface QuizResultsProps {
  questions: QuizQuestion[]
  answers: QuizAnswerRecord[]
  score: number
  total: number
  stats: QuizProgress
  startedAt: number | null
  finishedAt: number | null
  onRestart: () => void
  onExit: () => void
}

function getVerdict(percentage: number, score: number): string {
  if (score === 0) {
    return 'Початок покладено. Розбери пояснення нижче й спробуй ще раз.'
  }

  if (percentage >= 90) {
    return 'Відмінно! Ти впевнено бачиш наступний крок алгоритмів.'
  }

  if (percentage >= 70) {
    return 'Гарний результат. Залишилося кілька деталей.'
  }

  if (percentage >= 50) {
    return 'Непогано, але варто повторити ключові кроки.'
  }

  return 'Є над чим попрацювати. Розбір відповідей допоможе.'
}

export function QuizResults({
  questions,
  answers,
  score,
  total,
  stats,
  startedAt,
  finishedAt,
  onRestart,
  onExit,
}: QuizResultsProps) {
  const [showReview, setShowReview] = useState(false)

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  const wrong = Math.max(total - score, 0)
  const answerByQuestion = new Map(
    answers.map((answer) => [answer.questionId, answer]),
  )
  const percentageClass =
    percentage >= 80
      ? 'text-yellow-400 dark:text-emerald-400 apple:text-emerald-300'
      : percentage >= 50
        ? 'text-yellow-300 dark:text-white apple:text-sky-300'
        : 'text-rose-400 dark:text-rose-400 apple:text-rose-300'

  const statItems: Array<{
    label: string
    value: string
    hint: string
    tone: 'sky' | 'emerald' | 'rose' | 'slate'
  }> = [
    {
      label: 'Правильні',
      value: String(score),
      hint: `з ${total} питань`,
      tone: 'emerald',
    },
    {
      label: 'Помилки',
      value: String(wrong),
      hint: wrong === 0 ? 'Ідеальна серія' : 'Є що повторити',
      tone: 'rose',
    },
    {
      label: 'Час гри',
      value: formatDuration(startedAt, finishedAt),
      hint: 'Без таймера й поспіху',
      tone: 'sky',
    },
    {
      label: 'Найкращий',
      value:
        stats.bestTotal > 0 ? `${stats.bestScore}/${stats.bestTotal}` : '—',
      hint:
        stats.bestTotal > 0
          ? `${stats.bestPercent}% правильних`
          : 'Результат збережеться',
      tone: 'slate',
    },
  ]

  return (
    <section className="mx-auto w-full max-w-3xl space-y-4">
      <div className={`${MAIN_CARD} overflow-hidden`}>
        <div className="p-6 text-center sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-400 dark:text-neutral-500 apple:text-sky-300">
            Результат
          </p>
          <p
            className={cn(
              'mt-3 font-mono text-6xl font-bold tabular-nums dark:font-sans apple:font-sans',
              percentageClass,
            )}
          >
            {formatPercent(percentage)}
          </p>
          <p className="mt-2 text-lg font-semibold text-zinc-100 dark:text-neutral-100 apple:text-white">
            {score} з {total} правильних
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
            {getVerdict(percentage, score)}
          </p>
        </div>
      </div>

      <StatsGrid items={statItems} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRestart}
          className={`${BUTTON_GEOMETRY} ${PRIMARY_BUTTON} flex-1 rounded-none px-6 py-2.5 text-sm`}
        >
          Спробувати ще раз
        </button>
        <button
          type="button"
          onClick={onExit}
          className={`${BUTTON_GEOMETRY} ${SECONDARY_BUTTON} flex-1 rounded-none px-6 py-2.5 text-sm font-semibold`}
        >
          До вибору режиму
        </button>
      </div>

      <div className={`${MAIN_CARD} p-4 sm:p-5`}>
        <button
          type="button"
          onClick={() => setShowReview((previous) => !previous)}
          aria-expanded={showReview}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span className="text-sm font-semibold text-zinc-200 dark:text-neutral-200 apple:text-slate-200">
            Розбір відповідей
          </span>
          <span className="text-[11px] font-medium text-yellow-400 dark:text-neutral-300 apple:text-sky-300">
            {showReview ? 'Сховати ↑' : 'Показати ↓'}
          </span>
        </button>

        {showReview && (
          <ul className="mt-4 space-y-3">
            {questions.map((question, index) => {
              const answer = answerByQuestion.get(question.id)
              const selectedOption = question.options.find(
                (option) => option.id === answer?.selectedOptionId,
              )
              const correctOption = question.options.find(
                (option) => option.id === question.correctOptionId,
              )
              const isCorrect = answer?.isCorrect === true

              return (
                <li
                  key={question.id}
                  className="rounded-none border border-yellow-500/15 bg-zinc-950 p-4 dark:rounded-xl dark:border-neutral-800 dark:bg-neutral-950 apple:rounded-2xl apple:border-white/15 apple:bg-white/[0.04] apple:backdrop-blur-xl"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        isCorrect
                          ? 'bg-yellow-400/15 text-yellow-400 dark:bg-emerald-500/15 dark:text-emerald-400 apple:bg-emerald-500/20 apple:text-emerald-300'
                          : 'bg-rose-500/15 text-rose-400 dark:bg-rose-500/15 dark:text-rose-400 apple:bg-rose-500/20 apple:text-rose-300',
                      )}
                      aria-hidden="true"
                    >
                      {isCorrect ? '✓' : '✕'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-relaxed text-zinc-200 dark:text-neutral-200 apple:text-slate-200">
                        {index + 1}. {question.prompt}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
                        Твоя відповідь:{' '}
                        <span
                          className={
                            isCorrect
                              ? 'text-yellow-400 dark:text-emerald-400 apple:text-emerald-300'
                              : 'text-rose-400 dark:text-rose-400 apple:text-rose-300'
                          }
                        >
                          {selectedOption?.label ?? '—'}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="mt-1 text-xs leading-relaxed text-emerald-400/90 dark:text-emerald-400 apple:text-emerald-300">
                          Правильно: {correctOption?.label ?? '—'}
                        </p>
                      )}
                      <p className="mt-2 text-xs leading-relaxed text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
