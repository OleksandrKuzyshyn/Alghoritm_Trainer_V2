import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  MAX_TARGET,
  MIN_TARGET,
  createBinarySearchCase,
  createBinarySearchSteps,
  pickExistingTarget,
} from './binarySearch'
import type {
  BinarySearchCase,
  BinarySearchStep,
} from './types'

export const MIN_BINARY_SEARCH_SPEED = 1
export const MAX_BINARY_SEARCH_SPEED = 8
export const DEFAULT_BINARY_SEARCH_SPEED = 2

export interface UseBinarySearchOptions {
  readonly initialSpeed?: number
  readonly initialArraySize?: number
}

export interface UseBinarySearchResult {
  readonly array: readonly number[]
  readonly target: number
  readonly step: BinarySearchStep

  readonly currentStep: number
  readonly totalSteps: number
  readonly progress: number
  readonly isPlaying: boolean
  readonly isFinished: boolean
  readonly canStepBackward: boolean
  readonly canStepForward: boolean
  readonly speed: number

  readonly found: boolean
  readonly foundIndex: number | null
  readonly comparisons: number
  readonly remaining: number
  readonly targetExists: boolean
  readonly maxSteps: number

  readonly play: () => void
  readonly pause: () => void
  readonly togglePlayback: () => void
  readonly stepForward: () => void
  readonly stepBackward: () => void
  readonly seek: (step: number) => void
  readonly reset: () => void

  readonly setTarget: (target: number) => void
  readonly generateArray: () => void
  readonly chooseExistingTarget: () => void
  readonly setSpeed: (speed: number) => void
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(Math.round(value), minimum), maximum)
}

function clampTarget(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return clamp(value, MIN_TARGET, MAX_TARGET)
}

/**
 * Dedicated engine for the binary-search visualiser.
 *
 * It exposes the complete pointer state (`left`, `right`, `middle`), the
 * latest comparison, updated boundaries and the final found/not-found flags.
 */
export function useBinarySearch(
  options: UseBinarySearchOptions = {},
): UseBinarySearchResult {
  const [searchCase, setSearchCase] = useState<BinarySearchCase>(() =>
    createBinarySearchCase(options.initialArraySize),
  )
  const [speed, setSpeedState] = useState(() =>
    clamp(
      options.initialSpeed ?? DEFAULT_BINARY_SEARCH_SPEED,
      MIN_BINARY_SEARCH_SPEED,
      MAX_BINARY_SEARCH_SPEED,
    ),
  )
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const steps = useMemo(
    () => createBinarySearchSteps(searchCase.array, searchCase.target),
    [searchCase],
  )

  const lastStep = Math.max(steps.length - 1, 0)
  const safeStep = Math.min(currentStep, lastStep)
  const step = steps[safeStep]
  const isFinished = safeStep >= lastStep
  const isActivelyPlaying = isPlaying && !isFinished
  const progress = lastStep === 0 ? 1 : safeStep / lastStep
  const maxSteps = Math.max(
    1,
    Math.ceil(Math.log2(searchCase.array.length + 1)),
  )

  useEffect(() => {
    if (!isActivelyPlaying) {
      return undefined
    }

    const delay = Math.max(150, Math.round(1000 / speed))
    const timeoutId = window.setTimeout(() => {
      setCurrentStep((value) => Math.min(value + 1, lastStep))
    }, delay)

    return () => window.clearTimeout(timeoutId)
  }, [isActivelyPlaying, lastStep, safeStep, speed])

  const play = useCallback(() => {
    setCurrentStep((value) => (value >= lastStep ? 0 : value))
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

    setCurrentStep((value) => (value >= lastStep ? 0 : value))
    setIsPlaying(true)
  }, [isActivelyPlaying, lastStep])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep((value) => Math.min(value + 1, lastStep))
  }, [lastStep])

  const stepBackward = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep((value) => Math.max(value - 1, 0))
  }, [])

  const seek = useCallback(
    (value: number) => {
      setIsPlaying(false)
      setCurrentStep(clamp(value, 0, lastStep))
    },
    [lastStep],
  )

  const reset = useCallback(() => {
    setCurrentStep(0)
    setIsPlaying(false)
  }, [])

  const setTarget = useCallback((target: number) => {
    setSearchCase((current) => ({
      array: current.array,
      target: clampTarget(target, current.target),
    }))
    setCurrentStep(0)
    setIsPlaying(false)
  }, [])

  const generateArray = useCallback(() => {
    setSearchCase(createBinarySearchCase(options.initialArraySize))
    setCurrentStep(0)
    setIsPlaying(false)
  }, [options.initialArraySize])

  const chooseExistingTarget = useCallback(() => {
    setSearchCase((current) => ({
      array: current.array,
      target: pickExistingTarget(current.array),
    }))
    setCurrentStep(0)
    setIsPlaying(false)
  }, [])

  const setSpeed = useCallback((nextSpeed: number) => {
    setSpeedState(
      clamp(nextSpeed, MIN_BINARY_SEARCH_SPEED, MAX_BINARY_SEARCH_SPEED),
    )
  }, [])

  return {
    array: searchCase.array,
    target: searchCase.target,
    step,

    currentStep: safeStep,
    totalSteps: steps.length,
    progress,
    isPlaying: isActivelyPlaying,
    isFinished,
    canStepBackward: safeStep > 0,
    canStepForward: safeStep < lastStep,
    speed,

    found: step.found,
    foundIndex: step.found ? step.middle : null,
    comparisons: step.comparisons,
    remaining: step.remaining,
    targetExists: searchCase.array.includes(searchCase.target),
    maxSteps,

    play,
    pause,
    togglePlayback,
    stepForward,
    stepBackward,
    seek,
    reset,

    setTarget,
    generateArray,
    chooseExistingTarget,
    setSpeed,
  }
}
