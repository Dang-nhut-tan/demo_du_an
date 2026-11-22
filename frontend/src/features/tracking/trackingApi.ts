import { pb } from '../../services/pocketbase';
import { RequestStatus } from '../../types';

export interface TrackingStage {
  id: string;
  stageKey: string;
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  timestamp?: string;
  note?: string;
  expectedTime?: string;
  icon?: string;
}

export interface TrackingData {
  id: string;
  requestCode: string;
  bookingNumber: string;
  shippingLine: string;
  status: RequestStatus;
  statusLabel: string;
  pickupLocation: string;
  deliveryLocation: string;
  containerSummary: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  note: string;
  stages: TrackingStage[];
}

export const DEFAULT_TRACKING_MOCK: TrackingData = {
  id: 'req-001',
  requestCode: 'REQ-250828-001',
  bookingNumber: 'REQ-250828-001',
  shippingLine: 'ONETRANS',
  status: 'IN_PROGRESS',
  statusLabel: 'Đang vận chuyển',
  pickupLocation: 'Kho U&I Bình Dương',
  deliveryLocation: 'Cảng Cát Lái',
  containerSummary: "2 (40'HC)",
  vehicleNumber: '51D-123.45',
  driverName: 'Nguyễn Văn Minh',
  driverPhone: '0908 123 456',
  note: 'Xe đang di chuyển đến Cảng Cát Lái. Dự kiến đến đúng lịch.',
  stages: [
    {
      id: 'stg-1',
      stageKey: 'received',
      title: 'Đã tiếp nhận yêu cầu',
      status: 'COMPLETED',
      timestamp: '28/08/2025 08:15',
    },
    {
      id: 'stg-2',
      stageKey: 'confirmed',
      title: 'Đã xác nhận & lập kế hoạch',
      status: 'COMPLETED',
      timestamp: '28/08/2025 09:00',
    },
    {
      id: 'stg-3',
      stageKey: 'packing',
      title: 'Đang đóng hàng tại kho',
      status: 'COMPLETED',
      timestamp: '29/08/2025 08:10 – 09:30',
    },
    {
      id: 'stg-4',
      stageKey: 'transporting',
      title: 'Đang vận chuyển',
      status: 'IN_PROGRESS',
      timestamp: '29/08/2025 09:45',
      expectedTime: '14:00',
    },
    {
      id: 'stg-5',
      stageKey: 'completed',
      title: 'Hoàn tất tại cảng',
      status: 'PENDING',
      expectedTime: '29/08/2025 14:00',
    },
  ],
};

// 7 TMS Standard Stages matching db_migrations
export const STANDARD_STAGES = [
  { key: 'received', order: 1, label: 'Đã tiếp nhận yêu cầu' },
  { key: 'confirmed', order: 2, label: 'Đã xác nhận & lập kế hoạch' },
  { key: 'planning', order: 3, label: 'Đang lập kế hoạch điều xe' },
  { key: 'dispatched', order: 4, label: 'Đã bố trí phương tiện & tài xế' },
  { key: 'packing', order: 5, label: 'Đang đóng hàng tại kho' },
  { key: 'transporting', order: 6, label: 'Đang vận chuyển' },
  { key: 'completed', order: 7, label: 'Hoàn tất tại cảng' },
];

