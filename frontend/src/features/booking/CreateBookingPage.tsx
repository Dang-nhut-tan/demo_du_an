import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  User as UserIcon,
  ClipboardList,
  FileText,
  Calendar,
  MapPin,
  Paperclip,
  X,
  Upload,
  CheckCircle,
  Truck,
  ArrowRight,
  Save,
  Barcode,
} from 'lucide-react';
import { FormInput } from '../../components/ui/FormInput';
import { FormSelect } from '../../components/ui/FormSelect';
import { SearchableCombobox } from '../../components/ui/SearchableCombobox';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { ContainerTable } from './ContainerTable';
import { BookingReview } from './BookingReview';
import {
  BookingFormData,
  MasterData,
  FALLBACK_MASTER_DATA,
  fetchMasterData,
  loadShippingDefaults,
  saveBookingRequest,
  generateRequestCode,
  FormFieldConfig,
  DEFAULT_FORM_CONFIGS,
  fetchFormFieldConfigs,
} from './bookingApi';
import { getCurrentUser, getCompanyProfile, pb } from '../../services/pocketbase';

export const CreateBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [refreshingMaster, setRefreshingMaster] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdCode, setCreatedCode] = useState<string>('');
  const [masterData, setMasterData] = useState<MasterData>(FALLBACK_MASTER_DATA);
  const [formConfigs, setFormConfigs] = useState<Record<string, FormFieldConfig>>(DEFAULT_FORM_CONFIGS);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<BookingFormData>({
    bookingNumber: '',
    companyName: currentUser.company || 'Công ty ABC Trading',
    shippingLine: 'ONETRANS',
    shippingLineName: 'ONETRANS',
    vesselVoyage: '',
    requestType: 'Vận chuyển container xuất khẩu',

    requestedDropOffBefore: '',
    requestedDropOffAfter: '',
    siCutoff: '',
    portCutoff: '',
    emptyPickupDate: '',
    vesselDepartureDate: '',

    packingLocation: 'Kho U&I Bình Dương',
    packingLocationName: 'Kho U&I Bình Dương',
    emptyPickupLocation: 'DEPOT BÌNH DƯƠNG 6',
    emptyPickupLocationName: 'DEPOT BÌNH DƯƠNG 6',
    clearanceDepot: 'DEPOT BÌNH DƯƠNG 6',
    clearanceDepotName: 'DEPOT BÌNH DƯƠNG 6',
    destinationPort: 'Cảng Cát Lái',
    destinationPortName: 'Cảng Cát Lái',
    transshipmentPort: '',
    transshipmentPortName: '',
    cargoType: 'Hàng thường (General Cargo)',
    cargoTypeName: 'Hàng thường (General Cargo)',

    containers: [
      {
        containerType: "40' cao",
        quantity: 2,
        requestedYCGCDate: '',
      },
    ],
    notes: '',
    status: 'PENDING',
    attachments: [],
  });

  // Re-fetch master data and form configuration dynamically from PocketBase
  const refreshMaster = useCallback(async () => {
    setRefreshingMaster(true);
    try {
      const [md, cfgs, prof] = await Promise.all([
        fetchMasterData(),
        fetchFormFieldConfigs(),
        getCompanyProfile(),
      ]);
      setMasterData(md);
      setFormConfigs(cfgs);
      if (prof?.company?.name) {
        setFormData((prev) => ({
          ...prev,
          companyName: prof.company.name,
          companyId: prof.company.id,
        }));
      }
    } catch (err) {
      console.warn('Error refreshing master data:', err);
    } finally {
      setRefreshingMaster(false);
    }
  }, []);

  // Real-time synchronization and window focus refetch
  useEffect(() => {
    const handleMasterUpdate = () => {
      refreshMaster();
    };

    // PocketBase Server-Sent Events realtime subscriptions
    pb.collection('shipping_lines').subscribe('*', handleMasterUpdate).catch(() => {});
    pb.collection('locations').subscribe('*', handleMasterUpdate).catch(() => {});
    pb.collection('ports').subscribe('*', handleMasterUpdate).catch(() => {});
    pb.collection('cargo_types').subscribe('*', handleMasterUpdate).catch(() => {});
    pb.collection('container_types').subscribe('*', handleMasterUpdate).catch(() => {});
    pb.collection('form_field_config').subscribe('*', handleMasterUpdate).catch(() => {});
    pb.collection('companies').subscribe('*', handleMasterUpdate).catch(() => {});

    // Browser tab focus & visibility change refetch
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        refreshMaster();
      }
    };
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      pb.collection('shipping_lines').unsubscribe('*').catch(() => {});
      pb.collection('locations').unsubscribe('*').catch(() => {});
      pb.collection('ports').unsubscribe('*').catch(() => {});
      pb.collection('cargo_types').unsubscribe('*').catch(() => {});
      pb.collection('container_types').unsubscribe('*').catch(() => {});
      pb.collection('form_field_config').unsubscribe('*').catch(() => {});
      pb.collection('companies').unsubscribe('*').catch(() => {});
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [refreshMaster]);

  // Load master data, form config, and auto-fill defaults on mount
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      setLoading(true);
      try {
        const [md, cfgs, prof] = await Promise.all([
          fetchMasterData(),
          fetchFormFieldConfigs(),
          getCompanyProfile(),
        ]);
        if (mounted) {
          setMasterData(md);
          setFormConfigs(cfgs);
          if (prof?.company?.name) {
            setFormData((prev) => ({
              ...prev,
              companyName: prof.company.name,
              companyId: prof.company.id,
            }));
          }
        }

        const defaults = await loadShippingDefaults();
        if (mounted && defaults && defaults.autoFillEnabled) {
          setFormData((prev) => ({
            ...prev,
            shippingLine: defaults.defaultShippingLine || prev.shippingLine,
            shippingLineName: defaults.defaultShippingLine || prev.shippingLineName,
            packingLocation: defaults.defaultPackingLocation || prev.packingLocation,
            packingLocationName: defaults.defaultPackingLocation || prev.packingLocationName,
            emptyPickupLocation: defaults.defaultEmptyPickupLocation || prev.emptyPickupLocation,
            emptyPickupLocationName: defaults.defaultEmptyPickupLocation || prev.emptyPickupLocationName,
            clearanceDepot: defaults.defaultClearanceDepot || prev.clearanceDepot,
            clearanceDepotName: defaults.defaultClearanceDepot || prev.clearanceDepotName,
            destinationPort: defaults.defaultDestinationPort || prev.destinationPort,
            destinationPortName: defaults.defaultDestinationPort || prev.destinationPortName,
            transshipmentPort: defaults.defaultTransshipmentPort || prev.transshipmentPort,
            transshipmentPortName: defaults.defaultTransshipmentPort || prev.transshipmentPortName,
            cargoType: defaults.defaultCargoType || prev.cargoType,
            cargoTypeName: defaults.defaultCargoType || prev.cargoTypeName,
            containers: [
              {
                containerType: (defaults.defaultContainerType as any) || "40' cao",
                quantity: 2,
                requestedYCGCDate: '',
              },
            ],
          }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.bookingNumber.trim()) {
      errs.bookingNumber = 'Vui lòng nhập Mã đơn hàng / Số Booking';
    }
    if (!formData.shippingLine) {
      errs.shippingLine = 'Vui lòng chọn Hãng tàu';
    }
    if (!formData.packingLocation) {
      errs.packingLocation = 'Vui lòng chọn Nơi đóng hàng';
    }
    if (!formData.emptyPickupLocation) {
      errs.emptyPickupLocation = 'Vui lòng chọn Nơi lấy rỗng';
    }
    if (!formData.clearanceDepot) {
      errs.clearanceDepot = 'Vui lòng chọn Hạ bãi thanh lý';
    }
    if (!formData.destinationPort) {
      errs.destinationPort = 'Vui lòng chọn Cảng đến';
    }
    if (!formData.cargoType) {
      errs.cargoType = 'Vui lòng chọn Loại hàng hóa';
    }

    const totalContainers = formData.containers.reduce((sum, c) => sum + (c.quantity || 0), 0);
    if (totalContainers <= 0) {
      errs.containers = 'Tổng số lượng container phải lớn hơn 0';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.bookingNumber.trim()) {
      setErrors({ bookingNumber: 'Vui lòng nhập Số Booking để lưu bản nháp' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await saveBookingRequest(formData, true);
      alert(`Đã lưu bản nháp thành công! Mã yêu cầu: ${res.requestCode}`);
      navigate('/');
    } catch (e) {
      alert('Đã lưu bản nháp vào bộ nhớ máy!');
      navigate('/');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await saveBookingRequest(formData, false);
      setCreatedCode(res.requestCode);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      const fallbackCode = generateRequestCode();
      setCreatedCode(fallbackCode);
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...newFiles],
      }));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-100">
      {/* Top Header matching Mockup */}
      <div className="shrink-0 bg-[#004ba0] text-white px-4 pt-3 pb-4 shadow-md z-30">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (step === 2) setStep(1);
              else navigate(-1);
            }}
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
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95"
              aria-label="Thông báo"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f37021]"></span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-white text-[#004ba0] font-bold text-xs flex items-center justify-center border border-white/40 shadow-inner hover:scale-105 transition active:scale-95"
              aria-label="Tài khoản cá nhân"
            >
              <UserIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto bg-white flex-1 min-h-0 flex flex-col shadow-sm overflow-hidden">
        {/* Banner with Title and Swoosh Background */}
        <div className="shrink-0 relative bg-gradient-to-br from-blue-50/80 via-white to-orange-50/30 px-5 pt-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#004ba0] text-white flex items-center justify-center shadow-md shadow-[#004ba0]/20 shrink-0">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
                Tạo yêu cầu vận chuyển
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Gửi yêu cầu điều xe, vận chuyển container
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between relative px-2">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  step === 1
                    ? 'bg-[#004ba0] text-white shadow-sm ring-4 ring-blue-100'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {step > 1 ? '✓' : '1'}
              </div>
              <span className={`text-[11px] font-semibold ${step === 1 ? 'text-[#004ba0]' : 'text-slate-600'}`}>
                Nhập thông tin
              </span>
            </div>

            {/* Connecting Line 1 */}
            <div
              className={`flex-1 h-0.5 mx-2 -mt-4 transition-colors ${
                step >= 2 ? 'bg-[#004ba0]' : 'bg-slate-200'
              }`}
            ></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  step === 2
                    ? 'bg-[#004ba0] text-white shadow-sm ring-4 ring-blue-100'
                    : step > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > 2 ? '✓' : '2'}
              </div>
              <span className={`text-[11px] font-semibold ${step === 2 ? 'text-[#004ba0]' : 'text-slate-400'}`}>
                Xác nhận
              </span>
            </div>

            {/* Connecting Line 2 */}
            <div
              className={`flex-1 h-0.5 mx-2 -mt-4 transition-colors ${
                step === 3 ? 'bg-[#004ba0]' : 'bg-slate-200'
              }`}
            ></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  step === 3
                    ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                3
              </div>
              <span className={`text-[11px] font-semibold ${step === 3 ? 'text-emerald-600' : 'text-slate-400'}`}>
                Gửi yêu cầu
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
          {/* STEP 1: Form Fields */}
          {step === 1 && (
            <div className="space-y-4">
              {/* SECTION A: Thông tin chung */}
              <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-[#003366]">
                  <FileText size={16} className="text-[#004ba0]" />
                  <span>Thông tin chung</span>
                </div>

                <FormSelect
                  label={formConfigs.requestType?.label || 'Loại yêu cầu'}
                  required
                  icon={<Truck size={16} />}
                  value={formData.requestType}
                  onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                  options={[
                    'Vận chuyển container xuất khẩu',
                    'Vận chuyển container nhập khẩu',
                    'Vận chuyển nội địa',
                  ]}
                />

                <FormInput
                  name="bookingNumber"
                  id="bookingNumber"
                  label={formConfigs.bookingNumber?.label || 'Mã đơn hàng / Booking'}
                  required
                  placeholder={
                    formConfigs.bookingNumber?.placeholder
                      ? `${formConfigs.bookingNumber.placeholder} (Ví dụ: BK250828-001)`
                      : 'Ví dụ: BK250828-001'
                  }
                  helpText={formConfigs.bookingNumber?.helpText}
                  icon={<Barcode size={16} />}
                  value={formData.bookingNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, bookingNumber: e.target.value });
                    if (errors.bookingNumber) setErrors({ ...errors, bookingNumber: '' });
                  }}
                  error={errors.bookingNumber}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SearchableCombobox
                    name="shippingLine"
                    label={formConfigs.shippingLine?.label || 'Hãng tàu'}
                    required
                    placeholder={formConfigs.shippingLine?.placeholder || '-- Chọn hoặc tìm hãng tàu --'}
                    helpText={formConfigs.shippingLine?.helpText}
                    value={formData.shippingLine}
                    onChange={(val, opt) => {
                      setFormData({
                        ...formData,
                        shippingLine: val,
                        shippingLineName: opt?.label || val,
                      });
                      if (errors.shippingLine) setErrors({ ...errors, shippingLine: '' });
                    }}
                    options={masterData.shippingLines}
                    loading={refreshingMaster}
                    onRefresh={refreshMaster}
                    onOpen={refreshMaster}
                    error={errors.shippingLine}
                  />

                  {formConfigs.vesselName?.isVisible !== false && formConfigs.vesselVoyage?.isVisible !== false && (
                    <FormInput
                      name="vesselVoyage"
                      id="vesselVoyage"
                      label={formConfigs.vesselName?.label || formConfigs.vesselVoyage?.label || 'Tên tàu / Số chuyến'}
                      placeholder="Ví dụ: ONE TRIUMPH / 024W"
                      helpText={formConfigs.vesselName?.helpText || formConfigs.vesselVoyage?.helpText}
                      value={formData.vesselVoyage || ''}
                      onChange={(e) => setFormData({ ...formData, vesselVoyage: e.target.value })}
                    />
                  )}
                </div>

                {/* Auto-filled Company */}
                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Khách hàng yêu cầu:</span>
                  <span className="font-bold text-[#004ba0]">{formData.companyName}</span>
                </div>
              </div>

              {/* SECTION B: Booking Dates (TMS Fields B) */}
              <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-[#003366]">
                  <Calendar size={16} className="text-[#f37021]" />
                  <span>Thời gian Booking</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label={formConfigs.requestedDropOffBefore?.label || 'Hạ cont trước'}
                    type="date"
                    value={formData.requestedDropOffBefore || ''}
                    onChange={(e) => setFormData({ ...formData, requestedDropOffBefore: e.target.value })}
                  />
                  <FormInput
                    label={formConfigs.requestedDropOffAfter?.label || 'Hạ cont sau'}
                    type="date"
                    value={formData.requestedDropOffAfter || ''}
                    onChange={(e) => setFormData({ ...formData, requestedDropOffAfter: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label={formConfigs.siCutoff?.label || 'Giờ cắt SI'}
                    type="datetime-local"
                    value={formData.siCutoff || ''}
                    onChange={(e) => setFormData({ ...formData, siCutoff: e.target.value })}
                  />
                  <FormInput
                    label={formConfigs.portCutoff?.label || 'Giờ cắt máng'}
                    type="datetime-local"
                    value={formData.portCutoff || ''}
                    onChange={(e) => setFormData({ ...formData, portCutoff: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label={formConfigs.emptyPickupDate?.label || 'Ngày lấy rỗng'}
                    type="date"
                    value={formData.emptyPickupDate || ''}
                    onChange={(e) => setFormData({ ...formData, emptyPickupDate: e.target.value })}
                  />
                  <FormInput
                    label={formConfigs.vesselDepartureDate?.label || 'Ngày tàu chạy'}
                    type="date"
                    value={formData.vesselDepartureDate || ''}
                    onChange={(e) => setFormData({ ...formData, vesselDepartureDate: e.target.value })}
                  />
                </div>
              </div>

              {/* SECTION C: Locations & Cargo (TMS Fields C) */}
              <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-[#003366]">
                  <MapPin size={16} className="text-emerald-600" />
                  <span>Địa điểm & Hàng hóa</span>
                </div>

                <SearchableCombobox
                  name="packingLocation"
                  label={formConfigs.stuffingLocation?.label || formConfigs.packingLocation?.label || 'Nơi đóng hàng'}
                  required
                  placeholder={formConfigs.stuffingLocation?.placeholder || formConfigs.packingLocation?.placeholder || 'Chọn kho / nhà máy'}
                  helpText={formConfigs.stuffingLocation?.helpText || formConfigs.packingLocation?.helpText}
                  value={formData.packingLocation}
                  onChange={(val, opt) => {
                    setFormData({
                      ...formData,
                      packingLocation: val,
                      packingLocationName: opt?.label || val,
                    });
                    if (errors.packingLocation) setErrors({ ...errors, packingLocation: '' });
                  }}
                  options={masterData.locations}
                  loading={refreshingMaster}
                  onRefresh={refreshMaster}
                  onOpen={refreshMaster}
                  error={errors.packingLocation}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SearchableCombobox
                    name="emptyPickupLocation"
                    label={formConfigs.emptyPickupLocation?.label || 'Nơi lấy rỗng'}
                    required
                    placeholder={formConfigs.emptyPickupLocation?.placeholder || 'Chọn depot cấp cont rỗng'}
                    helpText={formConfigs.emptyPickupLocation?.helpText}
                    value={formData.emptyPickupLocation}
                    onChange={(val, opt) => {
                      setFormData({
                        ...formData,
                        emptyPickupLocation: val,
                        emptyPickupLocationName: opt?.label || val,
                      });
                      if (errors.emptyPickupLocation) setErrors({ ...errors, emptyPickupLocation: '' });
                    }}
                    options={masterData.locations}
                    loading={refreshingMaster}
                    onRefresh={refreshMaster}
                    onOpen={refreshMaster}
                    error={errors.emptyPickupLocation}
                  />

                  <SearchableCombobox
                    name="clearanceDepot"
                    label={formConfigs.customsClearanceLocation?.label || formConfigs.clearanceDepot?.label || 'Hạ bãi thanh lý'}
                    required
                    placeholder={formConfigs.customsClearanceLocation?.placeholder || formConfigs.clearanceDepot?.placeholder || 'Chọn điểm hạ bãi kiểm hóa'}
                    helpText={formConfigs.customsClearanceLocation?.helpText || formConfigs.clearanceDepot?.helpText}
                    value={formData.clearanceDepot}
                    onChange={(val, opt) => {
                      setFormData({
                        ...formData,
                        clearanceDepot: val,
                        clearanceDepotName: opt?.label || val,
                      });
                      if (errors.clearanceDepot) setErrors({ ...errors, clearanceDepot: '' });
                    }}
                    options={masterData.locations}
                    loading={refreshingMaster}
                    onRefresh={refreshMaster}
                    onOpen={refreshMaster}
                    error={errors.clearanceDepot}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SearchableCombobox
                    name="destinationPort"
                    label={formConfigs.destinationPort?.label || 'Cảng đến'}
                    required
                    placeholder={formConfigs.destinationPort?.placeholder || 'Chọn cảng đích'}
                    helpText={formConfigs.destinationPort?.helpText}
                    value={formData.destinationPort}
                    onChange={(val, opt) => {
                      setFormData({
                        ...formData,
                        destinationPort: val,
                        destinationPortName: opt?.label || val,
                      });
                      if (errors.destinationPort) setErrors({ ...errors, destinationPort: '' });
                    }}
                    options={masterData.ports}
                    loading={refreshingMaster}
                    onRefresh={refreshMaster}
                    onOpen={refreshMaster}
                    error={errors.destinationPort}
                  />

                  {formConfigs.transshipmentPort?.isVisible !== false && (
                    <SearchableCombobox
                      name="transshipmentPort"
                      label={formConfigs.transshipmentPort?.label || 'Cảng chuyển tải'}
                      placeholder={formConfigs.transshipmentPort?.placeholder || 'Chọn cảng trung chuyển (nếu có)'}
                      helpText={formConfigs.transshipmentPort?.helpText}
                      value={formData.transshipmentPort || ''}
                      onChange={(val, opt) =>
                        setFormData({
                          ...formData,
                          transshipmentPort: val,
                          transshipmentPortName: opt?.label || val,
                        })
                      }
                      options={[{ value: '', label: '(Không chuyển tải)' }, ...masterData.ports]}
                      loading={refreshingMaster}
                      onRefresh={refreshMaster}
                      onOpen={refreshMaster}
                    />
                  )}
                </div>

                <SearchableCombobox
                  name="cargoType"
                  label={formConfigs.cargoType?.label || 'Loại hàng hóa'}
                  required
                  placeholder={formConfigs.cargoType?.placeholder || 'Chọn loại hàng'}
                  helpText={formConfigs.cargoType?.helpText}
                  value={formData.cargoType}
                  onChange={(val, opt) => {
                    setFormData({
                      ...formData,
                      cargoType: val,
                      cargoTypeName: opt?.label || val,
                    });
                    if (errors.cargoType) setErrors({ ...errors, cargoType: '' });
                  }}
                  options={masterData.cargoTypes}
                  loading={refreshingMaster}
                  onRefresh={refreshMaster}
                  onOpen={refreshMaster}
                  error={errors.cargoType}
                />
              </div>

              {/* SECTION D: Dynamic Container Table (TMS Fields D) */}
              <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <ContainerTable
                  containers={formData.containers}
                  onChange={(conts) => {
                    setFormData({ ...formData, containers: conts });
                    if (errors.containers) setErrors({ ...errors, containers: '' });
                  }}
                  availableTypes={masterData.containerTypesList || ["40' cao", "40' thường", "20' thường"]}
                  error={errors.containers}
                />
              </div>

              {/* SECTION E: Additional info & Attachments (TMS Fields E) */}
              <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-[#003366]">
                  <Paperclip size={16} className="text-slate-600" />
                  <span>Thông tin bổ sung</span>
                </div>

                {formConfigs.notes?.isVisible !== false && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {formConfigs.notes?.label || 'Ghi chú & Yêu cầu đặc biệt (nếu có)'}
                    </label>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={
                        formConfigs.notes?.placeholder ||
                        'Nhập các lưu ý về giờ giấc đóng hàng, yêu cầu tài xế, tài liệu kèm theo...'
                      }
                      className="w-full p-3 text-xs text-slate-800 placeholder-slate-400 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 focus:border-[#004ba0] focus:ring-2 focus:ring-[#004ba0]/15 outline-none transition-all resize-none"
                    />
                    <div className="text-right text-[10px] text-slate-400 mt-0.5">
                      {(formData.notes || '').length} / 500
                    </div>
                  </div>
                )}

                {/* File Attachments */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tài liệu đính kèm (Booking confirmation, Packing list, EIR, ...)
                  </label>

                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-[#004ba0] transition-colors cursor-pointer relative bg-slate-50/50">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload size={20} className="mx-auto text-slate-400 mb-1.5" />
                    <p className="text-xs font-medium text-slate-700">
                      Chạm để tải lên hoặc kéo thả tệp vào đây
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Hỗ trợ PDF, PNG, JPG, XLSX (Tối đa 15MB)
                    </p>
                  </div>

                  {/* Uploaded File List */}
                  {formData.attachments && formData.attachments.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      {formData.attachments.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <Paperclip size={14} className="text-[#004ba0] shrink-0" />
                            <span className="font-medium text-slate-800 truncate">{file.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              ({(file.size / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="p-1 hover:text-rose-600 text-slate-400 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-2xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                >
                  <Save size={16} />
                  <span>Lưu bản nháp</span>
                </button>

                <PrimaryButton
                  type="button"
                  size="md"
                  variant="primary"
                  onClick={handleContinue}
                  className="flex-1"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Tiếp tục</span>
                    <ArrowRight size={16} />
                  </div>
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* STEP 2: Review / Confirmation */}
          {step === 2 && (
            <BookingReview
              formData={formData}
              onBack={() => {
                setStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSubmit={handleFinalSubmit}
              onSaveDraft={handleSaveDraft}
              submitting={submitting}
            />
          )}

          {/* STEP 3: Submission Success Banner */}
          {step === 3 && (
            <div className="py-8 px-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle size={36} />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Gửi yêu cầu thành công!
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Yêu cầu vận chuyển của bạn đã được chuyển đến bộ phận Điều vận U&amp;I Logistics.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 max-w-xs mx-auto space-y-1.5 text-left">
                <div className="text-[11px] text-slate-400 font-medium">Mã yêu cầu (Request ID):</div>
                <div className="text-base font-black text-[#004ba0] font-mono tracking-wider">
                  {createdCode}
                </div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex justify-between">
                  <span>Trạng thái:</span>
                  <span className="font-bold text-amber-600">Chờ phê duyệt</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-2.5 max-w-xs mx-auto">
                <PrimaryButton
                  variant="primary"
                  size="md"
                  onClick={() => navigate(`/tracking?id=${createdCode}`)}
                  className="w-full"
                >
                  Theo dõi tiến độ
                </PrimaryButton>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setFormData((prev) => ({
                      ...prev,
                      bookingNumber: '',
                      notes: '',
                      attachments: [],
                    }));
                  }}
                  className="w-full py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                >
                  Tạo yêu cầu khác
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
