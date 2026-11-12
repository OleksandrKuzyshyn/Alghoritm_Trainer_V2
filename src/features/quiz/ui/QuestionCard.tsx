import type {
  QuizDifficulty,
  QuizQuestion,
  QuizQuestionContext,
} from '../model/types'
import { cn } from '../lib/format'
import { AnswerOption } from './AnswerOption'
import { ArrayVisualization } from './ArrayVisualization'

interface QuestionCardProps {
  question: QuizQuestion
  selectedOptionId: string | null
  isAnswered: boolean
  isCorrect: boolean
  onSelectAnswer: (optionId: string) => void
}

const DIFFICULTY_LABELS: Record<QuizDifficulty, string> = {
  easy: 'Легко',
  medium: 'Середньо',
  hard: 'Складно',
}

const DIFFICULTY_CLASSES: Record<QuizDifficulty, string> = {
  easy: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 apple:border-emerald-400/30 apple:bg-emerald-400/15 apple:text-emerald-200',
  medium: 'border-yellow-500/40 bg-yellow-400/10 text-yellow-400 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300 apple:border-sky-400/30 apple:bg-sky-400/15 apple:text-sky-200',
  hard: 'border-rose-500/40 bg-rose-500/10 text-rose-400 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300 apple:border-rose-400/30 apple:bg-rose-400/15 apple:text-rose-200',
}

const MAIN_CARD =
  'bg-zinc-900/95 border border-yellow-500/30 rounded-none dark:bg-neutral-900/60 dark:border-neutral-800 dark:rounded-xl apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15 apple:rounded-3xl apple:shadow-2xl'

function SortingContext({ context }: { context: QuizQuestionContext }) {
  return (
    <div className="mt-4 rounded-none border border-yellow-500/20 bg-zinc-950 p-4 dark:rounded-xl dark:border-neutral-800 dark:bg-neutral-950 apple:rounded-2xl apple:border-white/15 apple:bg-white/[0.04] apple:backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-yellow-400 dark:text-neutral-400 apple:text-sky-300">
          {context.algorithmLabel}
        </span>
        <span className="text-[11px] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
          Поточний крок {context.stepNumber}
        </span>
      </div>

      <div className="mt-3">
        <ArrayVisualization
          array={context.array}
          activeIndices={context.activeIndices}
          sortedIndices={context.sortedIndices}
        />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
        {context.stepDescription}
      </p>

      <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full bg-yellow-400 dark:bg-sky-500 apple:bg-sky-400"
            aria-hidden="true"
          />
          активні індекси
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 apple:bg-emerald-400"
            aria-hidden="true"
          />
          відсортовані
        </span>
      </div>

      {context.pseudocode && context.pseudocode.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer list-none text-[11px] font-medium text-zinc-500 hover:text-yellow-400 dark:text-neutral-500 dark:hover:text-white apple:text-slate-400 apple:hover:text-sky-300">
            Показати псевдокод
          </summary>
          <div className="mt-2 space-y-1 overflow-x-auto rounded-none border border-yellow-500/20 bg-zinc-900 p-3 dark:rounded-lg dark:border-neutral-800 dark:bg-neutral-900 apple:rounded-2xl apple:border-white/15 apple:bg-white/5">
            {context.pseudocode.map((line, index) => (
              <p
                key={index}
                className="whitespace-pre font-mono text-[11px] leading-relaxed text-zinc-400 dark:text-neutral-400 apple:font-sans apple:text-slate-300"
              >
                {line}
              </p>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

export function QuestionCard({
  question,
  selectedOptionId,
  isAnswered,
  isCorrect,
  onSelectAnswer,
}: QuestionCardProps) {
  return (
    <article className={`${MAIN_CARD} p-5 sm:p-6`}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'rounded-none border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide dark:rounded-full apple:rounded-full',
            DIFFICULTY_CLASSES[question.difficulty],
          )}
        >
          {DIFFICULTY_LABELS[question.difficulty]}
        </span>
        <span className="rounded-none border border-yellow-500/20 bg-zinc-950 px-2.5 py-1 text-[11px] text-zinc-400 dark:rounded-full dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400 apple:rounded-full apple:border-white/15 apple:bg-white/10 apple:text-slate-300">
          {question.source === 'generated'
            ? 'Динамічне завдання'
            : 'Банк тестів'}
        </span>
        {question.context && (
          <span className="rounded-none border border-yellow-500/20 bg-zinc-950 px-2.5 py-1 text-[11px] text-zinc-400 dark:rounded-full dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400 apple:rounded-full apple:border-white/15 apple:bg-white/10 apple:text-slate-300">
            Крок {question.context.stepNumber}
          </span>
        )}
      </div>

      {question.context && <SortingContext context={question.context} />}

      <h2 className="mt-5 font-mono text-lg font-semibold leading-snug text-zinc-100 dark:font-sans dark:text-neutral-100 apple:font-sans apple:text-slate-100 sm:text-xl">
        {question.prompt}
      </h2>

      <div className="mt-4 space-y-2.5">
        {question.options.map((option, index) => (
          <AnswerOption
            key={option.id}
            option={option}
            index={index}
            isSelected={selectedOptionId === option.id}
            isCorrectOption={question.correctOptionId === option.id}
            isAnswered={isAnswered}
            onSelect={onSelectAnswer}
          />
        ))}
      </div>

      {isAnswered && (
        <div
          role="status"
          className={cn(
            'mt-5 rounded-none border p-4 dark:rounded-xl apple:rounded-2xl',
            isCorrect
              ? 'border-yellow-500/50 bg-yellow-400/10 dark:border-emerald-500/50 dark:bg-emerald-500/10 apple:border-emerald-400/30 apple:bg-emerald-400/15'
              : 'border-rose-500/50 bg-rose-500/10 dark:border-rose-500/50 dark:bg-rose-500/10 apple:border-rose-400/30 apple:bg-rose-400/15',
          )}
        >
          <p
            className={cn(
              'text-sm font-semibold',
              isCorrect
                ? 'text-yellow-400 dark:text-emerald-300 apple:text-emerald-200'
                : 'text-rose-400 dark:text-rose-300 apple:text-rose-200',
            )}
          >
            {isCorrect ? 'Правильно!' : 'Неправильно'}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-300 dark:text-neutral-300 apple:text-slate-300">
            {question.explanation}
          </p>
        </div>
      )}

      {!isAnswered && question.hint && (
        <p className="mt-4 text-xs leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
          Підказка: {question.hint}
        </p>
      )}
    </article>
  )
}
