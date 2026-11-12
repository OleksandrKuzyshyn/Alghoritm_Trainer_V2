import type { SortSnapshot } from '../model/types'

export interface ArrayVisualizerProps {
  readonly snapshot: SortSnapshot
  /** Fixed scale so bars do not jump while the algorithm rewrites values. */
  readonly maxValue: number
}

function resolveBarColor(
  index: number,
  comparing: ReadonlySet<number>,
  swapped: ReadonlySet<number>,
  sorted: ReadonlySet<number>,
): string {
  if (comparing.has(index)) {
    return 'fill-rose-500 dark:fill-white apple:fill-indigo-400'
  }

  if (swapped.has(index) || sorted.has(index)) {
    return 'fill-amber-300 dark:fill-emerald-400 apple:fill-emerald-400'
  }

  return 'fill-yellow-400/75 dark:fill-neutral-500 apple:fill-sky-400/80'
}

export function ArrayVisualizer({ snapshot, maxValue }: ArrayVisualizerProps) {
  const comparing = new Set(snapshot.comparing)
  const swapped = new Set(snapshot.swapped)
  const sorted = new Set(snapshot.sorted)

  const itemCount = Math.max(snapshot.array.length, 1)
  const scale = Math.max(maxValue, 1)
  const slotWidth = 100 / itemCount
  const barWidth = Math.max(slotWidth * 0.7, 0.2)

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-full w-full"
      role="img"
      aria-label={`Візуалізація масиву з ${snapshot.array.length} елементів`}
    >
      {[25, 50, 75].map((mark) => (
        <line
          key={mark}
          x1={0}
          x2={100}
          y1={mark}
          y2={mark}
          className="stroke-yellow-500/15 dark:stroke-neutral-800 apple:stroke-white/10"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {snapshot.array.map((value, index) => {
        const height = Math.max((value / scale) * 100, 1.5)
        const x = index * slotWidth + (slotWidth - barWidth) / 2
        const y = 100 - height
        const color = resolveBarColor(index, comparing, swapped, sorted)

        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={height}
            className={`${color} transition-colors duration-150 ease-out`}
          >
            <title>{`Позиція ${index + 1}: ${value}`}</title>
          </rect>
        )
      })}
    </svg>
  )
}
