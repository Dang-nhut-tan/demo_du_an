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
  LogOut,
  Shield,
  HelpCircle,
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
  logout,
  pb,
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

  // Real-time synchronization for Company Profile updates
  useEffect(() => {
    const handleProfileSync = () => {
      loadData();
    };

    pb.collection('companies').subscribe('*', handleProfileSync).catch(() => {});

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      pb.collection('companies').unsubscribe('*').catch(() => {});
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const scrollToSection = (tab: 'company' | 'locations' | 'contacts' | 'settings', elementId: string) => {
    setActiveTab(tab);
    const elem = document.getElementById(elementId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
          <div className="flex items-center justify-between gap-3">
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

            <button
              type="button"
              onClick={handleLogout}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-rose-500/80 text-white hover:text-white transition shadow-sm flex items-center gap-1 text-xs font-semibold shrink-0"
              title="Thoát phiên làm việc"
              aria-label="Thoát phiên làm việc"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>
        </div>

        {/* Floating Content Body overlapping header */}
        <div className="-mt-6 px-4 sm:px-6 space-y-4 relative z-10">
          
          {/* Navigation Tabs */}
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200/80 flex items-center overflow-x-auto no-scrollbar gap-1 text-xs font-semibold sticky top-0 z-20">
            <button
              type="button"
              onClick={() => scrollToSection('company', 'section-company')}
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
              onClick={() => scrollToSection('locations', 'section-locations')}
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
              onClick={() => scrollToSection('contacts', 'section-contacts')}
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
              onClick={() => scrollToSection('settings', 'section-settings')}
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
            <div id="section-company" className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 scroll-mt-14 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 size={18} className="text-[#004ba0]" />
                <h2 className="font-bold text-slate-800 text-sm">Hồ sơ pháp lý doanh nghiệp</h2>
              </div>

              <div className="flex items-start gap-2 bg-blue-50/70 p-3 rounded-2xl text-xs text-[#004ba0]">
                <Info size={15} className="shrink-0 mt-0.5 text-[#004ba0]" />
                <span>Thông tin này liên kết trực tiếp với hồ sơ Booking xuất nhập khẩu và hóa đơn điện tử.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormInput
                  label="Tên doanh nghiệp"
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
                  label="Mã khách hàng nội bộ"
                  disabled
                  value={company.code}
                  icon={<Shield size={16} />}
                />
                <FormInput
                  label="Địa chỉ trụ sở chính"
                  value={company.address || ''}
                  onChange={(e) => setCompany({ ...company, address: e.target.value })}
                  icon={<MapPin size={16} />}
                />
              </div>
            </div>

            {/* Section 2: Thông tin mặc định cho yêu cầu vận chuyển (Kho & Cảng) */}
            <div id="section-locations" className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 scroll-mt-14 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-[#004ba0]" />
                  <h2 className="font-bold text-slate-800 text-sm">Thông tin mặc định cho yêu cầu vận chuyển</h2>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-blue-50/70 p-3 rounded-2xl text-xs text-[#004ba0]">
                <Info size={15} className="shrink-0 mt-0.5 text-[#004ba0]" />
                <span>Các thông tin thường dùng sẽ được tự động gợi ý khi tạo yêu cầu mới.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <SearchableCombobox
                  name="defaultContainerType"
                  label="Loại container thường dùng"
                  value={defaults.defaultContainerType}
                  onChange={(val) => setDefaults({ ...defaults, defaultContainerType: val })}
                  icon={<Box size={16} />}
                  options={masterData.containerTypes}
                  onRefresh={loadData}
                  onOpen={loadData}
                />

                <SearchableCombobox
                  name="defaultPickupLocation"
                  label="Kho đóng hàng mặc định"
                  value={defaults.defaultPickupLocation}
                  onChange={(val) => setDefaults({ ...defaults, defaultPickupLocation: val })}
                  icon={<Warehouse size={16} />}
                  options={masterData.locations}
                  onRefresh={loadData}
                  onOpen={loadData}
                />

                <SearchableCombobox
                  name="defaultDeliveryLocation"
                  label="Cảng đích mặc định"
                  value={defaults.defaultDeliveryLocation}
                  onChange={(val) => setDefaults({ ...defaults, defaultDeliveryLocation: val })}
                  icon={<Anchor size={16} />}
                  options={masterData.ports}
                  onRefresh={loadData}
                  onOpen={loadData}
                />

                <FormSelect
                  label="Phương thức vận chuyển"
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

            {/* Section 3: Đầu mối liên hệ */}
            <div id="section-contacts" className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 scroll-mt-14 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Users size={18} className="text-[#004ba0]" />
                <h2 className="font-bold text-slate-800 text-sm">Đầu mối liên hệ &amp; Thông báo</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormInput
                  label="Email nhận thông báo đơn hàng"
                  type="email"
                  required
                  value={company.email}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                  icon={<Mail size={16} />}
                />
                <FormInput
                  label="Số điện thoại điều hành"
                  type="tel"
                  required
                  value={company.phone}
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                  icon={<Phone size={16} />}
                />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1 mt-3">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-[#004ba0]" /> Hỗ trợ khách hàng 24/7 U&amp;I Logistics:
                </div>
                <p>Hotline Điều vận: <span className="font-semibold text-[#004ba0]">1900 5858 (Nhánh 2)</span></p>
                <p>Email CSKH: <span className="font-semibold text-[#004ba0]">customer.care@unilogistics.vn</span></p>
              </div>
            </div>

            {/* Section 4: Cấu hình tự động điền & Đăng xuất */}
            <div id="section-settings" className="space-y-4 scroll-mt-14">
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Settings size={18} className="text-[#004ba0]" />
                    <h2 className="font-bold text-slate-800 text-sm">Cấu hình tự động điền</h2>
                  </div>

                  {/* Toggle Switch */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <span>Bật tự động điền</span>
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Ghi chú mặc định khi tạo booking
                  </label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={defaults.defaultNotes || ''}
                    onChange={(e) => setDefaults({ ...defaults, defaultNotes: e.target.value })}
                    placeholder="Nhập ghi chú mặc định (ví dụ: yêu cầu chứng từ kiểm định, quy định chằng buộc hàng gỗ...)"
                    className="w-full p-3 text-sm text-slate-800 placeholder-slate-400 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 focus:border-[#004ba0] focus:ring-2 focus:ring-[#004ba0]/15 outline-none transition-all resize-none"
                  />
                  <div className="text-right text-[11px] text-slate-400 mt-1">
                    {(defaults.defaultNotes || '').length} / 500
                  </div>
                </div>
              </div>

              {/* Logout Card */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Đăng xuất tài khoản</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kết thúc phiên làm việc an toàn trên thiết bị này
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shrink-0"
                >
                  <LogOut size={15} />
                  <span>Đăng xuất</span>
                </button>
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
                Quay lại
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
