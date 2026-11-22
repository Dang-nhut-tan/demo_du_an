import React from 'react';
import { Plus, Trash2, Calendar, Box } from 'lucide-react';
import { BookingContainer } from '../../types';

interface ContainerTableProps {
  containers: BookingContainer[];
  onChange: (containers: BookingContainer[]) => void;
  availableTypes?: (string | { label: string; value: string })[];
  error?: string;
}

export const ContainerTable: React.FC<ContainerTableProps> = ({
  containers,
  onChange,
  availableTypes = ["40' cao", "40' thường", "20' thường"],
  error,
}) => {
  const handleTypeChange = (index: number, newType: any) => {
    const updated = [...containers];
    updated[index].containerType = newType;
    onChange(updated);
  };

  const handleQtyChange = (index: number, delta: number) => {
    const updated = [...containers];
    const newQty = Math.max(0, updated[index].quantity + delta);
    updated[index].quantity = newQty;
    onChange(updated);
  };

  const handleDateChange = (index: number, dateStr: string) => {
    const updated = [...containers];
    updated[index].requestedYCGCDate = dateStr;
    onChange(updated);
  };

  const handleAddRow = () => {
    onChange([
      ...containers,
      {
        containerType: "40' cao",
        quantity: 1,
        requestedYCGCDate: '',
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (containers.length <= 1) {
      // keep 1 row with 0 quantity if last row
      onChange([{ containerType: "40' cao", quantity: 0, requestedYCGCDate: '' }]);
      return;
    }
    const updated = containers.filter((_, i) => i !== index);
    onChange(updated);
  };

  const totalQuantity = containers.reduce((sum, c) => sum + (c.quantity || 0), 0);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          Chi tiết container <span className="text-[#f37021]">*</span>
        </label>
        <span className="text-xs font-bold text-[#004ba0] bg-blue-50 px-2.5 py-1 rounded-full">
          Tổng số lượng: {totalQuantity} cont
        </span>
      </div>

      <div className="space-y-2.5">
        {containers.map((cont, index) => (
          <div
            key={index}
            className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#004ba0] flex items-center justify-center font-bold text-xs shrink-0">
                  #{index + 1}
                </div>
                <div className="relative flex-1">
                  <select
                    value={cont.containerType}
                    onChange={(e) => handleTypeChange(index, e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 pr-7 appearance-none cursor-pointer focus:outline-none focus:border-[#004ba0]"
                  >
                    {availableTypes.map((t) => {
                      const val = typeof t === 'string' ? t : t.value;
                      const label = typeof t === 'string' ? t : t.label;
                      return (
                        <option key={val} value={val}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-1.5 py-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleQtyChange(index, -1)}
                  disabled={cont.quantity <= 0}
                  className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center font-bold text-sm transition"
                >
                  -
                </button>
                <span className="w-7 text-center font-extrabold text-sm text-slate-800">
                  {cont.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQtyChange(index, 1)}
                  className="w-6 h-6 rounded-lg bg-blue-50 text-[#004ba0] hover:bg-blue-100 flex items-center justify-center font-bold text-sm transition"
                >
                  +
                </button>
              </div>

              {/* Delete row */}
              <button
                type="button"
                onClick={() => handleRemoveRow(index)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition shrink-0"
                title="Xóa loại container"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Ngày YCGC */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-xs">
              <span className="text-slate-500 font-medium whitespace-nowrap flex items-center gap-1">
                <Calendar size={13} className="text-slate-400" />
                Ngày YCGC:
              </span>
              <input
                type="date"
                value={cont.requestedYCGCDate || ''}
                onChange={(e) => handleDateChange(index, e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-slate-800 text-xs focus:outline-none focus:border-[#004ba0]"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add row button */}
      <button
        type="button"
        onClick={handleAddRow}
        className="w-full py-2.5 px-3 border border-dashed border-[#004ba0]/40 hover:border-[#004ba0] rounded-2xl text-xs font-bold text-[#004ba0] hover:bg-blue-50/50 flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
      >
        <Plus size={15} />
        <span>Thêm loại container</span>
      </button>

      {error && <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>}
    </div>
  );
};
