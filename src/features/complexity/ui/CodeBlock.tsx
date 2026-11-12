import { cn } from '../lib/format'
import { CODE_SURFACE, FOCUS_RING } from './theme'

interface CodeBlockProps {
  readonly code: string
  readonly language: string
  readonly label?: string
  readonly className?: string
}

export function CodeBlock({ code, language, label, className }: CodeBlockProps) {
  return (
    <div
      className={cn(
        'overflow-hidden bg-zinc-900/95 border border-yellow-500/25 rounded-none hover:border-yellow-400/60 dark:bg-neutral-900/50 dark:border-neutral-800 dark:hover:border-neutral-700 dark:rounded-xl apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15 apple:hover:border-white/30 apple:rounded-2xl transition-all',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-yellow-500/20 bg-zinc-950/80 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-950/60 apple:border-white/10 apple:bg-white/[0.04]">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
          {label ?? 'Приклад коду'}
        </span>
        <span className="border border-yellow-500/40 bg-zinc-950 px-2 py-0.5 font-mono text-[10px] text-yellow-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 apple:border-sky-400/30 apple:bg-sky-500/20 apple:text-sky-300 apple:rounded-full">
          {language}
        </span>
      </div>
      <pre
        className={cn(
          'overflow-x-auto p-4 text-[12.5px] leading-relaxed',
          CODE_SURFACE,
          FOCUS_RING,
        )}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}
