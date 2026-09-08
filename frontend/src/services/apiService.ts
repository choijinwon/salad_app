import {
  attendance,
  customers,
  deliveries,
  drivers,
  reservedDays,
  zones,
} from "../data/mockData";
import { USE_MOCK } from "../lib/config";
import { apiRequest } from "../lib/api";
import type { DeliverySchedule, Session, UserRole } from "../types";

export type { UserRole } from "../types";
export type { Session } from "../types";
export type OrderSource = "NAVER" | "APP";
export type DeliveryStatus = "PENDING" | "IN_TRANSIT" | "DELIVERED" | "SKIPPED" | "CANCELLED";
export type AttendanceStatus = "CLOCKED_IN" | "CLOCKED_OUT" | "ABSENT";

export type LoginResponse = Session;

export interface CustomerResponse {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  birthdate: string;
  address: string;
  zoneId: string;
  uniqueCode: string;
}

export interface SubscriptionResponse {
  id: string;
  customerId: string;
  orderSource: OrderSource;
  totalCount: number;
  remainingCount: number;
  unitPrice: number;
  status: string;
  startDate: string;
}

export interface CustomerRegistrationResponse {
  customerId: string;
  subscriptionId: string;
  uniqueCode: string;
}

export interface DeliveryResponse {
  id: string;
  subscriptionId: string;
  customerId: string;
  customerName: string;
  driverId: string | null;
  driverName: string;
  zoneId: string | null;
  zoneName: string;
  deliveryDate: string;
  status: DeliveryStatus;
  routeOrder: number | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  requestNotes: string;
  insulatedBagReturned: boolean;
  unitPrice: number;
  completedAt: string | null;
  canceledAt: string | null;
}

export interface DriverResponse {
  id: string;
  name: string;
  phone: string;
  zoneId: string | null;
  zoneName: string;
  vehicleNumber: string;
  isActive: boolean;
}

export interface AttendanceResponse {
  id: string;
  driverId: string;
  workDate: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  status: AttendanceStatus;
}

export interface DeliveryZoneResponse {
  id: string;
  zoneName: string;
  description: string;
}

export interface DeliveryAreaResponse {
  id: string;
  guName: string;
  dongName: string;
  admCode: string;
  deliveryFee: number;
  active: boolean;
  zoneId: string | null;
}

export interface NaverOrderResponse {
  id: string;
  productOrderId: string;
  orderId: string | null;
  profileId: string | null;
  subscriptionId: string | null;
  productName: string;
  productOrderStatus: string;
  claimStatus: string | null;
  hopeDeliveryYmd: string | null;
  ordererName: string;
  ordererTel: string;
  baseAddress: string;
  detailedAddress: string;
  totalPaymentAmount: number;
  syncedAt: string;
}

export interface SettlementRowResponse {
  deliveryId: string;
  customerId: string;
  zoneId: string;
  status: DeliveryStatus;
  insulatedBagReturned: boolean;
  deductedCount: number;
  amount: number;
}

export interface DailySettlementResponse {
  settlementDate: string;
  totalDeliveryCount: number;
  completedDeliveryCount: number;
  inTransitDeliveryCount: number;
  bagReturnedCount: number;
  unreturnedBagCount: number;
  totalAmount: number;
  rows: SettlementRowResponse[];
}

export interface DashboardResponse {
  date: string;
  totalCount: number;
  completedCount: number;
  inTransitCount: number;
  pendingCount: number;
  bagReturnedCount: number;
  unreturnedBags: {
    customerId: string;
    customerName: string;
    address: string;
    phone: string;
  }[];
}

function genId() {
  return `mock-${Math.random().toString(36).slice(2, 10)}`;
}

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().split("T")[0];
}

