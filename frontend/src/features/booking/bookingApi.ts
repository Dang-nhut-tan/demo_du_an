import { pb } from '../../services/pocketbase';
import { BookingContainer, RequestStatus } from '../../types';
import { ComboboxOption } from '../../components/ui/SearchableCombobox';

export type { ComboboxOption };

export interface BookingFormData {
  id?: string;
  requestCode?: string;
  bookingNumber: string;
  companyId?: string;
  companyName?: string;
  shippingLine: string;
  vesselVoyage?: string;
  requestType: string;

  // Dates (TMS Fields B)
  requestedDropOffBefore?: string;
  requestedDropOffAfter?: string;
  siCutoff?: string;
  portCutoff?: string;
  emptyPickupDate?: string;
  vesselDepartureDate?: string;

  // Locations & Cargo (TMS Fields C)
  packingLocation: string;
  emptyPickupLocation: string;
  clearanceDepot: string;
  destinationPort: string;
  transshipmentPort?: string;
  cargoType: string;

  // Containers (TMS Fields D)
  containers: BookingContainer[];

  // Notes & Attachments (TMS Fields E)
  notes?: string;
  status: RequestStatus;
  attachments?: File[];

  // Historical Snapshot Fields (Immutable for existing bookings)
  shippingLineName?: string;
  packingLocationName?: string;
  stuffingLocationName?: string;
  emptyPickupLocationName?: string;
  customsClearanceLocationName?: string;
  clearanceDepotName?: string;
  destinationPortName?: string;
  transshipmentPortName?: string;
  cargoTypeName?: string;
  containerTypesSnapshot?: string;
}

export interface FormFieldConfig {
  id?: string;
  fieldKey: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  displayOrder?: number;
  isVisible: boolean;
  defaultValue?: string;
}

