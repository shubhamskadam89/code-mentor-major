import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const ratingData = [
    { name: 'Jan', uv: 1200 },
    { name: 'Feb', uv: 1400 },
    { name: 'Mar', uv: 1350 },
    { name: 'Apr', uv: 1600 },
    { name: 'May', uv: 1800 },
    { name: 'Jun', uv: 1750 },
    { name: 'Jul', uv: 2100 },
    { name: 'Aug', uv: 2300 },
    { name: 'Sep', uv: 1341 },
]

export interface RatingChartPoint {
    name: string;
    uv: number;
}

export function RatingChart({ data = ratingData }: { data?: RatingChartPoint[] }) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm mt-8 xl:mt-0 xl:flex-1 h-[400px]">
            <h3 className="text-xl font-bold flex items-center mb-6">
                Contest Rating History
                <span className="ml-3 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 font-extrabold text-xs rounded-lg flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                    ACTIVE
                </span>
            </h3>
            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <Line type="monotone" dataKey="uv" stroke="#f97316" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#f97316' }} activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }} />
                        <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
