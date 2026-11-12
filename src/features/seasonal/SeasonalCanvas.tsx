import { useEffect, useRef } from 'react'
import type { SeasonId } from './useSeasonManager'

/**
 * Seasonal ambience canvas.
 *
 * All simulation state lives inside `SeasonalEngine`. The React component only
 * mounts/unmounts the engine and forwards prop changes, so the animation loop
 * never causes a React render.
 */

export interface SeasonalCanvasProps {
  activeSeason: SeasonId | 'off'
  activeTab: string
  theme: string
}

/**
 * Snow may only settle on interactive controls inside the work area and on
 * explicitly opted-in surfaces. Header navigation/theme/season controls are
 * intentionally excluded — the weather canvas sits *behind* the header.
 */
const TARGET_SELECTOR =
  'main button:not([data-no-snow]), main [data-snow-surface="true"]'

/** Normal UI controls must keep working — never throw snow at these. */
const INTERACTIVE_CLICK_SELECTOR =
  'button, a, input, select, label, [role="button"]'

const SNOW_INSET = 14
const SNOW_CAP = 16
const SNOW_COLUMN_WIDTH = 5
// Denser seasonal actor pools (snow/fireflies +30%, leaves +30% again).
const MAX_SNOWFLAKES = 98
const MAX_PETALS = 40
const MAX_FIREFLIES = 50
const MAX_LEAVES = 77
const MAX_PROJECTILES = 12

const SNOWBALL_MAX_RADIUS = 16
const SNOWBALL_GRAVITY = 0.32
const SNOWBALL_MIN_LAUNCH_RADIUS = 5

const FIREFLY_REPULSION_RADIUS = 85
const FIREFLY_PERCH_INSET = 16
const AUTUMN_VORTEX_RADIUS = 110
const LEAF_AIR_DRAG = 1.32
const LEAF_GRAVITY = 46

/** First/last share of the heightmap that tapers smoothly to zero. */
const SNOW_EDGE_TAPER = 0.22

const TREE_MARGIN_WIDTH = 220
const TREE_MIN_VIEWPORT = 1280
const TREE_FADE_RANGE = 240
const TREE_MAX_ALPHA = 0.16
const TREE_BRANCH_SURFACES = 4

const TAU = Math.PI * 2
const RESCAN_DEBOUNCE_MS = 200

const PETAL_COLORS = ['#fbcfe8', '#f9a8d4', '#fde68a'] as const
const FIREFLY_COLORS = ['#bef264', '#facc15'] as const
const LEAF_COLORS = ['#f59e0b', '#ea580c', '#dc2626', '#d97706'] as const

type FireflyState = 'wander' | 'perch'

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}

function random(minimum: number, maximum: number): number {
  return minimum + Math.random() * (maximum - minimum)
}

/** Deterministic PRNG so cached trees keep their shape between redraws. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function withAlpha(hex: string, alpha: number): string {
  const value = Number.parseInt(hex.replace('#', ''), 16)
  const red = (value >> 16) & 255
  const green = (value >> 8) & 255
  const blue = value & 255
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

interface SnowTarget {
  /** `null` for virtual tree-branch surfaces. */
  element: HTMLElement | null
  left: number
  top: number
  right: number
  bottom: number
  snowLeft: number
  snowRight: number
  cols: number
  snow: Float32Array
  /** Tree branches are cached scenery, not DOM controls. */
  virtual: boolean
}

/** Horizontal branch surface used by summer fireflies as a perch target. */
interface VirtualBranchSurface extends SnowTarget {
  virtual: true
}

interface TreeBranchSegment {
  x1: number
  y1: number
  x2: number
  y2: number
  width: number
}

interface TreeCanopyCluster {
  x: number
  y: number
  radius: number
  seed: number
}

interface TreeFork {
  x: number
  y: number
}

interface TreeLayout {
  segments: TreeBranchSegment[]
  clusters: TreeCanopyCluster[]
  forks: TreeFork[]
}

interface CanopyPoint {
  x: number
  y: number
}

interface Snowflake {
  x: number
  y: number
  size: number
  speed: number
  drift: number
  phase: number
  sway: number
}

interface Snowball {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  age: number
}

interface SplashParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
}

interface Petal {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  spin: number
  phase: number
  flutter: number
  sway: number
  color: string
}

interface Firefly {
  x: number
  y: number
  vx: number
  vy: number
  phase: number
  pulseSpeed: number
  size: number
  color: string
  state: FireflyState
  nextPerchAt: number
  perchUntil: number
  perchX: number
  perchY: number
  perchElement: HTMLElement | null
}

interface AutumnLeaf {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  phase: number
  spin: number
  spinBase: number
  sway: number
  swayPhase: number
  color: string
}

interface Streamline {
  yRatio: number
  amplitude: number
  phase: number
  speed: number
  width: number
  color: string
}

class SeasonalEngine {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly season: SeasonId | 'off'
  private theme: string

  private width = 1
  private height = 1
  private dpr = 1
  private running = false
  private destroyed = false
  private rafId = 0
  private lastTime = 0
  private elapsed = 0
  private rescanTimer = 0
  private headerBottomY = 0

  private targets: SnowTarget[] = []
  private treeSurfaces: VirtualBranchSurface[] = []
  private flakes: Snowflake[] = []
  private projectiles: Snowball[] = []
  private splashes: SplashParticle[] = []
  private petals: Petal[] = []
  private fireflies: Firefly[] = []
  private leaves: AutumnLeaf[] = []
  private streamlines: Streamline[] = []
  private readonly glowSprites = new Map<string, HTMLCanvasElement>()

  /**
   * Static trees are rasterised once per season/theme/viewport change and
   * copied into the main canvas with a single `drawImage` per frame.
   */
  private treeCanvas: HTMLCanvasElement | null = null
  private treeAlpha = 0
  private treeCanopyPoints: CanopyPoint[] = []

