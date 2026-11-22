import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X, RefreshCw } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
  code?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface SearchableComboboxProps {
  label?: string;
  required?: boolean;
  icon?: React.ReactNode;
  placeholder?: string;
  helpText?: string;
  error?: string;
  value: string;
  onChange: (value: string, option?: ComboboxOption) => void;
  options: (ComboboxOption | string)[];
  loading?: boolean;
  onRefresh?: () => void;
  onOpen?: () => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  emptyMessage?: string;
}

export const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  label,
  required,
  icon,
  placeholder = '-- Chọn hoặc tìm kiếm --',
  helpText,
  error,
  value,
  onChange,
  options,
  loading = false,
  onRefresh,
  onOpen,
  disabled = false,
  className = '',
  id,
  name,
  emptyMessage = 'Không tìm thấy kết quả',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectId = id || name || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined);

  // Normalize options to ComboboxOption objects
  const normalizedOptions: ComboboxOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  // Historical preservation:
  // If current value is set but NOT found in active options (e.g. deactivated master record),
  // retain it in the display and selectable options so historical data is never lost or blanked out.
  const isValueInOptions = normalizedOptions.some(
    (opt) => opt.value === value || opt.label === value
  );
  const activeOptionsList: ComboboxOption[] = [...normalizedOptions];
  if (value && !isValueInOptions) {
    activeOptionsList.unshift({
      value,
      label: `${value} (Lưu trữ lịch sử)`,
      isActive: false,
    });
  }

  // Filter options based on search query
  const filteredOptions = activeOptionsList.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchLabel = opt.label.toLowerCase().includes(q);
    const matchCode = opt.code ? opt.code.toLowerCase().includes(q) : false;
    const matchDesc = opt.description ? opt.description.toLowerCase().includes(q) : false;
    return matchLabel || matchCode || matchDesc;
  });

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    const matched = activeOptionsList.find((opt) => opt.value === newVal || opt.label === newVal);
    onChange(newVal, matched);
  };

  const handleTriggerClick = () => {
    if (disabled) return;
    if (onOpen) onOpen();
    setIsOpen(!isOpen);
  };

  return (
    <div ref={containerRef} className={`w-full text-left relative ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 mb-1.5">
          <span className="flex items-center justify-between">
            <span>
              {label} {required && <span className="text-[#f37021]">*</span>}
            </span>
            {onRefresh && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRefresh();
                }}
                disabled={loading}
                className="text-[11px] font-normal text-slate-400 hover:text-[#004ba0] inline-flex items-center gap-1 transition-colors"
                title="Cập nhật danh mục mới nhất"
              >
                <RefreshCw size={11} className={loading ? 'animate-spin text-[#004ba0]' : ''} />
                <span>Làm mới</span>
              </button>
            )}
          </span>
        </label>
      )}

      {/* Main Select Component - Styled to U&I standard and accessible to Playwright */}
      <div
        className={`relative flex items-center bg-white rounded-2xl border transition-all duration-150 ${
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''
        } ${
          error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 hover:border-slate-300 focus-within:border-[#004ba0] focus-within:ring-2 focus-within:ring-[#004ba0]/15'
        }`}
      >
        {icon && (
          <div className="pl-3.5 pr-1 text-slate-400 flex items-center pointer-events-none shrink-0">
            {icon}
          </div>
        )}

        <select
          id={selectId}
          name={name || selectId}
          value={value}
          onChange={handleSelectChange}
          onClick={handleTriggerClick}
          onFocus={() => {
            if (onOpen) onOpen();
          }}
          disabled={disabled}
          className="w-full py-2.5 pl-3 pr-9 text-sm font-semibold text-slate-800 bg-transparent rounded-2xl outline-none appearance-none cursor-pointer"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {loading ? (
            <option value="" disabled>
              Đang tải danh mục...
            </option>
          ) : filteredOptions.length === 0 ? (
            <option value="" disabled>
              {emptyMessage}
            </option>
          ) : (
            filteredOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}{opt.code && !opt.label.includes(opt.code) ? ` (${opt.code})` : ''}
              </option>
            ))
          )}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5 text-slate-400">
          {loading ? (
            <RefreshCw size={14} className="animate-spin text-[#004ba0]" />
          ) : (
            <ChevronDown size={16} />
          )}
        </div>
      </div>

      {/* Quick Search/Filter Bar (appears when options are plentiful or user searches) */}
      {normalizedOptions.length > 3 && (
        <div className="relative mt-1 flex items-center">
          <Search size={12} className="absolute left-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Lọc nhanh danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-7 py-1 text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200/90 rounded-xl placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#004ba0] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5"
              title="Xóa tìm kiếm"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      {helpText && !error && <p className="mt-1 text-xs text-slate-500">{helpText}</p>}
    </div>
  );
};
