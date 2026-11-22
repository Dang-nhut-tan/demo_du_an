import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FilePlus,
  CalendarDays,
  Truck,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { AppHeader } from '../../components/layout/AppHeader';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { ActionCard, StatTile, RequestCard } from '../../components/ui/Cards';
import {
  getCurrentUser,
  fetchDashboardStats,
  fetchRecentBookings,
  MOCK_BOOKINGS,
} from '../../services/pocketbase';
import { BookingRequest } from '../../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [stats, setStats] = useState({
    total: 12,
    inProgress: 7,
    pending: 3,
    scheduleChanges: 2,
  });

  const [recentBookings, setRecentBookings] = useState<BookingRequest[]>(MOCK_BOOKINGS);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, bookingsData] = await Promise.all([
        fetchDashboardStats(),
        fetchRecentBookings(5),
      ]);
      setStats(statsData);
      if (bookingsData && bookingsData.length > 0) {
        setRecentBookings(bookingsData);
      }
    } catch (_err) {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#f8fafc] text-slate-800 relative">
      {/* App Header */}
      <AppHeader unreadCount={2} onOpenNotifications={() => navigate('/notifications')} />

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 pb-6 overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar">
        {/* Hero Banner with Modern Logistics Warehouse */}
        <div className="relative w-full bg-[#004ba0] overflow-hidden">
          <div className="relative h-44 sm:h-52 w-full overflow-hidden">
            <img
              src="/assets/dashboard-banner.png"
              alt="U&I Logistics Facility"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/warehouse-truck.png';
              }}
            />
            {/* Swoosh curve overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Curved white separator at the bottom of hero */}
          <div className="relative -mt-4 bg-[#f8fafc] rounded-t-[32px] pt-4 px-4 sm:px-6 shadow-sm border-t border-white/60">
            {/* Greeting Box */}
            <div className="mb-4">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Xin chào, {user.company || 'Công ty ABC Trading'}
                </h1>
                <span className="text-xl inline-block animate-bounce">👋</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý yêu cầu vận chuyển và theo dõi tiến độ cùng U&I Logistics
              </p>
            </div>
          </div>
        </div>

        {/* 3 Main Action Cards */}
        <div className="px-4 sm:px-6 space-y-3 mt-1">
          <ActionCard
            title="Tạo yêu cầu vận chuyển"
            subtitle="Gửi yêu cầu vận chuyển, điều xe, container"
            icon={<FilePlus size={24} className="text-[#004ba0]" />}
            colorTheme="blue"
            onClick={() => navigate('/booking/new')}
          />

          <ActionCard
            title="Đề xuất sửa thời gian"
            subtitle="Đề nghị thay đổi thời gian lấy hàng, đóng hàng hoặc giao hàng"
            icon={<CalendarDays size={24} className="text-[#f37021]" />}
            colorTheme="orange"
            onClick={() => navigate('/schedule-change')}
          />

          <ActionCard
            title="Theo dõi tiến độ"
            subtitle="Xem trạng thái xử lý và vận chuyển theo thời gian thực"
            icon={<Truck size={24} className="text-indigo-600" />}
            colorTheme="purple"
            onClick={() => navigate('/tracking')}
          />
        </div>

        {/* Statistics Overview (30 ngày gần nhất) */}
        <div className="mt-6 px-4 sm:px-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Tổng quan yêu cầu</span>
              <span className="text-xs font-normal text-slate-500">(30 ngày gần nhất)</span>
            </h2>
            <button
              onClick={loadData}
              disabled={loading}
              className="text-slate-400 hover:text-[#004ba0] transition-colors p-1"
              title="Làm mới số liệu"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
            <StatTile
              count={stats.total}
              label="Tổng yêu cầu"
              icon={<ClipboardList size={18} />}
              colorScheme="blue"
            />
            <StatTile
              count={stats.inProgress}
              label="Đang thực hiện"
              icon={<CheckCircle2 size={18} />}
              colorScheme="green"
            />
            <StatTile
              count={stats.pending}
              label="Chờ xử lý"
              icon={<Clock size={18} />}
              colorScheme="orange"
            />
            <StatTile
              count={stats.scheduleChanges}
              label="Thay đổi lịch"
              icon={<AlertTriangle size={18} />}
              colorScheme="red"
            />
          </div>
        </div>

        {/* Recent Requests Section */}
        <div className="mt-6 px-4 sm:px-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">Yêu cầu gần đây</h2>
            <button
              onClick={() => navigate('/tracking')}
              className="text-xs font-semibold text-[#004ba0] hover:text-[#003366] flex items-center gap-0.5"
            >
              <span>Xem tất cả</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentBookings.slice(0, 3).map((booking) => (
              <RequestCard
                key={booking.id}
                request={booking}
                onClick={() => {
                  if (booking.status === 'PENDING') {
                    navigate(`/schedule-change?id=${booking.code || booking.id}`);
                  } else {
                    navigate(`/tracking?id=${booking.code || booking.id}`);
                  }
                }}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
