import React from 'react';
import { ChevronRight, Calendar, ArrowRight, Truck } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { BookingRequest } from '../../types';

// Large Action Card matching Dashboard Mockup
interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  colorTheme?: 'blue' | 'orange' | 'purple';
  onClick?: () => void;
  className?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  subtitle,
  icon,
  colorTheme = 'blue',
  onClick,
  className = '',
}) => {
  const themeStyles = {
    blue: {
      bg: 'bg-white hover:bg-blue-50/50 border-blue-100/80',
      iconBg: 'bg-blue-50 text-[#004ba0]',
      arrow: 'text-[#004ba0]',
    },
    orange: {
      bg: 'bg-white hover:bg-orange-50/50 border-orange-100/80',
      iconBg: 'bg-[#fff5ee] text-[#f37021]',
      arrow: 'text-[#f37021]',
    },
    purple: {
      bg: 'bg-white hover:bg-indigo-50/50 border-indigo-100/80',
      iconBg: 'bg-indigo-50 text-indigo-600',
      arrow: 'text-indigo-600',
    },
  };

  const currentTheme = themeStyles[colorTheme];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-3xl border shadow-sm transition-all duration-200 active:scale-[0.99] flex items-center justify-between gap-3 group ${currentTheme.bg} ${className}`}
    >
      <div className="flex items-center gap-3.5">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${currentTheme.iconBg}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm sm:text-base group-hover:text-slate-900 leading-snug">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 leading-normal">
            {subtitle}
          </p>
        </div>
      </div>
      <div className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${currentTheme.arrow}`}>
        <ChevronRight size={20} />
      </div>
    </button>
  );
};

// 4 Statistics tiles matching Dashboard Mockup
interface StatTileProps {
  count: number | string;
  label: string;
  icon: React.ReactNode;
  colorScheme: 'blue' | 'green' | 'orange' | 'red';
}

export const StatTile: React.FC<StatTileProps> = ({ count, label, icon, colorScheme }) => {
  const styles = {
    blue: {
      cardBg: 'bg-[#f0f6ff]',
      border: 'border-blue-100',
      iconColor: 'text-[#004ba0]',
      countColor: 'text-slate-900',
    },
    green: {
      cardBg: 'bg-[#f0fdf4]',
      border: 'border-emerald-100',
      iconColor: 'text-emerald-600',
      countColor: 'text-slate-900',
    },
    orange: {
      cardBg: 'bg-[#fffaf0]',
      border: 'border-amber-100',
      iconColor: 'text-amber-500',
      countColor: 'text-slate-900',
    },
    red: {
      cardBg: 'bg-[#fff5f5]',
      border: 'border-rose-100',
      iconColor: 'text-rose-500',
      countColor: 'text-slate-900',
    },
  };

  const s = styles[colorScheme];

  return (
    <div
      className={`flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl border text-center transition-all hover:shadow-sm ${s.cardBg} ${s.border}`}
    >
      <div className={`mb-1 ${s.iconColor}`}>{icon}</div>
      <div className={`text-xl sm:text-2xl font-extrabold tracking-tight ${s.countColor}`}>
        {count}
      </div>
      <div className="text-[11px] font-medium text-slate-500 mt-0.5 whitespace-nowrap">
        {label}
      </div>
    </div>
  );
};

// Recent Request Card matching Dashboard Mockup
interface RequestCardProps {
  request: BookingRequest;
  onClick?: () => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onClick }) => {
  const isPending = request.status === 'PENDING';
  const iconBg = isPending ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-[#004ba0]';

  return (
    <div
      onClick={onClick}
      className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-100/90 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-150 cursor-pointer text-left active:scale-[0.995]"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            {isPending ? <Calendar size={18} /> : <Truck size={18} />}
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm tracking-tight">
              {request.code || request.bookingNumber}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>{request.pickupLocation}</span>
              <ArrowRight size={11} className="text-slate-400" />
              <span>{request.deliveryLocation}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <StatusBadge status={request.status} label={request.statusLabel} />
          <ChevronRight size={16} className="text-slate-400" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-50 mt-1">
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="text-slate-400" />
          <span>{request.requestedPickupDate}</span>
        </div>
        {request.containerSummary && (
          <span className="font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
            {request.containerSummary}
          </span>
        )}
      </div>
    </div>
  );
};
