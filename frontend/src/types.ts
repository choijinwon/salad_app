export type UserRole = "ADMIN" | "DRIVER" | "CUSTOMER";

export type OrderSource = "NAVER" | "APP";

export type DeliveryStatus = "PENDING" | "IN_TRANSIT" | "DELIVERED" | "SKIPPED";

export interface DeliveryZone {
  id: string;
  name: string;
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  uniqueCode: string;
  phone: string;
  address: string;
  zoneId: string;
  totalCount: 1 | 10 | 20;
  remainingCount: number;
  orderSource: OrderSource;
}

export interface Driver {
  id: string;
  name: string;
  zoneId: string;
  zoneName: string;
  phone: string;
  vehicleNumber: string;
  isActive: boolean;
}

export interface DeliverySchedule {
  id: string;
  customerId: string;
  customerName: string;
  driverId: string;
  driverName: string;
  zoneId: string;
  zoneName: string;
  routeOrder: number;
  deliveryDate: string;
  address: string;
  latitude: number;
  longitude: number;
  status: DeliveryStatus;
  requestNotes: string;
  insulatedBagReturned: boolean;
  unitPrice: number;
}

export interface AttendanceRecord {
  id: string;
  driverId: string;
  driverName: string;
  status: "CLOCKED_IN" | "CLOCKED_OUT" | "ABSENT";
  clockInTime?: string;
  clockOutTime?: string;
}
