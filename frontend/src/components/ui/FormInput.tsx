import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  icon?: React.ReactNode;
  error?: string;
  helperText?: string;
  helpText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  required,
  icon,
  error,
  helperText,
  helpText,
  type = 'text',
  className = '',
  id,
  ...props
}) => {
  const displayedHelp = helpText || helperText;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full min-w-0 text-left ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 mb-1.5 truncate">
          {label} {required && <span className="text-[#f37021]">*</span>}
        </label>
      )}
      <div
        className={`relative flex items-center min-w-0 bg-white rounded-2xl border transition-all duration-150 ${
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
        <input
          id={inputId}
          type={inputType}
          className="w-full min-w-0 py-2.5 px-3 text-sm text-slate-800 placeholder-slate-400 bg-transparent rounded-2xl outline-none"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="pr-3 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      {displayedHelp && !error && <p className="mt-1 text-xs text-slate-500">{displayedHelp}</p>}
    </div>
  );
};
