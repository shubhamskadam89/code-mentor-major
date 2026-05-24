import { Activity } from 'lucide-react'

export function StatCard({ title, value }: { title: string, value: string }) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm col-span-1 flex flex-col justify-center relative overflow-hidden">
            <h3 className="text-sm font-medium text-zinc-500 mb-1">{title}</h3>
            <p className="text-[42px] font-extrabold leading-none tracking-tight">{value}</p>
            <div className="absolute top-4 right-4 text-zinc-300 dark:text-zinc-700">
                <Activity className="w-12 h-12 opacity-20" />
            </div>
        </div>
    )
}
