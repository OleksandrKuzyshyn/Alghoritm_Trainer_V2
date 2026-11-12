import { Badge } from './ComplexityBadge'
import { GrowthChart } from './GrowthChart'
import { IconBulb, IconInfo, IconOverview } from './Icons'
import { OperationsEstimator } from './OperationsEstimator'
import { TabHeading } from './TabHeading'
import { BIG_O_BADGE, CARD_SURFACE } from './theme'

const NOTATIONS = [
  {
    symbol: 'O',
    title: 'Верхня межа',
    text: 'Найгірший сценарій. «Швидше за це не буде» — саме її найчастіше питають на іспиті.',
    className:
      'border-rose-500/40 bg-rose-500/10 text-rose-300 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 apple:border-rose-400/30 apple:bg-rose-500/20 apple:text-rose-200',
  },
  {
    symbol: 'Ω',
    title: 'Нижня межа',
    text: 'Найкращий сценарій або принциповий мінімум. Показує, швидше за що алгоритм не може.',
    className:
      'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 apple:border-emerald-400/30 apple:bg-emerald-500/20 apple:text-emerald-200',
  },
  {
    symbol: 'Θ',
    title: 'Точна межа',
    text: 'Одночасно O і Ω. Найточніший опис зростання; використовується для середнього випадку.',
    className:
      'border-yellow-500/40 bg-yellow-500/10 text-yellow-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 apple:border-sky-400/30 apple:bg-sky-500/20 apple:text-sky-300',
  },
] as const

const RULES = [
  { code: 'O(3n) = O(n)', text: 'Сталі множники не впливають на характер зростання.' },
  { code: 'O(n² + n) = O(n²)', text: 'Залишаємо лише домінантний доданок.' },
  { code: 'n · n = n²', text: 'Вкладені цикли множаться, послідовні — додаються.' },
  { code: 'T(n) ≠ M(n)', text: 'Час і додаткову пам’ять оцінюють окремо.' },
] as const

const MYTHS = [
  {
    myth: 'O(n log n) завжди швидше за O(n²)',
    truth: 'На малих n і великих сталих множниках квадратичний алгоритм може перемогти.',
  },
  {
    myth: 'Quick Sort завжди працює за O(n log n)',
    truth: 'Найгірший випадок — O(n²). Гарантію дає хіба що introsort або Heap Sort.',
  },
  {
    myth: 'Big-O вимірює секунди',
    truth: 'Big-O описує, як час зростає з n, а не абсолютну швидкість на вашому комп’ютері.',
  },
] as const

const LADDER = [
  {
    label: 'O(1)',
    name: 'Стала',
    example: 'Доступ до A[i]',
    note: 'Не залежить від n',
  },
  {
    label: 'O(log n)',
    name: 'Логарифмічна',
    example: 'Бінарний пошук',
    note: '≈ 20 кроків для 10⁶',
  },
  {
    label: 'O(n)',
    name: 'Лінійна',
    example: 'Один прохід по масиву',
    note: '10⁶ операцій',
  },
  {
    label: 'O(n log n)',
    name: 'Лінеарифмічна',
    example: 'Merge, Quick, Heap',
    note: '≈ 2·10⁷ для 10⁶',
  },
  {
    label: 'O(n²)',
    name: 'Квадратична',
    example: 'Bubble, Insertion, Selection',
    note: '≈ 5·10¹¹ для 10⁶',
  },
  {
    label: 'O(n + k)',
    name: 'Лінійна від діапазону',
    example: 'Counting, Radix',
    note: 'Потрібен малий k або мале d',
  },
] as const

