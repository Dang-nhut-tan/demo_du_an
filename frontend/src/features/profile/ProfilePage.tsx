import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Users,
  Settings,
  Info,
  FileText,
  Mail,
  Phone,
  Truck,
  Warehouse,
  Anchor,
  Save,
  CheckCircle2,
  Box,
} from 'lucide-react';
import { AppHeader } from '../../components/layout/AppHeader';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { FormInput } from '../../components/ui/FormInput';
import { FormSelect } from '../../components/ui/FormSelect';
import { SearchableCombobox } from '../../components/ui/SearchableCombobox';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import {
  getCompanyProfile,
  saveCompanyProfile,
  DEFAULT_COMPANY,
  DEFAULT_SHIPPING_SETTINGS,
} from '../../services/pocketbase';
import { fetchMasterData, MasterData, FALLBACK_MASTER_DATA } from '../booking/bookingApi';
import { Company, ShippingDefaults } from '../../types';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'company' | 'locations' | 'contacts' | 'settings'>('company');

  const [company, setCompany] = useState<Company>(DEFAULT_COMPANY);
  const [defaults, setDefaults] = useState<ShippingDefaults>(DEFAULT_SHIPPING_SETTINGS);
  const [masterData, setMasterData] = useState<MasterData>(FALLBACK_MASTER_DATA);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadData = async () => {
    try {
      const [profileData, md] = await Promise.all([
        getCompanyProfile(),
        fetchMasterData(),
      ]);
      setCompany(profileData.company);
      setDefaults(profileData.defaults);
      setMasterData(md);
    } catch (_e) {
      // fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveCompanyProfile(company, defaults);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Đã có lỗi khi lưu thông tin. Dữ liệu đã được lưu tạm trên thiết bị.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#f8fafc] text-slate-800">
      {/* App Header */}
      <AppHeader
        showBack={true}
        onBack={() => navigate('/')}
        unreadCount={2}
        onOpenNotifications={() => navigate('/notifications')}
      />

      <main className="flex-1 min-h-0 pb-6 overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar">
        {/* Company Identity Header Card with Swoosh Wave */}
        <div className="relative bg-gradient-to-b from-[#004ba0] via-[#004ba0] to-blue-700 text-white pt-4 pb-10 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-100 text-[#004ba0] flex items-center justify-center shadow-lg border-2 border-white/40 shrink-0">
              <Building2 size={32} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                {company.name}
              </h1>
              <p className="text-xs text-blue-100 font-medium mt-0.5">
                Mã khách hàng: {company.code}
              </p>
              <div className="mt-1.5 inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>Đã xác thực</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Content Body overlapping header */}
        <div className="-mt-6 px-4 sm:px-6 space-y-4 relative z-10">
          
          {/* Navigation Tabs */}
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200/80 flex items-center overflow-x-auto no-scrollbar gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('company')}
              className={`flex-1 min-w-[76px] py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all whitespace-nowrap ${
                activeTab === 'company'
                  ? 'bg-blue-50 text-[#004ba0] shadow-sm font-bold border-b-2 border-[#004ba0]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 size={14} className="shrink-0" />
              <span className="text-[11px] sm:text-xs">Công ty</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('locations')}
              className={`flex-1 min-w-[76px] py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all whitespace-nowrap ${
                activeTab === 'locations'
                  ? 'bg-blue-50 text-[#004ba0] shadow-sm font-bold border-b-2 border-[#004ba0]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapPin size={14} className="shrink-0" />
              <span className="text-[11px] sm:text-xs">Kho &amp; Cảng</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 min-w-[76px] py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all whitespace-nowrap ${
                activeTab === 'contacts'
                  ? 'bg-blue-50 text-[#004ba0] shadow-sm font-bold border-b-2 border-[#004ba0]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users size={14} className="shrink-0" />
              <span className="text-[11px] sm:text-xs">Liên hệ</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex-1 min-w-[76px] py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-all whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-blue-50 text-[#004ba0] shadow-sm font-bold border-b-2 border-[#004ba0]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings size={14} className="shrink-0" />
              <span className="text-[11px] sm:text-xs">Tùy chọn</span>
            </button>
          </div>

          {/* Success Banner */}
          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Cập nhật thông tin công ty và cấu hình tự động điền thành công!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            {/* Section 1: Thông tin công ty */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100">
                <Building2 size={18} className="text-[#004ba0]" />
                <h2 className="font-bold text-slate-800 text-sm">Thông tin công ty</h2>
              </div>

              <div className="flex items-start gap-2 bg-blue-50/70 p-3 rounded-2xl text-xs text-[#004ba0] mb-4">
                <Info size={15} className="shrink-0 mt-0.5 text-[#004ba0]" />
                <span>Thông tin này sẽ được tự động điền khi bạn tạo yêu cầu vận chuyển.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormInput
                  label="Tên công ty"
                  required
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  icon={<Building2 size={16} />}
                />
                <FormInput
                  label="Mã số thuế"
                  required
                  value={company.taxCode}
                  onChange={(e) => setCompany({ ...company, taxCode: e.target.value })}
                  icon={<FileText size={16} />}
                />
                <FormInput
                  label="Email nhận thông báo"
                  type="email"
                  required
                  value={company.email}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                  icon={<Mail size={16} />}
                />
                <FormInput
                  label="Số điện thoại"
                  type="tel"
                  required
                  value={company.phone}
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                  icon={<Phone size={16} />}
                />
              </div>
            </div>

            {/* Section 2: Thông tin mặc định cho yêu cầu vận chuyển */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-[#004ba0] shrink-0" />
                  <h2 className="font-bold text-slate-800 text-sm leading-snug">
                    Thông tin mặc định cho yêu cầu vận chuyển
                  </h2>
                </div>

                {/* Auto-fill Toggle Switch */}
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 self-end sm:self-auto shrink-0">
                  <span>Tự động điền</span>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={defaults.autoFillEnabled}
                      onChange={(e) => setDefaults({ ...defaults, autoFillEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#004ba0]"></div>
                  </div>
                </label>
              </div>

              <div className="flex items-start gap-2 bg-blue-50/70 p-3 rounded-2xl text-xs text-[#004ba0] mb-4">
                <Info size={15} className="shrink-0 mt-0.5 text-[#004ba0]" />
                <span>Các thông tin thường dùng sẽ được tự động gợi ý khi tạo yêu cầu mới.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <SearchableCombobox
                  name="defaultContainerType"
                  label="Loại container mặc định"
                  value={defaults.defaultContainerType}
                  onChange={(val) => setDefaults({ ...defaults, defaultContainerType: val })}
                  icon={<Box size={16} />}
                  options={masterData.containerTypes}
                  onRefresh={loadData}
                  onOpen={loadData}
                />

                <SearchableCombobox
                  name="defaultPickupLocation"
                  label="Điểm lấy hàng (kho mặc định)"
                  value={defaults.defaultPickupLocation}
                  onChange={(val) => setDefaults({ ...defaults, defaultPickupLocation: val })}
                  icon={<Warehouse size={16} />}
                  options={masterData.locations}
                  onRefresh={loadData}
                  onOpen={loadData}
                />

                <SearchableCombobox
                  name="defaultDeliveryLocation"
                  label="Điểm giao hàng (mặc định)"
                  value={defaults.defaultDeliveryLocation}
                  onChange={(val) => setDefaults({ ...defaults, defaultDeliveryLocation: val })}
                  icon={<Anchor size={16} />}
                  options={masterData.ports}
                  onRefresh={loadData}
                  onOpen={loadData}
                />

                <FormSelect
                  label="Loại yêu cầu mặc định"
                  value={defaults.defaultRequestType}
                  onChange={(e) => setDefaults({ ...defaults, defaultRequestType: e.target.value })}
                  icon={<Truck size={16} />}
                  options={[
                    'Vận chuyển container xuất khẩu',
                    'Vận chuyển container nhập khẩu',
                    'Vận chuyển nội địa đường bộ',
                  ]}
                />
              </div>
            </div>

            {/* Section 3: Thông tin bổ sung */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100">
                <FileText size={18} className="text-[#004ba0]" />
                <h2 className="font-bold text-slate-800 text-sm">Thông tin bổ sung</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ghi chú mặc định (nếu có, ví dụ: yêu cầu chứng từ, quy định đóng hàng, ...)
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={defaults.defaultNotes || ''}
                    onChange={(e) => setDefaults({ ...defaults, defaultNotes: e.target.value })}
                    placeholder="Nhập ghi chú mặc định khi tạo booking..."
                    className="w-full p-3 text-sm text-slate-800 placeholder-slate-400 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 focus:border-[#004ba0] focus:ring-2 focus:ring-[#004ba0]/15 outline-none transition-all resize-none"
                  />
                  <div className="text-right text-[11px] text-slate-400 mt-1">
                    {(defaults.defaultNotes || '').length} / 500
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <PrimaryButton
                type="button"
                variant="secondary"
                size="md"
                onClick={handleCancel}
                className="flex-1"
              >
                Hủy
              </PrimaryButton>

              <PrimaryButton
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                icon={<Save size={18} />}
                className="flex-1"
              >
                Lưu thay đổi
              </PrimaryButton>
            </div>
          </form>
        </div>
      </main>

      {/* Persistent Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
