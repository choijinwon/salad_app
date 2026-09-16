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
  addressConfirmed: boolean;
  orderPrepared: boolean;
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

export type SpringAdminProduct = {
  id: string;
  name: string;
  price: number;
  status: "ACTIVE" | "SOLD_OUT" | "HIDDEN" | string;
  description: string | null;
  displayOrder: number;
  visible: boolean;
  createdAt: string;
};

export type SpringNaverOrder = {
  id: string;
  naverOrderNo: string;
  customerName: string;
  phone: string;
  address: string;
  status: "NEEDS_CONFIRMATION" | "LINKED" | "RESERVED" | "CANCELLED" | string;
  deliveryDate: string | null;
  createdAt: string;
};

export type SpringAdminAccount = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  uniqueCode: string | null;
  createdAt: string;
};

export type SpringAdminResources = {
  products: SpringAdminProduct[];
  naverOrders: SpringNaverOrder[];
  adminAccounts: SpringAdminAccount[];
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

export type SpringCustomerRegistration = {
  customerId: string;
  subscriptionId: string;
  uniqueCode: string;
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

export async function loadSpringAdminResources(): Promise<SpringAdminResources> {
  const [products, naverOrders, adminAccounts] = await Promise.all([
    springRequest<SpringAdminProduct[]>("/admin/products"),
    springRequest<SpringNaverOrder[]>("/admin/naver-orders"),
    springRequest<SpringAdminAccount[]>("/admin/accounts"),
  ]);

  return { products, naverOrders, adminAccounts };
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

export function createSpringManualCustomer(payload: {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  birthdate: string;
  address: string;
  zoneId: string;
  orderSource: "NAVER" | "APP";
  totalCount: number;
  unitPrice: number;
  startDate: string;
}) {
  return springRequest<SpringCustomerRegistration>("/customers/manual", {
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

export function loginSpringAdmin(payload: { email: string; password: string }) {
  return springRequest<SpringSession>("/auth/admin/login", {
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

export function updateSpringDeliveryBag(deliveryId: string, insulatedBagReturned: boolean) {
  return springRequest<SpringDelivery>(`/deliveries/${deliveryId}/bag-return`, {
    method: "PATCH",
    body: JSON.stringify({ insulatedBagReturned }),
  });
}

export function createSpringDelivery(payload: { subscriptionId: string; deliveryDate: string }) {
  return springRequest<SpringDelivery>("/deliveries", {
    method: "POST",
    body: JSON.stringify(payload),
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

export function createSpringZone(payload: { zoneName: string; description?: string | null }) {
  return springRequest<SpringZone>("/zones", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSpringZone(
  zoneId: string,
  payload: { zoneName: string; description?: string | null },
) {
  return springRequest<SpringZone>(`/zones/${zoneId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function createSpringAdminProduct(payload: {
  name: string;
  price: number;
  status?: "ACTIVE" | "SOLD_OUT" | "HIDDEN";
  description?: string | null;
  displayOrder?: number;
  visible?: boolean;
}) {
  return springRequest<SpringAdminProduct>("/admin/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSpringAdminProduct(
  productId: string,
  payload: {
    name: string;
    price: number;
    status?: "ACTIVE" | "SOLD_OUT" | "HIDDEN";
    description?: string | null;
    displayOrder?: number;
    visible?: boolean;
  },
) {
  return springRequest<SpringAdminProduct>(`/admin/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function createSpringNaverOrder(payload: {
  naverOrderNo: string;
  customerName: string;
  phone: string;
  address: string;
  status?: "NEEDS_CONFIRMATION" | "LINKED" | "RESERVED" | "CANCELLED";
  deliveryDate?: string | null;
}) {
  return springRequest<SpringNaverOrder>("/admin/naver-orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSpringNaverOrder(
  orderId: string,
  payload: {
    naverOrderNo: string;
    customerName: string;
    phone: string;
    address: string;
    status?: "NEEDS_CONFIRMATION" | "LINKED" | "RESERVED" | "CANCELLED";
    deliveryDate?: string | null;
  },
) {
  return springRequest<SpringNaverOrder>(`/admin/naver-orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function createSpringAdminAccount(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  return springRequest<SpringAdminAccount>("/admin/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSpringAdminOrder(
  deliveryId: string,
  payload: { addressConfirmed?: boolean; orderPrepared?: boolean; deliveryNotes?: string | null; deliveryDate?: string },
) {
  return springRequest<SpringDelivery>(`/admin/orders/${deliveryId}`, {
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
