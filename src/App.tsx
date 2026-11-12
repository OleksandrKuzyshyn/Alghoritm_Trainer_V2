import { useEffect, useState } from 'react'
import './App.css'

import { SortingArena } from './features/sorting'
import { ComplexitySimulator } from './features/complexity'
import { RecursionTree } from './features/recursion'
import { QuizTrainer } from './features/quiz'
import { SeasonalCanvas, useSeasonManager } from './features/seasonal'
import type { SeasonId, SeasonSetting } from './features/seasonal'

type ThemeMode = 'cyber' | 'linear' | 'apple'

const THEME_LABELS: Record<ThemeMode, string> = {
    cyber: 'THEME: CYBER [02]',
    linear: 'THEME: LINEAR [04]',
    apple: 'THEME: APPLE iOS [01]',
}

const BUTTON_GEOMETRY =
    'px-5 py-2.5 text-sm transition-all duration-200 [clip-path:polygon(12px_0%,calc(100%-12px)_0%,100%_35%,100%_65%,calc(100%-12px)_100%,12px_100%,0%_65%,0%_35%)] apple:[clip-path:none] apple:rounded-full'

const SEASON_BUTTON_GEOMETRY =
    'px-3.5 py-2 text-xs transition-all duration-200 [clip-path:polygon(10px_0%,calc(100%-10px)_0%,100%_35%,100%_65%,calc(100%-10px)_100%,10px_100%,0%_65%,0%_35%)] apple:[clip-path:none] apple:rounded-full'

const ACTIVE_TAB_CLASSES =
    'bg-yellow-400 text-zinc-950 font-bold shadow-[0_0_15px_rgba(250,204,21,0.3)] dark:bg-white dark:text-neutral-950 dark:shadow-none apple:bg-white apple:text-slate-950 apple:shadow-lg apple:shadow-white/10'

const INACTIVE_TAB_CLASSES =
    'bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700 hover:text-yellow-400 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white apple:bg-white/10 apple:text-slate-200 apple:hover:bg-white/20 apple:hover:text-white'

const THEME_SWITCHER_CLASSES =
    'bg-zinc-800 text-yellow-400 border border-yellow-500/40 hover:bg-yellow-400 hover:text-zinc-950 dark:bg-neutral-900 dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-white dark:hover:text-neutral-950 apple:bg-sky-500/20 apple:text-sky-300 apple:border-sky-400/30 apple:hover:bg-sky-500 apple:hover:text-white'

interface FaviconPalette {
    background: string
    border: string
    edges: string
    nodes: string
    glow: string | null
    radius: number
}

const FAVICON_PALETTES: Record<ThemeMode, FaviconPalette> = {
    cyber: {
        background: '#09090b',
        border: '#facc15',
        edges: '#facc15',
        nodes: '#facc15',
        glow: '#fde047',
        radius: 12,
    },
    linear: {
        background: '#171717',
        border: '#525252',
        edges: '#ffffff',
        nodes: '#ffffff',
        glow: null,
        radius: 12,
    },
    apple: {
        background: '#0f172a',
        border: '#38bdf8',
        edges: '#38bdf8',
        nodes: '#e0f2fe',
        glow: null,
        radius: 16,
    },
}

function buildBinaryTreeFavicon(theme: ThemeMode): string {
    const palette = FAVICON_PALETTES[theme]
    const rootGlow = palette.glow
        ? `<circle cx="32" cy="14" r="8" fill="${palette.glow}" opacity="0.22"/><circle cx="32" cy="14" r="5.6" fill="${palette.glow}" opacity="0.28"/>`
        : ''

    return [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
        `<rect x="4" y="4" width="56" height="56" rx="${palette.radius}" fill="${palette.background}" stroke="${palette.border}" stroke-width="2"/>`,
        `<g fill="none" stroke="${palette.edges}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">`,
        '<path d="M32 14 L18 36"/>',
        '<path d="M32 14 L46 36"/>',
        '<path d="M18 36 L12 52"/>',
        '<path d="M46 36 L52 52"/>',
        '</g>',
        rootGlow,
        `<g fill="${palette.nodes}">`,
        '<circle cx="32" cy="14" r="4.4"/>',
        '<circle cx="18" cy="36" r="3.8"/>',
        '<circle cx="46" cy="36" r="3.8"/>',
        '<circle cx="12" cy="52" r="3.4"/>',
        '<circle cx="52" cy="52" r="3.4"/>',
        '</g>',
        '</svg>',
    ].join('')
}

