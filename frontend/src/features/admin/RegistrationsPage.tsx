import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  Mail,
  Phone,
  FileText,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Eye,
  Check,
  X,
  ShieldAlert,
} from 'lucide-react';
import {
  AdminRegistrationRequest,
  fetchAdminRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest,
} from './adminApi';

export const RegistrationsPage: React.FC = () => {
  const [requests, setRequests] = useState<AdminRegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<AdminRegistrationRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [targetRejectId, setTargetRejectId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminRegistrationRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load registration requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Status filter
      if (statusFilter !== 'ALL' && req.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = req.fullName.toLowerCase().includes(q);
        const matchEmail = req.email.toLowerCase().includes(q);
        const matchCompany = req.companyName.toLowerCase().includes(q);
        const matchTax = req.taxCode.toLowerCase().includes(q);
        const matchPhone = req.phone.toLowerCase().includes(q);
        return matchName || matchEmail || matchCompany || matchTax || matchPhone;
      }
      return true;
    });
  }, [requests, statusFilter, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter((r) => r.status === 'PENDING').length,
      approved: requests.filter((r) => r.status === 'APPROVED').length,
      rejected: requests.filter((r) => r.status === 'REJECTED').length,
    };
  }, [requests]);

  // Handle Approve
  const handleApprove = async (request: AdminRegistrationRequest) => {
    if (!window.confirm(`Bạn có chắc chắn muốn phê duyệt tài khoản "${request.fullName}" thuộc doanh nghiệp "${request.companyName}"?`)) {
      return;
    }
    setActionLoading(true);
    try {
      await approveRegistrationRequest(request.id);
      showToast(`Đã phê duyệt tài khoản "${request.fullName}" thành công!`, 'success');
      if (selectedRequest?.id === request.id) {
        setSelectedRequest(null);
      }
      await loadRequests();
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi phê duyệt yêu cầu đăng ký', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Reject Modal
  const openRejectDialog = (requestId: string) => {
    setTargetRejectId(requestId);
    setRejectReason('Thông tin doanh nghiệp hoặc mã số thuế không khớp với dữ liệu đăng ký kinh doanh.');
    setShowRejectModal(true);
  };

  // Submit Reject
  const handleConfirmReject = async () => {
    if (!targetRejectId) return;
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối yêu cầu.');
      return;
    }
    setActionLoading(true);
    try {
      await rejectRegistrationRequest(targetRejectId, rejectReason.trim());
      showToast('Đã từ chối yêu cầu đăng ký tài khoản.', 'success');
      setShowRejectModal(false);
      setTargetRejectId(null);
      if (selectedRequest?.id === targetRejectId) {
        setSelectedRequest(null);
      }
      await loadRequests();
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi từ chối yêu cầu', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} className="animate-spin" /> Chờ duyệt
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} /> Đã duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} /> Đã từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-rose-600 text-white border-rose-500'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-[#003366] rounded-xl">
              <UserCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Phê duyệt Đăng ký Khách hàng
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Kiểm duyệt hồ sơ tài khoản doanh nghiệp mới đăng ký vào cổng U&I Logistics PWA
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadRequests}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Tải lại</span>
        </button>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-6 space-y-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'ALL'
                ? 'bg-[#003366] text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <span>Tất cả</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              statusFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
            }`}
          >
            <Clock size={13} />
            <span>Chờ duyệt</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              statusFilter === 'PENDING' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'
            }`}>
              {counts.pending}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
            }`}
          >
            <CheckCircle size={13} />
            <span>Đã duyệt</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              statusFilter === 'APPROVED' ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-900'
            }`}>
              {counts.approved}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800'
            }`}
          >
            <XCircle size={13} />
            <span>Đã từ chối</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              statusFilter === 'REJECTED' ? 'bg-white/20 text-white' : 'bg-rose-200 text-rose-900'
            }`}>
              {counts.rejected}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo họ tên, email, tên công ty, mã số thuế hoặc số điện thoại..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw size={32} className="animate-spin mx-auto text-[#003366] mb-3" />
            <p className="text-sm font-medium">Đang tải danh sách đăng ký...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <UserCheck size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-700">Không tìm thấy yêu cầu đăng ký nào phù hợp</p>
            <p className="text-xs text-slate-400 mt-1">Hãy thử đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Người đăng ký</th>
                  <th className="py-3.5 px-4">Doanh nghiệp &amp; MST</th>
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition group">
                    {/* User Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{req.fullName}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Mail size={12} className="text-slate-400" />
                        <span>{req.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Phone size={12} className="text-slate-400" />
                        <span>{req.phone}</span>
                      </div>
                    </td>

                    {/* Company Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Building size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[220px]">{req.companyName}</span>
                      </div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">
                        MST: <span className="font-semibold text-slate-700">{req.taxCode}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(req.created).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>

                        {req.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(req)}
                              disabled={actionLoading}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1 active:scale-95 disabled:opacity-50"
                              title="Phê duyệt"
                            >
                              <Check size={14} />
                              <span className="hidden sm:inline">Duyệt</span>
                            </button>

                            <button
                              onClick={() => openRejectDialog(req.id)}
                              disabled={actionLoading}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition flex items-center gap-1 active:scale-95 disabled:opacity-50"
                              title="Từ chối"
                            >
                              <X size={14} />
                              <span className="hidden sm:inline">Từ chối</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL / DRAWER */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#003366] to-[#004ba0] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck size={20} className="text-[#f37021]" />
                <h3 className="font-bold text-base tracking-tight">Chi tiết hồ sơ đăng ký</h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              {/* Status Header */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Trạng thái hồ sơ</span>
                <div>{getStatusBadge(selectedRequest.status)}</div>
              </div>

              {/* Section 1: Account Info */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#003366] mb-2 flex items-center gap-1.5">
                  <FileText size={14} /> Thông tin người đại diện
                </h4>
                <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-2 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-xs">Họ và tên:</span>
                    <span className="font-semibold text-slate-900">{selectedRequest.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-xs">Email đăng nhập:</span>
                    <span className="font-semibold text-slate-900">{selectedRequest.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-xs">Số điện thoại:</span>
                    <span className="font-semibold text-slate-900">{selectedRequest.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-xs">Thời gian gửi:</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(selectedRequest.created).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Business Info */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#003366] mb-2 flex items-center gap-1.5">
                  <Building size={14} /> Thông tin doanh nghiệp
                </h4>
                <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-2 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-xs">Tên công ty:</span>
                    <span className="font-semibold text-slate-900 text-right">{selectedRequest.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-xs">Mã số thuế:</span>
                    <span className="font-mono font-bold text-[#003366]">{selectedRequest.taxCode}</span>
                  </div>
                  {selectedRequest.companyAddress && (
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-slate-500 text-xs shrink-0">Địa chỉ:</span>
                      <span className="font-medium text-slate-800 text-right">{selectedRequest.companyAddress}</span>
                    </div>
                  )}
                  {selectedRequest.notificationEmail && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-xs">Email nhận TB:</span>
                      <span className="font-medium text-slate-800">{selectedRequest.notificationEmail}</span>
                    </div>
                  )}
                  {selectedRequest.companyPhone && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-xs">Điện thoại cty:</span>
                      <span className="font-medium text-slate-800">{selectedRequest.companyPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection Note if rejected */}
              {selectedRequest.status === 'REJECTED' && selectedRequest.rejectionReason && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert size={14} /> Lý do từ chối:
                  </div>
                  <p>{selectedRequest.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition"
              >
                Đóng
              </button>

              {selectedRequest.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => {
                      const req = selectedRequest;
                      setSelectedRequest(null);
                      openRejectDialog(req.id);
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-sm font-bold transition"
                  >
                    Từ chối
                  </button>

                  <button
                    onClick={() => handleApprove(selectedRequest)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center gap-1.5"
                  >
                    <Check size={16} /> Phê duyệt ngay
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} />
                <h3 className="font-bold text-base">Từ chối yêu cầu đăng ký</h3>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Vui lòng nhập lý do từ chối để lưu vào lịch sử kiểm duyệt (Audit Log). Tài khoản này sẽ không được cấp quyền truy cập hệ thống U&amp;I Logistics.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Lý do từ chối <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                  placeholder="Nhập lý do cụ thể..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50"
              >
                {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
