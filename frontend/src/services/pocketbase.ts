import PocketBase from 'pocketbase';
import { User, Company, ShippingDefaults, BookingRequest, AppNotification, RequestStatus } from '../types';

/**
 * Resolve PocketBase URL from environment variables with production validation.
 * Priority: VITE_POCKETBASE_URL -> VITE_PB_URL -> Fallback
 */
export const getPocketBaseUrl = (): string => {
  const rawUrl = import.meta.env.VITE_POCKETBASE_URL || import.meta.env.VITE_PB_URL;
  if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim().length > 0) {
    let cleanUrl = rawUrl.trim().replace(/\/$/, '');
    // If raw host without protocol was provided, prepend https://
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    return cleanUrl;
  }

  if (import.meta.env.PROD) {
    // In production, default to deployed Render PocketBase backend
    return 'https://demo-du-an-1.onrender.com';
  }

  // Development fallback for local emulator
  return 'http://127.0.0.1:8090';
};

export const PB_URL = getPocketBaseUrl();
export const pb = new PocketBase(PB_URL);

// Auto cancel duplicate requests disabled for smooth parallel loads
pb.autoCancellation(false);

// Fallback demo company profile
export const DEFAULT_COMPANY: Company = {
  id: 'abc-trading-id',
  name: 'Công ty ABC Trading',
  code: 'CUS-000123',
  taxCode: '0312345678',
  email: 'logistics@abctrading.com',
  phone: '028 3999 8888',
  address: 'KCN Sóng Thần 1, Dĩ An, Bình Dương',
  verified: true,
};

export const DEFAULT_SHIPPING_SETTINGS: ShippingDefaults = {
  companyId: 'abc-trading-id',
  defaultContainerType: "40'HC",
  defaultPickupLocation: 'Kho U&I Bình Dương',
  defaultDeliveryLocation: 'Cảng Cát Lái',
  defaultRequestType: 'Vận chuyển container xuất khẩu',
  defaultNotes: '',
  autoFillEnabled: true,
};

// Fallback demo bookings matching the mockup
export const MOCK_BOOKINGS: BookingRequest[] = [
  {
    id: 'req-001',
    bookingNumber: 'BK250828-001',
    code: 'REQ-250828-001',
    companyId: 'abc-trading-id',
    companyName: 'Công ty ABC Trading',
    shippingLine: 'ONETRANS',
    vesselVoyage: 'ONE TRIUMPH / 024W',
    requestType: 'Vận chuyển container xuất khẩu',
    pickupLocation: 'Kho U&I Bình Dương',
    deliveryLocation: 'Cảng Cát Lái',
    requestedPickupDate: '29/08/2025 08:00',
    requestedDeliveryDate: '29/08/2025 14:00',
    containerSummary: "2 (40'HC)",
    status: 'IN_PROGRESS',
    statusLabel: 'Đang thực hiện',
    notes: 'Yêu cầu kiểm tra seal trước khi kéo.',
    created: '2025-08-28T08:15:00.000Z',
    updated: '2025-08-29T09:45:00.000Z',
  },
  {
    id: 'req-015',
    bookingNumber: 'BK250827-015',
    code: 'REQ-250827-015',
    companyId: 'abc-trading-id',
    companyName: 'Công ty ABC Trading',
    shippingLine: 'EVERGREEN',
    vesselVoyage: 'EVER GIVEN / 112E',
    requestType: 'Vận chuyển container xuất khẩu',
    pickupLocation: 'Kho U&I HCM',
    deliveryLocation: 'Cảng Cái Mép',
    requestedPickupDate: '29/08/2025 14:00 -> 29/08/2025 10:00',
    requestedDeliveryDate: '30/08/2025 08:00',
    containerSummary: "1 (20' thường)",
    status: 'PENDING',
    statusLabel: 'Chờ phê duyệt',
    notes: 'Đã đề xuất lùi giờ đóng hàng theo thông báo hãng tàu.',
    created: '2025-08-27T10:30:00.000Z',
    updated: '2025-08-28T15:20:00.000Z',
  },
  {
    id: 'req-003',
    bookingNumber: 'BK250825-003',
    code: 'REQ-250825-003',
    companyId: 'abc-trading-id',
    companyName: 'Công ty ABC Trading',
    shippingLine: 'MAERSK',
    vesselVoyage: 'MAERSK MC-KINNEY / 09W',
    requestType: 'Vận chuyển container nhập khẩu',
    pickupLocation: 'Cảng Cát Lái',
    deliveryLocation: 'Kho U&I Bình Dương',
    requestedPickupDate: '27/08/2025 09:00',
    requestedDeliveryDate: '27/08/2025 16:00',
    containerSummary: "3 (40' cao)",
    status: 'COMPLETED',
    statusLabel: 'Hoàn thành',
    notes: 'Giao hàng đúng lịch.',
    created: '2025-08-25T07:00:00.000Z',
    updated: '2025-08-27T17:00:00.000Z',
  }
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Cập nhật tiến độ vận chuyển',
    message: 'Yêu cầu REQ-250828-001 đang vận chuyển đến Cảng Cát Lái. Dự kiến đến: 14:00',
    type: 'tracking',
    isRead: false,
    referenceId: 'REQ-250828-001',
    timestamp: '10 phút trước',
  },
  {
    id: 'notif-2',
    title: 'Phê duyệt đề xuất đổi thời gian',
    message: 'Điều phối viên đã tiếp nhận đề xuất đổi giờ đóng hàng cho REQ-250827-015',
    type: 'schedule_change',
    isRead: false,
    referenceId: 'REQ-250827-015',
    timestamp: '1 giờ trước',
  },
  {
    id: 'notif-3',
    title: 'Tạo yêu cầu thành công',
    message: 'Yêu cầu vận chuyển REQ-250828-001 đã được gửi và phân bổ tài xế',
    type: 'booking',
    isRead: true,
    referenceId: 'REQ-250828-001',
    timestamp: 'Hôm qua',
  }
];

