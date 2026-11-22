import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Calendar,
  Box,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  FileText,
  AlertCircle,
  ChevronRight,
  LogOut,
  Send,
} from 'lucide-react';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  DispatcherBooking,
  DispatcherScheduleChange,
  fetchDispatcherBookings,
  approveBookingRequest,
  rejectBookingRequest,
  fetchScheduleChangeProposals,
  approveScheduleChangeProposal,
  rejectScheduleChangeProposal,
  updateTransportStage,
} from './dispatcherApi';
import { logout, pb } from '../../services/pocketbase';

export const DispatcherDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'bookings' | 'changes' | 'progress'>('bookings');
  const [bookingFilter, setBookingFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [bookings, setBookings] = useState<DispatcherBooking[]>([]);
  const [proposals, setProposals] = useState<DispatcherScheduleChange[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Reject Modal state
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectingProposalId, setRejectingProposalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Progress update state
  const [selectedBookingForProgress, setSelectedBookingForProgress] = useState<string>('');
  const [newStage, setNewStage] = useState('transporting');
  const [stageNote, setStageNote] = useState('');
  const [updatingStage, setUpdatingStage] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [bList, pList] = await Promise.all([
          fetchDispatcherBookings(),
          fetchScheduleChangeProposals(),
        ]);
        if (mounted) {
          setBookings(bList);
          setProposals(pList);
          if (bList.length > 0 && !selectedBookingForProgress) {
            setSelectedBookingForProgress(bList[0].id);
          }
        }
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
  }, [refreshKey]);

  // Real-time synchronization for Dispatcher Portal (Live updates on new bookings & changes)
  useEffect(() => {
    const handleDispatcherSync = () => {
      setRefreshKey((k) => k + 1);
    };

    pb.collection('booking_requests').subscribe('*', handleDispatcherSync).catch(() => {});
    pb.collection('schedule_change_requests').subscribe('*', handleDispatcherSync).catch(() => {});
    pb.collection('transport_progress').subscribe('*', handleDispatcherSync).catch(() => {});

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        setRefreshKey((k) => k + 1);
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      pb.collection('booking_requests').unsubscribe('*').catch(() => {});
      pb.collection('schedule_change_requests').unsubscribe('*').catch(() => {});
      pb.collection('transport_progress').unsubscribe('*').catch(() => {});
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  const handleApproveBooking = async (id: string) => {
    try {
      await approveBookingRequest(id);
      showToast('Đã phê duyệt yêu cầu vận chuyển thành công!', 'success');
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      showToast(e?.message || 'Lỗi phê duyệt yêu cầu', 'error');
    }
  };

  const handleConfirmRejectBooking = async () => {
    if (!rejectingBookingId || !rejectionReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối yêu cầu', 'error');
      return;
    }
    try {
      await rejectBookingRequest(rejectingBookingId, rejectionReason);
      setRejectingBookingId(null);
      setRejectionReason('');
      showToast('Đã từ chối yêu cầu vận chuyển.', 'success');
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      showToast(e?.message || 'Lỗi khi từ chối yêu cầu', 'error');
    }
  };

  const handleApproveProposal = async (prop: DispatcherScheduleChange) => {
    try {
      const proposedVal = prop.items?.[0]?.newValue || '30/08/2025 10:00';
      await approveScheduleChangeProposal(prop.id, prop.bookingId, proposedVal);
      showToast(`Đã duyệt đề xuất đổi lịch sang: ${proposedVal}`, 'success');
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      showToast(e?.message || 'Lỗi duyệt đề xuất', 'error');
    }
  };

  const handleConfirmRejectProposal = async () => {
    if (!rejectingProposalId || !rejectionReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối', 'error');
      return;
    }
    try {
      await rejectScheduleChangeProposal(rejectingProposalId, rejectionReason);
      setRejectingProposalId(null);
      setRejectionReason('');
      showToast('Đã từ chối đề xuất thay đổi thời gian.', 'success');
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      showToast(e?.message || 'Lỗi khi từ chối đề xuất', 'error');
    }
  };

  const handleUpdateProgressStage = async () => {
    if (!selectedBookingForProgress) {
      showToast('Vui lòng chọn đơn hàng cần cập nhật tiến độ', 'error');
      return;
    }
    setUpdatingStage(true);
    try {
      await updateTransportStage(selectedBookingForProgress, newStage, stageNote);
      showToast('Cập nhật tiến độ thành công! Khách hàng sẽ thấy ngay lập tức.', 'success');
      setStageNote('');
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      showToast(e?.message || 'Lỗi cập nhật tiến độ', 'error');
    } finally {
      setUpdatingStage(false);
    }
  };

  const pendingBookingsCount = bookings.filter((b) => b.status === 'PENDING').length;
  const pendingProposalsCount = proposals.filter((p) => p.status === 'PENDING').length;

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'ALL') return true;
    return b.status === bookingFilter;
  });

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-100">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-rose-600 text-white border-rose-500'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Dispatcher Header */}
      <header className="shrink-0 bg-slate-900 text-white px-4 py-3.5 shadow-md z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-black text-lg tracking-wide text-white italic">
              U&amp;I <span className="text-[#f37021]">Logistics</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#f37021] text-white text-[10px] font-extrabold tracking-wider uppercase">
              Điều Phối Viên
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold transition"
            >
              <LogOut size={14} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-5 flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
        {/* Navigation Tabs */}
        <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'bookings'
                ? 'bg-[#004ba0] text-white shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            <FileText size={15} />
            <span>Yêu cầu vận chuyển</span>
            {pendingBookingsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#f37021] text-white text-[10px] font-extrabold">
                {pendingBookingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('changes')}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'changes'
                ? 'bg-[#004ba0] text-white shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            <Calendar size={15} />
            <span>Đề xuất đổi lịch</span>
            {pendingProposalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#f37021] text-white text-[10px] font-extrabold">
                {pendingProposalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'progress'
                ? 'bg-[#004ba0] text-white shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            <Truck size={15} />
            <span>Cập nhật tiến độ xe</span>
          </button>
        </div>

        {/* TAB 1: BOOKING REQUESTS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {/* Sub Filter */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-slate-500">Lọc theo:</span>
              <button
                onClick={() => setBookingFilter('PENDING')}
                className={`px-3 py-1.5 rounded-xl border transition ${
                  bookingFilter === 'PENDING'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Chờ duyệt ({pendingBookingsCount})
              </button>
              <button
                onClick={() => setBookingFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-xl border transition ${
                  bookingFilter === 'APPROVED'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Đã duyệt
              </button>
              <button
                onClick={() => setBookingFilter('REJECTED')}
                className={`px-3 py-1.5 rounded-xl border transition ${
                  bookingFilter === 'REJECTED'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Đã từ chối
              </button>
              <button
                onClick={() => setBookingFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl border transition ${
                  bookingFilter === 'ALL'
                    ? 'bg-[#004ba0] text-white border-[#004ba0]'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Tất cả
              </button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-500 text-xs">
                  Không có yêu cầu nào trong danh mục này.
                </div>
              ) : (
                filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-[#004ba0] text-sm">
                          {b.code}
                        </span>
                        <span className="text-xs text-slate-400">
                          (Booking: {b.bookingNumber})
                        </span>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block">Khách hàng:</span>
                        <span className="font-bold text-slate-800">{b.companyName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Hãng tàu / Chuyến:</span>
                        <span className="font-semibold text-slate-800">
                          {b.shippingLine} {b.vesselVoyage ? `- ${b.vesselVoyage}` : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Nơi đóng hàng → Cảng đến:</span>
                        <span className="font-semibold text-slate-800">
                          {b.pickupLocation} → {b.deliveryLocation}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Số lượng container:</span>
                        <span className="font-bold text-[#004ba0]">{b.containerSummary}</span>
                      </div>
                    </div>

                    {b.notes && (
                      <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 italic">
                        Ghi chú khách hàng: {b.notes}
                      </div>
                    )}

                    {b.rejectionReason && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                        Lý do từ chối: {b.rejectionReason}
                      </div>
                    )}

                    {/* Action buttons for PENDING requests */}
                    {b.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setRejectingBookingId(b.id);
                            setRejectionReason('');
                          }}
                          className="px-4 py-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <XCircle size={15} />
                          <span>Từ chối</span>
                        </button>

                        <button
                          onClick={() => handleApproveBooking(b.id)}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                        >
                          <CheckCircle size={15} />
                          <span>Phê duyệt</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULE CHANGE PROPOSALS */}
        {activeTab === 'changes' && (
          <div className="space-y-3">
            {proposals.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-500 text-xs">
                Không có đề xuất sửa thời gian nào.
              </div>
            ) : (
              proposals.map((prop) => (
                <div
                  key={prop.id}
                  className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#f37021] text-sm">
                        {prop.requestCode}
                      </span>
                      <span className="text-xs text-slate-400">({prop.bookingNumber})</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        prop.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : prop.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {prop.status === 'APPROVED'
                        ? 'Đã duyệt'
                        : prop.status === 'REJECTED'
                        ? 'Đã từ chối'
                        : 'Chờ duyệt'}
                    </span>
                  </div>

                  <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-100 text-xs space-y-1">
                    <span className="font-bold text-[#003366] block">Lý do đề xuất:</span>
                    <p className="text-slate-700">{prop.reason}</p>
                  </div>

                  {prop.status === 'PENDING' && (
                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setRejectingProposalId(prop.id);
                          setRejectionReason('');
                        }}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <XCircle size={15} />
                        <span>Từ chối</span>
                      </button>

                      <button
                        onClick={() => handleApproveProposal(prop)}
                        className="px-5 py-2 rounded-xl bg-[#004ba0] hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                      >
                        <CheckCircle size={15} />
                        <span>Duyệt thay đổi lịch</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: PROGRESS UPDATER */}
        {activeTab === 'progress' && (
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 font-bold text-sm text-[#003366]">
              <Truck size={17} className="text-[#004ba0]" />
              <span>Cập nhật tiến độ vận chuyển thời gian thực</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Chọn yêu cầu vận chuyển:
              </label>
              <select
                value={selectedBookingForProgress}
                onChange={(e) => setSelectedBookingForProgress(e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 outline-none focus:border-[#004ba0]"
              >
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {b.companyName} ({b.shippingLine})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Chuyển sang giai đoạn:
              </label>
              <select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                className="w-full text-xs font-bold text-[#004ba0] bg-blue-50 border border-blue-200 rounded-2xl px-3 py-2.5 outline-none focus:border-[#004ba0]"
              >
                <option value="received">1. Đã tiếp nhận yêu cầu</option>
                <option value="confirmed">2. Đã xác nhận Booking</option>
                <option value="planning">3. Đang lập kế hoạch điều xe</option>
                <option value="dispatched">4. Đã bố trí phương tiện & tài xế</option>
                <option value="packing">5. Đang đóng hàng tại kho</option>
                <option value="transporting">6. Đang vận chuyển đến cảng</option>
                <option value="completed">7. Hoàn tất tại cảng & thanh lý</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ghi chú tiến độ gửi khách hàng:
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Xe 51D-123.45 đang di chuyển trên cao tốc, dự kiến đến cảng lúc 14:00"
                value={stageNote}
                onChange={(e) => setStageNote(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 border border-slate-200 rounded-2xl px-3 py-2.5 outline-none focus:border-[#004ba0]"
              />
            </div>

            <PrimaryButton
              onClick={handleUpdateProgressStage}
              loading={updatingStage}
              fullWidth
              size="lg"
              icon={<Send size={16} />}
              iconPosition="right"
            >
              Cập nhật trạng thái ngay
            </PrimaryButton>
          </div>
        )}
      </main>

      {/* REJECTION REASON MODAL */}
      {(rejectingBookingId || rejectingProposalId) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertCircle size={18} />
              <span>Xác nhận từ chối</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nhập lý do từ chối gửi khách hàng:
              </label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Hết rỗng depot yêu cầu, vui lòng đổi ngày lấy rỗng..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 text-xs text-slate-800 border border-slate-200 rounded-2xl outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setRejectingBookingId(null);
                  setRejectingProposalId(null);
                }}
                className="py-2.5 px-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Hủy bỏ
              </button>

              <button
                onClick={() => {
                  if (rejectingBookingId) handleConfirmRejectBooking();
                  else if (rejectingProposalId) handleConfirmRejectProposal();
                }}
                className="py-2.5 px-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
