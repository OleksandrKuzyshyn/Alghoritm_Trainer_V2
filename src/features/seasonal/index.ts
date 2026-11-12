/**
 * Public facade of the seasonal feature.
 *
 * Usage:
 *   import {
 *     SeasonalCanvas,
 *     useSeasonManager,
 *     cycleSeasonSetting,
 *   } from './features/seasonal'
 *
 *   const { activeSeason, seasonSetting, cycleSeason } = useSeasonManager()
 *   return (
 *     <>
 *       <SeasonalCanvas
 *         activeSeason={activeSeason}
 *         activeTab={activeTab}
 *         theme={theme}
 *       />
 *       <button type="button" onClick={cycleSeason}>
 *         {SEASON_LABELS[seasonSetting]}
 *       </button>
 *     </>
 *   )
 */

export { SeasonalCanvas } from './SeasonalCanvas'
export type { SeasonalCanvasProps } from './SeasonalCanvas'

export {
  SEASON_IDS,
  SEASON_LABELS,
  SEASON_SETTING_CYCLE,
  SEASON_STORAGE_KEY,
  cycleSeasonSetting,
  getSeasonFromMonth,
  isSeasonSetting,
  resolveSeason,
  useSeasonManager,
} from './useSeasonManager'
export type {
  SeasonId,
  SeasonSetting,
  UseSeasonManagerResult,
} from './useSeasonManager'