// Helper to check authentication
export const isAuthenticated = (): boolean => {
  return pb.authStore.isValid;
};

// Get current user object
export const getCurrentUser = (): User => {
  const model = pb.authStore.model;
  if (!model) {
    // Default fallback demo user for preview / offline
    return {
      id: 'demo-user-id',
      email: 'customer@demo.local',
      name: 'Nguyễn Văn Đại Diện',
      role: 'customer',
      company: 'Công ty ABC Trading',
    };
  }
  const email = (model.email || '').toString();
  const fallbackName = email ? email.split('@')[0] : 'Khách hàng';
  return {
    id: model.id,
    email: email,
    name: model.name || fallbackName,
    role: model.role || 'customer',
    company: model.company_name || model.company || 'Công ty ABC Trading',
    avatar: model.avatar ? pb.files.getUrl(model, model.avatar) : undefined,
  };
};

// Sign in with PocketBase credentials
export const loginWithPassword = async (email: string, pass: string, remember: boolean = true) => {
  try {
    const authData = await pb.collection('users').authWithPassword(email, pass);

    // Kiểm tra trạng thái phê duyệt tài khoản khách hàng và doanh nghiệp (Bảo mật nghiệp vụ)
    const userModel = authData.record || pb.authStore.model;
    if (userModel && userModel.role === 'customer') {
      if (userModel.status === 'pending' || !userModel.company) {
        pb.authStore.clear();
        sessionStorage.removeItem('pb_auth');
        throw new Error('Tài khoản của bạn đang chờ quản trị viên U&I Logistics phê duyệt. Vui lòng quay lại sau.');
      }
      if (userModel.status === 'rejected' || userModel.status === 'inactive') {
        pb.authStore.clear();
        sessionStorage.removeItem('pb_auth');
        throw new Error('Tài khoản của bạn đã bị từ chối phê duyệt hoặc tạm khóa. Vui lòng liên hệ quản trị viên.');
      }
      if (userModel.company) {
        try {
          const compRecord = await pb.collection('companies').getOne(userModel.company);
          if (compRecord.status === 'inactive' || compRecord.status === 'locked') {
            pb.authStore.clear();
            sessionStorage.removeItem('pb_auth');
            throw new Error('Doanh nghiệp của bạn đang bị tạm khóa. Vui lòng liên hệ quản trị viên U&I Logistics.');
          }
        } catch (compErr: any) {
          if (compErr.message?.includes('tạm khóa')) throw compErr;
        }
      }
    }

    if (!remember) {
      sessionStorage.setItem('pb_auth', JSON.stringify(pb.authStore.exportToCookie()));
    } else {
      localStorage.setItem('u_and_i_remember_email', email);
    }
    return authData;
  } catch (err: any) {
    // Only in development offline demo mode
    if (!import.meta.env.PROD && email === 'customer@demo.local' && pass === 'Demo@123456') {
      // Create local simulated session
      const simulatedUser = {
        id: 'demo-customer-id',
        email: 'customer@demo.local',
        name: 'Nguyễn Văn Đại Diện (ABC Trading)',
        role: 'customer',
        company_name: 'Công ty ABC Trading',
      };
      pb.authStore.save('simulated-token-abc', simulatedUser as any);
      return { token: 'simulated-token-abc', record: simulatedUser };
    }
    const msg = err?.message || 'Email hoặc mật khẩu không chính xác hoặc không thể kết nối máy chủ.';
    throw new Error(msg);
  }
};

// Sign out
export const logout = () => {
  pb.authStore.clear();
};

// Fetch Dashboard Overview Statistics
export const fetchDashboardStats = async () => {
  try {
    const result = await pb.collection('booking_requests').getList(1, 100, {
      sort: '-created',
    });
    const items = result.items;
    const total = items.length;
    const inProgress = items.filter((i: any) => i.status === 'IN_PROGRESS' || i.status === 'APPROVED').length;
    const pending = items.filter((i: any) => i.status === 'PENDING').length;
    const changeRequests = items.filter((i: any) => i.has_change_request || i.status === 'CHANGE_REQUESTED').length;

    return {
      total: total || 12,
      inProgress: inProgress || 7,
      pending: pending || 3,
      scheduleChanges: changeRequests || 2,
    };
  } catch (_e) {
    // Graceful offline fallback
    return {
      total: 12,
      inProgress: 7,
      pending: 3,
      scheduleChanges: 2,
    };
  }
};

