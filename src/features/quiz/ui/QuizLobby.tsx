import { useState } from 'react'
import type { QuizMode, QuizProgress } from '../model/types'
import { cn, formatDate } from '../lib/format'
import { StatsGrid } from './StatsGrid'

const MAIN_CARD =
  'bg-zinc-900/95 border border-yellow-500/30 rounded-none dark:bg-neutral-900/60 dark:border-neutral-800 dark:rounded-xl apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15 apple:rounded-3xl apple:shadow-2xl'

const BUTTON_GEOMETRY =
  '[clip-path:polygon(12px_0%,calc(100%-12px)_0%,100%_35%,100%_65%,calc(100%-12px)_100%,12px_100%,0%_65%,0%_35%)] apple:[clip-path:none] apple:rounded-full transition-all duration-200'

const PRIMARY_BUTTON =
  'bg-yellow-400 text-zinc-950 font-mono font-bold uppercase hover:bg-yellow-300 dark:bg-white dark:text-neutral-950 dark:font-sans apple:bg-sky-500 apple:text-white apple:hover:bg-sky-400 apple:font-sans apple:normal-case'

interface QuizLobbyProps {
  stats: QuizProgress
  onStart: (mode: QuizMode) => void
  onResetProgress: () => void
}

interface ModeOption {
  id: QuizMode
  title: string
  description: string
  icon: string
  accentClass: string
  hint: string
}

const MODE_OPTIONS: ModeOption[] = [
  {
    id: 'mixed',
    title: 'Мікс',
    description:
      'Динамічні кроки сортування та теорія в одній сесії — найкращий варіант для розминки.',
    icon: '⚡',
    accentClass:
      'bg-yellow-400/15 text-yellow-400 dark:bg-white/10 dark:text-white apple:bg-sky-500/20 apple:text-sky-300',
    hint: '10 питань',
  },
  {
    id: 'sorting',
    title: 'Наступний крок',
    description:
      'Вгадай, яким стане масив після наступного обміну, вставки або дії алгоритму.',
    icon: '↔',
    accentClass:
      'bg-emerald-500/15 text-emerald-400 dark:bg-emerald-400/10 dark:text-emerald-300 apple:bg-emerald-400/15 apple:text-emerald-300',
    hint: 'Динамічні завдання',
  },
  {
    id: 'theory',
    title: 'Банк тестів',
    description:
      'Перевір знання складності, стабільності, памʼяті та властивостей алгоритмів.',
    icon: '§',
    accentClass:
      'bg-rose-500/15 text-rose-400 dark:bg-rose-400/10 dark:text-rose-300 apple:bg-rose-400/15 apple:text-rose-300',
    hint: 'Теорія',
  },
]

