import { cn } from '../lib/format'
import { CHALLENGES } from '../model/challenges'
import { QNA_ITEMS } from '../model/qna'
import { SORTING_ALGORITHMS } from '../model/sortingAlgorithms'
import { COMPLEXITY_TABS, useComplexityNavigation } from '../model/useComplexityNavigation'
import { AlgorithmsTab } from './AlgorithmsTab'
import {
  IconAlgorithms,
  IconInfo,
  IconOverview,
  IconPractice,
  IconQna,
} from './Icons'
import { OverviewTab } from './OverviewTab'
import { PracticeTab } from './PracticeTab'
import { QnaTab } from './QnaTab'
import { ACTIVE_FILTER, BIG_O_BADGE, CARD_SURFACE, CLIPPED_FOCUS, INACTIVE_FILTER, OCTAGON_BUTTON } from './theme'

const TAB_ICONS = {
  overview: IconOverview,
  algorithms: IconAlgorithms,
  qna: IconQna,
  practice: IconPractice,
} as const

export function ComplexitySimulator() {
  const navigation = useComplexityNavigation()

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 text-zinc-200 dark:text-neutral-200 apple:text-slate-200">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-yellow-400 dark:text-neutral-400 apple:text-sky-300">
            Складність алгоритмів
          </p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-100 dark:text-neutral-100 apple:text-white sm:text-3xl">
            Складність сортувальних алгоритмів
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
            Від Big-O до реального коду: графіки зростання, довідник алгоритмів,
            часті питання та задачі з розбором. Усе, щоб упевнено відповідати
            «яка тут складність і чому».
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={cn('inline-flex items-center text-[11px]', BIG_O_BADGE)}>
            {SORTING_ALGORITHMS.length} алгоритмів
          </span>
          <span className={cn('inline-flex items-center text-[11px]', BIG_O_BADGE)}>
            {QNA_ITEMS.length} питань
          </span>
          <span className={cn('inline-flex items-center text-[11px]', BIG_O_BADGE)}>
            {CHALLENGES.length} задач
          </span>
        </div>
      </header>

      <nav
        role="tablist"
        aria-label="Розділи модуля складності"
        className={cn('flex flex-wrap gap-1.5 p-2', CARD_SURFACE)}
      >
        {COMPLEXITY_TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.id]
          const active = navigation.activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`complexity-tab-${tab.id}`}
              aria-selected={active}
              aria-controls={`complexity-panel-${tab.id}`}
              onClick={() => navigation.setActiveTab(tab.id)}
              className={cn(
                'flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 text-left',
                OCTAGON_BUTTON,
                CLIPPED_FOCUS,
                active ? ACTIVE_FILTER : INACTIVE_FILTER,
                'sm:flex-none',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold">{tab.label}</span>
                <span className="hidden truncate text-[10px] opacity-70 sm:block">
                  {tab.caption}
                </span>
              </span>
            </button>
          )
        })}
      </nav>

      <div
        role="tabpanel"
        id={`complexity-panel-${navigation.activeTab}`}
        aria-labelledby={`complexity-tab-${navigation.activeTab}`}
      >
        {navigation.activeTab === 'overview' ? <OverviewTab /> : null}
        {navigation.activeTab === 'algorithms' ? <AlgorithmsTab /> : null}
        {navigation.activeTab === 'qna' ? <QnaTab /> : null}
        {navigation.activeTab === 'practice' ? <PracticeTab /> : null}
      </div>

      <footer className="flex flex-col gap-2 border-t border-yellow-500/15 pt-4 text-[11px] leading-relaxed text-zinc-500 dark:border-neutral-800 dark:text-neutral-500 apple:border-white/10 apple:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2">
          <IconInfo className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-neutral-500 apple:text-slate-400" />
          Порада: спочатку оцініть кількість операцій, потім перевірте себе на практиці.
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600 dark:text-neutral-600 apple:text-slate-500">
          Ω · Θ · O
        </p>
      </footer>
    </section>
  )
}