export function OverviewTab() {
  return (
    <section className="space-y-6">
      <TabHeading
        eyebrow="Big-O · Лекція 5"
        title="Як читати складність сортування"
        description="Складність — це не секунди, а характер зростання кількості операцій і пам’яті зі збільшенням n. Навчіться читати Ω, Θ та O — і зможете порівнювати алгоритми ще до запуску коду."
        icon={<IconOverview className="h-4 w-4" />}
      >
        <Badge tone="sky">Ω · Θ · O</Badge>
        <Badge tone="emerald">Час і пам’ять</Badge>
        <Badge tone="rose">Реальні приклади</Badge>
      </TabHeading>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className={`${CARD_SURFACE} p-5`}>
          <GrowthChart />
        </article>

        <article className={`${CARD_SURFACE} p-5`}>
          <OperationsEstimator />
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <article className={`${CARD_SURFACE} p-5`}>
          <p className="flex items-center gap-2 text-sm font-semibold text-zinc-100 dark:text-neutral-100 apple:text-white">
            <IconInfo className="h-4 w-4 text-yellow-400 dark:text-neutral-300 apple:text-sky-300" />
            Три позначення
          </p>
          <div className="mt-4 space-y-3">
            {NOTATIONS.map((item) => (
              <div key={item.symbol} className="flex gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center border font-mono text-base font-bold rounded-none dark:rounded-lg apple:rounded-2xl ${item.className}`}
                >
                  {item.symbol}
                </span>
                <div>
                  <p className="text-xs font-semibold text-zinc-200 dark:text-neutral-200 apple:text-white">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 border border-yellow-500/20 bg-zinc-950 px-3 py-2 text-[11px] text-zinc-400 rounded-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:rounded-lg apple:border-white/10 apple:bg-white/[0.04] apple:text-slate-300 apple:rounded-2xl">
            У таблицях: <span className="text-emerald-400 dark:text-emerald-300 apple:text-emerald-300">Ω</span> — best,{' '}
            <span className="text-yellow-400 dark:text-neutral-200 apple:text-sky-300">Θ</span> — average,{' '}
            <span className="text-rose-400 dark:text-rose-300 apple:text-rose-300">O</span> — worst.
          </p>
        </article>

        <article className={`${CARD_SURFACE} p-5`}>
          <p className="flex items-center gap-2 text-sm font-semibold text-zinc-100 dark:text-neutral-100 apple:text-white">
            <IconBulb className="h-4 w-4 text-emerald-400 dark:text-emerald-300 apple:text-emerald-300" />
            Правила спрощення
          </p>
          <div className="mt-4 space-y-3">
            {RULES.map((rule) => (
              <div
                key={rule.code}
                className="border border-yellow-500/20 bg-zinc-950 p-3 rounded-none dark:border-neutral-800 dark:bg-neutral-950 dark:rounded-lg apple:border-white/10 apple:bg-white/[0.04] apple:rounded-2xl"
              >
                <p className="font-mono text-[11px] font-semibold text-yellow-300 dark:text-neutral-200 apple:text-sky-300">
                  {rule.code}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
                  {rule.text}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className={`${CARD_SURFACE} p-5`}>
          <p className="flex items-center gap-2 text-sm font-semibold text-zinc-100 dark:text-neutral-100 apple:text-white">
            <IconInfo className="h-4 w-4 text-rose-400 dark:text-rose-300 apple:text-rose-300" />
            Міфи, які плутають
          </p>
          <div className="mt-4 space-y-3">
            {MYTHS.map((item) => (
              <div
                key={item.myth}
                className="border border-yellow-500/20 bg-zinc-950 p-3 rounded-none dark:border-neutral-800 dark:bg-neutral-950 dark:rounded-lg apple:border-white/10 apple:bg-white/[0.04] apple:rounded-2xl"
              >
                <p className="flex gap-2 text-[11px] font-semibold text-zinc-200 dark:text-neutral-200 apple:text-white">
                  <span className="text-rose-400 dark:text-rose-300 apple:text-rose-300" aria-hidden="true">✕</span>
                  {item.myth}
                </p>
                <p className="mt-1.5 flex gap-2 text-[11px] leading-relaxed text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
                  <span className="text-emerald-400 dark:text-emerald-300 apple:text-emerald-300" aria-hidden="true">✓</span>
                  {item.truth}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className={`${CARD_SURFACE} p-5`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-100 dark:text-neutral-100 apple:text-white">
              Сходинки складності
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-neutral-500 apple:text-slate-400">
              Від найшвидшого зростання до найповільнішого. Пам’ятайте: це порядок зростання,
              а не абсолютний час.
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600 dark:text-neutral-600 apple:text-slate-500">
            швидко → повільно
          </span>
        </div>

        <div className="mt-4 grid gap-2">
          {LADDER.map((step) => (
            <div
              key={step.label}
              className="grid gap-2 border border-yellow-500/20 bg-zinc-950/60 px-3 py-2.5 rounded-none dark:border-neutral-800 dark:bg-neutral-950/60 dark:rounded-lg apple:border-white/10 apple:bg-white/[0.04] apple:rounded-2xl sm:grid-cols-[110px_minmax(0,1fr)_auto] sm:items-center"
            >
              <span className={`inline-flex w-fit items-center ${BIG_O_BADGE}`}>
                {step.label}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-300 dark:text-neutral-300 apple:text-slate-200">
                  {step.name} <span className="text-zinc-600 dark:text-neutral-600 apple:text-slate-500">·</span>{' '}
                  <span className="text-zinc-500 dark:text-neutral-500 apple:text-slate-400">{step.example}</span>
                </p>
              </div>
              <span className="font-mono text-[10px] text-zinc-500 dark:text-neutral-500 apple:text-slate-400 sm:text-right">
                {step.note}
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
