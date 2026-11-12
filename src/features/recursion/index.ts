/**
 * Public facade of the recursion feature.
 *
 * App.tsx should consume only this file:
 *   import { RecursionTree } from './features/recursion'
 */

export { RecursionTree, RecursionTree as RecursionModule } from './ui/RecursionTree'

/* Hooks -------------------------------------------------------------------- */

export {
  DEFAULT_TRACE_SPEED,
  MAX_TRACE_SPEED,
  MIN_TRACE_SPEED,
  useRecursionTracer,
} from './model/useRecursionTracer'
export type {
  UseRecursionTracerOptions,
  UseRecursionTracerResult,
} from './model/useRecursionTracer'

export {
  DEFAULT_BINARY_SEARCH_SPEED,
  MAX_BINARY_SEARCH_SPEED,
  MIN_BINARY_SEARCH_SPEED,
  useBinarySearch,
} from './model/useBinarySearch'
export type {
  UseBinarySearchOptions,
  UseBinarySearchResult,
} from './model/useBinarySearch'

/* Algorithms --------------------------------------------------------------- */

export {
  ALGORITHM_INFO,
  RECURSION_ALGORITHMS,
  TRACE_DEPTH_LIMIT,
  createTrace,
  getDefaultInput,
  normalizeInput,
} from './model/algorithms'

export {
  BINARY_SEARCH_ARRAY_SIZE,
  MAX_BINARY_SEARCH_ARRAY_SIZE,
  MAX_TARGET,
  MIN_BINARY_SEARCH_ARRAY_SIZE,
  MIN_TARGET,
  createBinarySearchCase,
  createBinarySearchSteps,
  createSortedArray,
  pickExistingTarget,
} from './model/binarySearch'

/* Call tree ---------------------------------------------------------------- */

export {
  CallTreeTracker,
  buildCallTree,
  layoutCallTree,
} from './model/callTree'
export type { CallTreeLayoutOptions } from './model/callTree'

export { runTrace } from './model/trace'

/* Domain types ------------------------------------------------------------- */

export { RECURSION_ALGORITHM_IDS } from './model/types'
export type {
  BinarySearchCase,
  BinarySearchComparison,
  BinarySearchStep,
  CallEventType,
  CallNodeKind,
  CallNodeStatus,
  CallStackEntry,
  CallTraceEvent,
  CallTreeEdge,
  CallTreeLayout,
  CallTreeLayoutNode,
  CallTreeNode,
  RecursionAlgorithmComplexity,
  RecursionAlgorithmId,
  RecursionAlgorithmInfo,
  RecursionInput,
  RecursionInputConfig,
  TraceFrame,
  TraceResult,
} from './model/types'
