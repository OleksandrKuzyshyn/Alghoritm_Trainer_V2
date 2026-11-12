import { useState } from 'react'
import { BinarySearchLab } from './BinarySearchLab'
import { RecursionLab } from './RecursionLab'

type ModuleTabId = 'recursion' | 'binary'

const TABS: ReadonlyArray<{
  id: ModuleTabId
  label: string
  caption: string
}> = [
  { id: 'recursion', label: 'Рекурсія', caption: 'Стек і дерево викликів' },
  { id: 'binary', label: 'Двійковий пошук', caption: 'Межі L / M / R' },
]

const GEOMETRY =
  '[clip-path:polygon(12px_0%,calc(100%-12px)_0%,100%_35%,100%_65%,calc(100%-12px)_100%,12px_100%,0%_65%,0%_35%)] apple:[clip-path:none] apple:rounded-full transition-all duration-200'

const ACTIVE_TAB_CLASSES: Record<ModuleTabId, string> = {
  recursion:
    'bg-yellow-400 text-zinc-950 hover:bg-yellow-300 font-mono font-bold uppercase dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 dark:font-sans apple:bg-sky-500 apple:text-white apple:hover:bg-sky-400 apple:font-sans apple:normal-case',
  binary:
    'bg-yellow-400 text-zinc-950 hover:bg-yellow-300 font-mono font-bold uppercase dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 dark:font-sans apple:bg-sky-500 apple:text-white apple:hover:bg-sky-400 apple:font-sans apple:normal-case',
}

const IDLE_TAB_CLASSES =
  'bg-zinc-800 text-yellow-400 hover:bg-zinc-700 font-mono dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:font-sans apple:bg-white/10 apple:text-slate-200 apple:hover:bg-white/20 apple:font-sans'

export function RecursionTree() {
  const [activeTab, setActiveTab] = useState<ModuleTabId>('recursion')

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 text-zinc-200 dark:text-neutral-200 apple:text-slate-100">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-yellow-400 dark:text-neutral-400 dark:font-sans apple:text-sky-300 apple:font-sans">
            Рекурсія та пошук
          </p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-100 dark:text-neutral-100 dark:font-sans apple:text-white apple:font-sans sm:text-3xl">
            Рекурсивні алгоритми
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400 dark:text-neutral-400 dark:font-sans apple:text-slate-300 apple:font-sans">
            Покрокове трасування викликів, LIFO-стек, дерево рекурсії та
            двійковий пошук із живими покажчиками L / M / R.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-yellow-500/25 bg-zinc-900 px-3 py-1 text-xs text-yellow-400 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300 apple:border-white/10 apple:bg-white/10 apple:text-slate-200 apple:backdrop-blur-xl apple:font-sans">
            4 алгоритми
          </span>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-400 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300 apple:border-emerald-400/30 apple:bg-emerald-500/10 apple:text-emerald-300 apple:backdrop-blur-xl apple:font-sans">
            LIFO стек
          </span>
          <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300 apple:border-sky-400/30 apple:bg-sky-500/10 apple:text-sky-300 apple:backdrop-blur-xl apple:font-sans">
            O(log n)
          </span>
        </div>
      </header>

      <nav
        role="tablist"
        aria-label="Розділи модуля рекурсії"
        className="flex flex-wrap gap-1.5 rounded-none border border-yellow-500/25 bg-zinc-900/90 p-2 dark:rounded-xl dark:border-neutral-800 dark:bg-neutral-900/60 apple:rounded-3xl apple:border-white/15 apple:bg-white/[0.06] apple:backdrop-blur-2xl"
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`recursion-tab-${tab.id}`}
              aria-selected={active}
              aria-controls={`recursion-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:focus-visible:ring-white apple:focus-visible:ring-sky-500/60 ${GEOMETRY} sm:flex-none ${
                active ? ACTIVE_TAB_CLASSES[tab.id] : IDLE_TAB_CLASSES
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold">
                  {tab.label}
                </span>
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
        id={`recursion-panel-${activeTab}`}
        aria-labelledby={`recursion-tab-${activeTab}`}
      >
        {activeTab === 'recursion' ? <RecursionLab /> : <BinarySearchLab />}
      </div>

      <footer className="flex flex-col gap-2 border-t border-yellow-500/25 pt-4 text-[11px] leading-relaxed text-zinc-500 dark:border-neutral-800 dark:text-neutral-500 apple:border-white/10 apple:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Порада: слідкуйте за вершиною стека — саме вона повертає значення
          першою.
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600 dark:text-neutral-600 apple:text-slate-400">
          LIFO · base case · O(log n)
        </p>
      </footer>
    </section>
  )
}
