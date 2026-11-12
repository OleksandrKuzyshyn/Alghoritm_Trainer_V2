import { cn, formatPercent } from '../lib/format'
import { CHALLENGES } from '../model/challenges'
import type { ChallengeDifficulty, ChallengeKind } from '../model/types'
import { usePracticeSession } from '../model/usePracticeSession'
import { CodeBlock } from './CodeBlock'
import { Badge } from './ComplexityBadge'
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconClose,
  IconPractice,
  IconReset,
  IconTrophy,
} from './Icons'
import { TabHeading } from './TabHeading'
import {
  ACTIVE_FILTER,
  BIG_O_BADGE,
  CARD_SURFACE,
  CLIPPED_FOCUS,
  FOCUS_RING,
  OCTAGON_BUTTON,
} from './theme'

const KIND_LABELS: Record<ChallengeKind, string> = {
  complexity: 'Складність',
  memory: 'Пам’ять',
  advantage: 'Переваги',
}

const KIND_TONES: Record<ChallengeKind, 'sky' | 'violet' | 'emerald'> = {
  complexity: 'sky',
  memory: 'violet',
  advantage: 'emerald',
}

const DIFFICULTY_LABELS: Record<ChallengeDifficulty, string> = {
  basic: 'База',
  medium: 'Середнє',
  advanced: 'Складно',
}

const DIFFICULTY_CLASSES: Record<ChallengeDifficulty, string> = {
  basic:
    'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 apple:border-emerald-400/30 apple:bg-emerald-500/20 apple:text-emerald-200',
  medium:
    'border-amber-500/40 bg-amber-500/10 text-amber-300 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 apple:border-amber-400/30 apple:bg-amber-500/20 apple:text-amber-200',
  advanced:
    'border-rose-500/40 bg-rose-500/10 text-rose-300 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 apple:border-rose-400/30 apple:bg-rose-500/20 apple:text-rose-200',
}

const STATUS_CLASSES = {
  unanswered:
    'border-yellow-500/20 bg-zinc-950 text-zinc-500 hover:border-yellow-400/60 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-500 dark:hover:border-neutral-600 apple:border-white/10 apple:bg-white/[0.04] apple:text-slate-400 apple:hover:border-white/30',
  correct:
    'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300 apple:border-emerald-400/30 apple:bg-emerald-500/15 apple:text-emerald-200',
  incorrect:
    'border-rose-500/50 bg-rose-500/10 text-rose-300 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300 apple:border-rose-400/30 apple:bg-rose-500/15 apple:text-rose-200',
} as const

const OPTION_BASE =
  'flex w-full items-start gap-3 border border-transparent px-3.5 py-2.5 text-left text-xs leading-relaxed'

const OPTION_STATES = {
  idle: 'bg-zinc-800 text-zinc-300 hover:text-yellow-400 font-mono dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:font-sans apple:bg-white/10 apple:text-slate-300 apple:hover:bg-white/20 apple:hover:text-white apple:font-sans',
  correct:
    'border-emerald-500/60 bg-emerald-500/10 text-emerald-200 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300 apple:border-emerald-400/30 apple:bg-emerald-500/15 apple:text-emerald-200',
  incorrect:
    'border-rose-500/60 bg-rose-500/10 text-rose-200 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300 apple:border-rose-400/30 apple:bg-rose-500/15 apple:text-rose-200',
  muted:
    'bg-zinc-900 text-zinc-500 opacity-70 dark:bg-neutral-950 dark:text-neutral-600 apple:bg-white/[0.03] apple:text-slate-500',
} as const