export function QuizLobby({
  stats,
  onStart,
  onResetProgress,
}: QuizLobbyProps) {
  const [selectedMode, setSelectedMode] = useState<QuizMode>('mixed')
  const [resetArmed, setResetArmed] = useState(false)

  const accuracy =
    stats.totalAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
      : 0
  const hasProgress =
    stats.completedRuns > 0 ||
    stats.totalAnswered > 0 ||
    stats.bestTotal > 0
  const selectedModeOption =
    MODE_OPTIONS.find((mode) => mode.id === selectedMode) ?? MODE_OPTIONS[0]

  const statItems: Array<{
    label: string
    value: string
    hint: string
    tone: 'sky' | 'emerald' | 'rose' | 'slate'
  }> = [
    {
      label: 'Найкращий результат',
      value:
        stats.bestTotal > 0 ? `${stats.bestScore}/${stats.bestTotal}` : '—',
      hint:
        stats.bestTotal > 0
          ? `${stats.bestPercent}% правильних`
          : 'Заверши першу гру',
      tone: 'emerald',
    },
    {
      label: 'Завершено ігор',
      value: String(stats.completedRuns),
      hint: stats.lastPlayedAt
        ? formatDate(stats.lastPlayedAt)
        : 'Історія порожня',
      tone: 'sky',
    },
    {
      label: 'Точність',
      value: `${accuracy}%`,
      hint: `${stats.totalCorrect} з ${stats.totalAnswered} відповідей`,
      tone: 'sky',
    },
    {
      label: 'Відповідей',
      value: String(stats.totalAnswered),
      hint: 'Зберігається локально',
      tone: 'slate',
    },
  ]

  const handleResetClick = () => {
    if (!resetArmed) {
      setResetArmed(true)
      return
    }

    onResetProgress()
    setResetArmed(false)
  }

  return (
    <section className="mx-auto w-full max-w-4xl space-y-4">
      <div data-snow-surface="true" className={`${MAIN_CARD} p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-400 dark:text-neutral-500 apple:text-sky-300">
              Quiz · Модуль 4
            </p>
            <h1 className="mt-2 font-mono text-3xl font-bold tracking-tight text-zinc-100 dark:font-sans dark:text-white apple:font-sans apple:text-white">
              Вгадай наступний крок
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
              Інтерактивний тренажер для алгоритмів сортування: динамічні
              запитання на основі покрокових знімків масиву та статичний банк
              теорії.
            </p>
          </div>
          <span className="rounded-none border border-yellow-500/30 bg-yellow-400/10 px-3 py-2 text-xs font-semibold text-yellow-400 dark:rounded-full dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 apple:rounded-full apple:border-emerald-400/30 apple:bg-emerald-400/15 apple:text-emerald-200">
            Прогрес зберігається
          </span>
        </div>
      </div>

      <StatsGrid items={statItems} />

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-200 dark:text-neutral-200 apple:text-slate-200">
            Обери режим
          </h2>
          <span className="text-[11px] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
            Миттєва перевірка відповідей
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {MODE_OPTIONS.map((mode) => {
            const isSelected = selectedMode === mode.id

            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSelectedMode(mode.id)}
                aria-pressed={isSelected}
                data-snow-surface="true"
                className={cn(
                  '[clip-path:polygon(14px_0%,calc(100%-14px)_0%,100%_18%,100%_82%,calc(100%-14px)_100%,14px_100%,0%_82%,0%_18%)] apple:[clip-path:none] apple:rounded-3xl p-6 text-left flex flex-col justify-between gap-3 rounded-none border font-mono dark:font-sans apple:font-sans transition-all duration-200',
                  isSelected
                    ? 'border-yellow-400 bg-yellow-400/10 dark:border-white/40 dark:bg-white/10 apple:border-sky-400/50 apple:bg-sky-500/20 apple:shadow-lg apple:shadow-sky-500/20'
                    : 'border-yellow-500/20 bg-zinc-900/90 hover:border-yellow-400/60 hover:bg-zinc-800/80 dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-neutral-600 dark:hover:bg-neutral-800/80 apple:border-white/15 apple:bg-white/[0.06] apple:backdrop-blur-xl apple:hover:border-white/25 apple:hover:bg-white/[0.1]',
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-none text-lg font-semibold dark:rounded-xl apple:rounded-2xl',
                    mode.accentClass,
                  )}
                  aria-hidden="true"
                >
                  {mode.icon}
                </span>
                <span className="text-base font-semibold text-zinc-100 dark:text-neutral-100 apple:text-white">
                  {mode.title}
                </span>
                <span className="text-sm leading-relaxed text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
                  {mode.description}
                </span>
                <span
                  className={cn(
                    'mt-auto text-[11px] font-medium',
                    isSelected
                      ? 'text-yellow-400 dark:text-neutral-200 apple:text-sky-300'
                      : 'text-zinc-500 dark:text-neutral-500 apple:text-slate-400',
                  )}
                >
                  {isSelected ? 'Обрано' : mode.hint}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className={`${MAIN_CARD} flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}>
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
          {selectedModeOption.hint} · швидкий старт · результати одразу
        </p>
        <button
          type="button"
          onClick={() => onStart(selectedMode)}
          className={`${BUTTON_GEOMETRY} ${PRIMARY_BUTTON} rounded-none px-6 py-2.5 text-sm`}
        >
          Почати «{selectedModeOption.title}»
          <span className="ml-2" aria-hidden="true">
            →
          </span>
        </button>
      </div>

      {hasProgress && (
        <div className={`${MAIN_CARD} flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between`}>
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
            Найкращий результат, точність і завершені ігри зберігаються у
            цьому браузері.
          </p>
          <button
            type="button"
            onClick={handleResetClick}
            className={cn(
              'rounded-none border px-3 py-1.5 text-xs font-medium transition-colors dark:rounded-lg apple:rounded-full',
              resetArmed
                ? 'border-rose-500 bg-rose-500/15 text-rose-300 dark:border-rose-500 dark:bg-rose-500/20 dark:text-rose-200 apple:border-rose-400/50 apple:bg-rose-500/20 apple:text-rose-100'
                : 'border-yellow-500/20 text-zinc-500 hover:border-rose-500/50 hover:text-rose-400 dark:border-neutral-800 dark:text-neutral-500 dark:hover:border-rose-500/50 dark:hover:text-rose-300 apple:border-white/15 apple:text-slate-400 apple:hover:border-rose-400/50 apple:hover:text-rose-200',
            )}
          >
            {resetArmed
              ? 'Натисни ще раз для підтвердження'
              : 'Скинути статистику'}
          </button>
        </div>
      )}
    </section>
  )
}
