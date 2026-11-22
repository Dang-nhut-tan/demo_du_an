import { pb } from '../../services/pocketbase';
import { BookingRequest } from '../../types';

export interface DispatcherBooking extends BookingRequest {
  rejectionReason?: string;
  approvedAt?: string;
  containers?: any[];
  notes?: string;
}

export interface DispatcherScheduleChange {
  id: string;
  bookingId: string;
  requestCode: string;
  bookingNumber: string;
  requestedBy: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  changeType: string;
  created: string;
  items?: Array<{
    targetField: string;
    oldValue: string;
    newValue: string;
  }>;
}

export const fetchDispatcherBookings = async (): Promise<DispatcherBooking[]> => {
  try {
    const res = await pb.collection('booking_requests').getList(1, 100, {
      sort: '-created',
      expand: 'company,customer',
    });

    if (res.items.length > 0) {
      return res.items.map((r: any) => ({
        id: r.id,
        bookingNumber: r.bookingNumber || r.id,
        code: r.bookingNumber?.startsWith('REQ') ? r.bookingNumber : `REQ-${r.id.substring(0, 8).toUpperCase()}`,
        companyId: r.company || 'abc-trading-id',
        companyName: r.expand?.company?.name || 'Công ty ABC Trading',
        shippingLine: r.shippingLineName || r.shippingLine || 'ONETRANS',
        vesselVoyage: `${r.vesselName || 'ONE CONTINUITY'} / ${r.voyageNumber || '042W'}`,
        requestType: 'Vận chuyển container xuất khẩu',
        pickupLocation: r.packingLocationName || r.stuffingLocationName || r.stuffingLocation || r.packingLocation || 'Kho U&I Bình Dương',
        deliveryLocation: r.destinationPortName || r.destinationPort || 'Cảng Cát Lái',
        requestedPickupDate: r.emptyPickupDate || '29/08/2025 08:00',
        requestedDeliveryDate: r.requestedClosingBeforeDate || r.cutoffTime || '29/08/2025 14:00',
        containerSummary: `${r.totalContainers || 2} (40'HC)`,
        status: r.status || 'PENDING',
        statusLabel: r.status === 'APPROVED' ? 'Đã duyệt' : r.status === 'REJECTED' ? 'Đã từ chối' : 'Chờ phê duyệt',
        notes: r.notes || '',
        rejectionReason: r.rejectReason,
        approvedAt: r.approvedAt,
        created: r.created,
        updated: r.updated,
      }));
    }
  } catch (_e) {
    // fallback
  }

  const local = JSON.parse(localStorage.getItem('u_and_i_offline_bookings') || '[]');
  if (local.length > 0) {
    return local.map((r: any) => ({
      ...r,
      code: r.requestCode || r.bookingNumber,
      statusLabel: r.status === 'APPROVED' ? 'Đã duyệt' : r.status === 'REJECTED' ? 'Đã từ chối' : 'Chờ phê duyệt',
    }));
  }

  return [
    {
      id: 'req-015',
      bookingNumber: 'REQ-250827-015',
      code: 'REQ-250827-015',
      companyId: 'abc-trading-id',
      companyName: 'Công ty ABC Trading',
      shippingLine: 'EVERGREEN',
      vesselVoyage: 'EVER GIVEN / 112E',
      requestType: 'Vận chuyển container xuất khẩu',
      pickupLocation: 'Kho U&I HCM',
      deliveryLocation: 'Cảng Cái Mép',
      requestedPickupDate: '29/08/2025 14:00',
      requestedDeliveryDate: '30/08/2025 08:00',
      containerSummary: "1 (20' thường)",
      status: 'PENDING',
      statusLabel: 'Chờ phê duyệt',
      notes: 'Đã đề xuất lùi giờ đóng hàng theo thông báo hãng tàu.',
      created: '2025-08-27T10:30:00.000Z',
      updated: '2025-08-28T15:20:00.000Z',
    },
    {
      id: 'req-001',
      bookingNumber: 'REQ-250828-001',
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
      status: 'APPROVED',
      statusLabel: 'Đã duyệt',
      notes: 'Kiểm tra kỹ seal trước khi kéo cont.',
      created: '2025-08-28T08:15:00.000Z',
      updated: '2025-08-29T09:45:00.000Z',
    },
  ];
};

export const approveBookingRequest = async (id: string): Promise<boolean> => {
  const dispatcherId = pb.authStore.model?.id || 'dispatcher-demo-id';
  const now = new Date().toISOString();

  try {
    await pb.collection('booking_requests').update(id, {
      status: 'APPROVED',
      approvedAt: now,
      approvedBy: dispatcherId,
    });

    try {
      await pb.collection('transport_progress').create({
        booking: id,
        stage: 'confirmed',
        stageOrder: 2,
        title: 'Xác nhận Booking',
        description: 'Điều phối viên U&I đã duyệt và lập kế hoạch xe',
        location: 'Trung tâm Điều vận U&I Logistics',
        status: 'COMPLETED',
      });
    } catch (_e) {
      // continue
    }
  } catch (_e) {
    const local = JSON.parse(localStorage.getItem('u_and_i_offline_bookings') || '[]');
    const idx = local.findIndex((b: any) => b.id === id);
    if (idx >= 0) {
      local[idx].status = 'APPROVED';
      local[idx].approvedAt = now;
      localStorage.setItem('u_and_i_offline_bookings', JSON.stringify(local));
    }
  }
  return true;
};

