import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught component error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-xl border border-rose-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mb-1">
              {this.props.fallbackTitle || 'Đã xảy ra sự cố hiển thị'}
            </h2>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Trang tạm thời không thể nạp đầy đủ dữ liệu hoặc có xung đột bộ nhớ tạm. Vui lòng bấm tải lại trang để phục hồi.
            </p>
            {this.state.error && (
              <div className="text-[11px] font-mono bg-slate-50 text-slate-600 p-2.5 rounded-xl border border-slate-200 mb-5 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#004ba0] hover:bg-[#003b80] text-white text-xs font-bold rounded-xl shadow-md transition-all w-full justify-center"
            >
              <RefreshCw size={14} />
              <span>Tải lại trang</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
