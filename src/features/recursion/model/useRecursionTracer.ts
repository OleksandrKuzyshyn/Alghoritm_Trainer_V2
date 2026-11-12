import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ALGORITHM_INFO,
  TRACE_DEPTH_LIMIT,
  getDefaultInput,
  normalizeInput,
} from './algorithms'
import { layoutCallTree } from './callTree'
import { runTrace } from './trace'
import type {
  CallStackEntry,
  CallTreeLayout,
  CallTreeNode,
  RecursionAlgorithmId,
  RecursionAlgorithmInfo,
  RecursionInput,
  TraceFrame,
} from './types'

export const MIN_TRACE_SPEED = 1
export const MAX_TRACE_SPEED = 20
export const DEFAULT_TRACE_SPEED = 4

export interface UseRecursionTracerOptions {
  readonly initialAlgorithm?: RecursionAlgorithmId
  readonly initialSpeed?: number
}

export interface UseRecursionTracerResult {
  readonly algorithm: RecursionAlgorithmId
  readonly algorithmInfo: RecursionAlgorithmInfo
  readonly input: RecursionInput
  readonly speed: number

  readonly tree: CallTreeNode | null
  readonly layout: CallTreeLayout | null
  readonly frame: TraceFrame
  readonly callStack: readonly CallStackEntry[]

  readonly currentStep: number
  readonly totalSteps: number
  readonly progress: number
  readonly isPlaying: boolean
  readonly isFinished: boolean
  readonly canStepBackward: boolean
  readonly canStepForward: boolean

  readonly currentDepth: number
  readonly maxDepth: number
  readonly totalCalls: number
  readonly completedCalls: number
  readonly moves: number
  readonly result: number | null
  readonly finalResult: number | null
  readonly depthLimit: number
  readonly depthLimitReached: boolean

  readonly play: () => void
  readonly pause: () => void
  readonly togglePlayback: () => void
  readonly stepForward: () => void
  readonly stepBackward: () => void
  readonly seek: (step: number) => void
  readonly reset: () => void

  readonly setAlgorithm: (algorithm: RecursionAlgorithmId) => void
  readonly setPrimary: (value: number) => void
  readonly setSecondary: (value: number) => void
  readonly setSpeed: (speed: number) => void
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(Math.round(value), minimum), maximum)
}

/**
 * Central state for the recursion lab.
 *
 * The full trace is computed with `useMemo`, so switching an input rebuilds
 * the history exactly once while playback and seeking stay O(1).
 */
export function useRecursionTracer(
  options: UseRecursionTracerOptions = {},
): UseRecursionTracerResult {
  const initialAlgorithm = options.initialAlgorithm ?? 'factorial'

  const [algorithm, setAlgorithmState] =
    useState<RecursionAlgorithmId>(initialAlgorithm)
  const [input, setInput] = useState<RecursionInput>(() =>
    getDefaultInput(initialAlgorithm),
  )
  const [speed, setSpeedState] = useState(() =>
    clamp(options.initialSpeed ?? DEFAULT_TRACE_SPEED, MIN_TRACE_SPEED, MAX_TRACE_SPEED),
  )
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const trace = useMemo(
    () => runTrace(algorithm, input, TRACE_DEPTH_LIMIT),
    [algorithm, input],
  )
  const layout = useMemo(() => layoutCallTree(trace.tree), [trace.tree])

  const lastStep = Math.max(trace.frames.length - 1, 0)
  const safeStep = Math.min(currentStep, lastStep)
  const frame = trace.frames[safeStep]
  const isFinished = safeStep >= lastStep
  const isActivelyPlaying = isPlaying && !isFinished
  const progress = lastStep === 0 ? 1 : safeStep / lastStep

  useEffect(() => {
    if (!isActivelyPlaying) {
      return undefined
    }

    const delay = Math.max(120, Math.round(1000 / speed))
    const timeoutId = window.setTimeout(() => {
      setCurrentStep((step) => Math.min(step + 1, lastStep))
    }, delay)

    return () => window.clearTimeout(timeoutId)
  }, [isActivelyPlaying, lastStep, safeStep, speed])

  const play = useCallback(() => {
    setCurrentStep((step) => (step >= lastStep ? 0 : step))
    setIsPlaying(true)
  }, [lastStep])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const togglePlayback = useCallback(() => {
    if (isActivelyPlaying) {
      setIsPlaying(false)
      return
    }

    setCurrentStep((step) => (step >= lastStep ? 0 : step))
    setIsPlaying(true)
  }, [isActivelyPlaying, lastStep])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep((step) => Math.min(step + 1, lastStep))
  }, [lastStep])

  const stepBackward = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep((step) => Math.max(step - 1, 0))
  }, [])

  const seek = useCallback(
    (step: number) => {
      setIsPlaying(false)
      setCurrentStep(clamp(step, 0, lastStep))
    },
    [lastStep],
  )

  const reset = useCallback(() => {
    setCurrentStep(0)
    setIsPlaying(false)
  }, [])

  const applyInput = useCallback(
    (patch: Partial<RecursionInput>) => {
      setInput((previous) =>
        normalizeInput(algorithm, { ...previous, ...patch }),
      )
      setCurrentStep(0)
      setIsPlaying(false)
    },
    [algorithm],
  )

  const setAlgorithm = useCallback(
    (next: RecursionAlgorithmId) => {
      if (next === algorithm) return

      setAlgorithmState(next)
      setInput(getDefaultInput(next))
      setCurrentStep(0)
      setIsPlaying(false)
    },
    [algorithm],
  )

  const setPrimary = useCallback(
    (value: number) => {
      applyInput({ primary: value })
    },
    [applyInput],
  )

  const setSecondary = useCallback(
    (value: number) => {
      applyInput({ secondary: value })
    },
    [applyInput],
  )

  const setSpeed = useCallback((nextSpeed: number) => {
    setSpeedState(clamp(nextSpeed, MIN_TRACE_SPEED, MAX_TRACE_SPEED))
  }, [])

  return {
    algorithm,
    algorithmInfo: ALGORITHM_INFO[algorithm],
    input,
    speed,

    tree: trace.tree,
    layout,
    frame,
    callStack: frame.stack,

    currentStep: safeStep,
    totalSteps: trace.frames.length,
    progress,
    isPlaying: isActivelyPlaying,
    isFinished,
    canStepBackward: safeStep > 0,
    canStepForward: safeStep < lastStep,

    currentDepth: frame.stack.length,
    maxDepth: trace.maxDepth,
    totalCalls: trace.totalCalls,
    completedCalls: frame.completedCalls,
    moves: frame.moves,
    result: frame.result,
    finalResult: trace.result,
    depthLimit: TRACE_DEPTH_LIMIT,
    depthLimitReached: trace.depthLimitReached,

    play,
    pause,
    togglePlayback,
    stepForward,
    stepBackward,
    seek,
    reset,

    setAlgorithm,
    setPrimary,
    setSecondary,
    setSpeed,
  }
}
