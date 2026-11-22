import React from 'react';
import { RequestStatus } from '../../types';

interface StatusBadgeProps {
  status?: RequestStatus | string;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = '' }) => {
  let text = label;
  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotClass = 'bg-slate-400';

  const normalizedStatus = (status || '').toUpperCase();

  switch (normalizedStatus) {
    case 'IN_PROGRESS':
    case 'APPROVED':
    case 'ĐANG THỰC HIỆN':
      text = text || 'Đang thực hiện';
      bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      dotClass = 'bg-emerald-500';
      break;

    case 'PENDING':
    case 'CHỜ PHÊ DUYỆT':
    case 'CHỜ XỬ LÝ':
      text = text || 'Chờ phê duyệt';
      bgClass = 'bg-amber-50 text-amber-700 border-amber-200/80';
      dotClass = 'bg-amber-500';
      break;

    case 'COMPLETED':
    case 'HOÀN TẤT':
    case 'HOÀN THÀNH':
      text = text || 'Hoàn tất';
      bgClass = 'bg-blue-50 text-[#004ba0] border-blue-200/80';
      dotClass = 'bg-[#004ba0]';
      break;

    case 'REJECTED':
    case 'TỪ CHỐI':
    case 'ĐÃ HỦY':
      text = text || 'Từ chối';
      bgClass = 'bg-rose-50 text-rose-700 border-rose-200/80';
      dotClass = 'bg-rose-500';
      break;

    case 'DRAFT':
    case 'BẢN NHÁP':
      text = text || 'Bản nháp';
      bgClass = 'bg-slate-100 text-slate-600 border-slate-200';
      dotClass = 'bg-slate-400';
      break;

    default:
      text = text || status || 'Mới';
      bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
      dotClass = 'bg-slate-400';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bgClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} shrink-0 animate-pulse`}></span>
      <span>{text}</span>
    </span>
  );
};
