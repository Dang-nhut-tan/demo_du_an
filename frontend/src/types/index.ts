export type UserRole = 'customer' | 'dispatcher' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company?: string;
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
  taxCode: string;
  code: string;
  email: string;
  phone: string;
  address?: string;
  verified: boolean;
}

export interface ShippingDefaults {
  id?: string;
  companyId: string;
  defaultContainerType: string;
  defaultPickupLocation: string;
  defaultDeliveryLocation: string;
  defaultRequestType: string;
  defaultNotes?: string;
  autoFillEnabled: boolean;
}

export type RequestStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'REJECTED' | 'COMPLETED';

export interface BookingContainer {
  id?: string;
  containerType: "20' thường" | "40' thường" | "40' cao" | "40'HC";
  quantity: number;
  requestedYCGCDate?: string;
}

export interface BookingRequest {
  id: string;
  bookingNumber: string;
  code: string;
  companyId: string;
  companyName: string;
  shippingLine: string;
  vesselVoyage?: string;
  requestType: string;
  pickupLocation: string;
  deliveryLocation: string;
  requestedPickupDate: string;
  requestedPickupTime?: string;
  requestedDeliveryDate?: string;
  requestedDeliveryTime?: string;
  containerSummary?: string;
  containers?: BookingContainer[];
  status: RequestStatus;
  statusLabel?: string;
  notes?: string;
  created: string;
  updated: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'booking' | 'schedule_change' | 'tracking' | 'system';
  isRead: boolean;
  referenceId?: string;
  timestamp: string;
}

export type MasterDataCategoryKey =
  | 'shipping_lines'
  | 'packing_locations'
  | 'empty_locations'
  | 'clearance_locations'
  | 'destination_ports'
  | 'transshipment_ports'
  | 'cargo_types'
  | 'container_types';

export interface MasterDataItem {
  id: string;
  collectionName: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  type?: string;
  created?: string;
  updated?: string;
}

export interface FormFieldConfig {
  id: string;
  fieldKey: string;
  label: string;
  placeholder: string;
  helpText?: string;
  displayOrder: number;
  isVisible: boolean;
  defaultValue?: string;
  created?: string;
  updated?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  user: string;
  details: string;
  created: string;
}