export const DEFAULT_FORM_CONFIGS: Record<string, FormFieldConfig> = {
  bookingNumber: {
    fieldKey: 'bookingNumber',
    label: 'Số Booking / Lệnh',
    placeholder: 'Nhập mã số booking',
    helpText: 'Mã số booking do hãng tàu cấp',
    displayOrder: 1,
    isVisible: true,
  },
  shippingLine: {
    fieldKey: 'shippingLine',
    label: 'Hãng tàu',
    placeholder: 'Chọn hãng tàu',
    helpText: 'Hãng tàu container vận chuyển chính',
    displayOrder: 2,
    isVisible: true,
    defaultValue: 'ONETRANS',
  },
  vesselName: {
    fieldKey: 'vesselName',
    label: 'Tên tàu / Số chuyến',
    placeholder: 'VD: ONE CONTINUITY / 042W',
    helpText: 'Tên tàu và số chuyến xuất phát theo booking',
    displayOrder: 3,
    isVisible: true,
  },
  vesselVoyage: {
    fieldKey: 'vesselVoyage',
    label: 'Tên tàu / Số chuyến',
    placeholder: 'VD: ONE CONTINUITY / 042W',
    helpText: 'Tên tàu và số chuyến xuất phát theo booking',
    displayOrder: 3,
    isVisible: true,
  },
  requestType: {
    fieldKey: 'requestType',
    label: 'Loại yêu cầu',
    placeholder: '-- Chọn loại yêu cầu --',
    displayOrder: 4,
    isVisible: true,
    defaultValue: 'Vận chuyển container xuất khẩu',
  },
  requestedDropOffBefore: {
    fieldKey: 'requestedDropOffBefore',
    label: 'Hạ cont trước ngày',
    placeholder: 'Chọn ngày',
    displayOrder: 5,
    isVisible: true,
  },
  requestedDropOffAfter: {
    fieldKey: 'requestedDropOffAfter',
    label: 'Hạ cont sau ngày',
    placeholder: 'Chọn ngày',
    displayOrder: 6,
    isVisible: true,
  },
  siCutoff: {
    fieldKey: 'siCutoff',
    label: 'Giờ cắt SI',
    placeholder: 'Chọn thời gian',
    displayOrder: 7,
    isVisible: true,
  },
  portCutoff: {
    fieldKey: 'portCutoff',
    label: 'Giờ cắt máng (CY Cutoff)',
    placeholder: 'Chọn thời gian',
    displayOrder: 8,
    isVisible: true,
  },
  emptyPickupDate: {
    fieldKey: 'emptyPickupDate',
    label: 'Ngày lấy rỗng',
    placeholder: 'Chọn ngày',
    displayOrder: 9,
    isVisible: true,
  },
  vesselDepartureDate: {
    fieldKey: 'vesselDepartureDate',
    label: 'Ngày tàu chạy (ETD)',
    placeholder: 'Chọn ngày',
    displayOrder: 10,
    isVisible: true,
  },
  stuffingLocation: {
    fieldKey: 'stuffingLocation',
    label: 'Nơi đóng hàng',
    placeholder: 'Chọn kho / nhà máy',
    helpText: 'Kho đóng hàng hoặc nhà máy sản xuất',
    displayOrder: 11,
    isVisible: true,
    defaultValue: 'Kho U&I Bình Dương',
  },
  packingLocation: {
    fieldKey: 'packingLocation',
    label: 'Nơi đóng hàng',
    placeholder: 'Chọn kho / nhà máy',
    helpText: 'Kho đóng hàng hoặc nhà máy sản xuất',
    displayOrder: 11,
    isVisible: true,
    defaultValue: 'Kho U&I Bình Dương',
  },
  emptyPickupLocation: {
    fieldKey: 'emptyPickupLocation',
    label: 'Nơi lấy rỗng',
    placeholder: 'Chọn depot cấp cont rỗng',
    helpText: 'Depot cấp vỏ container rỗng',
    displayOrder: 12,
    isVisible: true,
    defaultValue: 'DEPOT BÌNH DƯƠNG 6',
  },
  customsClearanceLocation: {
    fieldKey: 'customsClearanceLocation',
    label: 'Hạ bãi thanh lý',
    placeholder: 'Chọn điểm hạ bãi kiểm hóa',
    helpText: 'Bãi hạ container để làm thủ tục hải quan',
    displayOrder: 13,
    isVisible: true,
    defaultValue: 'Return Gold',
  },
  clearanceDepot: {
    fieldKey: 'clearanceDepot',
    label: 'Hạ bãi thanh lý',
    placeholder: 'Chọn điểm hạ bãi kiểm hóa',
    helpText: 'Bãi hạ container để làm thủ tục hải quan',
    displayOrder: 13,
    isVisible: true,
    defaultValue: 'Return Gold',
  },
  destinationPort: {
    fieldKey: 'destinationPort',
    label: 'Cảng đến',
    placeholder: 'Chọn cảng đích',
    helpText: 'Cảng đích quốc tế đến',
    displayOrder: 14,
    isVisible: true,
    defaultValue: 'LOS ANGELES, CA',
  },
  transshipmentPort: {
    fieldKey: 'transshipmentPort',
    label: 'Cảng chuyển tải',
    placeholder: 'Chọn cảng trung chuyển (nếu có)',
    helpText: 'Cảng trung chuyển quá cảnh',
    displayOrder: 15,
    isVisible: true,
  },
  cargoType: {
    fieldKey: 'cargoType',
    label: 'Loại hàng hóa',
    placeholder: 'Chọn loại hàng',
    helpText: 'Loại và tính chất hàng hóa đóng trong container',
    displayOrder: 16,
    isVisible: true,
    defaultValue: 'Nội thất gỗ',
  },
  notes: {
    fieldKey: 'notes',
    label: 'Ghi chú đóng hàng',
    placeholder: 'Ghi chú đặc biệt về quy cách chằng buộc, thời gian...',
    displayOrder: 17,
    isVisible: true,
  },
};