function toDeliveryResponse(d: DeliverySchedule): DeliveryResponse {
  return {
    id: d.id,
    subscriptionId: `sub-${d.customerId}`,
    customerId: d.customerId,
    customerName: d.customerName,
    driverId: d.driverId,
    driverName: d.driverName,
    zoneId: d.zoneId,
    zoneName: d.zoneName,
    deliveryDate: d.deliveryDate,
    status: d.status,
    routeOrder: d.routeOrder,
    address: d.address,
    latitude: d.latitude,
    longitude: d.longitude,
    requestNotes: d.requestNotes,
    insulatedBagReturned: d.insulatedBagReturned,
    unitPrice: d.unitPrice,
    completedAt: d.status === "DELIVERED" ? `${d.deliveryDate}T09:00:00+09:00` : null,
    canceledAt: d.status === "CANCELLED" ? `${d.deliveryDate}T10:00:00+09:00` : null,
  };
}

function mockSubscription(customerId: string): SubscriptionResponse {
  const mock = customers.find((item) => item.id === customerId);
  const today = todayIso();
  return {
    id: `sub-${customerId}`,
    customerId,
    orderSource: mock?.orderSource ?? "APP",
    totalCount: mock?.totalCount ?? 10,
    remainingCount: mock?.remainingCount ?? 4,
    unitPrice: 8900,
    status: "ACTIVE",
    startDate: today,
  };
}

