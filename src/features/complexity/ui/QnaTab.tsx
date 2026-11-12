import { cn } from '../lib/format'
import { QNA_CATEGORY_LABELS, QNA_ITEMS } from '../model/qna'
import type { QnaCategory } from '../model/types'
import { QNA_FILTERS, useQnaBrowser } from '../model/useQnaBrowser'
import { IconChevronDown, IconClose, IconQna, IconSearch } from './Icons'
import { TabHeading } from './TabHeading'
import { Badge } from './ComplexityBadge'
import {
  ACTIVE_FILTER,
  CARD_SURFACE,
  CLIPPED_FOCUS,
  FOCUS_RING,
  INACTIVE_FILTER,
  OCTAGON_BUTTON,
  SEARCH_SURFACE,
} from './theme'

const CATEGORY_BADGES: Record<QnaCategory, string> = {
  basics:
    'border-yellow-500/40 bg-yellow-500/10 text-yellow-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 apple:border-sky-400/30 apple:bg-sky-500/20 apple:text-sky-300',
  algorithms:
    'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 apple:border-emerald-400/30 apple:bg-emerald-500/20 apple:text-emerald-200',
  practice:
    'border-amber-500/40 bg-amber-500/10 text-amber-300 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 apple:border-amber-400/30 apple:bg-amber-500/20 apple:text-amber-200',
  exam: 'border-rose-500/40 bg-rose-500/10 text-rose-300 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 apple:border-rose-400/30 apple:bg-rose-500/20 apple:text-rose-200',
}