export const fetchFormFieldConfigs = async (): Promise<Record<string, FormFieldConfig>> => {
  const configs: Record<string, FormFieldConfig> = { ...DEFAULT_FORM_CONFIGS };
  try {
    const records = await pb.collection('form_field_config').getFullList({
      sort: 'displayOrder',
    });
    for (const rec of records) {
      if (rec.fieldKey) {
        configs[rec.fieldKey] = {
          id: rec.id,
          fieldKey: rec.fieldKey,
          label: rec.label || configs[rec.fieldKey]?.label || rec.fieldKey,
          placeholder: rec.placeholder ?? configs[rec.fieldKey]?.placeholder,
          helpText: rec.helpText ?? configs[rec.fieldKey]?.helpText,
          displayOrder: rec.displayOrder ?? configs[rec.fieldKey]?.displayOrder,
          isVisible: rec.isVisible !== undefined ? Boolean(rec.isVisible) : true,
          defaultValue: rec.defaultValue ?? configs[rec.fieldKey]?.defaultValue,
        };
      }
    }
  } catch (_e) {
    // collection may not be populated yet; return defaults
  }
  return configs;
};

export interface MasterData {
  shippingLines: ComboboxOption[];
  locations: ComboboxOption[];
  ports: ComboboxOption[];
  cargoTypes: ComboboxOption[];
  containerTypes: ComboboxOption[];
  shippingLinesList: string[];
  locationsList: string[];
  portsList: string[];
  cargoTypesList: string[];
  containerTypesList: string[];
}

export const FALLBACK_MASTER_DATA: MasterData = {
  shippingLines: [
    { value: 'ONETRANS', label: 'ONETRANS', code: 'ONE', isActive: true, sortOrder: 1 },
    { value: 'MAERSK', label: 'MAERSK', code: 'MAE', isActive: true, sortOrder: 2 },
    { value: 'COSCO', label: 'COSCO', code: 'COS', isActive: true, sortOrder: 3 },
    { value: 'EVERGREEN', label: 'EVERGREEN', code: 'EMC', isActive: true, sortOrder: 4 },
    { value: 'HAPAG-LLOYD', label: 'HAPAG-LLOYD', code: 'HPL', isActive: true, sortOrder: 5 },
  ],
  locations: [
    { value: 'DEPOT BÌNH DƯƠNG 6', label: 'DEPOT BÌNH DƯƠNG 6', code: 'DPBD6', isActive: true, sortOrder: 1 },
    { value: 'Return Gold', label: 'Return Gold', code: 'RTG', isActive: true, sortOrder: 2 },
    { value: 'Kho U&I Bình Dương', label: 'Kho U&I Bình Dương', code: 'WH-BD', isActive: true, sortOrder: 3 },
    { value: 'Kho U&I HCM', label: 'Kho U&I HCM', code: 'WH-HCM', isActive: true, sortOrder: 4 },
    { value: 'ICD Sóng Thần', label: 'ICD Sóng Thần', code: 'ICD-ST', isActive: true, sortOrder: 5 },
    { value: 'Depot Tân Vạn', label: 'Depot Tân Vạn', code: 'DP-TV', isActive: true, sortOrder: 6 },
  ],
  ports: [
    { value: 'LOS ANGELES, CA', label: 'LOS ANGELES, CA', code: 'USLAX', isActive: true, sortOrder: 1 },
    { value: 'Cảng Cát Lái', label: 'Cảng Cát Lái', code: 'VNSGN', isActive: true, sortOrder: 2 },
    { value: 'Cảng Cái Mép', label: 'Cảng Cái Mép', code: 'VNTOT', isActive: true, sortOrder: 3 },
    { value: 'LONG BEACH, CA', label: 'LONG BEACH, CA', code: 'USLGB', isActive: true, sortOrder: 4 },
    { value: 'Cảng Hải Phòng', label: 'Cảng Hải Phòng', code: 'VNHPH', isActive: true, sortOrder: 5 },
  ],
  cargoTypes: [
    { value: 'Nội thất gỗ', label: 'Nội thất gỗ', code: 'WOOD', isActive: true, sortOrder: 1 },
    { value: 'Hàng bách hóa / May mặc', label: 'Hàng bách hóa / May mặc', code: 'GEN', isActive: true, sortOrder: 2 },
    { value: 'Nông sản / Thực phẩm', label: 'Nông sản / Thực phẩm', code: 'AGRI', isActive: true, sortOrder: 3 },
    { value: 'Điện tử & Linh kiện', label: 'Điện tử & Linh kiện', code: 'ELEC', isActive: true, sortOrder: 4 },
    { value: 'Hàng đông lạnh', label: 'Hàng đông lạnh', code: 'REEF', isActive: true, sortOrder: 5 },
  ],
  containerTypes: [
    { value: "40' cao", label: "40' cao", code: '40HC', isActive: true, sortOrder: 1 },
    { value: "40' thường", label: "40' thường", code: '40GP', isActive: true, sortOrder: 2 },
    { value: "20' thường", label: "20' thường", code: '20GP', isActive: true, sortOrder: 3 },
    { value: "20' lạnh", label: "20' lạnh", code: '20RF', isActive: true, sortOrder: 4 },
    { value: "40' lạnh", label: "40' lạnh", code: '40RF', isActive: true, sortOrder: 5 },
  ],
  shippingLinesList: ['ONETRANS', 'MAERSK', 'COSCO', 'EVERGREEN', 'HAPAG-LLOYD'],
  locationsList: ['DEPOT BÌNH DƯƠNG 6', 'Return Gold', 'Kho U&I Bình Dương', 'Kho U&I HCM', 'ICD Sóng Thần', 'Depot Tân Vạn'],
  portsList: ['LOS ANGELES, CA', 'Cảng Cát Lái', 'Cảng Cái Mép', 'LONG BEACH, CA', 'Cảng Hải Phòng'],
  cargoTypesList: ['Nội thất gỗ', 'Hàng bách hóa / May mặc', 'Nông sản / Thực phẩm', 'Điện tử & Linh kiện', 'Hàng đông lạnh'],
  containerTypesList: ["40' cao", "40' thường", "20' thường", "20' lạnh", "40' lạnh"],
};

