import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Database,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Sliders,
  History,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { fetchAdminDashboardMetrics, fetchRecentAuditLogs } from './adminApi';
import { AuditLog } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalCustomers: 2,
    totalCategories: 8,
    activeMasterDataRecords: 24,
    pendingReviews: 3,
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, logs] = await Promise.all([
        fetchAdminDashboardMetrics(),
        fetchRecentAuditLogs(),
      ]);
      setMetrics(m);
      setAuditLogs(logs);
    } catch (_err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-[#004ba0] via-[#003366] to-[#002244] text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-blue-100 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#f37021]"></span>
            <span>U&I Logistics Enterprise Master Data Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Bảng Điều Khiển Quản Trị Hệ Thống
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl leading-relaxed">
            Quản trị tập trung 8 danh mục Master Data, giám sát tài khoản khách hàng doanh nghiệp, và cấu hình động các trường nhập liệu TMS.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 bg-white/15 hover:bg-white/20 active:bg-white/25 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all border border-white/20 shrink-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới số liệu</span>
        </button>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#004ba0] flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">
            {metrics.totalCustomers}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500">Doanh nghiệp liên kết</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp size={12} />
              Đang hoạt động
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục</span>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#f37021] flex items-center justify-center">
              <Database size={20} />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">
            {metrics.totalCategories}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500">8 Danh mục TMS chuẩn</span>
            <span className="text-blue-600 font-semibold">100% Đồng bộ</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bản ghi hoạt động</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">
            {metrics.activeMasterDataRecords}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500">Đang phục vụ tạo booking</span>
            <span className="text-emerald-600 font-semibold">Khả dụng</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chờ phê duyệt</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">
            {metrics.pendingReviews}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500">Booking &amp; đổi lịch</span>
            <span className="text-amber-600 font-semibold">Cần điều phối</span>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/admin/registrations')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:border-[#004ba0] hover:shadow-md transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <UserCheck size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-600">
                Duyệt đăng ký mới
              </h3>
              <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Kiểm duyệt hồ sơ đăng ký tài khoản khách hàng, phê duyệt gán công ty hoặc từ chối.
            </p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/master-data')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:border-[#004ba0] hover:shadow-md transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#004ba0] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Database size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#004ba0]">
                Quản lý Master Data
              </h3>
              <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-[#004ba0] transition-all" />
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Thêm mới, sửa đổi, bật/tắt kích hoạt hãng tàu, kho bãi, cảng dỡ, quy cách container.
            </p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/customers')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:border-[#004ba0] hover:shadow-md transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#f37021] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Users size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#f37021]">
                Quản lý Khách hàng
              </h3>
              <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-[#f37021] transition-all" />
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Danh sách công ty khách hàng, gán tài khoản đăng nhập, kích hoạt hoặc khóa người dùng.
            </p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/form-config')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:border-[#004ba0] hover:shadow-md transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Sliders size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600">
                Cấu hình Form TMS
              </h3>
              <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Tùy chỉnh linh hoạt nhãn hiển thị, gợi ý placeholder, thứ tự trường và trợ giúp nghiệp vụ.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Audit Trail / Modifications Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={18} className="text-[#004ba0]" />
            <h2 className="font-bold text-sm text-slate-800">
              Nhật ký thay đổi gần đây (Audit History)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Bảo toàn dữ liệu lịch sử</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-400 font-semibold uppercase text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Hành động</th>
                <th className="py-3 px-6">Đối tượng / Danh mục</th>
                <th className="py-3 px-6">Chi tiết thay đổi</th>
                <th className="py-3 px-6">Người thực hiện</th>
                <th className="py-3 px-6 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-6">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-[#004ba0] border border-blue-100">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-6 font-bold text-slate-800">{log.entity}</td>
                  <td className="py-3 px-6 text-slate-500 max-w-xs truncate">{log.details}</td>
                  <td className="py-3 px-6 font-semibold text-slate-700">{log.user}</td>
                  <td className="py-3 px-6 text-right text-slate-400">{log.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
