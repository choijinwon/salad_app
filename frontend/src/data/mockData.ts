import type {
  AttendanceRecord,
  Customer,
  DeliverySchedule,
  DeliveryZone,
  Driver,
} from "../types";

export const zones: DeliveryZone[] = [
  { id: "zone-a", name: "A구역", description: "매장 반경 3km 아파트 구역" },
  { id: "zone-b", name: "B구역", description: "오피스텔과 상가 복합 구역" },
  { id: "zone-c", name: "C구역", description: "정기배송 확장 구역" },
];

export const customers: Customer[] = [
  {
    id: "customer-1",
    name: "김샐러",
    uniqueCode: "김샐9002147821",
    phone: "010-2478-7821",
    address: "서울시 마포구 월드컵북로 11",
    zoneId: "zone-a",
    totalCount: 10,
    remainingCount: 4,
    orderSource: "APP",
  },
  {
    id: "customer-2",
    name: "박그린",
    uniqueCode: "박그8811034409",
    phone: "010-5121-4409",
    address: "서울시 마포구 성산동 245",
    zoneId: "zone-b",
    totalCount: 20,
    remainingCount: 12,
    orderSource: "NAVER",
  },
];

export const drivers: Driver[] = [
  {
    id: "driver-1",
    name: "박배송",
    zoneId: "zone-a",
    zoneName: "A구역",
    phone: "010-3000-1201",
    vehicleNumber: "서울12가 3421",
    isActive: true,
  },
  {
    id: "driver-2",
    name: "정루트",
    zoneId: "zone-b",
    zoneName: "B구역",
    phone: "010-3000-1202",
    vehicleNumber: "서울33나 8201",
    isActive: true,
  },
];

export const deliveries: DeliverySchedule[] = [
  {
    id: "delivery-1",
    customerId: "customer-1",
    customerName: "김샐러",
    driverId: "driver-1",
    driverName: "박배송",
    zoneId: "zone-a",
    zoneName: "A구역",
    routeOrder: 1,
    deliveryDate: "2026-08-31",
    address: "서울시 마포구 월드컵북로 11",
    latitude: 37.5566,
    longitude: 126.9144,
    status: "DELIVERED",
    requestNotes: "공동현관 1234*, 문 앞 보냉백",
    insulatedBagReturned: true,
    unitPrice: 8900,
  },
  {
    id: "delivery-2",
    customerId: "customer-2",
    customerName: "박그린",
    driverId: "driver-2",
    driverName: "정루트",
    zoneId: "zone-b",
    zoneName: "B구역",
    routeOrder: 2,
    deliveryDate: "2026-08-31",
    address: "서울시 마포구 성산동 245",
    latitude: 37.563,
    longitude: 126.9087,
    status: "IN_TRANSIT",
    requestNotes: "경비실에 맡겨주세요",
    insulatedBagReturned: false,
    unitPrice: 8900,
  },
  {
    id: "delivery-3",
    customerId: "customer-3",
    customerName: "최루꼴라",
    driverId: "driver-1",
    driverName: "박배송",
    zoneId: "zone-a",
    zoneName: "A구역",
    routeOrder: 3,
    deliveryDate: "2026-08-31",
    address: "서울시 서대문구 연희로 41",
    latitude: 37.5699,
    longitude: 126.9301,
    status: "PENDING",
    requestNotes: "초인종 누르지 말아주세요",
    insulatedBagReturned: false,
    unitPrice: 9900,
  },
];

export const attendance: AttendanceRecord[] = [
  {
    id: "att-1",
    driverId: "driver-1",
    driverName: "박배송",
    status: "CLOCKED_IN",
    clockInTime: "08:42",
  },
  {
    id: "att-2",
    driverId: "driver-2",
    driverName: "정루트",
    status: "CLOCKED_IN",
    clockInTime: "08:51",
  },
];

export const reservedDays = [2, 9, 16, 23];
export const lockedDays = [5];
