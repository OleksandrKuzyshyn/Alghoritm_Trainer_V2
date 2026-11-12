import type {
  BinarySearchCase,
  BinarySearchStep,
} from './types'

export const BINARY_SEARCH_ARRAY_SIZE = 14
export const MIN_BINARY_SEARCH_ARRAY_SIZE = 6
export const MAX_BINARY_SEARCH_ARRAY_SIZE = 20

export const MIN_TARGET = 1
export const MAX_TARGET = 99

const MIN_VALUE = 1
const MAX_VALUE = 99

function randomInt(minimum: number, maximum: number): number {
  return minimum + Math.floor(Math.random() * (maximum - minimum + 1))
}

/** Builds a sorted array of unique values, as binary search requires. */
export function createSortedArray(
  size: number = BINARY_SEARCH_ARRAY_SIZE,
): number[] {
  const targetSize = Math.min(
    Math.max(Math.round(size), MIN_BINARY_SEARCH_ARRAY_SIZE),
    MAX_BINARY_SEARCH_ARRAY_SIZE,
  )
  const values = new Set<number>()

  while (values.size < targetSize) {
    values.add(randomInt(MIN_VALUE, MAX_VALUE))
  }

  return [...values].sort((left, right) => left - right)
}

export function createBinarySearchCase(
  size: number = BINARY_SEARCH_ARRAY_SIZE,
): BinarySearchCase {
  const array = createSortedArray(size)
  const target = array[randomInt(0, array.length - 1)] ?? MIN_TARGET

  return { array, target }
}

export function pickExistingTarget(array: readonly number[]): number {
  if (array.length === 0) return MIN_TARGET
  return array[randomInt(0, array.length - 1)]
}

/**
 * Produces a complete, immutable history of a binary-search run.
 *
 * Each comparison frame stores the boundaries that were checked *and* the
 * boundaries that will be used next, so the UI can show exactly what changed.
 */
export function createBinarySearchSteps(
  values: readonly number[],
  target: number,
): BinarySearchStep[] {
  const steps: BinarySearchStep[] = []
  let left = 0
  let right = values.length - 1
  let comparisons = 0

  steps.push({
    step: 0,
    left,
    right,
    middle: null,
    middleValue: null,
    comparison: 'none',
    nextLeft: null,
    nextRight: null,
    comparisons,
    remaining: values.length,
    found: false,
    done: false,
    message:
      values.length === 0
        ? 'Масив порожній — пошук неможливий'
        : `Шукаємо ${target} у діапазоні [${left}…${right}]`,
  })

  if (values.length === 0) {
    steps[0] = {
      ...steps[0],
      done: true,
      message: 'Масив порожній — пошук неможливий',
    }
    return steps
  }

  let guard = 0

  while (left <= right && guard <= values.length + 1) {
    guard += 1

    const middle = Math.floor((left + right) / 2)
    const middleValue = values[middle]
    comparisons += 1

    if (middleValue === target) {
      steps.push({
        step: steps.length,
        left,
        right,
        middle,
        middleValue,
        comparison: 'equal',
        nextLeft: null,
        nextRight: null,
        comparisons,
        remaining: 1,
        found: true,
        done: true,
        message: `A[${middle}] = ${middleValue} — ціль знайдено`,
      })
      return steps
    }

    if (middleValue < target) {
      const nextLeft = middle + 1

      steps.push({
        step: steps.length,
        left,
        right,
        middle,
        middleValue,
        comparison: 'less',
        nextLeft,
        nextRight: right,
        comparisons,
        remaining: Math.max(right - nextLeft + 1, 0),
        found: false,
        done: false,
        message: `${middleValue} < ${target} → ліву половину відкинуто`,
      })

      left = nextLeft
    } else {
      const nextRight = middle - 1

      steps.push({
        step: steps.length,
        left,
        right,
        middle,
        middleValue,
        comparison: 'greater',
        nextLeft: left,
        nextRight: nextRight,
        comparisons,
        remaining: Math.max(nextRight - left + 1, 0),
        found: false,
        done: false,
        message: `${middleValue} > ${target} → праву половину відкинуто`,
      })

      right = nextRight
    }
  }

  steps.push({
    step: steps.length,
    left,
    right,
    middle: null,
    middleValue: null,
    comparison: 'none',
    nextLeft: null,
    nextRight: null,
    comparisons,
    remaining: 0,
    found: false,
    done: true,
    message: `Діапазон порожній — ${target} відсутня в масиві`,
  })

  return steps
}
