export const PB_URL = process.env.PB_URL || (process.env.TEST_ENV === 'local' ? 'http://127.0.0.1:8090' : 'https://demo-du-an-1.onrender.com');

export const TEST_USERS = {
  customer: {
    email: 'customer@demo.local',
    password: 'Demo@123456',
    companyName: 'Công ty ABC Trading',
    companyCode: 'CUS-000123',
    taxId: '0312345678',
    phone: '028 3999 8888',
  },
  dispatcher: {
    email: 'dispatcher@demo.local',
    password: 'Demo@123456',
    name: 'Điều phối viên U&I',
    role: 'dispatcher',
  },
  admin: {
    email: 'admin@demo.local',
    password: 'Admin@123456',
    name: 'Quản trị viên Hệ thống',
    role: 'admin',
  },
  invalid: {
    email: 'invalid_user@demo.local',
    password: 'WrongPassword999',
  },
};

export const TEST_BOOKING_DATA = {
  bookingNumber: 'BK-TEST-E2E-001',
  shippingLine: 'ONETRANS',
  vesselVoyage: 'ONE APUS / 012E',
  requestType: 'Vận chuyển container xuất khẩu',
  packingLocation: 'Kho U&I Bình Dương',
  emptyPickupLocation: 'DEPOT BÌNH DƯƠNG 6',
  clearanceDepot: 'DEPOT BÌNH DƯƠNG 6',
  destinationPort: 'Cảng Cát Lái',
  cargoType: 'Hàng thường (General Cargo)',
  requestedDropOffBefore: '2025-08-29T14:00',
  requestedDropOffAfter: '2025-08-29T08:00',
  siCutoff: '2025-08-29T11:00',
  emptyPickupDate: '2025-08-28T08:00',
  containers: [
    {
      containerType: "40' cao",
      quantity: 2,
      requestedYCGCDate: '2025-08-29',
    },
    {
      containerType: "20' thường",
      quantity: 1,
      requestedYCGCDate: '2025-08-29',
    },
  ],
  notes: 'E2E Automated Test Booking Request - Handle with priority',
};

export const TEST_SCHEDULE_CHANGE = {
  reason: 'Khách hàng thay đổi kế hoạch đóng hàng, lùi thời gian lấy hàng 1 ngày.',
  pickupDate: '2025-08-30',
  pickupTime: '10:00',
  deliveryDate: '2025-08-30',
  deliveryTime: '16:00',
};