  private readonly cursor = {
    x: -200,
    y: -200,
    vx: 0,
    vy: 0,
    radius: 0,
    targetRadius: 0,
    lastEvent: 0,
    moved: false,
  }

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    season: SeasonId | 'off',
    theme: string,
  ) {
    this.canvas = canvas
    this.ctx = ctx
    this.season = season
    this.theme = theme
  }

  mount(): void {
    this.resize()
    this.seedSeasonalActors()
    this.scanTargets(false)

    window.addEventListener('mousemove', this.onMouseMove, { passive: true })
    window.addEventListener('mousedown', this.onMouseDown)
    window.addEventListener('resize', this.onResize)
    window.addEventListener('scroll', this.onScroll, {
      passive: true,
      capture: true,
    })
    document.addEventListener('visibilitychange', this.onVisibilityChange)

    if (this.season === 'off') {
      this.clear()
      return
    }

    this.start()
  }

  destroy(): void {
    if (this.destroyed) return
    this.destroyed = true
    this.stop()

    if (this.rescanTimer) {
      window.clearTimeout(this.rescanTimer)
      this.rescanTimer = 0
    }

    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('mousedown', this.onMouseDown)
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('scroll', this.onScroll, true)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)

    this.clear()
  }

  /** Called when `activeTab` changes: DOM controls moved. */
  refreshTargets(): void {
    if (this.season === 'off' || this.destroyed) return
    this.scanTargets(true)
  }

  /** Theme changes invalidate the cached tree artwork (not the actors). */
  setTheme(theme: string): void {
    if (this.destroyed || theme === this.theme) return
    this.theme = theme
    this.rebuildTreeLayer()
    if (this.season !== 'off') this.scanTargets(true)
  }

  private start(): void {
    if (
      this.running ||
      this.destroyed ||
      this.season === 'off' ||
      document.hidden
    ) {
      return
    }
    this.running = true
    this.lastTime = 0
    this.rafId = window.requestAnimationFrame(this.onFrame)
  }

  private stop(): void {
    this.running = false
    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId)
      this.rafId = 0
    }
  }

  private readonly onVisibilityChange = (): void => {
    if (this.destroyed || this.season === 'off') return

    if (document.hidden) {
      this.stop()
    } else {
      this.start()
    }
  }

  private readonly onResize = (): void => {
    this.resize()
    this.scheduleRescan()
  }

  private readonly onScroll = (): void => {
    this.scheduleRescan()
  }

  private scheduleRescan(): void {
    if (this.rescanTimer) window.clearTimeout(this.rescanTimer)
    this.rescanTimer = window.setTimeout(() => {
      this.rescanTimer = 0
      this.scanTargets(true)
    }, RESCAN_DEBOUNCE_MS)
  }

  private resize(): void {
    this.width = Math.max(1, window.innerWidth)
    this.height = Math.max(1, window.innerHeight)
    this.dpr = Math.min(2, window.devicePixelRatio || 1)

    this.canvas.width = Math.round(this.width * this.dpr)
    this.canvas.height = Math.round(this.height * this.dpr)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.ctx.imageSmoothingEnabled = true
    this.measureHeader()
    this.rebuildTreeLayer()
    this.clear()
  }

  private measureHeader(): void {
    this.headerBottomY =
      document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  /* ---------------------------------------------------------------------- */
  /* Seed / actors                                                           */
  /* ---------------------------------------------------------------------- */

  private seedSeasonalActors(): void {
    if (this.season === 'winter') {
      this.flakes = Array.from({ length: MAX_SNOWFLAKES }, () =>
        this.createSnowflake(),
      )
      return
    }

    if (this.season === 'spring') {
      this.streamlines = [
        {
          yRatio: 0.14,
          amplitude: 44,
          phase: 0.2,
          speed: 0.55,
          width: 1.6,
          color: 'rgba(251, 191, 36, 0.16)',
        },
        {
          yRatio: 0.32,
          amplitude: 34,
          phase: 1.7,
          speed: 0.72,
          width: 2.1,
          color: 'rgba(244, 114, 182, 0.18)',
        },
        {
          yRatio: 0.5,
          amplitude: 52,
          phase: 3.1,
          speed: 0.62,
          width: 1.4,
          color: 'rgba(251, 191, 36, 0.16)',
        },
        {
          yRatio: 0.69,
          amplitude: 38,
          phase: 4.6,
          speed: 0.84,
          width: 2.4,
          color: 'rgba(244, 114, 182, 0.18)',
        },
        {
          yRatio: 0.86,
          amplitude: 46,
          phase: 5.8,
          speed: 0.5,
          width: 1.8,
          color: 'rgba(251, 191, 36, 0.16)',
        },
      ]

      this.petals = Array.from({ length: MAX_PETALS }, () =>
        this.createPetal(),
      )
      return
    }

    if (this.season === 'summer') {
      this.fireflies = Array.from({ length: MAX_FIREFLIES }, () =>
        this.createFirefly(),
      )
      return
    }

    if (this.season === 'autumn') {
      this.leaves = Array.from({ length: MAX_LEAVES }, () =>
        this.createLeaf(),
      )
    }
  }

  private createSnowflake(): Snowflake {
    return {
      x: random(-20, this.width + 20),
      y: random(-this.height * 0.35, this.height),
      size: random(0.7, 2.2),
      speed: random(40, 95),
      drift: random(7, 21),
      phase: random(0, TAU),
      sway: random(0.35, 0.95),
    }
  }

  /**
   * 35% of spring/autumn actors are born in the side-tree canopies. Returns
   * `null` when the regular full-viewport spawn should be used instead.
   */
  private canopyOrigin(probability: number): CanopyPoint | null {
    if (this.treeCanopyPoints.length === 0 || Math.random() >= probability) {
      return null
    }

    const point =
      this.treeCanopyPoints[
        Math.floor(Math.random() * this.treeCanopyPoints.length)
      ]

    return {
      x: point.x + random(-18, 18),
      y: point.y + random(-14, 22),
    }
  }

  private createPetal(): Petal {
    const origin = this.canopyOrigin(0.35)

    return {
      x: origin ? origin.x : random(0, this.width),
      y: origin ? origin.y : random(0, this.height),
      vx: random(22, 58),
      vy: random(-8, 16),
      size: random(4, 8.5),
      rotation: random(0, TAU),
      spin: random(-1.8, 1.8),
      phase: random(0, TAU),
      flutter: random(1.4, 3.1),
      sway: random(10, 28),
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
    }
  }

  private createFirefly(): Firefly {
    return {
      x: random(24, Math.max(25, this.width - 24)),
      y: random(24, Math.max(25, this.height - 24)),
      vx: random(-14, 14),
      vy: random(-14, 14),
      phase: random(0, TAU),
      pulseSpeed: random(1.1, 2.7),
      size: random(1.4, 2.6),
      color: FIREFLY_COLORS[Math.floor(Math.random() * FIREFLY_COLORS.length)],
      state: 'wander',
      nextPerchAt: this.elapsed + random(2.5, 10),
      perchUntil: 0,
      perchX: 0,
      perchY: 0,
      perchElement: null,
    }
  }

  private createLeaf(): AutumnLeaf {
    const origin = this.canopyOrigin(0.35)
    const spinBase = random(-2.4, 2.4)

    return {
      x: origin ? origin.x : random(-30, this.width + 30),
      y: origin ? origin.y : random(-this.height * 0.8, this.height),
      vx: random(-14, 14),
      vy: random(18, 46),
      size: random(4, 9),
      phase: random(0, TAU),
      spin: spinBase,
      spinBase,
      sway: random(12, 32),
      swayPhase: random(0, TAU),
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Interactive target cache                                                */
  /* ---------------------------------------------------------------------- */

  private scanTargets(allowAvalanche: boolean): void {
    if (this.destroyed) return

    this.measureHeader()

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(TARGET_SELECTOR),
    )
    const previous = new Map<HTMLElement, SnowTarget>()
    for (const target of this.targets) {
      if (target.element) previous.set(target.element, target)
    }

    const next: SnowTarget[] = []
    const seenElements = new Set<HTMLElement>()
    const seenVirtual = new Set<SnowTarget>()

    for (const element of elements) {
      const rect = element.getBoundingClientRect()
      if (rect.width < 4 || rect.height < 4) continue
      if (rect.bottom < -80 || rect.top > this.height + 80) continue

      const snowLeft = rect.left + SNOW_INSET
      const snowRight = rect.right - SNOW_INSET
      if (snowRight - snowLeft < 4) continue

      const cols = Math.max(
        2,
        Math.min(96, Math.ceil((snowRight - snowLeft) / SNOW_COLUMN_WIDTH)),
      )
      const old = previous.get(element)
      const sameGeometry =
        old !== undefined &&
        old.cols === cols &&
        Math.abs(old.left - rect.left) < 0.5 &&
        Math.abs(old.top - rect.top) < 0.5 &&
        Math.abs(old.right - rect.right) < 0.5 &&
        Math.abs(old.bottom - rect.bottom) < 0.5

      let snow: Float32Array

      if (old && sameGeometry) {
        snow = old.snow
      } else {
        if (old && allowAvalanche) this.avalanche(old)
        snow = new Float32Array(cols)
      }

      next.push({
        element,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        snowLeft,
        snowRight,
        cols,
        snow,
        virtual: false,
      })
      seenElements.add(element)
    }

    // Virtual branch surfaces are rebuilt only when the tree cache changes;
    // append the current instances so snowfall and cursor gathering see them.
    for (const surface of this.treeSurfaces) {
      next.push(surface)
      seenVirtual.add(surface)
    }

    if (allowAvalanche) {
      for (const old of this.targets) {
        const stillPresent = old.virtual
          ? seenVirtual.has(old)
          : old.element !== null && seenElements.has(old.element)
        if (!stillPresent) this.avalanche(old)
      }
    }

    this.targets = next

    if (this.fireflies.length > 0) {
      const valid = new Set(next.map((target) => target.element))
      for (const firefly of this.fireflies) {
        if (
          firefly.state === 'perch' &&
          firefly.perchElement &&
          !valid.has(firefly.perchElement)
        ) {
          firefly.state = 'wander'
          firefly.perchElement = null
          firefly.nextPerchAt = this.elapsed + random(2, 6)
        }
      }
    }
  }

  /**
   * Layout changed underneath an accumulated mound: turn its volume back into
   * falling flakes instead of teleporting the snow to the new rectangle.
   */
  private avalanche(target: SnowTarget): void {
    if (this.season !== 'winter') return

    let volume = 0
    for (let i = 0; i < target.snow.length; i += 1) volume += target.snow[i]
    if (volume < 1.5) return

    const count = Math.max(1, Math.min(18, Math.round(volume / 6)))

    for (let i = 0; i < count; i += 1) {
      const snowLeft = target.snowLeft
      const snowRight = Math.max(target.snowLeft + 1, target.snowRight)
      const x = random(snowLeft, snowRight)
      const y = target.top - random(18, 92)

      if (this.flakes.length < MAX_SNOWFLAKES) {
        this.flakes.push({ ...this.createSnowflake(), x, y })
        continue
      }

      const fallback = this.flakes[Math.floor(Math.random() * this.flakes.length)]
      fallback.x = x
      fallback.y = y
      fallback.phase = random(0, TAU)
    }
  }

  private columnIndex(target: SnowTarget, x: number): number {
    const span = Math.max(1, target.snowRight - target.snowLeft)
    const ratio = clamp((x - target.snowLeft) / span, 0, 0.9999)
    return Math.floor(ratio * target.cols)
  }

  /**
   * Smooth dome envelope. The first and last 22% of bins ease to zero with a
   * sine curve, so a mound can never terminate in a vertical trapezoid wall.
   */
  private columnEnvelope(target: SnowTarget, index: number): number {
    if (target.cols < 3) return 0

    const normalizedIndex = clamp(index / (target.cols - 1), 0, 1)

    if (normalizedIndex < SNOW_EDGE_TAPER) {
      const taper = normalizedIndex / SNOW_EDGE_TAPER
      return Math.sin(taper * Math.PI * 0.5)
    }

    if (normalizedIndex > 1 - SNOW_EDGE_TAPER) {
      const taper = (1 - normalizedIndex) / SNOW_EDGE_TAPER
      return Math.sin(taper * Math.PI * 0.5)
    }

    return 1
  }

  /** Capacity follows the same dome as the growth rate. */
  private columnCapacity(target: SnowTarget, index: number): number {
    return SNOW_CAP * this.columnEnvelope(target, index)
  }

  private depositColumn(
    target: SnowTarget,
    index: number,
    amount: number,
  ): void {
    if (index < 0 || index >= target.cols) return

    const envelope = this.columnEnvelope(target, index)
    if (envelope <= 0) return

    // Multi-frequency ripple keeps the crest organic rather than tabletop flat.
    const variation = Math.sin(index * 0.45) * 0.15 + 0.85
    const capacity = SNOW_CAP * envelope
    const growth = amount * envelope * variation

    target.snow[index] = Math.min(
      capacity,
      target.snow[index] + growth,
    )
  }

  private depositSnow(target: SnowTarget, x: number, amount: number): void {
    const index = this.columnIndex(target, x)

    // A flake deposits a small clump, not a single 5px spike. The diffusion
    // pass then turns these clumps into organic mounds.
    this.depositColumn(target, index, amount)
    this.depositColumn(target, index - 1, amount * 0.7)
    this.depositColumn(target, index + 1, amount * 0.7)
    this.depositColumn(target, index - 2, amount * 0.35)
    this.depositColumn(target, index + 2, amount * 0.35)
  }

  /**
   * `(h[i-1] + h[i] * 2 + h[i+1]) / 4` diffusion with a per-column cap.
   * Boundaries are no-flux so the mound keeps its mass at the edges.
   */
  private smoothSnow(): void {
    for (const target of this.targets) {
      const heights = target.snow
      const length = heights.length
      if (length < 2) continue

      let previous = heights[0]

      for (let i = 1; i < length - 1; i += 1) {
        const current = heights[i]
        const next = heights[i + 1]
        const smoothed = (previous + current * 2 + next) / 4
        heights[i] = clamp(
          current * 0.72 + smoothed * 0.28,
          0,
          this.columnCapacity(target, i),
        )
        previous = current
      }

      const firstSmoothed = (heights[0] * 2 + heights[1]) / 3
      heights[0] = clamp(
        heights[0] * 0.72 + firstSmoothed * 0.28,
        0,
        this.columnCapacity(target, 0),
      )

      const last = length - 1
      const lastSmoothed = (heights[last - 1] + heights[last] * 2) / 3
      heights[last] = clamp(
        heights[last] * 0.72 + lastSmoothed * 0.28,
        0,
        this.columnCapacity(target, last),
      )
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Pointer                                                                 */
  /* ---------------------------------------------------------------------- */

  private readonly onMouseMove = (event: MouseEvent): void => {
    if (this.destroyed) return

    const now = performance.now()

    if (!this.cursor.moved) {
      this.cursor.x = event.clientX
      this.cursor.y = event.clientY
      this.cursor.lastEvent = now
      this.cursor.moved = true
      return
    }

    const elapsed = Math.max(1, now - this.cursor.lastEvent)
    const frameScale = clamp(16.6667 / elapsed, 0.02, 4)
    const rawVx = clamp(
      (event.clientX - this.cursor.x) * frameScale,
      -64,
      64,
    )
    const rawVy = clamp(
      (event.clientY - this.cursor.y) * frameScale,
      -64,
      64,
    )

    this.cursor.vx = this.cursor.vx * 0.55 + rawVx * 0.45
    this.cursor.vy = this.cursor.vy * 0.55 + rawVy * 0.45
    this.cursor.x = event.clientX
    this.cursor.y = event.clientY
    this.cursor.lastEvent = now
  }

  private readonly onMouseDown = (event: MouseEvent): void => {
    if (this.destroyed || this.season === 'off') return
    if (event.button !== 0) return
    if (event.clientY <= this.headerBottomY) return

    const target = event.target
    if (
      target instanceof Element &&
      target.closest(INTERACTIVE_CLICK_SELECTOR)
    ) {
      return
    }

    if (this.cursor.radius < SNOWBALL_MIN_LAUNCH_RADIUS) return

    const radius = this.cursor.radius
    this.cursor.radius = 0
    this.cursor.targetRadius = 0

    if (this.projectiles.length >= MAX_PROJECTILES) {
      this.projectiles.shift()
    }

    this.projectiles.push({
      x: this.cursor.x,
      y: this.cursor.y,
      // Exact spec: cursor velocity scaled down, plus a slight upward lift.
      vx: this.cursor.vx * 0.6,
      vy: this.cursor.vy * 0.6 - 4,
      radius: Math.max(3.5, radius * 0.55),
      age: 0,
    })
  }

  private updateCursor(dt: number): void {
    const decay = Math.exp(-5 * dt)
    this.cursor.vx *= decay
    this.cursor.vy *= decay
    this.cursor.radius +=
      (this.cursor.targetRadius - this.cursor.radius) *
      (1 - Math.exp(-12 * dt))
  }

  /* ---------------------------------------------------------------------- */
  /* Main loop                                                               */
  /* ---------------------------------------------------------------------- */

  private readonly onFrame = (now: number): void => {
    if (!this.running || this.destroyed) return

    if (this.lastTime === 0) this.lastTime = now
    const dt = Math.min(0.05, Math.max(0, (now - this.lastTime) / 1000))
    this.lastTime = now
    this.elapsed += dt

    this.update(dt)
    this.render()

    this.rafId = window.requestAnimationFrame(this.onFrame)
  }

  private update(dt: number): void {
    this.updateCursor(dt)

    if (this.season === 'winter') {
      this.smoothSnow()
      this.gatherSnow()
      this.updateSnowfall(dt)
      this.updateProjectiles(dt)
      this.updateSplashes(dt)
      return
    }

    if (this.season === 'spring') {
      this.updatePetals(dt)
      return
    }

    if (this.season === 'summer') {
      this.updateFireflies(dt)
      return
    }

    if (this.season === 'autumn') {
      this.updateLeaves(dt)
    }
  }

  private render(): void {
    this.clear()

    // One cached pixel copy for the static trees; no path work per frame.
    this.drawTreeLayer()

    if (this.season === 'winter') {
      this.drawSnowMounds()
      this.drawSnowfall()
      this.drawProjectiles()
      this.drawSplashes()
      this.drawCursorSnowball()
      return
    }

    if (this.season === 'spring') {
      this.drawStreamlines()
      this.drawPetals()
      return
    }

    if (this.season === 'summer') {
      this.drawFireflies()
      return
    }

    if (this.season === 'autumn') {
      this.drawLeaves()
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Winter                                                                  */
  /* ---------------------------------------------------------------------- */

  private gatherSnow(): void {
    const cursor = this.cursor
    if (cursor.targetRadius >= SNOWBALL_MAX_RADIUS) return
    if (cursor.y <= this.headerBottomY) return

    const speed = Math.hypot(cursor.vx, cursor.vy)
    if (speed < 0.06) return

    for (const target of this.targets) {
      if (cursor.x < target.snowLeft || cursor.x > target.snowRight) continue

      const index = this.columnIndex(target, cursor.x)
      const height = target.snow[index]
      if (height < 0.3) continue

      const moundTop = target.top - height
      if (cursor.y < moundTop - 14 || cursor.y > target.top + 10) continue

      const taken = Math.min(height, 0.5 + speed * 0.11)
      target.snow[index] = Math.max(0, height - taken)
      cursor.targetRadius = Math.min(
        SNOWBALL_MAX_RADIUS,
        cursor.targetRadius + taken * 1.4,
      )

      if (cursor.targetRadius >= SNOWBALL_MAX_RADIUS) break
    }
  }

  private updateSnowfall(dt: number): void {
    for (const flake of this.flakes) {
      flake.phase += flake.sway * dt
      flake.x += Math.sin(flake.phase) * flake.drift * dt
      flake.y += flake.speed * dt

      if (flake.x < -24) flake.x = this.width + 24
      if (flake.x > this.width + 24) flake.x = -24

      let deposited = false

      for (const target of this.targets) {
        if (flake.x < target.snowLeft || flake.x > target.snowRight) continue

        const index = this.columnIndex(target, flake.x)
        const height = target.snow[index]
        const surface = target.top - height

        if (
          flake.y + flake.size >= surface &&
          flake.y - flake.size <= target.top + 6
        ) {
          this.depositSnow(target, flake.x, 3.4 + flake.size * 1.8)
          deposited = true
          break
        }
      }

      if (deposited || flake.y > this.height + 14) {
        flake.x = random(-20, this.width + 20)
        flake.y = random(-this.height * 0.35, -12)
        flake.phase = random(0, TAU)
      }
    }
  }

  private updateProjectiles(dt: number): void {
    const frameStep = Math.min(3, dt * 60)

    for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
      const ball = this.projectiles[i]
      ball.age += dt
      ball.vy += SNOWBALL_GRAVITY * frameStep
      ball.x += ball.vx * frameStep
      ball.y += ball.vy * frameStep

      if (ball.age > 8 || ball.x < -80 || ball.x > this.width + 80) {
        this.projectiles.splice(i, 1)
        continue
      }

      let hit = false

      for (const target of this.targets) {
        if (
          ball.x >= target.left &&
          ball.x <= target.right &&
          ball.y + ball.radius >= target.top &&
          ball.y - ball.radius <= target.bottom
        ) {
          this.depositSnow(
            target,
            ball.x,
            Math.min(SNOW_CAP, 3 + ball.radius * 0.55),
          )
          this.burst(ball.x, target.top, 14)
          hit = true
          break
        }
      }

      if (!hit && ball.y - ball.radius > this.height) {
        this.burst(ball.x, this.height - 2, 14)
        hit = true
      }

      if (hit) this.projectiles.splice(i, 1)
    }
  }

  private burst(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i += 1) {
      const angle = random(0, TAU)
      const speed = random(70, 270)
      const life = random(0.45, 0.95)

      this.splashes.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - random(20, 90),
        size: random(0.9, 2.4),
        life,
        maxLife: life,
      })
    }

    if (this.splashes.length > 320) {
      this.splashes.splice(0, this.splashes.length - 320)
    }
  }

  private updateSplashes(dt: number): void {
    for (let i = this.splashes.length - 1; i >= 0; i -= 1) {
      const splash = this.splashes[i]
      splash.life -= dt

      if (splash.life <= 0) {
        this.splashes.splice(i, 1)
        continue
      }

      splash.vy += 430 * dt
      splash.x += splash.vx * dt
      splash.y += splash.vy * dt
    }
  }

  private drawSnowMounds(): void {
    const ctx = this.ctx
    ctx.save()
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    for (const target of this.targets) {
      let maximum = 0
      for (let i = 0; i < target.snow.length; i += 1) {
        if (target.snow[i] > maximum) maximum = target.snow[i]
      }
      if (maximum < 0.2) continue

      const baseY = target.top + 1
      const columnWidth =
        (target.snowRight - target.snowLeft) / target.cols
      const points: CanopyPoint[] = [
        { x: target.snowLeft, y: baseY },
      ]

      for (let i = 0; i < target.cols; i += 1) {
        points.push({
          x: target.snowLeft + (i + 0.5) * columnWidth,
          y: target.top - Math.min(SNOW_CAP, target.snow[i]),
        })
      }

      points.push({ x: target.snowRight, y: baseY })

      const trace = (close: boolean): void => {
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)

        // Quadratic path through column midpoints: the crest is a continuous
        // curve instead of a staircase of trapezoid columns.
        for (let i = 1; i < points.length - 1; i += 1) {
          const next = points[i + 1]
          ctx.quadraticCurveTo(
            points[i].x,
            points[i].y,
            (points[i].x + next.x) / 2,
            (points[i].y + next.y) / 2,
          )
        }

        const last = points[points.length - 1]
        ctx.quadraticCurveTo(last.x, last.y, last.x, last.y)

        if (close) {
          ctx.lineTo(last.x, baseY)
          ctx.closePath()
        }
      }

      const gradient = ctx.createLinearGradient(
        0,
        target.top - maximum,
        0,
        baseY,
      )
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.96)')
      gradient.addColorStop(1, 'rgba(226, 232, 240, 0.88)')

      ctx.fillStyle = gradient
      trace(true)
      ctx.fill()

      // Soft 1px highlight along the crest, not around the whole silhouette.
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.62)'
      ctx.lineWidth = 1
      trace(false)
      ctx.stroke()
    }

    ctx.restore()
  }

  private drawSnowfall(): void {
    const ctx = this.ctx
    ctx.save()
    ctx.fillStyle = '#ffffff'

    for (const flake of this.flakes) {
      ctx.globalAlpha = 0.55 + Math.min(0.4, flake.size * 0.18)
      ctx.beginPath()
      ctx.arc(flake.x, flake.y, flake.size, 0, TAU)
      ctx.fill()
    }

    ctx.restore()
  }

  private drawProjectiles(): void {
    const ctx = this.ctx

    for (const ball of this.projectiles) {
      const gradient = ctx.createRadialGradient(
        ball.x - ball.radius * 0.35,
        ball.y - ball.radius * 0.4,
        0,
        ball.x,
        ball.y,
        ball.radius,
      )
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
      gradient.addColorStop(0.65, 'rgba(248, 250, 252, 0.98)')
      gradient.addColorStop(1, 'rgba(186, 230, 253, 0.9)')

      ctx.save()
      ctx.globalAlpha = 0.98
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.radius, 0, TAU)
      ctx.fill()
      ctx.restore()
    }
  }

  private drawSplashes(): void {
    const ctx = this.ctx
    ctx.save()
    ctx.fillStyle = '#f8fafc'

    for (const splash of this.splashes) {
      const alpha = clamp(splash.life / splash.maxLife, 0, 1)
      ctx.globalAlpha = alpha * 0.9
      ctx.beginPath()
      ctx.arc(splash.x, splash.y, splash.size, 0, TAU)
      ctx.fill()
    }

    ctx.restore()
  }

  private drawCursorSnowball(): void {
    const radius = this.cursor.radius
    if (radius < 0.6) return

    const ctx = this.ctx
    const gradient = ctx.createRadialGradient(
      this.cursor.x - radius * 0.35,
      this.cursor.y - radius * 0.4,
      radius * 0.05,
      this.cursor.x,
      this.cursor.y,
      radius,
    )
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.6, 'rgba(248, 250, 252, 0.98)')
    gradient.addColorStop(1, 'rgba(191, 219, 254, 0.92)')

    ctx.save()
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(this.cursor.x, this.cursor.y, radius, 0, TAU)
    ctx.fill()
    ctx.restore()
  }

  /* ---------------------------------------------------------------------- */
  /* Seasonal side trees (cached offscreen)                                  */
  /* ---------------------------------------------------------------------- */

  /**
   * Rebuilds the atmospheric tree layer only for environment changes:
   * season (engine mount), theme and viewport size. The animation loop never
   * recalculates branches or foliage.
   */
  private rebuildTreeLayer(): void {
    this.treeAlpha =
      Math.min(
        1,
        Math.max(0, (this.width - TREE_MIN_VIEWPORT) / TREE_FADE_RANGE),
      ) * TREE_MAX_ALPHA

    if (this.season === 'off' || this.treeAlpha <= 0) {
      this.treeCanvas = null
      this.treeCanopyPoints = []
      this.treeSurfaces = []
      this.reconcileVirtualTargets()
      return
    }

    const offscreen = document.createElement('canvas')
    offscreen.width = Math.max(1, Math.round(this.width * this.dpr))
    offscreen.height = Math.max(1, Math.round(this.height * this.dpr))

    const ctx = offscreen.getContext('2d')
    if (!ctx) {
      this.treeCanvas = null
      this.treeCanopyPoints = []
      this.treeSurfaces = []
      this.reconcileVirtualTargets()
      return
    }

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.clearRect(0, 0, this.width, this.height)
    ctx.globalAlpha = this.treeAlpha

    const left = this.buildTreeLayout('left')
    const right = this.buildTreeLayout('right')

    this.paintTree(ctx, left)
    this.paintTree(ctx, right)

    this.treeCanopyPoints = []
    for (const cluster of left.clusters) {
      this.treeCanopyPoints.push({ x: cluster.x, y: cluster.y })
    }
    for (const cluster of right.clusters) {
      this.treeCanopyPoints.push({ x: cluster.x, y: cluster.y })
    }

    const previousSurfaces = this.treeSurfaces
    const nextSurfaces: VirtualBranchSurface[] = []

    // Snow deliberately never settles on the background trees. Only summer
    // fireflies use the branch forks as perch targets.
    if (this.season === 'summer') {
      for (const layout of [left, right]) {
        const forks = layout.forks.slice(0, TREE_BRANCH_SURFACES)
        for (const fork of forks) {
          nextSurfaces.push(
            this.createTreeSurface(
              fork,
              nextSurfaces.length,
              previousSurfaces[nextSurfaces.length],
            ),
          )
        }
      }
    }

    this.treeCanvas = offscreen
    this.treeSurfaces = nextSurfaces
    this.reconcileVirtualTargets()
  }

  private reconcileVirtualTargets(): void {
    if (this.targets.length === 0) return

    this.targets = [
      ...this.targets.filter((target) => !target.virtual),
      ...this.treeSurfaces,
    ]
  }

  private buildTreeLayout(side: 'left' | 'right'): TreeLayout {
    const segments: TreeBranchSegment[] = []
    const clusters: TreeCanopyCluster[] = []
    const forks: TreeFork[] = []

    const baseX = TREE_MARGIN_WIDTH * 0.5
    const baseY = this.height + 6
    const startLength = clamp(this.height * 0.11, 62, 112)
    const rng = mulberry32(side === 'left' ? 0x51ed270b : 0x2f6e2b1)

    const grow = (
      x: number,
      y: number,
      angle: number,
      length: number,
      width: number,
      depth: number,
    ): void => {
      const endX = x + Math.cos(angle) * length
      const endY = y + Math.sin(angle) * length

      segments.push({ x1: x, y1: y, x2: endX, y2: endY, width })

      if (depth <= 1) {
        const clusterCount = 2 + Math.floor(rng() * 3)
        for (let i = 0; i < clusterCount; i += 1) {
          clusters.push({
            x: endX + (rng() - 0.5) * 28,
            y: endY - rng() * 18,
            radius: 7 + rng() * 15,
            seed: rng(),
          })
        }
        return
      }

      if (depth === 3) forks.push({ x: endX, y: endY })

      const spread = 0.34 + rng() * 0.18
      const nextLength = length * (0.67 + rng() * 0.08)

      grow(
        endX,
        endY,
        angle - spread,
        nextLength * (0.92 + rng() * 0.12),
        width * 0.68,
        depth - 1,
      )
      grow(
        endX,
        endY,
        angle + spread * (0.82 + rng() * 0.28),
        nextLength * (0.88 + rng() * 0.14),
        width * 0.66,
        depth - 1,
      )
    }

    grow(
      baseX,
      baseY,
      -Math.PI / 2 + 0.04 + rng() * 0.07,
      startLength,
      Math.max(6, startLength * 0.11),
      5,
    )

    if (side === 'right') {
      const mirrorX = (x: number): number => this.width - x

      return {
        segments: segments.map((segment) => ({
          ...segment,
          x1: mirrorX(segment.x1),
          x2: mirrorX(segment.x2),
        })),
        clusters: clusters.map((cluster) => ({
          ...cluster,
          x: mirrorX(cluster.x),
        })),
        forks: forks.map((fork) => ({ ...fork, x: mirrorX(fork.x) })),
      }
    }

    return { segments, clusters, forks }
  }

  private paintTree(ctx: CanvasRenderingContext2D, layout: TreeLayout): void {
    ctx.lineCap = 'round'
    ctx.strokeStyle = this.getTreeBranchColor()

    for (const segment of layout.segments) {
      ctx.lineWidth = Math.max(0.6, segment.width)
      ctx.beginPath()
      ctx.moveTo(segment.x1, segment.y1)
      ctx.lineTo(segment.x2, segment.y2)
      ctx.stroke()
    }

    if (this.season === 'winter' || this.season === 'off') return

    for (let i = 0; i < layout.clusters.length; i += 1) {
      const cluster = layout.clusters[i]
      const rng = mulberry32(Math.floor(cluster.seed * 0xffffff))

      if (this.season === 'autumn') {
        const colors = ['#d97706', '#ea580c', '#b91c1c']

        for (let layer = 0; layer < 3; layer += 1) {
          const angle = rng() * TAU
          const offset = layer * 4
          const radius = cluster.radius * (0.62 - layer * 0.08)

          ctx.fillStyle = withAlpha(
            colors[(i + layer) % colors.length],
            0.45 - layer * 0.08,
          )
          ctx.beginPath()
          ctx.arc(
            cluster.x + Math.cos(angle) * offset,
            cluster.y + Math.sin(angle) * offset * 0.6,
            radius,
            0,
            TAU,
          )
          ctx.fill()
        }
        continue
      }

      if (this.season === 'spring') {
        for (let blossom = 0; blossom < 7; blossom += 1) {
          const angle = rng() * TAU
          const distance = rng() * cluster.radius
          const radius = 1.5 + rng() * 3.2

          ctx.fillStyle = withAlpha(
            blossom % 2 === 0 ? '#f472b6' : '#fbcfe8',
            0.5,
          )
          ctx.beginPath()
          ctx.arc(
            cluster.x + Math.cos(angle) * distance,
            cluster.y + Math.sin(angle) * distance * 0.72,
            radius,
            0,
            TAU,
          )
          ctx.fill()
        }
        continue
      }

      if (this.season === 'summer') {
        const color = i % 2 === 0 ? '#10b981' : '#059669'
        const radius = cluster.radius * 1.55
        const gradient = ctx.createRadialGradient(
          cluster.x,
          cluster.y,
          0,
          cluster.x,
          cluster.y,
          radius,
        )
        gradient.addColorStop(0, withAlpha(color, 0.26))
        gradient.addColorStop(0.7, withAlpha(color, 0.12))
        gradient.addColorStop(1, withAlpha(color, 0))

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(cluster.x, cluster.y, radius, 0, TAU)
        ctx.fill()
      }
    }
  }

  private getTreeBranchColor(): string {
    if (this.season === 'winter') return 'rgba(226, 232, 240, 0.14)'
    if (this.season === 'spring') return 'rgba(190, 24, 93, 0.18)'
    if (this.season === 'summer') return 'rgba(16, 185, 129, 0.2)'
    if (this.season === 'autumn') return 'rgba(180, 83, 9, 0.22)'
    return 'rgba(226, 232, 240, 0)'
  }

  private createTreeSurface(
    fork: TreeFork,
    index: number,
    previous: VirtualBranchSurface | undefined,
  ): VirtualBranchSurface {
    const noise =
      Math.sin(fork.x * 12.9898 + fork.y * 78.233 + index * 37.719) * 0.5 + 0.5
    const width = clamp(45 + noise * 35, 45, 80)
    const left = fork.x - width / 2
    const right = fork.x + width / 2
    const top = fork.y - 1
    const cols = Math.max(
      3,
      Math.min(96, Math.ceil(width / SNOW_COLUMN_WIDTH)),
    )

    let snow: Float32Array = new Float32Array(cols)
    if (
      previous &&
      previous.cols === cols &&
      Math.abs(previous.left - left) < 0.75 &&
      Math.abs(previous.top - top) < 0.75
    ) {
      snow = previous.snow
    }

    return {
      element: null,
      left,
      top,
      right,
      bottom: top + 6,
      snowLeft: left,
      snowRight: right,
      cols,
      snow,
      virtual: true,
    }
  }

  /** Single cached-buffer blit — no tree paths are built per frame. */
  private drawTreeLayer(): void {
    const cached = this.treeCanvas
    if (!cached) return

    const ctx = this.ctx
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalAlpha = 1
    ctx.drawImage(cached, 0, 0)
    ctx.restore()
  }

  /* ---------------------------------------------------------------------- */
  /* Spring                                                                  */
  /* ---------------------------------------------------------------------- */

  private updatePetals(dt: number): void {
    for (const petal of this.petals) {
      petal.phase += petal.flutter * dt
      petal.rotation += petal.spin * dt

      const wind =
        34 +
        Math.sin(this.elapsed * 0.55 + petal.phase * 0.4) * 22 +
        Math.cos(petal.y * 0.008 + this.elapsed * 0.8) * 10

      petal.x += (petal.vx + wind) * dt
      petal.y +=
        (petal.vy +
          Math.sin(petal.phase * 0.9 + this.elapsed * 0.7) * petal.sway) *
        dt

      const dx = petal.x - this.cursor.x
      const dy = petal.y - this.cursor.y
      const distance = Math.hypot(dx, dy)

      if (distance < 130 && distance > 0.001) {
        const influence = 1 - distance / 130
        petal.x += (dx / distance) * influence * this.cursor.vx * 0.25
        petal.y += (dy / distance) * influence * this.cursor.vy * 0.25
      }

      if (petal.x > this.width + 24) {
        petal.x = -24
        petal.y = random(0, this.height)
      } else if (petal.x < -32) {
        petal.x = this.width + 24
      }

      if (petal.y > this.height + 24) {
        const origin = this.canopyOrigin(0.35)
        petal.y = origin ? origin.y : -24
        petal.x = origin ? origin.x : random(0, this.width)
      } else if (petal.y < -32) {
        petal.y = this.height + 24
      }
    }
  }

  private drawStreamlines(): void {
    const ctx = this.ctx
    const time = this.elapsed
    const cursor = this.cursor

    ctx.save()

    for (const streamline of this.streamlines) {
      const baseY =
        this.height * streamline.yRatio +
        Math.sin(time * streamline.speed + streamline.phase) *
          streamline.amplitude

      const verticalDistance = Math.abs(cursor.y - baseY)
      const influence = clamp(
        1 - verticalDistance / Math.max(280, this.height * 0.42),
        0,
        1,
      )
      const bendY =
        clamp(cursor.vy * 1.7, -90, 90) * influence +
        Math.sin(time * 0.7 + streamline.phase) * 16
      const bendX = clamp(cursor.vx * 2.2, -120, 120) * influence

      const startY =
        baseY + Math.cos(time * 0.5 + streamline.phase) * 18
      const endY =
        baseY +
        Math.sin(time * 0.45 + streamline.phase * 1.7) * 22 +
        bendY * 0.35

      ctx.beginPath()
      ctx.moveTo(-48, startY)
      ctx.quadraticCurveTo(
        this.width * 0.28 + bendX,
        baseY - streamline.amplitude + bendY,
        this.width * 0.5,
        baseY + bendY * 0.62,
      )
      ctx.quadraticCurveTo(
        this.width * 0.76 + bendX * 0.45,
        baseY + streamline.amplitude + bendY * 0.8,
        this.width + 48,
        endY,
      )
      ctx.strokeStyle = streamline.color
      ctx.lineWidth = streamline.width * (1 + influence * 0.35)
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    ctx.restore()
  }

  private drawPetals(): void {
    const ctx = this.ctx
    ctx.save()

    for (const petal of this.petals) {
      const size = petal.size
      const squash = Math.cos(petal.phase)
      const scaleX =
        squash < 0 ? Math.min(squash, -0.08) : Math.max(squash, 0.08)

      ctx.save()
      ctx.translate(petal.x, petal.y)
      ctx.rotate(petal.rotation)
      ctx.scale(scaleX, 0.82 + Math.abs(squash) * 0.18)
      ctx.globalAlpha = 0.78 + Math.abs(squash) * 0.16
      ctx.fillStyle = petal.color

      ctx.beginPath()
      ctx.moveTo(0, -size)
      ctx.bezierCurveTo(
        size * 0.86,
        -size * 0.46,
        size * 0.66,
        size * 0.68,
        0,
        size,
      )
      ctx.bezierCurveTo(
        -size * 0.66,
        size * 0.68,
        -size * 0.86,
        -size * 0.46,
        0,
        -size,
      )
      ctx.closePath()
      ctx.fill()

      ctx.globalAlpha *= 0.38
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 0.6
      ctx.beginPath()
      ctx.moveTo(0, -size * 0.7)
      ctx.lineTo(0, size * 0.82)
      ctx.stroke()

      ctx.restore()
    }

    ctx.restore()
  }

  /* ---------------------------------------------------------------------- */
  /* Summer                                                                  */
  /* ---------------------------------------------------------------------- */

  private updateFireflies(dt: number): void {
    const time = this.elapsed

    for (const firefly of this.fireflies) {
      const dx = firefly.x - this.cursor.x
      const dy = firefly.y - this.cursor.y
      const distance = Math.hypot(dx, dy)

      if (
        distance < FIREFLY_REPULSION_RADIUS &&
        distance > 0.001
      ) {
        const push =
          (1 - distance / FIREFLY_REPULSION_RADIUS) * 1350
        firefly.vx += (dx / distance) * push * dt
        firefly.vy += (dy / distance) * push * dt

        if (firefly.state === 'perch') {
          firefly.state = 'wander'
          firefly.perchElement = null
          firefly.nextPerchAt = time + random(2.5, 7)
        }
      }

      if (firefly.state === 'perch') {
        firefly.y =
          firefly.perchY + Math.sin(time * 2.1 + firefly.phase) * 1.15

        if (time >= firefly.perchUntil) {
          firefly.state = 'wander'
          firefly.perchElement = null
          firefly.nextPerchAt = time + random(2.5, 8)
          firefly.vy = -random(8, 24)
          firefly.vx = random(-18, 18)
        }

        continue
      }

      firefly.vx += Math.cos(time * 0.9 + firefly.phase) * 17 * dt
      firefly.vy += Math.sin(time * 1.13 + firefly.phase * 1.7) * 17 * dt

      const damping = Math.exp(-1.15 * dt)
      firefly.vx *= damping
      firefly.vy *= damping

      const speed = Math.hypot(firefly.vx, firefly.vy)
      if (speed > 58) {
        firefly.vx = (firefly.vx / speed) * 58
        firefly.vy = (firefly.vy / speed) * 58
      }

      firefly.x += firefly.vx * dt
      firefly.y += firefly.vy * dt

      if (firefly.x < 16) {
        firefly.x = 16
        firefly.vx = Math.abs(firefly.vx) + 4
      } else if (firefly.x > this.width - 16) {
        firefly.x = this.width - 16
        firefly.vx = -Math.abs(firefly.vx) - 4
      }

      if (firefly.y < 16) {
        firefly.y = 16
        firefly.vy = Math.abs(firefly.vy) + 4
      } else if (firefly.y > this.height - 16) {
        firefly.y = this.height - 16
        firefly.vy = -Math.abs(firefly.vy) - 4
      }

      if (time >= firefly.nextPerchAt) {
        this.perchFirefly(firefly)
      }
    }
  }

  private perchFirefly(firefly: Firefly): void {
    if (this.targets.length === 0) {
      firefly.nextPerchAt = this.elapsed + random(3, 8)
      return
    }

    const candidates = this.targets.filter(
      (target) => target.right - target.left > FIREFLY_PERCH_INSET * 2 + 2,
    )

    if (candidates.length === 0) {
      firefly.nextPerchAt = this.elapsed + random(3, 8)
      return
    }

    const target =
      candidates[Math.floor(Math.random() * candidates.length)]
    const left = target.left + FIREFLY_PERCH_INSET
    const right = target.right - FIREFLY_PERCH_INSET

    firefly.x = random(left, right)
    firefly.y = target.top - 1.5
    firefly.perchX = firefly.x
    firefly.perchY = firefly.y
    firefly.perchElement = target.element
    firefly.perchUntil = this.elapsed + random(2, 4)
    firefly.state = 'perch'
    firefly.vx = 0
    firefly.vy = 0
  }

  private getGlowSprite(color: string): HTMLCanvasElement {
    const cached = this.glowSprites.get(color)
    if (cached) return cached

    const size = 64
    const sprite = document.createElement('canvas')
    sprite.width = size
    sprite.height = size
    const context = sprite.getContext('2d')

    if (context) {
      const gradient = context.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2,
      )
      gradient.addColorStop(0, withAlpha(color, 0.95))
      gradient.addColorStop(0.22, withAlpha(color, 0.55))
      gradient.addColorStop(0.58, withAlpha(color, 0.14))
      gradient.addColorStop(1, withAlpha(color, 0))
      context.fillStyle = gradient
      context.fillRect(0, 0, size, size)
    }

    this.glowSprites.set(color, sprite)
    return sprite
  }

  private drawFireflies(): void {
    const ctx = this.ctx
    const time = this.elapsed

    ctx.save()
    ctx.globalCompositeOperation = 'lighter'

    for (const firefly of this.fireflies) {
      const pulse =
        0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * firefly.pulseSpeed + firefly.phase))
      const haloRadius =
        (firefly.state === 'perch' ? 15 : 19) * (0.75 + pulse * 0.35)
      const sprite = this.getGlowSprite(firefly.color)

      ctx.globalAlpha = 0.28 + pulse * 0.62
      ctx.drawImage(
        sprite,
        firefly.x - haloRadius,
        firefly.y - haloRadius,
        haloRadius * 2,
        haloRadius * 2,
      )
    }

    ctx.globalCompositeOperation = 'source-over'

    for (const firefly of this.fireflies) {
      const pulse =
        0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * firefly.pulseSpeed + firefly.phase))
      ctx.globalAlpha = 0.7 + pulse * 0.3
      ctx.fillStyle = firefly.color
      ctx.beginPath()
      ctx.arc(firefly.x, firefly.y, firefly.size, 0, TAU)
      ctx.fill()
    }

    ctx.restore()
  }

  /* ---------------------------------------------------------------------- */
  /* Autumn                                                                  */
  /* ---------------------------------------------------------------------- */

  private updateLeaves(dt: number): void {
    const time = this.elapsed
    const cursorSpeed = Math.hypot(this.cursor.vx, this.cursor.vy)
    const vortexStrength = clamp((cursorSpeed - 2) / 16, 0, 1)

    for (const leaf of this.leaves) {
      leaf.swayPhase += dt * (1.2 + Math.abs(leaf.spinBase) * 0.18)

      // Layered wind and turbulence sampled at the leaf's position. All motion
      // is applied as acceleration; air drag and gravity keep the trajectories
      // physically plausible instead of teleporting the leaf around.
      const windX =
        24 +
        Math.sin(time * 0.61 + leaf.swayPhase * 0.72) * leaf.sway +
        Math.sin(time * 1.73 + leaf.phase * 0.9 + leaf.y * 0.006) * 17 +
        Math.cos(time * 3.17 + leaf.x * 0.012 + leaf.phase) * 8
      const windY =
        Math.sin(time * 1.13 + leaf.phase * 1.4 + leaf.x * 0.008) * 10 +
        Math.cos(time * 2.67 + leaf.swayPhase + leaf.y * 0.005) * 7
      const turbulence =
        Math.sin(leaf.x * 0.016 + time * 2.23 + leaf.phase) *
        Math.cos(leaf.y * 0.013 - time * 1.71 + leaf.swayPhase)

      let ax = (windX - leaf.vx) * LEAF_AIR_DRAG + turbulence * 52
      let ay =
        (windY - leaf.vy) * LEAF_AIR_DRAG +
        LEAF_GRAVITY +
        turbulence * Math.cos(leaf.phase * 1.7) * 28

      if (vortexStrength > 0.02) {
        const dx = leaf.x - this.cursor.x
        const dy = leaf.y - this.cursor.y
        const distance = Math.hypot(dx, dy)

        if (distance < AUTUMN_VORTEX_RADIUS && distance > 0.001) {
          const falloff = 1 - distance / AUTUMN_VORTEX_RADIUS
          const strength = falloff * vortexStrength * 1650
          const nx = dx / distance
          const ny = dy / distance

          // Tangent + outward force: swirl, then scatter.
          ax += -ny * strength + nx * strength * 0.5
          ay += nx * strength + ny * strength * 0.5
        }
      }

      leaf.vx += ax * dt
      leaf.vy += ay * dt

      // Angular acceleration from local turbulence, relaxing back to the
      // leaf's natural tumble rate.
      const angularTurbulence =
        Math.sin(time * 2.31 + leaf.phase * 1.4 + leaf.x * 0.01) *
        Math.cos(time * 1.87 + leaf.swayPhase)
      leaf.spin +=
        (leaf.spinBase - leaf.spin) * 1.2 * dt +
        angularTurbulence * 2.6 * dt
      leaf.spin = clamp(leaf.spin, -3.6, 3.6)
      leaf.phase += leaf.spin * dt

      leaf.vx = clamp(leaf.vx, -190, 190)
      leaf.vy = clamp(leaf.vy, -180, 260)
      leaf.x += leaf.vx * dt
      leaf.y += leaf.vy * dt

      if (leaf.y > this.height + 24) {
        const origin = this.canopyOrigin(0.35)
        leaf.y = origin ? origin.y : -24
        leaf.x = origin ? origin.x : random(-20, this.width + 20)
        leaf.vx = random(-14, 14)
        leaf.vy = origin ? random(8, 26) : random(18, 46)
      } else if (leaf.y < -80) {
        leaf.y = -80
        leaf.vy = Math.max(leaf.vy, 8)
      }

      if (leaf.x > this.width + 36) {
        leaf.x = -32
      } else if (leaf.x < -36) {
        leaf.x = this.width + 32
      }
    }
  }

  private drawLeaves(): void {
    const ctx = this.ctx
    ctx.save()

    for (const leaf of this.leaves) {
      const size = leaf.size
      const squash = Math.cos(leaf.phase)
      const scaleX =
        squash < 0 ? Math.min(squash, -0.07) : Math.max(squash, 0.07)

      ctx.save()
      ctx.translate(leaf.x, leaf.y)
      ctx.rotate(leaf.phase)
      ctx.scale(scaleX, 0.84 + Math.abs(squash) * 0.16)
      ctx.globalAlpha = 0.82 + Math.abs(squash) * 0.16
      ctx.fillStyle = leaf.color

      ctx.beginPath()
      ctx.moveTo(0, -size)
      ctx.bezierCurveTo(
        size * 0.95,
        -size * 0.28,
        size * 0.68,
        size * 0.66,
        0,
        size,
      )
      ctx.bezierCurveTo(
        -size * 0.68,
        size * 0.66,
        -size * 0.95,
        -size * 0.28,
        0,
        -size,
      )
      ctx.closePath()
      ctx.fill()

      ctx.globalAlpha *= 0.42
      ctx.strokeStyle = '#fef3c7'
      ctx.lineWidth = 0.65
      ctx.beginPath()
      ctx.moveTo(0, -size * 0.72)
      ctx.lineTo(0, size * 1.2)
      ctx.stroke()

      ctx.restore()
    }

    ctx.restore()
  }
}

export function SeasonalCanvas({
  activeSeason,
  activeTab,
  theme,
}: SeasonalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<SeasonalEngine | null>(null)
  const themeRef = useRef(theme)

  // Keep the latest theme available to the engine factory without making the
  // engine lifecycle depend on it (rebuilding would reset seasonal actors).
  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  // Rebuild the engine when the season actually changes. This resets the
  // actor pool for that season but is intentionally independent of tab/theme;
  // theme changes are forwarded through `setTheme` without resetting actors.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const engine = new SeasonalEngine(
      canvas,
      context,
      activeSeason,
      themeRef.current,
    )
    engineRef.current = engine
    engine.mount()

    return () => {
      engine.destroy()
      if (engineRef.current === engine) engineRef.current = null
    }
  }, [activeSeason])

  // Bounding boxes are re-cached only for these prop changes plus the
  // debounced resize/scroll handlers inside the engine. Theme changes also
  // invalidate the offscreen tree cache without resetting the actors.
  useEffect(() => {
    engineRef.current?.refreshTargets()
    engineRef.current?.setTheme(theme)
  }, [activeTab, theme])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-30"
    />
  )
}