export const rejectBookingRequest = async (id: string, reason: string): Promise<boolean> => {
  try {
    await pb.collection('booking_requests').update(id, {
      status: 'REJECTED',
      rejectReason: reason,
    });
  } catch (_e) {
    const local = JSON.parse(localStorage.getItem('u_and_i_offline_bookings') || '[]');
    const idx = local.findIndex((b: any) => b.id === id);
    if (idx >= 0) {
      local[idx].status = 'REJECTED';
      local[idx].rejectReason = reason;
      localStorage.setItem('u_and_i_offline_bookings', JSON.stringify(local));
    }
  }
  return true;
};

export const fetchScheduleChangeProposals = async (): Promise<DispatcherScheduleChange[]> => {
  try {
    const res = await pb.collection('schedule_change_requests').getList(1, 50, {
      sort: '-created',
      expand: 'booking',
    });

    if (res.items.length > 0) {
      return res.items.map((r: any) => ({
        id: r.id,
        bookingId: r.booking,
        requestCode: r.expand?.booking?.bookingNumber || 'REQ-250828-001',
        bookingNumber: r.expand?.booking?.bookingNumber || 'REQ-250828-001',
        requestedBy: r.customer,
        status: r.status,
        reason: r.reason,
        changeType: 'Thay đổi thời gian lấy hàng',
        created: r.created,
      }));
    }
  } catch (_e) {
    // fallback
  }

  const local = JSON.parse(localStorage.getItem('u_and_i_offline_schedule_changes') || '[]');
  if (local.length > 0) return local;

  return [
    {
      id: 'sc-001',
      bookingId: 'req-001',
      requestCode: 'REQ-250828-001',
      bookingNumber: 'REQ-250828-001',
      requestedBy: 'demo-customer-id',
      status: 'PENDING',
      reason: 'Khách hàng thay đổi kế hoạch đóng hàng, lùi thời gian lấy hàng 1 ngày.',
      changeType: 'Thời gian lấy hàng',
      created: new Date().toISOString(),
      items: [
        {
          targetField: 'pickup_date',
          oldValue: '29/08/2025 08:00',
          newValue: '30/08/2025 10:00',
        },
      ],
    },
  ];
};

export const approveScheduleChangeProposal = async (
  changeId: string,
  bookingId: string,
  updatedPickupDate?: string
): Promise<boolean> => {
  const dispatcherId = pb.authStore.model?.id || 'dispatcher-demo-id';
  const now = new Date().toISOString();

  try {
    await pb.collection('schedule_change_requests').update(changeId, {
      status: 'APPROVED',
      reviewedBy: dispatcherId,
      reviewedAt: now,
    });

    if (bookingId && updatedPickupDate) {
      await pb.collection('booking_requests').update(bookingId, {
        emptyPickupDate: updatedPickupDate,
      });
    }

    try {
      await pb.collection('audit_logs').create({
        actor: dispatcherId,
        action: 'APPROVE_SCHEDULE_CHANGE',
        collectionName: 'schedule_change_requests',
        recordId: changeId,
        newData: JSON.stringify({ status: 'APPROVED', updatedPickupDate }),
      });
    } catch (_e) {
      // continue
    }
  } catch (_e) {
    const local = JSON.parse(localStorage.getItem('u_and_i_offline_schedule_changes') || '[]');
    const idx = local.findIndex((sc: any) => sc.id === changeId);
    if (idx >= 0) {
      local[idx].status = 'APPROVED';
      localStorage.setItem('u_and_i_offline_schedule_changes', JSON.stringify(local));
    }
  }
  return true;
};

export const rejectScheduleChangeProposal = async (
  changeId: string,
  reason: string
): Promise<boolean> => {
  try {
    await pb.collection('schedule_change_requests').update(changeId, {
      status: 'REJECTED',
      reviewNote: reason,
      reviewedAt: new Date().toISOString(),
    });
  } catch (_e) {
    const local = JSON.parse(localStorage.getItem('u_and_i_offline_schedule_changes') || '[]');
    const idx = local.findIndex((sc: any) => sc.id === changeId);
    if (idx >= 0) {
      local[idx].status = 'REJECTED';
      local[idx].reviewNote = reason;
      localStorage.setItem('u_and_i_offline_schedule_changes', JSON.stringify(local));
    }
  }
  return true;
};

export const updateTransportStage = async (
  bookingId: string,
  stage: string,
  note: string
): Promise<boolean> => {
  const stageOrders: Record<string, { order: number; title: string }> = {
    received: { order: 1, title: 'Tiếp nhận yêu cầu' },
    confirmed: { order: 2, title: 'Xác nhận Booking' },
    planning: { order: 3, title: 'Đang lập kế hoạch điều xe' },
    dispatched: { order: 4, title: 'Đã bố trí phương tiện & tài xế' },
    packing: { order: 5, title: 'Đang đóng hàng tại kho' },
    transporting: { order: 6, title: 'Đang vận chuyển đến cảng' },
    completed: { order: 7, title: 'Hoàn tất tại cảng & thanh lý' },
  };

  const meta = stageOrders[stage] || { order: 6, title: 'Đang vận chuyển' };

  try {
    await pb.collection('transport_progress').create({
      booking: bookingId,
      stage,
      stageOrder: meta.order,
      title: meta.title,
      description: note || `Đang thực hiện giai đoạn: ${meta.title}`,
      location: 'Cảng Cát Lái',
      status: stage === 'completed' ? 'COMPLETED' : 'IN_PROGRESS',
    });

    await pb.collection('booking_requests').update(bookingId, {
      status: stage === 'completed' ? 'COMPLETED' : 'IN_PROGRESS',
    });
  } catch (_e) {
    // continue
  }
  return true;
};