function mockCustomerDeliveries(customerId: string): DeliveryResponse[] {
  const existing = deliveries
    .filter((delivery) => delivery.customerId === customerId)
    .map(toDeliveryResponse);
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const generated = reservedDays
    .filter(
      (day) =>
        !existing.some(
          (item) => item.deliveryDate === `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        ),
    )
    .map((day) => ({
      id: `mock-${customerId}-${day}`,
      subscriptionId: `sub-${customerId}`,
      customerId,
      customerName: customers.find((item) => item.id === customerId)?.name ?? "고객",
      driverId: null,
      driverName: "",
      zoneId: null,
      zoneName: "",
      deliveryDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      status: "PENDING" as DeliveryStatus,
      routeOrder: null,
      address: customers.find((item) => item.id === customerId)?.address ?? "",
      latitude: null,
      longitude: null,
      requestNotes: "",
      insulatedBagReturned: false,
      unitPrice: 8900,
      completedAt: null,
      canceledAt: null,
    }));
  return [...existing, ...generated].sort((a, b) =>
    a.deliveryDate.localeCompare(b.deliveryDate),
  );
}

export function createMockSession(role: UserRole): Session {
  if (role === "CUSTOMER") {
    const mock = customers[0];
    return {
      id: mock.id,
      role: "CUSTOMER",
      name: mock.name,
      phone: mock.phone,
      uniqueCode: mock.uniqueCode,
    };
  }
  if (role === "DRIVER") {
    const mock = drivers[0];
    return {
      id: mock.id,
      role: "DRIVER",
      name: mock.name,
      phone: mock.phone,
      uniqueCode: null,
    };
  }
  return { id: "admin-1", role: "ADMIN", name: "샐러드 관리자", phone: null, uniqueCode: null };
}

export const ApiService = {
  // 1. POST /api/auth/login (고유식별 코드 로그인)
  async login(uniqueCode: string) {
    if (USE_MOCK) {
      const matching = customers.filter(
        (item) => item.uniqueCode.includes(uniqueCode.trim()),
      );
      if (matching.length === 0) {
        throw new Error("일치하는 고유식별 ID가 없습니다.");
      }
      const mock = matching[0];
      const session: Session = {
        id: mock.id,
        role: "CUSTOMER",
        name: mock.name,
        phone: mock.phone,
        uniqueCode: mock.uniqueCode,
      };
      return session;
    }
    return apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ uniqueCode }),
    });
  },

  // 2. GET /api/customers (고객 목록 조회)
  async getCustomers() {
    if (USE_MOCK) {
      return customers.map<CustomerResponse>((item) => ({
        id: item.id,
        role: "CUSTOMER",
        name: item.name,
        phone: item.phone,
        birthdate: "1990-01-01",
        address: item.address,
        zoneId: item.zoneId,
        uniqueCode: item.uniqueCode,
      }));
    }
    return apiRequest<CustomerResponse[]>("/customers");
  },

  // 3. GET /api/customers/{customerId}/subscriptions (고객 구독 조회)
  async getMySubscriptions(customerId: string) {
    if (USE_MOCK) {
      return [mockSubscription(customerId)];
    }
    return apiRequest<SubscriptionResponse[]>(
      `/customers/${encodeURIComponent(customerId)}/subscriptions`,
    );
  },

  // 4. GET /api/deliveries/customer/{customerId} (고객 배송 전체 조회)
  async getCustomerDeliveries(customerId: string) {
    if (USE_MOCK) {
      return mockCustomerDeliveries(customerId);
    }
    return apiRequest<DeliveryResponse[]>(
      `/deliveries/customer/${encodeURIComponent(customerId)}`,
    );
  },

  // 5. POST /api/customers/manual (네이버 주문 고객 수동 등록 및 구독 생성)
  async registerManualCustomer(payload: {
    name: string;
    phone: string;
    birthdate: string; // YYYY-MM-DD
    address: string;
    zoneId: string;
    orderSource: OrderSource;
    totalCount: number;
    unitPrice: number;
    startDate: string; // YYYY-MM-DD
  }) {
    if (USE_MOCK) {
      const digits = payload.birthdate.replace(/-/g, "");
      return {
        customerId: genId(),
        subscriptionId: genId(),
        uniqueCode: `${payload.name}${digits.slice(2)}`,
      } satisfies CustomerRegistrationResponse;
    }
    return apiRequest<CustomerRegistrationResponse>("/customers/manual", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // 6. GET /api/deliveries/today (?driverId={uuid}) (오늘 배송 목록 조회 / 기사별 필터)
  async getTodayDeliveries(driverId?: string) {
    if (USE_MOCK) {
      const filtered = driverId
        ? deliveries.filter((delivery) => delivery.driverId === driverId)
        : deliveries;
      return filtered.map(toDeliveryResponse);
    }
    const query = driverId ? `?driverId=${encodeURIComponent(driverId)}` : "";
    return apiRequest<DeliveryResponse[]>(`/deliveries/today${query}`);
  },

  // 7. POST /api/deliveries (배송일 예약)
  async createDelivery(subscriptionId: string, deliveryDate: string) {
    if (USE_MOCK) {
      const customerId = subscriptionId.replace("sub-", "");
      return {
        id: genId(),
        subscriptionId,
        customerId,
        customerName: customers.find((item) => item.id === customerId)?.name ?? "고객",
        driverId: null,
        driverName: "",
        zoneId: null,
        zoneName: "",
        deliveryDate,
        status: "PENDING",
        routeOrder: null,
        address: customers.find((item) => item.id === customerId)?.address ?? "",
        latitude: null,
        longitude: null,
        requestNotes: "",
        insulatedBagReturned: false,
        unitPrice: 8900,
        completedAt: null,
        canceledAt: null,
      } satisfies DeliveryResponse;
    }
    return apiRequest<DeliveryResponse>("/deliveries", {
      method: "POST",
      body: JSON.stringify({ subscriptionId, deliveryDate }),
    });
  },

  // 8. PATCH /api/deliveries/{deliveryId} (배송일/요청사항 수정)
  async updateDelivery(
    deliveryId: string,
    payload: { deliveryDate?: string; deliveryNotes?: string },
  ) {
    if (USE_MOCK) {
      return {
        id: deliveryId,
        deliveryDate: payload.deliveryDate,
        requestNotes: payload.deliveryNotes,
      } as DeliveryResponse;
    }
    return apiRequest<DeliveryResponse>(`/deliveries/${deliveryId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // 9. DELETE /api/deliveries/{deliveryId} (배송 예약 취소)
  async deleteDelivery(deliveryId: string) {
    if (USE_MOCK) {
      return;
    }
    await apiRequest<null>(`/deliveries/${deliveryId}`, { method: "DELETE" });
  },

  // 10. PATCH /api/deliveries/{deliveryId}/complete (배송 완료 및 보냉백 회수 여부 저장)
  async completeDelivery(deliveryId: string, bagReturned: boolean) {
    if (USE_MOCK) {
      const mock = deliveries.find((delivery) => delivery.id === deliveryId);
      if (mock) {
        return { ...toDeliveryResponse(mock), insulatedBagReturned: bagReturned, status: "DELIVERED" };
      }
      return {
        id: deliveryId,
        status: "DELIVERED",
        insulatedBagReturned: bagReturned,
      } as DeliveryResponse;
    }
    return apiRequest<DeliveryResponse>(`/deliveries/${deliveryId}/complete`, {
      method: "PATCH",
      body: JSON.stringify({ insulatedBagReturned: bagReturned }),
    });
  },

  // 11. GET /api/drivers (기사 목록)
  async getDrivers() {
    if (USE_MOCK) {
      return drivers.map<DriverResponse>((item) => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        zoneId: item.zoneId,
        zoneName: item.zoneName,
        vehicleNumber: item.vehicleNumber,
        isActive: item.isActive,
      }));
    }
    return apiRequest<DriverResponse[]>("/drivers");
  },

  // 12. POST /api/drivers (기사 등록)
  async createDriver(payload: {
    name: string;
    phone: string;
    zoneId: string | null;
    vehicleNumber: string;
  }) {
    if (USE_MOCK) {
      return {
        id: genId(),
        name: payload.name,
        phone: payload.phone,
        zoneId: payload.zoneId,
        zoneName: "",
        vehicleNumber: payload.vehicleNumber,
        isActive: true,
      } satisfies DriverResponse;
    }
    return apiRequest<DriverResponse>("/drivers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // 13. PATCH /api/drivers/{driverId} (기사 정보 수정)
  async updateDriver(
    driverId: string,
    payload: { zoneId?: string | null; vehicleNumber?: string; isActive?: boolean },
  ) {
    if (USE_MOCK) {
      return { id: driverId, ...payload } as DriverResponse;
    }
    return apiRequest<DriverResponse>(`/drivers/${driverId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // 14. GET /api/drivers/attendances/today (오늘 기사 출퇴근 현황)
  async getTodayDriverAttendances() {
    if (USE_MOCK) {
      return attendance.map<AttendanceResponse>((item) => ({
        id: item.id,
        driverId: item.driverId,
        workDate: todayIso(),
        clockInTime: item.clockInTime ? `${todayIso()}T${item.clockInTime}:00+09:00` : null,
        clockOutTime: item.clockOutTime ? `${todayIso()}T${item.clockOutTime}:00+09:00` : null,
        status: item.status,
      }));
    }
    return apiRequest<AttendanceResponse[]>("/drivers/attendances/today");
  },

  // 15. POST /api/drivers/{driverId}/attendance/clock-in (기사 출근 처리)
  async clockInDriver(driverId: string, latitude: number, longitude: number) {
    if (USE_MOCK) {
      const now = new Date();
      return {
        id: genId(),
        driverId,
        workDate: todayIso(),
        clockInTime: now.toISOString(),
        clockOutTime: null,
        status: "CLOCKED_IN",
      } satisfies AttendanceResponse;
    }
    return apiRequest<AttendanceResponse>(`/drivers/${driverId}/attendance/clock-in`, {
      method: "POST",
      body: JSON.stringify({ latitude, longitude }),
    });
  },

  // 16. POST /api/drivers/{driverId}/attendance/clock-out (기사 퇴근 처리)
  async clockOutDriver(driverId: string, latitude: number, longitude: number) {
    if (USE_MOCK) {
      const now = new Date();
      return {
        id: genId(),
        driverId,
        workDate: todayIso(),
        clockInTime: null,
        clockOutTime: now.toISOString(),
        status: "CLOCKED_OUT",
      } satisfies AttendanceResponse;
    }
    return apiRequest<AttendanceResponse>(`/drivers/${driverId}/attendance/clock-out`, {
      method: "POST",
      body: JSON.stringify({ latitude, longitude }),
    });
  },

  // 17. GET /api/zones (배송 구역 목록)
  async getZones() {
    if (USE_MOCK) {
      return zones.map<DeliveryZoneResponse>((item) => ({
        id: item.id,
        zoneName: item.name,
        description: item.description,
      }));
    }
    return apiRequest<DeliveryZoneResponse[]>("/zones");
  },

  // 18. POST /api/zones (배송 구역 등록)
  async createZone(payload: { zoneName: string; description: string }) {
    if (USE_MOCK) {
      return { id: genId(), ...payload } satisfies DeliveryZoneResponse;
    }
    return apiRequest<DeliveryZoneResponse>("/zones", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // 19. PATCH /api/zones/{zoneId} (배송 구역 수정)
  async updateZone(zoneId: string, payload: { zoneName: string; description: string }) {
    if (USE_MOCK) {
      return { id: zoneId, ...payload } satisfies DeliveryZoneResponse;
    }
    return apiRequest<DeliveryZoneResponse>(`/zones/${zoneId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // 20. GET /api/admin/dashboard/today (관리자 오늘 현황)
  async getDashboard() {
    if (USE_MOCK) {
      const all = deliveries.map(toDeliveryResponse);
      return {
        date: todayIso(),
        totalCount: all.length,
        completedCount: all.filter((item) => item.status === "DELIVERED").length,
        inTransitCount: all.filter((item) => item.status === "IN_TRANSIT").length,
        pendingCount: all.filter((item) => item.status === "PENDING").length,
        bagReturnedCount: all.filter((item) => item.insulatedBagReturned).length,
        unreturnedBags: all
          .filter((item) => !item.insulatedBagReturned && item.status !== "PENDING")
          .map((item) => ({
            customerId: item.customerId,
            customerName: item.customerName,
            address: item.address,
            phone: itemsPhone[item.customerId] ?? "",
          })),
      } satisfies DashboardResponse;
    }
    return apiRequest<DashboardResponse>("/admin/dashboard/today");
  },

  // 21. GET /api/settlements/daily (일일 배송/정산 집계)
  async getDailySettlement(dateString?: string) {
    if (USE_MOCK) {
      const all = deliveries.map(toDeliveryResponse);
      const completed = all.filter((item) => item.status === "DELIVERED");
      return {
        settlementDate: dateString || todayIso(),
        totalDeliveryCount: all.length,
        completedDeliveryCount: completed.length,
        inTransitDeliveryCount: all.filter((item) => item.status === "IN_TRANSIT").length,
        bagReturnedCount: all.filter((item) => item.insulatedBagReturned).length,
        unreturnedBagCount: all.filter((item) => !item.insulatedBagReturned && item.status !== "PENDING").length,
        totalAmount: completed.reduce((sum, item) => sum + item.unitPrice, 0),
        rows: all.map<SettlementRowResponse>((item) => ({
          deliveryId: item.id,
          customerId: item.customerId,
          zoneId: item.customerId,
          status: item.status,
          insulatedBagReturned: item.insulatedBagReturned,
          deductedCount: item.status === "DELIVERED" ? 1 : 0,
          amount: item.status === "DELIVERED" ? item.unitPrice : 0,
        })),
      } satisfies DailySettlementResponse;
    }
    const targetDate = dateString || todayIso();
    return apiRequest<DailySettlementResponse>(`/settlements/daily?date=${targetDate}`);
  },

  // 22. GET /api/areas (배달 지역 목록)
  async getAreas() {
    if (USE_MOCK) {
      return [];
    }
    return apiRequest<DeliveryAreaResponse[]>("/areas");
  },

  // 23. PATCH /api/admin/areas/{areaId} (배달 지역 수정)
  async updateArea(
    areaId: string,
    payload: {
      guName?: string;
      dongName?: string;
      deliveryFee?: number;
      isActive?: boolean;
      zoneId?: string | null;
    },
  ) {
    if (USE_MOCK) {
      return {
        id: areaId,
        guName: "",
        dongName: "",
        admCode: "",
        deliveryFee: payload.deliveryFee ?? 0,
        active: payload.isActive ?? true,
        zoneId: payload.zoneId ?? null,
      } satisfies DeliveryAreaResponse;
    }
    return apiRequest<DeliveryAreaResponse>(`/admin/areas/${areaId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // 24. DELETE /api/admin/areas/{areaId} (배달 지역 비활성화)
  async deactivateArea(areaId: string) {
    if (USE_MOCK) {
      return;
    }
    await apiRequest<null>(`/admin/areas/${areaId}`, { method: "DELETE" });
  },

  // 25. GET /api/admin/assignments?date=YYYY-MM-DD (배정 목록 조회)
  async getAssignments(date: string) {
    if (USE_MOCK) {
      return (await ApiService.getTodayDeliveries()).map((d) => ({ ...d, deliveryDate: date }));
    }
    return apiRequest<DeliveryResponse[]>(`/admin/assignments?date=${date}`);
  },

  // 26. PATCH /api/admin/assignments/{deliveryId} (기사 수동 배정)
  async assignDriver(
    deliveryId: string,
    payload: { driverId?: string | null; zoneId?: string | null; routeOrder?: number | null },
  ) {
    if (USE_MOCK) {
      return { id: deliveryId, ...payload } as DeliveryResponse;
    }
    return apiRequest<DeliveryResponse>(`/admin/assignments/${deliveryId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // 27. POST /api/admin/assignments/auto?date=YYYY-MM-DD (자동 배정)
  async autoAssign(date: string) {
    if (USE_MOCK) {
      return (await ApiService.getTodayDeliveries()).map((d) => ({ ...d, deliveryDate: date }));
    }
    return apiRequest<DeliveryResponse[]>(`/admin/assignments/auto?date=${date}`, {
      method: "POST",
    });
  },

  // 28. POST /api/admin/assignments/copy (이전 일자 배정 복사)
  async copyAssignments(sourceDate: string, targetDate: string) {
    if (USE_MOCK) {
      return (await ApiService.getTodayDeliveries()).map((d) => ({ ...d, deliveryDate: targetDate }));
    }
    return apiRequest<DeliveryResponse[]>("/admin/assignments/copy", {
      method: "POST",
      body: JSON.stringify({ sourceDate, targetDate }),
    });
  },

  // 29. DELETE /api/admin/assignments?date=YYYY-MM-DD (배정 초기화)
  async resetAssignments(date: string) {
    if (USE_MOCK) {
      return (await ApiService.getTodayDeliveries()).map((d) => ({ ...d, deliveryDate: date }));
    }
    return apiRequest<DeliveryResponse[]>(`/admin/assignments?date=${date}`, {
      method: "DELETE",
    });
  },

  // 30. GET /api/admin/naver/orders (네이버 주문 목록)
  async getNaverOrders() {
    if (USE_MOCK) {
      return [
        {
          id: "nv-1",
          productOrderId: "20260901123456",
          orderId: "2026090112345",
          profileId: null,
          subscriptionId: null,
          productName: "프레시 샐러드 정기구독 10회",
          productOrderStatus: "PAYED",
          claimStatus: null,
          hopeDeliveryYmd: "20260914",
          ordererName: "김샐러",
          ordererTel: "010-1234-5678",
          baseAddress: "서울특별시 강남구 역삼동",
          detailedAddress: "테헤란로 123-45 101동 101호",
          totalPaymentAmount: 89000,
          syncedAt: new Date().toISOString(),
        },
        {
          id: "nv-2",
          productOrderId: "20260902111223",
          orderId: "2026090211122",
          profileId: null,
          subscriptionId: null,
          productName: "프레시 샐러드 정기구독 10회",
          productOrderStatus: "DELIVERING",
          claimStatus: null,
          hopeDeliveryYmd: "20260915",
          ordererName: "박그린",
          ordererTel: "010-9876-5432",
          baseAddress: "서울특별시 서초구 반포동",
          detailedAddress: "신반포로 45 202동 502호",
          totalPaymentAmount: 89000,
          syncedAt: new Date().toISOString(),
        },
        {
          id: "nv-3",
          productOrderId: "20260903135442",
          orderId: "2026090313544",
          profileId: null,
          subscriptionId: null,
          productName: "프레시 샐러드 정기구독 10회",
          productOrderStatus: "CANCELED",
          claimStatus: "CANCEL_DONE",
          hopeDeliveryYmd: "20260916",
          ordererName: "이신선",
          ordererTel: "010-5555-7777",
          baseAddress: "서울특별시 송파구 잠실동",
          detailedAddress: "올림픽로 22 303동 1103호",
          totalPaymentAmount: 89000,
          syncedAt: new Date().toISOString(),
        },
      ] satisfies NaverOrderResponse[];
    }
    return apiRequest<NaverOrderResponse[]>("/admin/naver/orders");
  },

  // 31. POST /api/admin/naver/sync (네이버 주문 동기화)
  async syncNaverOrders() {
    if (USE_MOCK) {
      return ApiService.getNaverOrders();
    }
    return apiRequest<NaverOrderResponse[]>("/admin/naver/sync", { method: "POST" });
  },

  // 32. POST /api/admin/naver/orders/{id}/link (주문 → 고객/구독 연결)
  async linkNaverOrder(orderId: string) {
    if (USE_MOCK) {
      return { id: orderId } as NaverOrderResponse;
    }
    return apiRequest<NaverOrderResponse>(`/admin/naver/orders/${orderId}/link`, {
      method: "POST",
    });
  },

  // 33. GET /api/admin/orders?date=&includeCancelled= (날짜별 주문 목록, 관리자)
  async getAdminOrders(date: string, includeCancelled = false) {
    if (USE_MOCK) {
      const all = (await ApiService.getTodayDeliveries()).map((d) => ({
        ...d,
        deliveryDate: date,
      }));
      return all.filter((item) =>
        includeCancelled ? true : item.status !== "CANCELLED",
      );
    }
    return apiRequest<DeliveryResponse[]>(
      `/admin/orders?date=${date}&includeCancelled=${includeCancelled}`,
    );
  },

  // 34. PATCH /api/admin/orders/{deliveryId} (주문 수정, 잠금 무시 - 관리자)
  async adminUpdateDelivery(
    deliveryId: string,
    payload: { deliveryDate?: string; deliveryNotes?: string },
  ) {
    if (USE_MOCK) {
      return {
        id: deliveryId,
        deliveryDate: payload.deliveryDate,
        requestNotes: payload.deliveryNotes,
      } as DeliveryResponse;
    }
    return apiRequest<DeliveryResponse>(`/admin/orders/${deliveryId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // 35. POST /api/admin/orders/{deliveryId}/cancel (주문 취소, 잠금 무시 - 관리자)
  async adminCancelDelivery(deliveryId: string) {
    if (USE_MOCK) {
      return {
        id: deliveryId,
        status: "CANCELLED",
        canceledAt: new Date().toISOString(),
      } as DeliveryResponse;
    }
    return apiRequest<DeliveryResponse>(`/admin/orders/${deliveryId}/cancel`, {
      method: "POST",
    });
  },

  // 36. POST /api/admin/naver/orders/{id}/hope-delivery (배송 희망일 변경)
  async changeNaverHopeDelivery(orderId: string, hopeDeliveryYmd: string, changeReason: string) {
    if (USE_MOCK) {
      return { id: orderId, hopeDeliveryYmd } as NaverOrderResponse;
    }
    return apiRequest<NaverOrderResponse>(`/admin/naver/orders/${orderId}/hope-delivery`, {
      method: "POST",
      body: JSON.stringify({ hopeDeliveryYmd, changeReason }),
    });
  },

  // 37. POST /api/admin/naver/orders/{id}/cancel (판매자 취소 요청)
  async cancelNaverOrder(orderId: string, cancelReason: string, cancelDetailedReason: string) {
    if (USE_MOCK) {
      return {
        id: orderId,
        productOrderStatus: "PAYED",
        claimStatus: "CANCEL_REQUEST",
      } as NaverOrderResponse;
    }
    return apiRequest<NaverOrderResponse>(`/admin/naver/orders/${orderId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ cancelReason, cancelDetailedReason }),
    });
  },

  // 38. POST /api/admin/naver/orders/{id}/cancel/approve (구매자 취소 요청 승인)
  async approveNaverCancel(orderId: string) {
    if (USE_MOCK) {
      return {
        id: orderId,
        productOrderStatus: "CANCELED",
        claimStatus: "CANCEL_DONE",
      } as NaverOrderResponse;
    }
    return apiRequest<NaverOrderResponse>(`/admin/naver/orders/${orderId}/cancel/approve`, {
      method: "POST",
    });
  },
};

const itemsPhone: Record<string, string> = Object.fromEntries(
  customers.map((item) => [item.id, item.phone]),
);