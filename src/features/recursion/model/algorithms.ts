import {
  RECURSION_ALGORITHM_IDS,
  type CallTraceEvent,
  type RecursionAlgorithmId,
  type RecursionAlgorithmInfo,
  type RecursionInput,
} from './types'

/**
 * Hard safety limit for the simulated call stack. The algorithms check it
 * after the base case and before recursing, so a bad input can never freeze
 * the UI with thousands of frames.
 */
export const TRACE_DEPTH_LIMIT = 24

export const ALGORITHM_INFO: Record<RecursionAlgorithmId, RecursionAlgorithmInfo> = {
  factorial: {
    id: 'factorial',
    name: 'Factorial',
    ukrainianName: 'Факторіал',
    description:
      'Множить число на факторіал попереднього числа, доки не дійде до базового випадку 0! = 1.',
    formula: 'n! = n × (n − 1)!',
    baseCase: 'n ≤ 1 → 1',
    complexity: { time: 'O(n)', space: 'O(n)' },
    primary: {
      label: 'n',
      min: 0,
      max: 12,
      step: 1,
      defaultValue: 5,
      hint: 'Кожен виклик додає один кадр у стек.',
    },
  },
  fibonacci: {
    id: 'fibonacci',
    name: 'Fibonacci',
    ukrainianName: 'Числа Фібоначчі',
    description:
      'Обчислює F(n) = F(n−1) + F(n−2). Мемоізація зберігає вже знайдені значення й прибирає повторні гілки.',
    formula: 'F(n) = F(n − 1) + F(n − 2)',
    baseCase: 'n ≤ 1 → n',
    complexity: { time: 'O(n) з мемо', space: 'O(n)' },
    primary: {
      label: 'n',
      min: 0,
      max: 18,
      step: 1,
      defaultValue: 7,
      hint: 'Повторні виклики позначаються як «мемо» і не заглиблюються.',
    },
  },
  gcd: {
    id: 'gcd',
    name: 'GCD',
    ukrainianName: 'НСД (алгоритм Евкліда)',
    description:
      'Замінює пару (a, b) парою (b, a mod b), доки друге число не стане нулем.',
    formula: 'gcd(a, b) = gcd(b, a mod b)',
    baseCase: 'b = 0 → a',
    complexity: { time: 'O(log min(a, b))', space: 'O(log min(a, b))' },
    primary: {
      label: 'a',
      min: 0,
      max: 240,
      step: 1,
      defaultValue: 48,
      hint: 'Перше число пари.',
    },
    secondary: {
      label: 'b',
      min: 1,
      max: 240,
      step: 1,
      defaultValue: 18,
      hint: 'Друге число пари; на нулі рекурсія зупиняється.',
    },
  },
  hanoi: {
    id: 'hanoi',
    name: 'Tower of Hanoi',
    ukrainianName: 'Ханойська вежа',
    description:
      'Переносить вежу з одного стрижня на інший через допоміжний. Кожен виклик відповідає за підзадачу з меншою кількістю дисків.',
    formula: 'T(n) = 2 · T(n − 1) + 1',
    baseCase: 'n = 1 → один диск',
    complexity: { time: 'O(2ⁿ)', space: 'O(n)' },
    primary: {
      label: 'Диски',
      min: 1,
      max: 5,
      step: 1,
      defaultValue: 3,
      hint: 'Для n дисків виконується 2ⁿ − 1 переміщень.',
    },
  },
}

function roundClamp(
  value: number,
  minimum: number,
  maximum: number,
  fallback: number,
): number {
  const normalized = Number.isFinite(value) ? Math.round(value) : fallback
  return Math.min(Math.max(normalized, minimum), maximum)
}

export function getDefaultInput(algorithm: RecursionAlgorithmId): RecursionInput {
  const info = ALGORITHM_INFO[algorithm]

  return {
    primary: info.primary.defaultValue,
    secondary: info.secondary?.defaultValue ?? 0,
  }
}

/** Clamps every field into the range declared by the algorithm metadata. */
export function normalizeInput(
  algorithm: RecursionAlgorithmId,
  input: RecursionInput,
): RecursionInput {
  const info = ALGORITHM_INFO[algorithm]

  return {
    primary: roundClamp(
      input.primary,
      info.primary.min,
      info.primary.max,
      info.primary.defaultValue,
    ),
    secondary: info.secondary
      ? roundClamp(
          input.secondary,
          info.secondary.min,
          info.secondary.max,
          info.secondary.defaultValue,
        )
      : 0,
  }
}

