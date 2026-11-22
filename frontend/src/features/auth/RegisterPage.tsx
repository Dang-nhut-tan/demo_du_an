import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  FileText,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { FormInput } from '../../components/ui/FormInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import {
  CustomerRegistrationData,
  submitCustomerRegistration,
  validateRegistrationInput,
} from './registrationApi';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CustomerRegistrationData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    companyName: '',
    taxCode: '',
    companyAddress: '',
    notificationEmail: '',
    companyPhone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleInputChange = (field: keyof CustomerRegistrationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // 1. Client-side validation
    const valErrors = validateRegistrationInput(formData);
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitCustomerRegistration(formData);
      if (res.success) {
        setSubmitSuccess(true);
      } else {
        setServerError(res.error || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err: any) {
      setServerError(err?.message || 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#004ba0] flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans selection:bg-[#f37021] selection:text-white">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-white/20">
        
        {/* Left Brand Panel */}
        <div className="w-full lg:w-5/12 bg-gradient-to-br from-[#003c7a] via-[#004ba0] to-[#002b5c] p-6 sm:p-8 flex flex-col justify-between text-white relative">
          <div>
            {/* Brand Logo */}
            <div className="flex items-center gap-1 font-black text-2xl tracking-tight leading-none text-white drop-shadow-md">
              <span className="font-extrabold italic text-3xl">U</span>
              <span className="text-[#f37021] font-black italic text-3xl mx-0.5">&amp;</span>
              <span className="font-extrabold italic text-3xl">I</span>
              <span className="ml-1.5 font-bold tracking-tight text-white text-2xl">Logistics</span>
              <span className="text-xs font-semibold text-white/90 ml-0.5 -mt-2">®</span>
            </div>
            <p className="text-xs font-medium text-blue-100 tracking-wide mt-1">
              Customer Portal (PWA)
            </p>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                Đăng ký tài khoản khách hàng doanh nghiệp
              </h2>
              <p className="text-xs text-blue-100/90 leading-relaxed">
                Khởi tạo tài khoản Cổng thông tin khách hàng U&amp;I Logistics để quản lý booking vận chuyển, đổi lịch và theo dõi tiến độ thời gian thực.
              </p>
            </div>

            <div className="mt-6 space-y-3 pt-4 border-t border-white/10 text-xs text-blue-100">
              <div className="flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-[#f37021] shrink-0 mt-0.5" />
                <span>Quy trình bảo mật doanh nghiệp: Tài khoản được quản trị viên thẩm định và kích hoạt an toàn.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Hỗ trợ nhiều tài khoản người dùng cho cùng một mã số thuế doanh nghiệp.</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200">
            <span>© 2026 U&amp;I Logistics Corporation</span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1 text-white hover:text-[#f37021] font-semibold transition"
            >
              <ArrowLeft size={13} />
              <span>Đăng nhập</span>
            </button>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full lg:w-7/12 p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
          {submitSuccess ? (
            /* Success Confirmation Screen */
            <div className="py-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Đăng ký thành công!
                </h2>
                <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                  Yêu cầu đăng ký của bạn đã được gửi đến quản trị viên U&amp;I Logistics.
                  Vui lòng chờ phê duyệt tài khoản trước khi đăng nhập.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs max-w-sm mx-auto space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Email đăng ký:</span>
                  <span className="font-bold text-slate-800 font-mono">{formData.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Công ty:</span>
                  <span className="font-semibold text-slate-800">{formData.companyName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Mã số thuế:</span>
                  <span className="font-bold text-[#004ba0]">{formData.taxCode}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Trạng thái:</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200 text-[11px]">
                    Chờ duyệt (PENDING)
                  </span>
                </div>
              </div>

              <div className="pt-2 max-w-sm mx-auto">
                <PrimaryButton
                  type="button"
                  fullWidth
                  size="lg"
                  onClick={() => navigate('/login')}
                  icon={<ArrowRight size={18} />}
                  iconPosition="right"
                >
                  Quay về đăng nhập
                </PrimaryButton>
              </div>
            </div>
          ) : (
            /* Registration Input Form */
            <div>
              <div className="mb-5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Đăng ký tài khoản
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vui lòng điền đầy đủ các thông tin bắt buộc có dấu (*)
                </p>
              </div>

              {serverError && (
                <div className="p-3.5 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Section A: Thông tin tài khoản */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 text-xs font-bold text-[#003366] uppercase tracking-wider">
                    <User size={15} className="text-[#004ba0]" />
                    <span>Thông tin tài khoản</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormInput
                      label="Họ và tên"
                      required
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      error={errors.fullName}
                      icon={<User size={16} />}
                    />

                    <FormInput
                      label="Số điện thoại cá nhân"
                      type="tel"
                      required
                      placeholder="0912 345 678"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      error={errors.phone}
                      icon={<Phone size={16} />}
                    />
                  </div>

                  <FormInput
                    label="Email đăng nhập"
                    type="email"
                    required
                    placeholder="nguyenvana@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={errors.email}
                    icon={<Mail size={16} />}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormInput
                      label="Mật khẩu"
                      type="password"
                      required
                      placeholder="Tối thiểu 8 ký tự"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      error={errors.password}
                      icon={<Lock size={16} />}
                    />

                    <FormInput
                      label="Xác nhận mật khẩu"
                      type="password"
                      required
                      placeholder="Nhập lại mật khẩu"
                      value={formData.passwordConfirm}
                      onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
                      error={errors.passwordConfirm}
                      icon={<Lock size={16} />}
                    />
                  </div>
                </div>

                {/* Section B: Thông tin doanh nghiệp */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 text-xs font-bold text-[#003366] uppercase tracking-wider">
                    <Building2 size={15} className="text-[#004ba0]" />
                    <span>Thông tin doanh nghiệp</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormInput
                      label="Tên công ty"
                      required
                      placeholder="Công ty TNHH Xuất Nhập Khẩu..."
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      error={errors.companyName}
                      icon={<Building2 size={16} />}
                    />

                    <FormInput
                      label="Mã số thuế"
                      required
                      placeholder="Ví dụ: 0312345678"
                      value={formData.taxCode}
                      onChange={(e) => handleInputChange('taxCode', e.target.value)}
                      error={errors.taxCode}
                      icon={<FileText size={16} />}
                    />
                  </div>

                  <FormInput
                    label="Địa chỉ trụ sở công ty"
                    placeholder="Số nhà, đường, khu công nghiệp, tỉnh/thành..."
                    value={formData.companyAddress || ''}
                    onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                    icon={<MapPin size={16} />}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormInput
                      label="Email nhận thông báo công ty"
                      type="email"
                      placeholder="logistics@company.com"
                      value={formData.notificationEmail || ''}
                      onChange={(e) => handleInputChange('notificationEmail', e.target.value)}
                      error={errors.notificationEmail}
                      icon={<Mail size={16} />}
                    />

                    <FormInput
                      label="Số điện thoại công ty"
                      type="tel"
                      placeholder="028 3888 xxxx"
                      value={formData.companyPhone || ''}
                      onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                      icon={<Phone size={16} />}
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3 space-y-3">
                  <PrimaryButton
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={submitting}
                    icon={<ArrowRight size={18} />}
                    iconPosition="right"
                  >
                    Đăng ký tài khoản
                  </PrimaryButton>

                  <div className="text-center pt-1">
                    <span className="text-xs text-slate-500">Đã có tài khoản? </span>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="text-xs font-bold text-[#004ba0] hover:text-[#003366] hover:underline"
                    >
                      Đăng nhập
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
