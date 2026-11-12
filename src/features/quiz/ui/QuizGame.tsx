import type { QuizAnswerRecord, QuizQuestion } from '../model/types'
import { cn } from '../lib/format'
import { QuestionCard } from './QuestionCard'
import { QuizProgressBar } from './QuizProgressBar'

const MAIN_CARD =
  'bg-zinc-900/95 border border-yellow-500/30 rounded-none dark:bg-neutral-900/60 dark:border-neutral-800 dark:rounded-xl apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15 apple:rounded-3xl apple:shadow-2xl'

const BUTTON_GEOMETRY =
  '[clip-path:polygon(12px_0%,calc(100%-12px)_0%,100%_35%,100%_65%,calc(100%-12px)_100%,12px_100%,0%_65%,0%_35%)] apple:[clip-path:none] apple:rounded-full transition-all duration-200'

const PRIMARY_BUTTON =
  'bg-yellow-400 text-zinc-950 font-mono font-bold uppercase hover:bg-yellow-300 dark:bg-white dark:text-neutral-950 dark:font-sans apple:bg-sky-500 apple:text-white apple:hover:bg-sky-400 apple:font-sans apple:normal-case'

const DISABLED_BUTTON =
  'cursor-not-allowed border border-yellow-500/10 bg-zinc-900 text-zinc-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-600 apple:border-white/10 apple:bg-white/5 apple:text-slate-500'

interface QuizGameProps {
  question: QuizQuestion
  questions: QuizQuestion[]
  answers: QuizAnswerRecord[]
  currentIndex: number
  totalQuestions: number
  score: number
  selectedOptionId: string | null
  isAnswered: boolean
  isCorrect: boolean
  onSelectAnswer: (optionId: string) => void
  onNext: () => void
  onQuit: () => void
}

export function QuizGame({
  question,
  questions,
  answers,
  currentIndex,
  totalQuestions,
  score,
  selectedOptionId,
  isAnswered,
  isCorrect,
  onSelectAnswer,
  onNext,
  onQuit,
}: QuizGameProps) {
  const isLastQuestion = currentIndex >= totalQuestions - 1
  const helperText = !isAnswered
    ? 'Обери один варіант — результат і пояснення зʼявляться одразу.'
    : isCorrect
      ? 'Відповідь зарахована. Рухайся далі.'
      : 'Правильний варіант підсвічено зеленим. Розбери пояснення.'

  return (
    <section className="mx-auto w-full max-w-3xl space-y-4">
      <div className={`${MAIN_CARD} p-4 sm:p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-400 dark:text-neutral-500 apple:text-sky-300">
              Тренажер
            </p>
            <p className="mt-1 text-sm text-zinc-400 dark:text-neutral-400 apple:text-slate-400">
              Питання{' '}
              <span className="font-semibold text-zinc-100 dark:text-white apple:text-white">
                {currentIndex + 1}
              </span>{' '}
              з <span className="tabular-nums">{totalQuestions}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-none border border-yellow-500/40 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-400 dark:rounded-full dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 apple:rounded-full apple:border-emerald-400/30 apple:bg-emerald-400/15 apple:text-emerald-200">
              Рахунок:{' '}
              <span className="tabular-nums">{score}</span>
            </span>
            <button
              type="button"
              onClick={onQuit}
              className="rounded-none border border-yellow-500/20 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-rose-500/50 hover:text-rose-400 dark:rounded-lg dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-rose-500/50 dark:hover:text-rose-300 apple:rounded-full apple:border-white/15 apple:text-slate-300 apple:hover:border-rose-400/50 apple:hover:text-rose-200"
            >
              Вийти
            </button>
          </div>
        </div>

        <div className="mt-4">
          <QuizProgressBar
            questions={questions}
            answers={answers}
            currentIndex={currentIndex}
          />
        </div>
      </div>

      <QuestionCard
        question={question}
        selectedOptionId={selectedOptionId}
        isAnswered={isAnswered}
        isCorrect={isCorrect}
        onSelectAnswer={onSelectAnswer}
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">{helperText}</p>
        <button
          type="button"
          onClick={onNext}
          disabled={!isAnswered}
          className={cn(
            'rounded-none px-6 py-2.5 text-sm',
            BUTTON_GEOMETRY,
            isAnswered ? PRIMARY_BUTTON : DISABLED_BUTTON,
          )}
        >
          {isLastQuestion ? 'Показати результат' : 'Наступне питання'}
          {isAnswered && (
            <span className="ml-2" aria-hidden="true">
              →
            </span>
          )}
        </button>
      </div>
    </section>
  )
}