/* -------------------------------------------------------------------------- */
/* Event factories                                                            */
/* -------------------------------------------------------------------------- */

interface TraceContext {
  readonly depthLimit: number
  nextId: () => string
}

function createContext(depthLimit: number): TraceContext {
  let counter = 0

  return {
    depthLimit,
    nextId: () => {
      counter += 1
      return `call-${counter}`
    },
  }
}

function callEvent(
  id: string,
  parentId: string | null,
  label: string,
  depth: number,
  args: readonly number[],
  message: string,
): CallTraceEvent {
  return {
    type: 'call',
    id,
    parentId,
    label,
    depth,
    args: [...args],
    value: null,
    message,
  }
}

function baseEvent(
  id: string,
  parentId: string | null,
  label: string,
  depth: number,
  args: readonly number[],
  value: number,
  message: string,
): CallTraceEvent {
  return {
    type: 'base',
    id,
    parentId,
    label,
    depth,
    args: [...args],
    value,
    message,
  }
}

function returnEvent(
  id: string,
  parentId: string | null,
  label: string,
  depth: number,
  args: readonly number[],
  value: number,
  message: string,
): CallTraceEvent {
  return {
    type: 'return',
    id,
    parentId,
    label,
    depth,
    args: [...args],
    value,
    message,
  }
}

function memoEvent(
  id: string,
  parentId: string | null,
  label: string,
  depth: number,
  args: readonly number[],
  value: number,
  message: string,
): CallTraceEvent {
  return {
    type: 'memo',
    id,
    parentId,
    label,
    depth,
    args: [...args],
    value,
    message,
  }
}

function guardEvent(
  id: string,
  parentId: string | null,
  label: string,
  depth: number,
  args: readonly number[],
  message: string,
): CallTraceEvent {
  return {
    type: 'guard',
    id,
    parentId,
    label,
    depth,
    args: [...args],
    value: null,
    message,
  }
}

function moveEvent(
  id: string,
  parentId: string | null,
  label: string,
  depth: number,
  args: readonly number[],
  message: string,
): CallTraceEvent {
  return {
    type: 'move',
    id,
    parentId,
    label,
    depth,
    args: [...args],
    value: null,
    message,
  }
}

/* -------------------------------------------------------------------------- */
/* Algorithms                                                                 */
/* -------------------------------------------------------------------------- */

type TraceGenerator = Generator<CallTraceEvent, number, void>

function* factorialTrace(
  n: number,
  parentId: string | null,
  depth: number,
  context: TraceContext,
): TraceGenerator {
  const id = context.nextId()
  const label = `factorial(${n})`
  const args = [n]

  yield callEvent(id, parentId, label, depth, args, `Виклик ${label}`)

  if (n <= 1) {
    yield baseEvent(id, parentId, label, depth, args, 1, `Базовий випадок: ${n}! = 1`)
    yield returnEvent(id, parentId, label, depth, args, 1, `${label} повертає 1`)
    return 1
  }

  if (depth >= context.depthLimit) {
    yield guardEvent(
      id,
      parentId,
      label,
      depth,
      args,
      `Перевищено ліміт глибини (${context.depthLimit}) — рекурсію зупинено`,
    )
    return 0
  }

  const child = yield* factorialTrace(n - 1, id, depth + 1, context)
  const value = n * child

  yield returnEvent(
    id,
    parentId,
    label,
    depth,
    args,
    value,
    `${n} × ${child} = ${value} → повертаємо ${value}`,
  )

  return value
}

function* fibonacciTrace(
  n: number,
  parentId: string | null,
  depth: number,
  context: TraceContext,
  memo: Map<number, number>,
): TraceGenerator {
  const id = context.nextId()
  const label = `fib(${n})`
  const args = [n]

  yield callEvent(id, parentId, label, depth, args, `Виклик ${label}`)

  const cached = memo.get(n)
  if (cached !== undefined) {
    yield memoEvent(
      id,
      parentId,
      label,
      depth,
      args,
      cached,
      `F(${n}) вже в мемо → ${cached}`,
    )
    return cached
  }

  if (n <= 1) {
    memo.set(n, n)
    yield baseEvent(id, parentId, label, depth, args, n, `Базовий випадок: F(${n}) = ${n}`)
    yield returnEvent(id, parentId, label, depth, args, n, `${label} повертає ${n}`)
    return n
  }

  if (depth >= context.depthLimit) {
    yield guardEvent(
      id,
      parentId,
      label,
      depth,
      args,
      `Перевищено ліміт глибини (${context.depthLimit}) — рекурсію зупинено`,
    )
    return 0
  }

  const first = yield* fibonacciTrace(n - 1, id, depth + 1, context, memo)
  const second = yield* fibonacciTrace(n - 2, id, depth + 1, context, memo)
  const value = first + second

  memo.set(n, value)
  yield returnEvent(
    id,
    parentId,
    label,
    depth,
    args,
    value,
    `${first} + ${second} = ${value} → повертаємо ${value}`,
  )

  return value
}

