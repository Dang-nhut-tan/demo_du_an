import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  User as UserIcon,
  CalendarCheck,
  Calendar,
  Clock,
  Truck,
  Box,
  FileEdit,
  Paperclip,
  Plus,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { BookingRequest } from '../../types';
import {
  fetchActiveBookingsForChange,
  submitScheduleChangeRequest,
  ScheduleChangeItem,
} from './scheduleChangeApi';

export const ScheduleChangePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCode = searchParams.get('code');

  const [step, setStep] = useState<1 | 2 | 3>(2); // Default to Step 2 as in Mockup
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Checkboxes for change type
  const [changePickup, setChangePickup] = useState(true);
  const [changeDelivery, setChangeDelivery] = useState(false);
  const [changeCutoff, setChangeCutoff] = useState(false);
  const [changeYCGC, setChangeYCGC] = useState(false);
  const [changeBoth, setChangeBoth] = useState(false);

  // Proposed values
  const [pickupDate, setPickupDate] = useState('2025-08-30');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [deliveryDate, setDeliveryDate] = useState('2025-08-30');
  const [deliveryTime, setDeliveryTime] = useState('16:00');
  const [newCutoff, setNewCutoff] = useState('2025-08-30T12:00');
  const [newYCGCDate, setNewYCGCDate] = useState('2025-08-29');

  const [reason, setReason] = useState(
    'Khách hàng thay đổi kế hoạch đóng hàng, lùi thời gian lấy hàng 1 ngày.'
  );
  const [files, setFiles] = useState<Array<{ name: string; size: string }>>([
    { name: 'Lịch đóng hàng cập nhật.pdf', size: '350 KB' },
  ]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await fetchActiveBookingsForChange();
        setBookings(list);
        if (list.length > 0) {
          const match = preselectedCode
            ? list.find((b) => b.code === preselectedCode || b.bookingNumber === preselectedCode)
            : list[0];
          setSelectedBooking(match || list[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [preselectedCode]);

  const handleBothToggle = (checked: boolean) => {
    setChangeBoth(checked);
    if (checked) {
      setChangePickup(true);
      setChangeDelivery(true);
    }
  };

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0];
      setFiles((prev) => [
        ...prev,
        { name: f.name, size: `${(f.size / 1024).toFixed(0)} KB` },
      ]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedBooking) {
      setError('Vui lòng chọn một yêu cầu vận chuyển');
      return;
    }
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do thay đổi thời gian');
      return;
    }

    const items: ScheduleChangeItem[] = [];

    if (changePickup) {
      items.push({
        targetField: 'pickup_date',
        oldValue: selectedBooking.requestedPickupDate || '29/08/2025 08:00',
        newValue: `${pickupDate} ${pickupTime}`,
      });
    }

    if (changeDelivery || changeBoth) {
      items.push({
        targetField: 'delivery_date',
        oldValue: selectedBooking.requestedDeliveryDate || '29/08/2025 14:00',
        newValue: `${deliveryDate} ${deliveryTime}`,
      });
    }

    if (changeCutoff) {
      items.push({
        targetField: 'siCutoff',
        oldValue: '29/08/2025 11:00',
        newValue: newCutoff,
      });
    }

    if (changeYCGC) {
      items.push({
        targetField: 'requestedYCGCDate',
        oldValue: '28/08/2025',
        newValue: newYCGCDate,
      });
    }

    setSubmitting(true);
    try {
      await submitScheduleChangeRequest({
        bookingId: selectedBooking.id,
        requestCode: selectedBooking.code,
        bookingNumber: selectedBooking.bookingNumber,
        changeType: changeBoth ? 'both' : changePickup ? 'pickup' : 'delivery',
        items,
        reason,
      });
      setSuccess(true);
      setStep(3);
    } catch (e) {
      console.error(e);
      setSuccess(true);
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-100">
      {/* Header matching Mockup */}
      <div className="shrink-0 bg-[#004ba0] text-white px-4 pt-3 pb-4 shadow-md z-30">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
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
        <div className="shrink-0 relative bg-gradient-to-br from-orange-50/80 via-white to-blue-50/30 px-5 pt-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f37021] text-white flex items-center justify-center shadow-md shadow-[#f37021]/20 shrink-0">
              <CalendarCheck size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
                Đề xuất sửa thời gian
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Đề nghị thay đổi thời gian lấy hàng, đóng hàng hoặc giao hàng
              </p>
            </div>
          </div>

          {/* Step Indicator matching Mockup */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between relative px-2">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div className="w-7 h-7 rounded-full bg-[#004ba0] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                1
              </div>
              <span className="text-[11px] font-semibold text-slate-600">
                Chọn yêu cầu
              </span>
            </div>

            {/* Connecting Line 1 */}
            <div className="flex-1 h-0.5 mx-2 -mt-4 bg-[#004ba0]"></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div className="w-7 h-7 rounded-full bg-[#004ba0] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-4 ring-blue-100">
                2
              </div>
              <span className="text-[11px] font-bold text-[#004ba0]">
                Nhập thay đổi
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
                Gửi đề xuất
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
          {step !== 3 ? (
            <div className="space-y-4">
              {/* CARD 1: Thông tin yêu cầu hiện tại */}
              <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#003366]">
                    <FileEdit size={16} className="text-[#004ba0]" />
                    <span>Thông tin yêu cầu hiện tại</span>
                  </div>

                  {bookings.length > 1 && (
                    <div className="relative">
                      <select
                        value={selectedBooking?.id || ''}
                        onChange={(e) => {
                          const found = bookings.find((b) => b.id === e.target.value);
                          if (found) setSelectedBooking(found);
                        }}
                        className="text-xs font-bold text-[#004ba0] bg-blue-50 border border-blue-200 rounded-xl px-2.5 py-1 pr-6 appearance-none cursor-pointer outline-none"
                      >
                        {bookings.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.code} ({b.bookingNumber})
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-1.5 top-2 pointer-events-none text-[#004ba0]" />
                    </div>
                  )}
                </div>

                {/* Selected Booking Badges */}
                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center justify-between">
                  <span className="font-extrabold text-[#004ba0] text-sm tracking-tight">
                    {selectedBooking?.code || 'REQ-250828-001'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Đang thực hiện</span>
                  </span>
                </div>

                {/* Booking details table */}
                <div className="space-y-2 text-xs text-slate-700 pt-1">
                  <div className="flex items-center gap-2.5">
                    <Truck size={15} className="text-slate-400 shrink-0" />
                    <span className="text-slate-500 w-28 shrink-0">Tuyến vận chuyển:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedBooking?.pickupLocation || 'Kho U&I Bình Dương'} →{' '}
                      {selectedBooking?.deliveryLocation || 'Cảng Cát Lái'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Calendar size={15} className="text-slate-400 shrink-0" />
                    <span className="text-slate-500 w-28 shrink-0">Thời gian lấy hàng:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedBooking?.requestedPickupDate || '29/08/2025 08:00'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Calendar size={15} className="text-slate-400 shrink-0" />
                    <span className="text-slate-500 w-28 shrink-0">Thời gian giao hàng:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedBooking?.requestedDeliveryDate || '29/08/2025 14:00'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Box size={15} className="text-slate-400 shrink-0" />
                    <span className="text-slate-500 w-28 shrink-0">Số lượng container:</span>
                    <span className="font-bold text-[#004ba0]">
                      {selectedBooking?.containerSummary || "2 (40'HC)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 2: Thông tin thay đổi đề xuất */}
              <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-[#003366]">
                  <FileEdit size={16} className="text-[#f37021]" />
                  <span>Thông tin thay đổi đề xuất</span>
                </div>

                {/* Checkboxes: Loại thay đổi */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Loại thay đổi <span className="text-[#f37021]">*</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={changePickup}
                        onChange={(e) => setChangePickup(e.target.checked)}
                        className="w-4 h-4 rounded text-[#004ba0] focus:ring-[#004ba0] border-slate-300 cursor-pointer"
                      />
                      <span>Thời gian lấy hàng</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={changeDelivery}
                        onChange={(e) => setChangeDelivery(e.target.checked)}
                        className="w-4 h-4 rounded text-[#004ba0] focus:ring-[#004ba0] border-slate-300 cursor-pointer"
                      />
                      <span>Thời gian giao hàng</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={changeBoth}
                        onChange={(e) => handleBothToggle(e.target.checked)}
                        className="w-4 h-4 rounded text-[#004ba0] focus:ring-[#004ba0] border-slate-300 cursor-pointer"
                      />
                      <span>Cả hai</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={changeCutoff}
                        onChange={(e) => setChangeCutoff(e.target.checked)}
                        className="w-4 h-4 rounded text-[#004ba0] focus:ring-[#004ba0] border-slate-300 cursor-pointer"
                      />
                      <span>Cắt SI/Máng</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={changeYCGC}
                        onChange={(e) => setChangeYCGC(e.target.checked)}
                        className="w-4 h-4 rounded text-[#004ba0] focus:ring-[#004ba0] border-slate-300 cursor-pointer"
                      />
                      <span>Ngày YCGC cont</span>
                    </label>
                  </div>
                </div>

                {/* Date & Time Pickers */}
                <div className="space-y-3 pt-1">
                  {/* Thời gian lấy hàng mới */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thời gian lấy hàng mới <span className="text-[#f37021]">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-3 py-2">
                        <Calendar size={15} className="text-slate-400 mr-2 shrink-0" />
                        <input
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full text-xs font-medium text-slate-800 outline-none bg-transparent"
                        />
                      </div>
                      <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-3 py-2">
                        <Clock size={15} className="text-slate-400 mr-2 shrink-0" />
                        <input
                          type="time"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className="w-full text-xs font-medium text-slate-800 outline-none bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thời gian giao hàng mới */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thời gian giao hàng mới
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-3 py-2">
                        <Calendar size={15} className="text-slate-400 mr-2 shrink-0" />
                        <input
                          type="date"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="w-full text-xs font-medium text-slate-800 outline-none bg-transparent"
                        />
                      </div>
                      <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-3 py-2">
                        <Clock size={15} className="text-slate-400 mr-2 shrink-0" />
                        <input
                          type="time"
                          value={deliveryTime}
                          onChange={(e) => setDeliveryTime(e.target.value)}
                          className="w-full text-xs font-medium text-slate-800 outline-none bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Giờ cắt SI/Máng mới */}
                  {changeCutoff && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Giờ cắt SI/Máng mới đề xuất
                      </label>
                      <input
                        type="datetime-local"
                        value={newCutoff}
                        onChange={(e) => setNewCutoff(e.target.value)}
                        className="w-full py-2 px-3 text-xs font-medium text-slate-800 border border-slate-200 rounded-2xl outline-none focus:border-[#004ba0]"
                      />
                    </div>
                  )}

                  {/* Ngày YCGC cont mới */}
                  {changeYCGC && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ngày YCGC container mới đề xuất
                      </label>
                      <input
                        type="date"
                        value={newYCGCDate}
                        onChange={(e) => setNewYCGCDate(e.target.value)}
                        className="w-full py-2 px-3 text-xs font-medium text-slate-800 border border-slate-200 rounded-2xl outline-none focus:border-[#004ba0]"
                      />
                    </div>
                  )}
                </div>

                {/* Reason Textarea */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lý do thay đổi <span className="text-[#f37021]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Nhập lý do cần thay đổi thời gian điều xe..."
                    className="w-full py-2.5 px-3 text-sm text-slate-800 placeholder-slate-400 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#004ba0] focus:ring-2 focus:ring-[#004ba0]/15 resize-none transition"
                  />
                  <div className="text-right text-[11px] text-slate-400 mt-0.5">
                    {reason.length} / 500
                  </div>
                </div>
              </div>

              {/* CARD 3: Đính kèm tài liệu (nếu có) */}
              <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Paperclip size={15} className="text-slate-500" />
                    <span>Đính kèm tài liệu (nếu có)</span>
                  </div>

                  <label className="cursor-pointer text-xs font-bold text-[#004ba0] hover:text-blue-700 flex items-center gap-1 transition">
                    <Plus size={14} />
                    <span>Thêm file</span>
                    <input type="file" onChange={handleAddFile} className="hidden" />
                  </label>
                </div>

                {/* File chips */}
                <div className="space-y-1.5">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip size={14} className="text-[#004ba0] shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{file.name}</span>
                        <span className="text-slate-400 text-[11px] shrink-0">({file.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-2xl flex items-center gap-2 font-medium">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <PrimaryButton
                  onClick={() => navigate('/')}
                  variant="secondary"
                  size="md"
                  fullWidth
                >
                  Hủy
                </PrimaryButton>

                <PrimaryButton
                  onClick={handleSubmit}
                  loading={submitting}
                  size="md"
                  fullWidth
                  icon={<Send size={16} />}
                  iconPosition="left"
                >
                  Gửi đề xuất
                </PrimaryButton>
              </div>
            </div>
          ) : (
            /* STEP 3: Success Result */
            <div className="p-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-800">
                  Gửi đề xuất thành công!
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Đề xuất thay đổi thời gian cho {selectedBooking?.code} đã được chuyển đến Điều phối viên U&amp;I Logistics để xem xét phê duyệt.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Mã yêu cầu:</span>
                  <span className="font-extrabold text-[#004ba0]">{selectedBooking?.code}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Thời gian đề xuất:</span>
                  <span className="font-semibold text-slate-800">
                    {pickupDate} {pickupTime}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Trạng thái:</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200 text-[11px]">
                    Chờ duyệt đề xuất
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <PrimaryButton
                  onClick={() => navigate(`/tracking?code=${selectedBooking?.code}`)}
                  fullWidth
                  size="lg"
                  icon={<Truck size={18} />}
                  iconPosition="right"
                >
                  Theo dõi tiến độ đơn hàng
                </PrimaryButton>

                <PrimaryButton
                  onClick={() => navigate('/')}
                  variant="secondary"
                  fullWidth
                  size="md"
                >
                  Về trang chủ
                </PrimaryButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
