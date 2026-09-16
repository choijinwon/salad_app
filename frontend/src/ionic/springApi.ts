const viteEnv = import.meta.env as Record<string, string | undefined>;

export const SPRING_API_BASE_URL = (viteEnv.VITE_API_BASE_URL ?? "http://localhost:8080/api").replace(/\/$/, "");

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string | null;
};

export type SpringCustomer = {
  id: string;
  role: "CUSTOMER" | "DRIVER" | "ADMIN";
  name: string;
  phone: string;
  birthdate: string | null;
  address: string | null;
  zoneId: string | null;
  uniqueCode: string | null;
};

export type SpringDriver = {
  id: string;
  name: string;
  phone: string;
  zoneId: string | null;
  zoneName: string | null;
  vehicleNumber: string | null;
  isActive: boolean;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED" | string;
};

export type SpringZone = {
  id: string;
  zoneName: string;
  description: string | null;
};

export type SpringDelivery = {
  id: string;
  subscriptionId: string;
  customerId: string;
  customerName: string;
  driverId: string | null;
  driverName: string | null;
  zoneId: string | null;
  zoneName: string | null;
  deliveryDate: string;
  status: "PENDING" | "IN_TRANSIT" | "DELIVERED" | "SKIPPED" | "CANCELLED";
  routeOrder: number | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  requestNotes: string | null;
  insulatedBagReturned: boolean;
  unitPrice: number;
  completedAt: string | null;
  canceledAt: string | null;
};

export type SpringSnapshot = {
  customers: SpringCustomer[];
  deliveries: SpringDelivery[];
  drivers: SpringDriver[];
  zones: SpringZone[];
};

export type SpringAddressItem = {
  roadAddress: string;
  jibunAddress: string;
  zipNo: string;
  siNm: string;
  sggNm: string;
  emdNm: string;
  detailHint: string;
};

export type SpringAddressSearchResponse = {
  source: "JUSO" | "DEMO" | string;
  totalCount: number;
  currentPage: number;
  countPerPage: number;
  addresses: SpringAddressItem[];
};

export type SpringSession = {
  id: string;
  role: "CUSTOMER" | "DRIVER" | "ADMIN";
  name: string;
  phone: string | null;
  address: string | null;
  email: string | null;
  uniqueCode: string | null;
};

async function springRequest<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${SPRING_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.success) {
    throw new Error(body.message ?? "Spring API 요청에 실패했습니다.");
  }
  return body.data;
}

export async function loadSpringSnapshot(): Promise<SpringSnapshot> {
  const [customers, deliveries, drivers, zones] = await Promise.all([
    springRequest<SpringCustomer[]>("/customers"),
    springRequest<SpringDelivery[]>("/deliveries/today"),
    springRequest<SpringDriver[]>("/drivers"),
    springRequest<SpringZone[]>("/zones"),
  ]);

  return { customers, deliveries, drivers, zones };
}

export function signupSpringCustomer(payload: {
  name: string;
  phone: string;
  address: string;
  email: string;
  password: string;
}) {
  return springRequest<SpringSession>("/auth/customer/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginSpringCustomer(payload: { loginId: string; password: string }) {
  return springRequest<SpringSession>("/auth/customer/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginSpringDriver(payload: { phone: string; password: string }) {
  return springRequest<SpringSession>("/auth/driver/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function searchSpringAddresses(keyword: string) {
  return springRequest<SpringAddressSearchResponse>(
    `/addresses/search?keyword=${encodeURIComponent(keyword)}&size=10`,
  );
}

export function createSpringDriver(payload: {
  name: string;
  password: string;
  phone: string;
  zoneId: string | null;
  vehicleNumber: string;
}) {
  return springRequest<SpringDriver>("/drivers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function completeSpringDelivery(deliveryId: string, insulatedBagReturned: boolean) {
  return springRequest<SpringDelivery>(`/deliveries/${deliveryId}/complete`, {
    method: "PATCH",
    body: JSON.stringify({ insulatedBagReturned }),
  });
}

export function assignSpringDelivery(
  deliveryId: string,
  payload: { driverId: string | null; routeOrder?: number | null; zoneId?: string | null },
) {
  return springRequest<SpringDelivery>(`/admin/assignments/${deliveryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateSpringDriver(
  driverId: string,
  payload: { approvalStatus?: "PENDING" | "APPROVED" | "REJECTED"; isActive?: boolean; zoneId?: string | null },
) {
  return springRequest<SpringDriver>(`/drivers/${driverId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
