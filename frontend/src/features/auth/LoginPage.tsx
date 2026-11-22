import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, ArrowRight, Smartphone, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FormInput } from '../../components/ui/FormInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { loginWithPassword, isAuthenticated } from '../../services/pocketbase';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('customer@demo.local');
  const [password, setPassword] = useState('Demo@123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If already authenticated, redirect to home
    if (isAuthenticated()) {
      // Allow user to see login if requested, or redirect
    }
    const savedEmail = localStorage.getItem('u_and_i_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginWithPassword(email, password, rememberMe);
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (role: 'customer' | 'dispatcher') => {
    if (role === 'customer') {
      setEmail('customer@demo.local');
      setPassword('Demo@123456');
    } else {
      setEmail('dispatcher@demo.local');
      setPassword('Demo@123456');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#004ba0] flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans selection:bg-[#f37021] selection:text-white">
      {/* Container simulating Desktop Mockup Stage (1672x941 proportion) */}
      <div className="w-full max-w-6xl aspect-auto lg:aspect-[1672/941] bg-gradient-to-br from-[#0051a3] via-[#003c7a] to-[#00224b] rounded-[36px] shadow-2xl overflow-hidden relative flex flex-col lg:flex-row items-center border border-white/10">
        
        {/* Left Side: Brand Imagery & Value Proposition */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between z-10 text-white relative">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-1 font-black text-3xl sm:text-4xl tracking-tight leading-none text-white drop-shadow-md">
              <span className="font-extrabold italic text-4xl sm:text-5xl">U</span>
              <span className="text-[#f37021] font-black italic text-4xl sm:text-5xl mx-0.5">&amp;</span>
              <span className="font-extrabold italic text-4xl sm:text-5xl">I</span>
              <span className="ml-2 font-bold tracking-tight text-white text-3xl sm:text-4xl">Logistics</span>
              <span className="text-sm font-semibold text-white/90 ml-1 -mt-3">®</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mt-3 tracking-wide">
              Customer Portal (PWA)
            </h2>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-blue-100 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f37021]"></span>
                Gửi yêu cầu
              </span>
              <span className="text-white/40">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f37021]"></span>
                Đề xuất thay đổi thời gian
              </span>
              <span className="text-white/40">•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f37021]"></span>
                Theo dõi tiến độ
              </span>
            </div>
          </div>

          {/* Warehouse and truck illustration / photo banner (shown on desktop/tablet) */}
          <div className="hidden lg:block mt-8 rounded-3xl overflow-hidden border border-white/20 shadow-xl bg-white/5 backdrop-blur-sm relative group">
            <img
              src="/assets/dashboard-banner.png"
              alt="U&I Logistics Fleet and Warehouse"
              className="w-full h-44 sm:h-56 object-cover object-center transform transition-transform group-hover:scale-105 duration-500"
              onError={(e) => {
                // Fallback to truck image if banner not loaded
                (e.target as HTMLImageElement).src = '/assets/warehouse-truck.png';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#003366]/80 via-transparent to-transparent flex items-end p-4">
              <p className="text-xs text-white/90 font-medium">
                Hệ thống điều phối vận tải logistics thông minh &amp; đồng bộ thời gian thực
              </p>
            </div>
          </div>

          {/* Quick Demo Helper Tags */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-white/60">Tài khoản demo sẵn có:</span>
            <button
              type="button"
              onClick={() => fillQuickDemo('customer')}
              className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full text-blue-100 text-xs font-medium transition-all"
            >
              Khách hàng (customer)
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('dispatcher')}
              className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full text-blue-100 text-xs font-medium transition-all"
            >
              Điều phối viên (dispatcher)
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Login Card */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-14 z-10 flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-[32px] sm:rounded-[36px] p-6 sm:p-10 shadow-2xl border border-slate-100 relative">
            
            {/* Header with Avatar Circle */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#004ba0] text-white flex items-center justify-center shadow-lg shadow-[#004ba0]/25 mb-3">
                <LogIn size={28} className="translate-x-0.5" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Đăng nhập
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Cổng thông tin khách hàng U&I Logistics
              </p>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <FormInput
                label="Email / Tên đăng nhập"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@demo.local"
                icon={<Mail size={18} />}
              />

              <FormInput
                label="Mật khẩu"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock size={18} />}
              />

              {/* Options row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#004ba0] focus:ring-[#004ba0] border-slate-300"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Vui lòng liên hệ quản trị viên tổng đài U&I Logistics (1900 xxxx) để cấp lại mật khẩu!');
                  }}
                  className="text-[#004ba0] hover:text-[#003366] font-semibold hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>

              {/* Login Button */}
              <PrimaryButton
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                icon={<ArrowRight size={18} />}
                iconPosition="right"
                className="mt-2"
              >
                Đăng nhập
              </PrimaryButton>

              {/* Registration Link */}
              <div className="text-center pt-2.5">
                <span className="text-xs text-slate-500">Chưa có tài khoản? </span>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-xs font-bold text-[#004ba0] hover:text-[#003366] hover:underline"
                >
                  Đăng ký ngay
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-slate-400 font-medium">
                    Hoặc đăng nhập bằng
                  </span>
                </div>
              </div>

              {/* Microsoft SSO Button */}
              <button
                type="button"
                onClick={() => {
                  alert('Đăng nhập Microsoft Azure AD SSO: Đang kích hoạt kết nối dịch vụ tài khoản doanh nghiệp.');
                }}
                className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.99]"
              >
                {/* Microsoft 4-square logo */}
                <div className="grid grid-cols-2 gap-0.5 shrink-0">
                  <div className="w-2 h-2 bg-[#f25022]"></div>
                  <div className="w-2 h-2 bg-[#7fba00]"></div>
                  <div className="w-2 h-2 bg-[#00a4ef]"></div>
                  <div className="w-2 h-2 bg-[#ffb900]"></div>
                </div>
                <span>Tài khoản Microsoft (nếu được cấp)</span>
              </button>

              {/* PWA Install Promotion Box */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
                <span className="font-extrabold text-[#004ba0] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  PWA
                </span>
                <span className="flex items-center gap-1">
                  <Smartphone size={13} className="text-[#f37021]" />
                  Cài đặt ứng dụng (Thêm vào màn hình chính)
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