export const fetchTrackingProgress = async (codeOrNumber: string): Promise<TrackingData> => {
  try {
    let bookingRecord: any = null;
    const cleanQuery = codeOrNumber.trim();

    try {
      if (cleanQuery) {
        const res = await pb.collection('booking_requests').getList(1, 1, {
          filter: `bookingNumber ~ "${cleanQuery}" || requestCode ~ "${cleanQuery}" || id = "${cleanQuery}"`,
        });
        if (res.items.length > 0) bookingRecord = res.items[0];
      }
      if (!bookingRecord) {
        const first = await pb.collection('booking_requests').getList(1, 1, {
          sort: '-created',
        });
        if (first.items.length > 0) bookingRecord = first.items[0];
      }
    } catch (_e) {
      // offline fallback
    }

    if (!bookingRecord) {
      const local = JSON.parse(localStorage.getItem('u_and_i_offline_bookings') || '[]');
      if (local.length > 0) {
        bookingRecord = cleanQuery
          ? local.find((b: any) => b.bookingNumber === cleanQuery || b.requestCode === cleanQuery) || local[0]
          : local[0];
      }
    }

    if (bookingRecord) {
      let stageRecords: any[] = [];
      try {
        const stgs = await pb.collection('transport_progress').getList(1, 20, {
          filter: `booking = "${bookingRecord.id}"`,
          sort: 'stageOrder',
        });
        stageRecords = stgs.items;
      } catch (_e) {
        // continue
      }

      // Map stages
      const activeStages = STANDARD_STAGES.filter(s => ['received', 'confirmed', 'packing', 'transporting', 'completed'].includes(s.key));
      const stages: TrackingStage[] = activeStages.map((std, idx) => {
        const found = stageRecords.find((s) => s.stage === std.key);
        let status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' = 'PENDING';
        if (found) {
          status = found.status === 'COMPLETED' ? 'COMPLETED' : found.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'PENDING';
        } else if (idx <= 2 && bookingRecord.status === 'APPROVED') {
          status = 'COMPLETED';
        } else if (idx === 3 && (bookingRecord.status === 'APPROVED' || bookingRecord.status === 'IN_PROGRESS')) {
          status = 'IN_PROGRESS';
        }

        return {
          id: found?.id || `stg-${idx}`,
          stageKey: std.key,
          title: found?.title || std.label,
          status,
          timestamp: found ? (found.eventTime ? new Date(found.eventTime).toLocaleString('vi-VN') : undefined) : idx <= 2 ? '28/08/2025 08:30' : undefined,
          expectedTime: idx === 3 ? '14:00' : idx === 4 ? '29/08/2025 14:00' : undefined,
          note: found?.description || found?.note,
        };
      });

      return {
        id: bookingRecord.id,
        requestCode: bookingRecord.requestCode || bookingRecord.bookingNumber || `REQ-${bookingRecord.id.slice(0, 8)}`,
        bookingNumber: bookingRecord.bookingNumber || 'BK250828-001',
        shippingLine: bookingRecord.shippingLineName || bookingRecord.shippingLine || 'ONETRANS',
        status: bookingRecord.status || 'IN_PROGRESS',
        statusLabel: bookingRecord.status === 'APPROVED' ? 'Đang vận chuyển' : bookingRecord.status === 'PENDING' ? 'Chờ phê duyệt' : 'Đang xử lý',
        pickupLocation: bookingRecord.packingLocationName || bookingRecord.stuffingLocationName || bookingRecord.stuffingLocation || bookingRecord.packingLocation || 'Kho U&I Bình Dương',
        deliveryLocation: bookingRecord.destinationPortName || bookingRecord.destinationPort || 'Cảng Cát Lái',
        containerSummary: `${bookingRecord.totalContainers || 2} (40'HC)`,
        vehicleNumber: '51D-123.45',
        driverName: 'Nguyễn Văn Minh',
        driverPhone: '0908 123 456',
        note: bookingRecord.notes || 'Xe đang di chuyển đến Cảng Cát Lái. Dự kiến đến đúng lịch.',
        stages,
      };
    }
  } catch (err) {
    console.error(err);
  }

  return DEFAULT_TRACKING_MOCK;
};

export const subscribeToTrackingUpdates = (
  bookingId: string,
  onUpdate: (data: any) => void
) => {
  try {
    pb.collection('transport_progress').subscribe('*', (e: any) => {
      onUpdate(e.record);
    });

    pb.collection('booking_requests').subscribe('*', (e: any) => {
      onUpdate(e.record);
    });

    return () => {
      pb.collection('transport_progress').unsubscribe('*');
      pb.collection('booking_requests').unsubscribe('*');
    };
  } catch (_e) {
    return () => {};
  }
};
