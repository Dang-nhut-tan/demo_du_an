import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Download } from 'lucide-react';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface MobileContainerProps {
  children: React.ReactNode;
  disableBottomNav?: boolean;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  // Bezel mode toggle for desktop inspection
  const [deviceFrame, setDeviceFrame] = useState<'iphone' | 'fluid'>('fluid');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    // Capture beforeinstallprompt for PWA installation
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('Để cài đặt ứng dụng: trên điện thoại mở thanh chia sẻ chọn "Thêm vào MH chính" (Add to Home Screen). Trên Chrome/Edge nhấp vào biểu tượng Cài đặt trên thanh địa chỉ.');
    }
  };

  return (
    <div className="h-screen max-h-screen w-full overflow-hidden flex flex-col bg-slate-900 text-slate-800">
      {/* Top Desktop Helper Toolbar */}
      <div className="hidden md:flex h-10 shrink-0 w-full bg-slate-950/95 text-slate-300 px-4 py-2 text-xs border-b border-slate-800 items-center justify-between gap-2 z-50">
        <div className="flex items-center gap-2">
          <span className="font-extrabold italic text-sm text-white">U</span>
          <span className="text-[#f37021] font-black italic text-sm">&amp;</span>
          <span className="font-extrabold italic text-sm text-white">I</span>
          <span className="font-semibold text-white ml-1">Logistics Customer Portal (PWA)</span>
          <span className="hidden sm:inline bg-blue-900/60 text-blue-300 text-[10px] px-2 py-0.5 rounded-full border border-blue-700/50">
            Vite + React + Tailwind
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          {!isStandalone && (
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 bg-[#004ba0] hover:bg-[#003b80] text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Download size={13} />
              <span>Cài đặt PWA</span>
            </button>
          )}

          {/* Device Frame Mode Switcher for Desktop Testing */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setDeviceFrame('iphone')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                deviceFrame === 'iphone'
                  ? 'bg-[#004ba0] text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Khung iPhone 390px tiêu chuẩn"
            >
              <Smartphone size={13} />
              <span>iPhone 390px</span>
            </button>
            <button
              onClick={() => setDeviceFrame('fluid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                deviceFrame === 'fluid'
                  ? 'bg-[#004ba0] text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ màn hình đáp ứng mở rộng"
            >
              <Monitor size={13} />
              <span>Toàn màn hình</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main App Stage Container */}
      <div className="flex-1 min-h-0 w-full flex items-center justify-center p-0 md:p-3 overflow-hidden">
        <div
          className={`transition-all duration-300 flex flex-col relative ${
            deviceFrame === 'iphone'
              ? 'h-full max-h-[min(844px,calc(100vh-3.5rem))] w-[390px] min-w-[390px] max-w-[390px] rounded-none md:rounded-[44px] shadow-none md:shadow-2xl border-0 md:border-[10px] md:border-slate-800 md:ring-1 md:ring-slate-700 overflow-hidden bg-[#f8fafc]'
              : 'h-full w-full max-w-md md:max-w-xl lg:max-w-2xl md:rounded-3xl shadow-xl overflow-hidden bg-[#f8fafc]'
          } max-md:h-[100dvh] max-md:!w-full max-md:!min-w-0 max-md:!max-w-none max-md:rounded-none max-md:border-0 max-md:shadow-none max-md:p-0`}
        >
          <ErrorBoundary fallbackTitle="Không thể hiển thị màn hình này">
            {children}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};
