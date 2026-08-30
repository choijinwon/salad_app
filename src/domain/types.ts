export type UserRole = "ADMIN" | "DRIVER" | "CUSTOMER";

export type OrderSource = "NAVER" | "APP";

export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

export type DeliveryStatus = "PENDING" | "IN_TRANSIT" | "DELIVERED" | "SKIPPED";

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  birthdate?: string;
  address?: string;
  zoneId?: string;
  uniqueCode?: string;
  createdAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  description: string;
  boundaryGeoJson?: unknown;
}

export interface DriverProfile {
  id: string;
  profileId: string;
  zoneId: string;
  vehicleNumber?: string;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  customerId: string;
  orderSource: OrderSource;
  totalCount: 1 | 10 | 20;
  remainingCount: number;
  unitPrice: number;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
}

export interface DeliverySchedule {
  id: string;
  subscriptionId: string;
  customerId: string;
  customerName: string;
  driverId: string;
  driverName: string;
  zoneId: string;
  zoneName: string;
  deliveryDate: string;
  status: DeliveryStatus;
  routeOrder: number;
  address: string;
  latitude: number;
  longitude: number;
  requestNotes: string;
  insulatedBagReturned: boolean;
  unitPrice: number;
  completedAt?: string;
}

export interface DriverAttendance {
  id: string;
  driverId: string;
  driverName: string;
  workDate: string;
  clockInTime?: string;
  clockOutTime?: string;
  status: "CLOCKED_IN" | "CLOCKED_OUT" | "ABSENT";
  latitude?: number;
  longitude?: number;
}

export interface ManualCustomerInput {
  name: string;
  phone: string;
  birthdate: string;
  address: string;
  zoneId: string;
  orderSource: OrderSource;
  totalCount: 1 | 10 | 20;
  startDate: string;
  requestNotes?: string;
}
