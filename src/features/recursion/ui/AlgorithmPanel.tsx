import { useId } from 'react'
import { RECURSION_ALGORITHMS } from '../model/algorithms'
import type {
  RecursionAlgorithmId,
  RecursionAlgorithmInfo,
  RecursionInput,
} from '../model/types'

export interface AlgorithmPanelProps {
  readonly algorithm: RecursionAlgorithmId
  readonly info: RecursionAlgorithmInfo
  readonly input: RecursionInput
  readonly onAlgorithmChange: (algorithm: RecursionAlgorithmId) => void
  readonly onPrimaryChange: (value: number) => void
  readonly onSecondaryChange: (value: number) => void
}

interface InputSliderProps {
  readonly id: string
  readonly label: string
  readonly value: number
  readonly min: number
  readonly max: number
  readonly step: number
  readonly hint: string
  readonly accent: 'sky' | 'emerald'
  readonly onChange: (value: number) => void
}

const PANEL =
  'bg-zinc-900/90 border border-yellow-500/25 rounded-none dark:bg-neutral-900/60 dark:border-neutral-800 dark:rounded-xl apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15 apple:rounded-3xl'

const GEOMETRY =
  '[clip-path:polygon(12px_0%,calc(100%-12px)_0%,100%_35%,100%_65%,calc(100%-12px)_100%,12px_100%,0%_65%,0%_35%)] apple:[clip-path:none] apple:rounded-full transition-all duration-200'

const PRIMARY =
  'bg-yellow-400 text-zinc-950 hover:bg-yellow-300 font-mono font-bold uppercase dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 dark:font-sans apple:bg-sky-500 apple:text-white apple:hover:bg-sky-400 apple:font-sans apple:normal-case'

const SECONDARY =
  'bg-zinc-800 text-yellow-400 hover:bg-zinc-700 font-mono dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:font-sans apple:bg-white/10 apple:text-slate-200 apple:hover:bg-white/20 apple:font-sans'

const CHIP =
  'rounded-full border border-yellow-500/25 bg-zinc-950/60 px-2 py-0.5 font-mono text-[10px] text-yellow-400 dark:border-neutral-700 dark:bg-neutral-950/60 dark:text-neutral-300 apple:border-white/10 apple:bg-white/10 apple:text-sky-300 apple:font-sans'

function InputSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  hint,
  accent,
  onChange,
}: InputSliderProps) {
  const accentClass = 'accent-yellow-400 dark:accent-white apple:accent-sky-500'
  const valueClass =
    accent === 'sky'
      ? 'text-yellow-400 dark:text-neutral-200 apple:text-sky-300'
      : 'text-amber-400 dark:text-neutral-300 apple:text-emerald-300'

  return (
    <div>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm text-zinc-200 dark:text-neutral-300 apple:text-slate-200"
        >
          {label}
        </label>
        <span
          className={`rounded-md border border-yellow-500/25 bg-zinc-950/60 px-2 py-0.5 font-mono text-xs dark:border-neutral-800 dark:bg-neutral-950/60 apple:border-white/10 apple:bg-white/10 apple:rounded-full ${valueClass}`}
        >
          {value}
        </span>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={`mt-2 w-full cursor-pointer ${accentClass}`}
      />

      <div className="mt-1 flex justify-between text-[10px] text-zinc-600 dark:text-neutral-600 apple:text-slate-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>

      <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
        {hint}
      </p>
    </div>
  )
}

export function AlgorithmPanel({
  algorithm,
  info,
  input,
  onAlgorithmChange,
  onPrimaryChange,
  onSecondaryChange,
}: AlgorithmPanelProps) {
  const idPrefix = useId()

  return (
    <div className="flex flex-col gap-6">
      <section className={`${PANEL} p-4 shadow-lg sm:p-5`}>
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
          Алгоритм
        </h3>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {RECURSION_ALGORITHMS.map((item) => {
            const isActive = item.id === algorithm

            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onAlgorithmChange(item.id)}
                className={`w-full px-3 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:focus-visible:ring-white apple:focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 ${GEOMETRY} ${
                  isActive ? PRIMARY : SECONDARY
                }`}
              >
                <span className="block text-sm font-medium">{item.name}</span>
                <span
                  className={`mt-0.5 block font-mono text-[11px] ${
                    isActive
                      ? 'text-zinc-800 dark:text-neutral-600 apple:text-sky-100'
                      : 'text-zinc-500 dark:text-neutral-500 apple:text-slate-400'
                  }`}
                >
                  {item.complexity.time}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 rounded-xl border border-yellow-500/15 bg-zinc-950/60 p-3 dark:border-neutral-800 dark:bg-neutral-950/50 apple:border-white/10 apple:bg-white/[0.04] apple:rounded-2xl">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-zinc-100 dark:text-neutral-200 apple:text-slate-100">
              {info.ukrainianName}
            </p>
            <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-400 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300 apple:border-emerald-400/30 apple:bg-emerald-500/10 apple:text-emerald-300">
              {info.complexity.time}
            </span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
            {info.description}
          </p>

          <div className="mt-3 rounded-lg border border-yellow-500/15 bg-zinc-900/80 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900/60 apple:border-white/10 apple:bg-white/[0.04] apple:rounded-xl">
            <p className="font-mono text-xs text-yellow-300 dark:text-neutral-200 apple:text-sky-300">
              {info.formula}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
              <span className="text-amber-400 dark:text-neutral-300 apple:text-emerald-300">
                База:
              </span>{' '}
              {info.baseCase}
            </p>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <dt className="text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
                Час
              </dt>
              <dd className="font-mono text-yellow-400 dark:text-neutral-300 apple:text-sky-300">
                {info.complexity.time}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
                Пам'ять
              </dt>
              <dd className="font-mono text-amber-400 dark:text-neutral-300 apple:text-emerald-300">
                {info.complexity.space}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={`${PANEL} p-4 shadow-lg sm:p-5`}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
            Параметри
          </h3>
          <span className={CHIP}>
            {info.secondary
              ? `(${input.primary}, ${input.secondary})`
              : `(${input.primary})`}
          </span>
        </div>

        <div className="mt-4 space-y-5">
          <InputSlider
            id={`${idPrefix}-primary`}
            label={info.primary.label}
            value={input.primary}
            min={info.primary.min}
            max={info.primary.max}
            step={info.primary.step}
            hint={info.primary.hint}
            accent="sky"
            onChange={onPrimaryChange}
          />

          {info.secondary ? (
            <InputSlider
              id={`${idPrefix}-secondary`}
              label={info.secondary.label}
              value={input.secondary}
              min={info.secondary.min}
              max={info.secondary.max}
              step={info.secondary.step}
              hint={info.secondary.hint}
              accent="emerald"
              onChange={onSecondaryChange}
            />
          ) : null}
        </div>
      </section>
    </div>
  )
}
