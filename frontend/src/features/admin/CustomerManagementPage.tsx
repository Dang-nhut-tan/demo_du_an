import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Plus,
  Search,
  CheckCircle2,
  X,
  Mail,
  Phone,
  MapPin,
  Lock,
  UserPlus,
  RefreshCw,
  Power,
  Edit2,
} from 'lucide-react';
import {
  fetchCustomerAccounts,
  updateCompany,
  createCompany,
  createCustomerAccount,
  CustomerAccountRow,
  getStoredAccounts,
  saveStoredAccounts,
} from './adminApi';
import { Company } from '../../types';
import { pb } from '../../services/pocketbase';

export const CustomerManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'companies' | 'accounts'>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [accounts, setAccounts] = useState<CustomerAccountRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [addCompanyModal, setAddCompanyModal] = useState(false);
  const [editCompanyModal, setEditCompanyModal] = useState(false);
  const [addAccountModal, setAddAccountModal] = useState(false);

  // Form Company State
  const [companyName, setCompanyName] = useState('');
  const [companyTaxId, setCompanyTaxId] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  // Edit Company State
  const [editingCompanyId, setEditingCompanyId] = useState('');
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editCompanyTaxId, setEditCompanyTaxId] = useState('');
  const [editCompanyCode, setEditCompanyCode] = useState('');
  const [editCompanyEmail, setEditCompanyEmail] = useState('');
  const [editCompanyPhone, setEditCompanyPhone] = useState('');
  const [editCompanyAddress, setEditCompanyAddress] = useState('');
  const [editCompanyStatus, setEditCompanyStatus] = useState<'active' | 'inactive'>('active');

  const openEditCompany = (c: Company) => {
    setEditingCompanyId(c.id);
    setEditCompanyName(c.name);
    setEditCompanyTaxId(c.taxCode);
    setEditCompanyCode(c.code);
    setEditCompanyEmail(c.email);
    setEditCompanyPhone(c.phone);
    setEditCompanyAddress(c.address || '');
    setEditCompanyStatus(c.verified ? 'active' : 'inactive');
    setEditCompanyModal(true);
  };

  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompanyId) return;
    try {
      await updateCompany(editingCompanyId, {
        name: editCompanyName.trim(),
        taxCode: editCompanyTaxId.trim(),
        code: editCompanyCode.trim().toUpperCase(),
        email: editCompanyEmail.trim(),
        phone: editCompanyPhone.trim(),
        address: editCompanyAddress.trim(),
        verified: editCompanyStatus === 'active',
      });
      setSuccessMessage(`Đã cập nhật thông tin công ty "${editCompanyName}" thành công!`);
      setEditCompanyModal(false);
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadData();
    } catch (err: any) {
      alert('Lỗi cập nhật công ty: ' + err.message);
    }
  };

  // Form Account State
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('Demo@123456');
  const [accountName, setAccountName] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomerAccounts();
      setCompanies(data.companies);
      setAccounts(data.accounts);
      if (data.companies.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(data.companies[0].id);
      }
    } catch (_e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: companyName.trim(),
        code: companyCode.trim().toUpperCase() || `UIL-KH-${Math.floor(1000 + Math.random() * 9000)}`,
        taxId: companyTaxId.trim(),
        email: companyEmail.trim(),
        phone: companyPhone.trim(),
        address: companyAddress.trim(),
        status: 'active',
      };

      await createCompany(payload);

      setSuccessMessage(`Đã thêm công ty khách hàng "${payload.name}" thành công!`);
      setAddCompanyModal(false);
      setCompanyName('');
      setCompanyTaxId('');
      setCompanyCode('');
      setCompanyEmail('');
      setCompanyPhone('');
      setCompanyAddress('');
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadData();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const comp = companies.find((c) => c.id === selectedCompanyId) || companies[0];
      const payload = {
        email: accountEmail.trim(),
        password: accountPassword,
        passwordConfirm: accountPassword,
        name: accountName.trim(),
        role: 'customer',
        company: comp?.id,
        company_name: comp?.name,
      };

      await createCustomerAccount(payload);

      setSuccessMessage(`Đã tạo tài khoản khách hàng "${payload.email}" thành công!`);
      setAddAccountModal(false);
      setAccountEmail('');
      setAccountName('');
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadData();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  const toggleAccountStatus = async (account: CustomerAccountRow) => {
    const nextState = !account.isActive;
    try {
      try {
        await pb.collection('users').update(account.id, { 
          verified: nextState,
          status: nextState ? 'active' : 'inactive'
        });
      } catch (_e) {
        // fallback
      }
      const updatedAccounts = accounts.map((a) => (a.id === account.id ? { ...a, isActive: nextState } : a));
      setAccounts(updatedAccounts);
      saveStoredAccounts(updatedAccounts);
      setSuccessMessage(`Đã ${nextState ? 'kích hoạt' : 'khóa tạm thời'} tài khoản "${account.email}"`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  const cleanQuery = (searchQuery || '').trim().toLowerCase();

  const filteredCompanies = (companies || []).filter((c) => {
    if (!c) return false;
    const name = (c.name || '').toLowerCase();
    const code = (c.code || '').toLowerCase();
    const taxCode = (c.taxCode || '').toLowerCase();
    return name.includes(cleanQuery) || code.includes(cleanQuery) || taxCode.includes(cleanQuery);
  });

  const filteredAccounts = (accounts || []).filter((a) => {
    if (!a) return false;
    const email = (a.email || '').toLowerCase();
    const name = (a.name || '').toLowerCase();
    const companyName = (a.companyName || '').toLowerCase();
    const companyCode = (a.companyCode || '').toLowerCase();
    return (
      email.includes(cleanQuery) ||
      name.includes(cleanQuery) ||
      companyName.includes(cleanQuery) ||
      companyCode.includes(cleanQuery)
    );
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header with Title and Creation Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Quản Lý Khách Hàng Doanh Nghiệp</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#004ba0]">
              {companies.length} công ty
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân bổ quyền truy cập, cô lập dữ liệu theo mã công ty và quản lý tài khoản người dùng portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddCompanyModal(true)}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 rounded-2xl text-xs font-bold shadow-sm transition-all"
          >
            <Building2 size={15} className="text-[#004ba0]" />
            <span>Thêm công ty</span>
          </button>
          <button
            onClick={() => setAddAccountModal(true)}
            className="inline-flex items-center gap-1.5 bg-[#004ba0] hover:bg-[#003b80] text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-[#004ba0]/25 transition-all"
          >
            <UserPlus size={15} />
            <span>Thêm tài khoản</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs Switcher: Doanh Nghiệp vs Tài Khoản */}
      <div className="bg-white rounded-3xl p-1.5 border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('companies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'companies'
                ? 'bg-[#004ba0] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 size={15} />
            <span>Danh sách Công ty ({companies.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'accounts'
                ? 'bg-[#004ba0] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users size={15} />
            <span>Tài khoản người dùng ({accounts.length})</span>
          </button>
        </div>

        <div className="relative w-64 pr-2 hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 rounded-xl border border-slate-200 outline-none"
          />
        </div>
      </div>

      {/* View 1: Companies Table */}
      {activeTab === 'companies' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-400 font-semibold uppercase text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Mã KH</th>
                  <th className="py-3 px-5">Tên công ty</th>
                  <th className="py-3 px-5">Mã số thuế</th>
                  <th className="py-3 px-5">Liên hệ</th>
                  <th className="py-3 px-5">Địa chỉ</th>
                  <th className="py-3 px-5 text-center">Trạng thái</th>
                  <th className="py-3 px-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-5 font-mono text-slate-600">{c.taxCode}</td>
                    <td className="py-3.5 px-5">
                      <div className="text-slate-800">{c.email}</div>
                      <div className="text-[11px] text-slate-400">{c.phone}</div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 max-w-xs truncate">{c.address || '—'}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{c.verified ? 'Đã xác thực' : 'Tạm khóa'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => openEditCompany(c)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#004ba0] hover:bg-blue-50 rounded-lg transition"
                        title="Chỉnh sửa thông tin công ty"
                      >
                        <Edit2 size={13} />
                        <span>Sửa</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: User Accounts Table */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-400 font-semibold uppercase text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Họ và tên</th>
                  <th className="py-3 px-5">Email đăng nhập</th>
                  <th className="py-3 px-5">Công ty liên kết</th>
                  <th className="py-3 px-5">Vai trò</th>
                  <th className="py-3 px-5 text-center">Trạng thái</th>
                  <th className="py-3 px-5 text-right">Khóa / Mở</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAccounts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">{a.name}</td>
                    <td className="py-3.5 px-5 font-mono text-[#004ba0]">{a.email}</td>
                    <td className="py-3.5 px-5 text-slate-700">
                      <div>{a.companyName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">({a.companyCode})</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-[#004ba0] border border-blue-100 uppercase">
                        {a.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {a.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Hoạt động</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          <span>Tạm khóa</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => toggleAccountStatus(a)}
                        className={`p-1.5 rounded-xl transition-all ${
                          a.isActive
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={a.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        <Power size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {addCompanyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">
            <div className="bg-[#004ba0] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base">Thêm Công Ty Khách Hàng</h3>
              <button onClick={() => setAddCompanyModal(false)} className="text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCompany} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên công ty *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Công ty TNHH Xuất Nhập Khẩu Toàn Cầu"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã số thuế *</label>
                  <input
                    type="text"
                    required
                    placeholder="0312345678"
                    value={companyTaxId}
                    onChange={(e) => setCompanyTaxId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã khách hàng</label>
                  <input
                    type="text"
                    placeholder="Tự sinh nếu bỏ trống"
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0] uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email liên hệ</label>
                  <input
                    type="email"
                    placeholder="logistics@company.com"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    placeholder="028 3999 8888"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Địa chỉ trụ sở / kho</label>
                <input
                  type="text"
                  placeholder="KCN Sóng Thần, Dĩ An, Bình Dương..."
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddCompanyModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-[#004ba0] hover:bg-[#003b80]"
                >
                  Lưu công ty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {editCompanyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">
            <div className="bg-[#004ba0] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base">Cập Nhật Thông Tin Doanh Nghiệp</h3>
              <button onClick={() => setEditCompanyModal(false)} className="text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditCompany} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên công ty *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Công ty TNHH Xuất Nhập Khẩu Toàn Cầu"
                  value={editCompanyName}
                  onChange={(e) => setEditCompanyName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0] font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã số thuế *</label>
                  <input
                    type="text"
                    required
                    placeholder="0312345678"
                    value={editCompanyTaxId}
                    onChange={(e) => setEditCompanyTaxId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã khách hàng</label>
                  <input
                    type="text"
                    value={editCompanyCode}
                    onChange={(e) => setEditCompanyCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0] uppercase font-mono bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email nhận thông báo</label>
                  <input
                    type="email"
                    placeholder="logistics@company.com"
                    value={editCompanyEmail}
                    onChange={(e) => setEditCompanyEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại công ty</label>
                  <input
                    type="tel"
                    placeholder="028 3999 8888"
                    value={editCompanyPhone}
                    onChange={(e) => setEditCompanyPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Địa chỉ trụ sở / nhà xưởng</label>
                <input
                  type="text"
                  placeholder="KCN Sóng Thần, Dĩ An, Bình Dương..."
                  value={editCompanyAddress}
                  onChange={(e) => setEditCompanyAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trạng thái doanh nghiệp</label>
                <select
                  value={editCompanyStatus}
                  onChange={(e) => setEditCompanyStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0] bg-white font-semibold"
                >
                  <option value="active">Hoạt động (Active - Được phép tạo booking)</option>
                  <option value="inactive">Tạm khóa (Inactive - Khóa tạo booking và truy cập)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditCompanyModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-[#004ba0] hover:bg-[#003b80]"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {addAccountModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">
            <div className="bg-[#004ba0] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base">Thêm Tài Khoản Khách Hàng</h3>
              <button onClick={() => setAddAccountModal(false)} className="text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gán vào Công ty *</label>
                <select
                  required
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0] font-semibold"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ và tên người đại diện *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn A"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email đăng nhập *</label>
                <input
                  type="email"
                  required
                  placeholder="customer@domain.vn"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mật khẩu khởi tạo</label>
                <input
                  type="text"
                  required
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">Mặc định: Demo@123456</p>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddAccountModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-[#004ba0] hover:bg-[#003b80]"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
