import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MetricCard({ icon: Icon, label, value, detail, delta }) {
    const isPositive = delta && !delta.startsWith('-');

    return (
        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] hover:border-black/[0.1] hover:-translate-y-0.5 select-none">
            <div className="flex items-start justify-between">
                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 font-display">{label}</p>
                    <h3 className="text-3xl font-black tracking-tight text-black font-display leading-none">{value}</h3>
                    {detail && (
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-1">{detail}</p>
                    )}
                </div>
                <div className="flex flex-col items-end justify-between h-full min-h-[64px]">
                    <div className="h-10 w-10 rounded-xl bg-gray-50 text-black border border-black/[0.04] flex items-center justify-center shrink-0">
                        <Icon size={18} strokeWidth={2.5} />
                    </div>

                    {delta ? (
                        <span className={`inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isPositive 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                            {isPositive ? <ArrowUpRight size={11} className="stroke-[2.5]" /> : <ArrowDownRight size={11} className="stroke-[2.5]" />}
                            {delta}
                        </span>
                    ) : (
                        <span className="inline-flex items-center text-xs text-gray-300">
                            <TrendingUp size={12} />
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}