// Helper to map DB records to ComboboxOption
const mapToComboboxOptions = (records: any[], fallback: ComboboxOption[]): ComboboxOption[] => {
  if (!records || records.length === 0) return fallback;
  return records.map((r) => ({
    value: r.name || r.code || r.id,
    label: r.name || r.code,
    code: r.code,
    description: r.description,
    isActive: r.isActive !== undefined ? r.isActive : true,
    sortOrder: r.sortOrder ?? 0,
  }));
};

// Fetch master data from PocketBase filtering for 'isActive = true' sorted by sortOrder asc, name asc
export const fetchMasterData = async (): Promise<MasterData> => {
  try {
    const [linesRes, locsRes, portsRes, cargoRes, typesRes] = await Promise.allSettled([
      pb.collection('shipping_lines').getFullList({
        filter: 'isActive = true',
        sort: 'sortOrder,name',
      }),
      pb.collection('locations').getFullList({
        filter: 'isActive = true',
        sort: 'sortOrder,name',
      }),
      pb.collection('ports').getFullList({
        filter: 'isActive = true',
        sort: 'sortOrder,name',
      }),
      pb.collection('cargo_types').getFullList({
        filter: 'isActive = true',
        sort: 'sortOrder,name',
      }),
      pb.collection('container_types').getFullList({
        filter: 'isActive = true',
        sort: 'sortOrder,name',
      }),
    ]);

    const shippingLines =
      linesRes.status === 'fulfilled' && linesRes.value.length > 0
        ? mapToComboboxOptions(linesRes.value, FALLBACK_MASTER_DATA.shippingLines)
        : FALLBACK_MASTER_DATA.shippingLines;

    const locations =
      locsRes.status === 'fulfilled' && locsRes.value.length > 0
        ? mapToComboboxOptions(locsRes.value, FALLBACK_MASTER_DATA.locations)
        : FALLBACK_MASTER_DATA.locations;

    const ports =
      portsRes.status === 'fulfilled' && portsRes.value.length > 0
        ? mapToComboboxOptions(portsRes.value, FALLBACK_MASTER_DATA.ports)
        : FALLBACK_MASTER_DATA.ports;

    const cargoTypes =
      cargoRes.status === 'fulfilled' && cargoRes.value.length > 0
        ? mapToComboboxOptions(cargoRes.value, FALLBACK_MASTER_DATA.cargoTypes)
        : FALLBACK_MASTER_DATA.cargoTypes;

    const containerTypes =
      typesRes.status === 'fulfilled' && typesRes.value.length > 0
        ? mapToComboboxOptions(typesRes.value, FALLBACK_MASTER_DATA.containerTypes)
        : FALLBACK_MASTER_DATA.containerTypes;

    return {
      shippingLines,
      locations,
      ports,
      cargoTypes,
      containerTypes,
      shippingLinesList: shippingLines.map((o) => o.label),
      locationsList: locations.map((o) => o.label),
      portsList: ports.map((o) => o.label),
      cargoTypesList: cargoTypes.map((o) => o.label),
      containerTypesList: containerTypes.map((o) => o.label),
    };
  } catch (_e) {
    return FALLBACK_MASTER_DATA;
  }
};

