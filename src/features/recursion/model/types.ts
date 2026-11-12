/**
 * Domain types for the recursion feature.
 *
 * The module is built around two independent ideas:
 *  - a recursive algorithm produces a stream of immutable `CallTraceEvent`s;
 *  - the UI replays those events as frames, so stepping backwards is free.
 *
 * The same event stream is also fed into the call-tree tracker, which builds
 * the parent/child structure used by the SVG diagram.
 */

export const RECURSION_ALGORITHM_IDS = [
  'factorial',
  'fibonacci',
  'gcd',
  'hanoi',
] as const

export type RecursionAlgorithmId = (typeof RECURSION_ALGORITHM_IDS)[number]

export interface RecursionAlgorithmComplexity {
  readonly time: string
  readonly space: string
}

/**
 * Description of one numeric input of an algorithm. The UI renders a slider
 * for every input, so the range lives together with the algorithm metadata.
 */
export interface RecursionInputConfig {
  readonly label: string
  readonly min: number
  readonly max: number
  readonly step: number
  readonly defaultValue: number
  readonly hint: string
}

export interface RecursionAlgorithmInfo {
  readonly id: RecursionAlgorithmId
  readonly name: string
  readonly ukrainianName: string
  readonly description: string
  /** Recurrence / definition rendered in a monospace block. */
  readonly formula: string
  readonly baseCase: string
  readonly complexity: RecursionAlgorithmComplexity
  readonly primary: RecursionInputConfig
  readonly secondary?: RecursionInputConfig
}

export interface RecursionInput {
  readonly primary: number
  readonly secondary: number
}

export type CallEventType =
  | 'call'
  | 'base'
  | 'move'
  | 'memo'
  | 'guard'
  | 'return'

export type CallNodeStatus =
  | 'pending'
  | 'active'
  | 'base'
  | 'done'
  | 'memo'
  | 'blocked'

/** A single step produced by a recursive algorithm. */
export interface CallTraceEvent {
  readonly type: CallEventType
  readonly id: string
  readonly parentId: string | null
  readonly label: string
  /** 0-based nesting level; the root call has depth 0. */
  readonly depth: number
  readonly args: readonly number[]
  /** Return value for `base`, `memo` and `return` events. */
  readonly value: number | null
  readonly message: string
}

/** One frame of the LIFO call stack at a given moment. */
export interface CallStackEntry {
  readonly id: string
  readonly label: string
  readonly depth: number
  readonly status: CallNodeStatus
}

/**
 * Fully materialised frame of the simulation. Every collection is copied, so
 * frames can be safely kept and replayed in any order.
 */
export interface TraceFrame {
  readonly step: number
  readonly event: CallTraceEvent
  readonly stack: readonly CallStackEntry[]
  readonly nodeStatuses: Readonly<Record<string, CallNodeStatus>>
  readonly nodeValues: Readonly<Record<string, number>>
  readonly maxDepth: number
  readonly totalCalls: number
  readonly completedCalls: number
  readonly moves: number
  readonly message: string
  readonly result: number | null
}

export type CallNodeKind = 'standard' | 'base' | 'memo' | 'blocked'

/** Immutable call-tree node built by `CallTreeTracker`. */
export interface CallTreeNode {
  readonly id: string
  readonly parentId: string | null
  readonly label: string
  readonly depth: number
  readonly args: readonly number[]
  readonly value: number | null
  readonly kind: CallNodeKind
  readonly children: readonly CallTreeNode[]
}

export interface CallTreeLayoutNode {
  readonly node: CallTreeNode
  /** Top-left corner of the node box in SVG coordinates. */
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface CallTreeEdge {
  readonly fromId: string
  readonly toId: string
  readonly x1: number
  readonly y1: number
  readonly x2: number
  readonly y2: number
}

export interface CallTreeLayout {
  readonly nodes: readonly CallTreeLayoutNode[]
  readonly edges: readonly CallTreeEdge[]
  readonly width: number
  readonly height: number
}

export interface TraceResult {
  readonly frames: readonly TraceFrame[]
  readonly tree: CallTreeNode | null
  readonly maxDepth: number
  readonly totalCalls: number
  readonly result: number | null
  readonly moves: number
  readonly depthLimitReached: boolean
}

/* -------------------------------------------------------------------------- */
/* Binary search                                                              */
/* -------------------------------------------------------------------------- */

export type BinarySearchComparison = 'less' | 'greater' | 'equal' | 'none'

/**
 * One frame of a binary-search run.
 *
 * `left` / `right` / `middle` describe the range that was checked in this
 * frame. `nextLeft` / `nextRight` are the boundaries after the comparison —
 * exactly what the next frame starts from.
 */
export interface BinarySearchStep {
  readonly step: number
  readonly left: number
  readonly right: number
  readonly middle: number | null
  readonly middleValue: number | null
  readonly comparison: BinarySearchComparison
  readonly nextLeft: number | null
  readonly nextRight: number | null
  readonly comparisons: number
  readonly remaining: number
  readonly found: boolean
  readonly done: boolean
  readonly message: string
}

export interface BinarySearchCase {
  readonly array: readonly number[]
  readonly target: number
}