function getSeasonButtonLabel(
    setting: SeasonSetting,
    resolvedSeason: SeasonId | 'off',
): string {
    if (setting === 'auto') {
        const abbreviation =
            resolvedSeason === 'off'
                ? 'OFF'
                : resolvedSeason.slice(0, 3).toUpperCase()

        return `SEASON: AUTO [${abbreviation}]`
    }

    return `SEASON: ${setting.toUpperCase()}`
}

function getInitialTheme(): ThemeMode {
    const storedTheme = localStorage.getItem('algolab:theme')

    if (storedTheme === 'linear' || storedTheme === 'apple' || storedTheme === 'cyber') {
        return storedTheme
    }

    return 'cyber'
}

export default function App() {
    const [activeTab, setActiveTab] = useState('sorting')
    const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
    const {
        activeSeason: resolvedSeason,
        seasonSetting,
        cycleSeason,
    } = useSeasonManager()

    useEffect(() => {
        const svg = buildBinaryTreeFavicon(theme)
        const href = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

        let iconLink = document.head.querySelector<HTMLLinkElement>(
            'link[rel="icon"]',
        )

        if (!iconLink) {
            iconLink = document.createElement('link')
            iconLink.rel = 'icon'
            document.head.appendChild(iconLink)
        }

        iconLink.type = 'image/svg+xml'
        iconLink.href = href
    }, [theme])

    const cycleTheme = () => {
        const nextTheme: ThemeMode =
            theme === 'cyber' ? 'linear' : theme === 'linear' ? 'apple' : 'cyber'

        setTheme(nextTheme)
        localStorage.setItem('algolab:theme', nextTheme)
    }

    const tabClassName = (isActive: boolean) =>
        `${BUTTON_GEOMETRY} ${isActive ? ACTIVE_TAB_CLASSES : INACTIVE_TAB_CLASSES}`

    return (
        <div className={theme === 'linear' ? 'dark' : theme === 'apple' ? 'theme-apple' : ''}>
            <SeasonalCanvas
                activeSeason={resolvedSeason}
                activeTab={activeTab}
                theme={theme}
            />

            <div className="min-h-screen transition-colors duration-300 bg-zinc-950 text-zinc-100 font-mono dark:bg-neutral-950 dark:text-neutral-100 dark:font-sans apple:bg-slate-950 apple:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] apple:from-slate-900 apple:via-slate-950 apple:to-black apple:text-slate-100 apple:font-sans">
                {/* Навігаційна панель */}
                <header className="relative z-50 sticky top-0 border-b px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-zinc-900/95 border-yellow-500/30 dark:bg-neutral-900/80 dark:border-neutral-800 apple:bg-white/[0.06] apple:backdrop-blur-2xl apple:border-white/15">
                    <h1 className="text-2xl font-bold tracking-tight text-yellow-400 dark:text-white apple:text-white">
                        AlgoLab
                    </h1>

                    <div className="flex flex-wrap items-center gap-3">
                        <nav className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setActiveTab('sorting')}
                                className={tabClassName(activeTab === 'sorting')}
                            >
                                Сортування
                            </button>
                            <button
                                onClick={() => setActiveTab('complexity')}
                                className={tabClassName(activeTab === 'complexity')}
                            >
                                Складність T(n)
                            </button>
                            <button
                                onClick={() => setActiveTab('recursion')}
                                className={tabClassName(activeTab === 'recursion')}
                            >
                                Рекурсія
                            </button>
                            <button
                                onClick={() => setActiveTab('quiz')}
                                className={tabClassName(activeTab === 'quiz')}
                            >
                                Тренажер
                            </button>
                        </nav>

                        <button
                            onClick={cycleTheme}
                            className={`${BUTTON_GEOMETRY} ${THEME_SWITCHER_CLASSES}`}
                            aria-label="Cycle color theme"
                        >
                            {THEME_LABELS[theme]}
                        </button>

                        <button
                            type="button"
                            onClick={cycleSeason}
                            className={`${SEASON_BUTTON_GEOMETRY} ${THEME_SWITCHER_CLASSES}`}
                            aria-label={`Cycle season (current: ${seasonSetting})`}
                        >
                            {getSeasonButtonLabel(seasonSetting, resolvedSeason)}
                        </button>
                    </div>
                </header>

                {/* Робоча область, куди будуть підставлятися модулі колег */}
                <main className="p-6">
                    {activeTab === 'sorting' && <SortingArena/>}
                    {activeTab === 'complexity' && <ComplexitySimulator/>}
                    {activeTab === 'recursion' && <RecursionTree />}
                    {activeTab === 'quiz' && <QuizTrainer />}
                </main>
            </div>
        </div>
    )
}
