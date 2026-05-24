import { Compass } from 'lucide-react'

export function PlaceholderView({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl mt-8">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                <Compass className="w-10 h-10 text-zinc-400" />
            </div>
            <h2 className="text-3xl font-extrabold mb-2">{title}</h2>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
                This section "{title}" is currently under construction. Check back soon for updates!
            </p>
            <button className="mt-8 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold shadow-md transition-transform active:scale-95">
                Notify Me
            </button>
        </div>
    )
}