function* gcdTrace(
  a: number,
  b: number,
  parentId: string | null,
  depth: number,
  context: TraceContext,
): TraceGenerator {
  const id = context.nextId()
  const label = `gcd(${a}, ${b})`
  const args = [a, b]

  yield callEvent(id, parentId, label, depth, args, `Виклик ${label}`)

  if (b === 0) {
    yield baseEvent(
      id,
      parentId,
      label,
      depth,
      args,
      a,
      `Базовий випадок: gcd(${a}, 0) = ${a}`,
    )
    yield returnEvent(id, parentId, label, depth, args, a, `${label} повертає ${a}`)
    return a
  }

  if (depth >= context.depthLimit) {
    yield guardEvent(
      id,
      parentId,
      label,
      depth,
      args,
      `Перевищено ліміт глибини (${context.depthLimit}) — рекурсію зупинено`,
    )
    return 0
  }

  const value = yield* gcdTrace(b, a % b, id, depth + 1, context)

  yield returnEvent(
    id,
    parentId,
    label,
    depth,
    args,
    value,
    `gcd(${b}, ${a % b}) = ${value} → повертаємо ${value}`,
  )

  return value
}

type Peg = 'A' | 'B' | 'C'

function* hanoiTrace(
  disks: number,
  from: Peg,
  to: Peg,
  auxiliary: Peg,
  parentId: string | null,
  depth: number,
  context: TraceContext,
): TraceGenerator {
  const id = context.nextId()
  const label = `hanoi(${disks}, ${from}→${to})`
  const args = [disks]

  yield callEvent(
    id,
    parentId,
    label,
    depth,
    args,
    `Виклик ${label}: перенести ${disks} диск(ів) з ${from} на ${to}`,
  )

  if (disks <= 1) {
    yield baseEvent(
      id,
      parentId,
      label,
      depth,
      args,
      1,
      `Базовий випадок: один диск — переносимо напряму`,
    )
    yield moveEvent(id, parentId, label, depth, args, `Диск 1: ${from} → ${to}`)
    yield returnEvent(id, parentId, label, depth, args, 1, `${label} повертає 1 переміщення`)
    return 1
  }

  if (depth >= context.depthLimit) {
    yield guardEvent(
      id,
      parentId,
      label,
      depth,
      args,
      `Перевищено ліміт глибини (${context.depthLimit}) — рекурсію зупинено`,
    )
    return 0
  }

  const leftMoves = yield* hanoiTrace(
    disks - 1,
    from,
    auxiliary,
    to,
    id,
    depth + 1,
    context,
  )

  yield moveEvent(
    id,
    parentId,
    label,
    depth,
    args,
    `Диск ${disks}: ${from} → ${to}`,
  )

  const rightMoves = yield* hanoiTrace(
    disks - 1,
    auxiliary,
    to,
    from,
    id,
    depth + 1,
    context,
  )

  const total = leftMoves + 1 + rightMoves

  yield returnEvent(
    id,
    parentId,
    label,
    depth,
    args,
    total,
    `${leftMoves} + 1 + ${rightMoves} = ${total} → повертаємо ${total}`,
  )

  return total
}

export function* createTrace(
  algorithm: RecursionAlgorithmId,
  input: RecursionInput,
  depthLimit: number = TRACE_DEPTH_LIMIT,
): Generator<CallTraceEvent, void, void> {
  const context = createContext(depthLimit)
  const normalized = normalizeInput(algorithm, input)

  switch (algorithm) {
    case 'factorial': {
      yield* factorialTrace(normalized.primary, null, 0, context)
      return
    }
    case 'fibonacci': {
      yield* fibonacciTrace(normalized.primary, null, 0, context, new Map())
      return
    }
    case 'gcd': {
      yield* gcdTrace(normalized.primary, normalized.secondary, null, 0, context)
      return
    }
    case 'hanoi': {
      yield* hanoiTrace(
        normalized.primary,
        'A',
        'C',
        'B',
        null,
        0,
        context,
      )
    }
  }
}

export const RECURSION_ALGORITHMS: readonly RecursionAlgorithmInfo[] =
  RECURSION_ALGORITHM_IDS.map((id) => ALGORITHM_INFO[id])