// Load shipping defaults for auto-fill
export const loadShippingDefaults = async () => {
  try {
    const local = localStorage.getItem('u_and_i_shipping_defaults');
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed.autoFillEnabled) return parsed;
    }

    const records = await pb.collection('shipping_defaults').getList(1, 1);
    if (records.items.length > 0) {
      const def = records.items[0];
      return {
        autoFillEnabled: true,
        defaultShippingLine: def.shippingLine || 'ONETRANS',
        defaultPackingLocation: def.stuffingLocation || def.packingLocation || 'Kho U&I Bình Dương',
        defaultEmptyPickupLocation: def.emptyPickupLocation || 'DEPOT BÌNH DƯƠNG 6',
        defaultClearanceDepot: def.customsClearanceLocation || def.clearanceDepot || 'Return Gold',
        defaultDestinationPort: def.destinationPort || 'LOS ANGELES, CA',
        defaultTransshipmentPort: def.transshipmentPort || 'Cảng Cát Lái',
        defaultCargoType: def.cargoType || 'Nội thất gỗ',
        defaultContainerType: def.defaultContainerType || def.preferredContainerType || "40' cao",
      };
    }
  } catch (_e) {
    // fallback
  }

  return {
    autoFillEnabled: true,
    defaultShippingLine: 'ONETRANS',
    defaultPackingLocation: 'Kho U&I Bình Dương',
    defaultEmptyPickupLocation: 'DEPOT BÌNH DƯƠNG 6',
    defaultClearanceDepot: 'Return Gold',
    defaultDestinationPort: 'LOS ANGELES, CA',
    defaultTransshipmentPort: 'Cảng Cát Lái',
    defaultCargoType: 'Nội thất gỗ',
    defaultContainerType: "40' cao",
  };
};

export const generateRequestCode = (): string => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(100 + Math.random() * 900);
  return `REQ-${yy}${mm}${dd}-${rand}`;
};

