import { TrendingUp } from 'lucide-react';

export default function MetricCard({ icon: Icon, label, value, detail, delta }) {
    return (
        <div className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">{label}</p>
                    <p className="mt-2 text-xl font-bold text-black">{value}</p>
                    {detail ? <p className="mt-1 text-sm text-black/55">{detail}</p> : null}
                </div>
                <div className="flex flex-col items-end">
                    <Icon className="h-6 w-6 text-gray-600" />
                    {delta ? <span className="mt-2 text-sm text-green-600">{delta}</span> : <TrendingUp className="mt-2 h-5 w-5 text-black/20" />}
                </div>
            </div>
        </div>
    );
}