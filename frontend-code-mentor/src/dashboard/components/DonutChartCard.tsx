import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export function DonutSection({ title, data, total, stats, colors = ['text-emerald-500', 'text-yellow-500'] }: any) {
    return (
        <div className="w-full mb-8">
            <h4 className="text-sm font-bold text-center mb-4">{title}</h4>
            <div className="flex items-center justify-center space-x-6">
                <div className="w-28 h-28 relative">
                    {/* Ring background */}
                    <div className="absolute inset-0 rounded-full border-[8px] border-zinc-100 dark:border-zinc-800"></div>

                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={46}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={4}
                            >
                                {data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center font-extrabold text-xl">
                        {total}
                    </div>
                </div>

                <div className="flex-1 space-y-2">
                    {Object.entries(stats).map(([key, val], idx) => (
                        <div key={key} className="flex items-center justify-between text-xs font-semibold">
                            <span className={colors[idx % colors.length]}>{key}</span>
                            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-700 dark:text-zinc-300">{val as number}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
