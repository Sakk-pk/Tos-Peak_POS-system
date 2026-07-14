import React from 'react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Bell, Package, Users, Shapes, AlertTriangle, ArrowRight, UserPlus, ShoppingBag, XCircle, Send, History, Settings } from 'lucide-react';
import MetricCard from '@/Pages/Admin/Dashboard/components/MetricCard';

const METRIC_ICONS = {
  'Total Users': Users,
  Products: Package,
  'Low Stock': AlertTriangle,
  'Critical Stock': XCircle,
};

export default function Dashboard({ dashboard }) {
  const headTitle = 'Dashboard';

  const metrics = dashboard?.metrics ?? [];
  const recentUsers = dashboard?.recentUsers ?? [];
  const recentProducts = dashboard?.recentProducts ?? [];
  const lowStockItems = dashboard?.lowStockItems ?? [];
  const criticalStockItems = dashboard?.criticalStockItems ?? [];
  const recentAlerts = dashboard?.recentAlerts ?? [];
  const totalAlertsCount = dashboard?.totalAlertsCount ?? 0;

  const allAlertItems = [
    ...criticalStockItems.map(item => ({ ...item, isCritical: true })),
    ...lowStockItems.map(item => ({ ...item, isCritical: false })),
  ];

  // Get current date formatted nicely
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AdminLayout navbarTitle="Dashboard" contentClassName="px-8 py-6 space-y-8">
      <Head title={headTitle} />

      {/* ── Top Hero / Greeting Banner ─────────────────────────────── */}
      <section className="bg-white border border-black/[0.06] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-sm">
        {/* Accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#f97316]" />
        <div>
          <h2
            className="text-black font-black uppercase leading-tight font-display text-xl sm:text-2xl"
            style={{
              letterSpacing: '0.02em',
            }}
          >
            Terminal Overview
          </h2>
          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest font-mono mt-1">
            {formattedDate}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={route('point-of-sale.index')}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-5 text-[11px] font-bold text-white uppercase tracking-widest transition-all duration-200 hover:bg-neutral-900 active:scale-95 shadow-sm"
          >
            Launch POS
          </Link>
          <Link
            href={route('products.index')}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 text-[11px] font-bold text-gray-700 uppercase tracking-widest transition-all duration-200 hover:bg-gray-50 active:scale-95 shadow-sm"
          >
            Catalog
          </Link>
        </div>
      </section>

      {/* ── KPIs Metrics Row ───────────────────────────────────────── */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            icon={METRIC_ICONS[metric.title] || Package}
            label={metric.title}
            value={metric.value}
            delta={metric.delta}
          />
        ))}
      </section>

      {/* ── Main Dashboard Layout ──────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left Side: Recent Active Staff & Alerts */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-black/[0.06] rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest font-display text-black">Active Roster</h3>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">Recently added team members</p>
              </div>
              <Link
                href={route('users.index')}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-1 font-display"
              >
                Roster <ArrowRight size={12} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium">
                <thead>
                  <tr className="text-gray-400 font-display uppercase tracking-wider border-b border-black/[0.06]">
                    <th className="pb-3 pr-4 text-[9px] font-black">Staff Member</th>
                    <th className="pb-3 px-4 text-[9px] font-black">Contact</th>
                    <th className="pb-3 text-right pl-4 text-[9px] font-black">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {recentUsers.map((user) => {
                    const initials = user.name
                      ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                      : 'ST';

                    return (
                      <tr key={user.id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-black text-white text-[10px] font-black flex items-center justify-center shrink-0 font-display">
                              {initials}
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block">{user.name}</span>
                              <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider font-display">{user.role || 'Staff'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 font-mono text-[11px]">{user.email}</td>
                        <td className="py-3.5 text-right pl-4 text-gray-400 font-mono text-[11px]">
                          {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent Telegram Notification Alerts Widget */}
          <section className="bg-white border border-black/[0.06] rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest font-display text-black">Recent Notification Alerts</h3>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">Real-time log of telegram channel alerts</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black text-white font-display border border-black">
                  Total Alerts: {totalAlertsCount}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium whitespace-nowrap">
                <thead>
                  <tr className="text-gray-400 font-display uppercase tracking-wider border-b border-black/[0.06]">
                    <th className="pb-3 pr-4 text-[9px] font-black">Time</th>
                    <th className="pb-3 px-4 text-[9px] font-black">Event Type</th>
                    <th className="pb-3 px-4 text-[9px] font-black">Product Context</th>
                    <th className="pb-3 text-right pl-4 text-[9px] font-black">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {recentAlerts.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-400 font-mono text-xs">
                        NO RECENT NOTIFICATION LOGS
                      </td>
                    </tr>
                  ) : (
                    recentAlerts.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="py-3 pr-4 font-mono text-[11px] text-gray-400">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                            log.type === 'out_of_stock' 
                                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {log.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900 text-xs">
                          {log.product ? log.product.name : 'System Test'}
                        </td>
                        <td className="py-3 text-right pl-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-black rounded-full border uppercase ${
                            log.status === 'sent' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : log.status === 'failed' 
                                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Side: Low Stock alerts */}
        <section className="bg-white border border-black/[0.06] rounded-2xl p-6 flex flex-col space-y-4 shadow-sm h-full">
          <div className="border-b border-black/[0.06] pb-4">
            <h3 className="text-xs font-black uppercase tracking-widest font-display text-black">Inventory Alerts</h3>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">Critical low stock tracking</p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[360px] pr-1">
            {allAlertItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 font-mono text-xs">
                <AlertTriangle className="opacity-20 mb-2" size={24} />
                ALL STOCK STABLE
              </div>
            ) : (
              <ul className="divide-y divide-black/[0.04]">
                {allAlertItems.map((item) => (
                  <li key={item.id} className="py-3 flex items-center justify-between hover:bg-gray-50/40 transition-colors">
                    <div>
                      <span className="font-bold text-gray-950 text-xs block">{item.name}</span>
                      <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider font-display">{item.category?.name || 'Category'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        item.isCritical 
                            ? 'bg-rose-50 text-rose-600 border-rose-200' 
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>
                        {item.isCritical ? 'OUT OF STOCK' : `${item.stock} left`}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

      </div>

      {/* ── Recent Catalog Entries (Horizontal Grid) ───────────────── */}
      <section className="bg-white border border-black/[0.06] rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest font-display text-black">Recent Products</h3>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">Latest shoe models added to system</p>
          </div>
          <Link
            href={route('products.index')}
            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-1 font-display"
          >
            Catalog <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recentProducts.slice(0, 4).map((product) => {
            const imageSrc = product.image
              ? (product.image.startsWith('http') || product.image.startsWith('/'))
                ? product.image
                : `/storage/${product.image}`
              : '/images/placeholder-product.png';

            return (
              <div key={product.id} className="border border-black/[0.06] rounded-2xl p-3.5 hover:border-black/[0.12] hover:shadow-md transition-all duration-200 bg-white flex gap-3.5 items-center">
                <div className="w-12 h-12 bg-white rounded-xl border border-black/[0.05] overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-full object-cover animate-scale-in"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder-product.png';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-gray-900 text-xs block truncate" title={product.name}>
                    {product.name}
                  </span>
                  <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block mt-0.5 font-display">
                    {product.category?.name || 'Sneakers'}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#f97316] block mt-1">
                    {product.stock} units
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </AdminLayout>
  );
}
