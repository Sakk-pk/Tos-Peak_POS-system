import React, { useEffect } from 'react';
import 'admin-lte/dist/css/adminlte.min.css';
import 'admin-lte/dist/js/adminlte.min.js';
import MenuSideBar from './MenuSideBar';
import { SidebarInset, SidebarTrigger } from '@/Components/ui/sidebar';
import $ from 'jquery';
import { Link, usePage } from '@inertiajs/react';
import { CircleUserRound } from 'lucide-react';

const AdminLayout = ({ breadcrumb, children }) => {
    const user = usePage().props.auth.user;
    
    useEffect(() => {
        $('[data-toggle="dropdown"]').dropdown();
    }, []);
    
    return (
        <MenuSideBar>
            <SidebarInset className="flex-1 flex flex-col">
                {/* Navbar */}
                <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <h1 className="text-xl font-semibold">Dashboard</h1>
                    </div>
                    
                    {/* Right navbar links */}
                    <div className="flex items-center gap-4">
                        <div className="dropdown">
                            <button className="flex items-center gap-2 hover:text-blue-600" id="userDropdown" data-toggle="dropdown">
                                <CircleUserRound className="h-6 w-6" />
                                <span className="hidden sm:inline">{user?.name}</span>
                            </button>
                            <div className="dropdown-menu dropdown-menu-right">
                                <Link href={route('profile.edit')} className="dropdown-item">Profile</Link>
                                <div className="dropdown-divider"></div>
                                <Link
                                    className="dropdown-item"
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                >
                                    Logout
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    {breadcrumb && breadcrumb}
                    <section className="p-4">{children}</section>
                </div>

                {/* Footer */}
                <footer className="border-t border-gray-200 px-4 py-3 text-center text-sm text-gray-600">
                    <strong>Copyright &copy; 2025</strong> All rights reserved.
                </footer>
            </SidebarInset>
        </MenuSideBar>
    );
};

export default AdminLayout;
