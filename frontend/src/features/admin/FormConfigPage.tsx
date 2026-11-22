import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  Edit2,
  X,
  Save,
  HelpCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
} from 'lucide-react';
import { fetchFormFieldConfigs, updateFormFieldConfig } from './adminApi';
import { FormFieldConfig } from '../../types';

export const FormConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<FormFieldConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<FormFieldConfig | null>(null);
  const [formLabel, setFormLabel] = useState('');
  const [formPlaceholder, setFormPlaceholder] = useState('');
  const [formHelpText, setFormHelpText] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formIsVisible, setFormIsVisible] = useState(true);
  const [formDefaultValue, setFormDefaultValue] = useState('');

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const data = await fetchFormFieldConfigs();
      setConfigs(data);
    } catch (_err) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const openEditModal = (config: FormFieldConfig) => {
    setEditingConfig(config);
    setFormLabel(config.label);
    setFormPlaceholder(config.placeholder);
    setFormHelpText(config.helpText || '');
    setFormDisplayOrder(config.displayOrder);
    setFormIsVisible(config.isVisible);
    setFormDefaultValue(config.defaultValue || '');
    setModalOpen(true);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConfig) return;

    try {
      await updateFormFieldConfig(editingConfig.id, {
        label: formLabel.trim(),
        placeholder: formPlaceholder.trim(),
        helpText: formHelpText.trim(),
        displayOrder: Number(formDisplayOrder),
        isVisible: formIsVisible,
        defaultValue: formDefaultValue.trim(),
      });

      setSuccessMessage(`Đã cập nhật cấu hình hiển thị trường "${editingConfig.fieldKey}" thành công!`);
      setModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadConfigs();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  const toggleVisibility = async (config: FormFieldConfig) => {
    try {
      await updateFormFieldConfig(config.id, { isVisible: !config.isVisible });
      setConfigs(configs.map((c) => (c.id === config.id ? { ...c, isVisible: !c.isVisible } : c)));
      setSuccessMessage(`Đã ${!config.isVisible ? 'hiển thị' : 'ẩn'} trường "${config.label}" trên form TMS`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Cấu Hình Form TMS Động</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#004ba0]">
              {configs.length} trường
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị các thuộc tính trình bày an toàn (presentation properties): nhãn, gợi ý placeholder, hướng dẫn trợ giúp, thứ tự sắp xếp và giá trị mặc định.
          </p>
        </div>

        <button
          onClick={loadConfigs}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Info Callout */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-3xl p-4 flex items-start gap-3 text-xs text-[#004ba0]">
        <Info size={18} className="shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Cơ chế an toàn (Zero-code Schema Independence):</span> Thay đổi nhãn hiển thị, văn bản gợi ý và thứ tự tại đây chỉ tác động đến lớp giao diện (UI Layer). Cấu trúc dữ liệu và logic xác thực lõi của TMS được bảo đảm an toàn tuyệt đối.
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Configuration Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-400 font-semibold uppercase text-[11px] border-b border-slate-100 select-none">
              <tr>
                <th className="py-3 px-5 text-center w-16">Thứ tự</th>
                <th className="py-3 px-5 w-40">Mã trường (Key)</th>
                <th className="py-3 px-5">Nhãn hiển thị (Label)</th>
                <th className="py-3 px-5">Gợi ý (Placeholder)</th>
                <th className="py-3 px-5">Hướng dẫn trợ giúp</th>
                <th className="py-3 px-5 text-center w-28">Hiển thị</th>
                <th className="py-3 px-5 text-right w-24">Sửa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {configs.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 text-center font-bold text-slate-500">
                    {c.displayOrder}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {c.fieldKey}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-bold text-slate-900">{c.label}</td>
                  <td className="py-3.5 px-5 text-slate-500 max-w-xs truncate">{c.placeholder || '—'}</td>
                  <td className="py-3.5 px-5 text-slate-500 max-w-xs truncate">{c.helpText || '—'}</td>
                  <td className="py-3.5 px-5 text-center">
                    <button
                      onClick={() => toggleVisibility(c)}
                      className={`p-1.5 rounded-xl transition-all ${
                        c.isVisible
                          ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-slate-400 bg-slate-100 hover:bg-slate-200'
                      }`}
                      title={c.isVisible ? 'Đang hiển thị (Nhấp để ẩn)' : 'Đang ẩn (Nhấp để hiện)'}
                    >
                      {c.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 text-slate-500 hover:text-[#004ba0] hover:bg-blue-50 rounded-xl transition-all"
                      title="Sửa cấu hình hiển thị"
                    >
                      <Edit2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Config Modal */}
      {modalOpen && editingConfig && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">
            <div className="bg-[#004ba0] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">Cấu Hình Hiển Thị Trường TMS</h3>
                <p className="text-[11px] text-blue-100 mt-0.5 font-mono">
                  Field Key: {editingConfig.fieldKey}
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nhãn trường (Label) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Văn bản gợi ý (Placeholder)
                </label>
                <input
                  type="text"
                  value={formPlaceholder}
                  onChange={(e) => setFormPlaceholder(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dòng trợ giúp nghiệp vụ (Help text)
                </label>
                <textarea
                  rows={2}
                  value={formHelpText}
                  onChange={(e) => setFormHelpText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0] resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Giá trị mặc định gợi ý (Default Value)
                </label>
                <input
                  type="text"
                  value={formDefaultValue}
                  onChange={(e) => setFormDefaultValue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#004ba0]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formIsVisible}
                    onChange={(e) => setFormIsVisible(e.target.checked)}
                    className="w-4 h-4 rounded text-[#004ba0]"
                  />
                  <span>Hiển thị trường này trên Form tạo yêu cầu</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold text-white bg-[#004ba0] hover:bg-[#003b80]"
                >
                  <Save size={14} />
                  <span>Lưu cấu hình</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