export const saveBookingRequest = async (
  formData: BookingFormData,
  isDraft: boolean = false
): Promise<{ id: string; requestCode: string }> => {
  const status: RequestStatus = isDraft ? 'DRAFT' : 'PENDING';
  const requestCode = formData.requestCode || formData.bookingNumber || generateRequestCode();

  const totalContainers = formData.containers.reduce((sum, c) => sum + (c.quantity || 0), 0) || 1;

  // Resolve user and company
  const userModel = pb.authStore.model;
  let companyId = formData.companyId || userModel?.company;

  if (!companyId) {
    try {
      const companies = await pb.collection('companies').getList(1, 1);
      if (companies.items.length > 0) companyId = companies.items[0].id;
    } catch (_e) {
      // fallback
    }
  }

  // Schema matches 1700000002_logistics_collections.js & 1700000004_change_request_master_data.js
  // Stores BOTH operational values AND historical snapshot names
  const payload: any = {
    bookingNumber: formData.bookingNumber || requestCode,
    company: companyId,
    customer: userModel?.id,
    shippingLine: formData.shippingLine,
    shippingLineName: formData.shippingLineName || formData.shippingLine,
    vesselName: formData.vesselVoyage?.split('/')[0]?.trim() || formData.vesselVoyage || 'ONE CONTINUITY',
    voyageNumber: formData.vesselVoyage?.split('/')[1]?.trim() || '042W',
    requestedClosingBeforeDate: formData.requestedDropOffBefore || '',
    requestedClosingAfterDate: formData.requestedDropOffAfter || '',
    siCutoffTime: formData.siCutoff || '',
    cutoffTime: formData.portCutoff || '',
    emptyPickupDate: formData.emptyPickupDate || '',
    departureDate: formData.vesselDepartureDate || '',
    stuffingLocation: formData.packingLocation,
    packingLocationName: formData.packingLocationName || formData.packingLocation,
    stuffingLocationName: formData.packingLocationName || formData.packingLocation,
    emptyPickupLocation: formData.emptyPickupLocation,
    emptyPickupLocationName: formData.emptyPickupLocationName || formData.emptyPickupLocation,
    customsClearanceLocation: formData.clearanceDepot,
    customsClearanceLocationName: formData.clearanceDepotName || formData.clearanceDepot,
    destinationPort: formData.destinationPort,
    destinationPortName: formData.destinationPortName || formData.destinationPort,
    transshipmentPort: formData.transshipmentPort || '',
    transshipmentPortName: formData.transshipmentPortName || formData.transshipmentPort || '',
    cargoType: formData.cargoType,
    cargoTypeName: formData.cargoTypeName || formData.cargoType,
    containerTypesSnapshot: JSON.stringify(formData.containers),
    totalContainers,
    notes: formData.notes || '',
    status,
  };

  let bookingId = formData.id;

  try {
    if (bookingId) {
      await pb.collection('booking_requests').update(bookingId, payload);
    } else {
      const created = await pb.collection('booking_requests').create(payload);
      bookingId = created.id;
    }

    // Save container rows to booking_containers
    if (bookingId && formData.containers && formData.containers.length > 0) {
      for (const cont of formData.containers) {
        if (cont.quantity > 0) {
          try {
            await pb.collection('booking_containers').create({
              booking: bookingId,
              containerType: cont.containerType,
              quantity: cont.quantity,
              requestedYCGCDate: cont.requestedYCGCDate || '',
              notes: `${cont.quantity}x ${cont.containerType}`,
            });
          } catch (_e) {
            // continue
          }
        }
      }
    }

    // Save file attachments if any
    if (bookingId && formData.attachments && formData.attachments.length > 0) {
      for (const file of formData.attachments) {
        try {
          const fileData = new FormData();
          fileData.append('booking', bookingId);
          fileData.append('file', file);
          fileData.append('fileName', file.name);
          fileData.append('fileSize', String(file.size));
          fileData.append('uploadedBy', userModel?.id || '');
          await pb.collection('booking_attachments').create(fileData);
        } catch (_e) {
          // continue
        }
      }
    }

    // If submitted, create initial tracking stage in transport_progress
    if (!isDraft && bookingId && userModel?.role === 'dispatcher') {
      try {
        await pb.collection('transport_progress').create({
          booking: bookingId,
          stage: 'received',
          stageOrder: 1,
          title: 'Tiếp nhận yêu cầu',
          description: 'Đã nhận thông tin booking từ khách hàng',
          location: 'Trung tâm Điều vận U&I Logistics',
          status: 'COMPLETED',
        });
      } catch (_e) {
        // continue
      }
    }
  } catch (err) {
    console.warn('PocketBase save error, using fallback:', err);
    const localKey = 'u_and_i_offline_bookings';
    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
    const newRecord = {
      id: bookingId || `local-${Date.now()}`,
      ...payload,
      requestCode,
      containers: formData.containers,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    existing.unshift(newRecord);
    localStorage.setItem(localKey, JSON.stringify(existing));
    return { id: newRecord.id, requestCode };
  }

  return { id: bookingId || `req-${Date.now()}`, requestCode };
};