export function PracticeTab() {
  const practice = usePracticeSession()
  const challenge = practice.currentChallenge
  const isLast = practice.currentIndex === practice.total - 1

  return (
    <section className="space-y-6">
      <TabHeading
        eyebrow={`Код + самоперевірка · ${CHALLENGES.length} задач`}
        title="Що це за складність?"
        description="Читайте фрагмент коду, визначайте час, пам’ять або переваги — і одразу отримуйте розбір. Задачі охоплюють найпоширеніші пастки: адаптивність, найгірший pivot, стабільність і приховані цикли."
        icon={<IconPractice className="h-4 w-4" />}
      >
        <Badge tone="sky">C++</Badge>
        <Badge tone="emerald">Пояснення</Badge>
        <Badge tone="rose">Прогрес</Badge>
      </TabHeading>

      <div className={cn(CARD_SURFACE, 'p-4 sm:p-5')}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center border border-yellow-500/40 bg-yellow-500/10 text-yellow-300 rounded-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:rounded-lg apple:border-sky-400/30 apple:bg-sky-500/20 apple:text-sky-300 apple:backdrop-blur-2xl apple:rounded-2xl">
              <IconTrophy className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
                Результат
              </p>
              <p className="text-sm font-semibold text-zinc-100 dark:text-neutral-100 apple:text-white">
                {practice.correctCount} з {practice.total} правильних
                <span className="ml-2 font-mono text-[11px] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
                  ({formatPercent(practice.scorePercent)})
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5" aria-label="Навігація задачами">
            {practice.statusPerChallenge.map((status, index) => (
              <button
                key={CHALLENGES[index].id}
                type="button"
                onClick={() => practice.goTo(index)}
                aria-label={`Задача ${index + 1}: ${CHALLENGES[index].title}`}
                aria-current={index === practice.currentIndex ? 'step' : undefined}
                className={cn(
                  'h-8 w-8 border font-mono text-[11px] transition rounded-none dark:rounded-md apple:rounded-full',
                  FOCUS_RING,
                  STATUS_CLASSES[status],
                  index === practice.currentIndex &&
                    'ring-2 ring-yellow-400/70 ring-offset-2 ring-offset-zinc-950 dark:ring-white/70 dark:ring-offset-neutral-950 apple:ring-sky-400/70 apple:ring-offset-transparent',
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={practice.reset}
            className={cn(
              'inline-flex items-center gap-2 border border-yellow-500/25 bg-zinc-950 px-3 py-1.5 text-[11px] font-semibold text-zinc-400 transition hover:border-rose-500/50 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40 rounded-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:border-rose-500/50 dark:hover:text-rose-300 dark:rounded-lg apple:border-white/15 apple:bg-white/10 apple:text-slate-300 apple:hover:border-rose-400/40 apple:hover:bg-white/20 apple:hover:text-rose-200 apple:rounded-full',
              FOCUS_RING,
            )}
          >
            <IconReset className="h-3.5 w-3.5" />
            Скинути прогрес
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-yellow-500/15 pt-3 dark:border-neutral-800 apple:border-white/10">
          <p className="text-[11px] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
            Пройдено <span className="font-mono text-zinc-300 dark:text-neutral-300 apple:text-slate-200">{practice.answeredCount}</span> з{' '}
            {practice.total}. Відповіді зберігаються у браузері.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600 dark:text-neutral-600 apple:text-slate-500">
            {practice.isComplete ? 'усі задачі пройдено' : 'прогрес у процесі'}
          </p>
        </div>
      </div>

      {practice.isComplete ? (
        <div className="border border-emerald-500/30 bg-emerald-500/[0.06] p-5 rounded-none dark:border-emerald-500/25 dark:bg-emerald-500/[0.04] dark:rounded-xl apple:border-emerald-400/20 apple:bg-emerald-500/10 apple:backdrop-blur-2xl apple:rounded-3xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 rounded-none dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:rounded-lg apple:border-emerald-400/30 apple:bg-emerald-500/20 apple:text-emerald-200 apple:rounded-2xl">
                <IconTrophy className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-bold text-zinc-100 dark:text-neutral-100 apple:text-white">
                  Усі задачі пройдено
                </p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
                  Ваш результат: {practice.correctCount} з {practice.total} (
                  {formatPercent(practice.scorePercent)}). Можна переглянути розбори ще раз
                  або скинути прогрес і спробувати знову.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={practice.reset}
              className={cn(
                'inline-flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/15 rounded-none dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20 dark:rounded-lg apple:border-emerald-400/30 apple:bg-emerald-500/15 apple:text-emerald-200 apple:hover:bg-emerald-500/25 apple:rounded-full',
                FOCUS_RING,
              )}
            >
              <IconReset className="h-3.5 w-3.5" />
              Пройти ще раз
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
          Задача {practice.currentIndex + 1} з {practice.total}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={practice.goPrevious}
            disabled={practice.currentIndex === 0}
            className={cn(
              'inline-flex items-center gap-1.5 border border-yellow-500/25 bg-zinc-950 px-3 py-1.5 text-[11px] font-semibold text-zinc-400 transition hover:border-yellow-400/60 hover:text-yellow-300 disabled:cursor-not-allowed disabled:opacity-40 rounded-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-white dark:rounded-lg apple:border-white/15 apple:bg-white/10 apple:text-slate-300 apple:hover:bg-white/20 apple:hover:text-white apple:rounded-full',
              FOCUS_RING,
            )}
          >
            <IconArrowLeft className="h-3.5 w-3.5" />
            Назад
          </button>
          <button
            type="button"
            onClick={practice.goNext}
            disabled={isLast}
            className={cn(
              'inline-flex items-center gap-1.5 border border-yellow-400/60 px-3 py-1.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-40 rounded-none dark:border-white dark:rounded-lg apple:border-white apple:rounded-full',
              FOCUS_RING,
              ACTIVE_FILTER,
            )}
          >
            Далі
            <IconArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <article className={cn(CARD_SURFACE, 'p-4 sm:p-5')}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={KIND_TONES[challenge.kind]}>{KIND_LABELS[challenge.kind]}</Badge>
              <span
                className={cn(
                  'border px-2.5 py-1 text-[10px] font-semibold rounded-none dark:rounded-full apple:rounded-full',
                  DIFFICULTY_CLASSES[challenge.difficulty],
                )}
              >
                {DIFFICULTY_LABELS[challenge.difficulty]}
              </span>
              <span className="font-mono text-[10px] text-zinc-600 dark:text-neutral-600 apple:text-slate-500">
                {challenge.topic}
              </span>
            </div>
            <h4 className="mt-2 text-lg font-bold text-zinc-100 dark:text-neutral-100 apple:text-white">
              {challenge.title}
            </h4>
          </div>
          <span className={cn('inline-flex items-center text-[10px]', BIG_O_BADGE)}>
            {challenge.language}
          </span>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <CodeBlock code={challenge.code} language={challenge.language} label="Фрагмент коду" />

          <div className="flex min-w-0 flex-col">
            <p className="text-sm font-semibold leading-relaxed text-zinc-100 dark:text-neutral-100 apple:text-white">
              {challenge.question}
            </p>

            <div className="mt-3 space-y-2" role="group" aria-label="Варіанти відповіді">
              {challenge.options.map((option, index) => {
                const isSelected = practice.selectedOptionId === option.id
                const showCorrect = practice.isAnswered && option.correct
                const showWrong = practice.isAnswered && isSelected && !option.correct
                const state = showCorrect
                  ? 'correct'
                  : showWrong
                    ? 'incorrect'
                    : practice.isAnswered
                      ? 'muted'
                      : 'idle'

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => practice.selectOption(option.id)}
                    disabled={practice.isAnswered}
                    aria-pressed={isSelected}
                    className={cn(
                      OPTION_BASE,
                      OCTAGON_BUTTON,
                      CLIPPED_FOCUS,
                      OPTION_STATES[state],
                      'disabled:cursor-default',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border font-mono text-[10px] rounded-none dark:rounded-md apple:rounded-full',
                        showCorrect
                          ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300 apple:border-emerald-400/30 apple:bg-emerald-500/20 apple:text-emerald-200'
                          : showWrong
                            ? 'border-rose-500/50 bg-rose-500/15 text-rose-300 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-300 apple:border-rose-400/30 apple:bg-rose-500/20 apple:text-rose-200'
                            : 'border-yellow-500/25 bg-zinc-950 text-zinc-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 apple:border-white/15 apple:bg-white/10 apple:text-slate-300',
                      )}
                    >
                      {showCorrect ? (
                        <IconCheck className="h-3 w-3" />
                      ) : showWrong ? (
                        <IconClose className="h-3 w-3" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </span>
                    <span className="flex-1">{option.text}</span>
                  </button>
                )
              })}
            </div>

            {practice.isAnswered ? (
              <div
                className={cn(
                  'mt-3 border p-3.5 rounded-none dark:rounded-xl apple:backdrop-blur-2xl apple:rounded-2xl',
                  practice.isCorrect
                    ? 'border-emerald-500/30 bg-emerald-500/[0.06] dark:border-emerald-500/25 dark:bg-emerald-500/[0.06] apple:border-emerald-400/20 apple:bg-emerald-500/10'
                    : 'border-rose-500/30 bg-rose-500/[0.06] dark:border-rose-500/25 dark:bg-rose-500/[0.06] apple:border-rose-400/20 apple:bg-rose-500/10',
                )}
              >
                <p
                  className={cn(
                    'flex items-center gap-2 text-xs font-bold',
                    practice.isCorrect
                      ? 'text-emerald-400 dark:text-emerald-300 apple:text-emerald-200'
                      : 'text-rose-400 dark:text-rose-300 apple:text-rose-200',
                  )}
                >
                  {practice.isCorrect ? (
                    <IconCheck className="h-4 w-4" />
                  ) : (
                    <IconClose className="h-4 w-4" />
                  )}
                  {practice.isCorrect ? 'Правильно!' : 'Не зовсім'}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
                  {challenge.explanation}
                </p>
                <p className="mt-2.5 border-t border-yellow-500/15 pt-2.5 text-[11px] leading-relaxed text-zinc-500 dark:border-neutral-800 dark:text-neutral-500 apple:border-white/10 apple:text-slate-400">
                  <span className="font-semibold text-zinc-300 dark:text-neutral-300 apple:text-slate-200">Головне: </span>
                  {challenge.takeaway}
                </p>
                {!isLast ? (
                  <button
                    type="button"
                    onClick={practice.goNext}
                    className={cn(
                      'mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-none dark:rounded-lg apple:rounded-full',
                      FOCUS_RING,
                      ACTIVE_FILTER,
                    )}
                  >
                    Наступна задача
                    <IconArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-[10px] text-zinc-600 dark:text-neutral-600 apple:text-slate-500">
                Оберіть один варіант — після цього з’явиться розбір.
              </p>
            )}
          </div>
        </div>
      </article>
    </section>
  )
}
