/**
 * Seed script for U&I Logistics Customer Portal & Admin System
 * Connects to PocketBase on port 8090 and creates initial demo data idempotently.
 * 
 * Accounts created:
 * - Admin (Superuser & User): admin@demo.local / Admin@123456
 * - Customer: customer@demo.local / Demo@123456
 * - Dispatcher: dispatcher@demo.local / Demo@123456
 */

const POCKETBASE_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@demo.local';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'Admin@123456';

async function fetchPb(endpoint, options = {}, token = null) {
  const url = `${POCKETBASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': token } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[${response.status}] ${options.method || 'GET'} ${endpoint}: ${errorText}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function getAdminToken() {
  try {
    const authData = await fetchPb('/api/admins/auth-with-password', {
      method: 'POST',
      body: JSON.stringify({
        identity: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });
    console.log(`[Seed] Authenticated as admin: ${ADMIN_EMAIL}`);
    return authData.token;
  } catch (err) {
    console.error(`[Seed] Failed to authenticate admin: ${err.message}`);
    throw err;
  }
}

async function findFirst(collection, filter, token) {
  const query = new URLSearchParams({ filter, perPage: '1' });
  const result = await fetchPb(`/api/collections/${collection}/records?${query.toString()}`, {}, token);
  return result.items && result.items.length > 0 ? result.items[0] : null;
}

async function upsertRecord(collection, filterField, filterVal, data, token) {
  const filter = `${filterField} = "${filterVal}"`;
  const existing = await findFirst(collection, filter, token);

  if (existing) {
    const updated = await fetchPb(`/api/collections/${collection}/records/${existing.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }, token);
    return updated;
  } else {
    const created = await fetchPb(`/api/collections/${collection}/records`, {
      method: 'POST',
      body: JSON.stringify({ ...data, [filterField]: filterVal })
    }, token);
    return created;
  }
}

