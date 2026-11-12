import type {
  CallNodeKind,
  CallTraceEvent,
  CallTreeEdge,
  CallTreeLayout,
  CallTreeLayoutNode,
  CallTreeNode,
} from './types'

interface MutableCallNode {
  readonly id: string
  readonly parentId: string | null
  readonly label: string
  readonly depth: number
  readonly args: readonly number[]
  value: number | null
  kind: CallNodeKind
  readonly children: MutableCallNode[]
}

/**
 * Accumulates trace events and maintains the recursive-call hierarchy.
 *
 * The tracker is deliberately independent from React: it can be fed events
 * one by one during a live run or in bulk from a precomputed history.
 */
export class CallTreeTracker {
  private readonly nodes = new Map<string, MutableCallNode>()
  private root: MutableCallNode | null = null

  track(event: CallTraceEvent): void {
    if (event.type === 'call') {
      const node: MutableCallNode = {
        id: event.id,
        parentId: event.parentId,
        label: event.label,
        depth: event.depth,
        args: [...event.args],
        value: null,
        kind: 'standard',
        children: [],
      }

      this.nodes.set(event.id, node)

      if (event.parentId !== null) {
        this.nodes.get(event.parentId)?.children.push(node)
      } else if (this.root === null) {
        this.root = node
      }

      return
    }

    const node = this.nodes.get(event.id)
    if (!node) return

    if (event.type === 'base') {
      node.kind = 'base'
    } else if (event.type === 'memo') {
      node.kind = 'memo'
    } else if (event.type === 'guard') {
      node.kind = 'blocked'
    }

    if (event.value !== null) {
      node.value = event.value
    }
  }

  /** Returns a deeply frozen snapshot of the tree built so far. */
  build(): CallTreeNode | null {
    return this.root === null ? null : toReadonly(this.root)
  }
}

function toReadonly(node: MutableCallNode): CallTreeNode {
  return {
    id: node.id,
    parentId: node.parentId,
    label: node.label,
    depth: node.depth,
    args: [...node.args],
    value: node.value,
    kind: node.kind,
    children: node.children.map(toReadonly),
  }
}

export function buildCallTree(events: readonly CallTraceEvent[]): CallTreeNode | null {
  const tracker = new CallTreeTracker()

  for (const event of events) {
    tracker.track(event)
  }

  return tracker.build()
}

/* -------------------------------------------------------------------------- */
/* Layout                                                                     */
/* -------------------------------------------------------------------------- */

export interface CallTreeLayoutOptions {
  readonly nodeWidth?: number
  readonly nodeHeight?: number
  readonly horizontalGap?: number
  readonly verticalGap?: number
  readonly padding?: number
}

const DEFAULT_LAYOUT_OPTIONS = {
  nodeWidth: 88,
  nodeHeight: 40,
  horizontalGap: 14,
  verticalGap: 46,
  padding: 24,
} as const

interface Position {
  readonly centerX: number
  readonly top: number
}

/**
 * Assigns coordinates to the tree.
 *
 * Leaves are laid out left-to-right; every parent is centred above its
 * children. This produces a stable "org chart" style diagram that fits an
 * SVG viewport and scrolls horizontally for very wide trees.
 */
export function layoutCallTree(
  root: CallTreeNode | null,
  options: CallTreeLayoutOptions = {},
): CallTreeLayout | null {
  if (root === null) return null

  const nodeWidth = options.nodeWidth ?? DEFAULT_LAYOUT_OPTIONS.nodeWidth
  const nodeHeight = options.nodeHeight ?? DEFAULT_LAYOUT_OPTIONS.nodeHeight
  const horizontalGap = options.horizontalGap ?? DEFAULT_LAYOUT_OPTIONS.horizontalGap
  const verticalGap = options.verticalGap ?? DEFAULT_LAYOUT_OPTIONS.verticalGap
  const padding = options.padding ?? DEFAULT_LAYOUT_OPTIONS.padding

  const nodes: CallTreeLayoutNode[] = []
  const edges: CallTreeEdge[] = []
  const positions = new Map<string, Position>()

  let nextLeafX = padding
  let maxDepth = 0

  function place(node: CallTreeNode): number {
    maxDepth = Math.max(maxDepth, node.depth)

    const top = padding + node.depth * (nodeHeight + verticalGap)
    let centerX: number

    if (node.children.length === 0) {
      centerX = nextLeafX + nodeWidth / 2
      nextLeafX += nodeWidth + horizontalGap
    } else {
      const childCenters = node.children.map((child) => place(child))
      centerX = (childCenters[0] + childCenters[childCenters.length - 1]) / 2
    }

    positions.set(node.id, { centerX, top })

    nodes.push({
      node,
      x: centerX - nodeWidth / 2,
      y: top,
      width: nodeWidth,
      height: nodeHeight,
    })

    for (const child of node.children) {
      const childPosition = positions.get(child.id)
      if (!childPosition) continue

      edges.push({
        fromId: node.id,
        toId: child.id,
        x1: centerX,
        y1: top + nodeHeight,
        x2: childPosition.centerX,
        y2: childPosition.top,
      })
    }

    return centerX
  }

  place(root)

  const width = Math.max(
    nextLeafX - horizontalGap + padding,
    nodeWidth + padding * 2,
  )
  const height =
    padding * 2 + (maxDepth + 1) * nodeHeight + maxDepth * verticalGap

  return { nodes, edges, width, height }
}
