import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, ShoppingBag, BarChart3, LineChart, DollarSign, Layers } from 'lucide-react';

function formatPrice(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);
}

export default function SalesAnalyticsChart({ analytics = {} }) {
    const [range, setRange] = useState('daily'); // 'daily', 'weekly', 'monthly', 'yearly'
    const [chartType, setChartType] = useState('area'); // 'area', 'bar'
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const containerRef = useRef(null);

    const activeData = analytics[range] || {
        labels: [],
        revenueData: [],
        ordersData: [],
        metrics: { revenue: 0, orders: 0, avg_order_value: 0, products_sold: 0, growth: '0%' }
    };

    const { labels, revenueData, ordersData, metrics } = activeData;
    const isRevenueMetric = true; // Plotting revenue by default

    // Coordinate settings
    const width = 600;
    const height = 240;
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 35;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...revenueData, 1);
    const points = revenueData.map((val, idx) => {
        const x = paddingLeft + (labels.length > 1 ? (idx / (labels.length - 1)) * chartWidth : chartWidth / 2);
        const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
        return { x, y, val, label: labels[idx], orders: ordersData[idx] || 0 };
    });

    const lineD = points.length > 0 
        ? points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
        : '';
        
    const areaD = points.length > 0 
        ? `${lineD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
        : '';

    // Handling mouse tracking for premium floating tooltips
    const handleMouseMove = (e) => {
        if (!containerRef.current || points.length === 0) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        
        // Convert client X to SVG viewBox coordinate system
        const svgX = (clientX / rect.width) * width;
        
        // Find closest point horizontally
        let closest = points[0];
        let minDist = Math.abs(points[0].x - svgX);
        
        for (let i = 1; i < points.length; i++) {
            const dist = Math.abs(points[i].x - svgX);
            if (dist < minDist) {
                minDist = dist;
                closest = points[i];
            }
        }
        
        setHoveredPoint(closest);
    };

    const handleMouseLeave = () => {
        setHoveredPoint(null);
    };

    // Calculate dynamic growth delta styling
    const isGrowthPositive = !metrics.growth.startsWith('-');

    return (
        <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-sm flex flex-col space-y-6 select-none">
            {/* Header controls section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/[0.06] pb-4">
                <div>
                    <h3 className="text-xs font-bold text-gray-900">Sales Performance</h3>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">Real-time revenue and growth scaling</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Period selectors */}
                    <div className="flex bg-gray-50 border border-black/[0.04] p-1 rounded-xl">
                        {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                            <button
                                key={p}
                                onClick={() => { setRange(p); setHoveredPoint(null); }}
                                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                                    range === p 
                                        ? 'bg-black text-white shadow-sm' 
                                        : 'text-gray-400 hover:text-black'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    
                    {/* Chart style selectors */}
                    <div className="flex bg-gray-50 border border-black/[0.04] p-1 rounded-xl">
                        <button
                            onClick={() => setChartType('area')}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${
                                chartType === 'area' ? 'bg-white text-[#f97316] border border-black/[0.04] shadow-sm' : 'text-gray-400 hover:text-black'
                            }`}
                            title="Area Chart"
                        >
                            <LineChart size={13} />
                        </button>
                        <button
                            onClick={() => setChartType('bar')}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${
                                chartType === 'bar' ? 'bg-white text-[#f97316] border border-black/[0.04] shadow-sm' : 'text-gray-400 hover:text-black'
                            }`}
                            title="Bar Chart"
                        >
                            <BarChart3 size={13} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Range specific key figures metrics block */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50/50 border border-black/[0.03] p-4 rounded-2xl">
                <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Revenue</span>
                    <span className="text-sm font-bold text-neutral-900 mt-0.5 block">{formatPrice(metrics.revenue)}</span>
                </div>
                <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Orders</span>
                    <span className="text-sm font-bold text-neutral-900 mt-0.5 block">{metrics.orders}</span>
                </div>
                <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Avg Order Value</span>
                    <span className="text-sm font-bold text-neutral-900 mt-0.5 block">{formatPrice(metrics.avg_order_value)}</span>
                </div>
                <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Products Sold</span>
                    <span className="text-sm font-bold text-neutral-900 mt-0.5 block">{metrics.products_sold}</span>
                </div>
                <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Growth</span>
                    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold mt-1.5 px-2 py-0.5 rounded-md border ${
                        isGrowthPositive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                        {metrics.growth}
                    </span>
                </div>
            </div>

            {/* Interactive SVG Chart Drawing area */}
            <div className="relative w-full h-[240px]">
                <svg
                    ref={containerRef}
                    viewBox={`0 0 ${width} ${height}`}
                    width="100%"
                    height="100%"
                    className="overflow-visible"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Gradients Definitions */}
                    <defs>
                        <linearGradient id="chart-area-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Horizontal Guideline Grids */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = paddingTop + ratio * chartHeight;
                        const labelValue = maxVal * (1 - ratio);
                        return (
                            <g key={idx} className="opacity-40">
                                <line
                                    x1={paddingLeft}
                                    y1={y}
                                    x2={width - paddingRight}
                                    y2={y}
                                    stroke="#e5e5e5"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={paddingLeft - 8}
                                    y={y + 3}
                                    textAnchor="end"
                                    fill="#a3a3a3"
                                    className="font-mono text-[8px] font-bold"
                                >
                                    {formatPrice(labelValue).split('.')[0]}
                                </text>
                            </g>
                        );
                    })}

                    {/* Plot area depending on type */}
                    {chartType === 'area' ? (
                        <>
                            {/* Area Gradient fill */}
                            {areaD && (
                                <path
                                    d={areaD}
                                    fill="url(#chart-area-gradient)"
                                    className="transition-all duration-300"
                                />
                            )}
                            {/* Main Stroke line */}
                            {lineD && (
                                <path
                                    d={lineD}
                                    stroke="#f97316"
                                    strokeWidth="2.5"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="transition-all duration-300"
                                />
                            )}
                        </>
                    ) : (
                        // Bar Chart rendering
                        points.map((p, idx) => {
                            const barWidth = Math.max((chartWidth / points.length) * 0.5, 4);
                            const barHeight = paddingTop + chartHeight - p.y;
                            return (
                                <rect
                                    key={idx}
                                    x={p.x - barWidth / 2}
                                    y={p.y}
                                    width={barWidth}
                                    height={Math.max(barHeight, 2)}
                                    fill="#f97316"
                                    rx={Math.min(barWidth / 2, 4)}
                                    className="transition-all duration-300 hover:fill-black"
                                    opacity={hoveredPoint?.label === p.label ? 1 : 0.8}
                                />
                            );
                        })
                    )}

                    {/* Bottom Label ticks */}
                    {points.filter((_, i) => {
                        // Sparse labels mapping to avoid overlapping on small viewports
                        if (range === 'daily') return i % 5 === 0;
                        if (range === 'weekly') return i % 2 === 0;
                        return true;
                    }).map((p, idx) => (
                        <text
                            key={idx}
                            x={p.x}
                            y={height - 10}
                            textAnchor="middle"
                            fill="#a3a3a3"
                            className="font-semibold text-[9px] uppercase tracking-wider"
                        >
                            {p.label}
                        </text>
                    ))}

                    {/* Highlighted hover node vertical trackers and overlay circular nodes */}
                    {hoveredPoint && (
                        <g>
                            {/* Vertical tracker dashed line */}
                            <line
                                x1={hoveredPoint.x}
                                y1={paddingTop}
                                x2={hoveredPoint.x}
                                y2={paddingTop + chartHeight}
                                stroke="#111111"
                                strokeWidth="1"
                                strokeDasharray="3 3"
                            />
                            {/* Line graph coordinate dots */}
                            {chartType === 'area' && (
                                <>
                                    <circle
                                        cx={hoveredPoint.x}
                                        cy={hoveredPoint.y}
                                        r="6"
                                        fill="#f97316"
                                        opacity="0.3"
                                    />
                                    <circle
                                        cx={hoveredPoint.x}
                                        cy={hoveredPoint.y}
                                        r="3.5"
                                        fill="#111111"
                                        stroke="#ffffff"
                                        strokeWidth="1.5"
                                    />
                                </>
                            )}
                        </g>
                    )}
                </svg>

                {/* Floating tooltip markup */}
                {hoveredPoint && (
                    <div
                        className="absolute bg-black text-white p-3 rounded-xl border border-neutral-800 shadow-xl pointer-events-none z-10 flex flex-col gap-1.5 animate-scale-in"
                        style={{
                            left: `${(hoveredPoint.x / width) * 100}%`,
                            top: `${(hoveredPoint.y / height) * 100 - 50}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest leading-none font-mono">
                            {hoveredPoint.label}
                        </span>
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] font-black text-white font-mono">
                                Sales: {formatPrice(hoveredPoint.val)}
                            </span>
                            <span className="text-[9px] font-semibold text-neutral-400 mt-1 font-mono">
                                Orders: {hoveredPoint.orders}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
