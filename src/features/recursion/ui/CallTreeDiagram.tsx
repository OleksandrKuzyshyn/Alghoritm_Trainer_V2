import type {
  CallNodeStatus,
  CallTreeLayout,
} from '../model/types'

export interface CallTreeDiagramProps {
  readonly layout: CallTreeLayout | null
  readonly nodeStatuses: Readonly<Record<string, CallNodeStatus>>
  readonly nodeValues: Readonly<Record<string, number>>
}

interface NodeStyle {
  readonly box: string
  readonly label: string
  readonly value: string
}

const NODE_STYLES: Record<CallNodeStatus, NodeStyle> = {
  pending: {
    box: 'stroke-zinc-700 fill-zinc-900 dark:stroke-neutral-700 dark:fill-neutral-900 apple:stroke-white/20 apple:fill-slate-900',
    label: 'fill-current text-zinc-500 dark:text-neutral-500 apple:text-slate-400',
    value: 'fill-current text-zinc-600 dark:text-neutral-600 apple:text-slate-500',
  },
  active: {
    box: 'stroke-yellow-400 fill-yellow-400/20 dark:stroke-white dark:fill-white/15 apple:stroke-sky-400 apple:fill-sky-500/25',
    label: 'fill-current text-yellow-300 dark:text-white apple:text-sky-200',
    value: 'fill-current text-yellow-400 dark:text-neutral-300 apple:text-sky-300',
  },
  base: {
    box: 'stroke-amber-500 fill-zinc-900 dark:stroke-neutral-500 dark:fill-neutral-900 apple:stroke-emerald-400 apple:fill-slate-900',
    label: 'fill-current text-amber-400 dark:text-neutral-300 apple:text-emerald-300',
    value: 'fill-current text-amber-500 dark:text-neutral-400 apple:text-emerald-400',
  },
  done: {
    box: 'stroke-amber-500 fill-zinc-900 dark:stroke-neutral-500 dark:fill-neutral-900 apple:stroke-emerald-400 apple:fill-slate-900',
    label: 'fill-current text-amber-400 dark:text-neutral-300 apple:text-emerald-300',
    value: 'fill-current text-amber-500 dark:text-neutral-400 apple:text-emerald-400',
  },
  memo: {
    box: 'stroke-amber-500 fill-zinc-900 dark:stroke-neutral-500 dark:fill-neutral-900 apple:stroke-emerald-400 apple:fill-slate-900',
    label: 'fill-current text-amber-400 dark:text-neutral-300 apple:text-emerald-300',
    value: 'fill-current text-amber-500 dark:text-neutral-400 apple:text-emerald-400',
  },
  blocked: {
    box: 'stroke-amber-500 fill-zinc-900 dark:stroke-neutral-500 dark:fill-neutral-900 apple:stroke-emerald-400 apple:fill-slate-900',
    label: 'fill-current text-amber-300 dark:text-neutral-200 apple:text-emerald-200',
    value: 'fill-current text-amber-500 dark:text-neutral-400 apple:text-emerald-400',
  },
}

const ARROW_MARKER_ID = 'recursion-call-tree-arrow'

export function CallTreeDiagram({
  layout,
  nodeStatuses,
  nodeValues,
}: CallTreeDiagramProps) {
  if (!layout) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-neutral-500 apple:text-slate-300">
        Немає викликів для відображення
      </div>
    )
  }

  return (
    <svg
      width={layout.width}
      height={layout.height}
      className="block max-w-none"
      role="img"
      aria-label="Дерево рекурсивних викликів"
    >
      <defs>
        <marker
          id={ARROW_MARKER_ID}
          viewBox="0 0 8 8"
          refX={7}
          refY={4}
          markerWidth={6}
          markerHeight={6}
          orient="auto-start-reverse"
        >
          <path
            d="M0 0 L8 4 L0 8 z"
            className="fill-yellow-500/60 dark:fill-neutral-600 apple:fill-white/40"
          />
        </marker>
      </defs>

      {layout.edges.map((edge) => (
        <line
          key={`${edge.fromId}-${edge.toId}`}
          x1={edge.x1}
          y1={edge.y1}
          x2={edge.x2}
          y2={edge.y2}
          className="stroke-yellow-500/40 dark:stroke-neutral-700 apple:stroke-white/25"
          strokeWidth={1.5}
          markerEnd={`url(#${ARROW_MARKER_ID})`}
        />
      ))}

      {layout.nodes.map(({ node, x, y, width, height }) => {
        const status = nodeStatuses[node.id] ?? 'pending'
        const value = nodeValues[node.id]
        const styles = NODE_STYLES[status]
        const centerX = x + width / 2

        return (
          <g
            key={node.id}
            opacity={status === 'pending' ? 0.55 : 1}
            className="transition-opacity duration-200"
          >
            <title>
              {value === undefined
                ? node.label
                : `${node.label} → ${value}`}
            </title>

            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              rx={10}
              className={styles.box}
              strokeWidth={status === 'active' ? 2 : 1}
              strokeDasharray={status === 'memo' ? '4 3' : undefined}
            />

            <text
              x={centerX}
              y={value === undefined ? y + 24 : y + 16}
              textAnchor="middle"
              fontSize={10}
              className={`font-mono ${styles.label}`}
            >
              {node.label}
            </text>

            {value === undefined ? null : (
              <text
                x={centerX}
                y={y + 31}
                textAnchor="middle"
                fontSize={9}
                className={`font-mono ${styles.value}`}
              >
                ↩ {value}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
