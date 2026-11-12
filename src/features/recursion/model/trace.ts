import { TRACE_DEPTH_LIMIT, createTrace } from './algorithms'
import { CallTreeTracker } from './callTree'
import type {
  CallNodeStatus,
  CallStackEntry,
  CallTraceEvent,
  RecursionAlgorithmId,
  RecursionInput,
  TraceFrame,
  TraceResult,
} from './types'

function removeFromStack(stack: CallStackEntry[], id: string): void {
  const index = stack.findIndex((entry) => entry.id === id)
  if (index >= 0) {
    stack.splice(index, 1)
  }
}

/**
 * Runs one recursive algorithm and materialises every event as an immutable
 * playback frame.
 *
 * Because the whole history is built upfront, the hook can step backwards,
 * scrub the timeline and jump to the end without recomputing anything.
 */
export function runTrace(
  algorithm: RecursionAlgorithmId,
  input: RecursionInput,
  depthLimit: number = TRACE_DEPTH_LIMIT,
): TraceResult {
  const tracker = new CallTreeTracker()
  const frames: TraceFrame[] = []

  const statuses: Record<string, CallNodeStatus> = {}
  const values: Record<string, number> = {}
  const stack: CallStackEntry[] = []

  let totalCalls = 0
  let completedCalls = 0
  let maxDepth = 0
  let moves = 0
  let result: number | null = null
  let depthLimitReached = false
  let step = 0

  for (const event of createTrace(algorithm, input, depthLimit)) {
    tracker.track(event)

    switch (event.type) {
      case 'call': {
        totalCalls += 1
        statuses[event.id] = 'active'
        stack.push({
          id: event.id,
          label: event.label,
          depth: event.depth,
          status: 'active',
        })
        maxDepth = Math.max(maxDepth, stack.length)
        break
      }
      case 'base': {
        statuses[event.id] = 'base'
        if (event.value !== null) {
          values[event.id] = event.value
        }
        break
      }
      case 'move': {
        moves += 1
        break
      }
      case 'memo': {
        statuses[event.id] = 'memo'
        if (event.value !== null) {
          values[event.id] = event.value
          result = event.value
        }
        removeFromStack(stack, event.id)
        completedCalls += 1
        break
      }
      case 'guard': {
        statuses[event.id] = 'blocked'
        removeFromStack(stack, event.id)
        completedCalls += 1
        depthLimitReached = true
        break
      }
      case 'return': {
        statuses[event.id] = 'done'
        if (event.value !== null) {
          values[event.id] = event.value
          result = event.value
        }
        removeFromStack(stack, event.id)
        completedCalls += 1
        break
      }
    }

    frames.push({
      step,
      event,
      stack: stack.map((entry) => ({
        ...entry,
        status: statuses[entry.id] ?? entry.status,
      })),
      nodeStatuses: { ...statuses },
      nodeValues: { ...values },
      maxDepth,
      totalCalls,
      completedCalls,
      moves,
      message: event.message,
      result,
    })

    step += 1
  }

  // Defensive fallback: every algorithm emits at least a call and a base
  // case, but the UI must never receive an empty history.
  if (frames.length === 0) {
    const fallback: CallTraceEvent = {
      type: 'guard',
      id: 'empty-trace',
      parentId: null,
      label: 'empty',
      depth: 0,
      args: [],
      value: null,
      message: 'Не вдалося побудувати трасування викликів',
    }

    frames.push({
      step: 0,
      event: fallback,
      stack: [],
      nodeStatuses: { 'empty-trace': 'blocked' },
      nodeValues: {},
      maxDepth: 0,
      totalCalls: 0,
      completedCalls: 0,
      moves: 0,
      message: fallback.message,
      result: null,
    })
  }

  return {
    frames,
    tree: tracker.build(),
    maxDepth,
    totalCalls,
    result,
    moves,
    depthLimitReached,
  }
}
