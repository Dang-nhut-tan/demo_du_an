import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  Users,
  Sliders,
  LogOut,
  Menu,
  X,
  Shield,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { isAdminUser } from './adminApi';
import { pb } from '../../services/pocketbase';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => pb.authStore.model);

  const hasAdminAccess = isAdminUser();

  const handleQuickSwitch = (role: 'customer' | 'dispatcher' | 'admin') => {
    if (role === 'admin') {
      const adminModel = {
        id: 'admin-demo-id',
        email: 'admin@demo.local',
        name: 'Quản trị viên Hệ thống',
        role: 'admin',
      };
      pb.authStore.save('admin-simulated-token', adminModel as any);
      setCurrentUser(adminModel as any);
      navigate('/admin');
    } else if (role === 'dispatcher') {
      const dispModel = {
        id: 'dispatcher-demo-id',
        email: 'dispatcher@demo.local',
        name: 'Nguyễn Điều Phối',
        role: 'dispatcher',
      };
      pb.authStore.save('disp-simulated-token', dispModel as any);
      setCurrentUser(dispModel as any);
      navigate('/dispatcher');
    } else {
      const custModel = {
        id: 'customer-demo-id',
        email: 'customer@demo.local',
        name: 'Đại Diện ABC Trading',
        role: 'customer',
        company_name: 'Công ty ABC Trading',
      };
      pb.authStore.save('cust-simulated-token', custModel as any);
      setCurrentUser(custModel as any);
      navigate('/');
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', label: 'Bảng điều khiển', icon: LayoutDashboard, end: true },
    { to: '/admin/registrations', label: 'Duyệt đăng ký', icon: UserCheck },
    { to: '/admin/master-data', label: 'Danh mục Master Data', icon: Database },
    { to: '/admin/customers', label: 'Quản lý Khách hàng', icon: Users },
    { to: '/admin/form-config', label: 'Cấu hình Form TMS', icon: Sliders },
  ];

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col font-sans text-slate-800 bg-slate-100">
      {/* Top Application Bar */}
      <header className="shrink-0 bg-[#003366] text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-md z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-white focus:outline-none"
            aria-label="Mở menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Brand Logo & Console Tag */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/admin')}>
            <div className="flex items-center gap-0.5 font-black text-xl tracking-tight leading-none text-white">
              <span className="font-extrabold italic text-2xl">U</span>
              <span className="text-[#f37021] font-black italic text-2xl mx-0.5">&amp;</span>
              <span className="font-extrabold italic text-2xl">I</span>
              <span className="ml-1.5 font-bold tracking-tight text-white text-lg hidden sm:inline">Logistics</span>
            </div>
            <div className="flex items-center gap-1 bg-[#f37021] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm ml-2">
              <Shield size={12} />
              <span>ADMIN CONSOLE</span>
            </div>
          </div>
        </div>

        {/* Right Header: Role Switcher & User Avatar */}
        <div className="flex items-center gap-3 text-xs">
          {/* Quick role switcher dropdown */}
          <div className="hidden sm:flex items-center bg-[#002244] rounded-xl p-1 border border-white/10">
            <span className="text-white/60 px-2 text-[11px]">Chuyển vai trò:</span>
            <button
              onClick={() => handleQuickSwitch('customer')}
              className="px-2 py-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium"
            >
              Khách hàng
            </button>
            <button
              onClick={() => handleQuickSwitch('dispatcher')}
              className="px-2 py-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium"
            >
              Điều phối viên
            </button>
            <button
              onClick={() => handleQuickSwitch('admin')}
              className="px-2 py-1 rounded-lg bg-[#004ba0] text-white font-bold transition-all shadow-sm"
            >
              Admin
            </button>
          </div>

          <button
            onClick={() => navigate('/')}
            className="hidden lg:flex items-center gap-1 text-blue-200 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl transition-all"
            title="Đến Cổng thông tin khách hàng"
          >
            <ExternalLink size={14} />
            <span>Customer Portal</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-white/80 hover:text-white hover:bg-rose-600/80 p-1.5 rounded-xl transition-all"
            title="Đăng xuất"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Thoát</span>
          </button>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 justify-between p-4 shadow-sm">
          <div className="space-y-6">
            {/* User Profile Info Card */}
            <div className="p-3.5 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-100/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#004ba0] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                <UserCheck size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {currentUser?.email || 'admin@demo.local'}
                </div>
                <div className="text-[11px] font-semibold text-[#f37021] flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f37021] animate-pulse"></span>
                  <span>Quản trị viên (Admin)</span>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                Quản trị danh mục &amp; hệ thống
              </div>
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-[#004ba0] text-white shadow-md shadow-[#004ba0]/20 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent size={18} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight size={14} className="opacity-60" />
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-4 border-t border-slate-100 text-slate-400 text-[11px] space-y-2">
            <div className="flex items-center justify-between">
              <span>Phiên bản Enterprise</span>
              <span className="font-semibold text-slate-600">v2.5.0-TMS</span>
            </div>
            <div className="flex items-center justify-between">
              <span>PocketBase</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Port 8090 Live
              </span>
            </div>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-72 bg-white h-full shadow-2xl p-5 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <Shield size={18} className="text-[#f37021]" />
                    <span>Admin Navigation</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                    <X size={20} />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold ${
                            isActive
                              ? 'bg-[#004ba0] text-white font-bold'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`
                        }
                      >
                        <IconComponent size={18} />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold text-[#004ba0] bg-blue-50 rounded-xl"
                >
                  Đến Customer Portal
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-slate-50/70 p-4 sm:p-6 lg:p-8">
          {/* Role Guard Warning if not logged in as Admin */}
          {!hasAdminAccess ? (
            <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 border border-amber-200 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Shield size={32} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">
                Yêu cầu quyền Quản trị viên (Admin)
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bạn hiện chưa đăng nhập dưới tài khoản Quản trị viên (role: admin). Chỉ Admin mới có quyền quản lý danh mục Master Data và cấu hình hệ thống.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => handleQuickSwitch('admin')}
                  className="px-6 py-3 rounded-2xl bg-[#004ba0] hover:bg-[#003b80] text-white text-xs font-bold shadow-md shadow-[#004ba0]/20 transition-all"
                >
                  Đăng nhập nhanh với Admin (admin@demo.local)
                </button>
              </div>
            </div>
          ) : (
            <ErrorBoundary fallbackTitle="Lỗi hiển thị nội dung quản trị">
              <Outlet />
            </ErrorBoundary>
          )}
        </main>
      </div>
    </div>
  );
};
