export function HeatmapSection({ submissions, maxStreak, currStreak }: { submissions: number, maxStreak: number, currStreak: number }) {

    const heatmapData = generateHeatmap();

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm col-span-1 xl:col-span-1">
            <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-4 text-xs font-medium text-zinc-500">
                    <span><strong className="text-zinc-800 dark:text-zinc-200">{submissions}</strong> Submissions</span>
                    <span>Max Streak <strong className="text-zinc-800 dark:text-zinc-200">{maxStreak}</strong></span>
                    <span>Curr Streak <strong className="text-zinc-800 dark:text-zinc-200">{currStreak}</strong></span>
                </div>
            </div>
            {/* CSS Grid for faux heatmap */}
            <div className="grid grid-cols-[repeat(10,1fr)] gap-1 w-full max-w-[200px] mt-2">
                {heatmapData.map(cell => (
                    <div key={cell.id} className={`w-3 h-3 rounded-sm ${getHeatmapColor(cell.level)}`}></div>
                ))}
            </div>
        </div>
    )
}

// Function to simulate a Github styled contribution heatmap grid
const generateHeatmap = () => {
    return Array.from({ length: 7 * 10 }).map((_, i) => ({
        id: i,
        level: Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0
    }))
}

const getHeatmapColor = (level: number) => {
    switch (level) {
        case 1: return 'bg-emerald-200 dark:bg-emerald-900/40' // lightest
        case 2: return 'bg-emerald-400 dark:bg-emerald-700/60'
        case 3: return 'bg-emerald-600 dark:bg-emerald-500/80'
        case 4: return 'bg-emerald-800 dark:bg-emerald-400' // darkest
        default: return 'bg-zinc-100 dark:bg-zinc-800/50' // empty
    }
}