export function QnaTab() {
  const qna = useQnaBrowser()

  return (
    <section className="space-y-6">
      <TabHeading
        eyebrow={`Q&A · ${QNA_ITEMS.length} питань`}
        title="Часті питання про складність"
        description="Короткі відповіді на те, що найчастіше плутають: межі O, Ω і Θ, стабільність, вибір pivot, пам’ять Merge Sort і типові іспитові пастки."
        icon={<IconQna className="h-4 w-4" />}
      >
        <Badge tone="sky">Пошук</Badge>
        <Badge tone="emerald">Пояснення</Badge>
        <Badge tone="amber">Іспит</Badge>
      </TabHeading>

      <div className={cn(CARD_SURFACE, 'p-4 sm:p-5')}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <label htmlFor="complexity-qna-search" className="sr-only">
              Пошук серед питань
            </label>
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-neutral-500 apple:text-slate-400" />
            <input
              id="complexity-qna-search"
              type="search"
              value={qna.query}
              onChange={(event) => qna.setQuery(event.target.value)}
              placeholder="Пошук: стабільність, pivot, O(n²)…"
              className={cn(
                SEARCH_SURFACE,
                'w-full py-2.5 pl-10 pr-10 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 dark:placeholder:text-neutral-600 dark:focus:ring-white/10 apple:placeholder:text-slate-500 apple:focus:ring-sky-400/30',
              )}
            />
            {qna.query ? (
              <button
                type="button"
                onClick={() => qna.setQuery('')}
                aria-label="Очистити пошук"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/80 dark:hover:bg-neutral-800 dark:hover:text-white dark:focus-visible:ring-white/80 apple:rounded-full apple:hover:bg-white/10 apple:hover:text-white apple:focus-visible:ring-sky-400"
              >
                <IconClose className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={qna.expandAll}
              className={cn(
                'px-3 py-1.5 text-[11px]',
                OCTAGON_BUTTON,
                CLIPPED_FOCUS,
                INACTIVE_FILTER,
              )}
            >
              Розгорнути всі
            </button>
            <button
              type="button"
              onClick={qna.collapseAll}
              disabled={qna.openCount === 0}
              className={cn(
                'px-3 py-1.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-40',
                OCTAGON_BUTTON,
                CLIPPED_FOCUS,
                INACTIVE_FILTER,
              )}
            >
              Згорнути
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {QNA_FILTERS.map((filter) => {
            const active = qna.category === filter.id
            const count =
              filter.id === 'all'
                ? QNA_ITEMS.length
                : (qna.categoryCounts[filter.id] ?? 0)

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => qna.setCategory(filter.id)}
                aria-pressed={active}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px]',
                  OCTAGON_BUTTON,
                  CLIPPED_FOCUS,
                  active ? ACTIVE_FILTER : INACTIVE_FILTER,
                )}
              >
                {filter.label}
                <span
                  className={cn(
                    'px-1 font-mono text-[10px] rounded-none dark:rounded-md apple:rounded-full',
                    active
                      ? 'bg-zinc-950/15 text-zinc-950 dark:bg-neutral-950/15 dark:text-neutral-950 apple:bg-slate-950/10 apple:text-slate-950'
                      : 'bg-zinc-950 text-zinc-400 dark:bg-neutral-950 dark:text-neutral-500 apple:bg-black/20 apple:text-slate-300',
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}

          <span className="ml-auto self-center font-mono text-[10px] text-zinc-600 dark:text-neutral-600 apple:text-slate-500">
            Знайдено: {qna.filteredItems.length} / {QNA_ITEMS.length}
          </span>
        </div>
      </div>

      {qna.filteredItems.length === 0 ? (
        <div className="border border-dashed border-yellow-500/25 bg-zinc-900/60 p-10 text-center rounded-none dark:border-neutral-800 dark:bg-neutral-900/40 dark:rounded-2xl apple:border-white/15 apple:bg-white/[0.04] apple:backdrop-blur-2xl apple:rounded-3xl">
          <IconSearch className="mx-auto h-8 w-8 text-zinc-700 dark:text-neutral-700 apple:text-slate-500" />
          <p className="mt-3 text-sm font-semibold text-zinc-300 dark:text-neutral-300 apple:text-white">
            Нічого не знайдено
          </p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
            Спробуйте інший запит або скиньте фільтри — можливо, питання сформульоване
            іншими словами.
          </p>
          <button
            type="button"
            onClick={() => {
              qna.setQuery('')
              qna.setCategory('all')
            }}
            className={cn(
              'mt-4 px-3 py-1.5 text-[11px]',
              OCTAGON_BUTTON,
              CLIPPED_FOCUS,
              ACTIVE_FILTER,
            )}
          >
            Скинути фільтри
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {qna.filteredItems.map((item) => {
            const open = qna.isOpen(item.id)
            return (
              <article
                key={item.id}
                className={cn(
                  'overflow-hidden border bg-zinc-950 text-yellow-100 transition-all rounded-none dark:bg-neutral-950 dark:text-neutral-100 dark:rounded-2xl apple:bg-white/[0.05] apple:backdrop-blur-2xl apple:text-white apple:rounded-2xl',
                  open
                    ? 'border-yellow-400/70 dark:border-white/40 apple:border-sky-400/40'
                    : 'border-yellow-500/30 hover:border-yellow-400/60 dark:border-neutral-800 dark:hover:border-neutral-700 apple:border-white/15 apple:hover:border-white/30',
                )}
              >
                <button
                  type="button"
                  onClick={() => qna.toggleItem(item.id)}
                  aria-expanded={open}
                  aria-controls={`qna-answer-${item.id}`}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-3.5 text-left sm:px-5',
                    FOCUS_RING,
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 inline-flex shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-none dark:rounded-full apple:rounded-full',
                      CATEGORY_BADGES[item.category],
                    )}
                  >
                    {QNA_CATEGORY_LABELS[item.category]}
                  </span>
                  <span className="flex-1 text-sm font-medium leading-relaxed text-zinc-100 dark:text-neutral-100 apple:text-white">
                    {item.question}
                  </span>
                  <IconChevronDown
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0 text-zinc-500 transition-transform dark:text-neutral-500 apple:text-slate-400',
                      open && 'rotate-180 text-yellow-400 dark:text-white apple:text-sky-300',
                    )}
                  />
                </button>

                {open ? (
                  <div
                    id={`qna-answer-${item.id}`}
                    className="border-t border-yellow-500/20 bg-zinc-900/60 px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900/40 apple:border-white/10 apple:bg-white/[0.03] sm:px-5"
                  >
                    <div className="space-y-3 border-l-2 border-yellow-400/60 pl-4 dark:border-white/30 apple:border-sky-400/40">
                      {item.answer.map((paragraph, index) => (
                        <p
                          key={`${item.id}-${index}`}
                          className="text-xs leading-relaxed text-zinc-300 dark:text-neutral-300 apple:text-slate-200"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
