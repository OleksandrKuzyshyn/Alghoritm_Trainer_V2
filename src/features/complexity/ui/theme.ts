/**
 * Shared Tailwind class tokens for the tri-theme design system.
 *
 * Base (default): Cyber #2 — black / yellow, sharp corners.
 * dark:          Linear #4 — minimal neutral surfaces.
 * apple:         Apple iOS #1 — glass surfaces and capsules.
 *
 * The `apple:` variant is resolved by the app-level Tailwind config.
 */

export const OCTAGON_BUTTON =
  '[clip-path:polygon(12px_0%,calc(100%-12px)_0%,100%_35%,100%_65%,calc(100%-12px)_100%,12px_100%,0%_65%,0%_35%)] apple:[clip-path:none] apple:rounded-full transition-all duration-200'

export const ACTIVE_FILTER =
  'bg-yellow-400 text-zinc-950 font-mono font-bold uppercase dark:bg-white dark:text-neutral-950 dark:font-sans apple:bg-white apple:text-slate-950 apple:font-sans apple:normal-case apple:shadow-md'

export const INACTIVE_FILTER =
  'bg-zinc-800 text-zinc-300 hover:text-yellow-400 font-mono dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:font-sans apple:bg-white/10 apple:text-slate-300 apple:hover:bg-white/20 apple:hover:text-white apple:font-sans apple:normal-case'

export const CARD_SURFACE =
  'bg-zinc-900/95 border border-yellow-500/25 rounded-none hover:border-yellow-400/60 dark:bg-neutral-900/50 dark:border-neutral-800 dark:hover:border-neutral-700 dark:rounded-xl apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15 apple:hover:border-white/30 apple:rounded-3xl transition-all'

export const BIG_O_BADGE =
  'bg-zinc-950 text-yellow-400 border border-yellow-500/40 font-mono dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700 apple:bg-sky-500/20 apple:text-sky-300 apple:border-sky-400/30 apple:rounded-full px-3 py-0.5'

export const SEARCH_SURFACE =
  'bg-zinc-950 border border-yellow-500/30 text-yellow-100 focus:border-yellow-400 dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-100 dark:focus:border-white apple:bg-white/[0.05] apple:border-white/15 apple:text-white apple:rounded-2xl apple:focus:border-sky-400'

export const CODE_SURFACE =
  'bg-zinc-950 border-l-4 border-yellow-400 text-yellow-300 font-mono dark:bg-neutral-950 dark:border-white dark:text-neutral-200 apple:bg-black/40 apple:border-sky-400 apple:text-sky-200 apple:rounded-2xl'

export const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/80 dark:focus-visible:ring-white/80 apple:focus-visible:ring-sky-400'

export const CLIPPED_FOCUS = 'focus-visible:outline-none focus-visible:brightness-110'
