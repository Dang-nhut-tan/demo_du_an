import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Truck,
  Calendar,
  CheckCircle2,
  CheckCheck,
  ChevronRight,
  Clock,
  Inbox,
} from 'lucide-react';
import { AppHeader } from '../../components/layout/AppHeader';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { MOCK_NOTIFICATIONS } from '../../services/pocketbase';
import { AppNotification } from '../../types';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const markSingleAsRead = (id: string, refId?: string, type?: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    if (refId) {
      if (type === 'schedule_change') {
        navigate(`/schedule-change?id=${refId}`);
      } else {
        navigate(`/tracking?id=${refId}`);
      }
    }
  };

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'tracking':
        return (
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#004ba0] flex items-center justify-center shrink-0">
            <Truck size={20} />
          </div>
        );
      case 'schedule_change':
        return (
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#f37021] flex items-center justify-center shrink-0">
            <Calendar size={20} />
          </div>
        );
      case 'booking':
        return (
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Bell size={20} />
          </div>
        );
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#f8fafc] text-slate-800">
      <AppHeader
        showBack={true}
        onBack={() => navigate('/')}
        unreadCount={unreadCount}
      />

      <main className="flex-1 min-h-0 pb-6 px-4 sm:px-6 pt-4 max-w-xl mx-auto w-full overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar">
        {/* Title and Controls */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Bell size={22} className="text-[#004ba0]" />
              <span>Thông báo hệ thống</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật tức thời về yêu cầu điều xe và tiến độ vận chuyển
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-[#004ba0] hover:text-[#003366] flex items-center gap-1 bg-blue-50 px-2.5 py-1.5 rounded-xl transition-all"
            >
              <CheckCheck size={14} />
              <span className="hidden sm:inline">Đã đọc tất cả</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-[#004ba0] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filter === 'unread'
                ? 'bg-[#004ba0] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Chưa đọc</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#f37021] text-white text-[10px] flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-sm mt-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Inbox size={26} />
            </div>
            <h3 className="font-bold text-slate-700 text-sm">Không có thông báo mới</h3>
            <p className="text-xs text-slate-400 mt-1">
              Bạn đã xem hết các thông báo cập nhật từ điều phối viên U&I.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markSingleAsRead(n.id, n.referenceId, n.type)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex items-start gap-3.5 group ${
                  n.isRead
                    ? 'bg-white/90 border-slate-200/70 hover:border-slate-300'
                    : 'bg-blue-50/40 border-blue-200/90 shadow-sm hover:border-[#004ba0]/40'
                }`}
              >
                {getNotificationIcon(n.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3
                      className={`text-sm truncate ${
                        n.isRead ? 'font-semibold text-slate-700' : 'font-extrabold text-slate-900'
                      }`}
                    >
                      {n.title}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock size={11} />
                        {n.timestamp}
                      </span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#f37021]"></span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                  {n.referenceId && (
                    <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#004ba0] group-hover:underline">
                      <span>Xem chi tiết {n.referenceId}</span>
                      <ChevronRight size={13} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
