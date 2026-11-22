import React from 'react';
import { Home, FilePlus, Truck, User, LucideIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Trang chủ', icon: Home, path: '/' },
  { id: 'booking', label: 'Tạo yêu cầu', icon: FilePlus, path: '/booking/new' },
  { id: 'tracking', label: 'Theo dõi', icon: Truck, path: '/tracking' },
  { id: 'profile', label: 'Tài khoản', icon: User, path: '/profile' },
];

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="shrink-0 z-40 bg-white border-t border-slate-200/90 shadow-lg px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] select-none transition-all">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 focus:outline-none ${
                isActive
                  ? 'text-[#004ba0] font-semibold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-transform ${
                  isActive ? 'scale-110 bg-blue-50 text-[#004ba0]' : ''
                }`}
              >
                <IconComponent size={21} />
              </div>
              <span className={`text-[11px] mt-0.5 ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