async function seed() {
  console.log(`[Seed] Connecting to PocketBase at ${POCKETBASE_URL}...`);
  const token = await getAdminToken();

  // 1. Companies
  console.log('[Seed] Seeding Companies...');
  const companyAbc = await upsertRecord('companies', 'code', 'UIL-KH-9921', {
    name: 'Công ty ABC Trading',
    taxId: '0312345678',
    address: 'KCN Sóng Thần, Dĩ An, Bình Dương',
    phone: '0274 3738 888',
    email: 'contact@abctrading.vn',
    status: 'active'
  }, token);
  console.log(`  -> Company: ${companyAbc.name} (${companyAbc.id})`);

  // 2. Master Data: Shipping Lines
  console.log('[Seed] Seeding Shipping Lines...');
  const shippingLinesData = [
    { code: 'ONE', name: 'ONETRANS', description: 'Ocean Network Express / ONETRANS', isActive: true, sortOrder: 1 },
    { code: 'MAE', name: 'MAERSK', description: 'A.P. Moller – Maersk Group', isActive: true, sortOrder: 2 },
    { code: 'COS', name: 'COSCO', description: 'China Ocean Shipping Company', isActive: true, sortOrder: 3 },
    { code: 'EMC', name: 'EVERGREEN', description: 'Evergreen Marine Corp', isActive: true, sortOrder: 4 },
    { code: 'HPL', name: 'HAPAG-LLOYD', description: 'Hapag-Lloyd Container Line', isActive: true, sortOrder: 5 }
  ];
  for (const sl of shippingLinesData) {
    await upsertRecord('shipping_lines', 'code', sl.code, sl, token);
  }

  // 3. Master Data: Locations
  console.log('[Seed] Seeding Locations...');
  const locationsData = [
    { code: 'DEPOT-BD6', name: 'DEPOT BÌNH DƯƠNG 6', description: 'Bãi cọc cont rỗng Dĩ An', type: 'depot', address: 'Bình Dương', isActive: true, sortOrder: 1 },
    { code: 'RET-GOLD', name: 'Return Gold', description: 'Điểm hạ bãi thanh lý Return Gold', type: 'return_point', address: 'Bình Dương', isActive: true, sortOrder: 2 },
    { code: 'WH-UI-BD', name: 'Kho U&I Bình Dương', description: 'Tổng kho logistics U&I Sóng Thần 1', type: 'warehouse', address: 'KCN Sóng Thần 1, Dĩ An, Bình Dương', isActive: true, sortOrder: 3 },
    { code: 'WH-UI-HCM', name: 'Kho U&I HCM', description: 'Kho phân phối U&I Quận 9', type: 'warehouse', address: 'Quận 9, TP. Thủ Đức, TP.HCM', isActive: true, sortOrder: 4 },
    { code: 'ICD-ST', name: 'ICD Sóng Thần', description: 'Cảng cạn ICD Sóng Thần', type: 'depot', address: 'Dĩ An, Bình Dương', isActive: true, sortOrder: 5 },
    { code: 'DEPOT-TV', name: 'Depot Tân Vạn', description: 'Depot container Tân Vạn', type: 'depot', address: 'Biên Hòa, Đồng Nai', isActive: true, sortOrder: 6 }
  ];
  for (const loc of locationsData) {
    await upsertRecord('locations', 'code', loc.code, loc, token);
  }

  // 4. Master Data: Ports
  console.log('[Seed] Seeding Ports...');
  const portsData = [
    { code: 'USLAX', name: 'LOS ANGELES, CA', description: 'Port of Los Angeles, USA', country: 'USA', type: 'destination', isActive: true, sortOrder: 1 },
    { code: 'VNCLI', name: 'Cảng Cát Lái', description: 'Cảng Tân Cảng Cát Lái TP.HCM', country: 'Vietnam', type: 'transshipment', isActive: true, sortOrder: 2 },
    { code: 'VNVUT', name: 'Cảng Cái Mép', description: 'Cụm Cảng Quốc tế Cái Mép - Thị Vải', country: 'Vietnam', type: 'transshipment', isActive: true, sortOrder: 3 },
    { code: 'USLGB', name: 'LONG BEACH, CA', description: 'Port of Long Long Beach, California', country: 'USA', type: 'destination', isActive: true, sortOrder: 4 },
    { code: 'VNHPH', name: 'Cảng Hải Phòng', description: 'Cụm cảng Hải Phòng / Lạch Huyện', country: 'Vietnam', type: 'both', isActive: true, sortOrder: 5 }
  ];
  for (const p of portsData) {
    await upsertRecord('ports', 'code', p.code, p, token);
  }

  // 5. Master Data: Cargo Types
  console.log('[Seed] Seeding Cargo Types...');
  const cargoTypesData = [
    { code: 'GEN', name: 'Hàng bách hóa / May mặc', description: 'General Cargo / Garments', isActive: true, sortOrder: 1 },
    { code: 'WOOD', name: 'Nội thất gỗ', description: 'Wooden Furniture & Handicrafts', isActive: true, sortOrder: 2 },
    { code: 'AGRI', name: 'Nông sản / Thực phẩm', description: 'Agricultural & Food Products', isActive: true, sortOrder: 3 },
    { code: 'ELEC', name: 'Điện tử & Linh kiện', description: 'Electronics & High-tech components', isActive: true, sortOrder: 4 },
    { code: 'REEFER', name: 'Hàng đông lạnh', description: 'Temperature-controlled reefer cargo', isActive: true, sortOrder: 5 }
  ];
  for (const c of cargoTypesData) {
    await upsertRecord('cargo_types', 'code', c.code, c, token);
  }

  // 6. Master Data: Container Types
  console.log('[Seed] Seeding Container Types...');
  const containerTypesData = [
    { code: '20GP', name: "20' thường", description: '20ft General Purpose Dry Container', isActive: true, sortOrder: 1 },
    { code: '40GP', name: "40' thường", description: '40ft General Purpose Dry Container', isActive: true, sortOrder: 2 },
    { code: '40HC', name: "40' cao", description: '40ft High Cube Dry Container', isActive: true, sortOrder: 3 },
    { code: '20RF', name: "20' lạnh", description: '20ft Refrigerated Container', isActive: true, sortOrder: 4 },
    { code: '40RF', name: "40' lạnh", description: '40ft Refrigerated Container', isActive: true, sortOrder: 5 }
  ];
  for (const ct of containerTypesData) {
    await upsertRecord('container_types', 'code', ct.code, ct, token);
  }

  // 7. Form Field Configurations
  console.log('[Seed] Seeding Form Field Configurations...');
  const formFieldConfigs = [
    { fieldKey: 'bookingNumber', label: 'Số Booking / Lệnh', placeholder: 'Nhập mã số booking', helpText: 'Mã số cấp bởi hãng tàu', displayOrder: 1, isVisible: true },
    { fieldKey: 'shippingLine', label: 'Hãng tàu', placeholder: 'Chọn hãng tàu', helpText: 'Chọn từ danh mục hãng tàu liên kết', displayOrder: 2, isVisible: true, defaultValue: 'ONETRANS' },
    { fieldKey: 'vesselName', label: 'Tên tàu / Số chuyến', placeholder: 'VD: ONE CONTINUITY / 042W', helpText: 'Tên tàu chuyên chở và số hiệu chuyến', displayOrder: 3, isVisible: true },
    { fieldKey: 'stuffingLocation', label: 'Nơi đóng hàng', placeholder: 'Chọn kho / nhà máy', helpText: 'Địa điểm xe đến lấy/đóng hàng', displayOrder: 4, isVisible: true, defaultValue: 'Kho U&I Bình Dương' },
    { fieldKey: 'emptyPickupLocation', label: 'Nơi lấy rỗng', placeholder: 'Chọn depot cấp cont rỗng', helpText: 'Bãi cấp cont chỉ định của hãng tàu', displayOrder: 5, isVisible: true, defaultValue: 'DEPOT BÌNH DƯƠNG 6' },
    { fieldKey: 'customsClearanceLocation', label: 'Hạ bãi thanh lý', placeholder: 'Chọn điểm hạ bãi kiểm hóa', helpText: 'Cảng/depot thanh lý hải quan', displayOrder: 6, isVisible: true, defaultValue: 'Return Gold' },
    { fieldKey: 'destinationPort', label: 'Cảng đến', placeholder: 'Chọn cảng đích', helpText: 'Cảng dỡ hàng tại nước nhập khẩu', displayOrder: 7, isVisible: true, defaultValue: 'LOS ANGELES, CA' },
    { fieldKey: 'transshipmentPort', label: 'Cảng chuyển tải', placeholder: 'Chọn cảng trung chuyển (nếu có)', helpText: 'Cảng trung chuyển quá cảnh', displayOrder: 8, isVisible: true, defaultValue: 'Cảng Cát Lái' },
    { fieldKey: 'cargoType', label: 'Loại hàng hóa', placeholder: 'Chọn loại hàng', helpText: 'Phân loại mặt hàng chuyên chở', displayOrder: 9, isVisible: true, defaultValue: 'Nội thất gỗ' },
    { fieldKey: 'notes', label: 'Ghi chú đóng hàng', placeholder: 'Ghi chú đặc biệt về quy cách chằng buộc, thời gian...', helpText: 'Tối đa 500 ký tự', displayOrder: 10, isVisible: true }
  ];
  for (const cfg of formFieldConfigs) {
    await upsertRecord('form_field_config', 'fieldKey', cfg.fieldKey, cfg, token);
  }

  // 8. Users
  console.log('[Seed] Seeding Users...');
  const customerUser = await upsertRecord('users', 'email', 'customer@demo.local', {
    username: 'customer',
    name: 'Nguyễn Văn Khách',
    role: 'customer',
    company: companyAbc.id,
    phone: '0901234567',
    password: 'Demo@123456',
    passwordConfirm: 'Demo@123456',
    emailVisibility: true,
    verified: true
  }, token);
  console.log(`  -> Customer User: customer@demo.local (${customerUser.id})`);

  const dispatcherUser = await upsertRecord('users', 'email', 'dispatcher@demo.local', {
    username: 'dispatcher',
    name: 'Trần Điều Vận',
    role: 'dispatcher',
    phone: '0987654321',
    password: 'Demo@123456',
    passwordConfirm: 'Demo@123456',
    emailVisibility: true,
    verified: true
  }, token);
  console.log(`  -> Dispatcher User: dispatcher@demo.local (${dispatcherUser.id})`);

  const adminUser = await upsertRecord('users', 'email', 'admin@demo.local', {
    username: 'admin',
    name: 'Quản trị hệ thống U&I',
    role: 'admin',
    phone: '0911000999',
    password: 'Admin@123456',
    passwordConfirm: 'Admin@123456',
    emailVisibility: true,
    verified: true
  }, token);
  console.log(`  -> Admin User: admin@demo.local (${adminUser.id})`);

  // 9. Customer Profile & Shipping Defaults
  console.log('[Seed] Seeding Customer Profile & Shipping Defaults...');
  await upsertRecord('customer_profiles', 'user', customerUser.id, {
    company: companyAbc.id,
    fullName: 'Nguyễn Văn Khách',
    position: 'Trưởng phòng Xuất nhập khẩu',
    phone: '0901234567',
    department: 'Phòng Logistics & XNK',
    autoFillEnabled: true
  }, token);

  await upsertRecord('shipping_defaults', 'company', companyAbc.id, {
    user: customerUser.id,
    shippingLine: 'ONETRANS',
    vesselName: 'ONE CONTINUITY',
    stuffingLocation: 'Kho U&I Bình Dương',
    emptyPickupLocation: 'DEPOT BÌNH DƯƠNG 6',
    customsClearanceLocation: 'Return Gold',
    destinationPort: 'LOS ANGELES, CA',
    transshipmentPort: 'Cảng Cát Lái',
    cargoType: 'Nội thất gỗ',
    defaultContainerType: "40' cao",
    defaultQuantity: 2,
    notes: 'Giao container trước 17:00. Hàng nội thất gỗ xuất khẩu đi Mỹ.'
  }, token);

  // 10. Booking Requests & Containers & Tracking
  console.log('[Seed] Seeding Sample Bookings & Workflows...');

  // Booking 1: APPROVED with 7 transport stages & historical snapshot
  const booking1 = await upsertRecord('booking_requests', 'bookingNumber', 'REQ-250828-001', {
    customer: customerUser.id,
    company: companyAbc.id,
    shippingLine: 'ONETRANS',
    shippingLineName: 'ONETRANS',
    vesselName: 'ONE CONTINUITY',
    voyageNumber: '042W',
    requestedClosingBeforeDate: '2026-08-28',
    requestedClosingAfterDate: '2026-08-29',
    siCutoffTime: '2026-08-29 11:30',
    cutoffTime: '2026-08-29 17:00',
    emptyPickupDate: '2026-08-28 08:00',
    departureDate: '2026-08-30 06:00',
    stuffingLocation: 'Kho U&I Bình Dương',
    stuffingLocationName: 'Kho U&I Bình Dương',
    packingLocationName: 'Kho U&I Bình Dương',
    emptyPickupLocation: 'DEPOT BÌNH DƯƠNG 6',
    emptyPickupLocationName: 'DEPOT BÌNH DƯƠNG 6',
    customsClearanceLocation: 'Return Gold',
    customsClearanceLocationName: 'Return Gold',
    destinationPort: 'LOS ANGELES, CA',
    destinationPortName: 'LOS ANGELES, CA',
    transshipmentPort: 'Cảng Cát Lái',
    transshipmentPortName: 'Cảng Cát Lái',
    cargoType: 'Nội thất gỗ',
    cargoTypeName: 'Nội thất gỗ',
    containerTypesSnapshot: "2x 40' cao, 1x 20' thường",
    weight: '24,500 kg',
    totalContainers: 3,
    notes: 'Yêu cầu kiểm tra kín nước sàn cont trước khi đóng kiện gỗ.',
    status: 'APPROVED',
    approvedBy: dispatcherUser.id,
    approvedAt: '2026-08-28 09:00'
  }, token);

  // Containers for Booking 1
  const existingCont1 = await findFirst('booking_containers', `booking = "${booking1.id}"`, token);
  if (!existingCont1) {
    await fetchPb('/api/collections/booking_containers/records', {
      method: 'POST',
      body: JSON.stringify({
        booking: booking1.id,
        containerType: "40' cao",
        quantity: 2,
        requestedYCGCDate: '2026-08-29',
        notes: '2x40HC hàng nội thất phòng khách'
      })
    }, token);
    await fetchPb('/api/collections/booking_containers/records', {
      method: 'POST',
      body: JSON.stringify({
        booking: booking1.id,
        containerType: "20' thường",
        quantity: 1,
        requestedYCGCDate: '2026-08-29',
        notes: '1x20GP phụ kiện kim khí'
      })
    }, token);
  }

  // Transport Progress (7 stages) for Booking 1
  const existingProg1 = await findFirst('transport_progress', `booking = "${booking1.id}"`, token);
  if (!existingProg1) {
    const stages = [
      {
        booking: booking1.id,
        stage: 'received',
        stageOrder: 1,
        title: 'Tiếp nhận yêu cầu',
        description: 'Đã nhận thông tin booking REQ-250828-001 từ ABC Trading',
        location: 'Trung tâm Điều vận U&I Logistics',
        status: 'COMPLETED',
        completedAt: '2026-08-28 08:30',
        updatedBy: dispatcherUser.id
      },
      {
        booking: booking1.id,
        stage: 'confirmed',
        stageOrder: 2,
        title: 'Xác nhận lịch vận chuyển',
        description: 'Đã đối soát giờ cắt SI và hạ bãi với hãng tàu ONETRANS',
        location: 'ONETRANS Office',
        status: 'COMPLETED',
        completedAt: '2026-08-28 09:15',
        updatedBy: dispatcherUser.id
      },
      {
        booking: booking1.id,
        stage: 'planning',
        stageOrder: 3,
        title: 'Lập kế hoạch & điều xe',
        description: 'Phân công 2 đầu kéo từ Đội xe U&I Logistics Bình Dương',
        location: 'Depot Đội xe Bình Dương',
        status: 'COMPLETED',
        completedAt: '2026-08-28 10:00',
        driverName: 'Nguyễn Văn Tài',
        driverPhone: '0912.888.999',
        licensePlate: '51C-882.19',
        updatedBy: dispatcherUser.id
      },
      {
        booking: booking1.id,
        stage: 'dispatched',
        stageOrder: 4,
        title: 'Điều vận / Xe đến kho',
        description: 'Đầu kéo 51C-882.19 đã lấy cont rỗng tại DEPOT BÌNH DƯƠNG 6 và đến kho',
        location: 'Kho U&I Bình Dương',
        status: 'COMPLETED',
        completedAt: '2026-08-28 13:45',
        driverName: 'Nguyễn Văn Tài',
        driverPhone: '0912.888.999',
        licensePlate: '51C-882.19',
        updatedBy: dispatcherUser.id
      },
      {
        booking: booking1.id,
        stage: 'packing',
        stageOrder: 5,
        title: 'Đóng hàng & bấm chì',
        description: 'Đóng 560 kiện gỗ, kiểm đếm đủ số lượng, bấm chì hãng tàu',
        location: 'Kho U&I Bình Dương - Cửa 04',
        status: 'COMPLETED',
        completedAt: '2026-08-28 16:30',
        containerNumber: 'ONEU9921820',
        sealNumber: 'UIL-2026-88',
        updatedBy: dispatcherUser.id
      },
      {
        booking: booking1.id,
        stage: 'transporting',
        stageOrder: 6,
        title: 'Đang vận chuyển đến Cảng Cát Lái',
        description: 'Xe đang di chuyển trên Xa Lộ Hà Nội, dự kiến đến cảng lúc 19:30',
        location: 'Xa Lộ Hà Nội, TP. Thủ Đức',
        status: 'IN_PROGRESS',
        driverName: 'Nguyễn Văn Tài',
        driverPhone: '0912.888.999',
        licensePlate: '51C-882.19',
        updatedBy: dispatcherUser.id
      },
      {
        booking: booking1.id,
        stage: 'completed',
        stageOrder: 7,
        title: 'Hạ bãi thanh lý Cảng Cát Lái',
        description: 'Chờ hoàn tất thủ tục hải quan và cấp phiếu EIR',
        location: 'Cảng Cát Lái, Cổng B',
        status: 'PENDING',
        updatedBy: dispatcherUser.id
      }
    ];

    for (const st of stages) {
      await fetchPb('/api/collections/transport_progress/records', {
        method: 'POST',
        body: JSON.stringify(st)
      }, token);
    }
  }

  // Booking 2: PENDING with schedule change request
  const booking2 = await upsertRecord('booking_requests', 'bookingNumber', 'REQ-250827-015', {
    customer: customerUser.id,
    company: companyAbc.id,
    shippingLine: 'MAERSK',
    shippingLineName: 'MAERSK',
    vesselName: 'MAERSK MC-KINNEY',
    voyageNumber: '2408E',
    requestedClosingBeforeDate: '2026-08-27',
    requestedClosingAfterDate: '2026-08-28',
    siCutoffTime: '2026-08-28 14:00',
    cutoffTime: '2026-08-28 18:00',
    emptyPickupDate: '2026-08-27 09:00',
    departureDate: '2026-08-29 10:00',
    stuffingLocation: 'Kho U&I HCM',
    stuffingLocationName: 'Kho U&I HCM',
    packingLocationName: 'Kho U&I HCM',
    emptyPickupLocation: 'Depot Tân Vạn',
    emptyPickupLocationName: 'Depot Tân Vạn',
    customsClearanceLocation: 'Cảng Cái Mép',
    customsClearanceLocationName: 'Cảng Cái Mép',
    destinationPort: 'Cảng Cái Mép',
    destinationPortName: 'Cảng Cái Mép',
    cargoType: 'Hàng bách hóa / May mặc',
    cargoTypeName: 'Hàng bách hóa / May mặc',
    containerTypesSnapshot: "2x 40' thường",
    weight: '18,200 kg',
    totalContainers: 2,
    notes: 'Đề xuất đổi giờ cắt SI sang 10:00 cùng ngày do hãng tàu dời sớm.',
    status: 'PENDING'
  }, token);

  // Containers for Booking 2
  const existingCont2 = await findFirst('booking_containers', `booking = "${booking2.id}"`, token);
  if (!existingCont2) {
    await fetchPb('/api/collections/booking_containers/records', {
      method: 'POST',
      body: JSON.stringify({
        booking: booking2.id,
        containerType: "40' thường",
        quantity: 2,
        requestedYCGCDate: '2026-08-28',
        notes: '2x40GP may mặc xuất khẩu'
      })
    }, token);
  }

  // Schedule Change Request for Booking 2
  const changeReq = await upsertRecord('schedule_change_requests', 'requestNumber', 'CR-250827-001', {
    booking: booking2.id,
    customer: customerUser.id,
    company: companyAbc.id,
    reason: 'Hãng tàu MAERSK gửi công văn dời giờ cắt SI sớm hơn 4 giờ (từ 14:00 xuống 10:00).',
    status: 'PENDING'
  }, token);

  const existingChgItem = await findFirst('schedule_change_items', `changeRequest = "${changeReq.id}"`, token);
  if (!existingChgItem) {
    await fetchPb('/api/collections/schedule_change_items/records', {
      method: 'POST',
      body: JSON.stringify({
        changeRequest: changeReq.id,
        fieldName: 'siCutoffTime',
        fieldLabel: 'Giờ Cắt SI',
        oldValue: '2026-08-28 14:00',
        newValue: '2026-08-28 10:00',
        status: 'PENDING'
      })
    }, token);
  }

  // Booking 3: DRAFT
  const booking3 = await upsertRecord('booking_requests', 'bookingNumber', 'REQ-250829-002', {
    customer: customerUser.id,
    company: companyAbc.id,
    shippingLine: 'COSCO',
    shippingLineName: 'COSCO',
    vesselName: 'COSCO SHIPPING PLANET',
    voyageNumber: '031S',
    requestedClosingBeforeDate: '2026-08-29',
    requestedClosingAfterDate: '2026-08-30',
    stuffingLocation: 'Kho U&I Bình Dương',
    stuffingLocationName: 'Kho U&I Bình Dương',
    packingLocationName: 'Kho U&I Bình Dương',
    emptyPickupLocation: 'DEPOT BÌNH DƯƠNG 6',
    emptyPickupLocationName: 'DEPOT BÌNH DƯƠNG 6',
    customsClearanceLocation: 'LONG BEACH, CA',
    customsClearanceLocationName: 'LONG BEACH, CA',
    destinationPort: 'LONG BEACH, CA',
    destinationPortName: 'LONG BEACH, CA',
    cargoType: 'Điện tử & Linh kiện',
    cargoTypeName: 'Điện tử & Linh kiện',
    containerTypesSnapshot: "1x 20' thường",
    totalContainers: 1,
    notes: 'Đang chờ packing list hoàn thiện từ bộ phận kho.',
    status: 'DRAFT'
  }, token);

  const existingCont3 = await findFirst('booking_containers', `booking = "${booking3.id}"`, token);
  if (!existingCont3) {
    await fetchPb('/api/collections/booking_containers/records', {
      method: 'POST',
      body: JSON.stringify({
        booking: booking3.id,
        containerType: "20' thường",
        quantity: 1,
        requestedYCGCDate: '2026-08-30',
        notes: '1x20GP linh kiện điện tử'
      })
    }, token);
  }

  // 11. Notifications
  console.log('[Seed] Seeding Notifications...');
  const sampleNotifications = [
    {
      user: customerUser.id,
      company: companyAbc.id,
      title: 'Lịch vận chuyển REQ-250828-001 đang thực hiện',
      message: 'Đầu kéo 51C-882.19 đang trên đường vận chuyển đến Cảng Cát Lái.',
      type: 'transport',
      referenceId: booking1.id,
      isRead: false
    },
    {
      user: customerUser.id,
      company: companyAbc.id,
      title: 'Đề xuất đổi lịch đã gửi',
      message: 'Đề xuất CR-250827-001 cho đơn hàng REQ-250827-015 đang chờ Điều vận phê duyệt.',
      type: 'schedule_change',
      referenceId: changeReq.id,
      isRead: false
    },
    {
      user: dispatcherUser.id,
      company: companyAbc.id,
      title: 'Có booking mới cần duyệt',
      message: 'Khách hàng ABC Trading đã gửi yêu cầu REQ-250827-015.',
      type: 'booking',
      referenceId: booking2.id,
      isRead: false
    },
    {
      user: dispatcherUser.id,
      company: companyAbc.id,
      title: 'Đề xuất thay đổi thời gian mới',
      message: 'Khách hàng đề xuất đổi giờ cắt SI cho đơn hàng REQ-250827-015.',
      type: 'schedule_change',
      referenceId: changeReq.id,
      isRead: false
    }
  ];

  for (const notif of sampleNotifications) {
    const existingNotif = await findFirst('notifications', `user = "${notif.user}" && title = "${notif.title}"`, token);
    if (!existingNotif) {
      await fetchPb('/api/collections/notifications/records', {
        method: 'POST',
        body: JSON.stringify(notif)
      }, token);
    }
  }

  // 12. Sample Audit Log
  console.log('[Seed] Seeding Audit Log...');
  try {
    const colAudit = await fetchPb('/api/collections/audit_logs', {}, token);
    const detailField = colAudit.schema?.find(f => f.name === 'details');
    if (detailField && (!detailField.options?.maxSize || detailField.options.maxSize === 0)) {
      detailField.options = { ...detailField.options, maxSize: 2000000 };
      await fetchPb(`/api/collections/audit_logs`, {
        method: 'PATCH',
        body: JSON.stringify({ schema: colAudit.schema })
      }, token);
    }
  } catch (err) {
    console.log('[Seed] Note checking audit_logs schema:', err.message);
  }

  const existingAudit = await findFirst('audit_logs', `action = "INIT_SEED"`, token);
  if (!existingAudit) {
    await fetchPb('/api/collections/audit_logs/records', {
      method: 'POST',
      body: JSON.stringify({
        user: dispatcherUser.id,
        action: 'INIT_SEED',
        collection: 'system',
        recordId: 'init',
        details: { seededAt: new Date().toISOString(), env: 'development' },
        ipAddress: '127.0.0.1'
      })
    }, token);
  }

  console.log('\n[Seed] ✅ Seed data execution completed successfully!');
  console.log('--------------------------------------------------');
  console.log(`Company:       ABC Trading (UIL-KH-9921)`);
  console.log(`Customer:      customer@demo.local / Demo@123456`);
  console.log(`Dispatcher:    dispatcher@demo.local / Demo@123456`);
  console.log(`Admin (User):  admin@demo.local / Admin@123456`);
  console.log(`Bookings:      REQ-250828-001 (APPROVED), REQ-250827-015 (PENDING), REQ-250829-002 (DRAFT)`);
  console.log(`Tracking:      7 stages for REQ-250828-001`);
  console.log(`Change Req:    CR-250827-001 (PENDING)`);
  console.log(`Form Config:   10 fields initialized`);
  console.log('--------------------------------------------------');
}

seed().catch(err => {
  console.error('[Seed] ❌ Seed script failed:', err);
  process.exit(1);
});
