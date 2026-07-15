import React from 'react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head } from '@inertiajs/react';
import { 
  Users, 
  Package, 
  AlertTriangle, 
  XCircle, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp
} from 'lucide-react';
import MetricCard from '@/Pages/Admin/Dashboard/components/MetricCard';

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

// Generates smooth cubic bezier curves matching the mockup line
const getBezierCurvePath = (points) => {
  if (points.length === 0) return '';
  return points.reduce((path, p, i, a) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = a[i - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) / 2;
    const cpY2 = p.y;
    return `${path} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, '');
};

export default function Dashboard({ dashboard }) {
  const headTitle = 'Dashboard';

  // ── Weekly Revenue Line Chart Coordinates (Mon - Sun) ─────────────
  const lineChartData = [
    { day: 'Mon', revenue: 1000, x: 35, y: 240 },
    { day: 'Tue', revenue: 2000, x: 125, y: 180 },
    { day: 'Wed', revenue: 1700, x: 215, y: 200 },
    { day: 'Thu', revenue: 2300, x: 305, y: 160 },
    { day: 'Fri', revenue: 3200, x: 395, y: 120 },
    { day: 'Sat', revenue: 4200, x: 485, y: 70 },
    { day: 'Sun', revenue: 3000, x: 575, y: 130 }
  ];

  // Smooth bezier curve path
  const lineD = getBezierCurvePath(lineChartData);

  // ── Orders by Day Bar Chart Heights (Mon - Sun) ───────────────────
  const barChartData = [
    { day: 'Mon', h: 80, y: 160, x: 30 },
    { day: 'Tue', h: 110, y: 130, x: 70 },
    { day: 'Wed', h: 100, y: 140, x: 110 },
    { day: 'Thu', h: 180, y: 60, x: 150 },
    { day: 'Fri', h: 210, y: 30, x: 190 },
    { day: 'Sat', h: 240, y: 0, x: 230 },
    { day: 'Sun', h: 200, y: 40, x: 270 }
  ];

  const getMetricValue = (title) => {
    const metric = dashboard?.metrics?.find(m => m.title === title);
    return metric ? metric.value : '0';
  };

  const getMetricDelta = (title) => {
    const metric = dashboard?.metrics?.find(m => m.title === title);
    return metric ? metric.delta : null;
  };

  return (
    <AdminLayout navbarTitle="Dashboard" contentClassName="px-4 py-4 space-y-3.5 bg-[#f9f9fb] min-h-screen text-gray-900 select-none">
      <Head title={headTitle} />

      {/* ── Row 1: KPI Summary Cards ────────────────────────────────── */}
      <section className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Total Users"
          value={getMetricValue('Total Users')}
          delta={getMetricDelta('Total Users') || 'Platform growth'}
          iconBg="bg-neutral-50"
          iconColor="text-neutral-500"
        />
        <MetricCard
          icon={Package}
          label="Products"
          value={getMetricValue('Products')}
          delta={getMetricDelta('Products') || 'Items listed'}
          iconBg="bg-neutral-50"
          iconColor="text-neutral-900"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Low Stock"
          value={getMetricValue('Low Stock')}
          delta={getMetricDelta('Low Stock') || 'Requires review'}
          iconBg="bg-neutral-50"
          iconColor="text-[#f97316]"
        />
        <MetricCard
          icon={XCircle}
          label="Critical Stock"
          value={getMetricValue('Critical Stock')}
          delta={getMetricDelta('Critical Stock') || 'Out of stock'}
          iconBg="bg-neutral-50"
          iconColor="text-rose-600"
        />
      </section>

      {/* ── Row 2: Analytics Sections (Weekly Revenue & Orders by Day) ── */}
      <section className="grid gap-3.5 lg:grid-cols-3">
        {/* Weekly Revenue Line Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-black/[0.08] p-3.5 rounded-none flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 font-sans">WEEKLY REVENUE</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-none bg-gray-50 border border-black/[0.04] text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              Last 7 days
            </span>
          </div>

          <div className="relative w-full h-[240px]">
            <svg viewBox="0 0 600 280" width="100%" height="100%" className="overflow-visible">
              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = 30 + ratio * 210;
                const labelValue = 6000 * (1 - ratio);
                return (
                  <g key={idx} className="opacity-30">
                    <line x1={32} y1={y} x2={580} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />
                    <text x={26} y={y + 3} textAnchor="end" fill="#9ca3af" className="font-mono text-[9px] font-bold">
                      {labelValue}
                    </text>
                  </g>
                );
              })}

              {/* Smooth curve path */}
              {lineD && (
                <path d={lineD} stroke="#111111" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              )}

              {/* Coordinates node dots */}
              {lineChartData.map((d, idx) => (
                <circle key={idx} cx={d.x} cy={d.y} r="3.5" fill="#ffffff" stroke="#111111" strokeWidth="2.2" />
              ))}

              {/* X Axis Labels */}
              {lineChartData.map((d, idx) => (
                <text key={idx} x={d.x} y={265} textAnchor="middle" fill="#9ca3af" className="font-semibold text-[10px]">
                  {d.day}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Orders by Day Bar Chart (1/3 width) */}
        <div className="bg-white border border-black/[0.08] p-3.5 rounded-none flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 font-sans">ORDERS BY DAY</h3>
          </div>

          <div className="relative w-full h-[240px]">
            <svg viewBox="0 0 300 280" width="100%" height="100%" className="overflow-visible">
              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = 30 + ratio * 210;
                const labelValue = 60 * (1 - ratio);
                return (
                  <g key={idx} className="opacity-30">
                    <line x1={22} y1={y} x2={290} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />
                    <text x={16} y={y + 3} textAnchor="end" fill="#9ca3af" className="font-mono text-[9px] font-bold">
                      {labelValue}
                    </text>
                  </g>
                );
              })}

              {/* Vertical Square Bars */}
              {barChartData.map((d, idx) => {
                const w = 18;
                const barY = 240 - d.h;
                return (
                  <rect
                    key={idx}
                    x={d.x - w / 2}
                    y={barY}
                    width={w}
                    height={d.h}
                    fill="#111111"
                    rx="0"
                    className="hover:opacity-85 transition-opacity"
                  />
                );
              })}

              {/* X Axis Labels */}
              {barChartData.map((d, idx) => {
                return (
                  <text key={idx} x={d.x} y={265} textAnchor="middle" fill="#9ca3af" className="font-semibold text-[10px]">
                    {d.day}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
      </section>

      {/* ── Row 3: Operations Stack (Recent Orders & Low Stock Alerts) ─ */}
      <section className="grid gap-3.5 lg:grid-cols-3">
        {/* Recent Orders (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-black/[0.08] p-3.5 rounded-none flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 font-sans">RECENT ORDERS</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-none bg-gray-50 border border-black/[0.04] text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              Recent activity
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold border-collapse">
              <thead>
                <tr className="text-gray-400 uppercase border-b border-black/[0.08] text-[9px] font-bold">
                  <th className="pb-2 text-left">Order</th>
                  <th className="pb-2 px-4 text-left">Customer</th>
                  <th className="pb-2 px-4 text-right">Total</th>
                  <th className="pb-2 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {[
                  { id: 'ORD-1042', customer: 'Sarah Chen', total: 219.49, status: 'Paid' },
                  { id: 'ORD-1041', customer: 'Marcus Lee', total: 89.50, status: 'Paid' },
                  { id: 'ORD-1040', customer: 'Aisha Khan', total: 348.00, status: 'Pending' },
                  { id: 'ORD-1039', customer: 'Daniel Park', total: 159.00, status: 'Paid' },
                  { id: 'ORD-1038', customer: 'Elena Rossi', total: 64.99, status: 'Refunded' }
                ].map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2 font-bold text-gray-900 text-xs">{order.id}</td>
                    <td className="py-2 px-4 text-gray-600 font-sans text-xs">{order.customer}</td>
                    <td className="py-2 px-4 text-right font-bold text-gray-900 text-xs">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-2 pl-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-none text-[9px] font-bold uppercase border tracking-wider ${
                        order.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : order.status === 'Pending'
                          ? 'bg-amber-50 text-[#f97316] border-amber-100'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts (1/3 width) */}
        <div className="bg-white border border-black/[0.08] p-3.5 rounded-none flex flex-col space-y-3.5">
          <div className="border-b border-black/[0.08] pb-2">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 font-sans">LOW STOCK ALERTS</h3>
          </div>

          <div className="flex-1 flex flex-col justify-start space-y-2">
            {(dashboard?.lowStockItems || []).map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between border border-black/[0.03] p-2.5 rounded-none hover:border-black/[0.06] transition-all duration-200 bg-white"
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{item.name}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{item.category?.name || 'Category'}</p>
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-none text-[9px] font-bold uppercase border bg-amber-50 text-[#f97316] border-amber-100">
                    {item.stock} left
                  </span>
                </div>
              </div>
            ))}
            {(dashboard?.lowStockItems || []).length === 0 && (
              <div className="text-center py-8 text-neutral-400 font-mono tracking-widest text-[10px]">
                NO LOW STOCK ITEMS
              </div>
            )}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
