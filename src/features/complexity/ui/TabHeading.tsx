import type { ReactNode } from 'react'

interface TabHeadingProps {
  readonly eyebrow: string
  readonly title: string
  readonly description: string
  readonly icon: ReactNode
  readonly children?: ReactNode
}

export function TabHeading({ eyebrow, title, description, icon, children }: TabHeadingProps) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-yellow-500/25 bg-zinc-950 text-yellow-400 rounded-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:rounded-lg apple:border-white/15 apple:bg-white/10 apple:text-sky-300 apple:rounded-2xl">
          {icon}
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-yellow-400 dark:text-neutral-400 apple:text-sky-300">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-xl font-bold text-zinc-100 dark:text-neutral-100 apple:text-white sm:text-2xl">
            {title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400 dark:text-neutral-400 apple:text-slate-300">
            {description}
          </p>
        </div>
      </div>
      {children ? <div className="flex flex-wrap gap-2 lg:justify-end">{children}</div> : null}
    </header>
  )
}
