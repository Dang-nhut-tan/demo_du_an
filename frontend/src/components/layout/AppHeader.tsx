import React from 'react';
import { ArrowLeft, Bell, Home, User as UserIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppHeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  unreadCount?: number;
  onOpenNotifications?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  showBack,
  onBack,
  unreadCount = 2,
  onOpenNotifications,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const shouldShowBack = showBack !== undefined ? showBack : !isHome;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#004ba0] text-white px-4 py-3 flex items-center justify-between shadow-md select-none transition-colors">
      {/* Left Action: Back Arrow or Spacer */}
      <div className="w-10 flex items-center justify-start">
        {shouldShowBack ? (
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/15 active:bg-white/20 transition-all text-white focus:outline-none"
            aria-label="Quay lại"
          >
            <ArrowLeft size={22} />
          </button>
        ) : (
          <div className="w-9 h-9 flex items-center justify-center text-white/80">
            {/* Optional hamburger menu placeholder */}
            <div className="space-y-1 w-5 cursor-pointer" onClick={() => navigate('/profile')}>
              <span className="block h-0.5 w-5 bg-white rounded-full"></span>
              <span className="block h-0.5 w-4 bg-white rounded-full"></span>
              <span className="block h-0.5 w-5 bg-white rounded-full"></span>
            </div>
          </div>
        )}
      </div>

      {/* Center Brand Identity */}
      <div
        className="flex flex-col items-center justify-center cursor-pointer text-center"
        onClick={() => navigate('/')}
      >
        <div className="flex items-center gap-0.5 font-black text-lg tracking-tight leading-none text-white">
          <span className="font-extrabold italic text-xl">U</span>
          <span className="text-[#f37021] font-black italic text-xl mx-0.5">&amp;</span>
          <span className="font-extrabold italic text-xl">I</span>
          <span className="ml-1.5 font-bold tracking-tight text-white text-base">Logistics</span>
          <span className="text-[10px] font-semibold text-white/80 ml-0.5 -mt-1.5">®</span>
        </div>
        <span className="text-[11px] font-medium text-blue-100 tracking-normal mt-0.5">
          Customer Portal (PWA)
        </span>
      </div>

      {/* Right Actions: Notifications Bell & Profile / Home */}
      <div className="flex items-center gap-1">
        <button
          onClick={onOpenNotifications || (() => navigate('/notifications'))}
          className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/15 active:bg-white/20 transition-all text-white focus:outline-none"
          aria-label="Thông báo"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#f37021] rounded-full ring-2 ring-[#004ba0] animate-pulse"></span>
          )}
        </button>

        {isHome ? (
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/15 active:bg-white/20 transition-all text-white focus:outline-none"
            aria-label="Hồ sơ tài khoản"
          >
            <div className="w-7 h-7 rounded-full bg-white text-[#004ba0] flex items-center justify-center font-bold text-xs shadow-sm">
              <UserIcon size={16} />
            </div>
          </button>
        ) : (
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/15 active:bg-white/20 transition-all text-white focus:outline-none"
            aria-label="Về trang chủ"
          >
            <div className="w-7 h-7 rounded-full bg-white text-[#004ba0] flex items-center justify-center font-bold text-xs shadow-sm">
              <Home size={16} />
            </div>
          </button>
        )}
      </div>
    </header>
  );
};
