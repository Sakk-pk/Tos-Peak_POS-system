import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MetricCard({ icon: Icon, label, value, delta, iconBg, iconColor }) {
  const isPositive = delta && !delta.startsWith('-');
  const isNeedsReview = label === 'Low Stock';

  return (
    <div className="rounded-none border border-black/[0.08] bg-white p-4 transition-colors duration-200 select-none flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">
          {label}
        </span>
        <h3 className="text-xl font-extrabold text-gray-900 leading-none mt-2 font-sans tracking-tight">
          {value}
        </h3>
        
        {delta && (
          <div className="flex items-center gap-0.5 mt-2.5">
            {isNeedsReview ? (
              <span className="text-[9px] font-bold text-amber-700 border border-amber-200 bg-amber-50/50 px-1.5 py-0.5 rounded-none uppercase tracking-wider">
                {delta}
              </span>
            ) : (
              <span className="text-[9px] font-bold text-emerald-600 border border-emerald-200 bg-emerald-50/50 px-1.5 py-0.5 rounded-none uppercase tracking-wider flex items-center gap-0.5">
                <ArrowUpRight size={10} className="stroke-[2.5]" />
                {delta}
              </span>
            )}
          </div>
        )}
      </div>

      <div className={`h-10 w-10 rounded-none flex items-center justify-center shrink-0 border border-black/[0.05] ${iconBg}`}>
        <Icon size={18} className={iconColor} strokeWidth={2} />
      </div>
    </div>
  );
}