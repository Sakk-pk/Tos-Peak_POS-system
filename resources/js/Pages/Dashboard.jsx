import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import { Head } from '@inertiajs/react';
import { Bell, Package, Users, Shapes, AlertTriangle } from 'lucide-react';
import MetricCard from '@/Components/Shared/MetricCard';

const METRIC_ICONS = {
  'Total Users': Users,
  Products: Package,
  Categories: Shapes,
  'Low Stock': AlertTriangle,
};

export default function Dashboard({ dashboard }) {
  const headTitle = 'Dashboard';
  const linksBreadcrumb = [
    { title: 'Home', url: '/' },
    { title: headTitle, url: '' },
  ];

  const metrics = dashboard?.metrics ?? [];
  const recentUsers = dashboard?.recentUsers ?? [];
  const recentProducts = dashboard?.recentProducts ?? [];
  const lowStockItems = dashboard?.lowStockItems ?? [];

  return (
    <AdminLayout breadcrumb={<Breadcrumb header={headTitle} links={linksBreadcrumb} />}>
      <Head title={headTitle} />

      <section className="min-h-full bg-gradient-to-br from-white to-gray-50">
        <div className="px-6 py-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src="/images/Tos_Peak-Logo.png" alt="TOS-PEAK" className="h-10 w-10 rounded-md bg-white p-1" />
                <div>
                  <h2 className="text-2xl font-bold">TOS-PEAK</h2>
                  <p className="text-sm text-gray-500">Admin Dashboard</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="relative rounded-full p-2 hover:bg-gray-100">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] text-white">{lowStockItems.length}</span>
                </button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
              {metrics.map((metric) => (
                <MetricCard
                  key={metric.id}
                  icon={METRIC_ICONS[metric.title] || Package}
                  label={metric.title}
                  value={metric.value}
                  delta={metric.delta}
                />
              ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="col-span-2 rounded-3xl border border-black/8 bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Latest Users</h3>
                  <div className="text-sm text-gray-500">From MySQL</div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full table-auto text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500">
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="border-t border-gray-100">
                          <td className="px-3 py-3 font-medium">{user.name}</td>
                          <td className="px-3 py-3">{user.email}</td>
                          <td className="px-3 py-3 text-gray-500">{new Date(user.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm">
                <h4 className="text-sm font-semibold">Low Stock Alerts</h4>
                <p className="mt-1 text-xs text-gray-500">Items that require attention</p>
                <ul className="mt-3 space-y-2">
                  {lowStockItems.map((item) => (
                    <li key={item.id} className="flex items-center justify-between rounded-md p-2 hover:bg-gray-50">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.category?.name || 'No category'}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className={`text-sm font-semibold ${item.stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>{item.stock}</div>
                        <div className="text-xs text-gray-400">left</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>

            <div className="mt-6 rounded-3xl border border-black/8 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Products</h3>
                <div className="text-sm text-gray-500">Showing latest {recentProducts.length} products</div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500">
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Stock</th>
                      <th className="px-3 py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProducts.map((product) => (
                      <tr key={product.id} className="border-t border-gray-100">
                        <td className="px-3 py-3 font-medium">{product.name}</td>
                        <td className="px-3 py-3">{product.category?.name || 'No category'}</td>
                        <td className="px-3 py-3">{product.stock}</td>
                        <td className="px-3 py-3 text-gray-500">{new Date(product.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
