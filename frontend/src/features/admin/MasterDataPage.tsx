import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Power,
  RefreshCw,
  AlertCircle,
  X,
  Save,
  CheckCircle2,
  HelpCircle,
  Ship,
  Warehouse,
  Box,
  FileCheck,
  Anchor,
  Compass,
  Package,
  Layers,
  Trash2,
} from 'lucide-react';
import {
  MASTER_DATA_CATEGORIES,
  fetchMasterDataItems,
  createMasterDataItem,
  updateMasterDataItem,
  toggleMasterDataActive,
  deleteMasterDataItem,
} from './adminApi';
import { MasterDataCategoryKey, MasterDataItem } from '../../types';

export const MasterDataPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<MasterDataCategoryKey>('shipping_lines');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [items, setItems] = useState<MasterDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSortOrder, setFormSortOrder] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Confirmation Modal for Soft Deactivate/Activate
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    item: MasterDataItem | null;
    targetState: boolean;
  }>({ open: false, item: null, targetState: false });

  const activeCategoryMeta = MASTER_DATA_CATEGORIES.find((c) => c.key === selectedCategory)!;

  const loadItems = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchMasterDataItems(selectedCategory, statusFilter, searchQuery);
      setItems(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể tải danh sách dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [selectedCategory, statusFilter, searchQuery]);

  const generateCodeFromName = (val: string): string => {
    return val
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 15);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingItem && (!formCode || formCode === generateCodeFromName(formName))) {
      setFormCode(generateCodeFromName(val));
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormCode('');
    setFormName('');
    setFormDescription('');
    setFormSortOrder(items.length + 1);
    setFormIsActive(true);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (item: MasterDataItem) => {
    setEditingItem(item);
    setFormCode(item.code);
    setFormName(item.name);
    setFormDescription(item.description || '');
    setFormSortOrder(item.sortOrder);
    setFormIsActive(item.isActive);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = formName.trim() || formCode.trim();
    const finalCode = (formCode.trim() || generateCodeFromName(finalName) || `ITEM_${Date.now().toString().slice(-4)}`).toUpperCase();

    if (!finalName && !finalCode) {
      setErrorMessage('Vui lòng nhập tên hoặc mã danh mục!');
      return;
    }

    setFormSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingItem) {
        // Update existing record
        await updateMasterDataItem(selectedCategory, editingItem.id, {
          code: finalCode,
          name: finalName,
          description: formDescription.trim(),
          sortOrder: Number(formSortOrder) || items.length + 1,
          isActive: formIsActive,
        });
        setSuccessMessage(`Đã cập nhật bản ghi "${finalName}" thành công!`);
      } else {
        // Create new record
        await createMasterDataItem(selectedCategory, {
          code: finalCode,
          name: finalName,
          description: formDescription.trim(),
          sortOrder: Number(formSortOrder) || items.length + 1,
          isActive: formIsActive,
        });
        setSuccessMessage(`Đã thêm mới bản ghi "${finalName}" vào danh mục thành công!`);
      }
      setModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadItems();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi lưu dữ liệu');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteItem = async (item: MasterDataItem) => {
    const title = item.name || item.code || 'bản ghi này';
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bản ghi "${title}" khỏi danh mục không?`)) {
      return;
    }
    try {
      await deleteMasterDataItem(selectedCategory, item.id);
      setSuccessMessage(`Đã xóa bản ghi "${title}" thành công!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadItems();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi xóa bản ghi');
    }
  };

  const triggerSoftToggle = (item: MasterDataItem) => {
    setConfirmDialog({
      open: true,
      item,
      targetState: !item.isActive,
    });
  };

  const executeSoftToggle = async () => {
    if (!confirmDialog.item) return;
    const targetItem = confirmDialog.item;
    const newState = confirmDialog.targetState;

    try {
      await toggleMasterDataActive(selectedCategory, targetItem.id, newState);
      setSuccessMessage(
        `Đã ${newState ? 'kích hoạt lại' : 'tạm ngừng (soft-deactivate)'} bản ghi "${targetItem.name}". Dữ liệu lịch sử booking trước đây vẫn được bảo toàn nguyên vẹn.`
      );
      setConfirmDialog({ open: false, item: null, targetState: false });
      setTimeout(() => setSuccessMessage(null), 4000);
      await loadItems();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi đổi trạng thái');
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Ship': return <Ship size={16} />;
      case 'Warehouse': return <Warehouse size={16} />;
      case 'Box': return <Box size={16} />;
      case 'FileCheck': return <FileCheck size={16} />;
      case 'Anchor': return <Anchor size={16} />;
      case 'Compass': return <Compass size={16} />;
      case 'Package': return <Package size={16} />;
      case 'Layers': return <Layers size={16} />;
      default: return <Ship size={16} />;
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header Title with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Quản Lý Master Data</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#004ba0]">
              {items.length} bản ghi
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeCategoryMeta.description}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 bg-[#004ba0] hover:bg-[#003b80] active:scale-[0.98] text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-[#004ba0]/25 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Thêm bản ghi mới</span>
        </button>
      </div>

      {/* Category Horizontal Switcher Tabs */}
      <div className="bg-white rounded-3xl p-1.5 border border-slate-200/80 shadow-sm flex items-center gap-1 overflow-x-auto no-scrollbar">
        {MASTER_DATA_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-2 py-2 px-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-150 shrink-0 ${
                isSelected
                  ? 'bg-[#004ba0] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {getCategoryIcon(cat.iconName)}
              <span>{cat.label.split('(')[0].trim()}</span>
            </button>
          );
        })}
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search & Status Filters Bar */}
      <div className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#004ba0] focus:ring-1 focus:ring-[#004ba0]/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-slate-100 rounded-2xl p-1 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-xl transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-xl transition-all ${
                statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Hoạt động
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1 rounded-xl transition-all ${
                statusFilter === 'inactive' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tạm ngừng
            </button>
          </div>

          <button
            onClick={loadItems}
            disabled={loading}
            className="p-2 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all shrink-0"
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Master Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-400 font-semibold uppercase text-[11px] border-b border-slate-100 select-none">
              <tr>
                <th className="py-3 px-5 text-center w-16">Thứ tự</th>
                <th className="py-3 px-5 w-32">Mã code</th>
                <th className="py-3 px-5">Tên bản ghi</th>
                <th className="py-3 px-5">Mô tả / Ghi chú</th>
                <th className="py-3 px-5 text-center w-36">Trạng thái</th>
                <th className="py-3 px-5 text-right w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#004ba0]" />
                    <span>Đang tải danh mục master data...</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <HelpCircle size={28} className="mx-auto mb-2 text-slate-300" />
                    <span>Không tìm thấy bản ghi nào phù hợp</span>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-5 text-center font-bold text-slate-500">
                      {item.sortOrder}
                    </td>
                    <td className="py-3 px-5">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {item.code}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-bold text-slate-900">
                      {item.name}
                    </td>
                    <td className="py-3 px-5 text-slate-500 max-w-xs truncate">
                      {item.description || '—'}
                    </td>
                    <td className="py-3 px-5 text-center">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Hoạt động</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span>Tạm ngừng</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-[#004ba0] hover:bg-blue-50 rounded-xl transition-all"
                          title="Sửa thông tin"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => triggerSoftToggle(item)}
                          className={`p-1.5 rounded-xl transition-all ${
                            item.isActive
                              ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={item.isActive ? 'Tạm ngừng sử dụng (Soft Deactivate)' : 'Kích hoạt lại'}
                        >
                          <Power size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Xóa bản ghi"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Master Data Record */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-[#004ba0] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">
                  {editingItem ? 'Sửa bản ghi Master Data' : 'Thêm mới Master Data'}
                </h3>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  Danh mục: {activeCategoryMeta.label}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã code
                  </label>
                  <input
                    type="text"
                    name="code"
                    placeholder="VD: HMM (tự sinh nếu để trống)"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full py-2 px-3 text-xs text-slate-800 bg-white rounded-xl border border-slate-200 focus:border-[#004ba0] focus:ring-1 focus:ring-[#004ba0] uppercase font-mono font-bold outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Duy nhất &amp; viết hoa (tự sinh nếu để trống)</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thứ tự sắp xếp
                  </label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    className="w-full py-2 px-3 text-xs text-slate-800 bg-white rounded-xl border border-slate-200 focus:border-[#004ba0] focus:ring-1 focus:ring-[#004ba0] outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Số nhỏ xếp trước</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên hiển thị <span className="text-[#f37021]">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="VD: Hyundai Merchant Marine, Kho U&I Bình Dương..."
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full py-2.5 px-3 text-xs text-slate-800 bg-white rounded-xl border border-slate-200 focus:border-[#004ba0] focus:ring-1 focus:ring-[#004ba0] outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả / Thông tin chi tiết
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Ghi chú địa chỉ, hãng tàu hoặc quy cách..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2.5 text-xs text-slate-800 bg-white rounded-xl border border-slate-200 focus:border-[#004ba0] focus:ring-1 focus:ring-[#004ba0] outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#004ba0] focus:ring-[#004ba0]"
                  />
                  <span>Kích hoạt ngay (cho phép khách hàng chọn khi tạo yêu cầu)</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#004ba0] hover:bg-[#003b80] transition-all shadow-md shadow-[#004ba0]/20"
                >
                  <Save size={14} />
                  <span>{formSubmitting ? 'Đang lưu...' : 'Lưu bản ghi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Soft Deactivate / Activate Confirmation Modal */}
      {confirmDialog.open && confirmDialog.item && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 text-center space-y-4 animate-fadeIn">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                confirmDialog.targetState ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
              }`}
            >
              <Power size={28} />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {confirmDialog.targetState
                  ? `Kích hoạt lại "${confirmDialog.item.name}"?`
                  : `Tạm ngừng sử dụng "${confirmDialog.item.name}"?`}
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {confirmDialog.targetState
                  ? 'Bản ghi sẽ hiển thị lại trong danh sách combobox khi khách hàng tạo yêu cầu mới.'
                  : 'Hệ thống áp dụng cơ chế Soft-Deactivate (không xóa vĩnh viễn). Bản ghi sẽ ẩn khỏi dropdown tạo booking mới nhưng các booking lịch sử đã lập vẫn được bảo toàn nguyên vẹn.'}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog({ open: false, item: null, targetState: false })}
                className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={executeSoftToggle}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold text-white transition-all shadow-md ${
                  confirmDialog.targetState
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                }`}
              >
                {confirmDialog.targetState ? 'Xác nhận kích hoạt' : 'Xác nhận tạm ngừng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
