import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  User as UserIcon,
  Search,
  SlidersHorizontal,
  Truck,
  ChevronRight,
  GitBranch,
  FileText,
  History,
  Check,
  Calendar,
  Box,
  MapPin,
  Phone,
  Info,
  Anchor,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  TrackingData,
  DEFAULT_TRACKING_MOCK,
  fetchTrackingProgress,
  subscribeToTrackingUpdates,
} from './trackingApi';
import { BottomNavigation } from '../../components/layout/BottomNavigation';

export const TrackingProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeParam = searchParams.get('code') || '';

  const [searchQuery, setSearchQuery] = useState(codeParam || 'REQ-250828-001');
  const [activeTab, setActiveTab] = useState<'timeline' | 'details' | 'history'>('timeline');
  const [data, setData] = useState<TrackingData>(DEFAULT_TRACKING_MOCK);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load tracking data
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchTrackingProgress(searchQuery);
        if (mounted) setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();

    return () => {
      mounted = false;
    };
  }, [searchQuery, refreshKey]);

  // Subscribe to realtime progress updates
  useEffect(() => {
    const unsub = subscribeToTrackingUpdates(data.id, () => {
      setRefreshKey((k) => k + 1);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [data.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-100">
      {/* Top Header matching Mockup */}
      <div className="shrink-0 bg-[#004ba0] text-white px-4 pt-3 pb-4 shadow-md z-30">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="text-center">
            <span className="font-black text-lg tracking-wide text-white italic drop-shadow-sm">
              U&amp;I <span className="text-[#f37021]">Logistics</span>
            </span>
            <span className="block text-[10px] text-blue-100 font-medium tracking-tight">
              Customer Portal (PWA)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f37021]"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-white text-[#004ba0] font-bold text-xs flex items-center justify-center border border-white/40 shadow-inner">
              <UserIcon size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto bg-white flex-1 min-h-0 flex flex-col shadow-sm overflow-hidden">
        {/* Banner with Title and Swoosh Background */}
        <div className="shrink-0 relative bg-gradient-to-br from-blue-50/80 via-white to-orange-50/30 px-5 pt-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#004ba0] text-white flex items-center justify-center shadow-md shadow-[#004ba0]/20 shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
                Theo dõi tiến độ
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem trạng thái xử lý và vận chuyển theo thời gian thực
              </p>
            </div>
          </div>

          {/* Search bar matching Mockup */}
          <form onSubmit={handleSearch} className="mt-4 flex items-center gap-2">
            <div className="relative flex-1 flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm px-3 py-2.5 focus-within:border-[#004ba0] focus-within:ring-2 focus-within:ring-[#004ba0]/15 transition">
              <Search size={16} className="text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Nhập mã yêu cầu, booking, container..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 bg-transparent outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 transition shrink-0 active:scale-95"
              title="Lọc kết quả"
            >
              <SlidersHorizontal size={16} />
            </button>
          </form>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain space-y-4">
          {/* Booking Summary Card matching Mockup */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#004ba0] flex items-center justify-center shrink-0">
                <Truck size={22} />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                  <span>{data.requestCode}</span>
                  <span className="text-[11px] font-normal text-slate-400">({data.bookingNumber})</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {data.pickupLocation} → {data.deliveryLocation}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{data.statusLabel}</span>
              </span>
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          </div>

          {/* Tab Navigation matching Mockup */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
                activeTab === 'timeline'
                  ? 'bg-white text-[#004ba0] shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              <GitBranch size={14} />
              <span>Tiến độ</span>
            </button>

            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
                activeTab === 'details'
                  ? 'bg-white text-[#004ba0] shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              <FileText size={14} />
              <span>Thông tin chi tiết</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition ${
                activeTab === 'history'
                  ? 'bg-white text-[#004ba0] shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              <History size={14} />
              <span>Lịch sử thay đổi</span>
            </button>
          </div>

          {/* TAB 1: Vertical Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {/* Timeline List */}
              <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-5 relative">
                {/* Connecting Line */}
                <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-200 -z-0"></div>

                {data.stages.map((stg, idx) => {
                  const isCompleted = stg.status === 'COMPLETED';
                  const isInProgress = stg.status === 'IN_PROGRESS';
                  const isPending = stg.status === 'PENDING';

                  return (
                    <div key={stg.id || idx} className="relative flex items-start gap-3.5 z-10">
                      {/* Node Indicator */}
                      <div className="shrink-0 mt-0.5">
                        {isCompleted && (
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}
                        {isInProgress && (
                          <div className="w-6 h-6 rounded-full bg-[#004ba0] text-white flex items-center justify-center ring-4 ring-blue-100 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                          </div>
                        )}
                        {isPending && (
                          <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                          </div>
                        )}
                      </div>

                      {/* Content Card */}
                      <div
                        className={`flex-1 p-3 rounded-2xl transition-all ${
                          isInProgress
                            ? 'bg-blue-50/70 border border-blue-200/80 shadow-sm'
                            : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={`text-xs font-bold ${
                              isInProgress
                                ? 'text-[#004ba0] text-sm'
                                : isCompleted
                                ? 'text-slate-800'
                                : 'text-slate-400'
                            }`}
                          >
                            {stg.title}
                          </h4>

                          {/* Pill for active stage */}
                          {isInProgress && stg.expectedTime && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#004ba0] bg-blue-100/80 px-2 py-0.5 rounded-full shrink-0">
                              <MapPin size={11} />
                              Dự kiến đến: {stg.expectedTime}
                            </span>
                          )}
                        </div>

                        {stg.timestamp && (
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <Clock size={11} className="text-slate-400" />
                            {stg.timestamp}
                          </p>
                        )}

                        {isPending && stg.expectedTime && (
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Anchor size={11} className="text-slate-300" />
                            Dự kiến: {stg.expectedTime}
                          </p>
                        )}

                        {stg.note && (
                          <p className="text-xs text-slate-600 mt-1.5 italic bg-white/80 p-2 rounded-xl border border-slate-100">
                            {stg.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Driver & Vehicle Information Card matching Mockup */}
              <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {/* Container count */}
                  <div className="p-2.5 bg-slate-50 rounded-2xl text-left">
                    <span className="text-[11px] text-slate-400 block mb-1">Số container</span>
                    <span className="font-extrabold text-slate-800 block">{data.containerSummary}</span>
                  </div>

                  {/* Vehicle Number */}
                  <div className="p-2.5 bg-slate-50 rounded-2xl text-left">
                    <span className="text-[11px] text-slate-400 block mb-1">Biển số xe</span>
                    <span className="font-extrabold text-[#004ba0] block">{data.vehicleNumber}</span>
                  </div>

                  {/* Driver Name & Call Button */}
                  <div className="p-2.5 bg-slate-50 rounded-2xl text-left flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Tài xế</span>
                      <span className="font-bold text-slate-800 block truncate max-w-[70px]">
                        {data.driverName.split(' ').slice(-1)[0]}
                      </span>
                    </div>
                    <a
                      href={`tel:${data.driverPhone}`}
                      className="w-7 h-7 rounded-full bg-blue-100 text-[#004ba0] hover:bg-blue-200 flex items-center justify-center transition shrink-0"
                      title="Gọi tài xế"
                    >
                      <Phone size={13} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Notes Card matching Mockup */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/70 rounded-2xl flex items-start gap-2.5 text-xs text-slate-700">
                <Info size={16} className="text-[#004ba0] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#004ba0]">Ghi chú điều phối: </span>
                  <span>{data.note}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Details Tab */}
          {activeTab === 'details' && (
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Mã đơn hàng / Booking:</span>
                <span className="font-bold text-slate-800">{data.bookingNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Hãng tàu:</span>
                <span className="font-bold text-[#004ba0]">{data.shippingLine}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Nơi đóng hàng:</span>
                <span className="font-semibold text-slate-800">{data.pickupLocation}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Cảng giao hàng:</span>
                <span className="font-semibold text-slate-800">{data.deliveryLocation}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tài xế phụ trách:</span>
                <span className="font-semibold text-slate-800">{data.driverName} ({data.driverPhone})</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Biển kiểm soát:</span>
                <span className="font-bold text-[#004ba0]">{data.vehicleNumber}</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate(`/schedule-change?code=${data.requestCode}`)}
                  className="w-full py-2.5 px-4 bg-[#fff5ee] hover:bg-[#ffe8d6] text-[#f37021] border border-[#f37021]/30 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Calendar size={15} />
                  <span>Đề xuất sửa thời gian cho đơn này</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: History Tab */}
          {activeTab === 'history' && (
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Khởi tạo yêu cầu</span>
                  <span>28/08/2025 08:15</span>
                </div>
                <p className="font-medium text-slate-700">Khách hàng ABC Trading đã tạo yêu cầu {data.requestCode}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Phê duyệt & Điều phối</span>
                  <span>28/08/2025 09:00</span>
                </div>
                <p className="font-medium text-slate-700">Điều phối viên đã phê duyệt và chỉ định xe {data.vehicleNumber}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
