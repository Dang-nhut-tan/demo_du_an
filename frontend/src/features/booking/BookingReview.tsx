import React from 'react';
import { FileText, Calendar, MapPin, Box, Paperclip, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import { BookingFormData } from './bookingApi';
import { PrimaryButton } from '../../components/ui/PrimaryButton';

interface BookingReviewProps {
  formData: BookingFormData;
  onBack: () => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
  submitting?: boolean;
}

export const BookingReview: React.FC<BookingReviewProps> = ({
  formData,
  onBack,
  onSubmit,
  onSaveDraft,
  submitting = false,
}) => {
  const totalContainers = formData.containers.reduce((sum, c) => sum + (c.quantity || 0), 0);

  return (
    <div className="space-y-4">
      {/* Review Alert Banner */}
      <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-2xl flex items-start gap-3">
        <CheckCircle2 size={20} className="text-[#004ba0] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700">
          <p className="font-bold text-[#004ba0] mb-0.5">Xác nhận thông tin yêu cầu</p>
          <p>Vui lòng kiểm tra kỹ các thông tin điều xe dưới đây trước khi gửi đến đội điều phối U&I Logistics.</p>
        </div>
      </div>

      {/* 1. Thông tin chung */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 font-bold text-sm text-[#003366]">
          <FileText size={16} className="text-[#004ba0]" />
          <span>Thông tin chung</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-500">Mã Booking:</span>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{formData.bookingNumber}</p>
          </div>
          <div>
            <span className="text-slate-500">Hãng tàu:</span>
            <p className="font-bold text-[#004ba0] text-sm mt-0.5">{formData.shippingLineName || formData.shippingLine}</p>
          </div>
          <div>
            <span className="text-slate-500">Loại yêu cầu:</span>
            <p className="font-semibold text-slate-700 mt-0.5">{formData.requestType}</p>
          </div>
          <div>
            <span className="text-slate-500">Tên tàu / Số chuyến:</span>
            <p className="font-semibold text-slate-700 mt-0.5">{formData.vesselVoyage || 'Chưa cập nhật'}</p>
          </div>
        </div>
      </div>

      {/* 2. Thời gian Booking (TMS Fields B) */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 font-bold text-sm text-[#003366]">
          <Calendar size={16} className="text-[#f37021]" />
          <span>Thời gian yêu cầu</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-500">Hạ cont trước:</span>
            <p className="font-semibold text-slate-800 mt-0.5">{formData.requestedDropOffBefore || '-'}</p>
          </div>
          <div>
            <span className="text-slate-500">Hạ cont sau:</span>
            <p className="font-semibold text-slate-800 mt-0.5">{formData.requestedDropOffAfter || '-'}</p>
          </div>
          <div>
            <span className="text-slate-500">Cắt SI:</span>
            <p className="font-semibold text-slate-800 mt-0.5">{formData.siCutoff || '-'}</p>
          </div>
          <div>
            <span className="text-slate-500">Cắt máng:</span>
            <p className="font-semibold text-slate-800 mt-0.5">{formData.portCutoff || '-'}</p>
          </div>
          <div>
            <span className="text-slate-500">Yêu cầu lấy rỗng:</span>
            <p className="font-semibold text-slate-800 mt-0.5">{formData.emptyPickupDate || '-'}</p>
          </div>
          <div>
            <span className="text-slate-500">Tàu chạy:</span>
            <p className="font-semibold text-slate-800 mt-0.5">{formData.vesselDepartureDate || '-'}</p>
          </div>
        </div>
      </div>

      {/* 3. Địa điểm & Hàng hóa (TMS Fields C) */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 font-bold text-sm text-[#003366]">
          <MapPin size={16} className="text-emerald-600" />
          <span>Địa điểm & Hàng hóa</span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-50">
            <span className="text-slate-500">Nơi đóng hàng:</span>
            <span className="font-semibold text-slate-800 text-right">{formData.packingLocationName || formData.packingLocation}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-50">
            <span className="text-slate-500">Nơi lấy rỗng:</span>
            <span className="font-semibold text-slate-800 text-right">{formData.emptyPickupLocationName || formData.emptyPickupLocation}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-50">
            <span className="text-slate-500">Hạ bãi thanh lý:</span>
            <span className="font-semibold text-slate-800 text-right">{formData.clearanceDepotName || formData.clearanceDepot}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-50">
            <span className="text-slate-500">Cảng đến:</span>
            <span className="font-bold text-[#004ba0] text-right">{formData.destinationPortName || formData.destinationPort}</span>
          </div>
          {formData.transshipmentPort && (
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Cảng chuyển tải:</span>
              <span className="font-semibold text-slate-800 text-right">{formData.transshipmentPortName || formData.transshipmentPort}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">Loại hàng hóa:</span>
            <span className="font-semibold text-slate-800 text-right">{formData.cargoTypeName || formData.cargoType}</span>
          </div>
        </div>
      </div>

      {/* 4. Chi tiết Container */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-sm text-[#003366]">
            <Box size={16} className="text-indigo-600" />
            <span>Chi tiết container</span>
          </div>
          <span className="text-xs font-bold text-[#004ba0] bg-blue-50 px-2 py-0.5 rounded-full">
            {totalContainers} container
          </span>
        </div>
        <div className="space-y-2">
          {formData.containers.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
              <div className="font-semibold text-slate-800">
                {c.quantity}x {c.containerType}
              </div>
              <div className="text-slate-500">
                YCGC: <span className="font-medium text-slate-700">{c.requestedYCGCDate || 'Chưa đặt'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Ghi chú & Đính kèm */}
      {(formData.notes || (formData.attachments && formData.attachments.length > 0)) && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs">
          {formData.notes && (
            <div>
              <span className="text-slate-500 block mb-1">Ghi chú yêu cầu:</span>
              <p className="p-2.5 bg-slate-50 rounded-xl text-slate-700 italic">{formData.notes}</p>
            </div>
          )}
          {formData.attachments && formData.attachments.length > 0 && (
            <div className="pt-2">
              <span className="text-slate-500 flex items-center gap-1 mb-1">
                <Paperclip size={13} /> Tài liệu đính kèm ({formData.attachments.length}):
              </span>
              <div className="space-y-1">
                {formData.attachments.map((f, i) => (
                  <div key={i} className="text-xs font-medium text-[#004ba0] bg-blue-50/60 px-2.5 py-1 rounded-lg truncate">
                    {f.name} ({(f.size / 1024).toFixed(0)} KB)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-3 space-y-2.5">
        <PrimaryButton
          onClick={onSubmit}
          loading={submitting}
          fullWidth
          size="lg"
          icon={<Send size={18} />}
          iconPosition="right"
        >
          Xác nhận & Gửi yêu cầu
        </PrimaryButton>

        <div className="grid grid-cols-2 gap-2.5">
          <PrimaryButton
            onClick={onBack}
            variant="secondary"
            fullWidth
            size="md"
            icon={<ArrowLeft size={16} />}
            disabled={submitting}
          >
            Quay lại sửa
          </PrimaryButton>
          <PrimaryButton
            onClick={onSaveDraft}
            variant="ghost"
            fullWidth
            size="md"
            className="border border-slate-200 hover:bg-slate-50"
            disabled={submitting}
          >
            Lưu bản nháp
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
