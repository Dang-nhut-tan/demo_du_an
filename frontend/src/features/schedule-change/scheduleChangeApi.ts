import { pb } from '../../services/pocketbase';
import { BookingRequest } from '../../types';

export interface ScheduleChangeItem {
  targetField: string;
  fieldLabel?: string;
  targetContainer?: string;
  oldValue: string;
  newValue: string;
}

export interface ScheduleChangeSubmission {
  bookingId: string;
  requestCode: string;
  bookingNumber: string;
  changeType: string;
  items: ScheduleChangeItem[];
  reason: string;
  attachment?: File;
}

export const fetchActiveBookingsForChange = async (): Promise<BookingRequest[]> => {
  try {
    const records = await pb.collection('booking_requests').getList(1, 50, {
      sort: '-created',
      filter: 'status != "REJECTED"',
    });

    if (records.items.length > 0) {
      return records.items.map((r: any) => ({
        id: r.id,
        bookingNumber: r.bookingNumber || r.id,
        code: r.bookingNumber?.startsWith('REQ') ? r.bookingNumber : `REQ-${r.id.substring(0, 8).toUpperCase()}`,
        companyId: r.company || 'abc-trading-id',
        companyName: 'Công ty ABC Trading',
        shippingLine: r.shippingLine || 'ONETRANS',
        requestType: 'Vận chuyển container xuất khẩu',
        pickupLocation: r.stuffingLocation || r.packingLocation || 'Kho U&I Bình Dương',
        deliveryLocation: r.destinationPort || 'Cảng Cát Lái',
        requestedPickupDate: r.emptyPickupDate || '29/08/2025 08:00',
        requestedDeliveryDate: r.requestedClosingBeforeDate || r.cutoffTime || '29/08/2025 14:00',
        containerSummary: `${r.totalContainers || 2} (40'HC)`,
        status: r.status || 'IN_PROGRESS',
        created: r.created,
        updated: r.updated,
      }));
    }
  } catch (_e) {
    // fallback
  }

  return [
    {
      id: 'req-001',
      bookingNumber: 'REQ-250828-001',
      code: 'REQ-250828-001',
      companyId: 'abc-trading-id',
      companyName: 'Công ty ABC Trading',
      shippingLine: 'ONETRANS',
      requestType: 'Vận chuyển container xuất khẩu',
      pickupLocation: 'Kho U&I Bình Dương',
      deliveryLocation: 'Cảng Cát Lái',
      requestedPickupDate: '29/08/2025 08:00',
      requestedDeliveryDate: '29/08/2025 14:00',
      containerSummary: "2 (40'HC)",
      status: 'IN_PROGRESS',
      created: '2025-08-28T08:15:00.000Z',
      updated: '2025-08-29T09:45:00.000Z',
    },
    {
      id: 'req-015',
      bookingNumber: 'REQ-250827-015',
      code: 'REQ-250827-015',
      companyId: 'abc-trading-id',
      companyName: 'Công ty ABC Trading',
      shippingLine: 'EVERGREEN',
      requestType: 'Vận chuyển container xuất khẩu',
      pickupLocation: 'Kho U&I HCM',
      deliveryLocation: 'Cảng Cái Mép',
      requestedPickupDate: '29/08/2025 14:00',
      requestedDeliveryDate: '30/08/2025 08:00',
      containerSummary: "1 (20' thường)",
      status: 'PENDING',
      created: '2025-08-27T10:30:00.000Z',
      updated: '2025-08-28T15:20:00.000Z',
    },
  ];
};

export const submitScheduleChangeRequest = async (
  sub: ScheduleChangeSubmission
): Promise<{ id: string }> => {
  const requestNumber = `CR-${Date.now().toString().slice(-6)}`;
  const user = pb.authStore.model;
  let companyId = user?.company;

  if (!companyId) {
    try {
      const companies = await pb.collection('companies').getList(1, 1);
      if (companies.items.length > 0) companyId = companies.items[0].id;
    } catch (_e) {
      // continue
    }
  }

  const payload: any = {
    requestNumber,
    booking: sub.bookingId,
    customer: user?.id,
    company: companyId,
    reason: sub.reason,
    status: 'PENDING',
  };

  let changeId = '';
  try {
    const record = await pb.collection('schedule_change_requests').create(payload);
    changeId = record.id;

    for (const item of sub.items) {
      try {
        await pb.collection('schedule_change_items').create({
          changeRequest: changeId,
          targetField: item.targetField,
          fieldLabel: item.fieldLabel || item.targetField,
          oldValue: item.oldValue,
          newValue: item.newValue,
          status: 'PENDING',
        });
      } catch (_e) {
        // continue
      }
    }
  } catch (err) {
    console.warn('PocketBase schedule change save fallback:', err);
    const local = JSON.parse(localStorage.getItem('u_and_i_offline_schedule_changes') || '[]');
    changeId = `sc-${Date.now()}`;
    local.unshift({
      id: changeId,
      ...sub,
      status: 'PENDING',
      created: new Date().toISOString(),
    });
    localStorage.setItem('u_and_i_offline_schedule_changes', JSON.stringify(local));
  }

  return { id: changeId || `sc-${Date.now()}` };
};
