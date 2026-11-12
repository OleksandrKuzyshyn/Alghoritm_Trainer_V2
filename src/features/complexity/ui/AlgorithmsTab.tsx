import { cn } from '../lib/format'
import { ALGORITHM_FAMILY_LABELS } from '../model/sortingAlgorithms'
import type { AlgorithmAccent } from '../model/types'
import { useAlgorithmExplorer } from '../model/useAlgorithmExplorer'
import { Badge, ComplexityCell } from './ComplexityBadge'
import { CodeBlock } from './CodeBlock'
import { IconAlgorithms, IconCheck, IconClose } from './Icons'
import { TabHeading } from './TabHeading'
import {
  ACTIVE_FILTER,
  BIG_O_BADGE,
  CARD_SURFACE,
  CLIPPED_FOCUS,
  INACTIVE_FILTER,
  OCTAGON_BUTTON,
} from './theme'

const ACCENT_DOTS: Record<AlgorithmAccent, string> = {
  sky: 'bg-sky-400',
  emerald: 'bg-emerald-400',
  rose: 'bg-rose-400',
  amber: 'bg-amber-400',
  violet: 'bg-violet-400',
}

export function AlgorithmsTab() {
  const explorer = useAlgorithmExplorer()
  const selected = explorer.selectedAlgorithm
  const selectedDot = ACCENT_DOTS[selected.accent]

  const filters = [
    { id: 'all', label: 'Усі' },
    { id: 'comparison', label: 'Порівняльні' },
    { id: 'linear', label: 'Без порівнянь' },
  ] as const

  return (
    <section className="space-y-6">
      <TabHeading
        eyebrow="Довідник · 8 алгоритмів"
        title="Алгоритми та їхня складність"
        description="Оберіть алгоритм, щоб побачити найкращий, середній і найгірший випадки, додаткову пам’ять, стабільність, переваги та типові сценарії використання."
        icon={<IconAlgorithms className="h-4 w-4" />}
      >
        <Badge tone="emerald">Стабільність</Badge>
        <Badge tone="sky">In-place</Badge>
        <Badge tone="violet">Пам’ять</Badge>
      </TabHeading>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className={cn('self-start p-3 lg:sticky lg:top-4', CARD_SURFACE)}>
          <div className="flex flex-wrap gap-1.5 px-1 pb-3">
            {filters.map((filter) => {
              const active = explorer.family === filter.id
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => explorer.setFamily(filter.id)}
                  aria-pressed={active}
                  className={cn(
                    'px-2.5 py-1.5 text-[11px]',
                    OCTAGON_BUTTON,
                    CLIPPED_FOCUS,
                    active ? ACTIVE_FILTER : INACTIVE_FILTER,
                  )}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>

          <div className="space-y-1.5">
            {explorer.filteredAlgorithms.map((algorithm) => {
              const isSelected = algorithm.id === selected.id
              return (
                <button
                  key={algorithm.id}
                  type="button"
                  onClick={() => explorer.selectAlgorithm(algorithm.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'w-full border px-3 py-2.5 text-left transition rounded-none dark:rounded-2xl apple:backdrop-blur-2xl apple:rounded-2xl',
                    isSelected
                      ? 'border-yellow-400/70 bg-yellow-400/10 dark:border-white/40 dark:bg-white/10 apple:border-sky-400/40 apple:bg-sky-500/15'
                      : 'border-yellow-500/20 bg-zinc-950 hover:border-yellow-400/60 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700 apple:border-white/10 apple:bg-white/[0.04] apple:hover:border-white/30',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn('h-2 w-2 shrink-0 rounded-full', ACCENT_DOTS[algorithm.accent])}
                        aria-hidden="true"
                      />
                      <span
                        className={cn(
                          'truncate text-xs font-semibold',
                          isSelected
                            ? 'text-zinc-100 dark:text-neutral-100 apple:text-white'
                            : 'text-zinc-300 dark:text-neutral-300 apple:text-slate-200',
                        )}
                      >
                        {algorithm.name}
                      </span>
                    </span>
                    <span className={cn('shrink-0 text-[10px]', BIG_O_BADGE)}>
                      Θ {algorithm.average}
                    </span>
                  </div>
                  <p className="mt-1 truncate pl-4 font-mono text-[10px] text-zinc-600 dark:text-neutral-500 apple:text-slate-400">
                    {algorithm.englishName}
                  </p>
                </button>
              )
            })}
          </div>

          <p className="mt-3 px-1 text-[10px] leading-relaxed text-zinc-600 dark:text-neutral-600 apple:text-slate-500">
            Натисніть на картку, щоб змінити деталі праворуч.
          </p>
        </aside>

        <div className="min-w-0 space-y-4">
          <article className={cn(CARD_SURFACE, 'p-5')}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', selectedDot)} aria-hidden="true" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow-400 dark:text-neutral-400 apple:text-sky-300">
                    {ALGORITHM_FAMILY_LABELS[selected.family]}
                  </span>
                </div>
                <h4 className="mt-1.5 text-xl font-bold text-zinc-100 dark:text-neutral-100 apple:text-white sm:text-2xl">
                  {selected.name}
                </h4>
                <p className="mt-0.5 font-mono text-xs text-zinc-500 dark:text-neutral-400 apple:text-slate-400">
                  {selected.englishName}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge tone={selected.stable ? 'emerald' : 'rose'}>
                  {selected.stable ? 'Стабільне' : 'Нестабільне'}
                </Badge>
                <Badge tone={selected.inPlace ? 'sky' : 'amber'}>
                  {selected.inPlace ? 'In-place' : 'Не in-place'}
                </Badge>
                <Badge tone={selected.adaptive ? 'violet' : 'slate'}>
                  {selected.adaptive ? 'Адаптивне' : 'Не адаптивне'}
                </Badge>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-zinc-300 dark:text-neutral-300 apple:text-slate-200">
              {selected.short}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
              {selected.idea}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <ComplexityCell label="Найкращий" prefix="Ω" value={selected.best} tone="emerald" />
              <ComplexityCell label="Середній" prefix="Θ" value={selected.average} tone="sky" />
              <ComplexityCell label="Найгірший" prefix="O" value={selected.worst} tone="rose" />
              <ComplexityCell label="Пам’ять" prefix="O" value={selected.space} tone="violet" />
            </div>
          </article>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className={cn(CARD_SURFACE, 'p-5')}>
              <p className="text-sm font-semibold text-zinc-100 dark:text-neutral-100 apple:text-white">
                Як працює
              </p>
              <ol className="mt-3 space-y-2.5">
                {selected.steps.map((step, index) => (
                  <li key={step} className="flex gap-2.5 text-xs leading-relaxed text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-yellow-500/30 bg-zinc-950 font-mono text-[10px] text-yellow-300 rounded-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:rounded-md apple:border-white/15 apple:bg-white/10 apple:text-sky-300 apple:rounded-full">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </article>

            <article className={cn(CARD_SURFACE, 'p-5')}>
              <p className="text-sm font-semibold text-zinc-100 dark:text-neutral-100 apple:text-white">
                Коли обирати
              </p>
              <ul className="mt-3 space-y-2.5">
                {selected.useCases.map((useCase) => (
                  <li key={useCase} className="flex gap-2.5 text-xs leading-relaxed text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
                    <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400 dark:text-emerald-300 apple:text-emerald-300" />
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="border border-emerald-500/30 bg-zinc-900/95 p-5 rounded-none dark:border-emerald-500/25 dark:bg-emerald-500/[0.04] dark:rounded-xl apple:border-emerald-400/20 apple:bg-emerald-500/10 apple:backdrop-blur-2xl apple:rounded-3xl transition-all">
              <p className="text-sm font-semibold text-emerald-400 dark:text-emerald-300 apple:text-emerald-200">
                Переваги
              </p>
              <ul className="mt-3 space-y-2">
                {selected.advantages.map((advantage) => (
                  <li key={advantage} className="flex gap-2.5 text-xs leading-relaxed text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
                    <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400 dark:text-emerald-300 apple:text-emerald-300" />
                    <span>{advantage}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-rose-500/30 bg-zinc-900/95 p-5 rounded-none dark:border-rose-500/25 dark:bg-rose-500/[0.04] dark:rounded-xl apple:border-rose-400/20 apple:bg-rose-500/10 apple:backdrop-blur-2xl apple:rounded-3xl transition-all">
              <p className="text-sm font-semibold text-rose-400 dark:text-rose-300 apple:text-rose-200">
                Недоліки
              </p>
              <ul className="mt-3 space-y-2">
                {selected.disadvantages.map((disadvantage) => (
                  <li key={disadvantage} className="flex gap-2.5 text-xs leading-relaxed text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
                    <IconClose className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400 dark:text-rose-300 apple:text-rose-300" />
                    <span>{disadvantage}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <CodeBlock code={selected.pseudocode} language="Псевдокод" label="Алгоритм" />
        </div>
      </div>
    </section>
  )
}