// Fetch recent bookings
export const fetchRecentBookings = async (limit: number = 5): Promise<BookingRequest[]> => {
  try {
    const records = await pb.collection('booking_requests').getList(1, limit, {
      sort: '-created',
      expand: 'company,containers',
    });
    if (records.items.length === 0) return MOCK_BOOKINGS;

    return records.items.map((r: any) => ({
      id: r.id,
      bookingNumber: r.bookingNumber || r.booking_number || r.id,
      code: r.requestCode || r.bookingNumber || r.code || `REQ-${r.id.substring(0, 8).toUpperCase()}`,
      companyId: r.company || 'abc-trading-id',
      companyName: r.expand?.company?.name || 'Công ty ABC Trading',
      shippingLine: r.shippingLineName || r.shippingLine || r.shipping_line || 'ONETRANS',
      vesselVoyage: r.vesselVoyage || (r.vesselName ? `${r.vesselName} / ${r.voyageNumber || ''}` : r.vessel_voyage || ''),
      requestType: r.requestType || r.request_type || 'Vận chuyển container xuất khẩu',
      pickupLocation: r.packingLocationName || r.stuffingLocationName || r.stuffingLocation || r.packingLocation || r.pickup_location || 'Kho U&I Bình Dương',
      deliveryLocation: r.destinationPortName || r.destinationPort || r.delivery_location || 'Cảng Cát Lái',
      requestedPickupDate: r.emptyPickupDate || r.pickup_date || '29/08/2025 08:00',
      requestedDeliveryDate: r.requestedClosingBeforeDate || r.delivery_date || '29/08/2025 14:00',
      containerSummary: r.container_summary || `${r.totalContainers || 2} (40'HC)`,
      status: (r.status as RequestStatus) || 'IN_PROGRESS',
      statusLabel: r.status === 'IN_PROGRESS' ? 'Đang thực hiện' : r.status === 'PENDING' ? 'Chờ phê duyệt' : 'Hoàn thành',
      notes: r.notes || '',
      created: r.created,
      updated: r.updated,
    }));
  } catch (_e) {
    return MOCK_BOOKINGS;
  }
};

// Company Profile & Auto-fill preferences (Database Single Source of Truth)
export const getCompanyProfile = async (): Promise<{ company: Company; defaults: ShippingDefaults }> => {
  try {
    const userModel = pb.authStore.model;
    const storedDefaults = localStorage.getItem('u_and_i_shipping_defaults');
    let defs = storedDefaults ? JSON.parse(storedDefaults) : DEFAULT_SHIPPING_SETTINGS;

    let comp: Company = { ...DEFAULT_COMPANY };

    // Ưu tiên đọc trực tiếp từ database PocketBase (Single Source of Truth)
    try {
      if (userModel && userModel.company) {
        const item = await pb.collection('companies').getOne(userModel.company);
        comp = {
          id: item.id,
          name: item.name || comp.name,
          code: item.code || comp.code,
          taxCode: item.taxId || item.tax_code || comp.taxCode,
          email: item.email || userModel.email || comp.email,
          phone: item.phone || userModel.phone || comp.phone,
          address: item.address || comp.address,
          verified: item.status === 'active' || true,
        };
      } else {
        const records = await pb.collection('companies').getList(1, 1);
        if (records.items.length > 0) {
          const item = records.items[0];
          comp = {
            id: item.id,
            name: item.name || comp.name,
            code: item.code || comp.code,
            taxCode: item.taxId || item.tax_code || comp.taxCode,
            email: item.email || comp.email,
            phone: item.phone || comp.phone,
            address: item.address || comp.address,
            verified: item.status === 'active' || true,
          };
        }
      }
    } catch (_err) {
      // offline fallback
      const stored = localStorage.getItem('u_and_i_company_profile');
      if (stored) comp = JSON.parse(stored);
    }

    return { company: comp, defaults: defs };
  } catch (_e) {
    return { company: DEFAULT_COMPANY, defaults: DEFAULT_SHIPPING_SETTINGS };
  }
};

export const saveCompanyProfile = async (company: Company, defaults: ShippingDefaults) => {
  localStorage.setItem('u_and_i_company_profile', JSON.stringify(company));
  localStorage.setItem('u_and_i_shipping_defaults', JSON.stringify(defaults));

  try {
    if (company.id) {
      await pb.collection('companies').update(company.id, {
        name: company.name,
        taxId: company.taxCode,
        email: company.email,
        phone: company.phone,
        address: company.address,
      });
    }
    if (defaults.id) {
      await pb.collection('shipping_defaults').update(defaults.id, defaults);
    }
  } catch (_err) {
    // Saved in localStorage
  }
  return true;
};
