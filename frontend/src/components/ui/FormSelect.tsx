import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  icon?: React.ReactNode;
  options: (Option | string)[];
  error?: string;
  helperText?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  required,
  icon,
  options,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full text-left ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 mb-1.5">
          {label} {required && <span className="text-[#f37021]">*</span>}
        </label>
      )}
      <div
        className={`relative flex items-center bg-white rounded-2xl border transition-all duration-150 ${
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
          className="w-full py-2.5 pl-3 pr-9 text-sm text-slate-800 bg-transparent rounded-2xl outline-none appearance-none cursor-pointer"
          {...props}
        >
          {options.map((opt) => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const text = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={val} value={val}>
                {text}
              </option>
            );
          })}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown size={16} />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
