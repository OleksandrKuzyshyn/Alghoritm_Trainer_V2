import { useCallback, useMemo, useState } from 'react'

/**
 * Seasonal ambience module.
 *
 * The hook is intentionally UI-agnostic: it owns only the persisted setting
 * and the real-world season resolution. Rendering lives in `SeasonalCanvas`.
 */

export type SeasonId = 'winter' | 'spring' | 'summer' | 'autumn'
export type SeasonSetting = 'auto' | SeasonId | 'off'

export const SEASON_STORAGE_KEY = 'algolab:season'

export const SEASON_IDS: readonly SeasonId[] = [
  'winter',
  'spring',
  'summer',
  'autumn',
]

/**
 * Cycle order used by the UI toggle:
 * auto -> winter -> spring -> summer -> autumn -> off -> auto.
 */
export const SEASON_SETTING_CYCLE: readonly SeasonSetting[] = [
  'auto',
  'winter',
  'spring',
  'summer',
  'autumn',
  'off',
]

export const SEASON_LABELS: Record<SeasonSetting, string> = {
  auto: 'AUTO',
  winter: 'WINTER',
  spring: 'SPRING',
  summer: 'SUMMER',
  autumn: 'AUTUMN',
  off: 'OFF',
}

export function isSeasonSetting(value: unknown): value is SeasonSetting {
  return (
    typeof value === 'string' &&
    (value === 'auto' || value === 'off' || SEASON_IDS.includes(value as SeasonId))
  )
}

/** Maps a zero-based `Date#getMonth()` value to its meteorological season. */
export function getSeasonFromMonth(month: number): SeasonId {
  if (month === 11 || month === 0 || month === 1) return 'winter'
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  return 'autumn'
}

export function resolveSeason(
  setting: SeasonSetting,
  date: Date = new Date(),
): SeasonId | 'off' {
  if (setting === 'auto') return getSeasonFromMonth(date.getMonth())
  return setting
}

/** Returns the next value in the auto -> winter -> ... -> off -> auto cycle. */
export function cycleSeasonSetting(setting: SeasonSetting): SeasonSetting {
  const index = SEASON_SETTING_CYCLE.indexOf(setting)
  return SEASON_SETTING_CYCLE[(index + 1) % SEASON_SETTING_CYCLE.length]
}

function readStoredSeason(): SeasonSetting {
  if (typeof window === 'undefined') return 'auto'

  try {
    const stored = window.localStorage.getItem(SEASON_STORAGE_KEY)
    return isSeasonSetting(stored) ? stored : 'auto'
  } catch {
    return 'auto'
  }
}

function persistSeason(setting: SeasonSetting): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(SEASON_STORAGE_KEY, setting)
  } catch {
    // Storage can be unavailable in private mode / sandboxed iframes.
  }
}

export interface UseSeasonManagerResult {
  readonly seasonSetting: SeasonSetting
  readonly activeSeason: SeasonId | 'off'
  readonly isAuto: boolean
  readonly setSeasonSetting: (setting: SeasonSetting) => void
  /** Advances the setting and returns the newly selected value. */
  readonly cycleSeason: () => SeasonSetting
}

/**
 * Reads and writes the persisted season preference.
 *
 * `activeSeason` is the resolved value that should be forwarded to
 * `<SeasonalCanvas activeSeason={activeSeason} ... />`.
 */
export function useSeasonManager(): UseSeasonManagerResult {
  const [seasonSetting, setSeasonSettingState] = useState<SeasonSetting>(
    readStoredSeason,
  )

  const activeSeason = useMemo(
    () => resolveSeason(seasonSetting),
    [seasonSetting],
  )

  const setSeasonSetting = useCallback((setting: SeasonSetting) => {
    setSeasonSettingState(setting)
    persistSeason(setting)
  }, [])

  const cycleSeason = useCallback((): SeasonSetting => {
    const next = cycleSeasonSetting(seasonSetting)
    setSeasonSettingState(next)
    persistSeason(next)
    return next
  }, [seasonSetting])

  return {
    seasonSetting,
    activeSeason,
    isAuto: seasonSetting === 'auto',
    setSeasonSetting,
    cycleSeason,
  }
}
