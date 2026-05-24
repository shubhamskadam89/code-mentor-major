import { Compass, Building, CheckCircle2, MoveUpRight } from 'lucide-react'

export function ProfileCard({ studentName, handle }: { studentName: string, handle: string }) {
    return (
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-orange-400 to-rose-400 opacity-20 dark:opacity-10"></div>

            <div className="relative">
                <img
                    src="https://avatars.githubusercontent.com/u/74038190?v=4" // Use real user's avatar from github or replace with placeholder
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-900 shadow-lg object-cover"
                />
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
            </div>

            <h2 className="mt-4 text-2xl font-bold">{studentName}</h2>
            <p className="text-zinc-500 font-medium tracking-tight mt-0.5">@{handle}</p>

            <button className="w-full mt-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-sm shadow-orange-500/20 transition-all active:scale-95">
                Get your Profile Card
            </button>

            <div className="flex items-center space-x-3 mt-6 pb-6 border-b border-zinc-100 dark:border-zinc-800/80 w-full justify-center">
                <SocialIcon icon="✉" />
                <SocialIcon icon="in" />
                <SocialIcon icon="𝕏" />
                <SocialIcon icon="🌐" />
                <SocialIcon icon="📄" />
            </div>

            <div className="w-full mt-6 space-y-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center"><Compass className="w-4 h-4 mr-3 text-zinc-400" /> India</div>
                <div className="flex items-center"><Building className="w-4 h-4 mr-3 text-zinc-400" /> MIT Academy of Engineering</div>
            </div>

            {/* Connected Platforms Dropdown (Mock) */}
            <div className="w-full mt-8">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Problem Solving Stats</h3>
                <div className="space-y-3">
                    <PlatformLink name="LeetCode" active />
                    <PlatformLink name="GeeksForGeeks" active />
                    <PlatformLink name="HackerRank" active />
                </div>
            </div>
        </div>
    )
}

function SocialIcon({ icon }: { icon: string }) {
    return (
        <a href="#" className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-orange-500 hover:text-white transition-colors text-sm font-bold">
            {icon}
        </a>
    )
}

function PlatformLink({ name, active }: { name: string, active: boolean }) {
    return (
        <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                    {name[0]}
                </div>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-orange-500 transition-colors">{name}</span>
            </div>
            <div className="flex items-center space-x-2">
                {active && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                <MoveUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-all" />
            </div>
        </div>
    )
}
