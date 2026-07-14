import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/Components/ui/sidebar';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Warehouse,
  FileText,
  CreditCard,
  UserRound,
  Users,
  Shield,
  Bell,
  FolderTree,
  PlusSquare,
  ListTree,
  SlidersHorizontal,
} from 'lucide-react';
import { useSidebar } from '@/Components/ui/sidebar';

function getRouteHref(name) {
  try {
    return route(name);
  } catch (e) {
    return '#';
  }
}
const groups = [
  {
    group: "Overview",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, route: 'dashboard' },
      { title: "POS", icon: ShoppingCart, route: 'point-of-sale.index' },
    ],
  },
  {
    group: "Catalog",
    items: [
      { title: "Catalog Settings", icon: SlidersHorizontal, route: 'catalog-settings.index' },
      { title: "Products", icon: Package, route: 'products.index' },
      { title: "Variants", icon: Layers, route: 'variants.index' },
      { title: "Inventory", icon: Warehouse, route: 'inventory.index' },
    ],
  },
  {
    group: "Sales",
    items: [
      { title: "Orders", icon: FileText, route: 'orders.index' },
      { title: "Payments", icon: CreditCard, route: 'payments.index' },
      { title: "Customers", icon: Users, route: 'customers.index' },
    ],
  },
  {
    group: "System",
    items: [
      { title: "Users", icon: UserRound, route: 'users.index' },
      { title: "Roles", icon: Shield, route: 'roles.index' },
      { title: "Notifications", icon: Bell, route: 'notifications.index' },
    ],
  },
];

export default function MenuSideBar({ children }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <HeaderContent />
          </SidebarHeader>

          <SidebarContent>
            <SidebarItems />
          </SidebarContent>
        </Sidebar>
        {children}
      </div>
    </SidebarProvider>
  );
}

function SidebarItems() {
  const { open } = useSidebar();
  const { url } = usePage();
  const currentPath = url?.split('?')[0] ?? '';

  return (
    <div className={open ? '' : 'h-full flex flex-col justify-center'}>
      {groups.map((section) => (
        <SidebarGroup key={section.group}>
          {open ? <SidebarGroupLabel>{section.group}</SidebarGroupLabel> : null}
          <SidebarGroupContent>
            <SidebarMenu>
              {section.items.map((item) => {
                const Icon = item.icon;
                const href = getRouteHref(item.route);
                const hrefPath = href.startsWith('http') ? new URL(href).pathname : href;
                const isActive = item.route === 'dashboard'
                  ? currentPath === hrefPath
                  : currentPath.startsWith(hrefPath);
                const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                const childIsActive = hasChildren
                  ? item.children.some((child) => {
                      const childHref = getRouteHref(child.route);
                      const childHrefPath = childHref.startsWith('http') ? new URL(childHref).pathname : childHref;
                      return currentPath.startsWith(childHrefPath);
                    })
                  : false;
                const isItemActive = isActive || childIsActive;

                // Icon-only view when closed
                const content = (
                  <div className={`relative flex items-center gap-3 ${open ? 'pl-3' : 'justify-center'}`}>
                    {isItemActive ? (
                      <span
                        className={`absolute rounded-full bg-black shadow-[0_0_0_4px_rgba(0,0,0,0.12)] ${
                          open
                            ? 'left-0 top-1/2 h-5 w-1 -translate-y-1/2'
                            : 'left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2'
                        }`}
                      />
                    ) : null}
                    <Icon className="w-5 h-5" />
                    {open ? (
                      <span className="flex items-center gap-2">
                        {item.title}
                        {hasChildren ? <span className="text-xs text-gray-400">CRUD</span> : null}
                      </span>
                    ) : null}
                  </div>
                );

                return (
                  <SidebarMenuItem key={item.route}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isItemActive}>
                      <Link
                        href={href}
                        title={item.title}
                        className="no-underline hover:no-underline"
                      >
                        {content}
                      </Link>
                    </SidebarMenuButton>

                    {hasChildren && open ? (
                      <div className="mt-1 ml-2 border-l border-gray-200 pl-3">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const childHref = getRouteHref(child.route);
                          const childHrefPath = childHref.startsWith('http') ? new URL(childHref).pathname : childHref;
                          const childActive = currentPath.startsWith(childHrefPath);

                          return (
                            <div key={child.route} className="py-1">
                              <Link
                                href={childHref}
                                className={`flex items-center gap-2 rounded-md px-2 py-1 text-sm no-underline hover:no-underline ${childActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                              >
                                <ChildIcon className="h-4 w-4" />
                                <span>{child.title}</span>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </div>
  );
}

function HeaderContent() {
  const { open } = useSidebar();

  return (
    <div className="px-2 py-2 w-full">
      {open ? (
        <div className="flex items-center gap-3">
          <img
            src="/images/Tos_Peak-Logo.png"
            alt="TOS-PEAK"
            className="w-10 h-10 object-contain rounded-md bg-white"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold">TOS-PEAK</span>
            <span className="text-xs text-gray-400">FIND YOUR PAIR</span>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <img
            src="/images/Tos_Peak-Logo.png"
            alt="TOS-PEAK"
            className="w-8 h-8 object-contain rounded-md bg-white"
          />
        </div>
      )}
    </div>
  );
}
