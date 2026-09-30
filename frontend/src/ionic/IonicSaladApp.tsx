import {
  IonApp,
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonContent,
  IonFooter,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonReorder,
  IonReorderGroup,
  IonTextarea,
} from "@ionic/react";
import type { ItemReorderEventDetail } from "@ionic/core";
import {
  bagCheckOutline,
  calendarOutline,
  carOutline,
  chevronBackOutline,
  chevronForwardOutline,
  checkmarkCircleOutline,
  clipboardOutline,
  copyOutline,
  cubeOutline,
  homeOutline,
  logInOutline,
  logOutOutline,
  mapOutline,
  notificationsOutline,
  personCircleOutline,
  refreshOutline,
  searchOutline,
  settingsOutline,
} from "ionicons/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  assignSpringDelivery,
  completeSpringDelivery,
  createSpringAdminAccount,
  createSpringAdminProduct,
  createSpringDelivery,
  createSpringDriver,
  createSpringManualCustomer,
  createSpringNaverOrder,
  createSpringZone,
  loginSpringAdmin,
  loadSpringAdminResources,
  loadSpringSnapshot,
  loginSpringCustomer,
  loginSpringDriver,
  signupSpringCustomer,
  updateSpringAdminProduct,
  updateSpringAdminOrder,
  updateSpringDeliveryBag,
  updateSpringDriver,
  updateSpringNaverOrder,
  type SpringAdminAccount,
  type SpringAdminProduct,
  type SpringCustomer,
  type SpringDelivery,
  type SpringDriver,
  type SpringNaverOrder,
  type SpringSnapshot,
  type SpringZone,
} from "./springApi";

type Area = "customer" | "driver" | "admin";
type CustomerTab = "home" | "reserve" | "orders" | "profile";
type DriverTab = "route" | "map" | "done" | "profile";
type AdminTab = "overview" | "customers" | "orders" | "dispatch" | "drivers" | "bags" | "products" | "naver" | "admins";
type SideMenuItem<T extends string> = {
  icon: string;
  label: string;
  value: T;
};

type Delivery = {
  id: string;
  customerId?: string;
  driverId?: string | null;
  orderNo: string;
  customer: string;
  phone: string;
  email: string;
  address: string;
  detailAddress?: string;
  memo: string;
  driverMemo?: string;
  zone: string;
  zoneId?: string | null;
  assignedDriver: string | null;
  addressConfirmed: boolean;
  customerActive: boolean;
  orderPrepared: boolean;
  lat: number;
  lng: number;
  bagCount: number;
  bagCollected: boolean;
  done: boolean;
  deliveryDate?: string;
  saladCount?: number;
};

type DriverProfile = {
  id?: string;
  name: string;
  phone: string;
  zone: string;
  zoneId?: string | null;
  status: "승인 완료" | "승인 대기" | "보류";
};

type ZoneAssignment = Record<string, string>;
type ZoneRangeConfig = Record<string, { color?: string; points: number[][] }>;
type RegionZonePreset = {
  name: string;
  description: string;
  zones: Array<{ name: string; color: string; districts?: string[]; points: number[][] }>;
};

const initialDeliveryZones = ["강남A", "서초B", "송파C", "잠실D", "마포E", "성수F"];
const demoTodayDate = todayInputValue();
const demoTomorrowDate = addDaysToInputDate(demoTodayDate, 1);

const initialDeliveries: Delivery[] = [
  {
    id: "delivery-001",
    orderNo: "ORD-0914-001",
    customer: "김샐러",
    phone: "010-1234-5678",
    email: "salad.kim@example.com",
    address: "서울특별시 강남구 역삼동",
    detailAddress: "베데스다 병원 702호",
    memo: "출입 및 고객 요청사항 없음",
    driverMemo: "",
    zone: "강남A",
    assignedDriver: "박배송",
    addressConfirmed: true,
    customerActive: true,
    orderPrepared: true,
    lat: 37.50064,
    lng: 127.03644,
    bagCount: 1,
    bagCollected: false,
    done: false,
    deliveryDate: demoTodayDate,
    saladCount: 2,
  },
  {
    id: "delivery-gn-002",
    orderNo: "ORD-0914-002",
    customer: "이케일",
    phone: "010-2222-7788",
    email: "kale.lee@example.com",
    address: "서울특별시 강남구 테헤란로 152",
    detailAddress: "강남파이낸스센터 18층",
    memo: "로비 보안데스크 호출 후 전달",
    driverMemo: "",
    zone: "강남A",
    assignedDriver: "박배송",
    addressConfirmed: true,
    customerActive: true,
    orderPrepared: true,
    lat: 37.50015,
    lng: 127.03672,
    bagCount: 1,
    bagCollected: false,
    done: false,
    deliveryDate: demoTodayDate,
    saladCount: 1,
  },
  {
    id: "delivery-gn-003",
    orderNo: "ORD-0914-003",
    customer: "박루꼴라",
    phone: "010-3333-8899",
    email: "rucola.park@example.com",
    address: "서울특별시 강남구 테헤란로 231",
    detailAddress: "센터필드 West 1204호",
    memo: "점심 전 11시 30분까지 배송",
    driverMemo: "",
    zone: "강남A",
    assignedDriver: "박배송",
    addressConfirmed: true,
    customerActive: true,
    orderPrepared: true,
    lat: 37.50386,
    lng: 127.04158,
    bagCount: 0,
    bagCollected: true,
    done: false,
    deliveryDate: demoTodayDate,
    saladCount: 3,
  },
  {
    id: "delivery-gn-004",
    orderNo: "ORD-0914-004",
    customer: "최아보",
    phone: "010-4444-9900",
    email: "avo.choi@example.com",
    address: "서울특별시 강남구 논현로 508",
    detailAddress: "GS타워 7층",
    memo: "안내데스크 맡김 가능",
    driverMemo: "",
    zone: "강남A",
    assignedDriver: "박배송",
    addressConfirmed: true,
    customerActive: true,
    orderPrepared: true,
    lat: 37.50128,
    lng: 127.03716,
    bagCount: 2,
    bagCollected: false,
    done: false,
    deliveryDate: demoTodayDate,
    saladCount: 2,
  },
  {
    id: "delivery-gn-005",
    orderNo: "ORD-0914-005",
    customer: "정채소",
    phone: "010-5555-1122",
    email: "veggie.jung@example.com",
    address: "서울특별시 강남구 봉은사로 524",
    detailAddress: "코엑스 인터컨티넨탈 B1",
    memo: "지하 배송장 진입",
    driverMemo: "",
    zone: "강남A",
    assignedDriver: "박배송",
    addressConfirmed: true,
    customerActive: true,
    orderPrepared: true,
    lat: 37.51312,
    lng: 127.05903,
    bagCount: 1,
    bagCollected: false,
    done: false,
    deliveryDate: demoTodayDate,
    saladCount: 4,
  },
  {
    id: "delivery-gn-006",
    orderNo: "ORD-0914-006",
    customer: "한그린",
    phone: "010-6666-3344",
    email: "green.han@example.com",
    address: "서울특별시 강남구 선릉로 428",
    detailAddress: "위워크 선릉 9층",
    memo: "엘리베이터 홀 앞 배송",
    driverMemo: "",
    zone: "강남A",
    assignedDriver: "박배송",
    addressConfirmed: true,
    customerActive: true,
    orderPrepared: true,
    lat: 37.50452,
    lng: 127.04902,
    bagCount: 1,
    bagCollected: false,
    done: false,
    deliveryDate: demoTodayDate,
    saladCount: 2,
  },
  {
    id: "delivery-gn-007",
    orderNo: "ORD-0914-007",
    customer: "윤샐러리",
    phone: "010-7777-5566",
    email: "celery.yoon@example.com",
    address: "서울특별시 강남구 압구정로 165",
    detailAddress: "현대백화점 별관 3층",
    memo: "내일 배송 예정 고객",
    driverMemo: "",
    zone: "강남A",
    assignedDriver: "박배송",
    addressConfirmed: true,
    customerActive: true,
    orderPrepared: true,
    lat: 37.52713,
    lng: 127.02761,
    bagCount: 1,
    bagCollected: false,
    done: false,
    deliveryDate: demoTomorrowDate,
    saladCount: 1,
  },
  {
    id: "delivery-002",
    orderNo: "ORD-0914-002",
    customer: "이로메인",
    phone: "010-2222-7788",
    email: "romaine.lee@example.com",
    address: "경기도 수원시 영통구 영흥숲길 50",
    detailAddress: "영흥숲푸르지오파크비엔 113동 601호",
    memo: "공동현관 호출 후 문 앞 배송",
    driverMemo: "",
    zone: "서초B",
    assignedDriver: null,
    addressConfirmed: false,
    customerActive: true,
    orderPrepared: false,
    lat: 37.50871,
    lng: 127.01164,
    bagCount: 0,
    bagCollected: true,
    done: false,
    deliveryDate: demoTodayDate,
    saladCount: 1,
  },
  {
    id: "delivery-003",
    orderNo: "ORD-0914-003",
    customer: "최루꼴라",
    phone: "010-3333-8899",
    email: "rucola.choi@example.com",
    address: "경기도 수원시 영통구 매영로 345",
    detailAddress: "래미안 영통마크원 105동 1402호",
    memo: "초인종 누르지 말아주세요",
    driverMemo: "",
    zone: "송파C",
    assignedDriver: null,
    addressConfirmed: true,
    customerActive: true,
    orderPrepared: false,
    lat: 37.51331,
    lng: 127.10021,
    bagCount: 1,
    bagCollected: false,
    done: false,
    deliveryDate: demoTodayDate,
    saladCount: 3,
  },
];

const initialDriverProfiles: DriverProfile[] = [
  { name: "박배송", phone: "010-1201-3300", zone: "강남A", status: "승인 완료" },
  { name: "한배송", phone: "010-2202-4400", zone: "서초B", status: "승인 완료" },
  { name: "김라이더", phone: "010-3303-5500", zone: "송파C", status: "승인 완료" },
  { name: "오배송", phone: "010-4404-6600", zone: "잠실D", status: "승인 완료" },
  { name: "이미승인대기", phone: "010-5505-7700", zone: "마포E", status: "승인 대기" },
  { name: "정검토", phone: "010-6606-8800", zone: "성수F", status: "보류" },
];

const initialZoneAssignments: ZoneAssignment = {
  "강남A": "박배송",
  "서초B": "한배송",
  "송파C": "김라이더",
  "잠실D": "오배송",
  "마포E": "박배송",
  "성수F": "한배송",
};
const DISPATCH_STORAGE_KEY = "salad_dispatch_deliveries";
const DRIVER_PROFILE_STORAGE_KEY = "salad_driver_profiles";
const DELIVERY_ZONE_STORAGE_KEY = "salad_delivery_zones";
const ZONE_ASSIGNMENT_STORAGE_KEY = "salad_zone_assignments";
const ZONE_RANGE_STORAGE_KEY = "salad_zone_ranges";
const CUSTOMER_SESSION_STORAGE_KEY = "salad_customer_session";
const DRIVER_SESSION_STORAGE_KEY = "salad_driver_session";
const ADMIN_SESSION_STORAGE_KEY = "salad_admin_session";
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const customerMenuItems: SideMenuItem<CustomerTab>[] = [
  { icon: homeOutline, label: "홈", value: "home" },
  { icon: calendarOutline, label: "예약", value: "reserve" },
  { icon: clipboardOutline, label: "주문", value: "orders" },
  { icon: personCircleOutline, label: "내 정보", value: "profile" },
];
const driverMenuItems: SideMenuItem<DriverTab>[] = [
  { icon: carOutline, label: "루트", value: "route" },
  { icon: mapOutline, label: "지도", value: "map" },
  { icon: checkmarkCircleOutline, label: "완료", value: "done" },
  { icon: personCircleOutline, label: "내 정보", value: "profile" },
];
const adminMenuItems: SideMenuItem<AdminTab>[] = [
  { icon: homeOutline, label: "오늘", value: "overview" },
  { icon: personCircleOutline, label: "고객", value: "customers" },
  { icon: clipboardOutline, label: "주문", value: "orders" },
  { icon: carOutline, label: "배정", value: "dispatch" },
  { icon: checkmarkCircleOutline, label: "기사", value: "drivers" },
  { icon: bagCheckOutline, label: "보냉백", value: "bags" },
  { icon: clipboardOutline, label: "상품", value: "products" },
  { icon: clipboardOutline, label: "네이버", value: "naver" },
  { icon: settingsOutline, label: "관리자", value: "admins" },
];

export function IonicSaladApp() {
  const [area, setArea] = useState<Area>(() => readInitialArea());
  const [showSplash, setShowSplash] = useState(() => readInitialArea() !== "admin");

  useEffect(() => {
    if (area === "admin") {
      setShowSplash(false);
      return;
    }

    setShowSplash(true);
    const timer = window.setTimeout(() => setShowSplash(false), 1450);
    return () => window.clearTimeout(timer);
  }, [area]);

  return (
    <IonApp>
      <IonPage>
        <IonContent fullscreen>
          {showSplash ? (
            <AppSplash area={area} />
          ) : (
            <>
              {area === "customer" && <CustomerArea />}
              {area === "driver" && <DriverArea />}
              {area === "admin" && <AdminArea />}
            </>
          )}
        </IonContent>
      </IonPage>
    </IonApp>
  );
}

function AppSplash({ area }: { area: Area }) {
  const isDriver = area === "driver";

  return (
    <div className={isDriver ? "app-splash app-splash-driver" : "app-splash app-splash-customer"}>
      <div className="app-splash-mark" aria-hidden="true">
        {isDriver ? (
          <>
            <span className="splash-route-line" />
            <span className="splash-route-dot splash-route-start" />
            <span className="splash-route-dot splash-route-end" />
            <span className="splash-truck-body" />
            <span className="splash-truck-cabin" />
            <span className="splash-truck-window" />
            <span className="splash-truck-wheel splash-truck-wheel-left" />
            <span className="splash-truck-wheel splash-truck-wheel-right" />
          </>
        ) : (
          <>
            <span className="splash-bowl" />
            <span className="splash-leaf splash-leaf-left" />
            <span className="splash-leaf splash-leaf-center" />
            <span className="splash-leaf splash-leaf-right" />
            <span className="splash-tomato splash-tomato-left" />
            <span className="splash-tomato splash-tomato-right" />
          </>
        )}
      </div>
      <p>{isDriver ? "SALAD DRIVER" : "SALAD DELIVERY"}</p>
      <h1>{isDriver ? "배송을 시작합니다" : "신선함을 준비합니다"}</h1>
      <span>{isDriver ? "오늘의 루트와 배송 업무를 불러오는 중" : "정기배송 주문과 주소 정보를 불러오는 중"}</span>
      <div className="app-splash-progress"><i /></div>
    </div>
  );
}

function readInitialArea(): Area {
  const buildVariant = import.meta.env.VITE_APP_VARIANT;
  if (buildVariant === "customer" || buildVariant === "driver" || buildVariant === "admin") {
    return buildVariant;
  }

  if (typeof window === "undefined") return "customer";

  const app = new URLSearchParams(window.location.search).get("app");
  if (app === "customer" || app === "driver" || app === "admin") return app;
  return "customer";
}

function appTitle(area: Area) {
  if (area === "customer") return "Salad Customer App";
  if (area === "driver") return "Salad Driver App";
  return "Salad Admin Web";
}

function readDispatchDeliveries() {
  if (typeof window === "undefined") return initialDeliveries;

  const saved = window.localStorage.getItem(DISPATCH_STORAGE_KEY);
  if (!saved) return initialDeliveries;

	  try {
	    const parsed = JSON.parse(saved) as Delivery[];
	    if (!Array.isArray(parsed) || parsed.length === 0) return initialDeliveries;
	    const normalized = parsed.map(normalizeDelivery);
	    const missingInitialDeliveries = initialDeliveries.filter(
	      (delivery) => !normalized.some((savedDelivery) => savedDelivery.id === delivery.id),
	    );
	    return [...normalized, ...missingInitialDeliveries];
	  } catch {
	    return initialDeliveries;
	  }
}

function normalizeDelivery(delivery: Delivery) {
  const fallback = initialDeliveries.find((item) => item.id === delivery.id);
  return {
    ...(fallback ?? initialDeliveries[0]),
    ...delivery,
    addressConfirmed: delivery.addressConfirmed ?? fallback?.addressConfirmed ?? false,
    customerActive: delivery.customerActive ?? fallback?.customerActive ?? true,
    deliveryDate: normalizeDemoDeliveryDate(delivery.deliveryDate ?? fallback?.deliveryDate ?? todayInputValue()),
    detailAddress: delivery.detailAddress ?? fallback?.detailAddress ?? delivery.address,
    driverMemo: delivery.driverMemo ?? fallback?.driverMemo ?? "",
    email: delivery.email ?? fallback?.email ?? "",
    orderPrepared: delivery.orderPrepared ?? fallback?.orderPrepared ?? false,
    phone: delivery.phone ?? fallback?.phone ?? "",
    saladCount: delivery.saladCount ?? fallback?.saladCount ?? 1,
  };
}

function normalizeDemoDeliveryDate(deliveryDate: string) {
  if (deliveryDate === "2026-07-06") return demoTodayDate;
  if (deliveryDate === "2026-07-07") return demoTomorrowDate;
  return deliveryDate;
}

function saveDispatchDeliveries(deliveries: Delivery[]) {
  window.localStorage.setItem(DISPATCH_STORAGE_KEY, JSON.stringify(deliveries));
  window.dispatchEvent(new Event("salad-dispatch-updated"));
}

function readDriverProfiles() {
  if (typeof window === "undefined") return initialDriverProfiles;

  const saved = window.localStorage.getItem(DRIVER_PROFILE_STORAGE_KEY);
  if (!saved) return initialDriverProfiles;

  try {
    const parsed = JSON.parse(saved) as DriverProfile[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialDriverProfiles;
  } catch {
    return initialDriverProfiles;
  }
}

function saveDriverProfiles(profiles: DriverProfile[]) {
  window.localStorage.setItem(DRIVER_PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  window.dispatchEvent(new Event("salad-drivers-updated"));
}

function readDeliveryZones() {
  if (typeof window === "undefined") return initialDeliveryZones;

  const saved = window.localStorage.getItem(DELIVERY_ZONE_STORAGE_KEY);
  if (!saved) return initialDeliveryZones;

  try {
    const parsed = JSON.parse(saved) as string[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialDeliveryZones;
  } catch {
    return initialDeliveryZones;
  }
}

function saveDeliveryZones(zones: string[]) {
  window.localStorage.setItem(DELIVERY_ZONE_STORAGE_KEY, JSON.stringify(zones));
  window.dispatchEvent(new Event("salad-zone-list-updated"));
}

function readZoneAssignments() {
  if (typeof window === "undefined") return initialZoneAssignments;

  const saved = window.localStorage.getItem(ZONE_ASSIGNMENT_STORAGE_KEY);
  if (!saved) return initialZoneAssignments;

  try {
    const parsed = JSON.parse(saved) as ZoneAssignment;
    return { ...initialZoneAssignments, ...parsed };
  } catch {
    return initialZoneAssignments;
  }
}

function saveZoneAssignments(assignments: ZoneAssignment) {
  window.localStorage.setItem(ZONE_ASSIGNMENT_STORAGE_KEY, JSON.stringify(assignments));
  window.dispatchEvent(new Event("salad-zone-updated"));
}

function readZoneRanges(): ZoneRangeConfig {
  if (typeof window === "undefined") return {};

  const saved = window.localStorage.getItem(ZONE_RANGE_STORAGE_KEY);
  if (!saved) return {};

  try {
    const parsed = JSON.parse(saved) as ZoneRangeConfig;
    return Object.fromEntries(
      Object.entries(parsed).filter(([, config]) => Array.isArray(config.points) && config.points.length >= 3),
    );
  } catch {
    return {};
  }
}

function saveZoneRanges(ranges: ZoneRangeConfig) {
  window.localStorage.setItem(ZONE_RANGE_STORAGE_KEY, JSON.stringify(ranges));
}

function formatZonePoints(points: number[][]) {
  return points.map(([lat, lng]) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`).join("\n");
}

function parseZonePoints(text: string) {
  const points = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [latText, lngText] = line.split(/[,\s]+/).filter(Boolean);
      const lat = Number(latText);
      const lng = Number(lngText);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return [lat, lng];
    })
    .filter((point): point is number[] => Boolean(point));

  return points.length >= 3 ? points : null;
}

type StoredAppSession = {
  address?: string | null;
  detailAddress?: string | null;
  email?: string | null;
  expiresAt?: number;
  name?: string;
  phone?: string | null;
  role?: string;
};

function readStoredSession(storageKey: string, role: "CUSTOMER" | "DRIVER" | "ADMIN") {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(storageKey);
  if (!saved) return null;

  try {
    const session = JSON.parse(saved) as StoredAppSession;
    if (session.role !== role || !session.expiresAt || session.expiresAt < Date.now()) {
      window.localStorage.removeItem(storageKey);
      return null;
    }
    return session;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

function saveStoredSession(storageKey: string, session: StoredAppSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    storageKey,
    JSON.stringify({
      ...session,
      expiresAt: Date.now() + ADMIN_SESSION_TTL_MS,
    }),
  );
}

function clearStoredSession(storageKey: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey);
}

function isLegacySampleCustomerSession(session: StoredAppSession) {
  return (
    session.name === "김샐러" &&
    session.phone === "010-1234-5678" &&
    Boolean(session.address?.startsWith("서울 강남구 테헤란로 100")) &&
    (session.detailAddress === undefined || session.detailAddress === "101동 1201호") &&
    session.email === "customer@salad.test"
  );
}

function readCustomerSession() {
  const session = readStoredSession(CUSTOMER_SESSION_STORAGE_KEY, "CUSTOMER");
  if (session && isLegacySampleCustomerSession(session)) {
    clearStoredSession(CUSTOMER_SESSION_STORAGE_KEY);
    return null;
  }
  return session;
}

function saveCustomerSession(session: { name: string; phone: string | null; address: string | null; detailAddress?: string | null; email: string | null }) {
  saveStoredSession(CUSTOMER_SESSION_STORAGE_KEY, {
    address: session.address,
    detailAddress: session.detailAddress,
    email: session.email,
    name: session.name,
    phone: session.phone,
    role: "CUSTOMER",
  });
}

function readDriverSession() {
  return readStoredSession(DRIVER_SESSION_STORAGE_KEY, "DRIVER");
}

function saveDriverSession(session: { name: string; phone: string | null }) {
  saveStoredSession(DRIVER_SESSION_STORAGE_KEY, {
    name: session.name,
    phone: session.phone,
    role: "DRIVER",
  });
}

function readAdminSession() {
  return Boolean(readStoredSession(ADMIN_SESSION_STORAGE_KEY, "ADMIN"));
}

function saveAdminSession(email: string) {
  saveStoredSession(ADMIN_SESSION_STORAGE_KEY, {
    email,
    role: "ADMIN",
  });
}

function combineAddress(address: string, detailAddress: string) {
  return [address.trim(), detailAddress.trim()].filter(Boolean).join(" ");
}

function driverAssignedDeliveries(driverName: string) {
  const assigned = readDispatchDeliveries().filter((delivery) => delivery.assignedDriver === driverName);
  return mergeDeliveriesById(assigned, initialDeliveries.filter((delivery) => delivery.assignedDriver === driverName));
}

function mergeDeliveriesById(primary: Delivery[], fallback: Delivery[]) {
  const merged = [...primary];
  fallback.forEach((delivery) => {
    if (!merged.some((item) => item.id === delivery.id)) {
      merged.push(delivery);
    }
  });
  return merged;
}

function readInitialDriverName() {
  const approvedDrivers = readDriverProfiles().filter((driver) => driver.status === "승인 완료");
  if (typeof window === "undefined") return approvedDrivers[0].name;

  const driver = new URLSearchParams(window.location.search).get("driver");
  if (driver && approvedDrivers.some((profile) => profile.name === driver)) return driver;
  return approvedDrivers[0].name;
}

function driverStatusFromSpring(status: SpringDriver["approvalStatus"], active: boolean): DriverProfile["status"] {
  if (status === "REJECTED") return "보류";
  if (status === "APPROVED" || active) return "승인 완료";
  return "승인 대기";
}

function mapSpringDrivers(drivers: SpringDriver[]): DriverProfile[] {
  return drivers.map((driver) => ({
    id: driver.id,
    name: driver.name,
    phone: driver.phone,
    status: driverStatusFromSpring(driver.approvalStatus, driver.isActive),
    zone: driver.zoneName || "미지정",
    zoneId: driver.zoneId,
  }));
}

function mapSpringZones(zones: SpringZone[]) {
  return zones.map((zone) => zone.zoneName);
}

function buildSpringZoneAssignments(drivers: SpringDriver[], zones: SpringZone[]) {
  return zones.reduce<ZoneAssignment>((assignments, zone) => {
    const driver = drivers.find((item) => item.zoneId === zone.id && item.isActive);
    if (driver) assignments[zone.zoneName] = driver.name;
    return assignments;
  }, {});
}

function mapSpringDeliveries(deliveries: SpringDelivery[], customers: SpringCustomer[]): Delivery[] {
  return deliveries.map((delivery, index) => {
    const customer = customers.find((item) => item.id === delivery.customerId);
    return {
      address: delivery.address,
      addressConfirmed: delivery.addressConfirmed,
      assignedDriver: delivery.driverName || null,
      bagCollected: delivery.insulatedBagReturned,
      bagCount: delivery.insulatedBagReturned ? 0 : 1,
      customer: delivery.customerName || customer?.name || "고객",
      customerActive: delivery.status !== "CANCELLED",
      customerId: delivery.customerId,
      deliveryDate: delivery.deliveryDate,
      detailAddress: compactDetailAddress(delivery.address),
      done: delivery.status === "DELIVERED",
      driverId: delivery.driverId,
      driverMemo: "",
      email: "",
      id: delivery.id,
      lat: delivery.latitude ?? 37.50064,
      lng: delivery.longitude ?? 127.03644,
      memo: delivery.requestNotes || "요청사항 없음",
      orderNo: `ORD-${delivery.deliveryDate.replace(/-/g, "")}-${String(index + 1).padStart(3, "0")}`,
      orderPrepared: delivery.orderPrepared,
      phone: customer?.phone ?? "",
      saladCount: 1,
      zone: delivery.zoneName || "미지정",
      zoneId: delivery.zoneId,
    };
  });
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysToInputDate(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function compactDetailAddress(address: string) {
  return address.replace("경기도 수원시 ", "").replace("서울 ", "").trim() || address;
}

function isUuid(value?: string | null) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

type KakaoPostcodeData = {
  address?: string;
  addressType?: string;
  bname?: string;
  buildingName?: string;
  jibunAddress?: string;
  roadAddress?: string;
  zonecode?: string;
};

type KakaoPostcodeConstructor = new (options: { oncomplete: (data: KakaoPostcodeData) => void }) => {
  open: () => void;
};

type KakaoPostcodeWindow = Window & {
  __saladPostcodeLoader?: Promise<void>;
  daum?: {
    Postcode?: KakaoPostcodeConstructor;
  };
  kakao?: {
    Postcode?: KakaoPostcodeConstructor;
  };
};

function loadKakaoPostcodeSdk() {
  const targetWindow = window as KakaoPostcodeWindow;
  if (targetWindow.daum?.Postcode || targetWindow.kakao?.Postcode) {
    return Promise.resolve();
  }

  if (targetWindow.__saladPostcodeLoader) {
    return targetWindow.__saladPostcodeLoader;
  }

  targetWindow.__saladPostcodeLoader = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    let settled = false;
    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      delete targetWindow.__saladPostcodeLoader;
      script.remove();
      reject(new Error(message));
    };
    const timeoutId = window.setTimeout(() => fail("카카오 주소찾기 로딩 시간이 초과되었습니다."), 5000);

    script.async = true;
    script.onerror = () => fail("카카오 주소찾기 스크립트를 불러오지 못했습니다.");
    script.onload = () => {
      if (!(targetWindow.daum?.Postcode || targetWindow.kakao?.Postcode)) {
        fail("카카오 주소찾기 객체를 찾을 수 없습니다.");
        return;
      }
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      resolve();
    };
    script.src = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    document.head.appendChild(script);
  });

  return targetWindow.__saladPostcodeLoader;
}

async function openKakaoPostcode(
  onSelect: (address: string, data: KakaoPostcodeData) => void,
  onError: (message: string) => void,
) {
  try {
    await loadKakaoPostcodeSdk();
    const targetWindow = window as KakaoPostcodeWindow;
    const Postcode = targetWindow.daum?.Postcode ?? targetWindow.kakao?.Postcode;
    if (!Postcode) {
      onError("카카오 주소찾기를 열 수 없습니다.");
      return;
    }

    new Postcode({
      oncomplete: (data) => {
        const nextAddress = data.roadAddress || data.address || data.jibunAddress || "";
        if (!nextAddress) {
          onError("선택된 주소를 확인할 수 없습니다.");
          return;
        }
        onSelect(nextAddress, data);
      },
    }).open();
  } catch (error) {
    onError(error instanceof Error ? error.message : "카카오 주소찾기에 실패했습니다.");
  }
}

function applySpringSnapshot(
  snapshot: SpringSnapshot,
  setDispatchDeliveries: (deliveries: Delivery[]) => void,
  setDriverProfiles: (drivers: DriverProfile[]) => void,
  setDeliveryZones: (zones: string[]) => void,
  setZoneAssignments: (assignments: ZoneAssignment) => void,
) {
  const deliveries = mapSpringDeliveries(snapshot.deliveries, snapshot.customers);
  const drivers = mapSpringDrivers(snapshot.drivers);
  const zones = mapSpringZones(snapshot.zones);
  const assignments = buildSpringZoneAssignments(snapshot.drivers, snapshot.zones);

  if (deliveries.length > 0) setDispatchDeliveries(deliveries);
  if (drivers.length > 0) setDriverProfiles(drivers);
  if (zones.length > 0) setDeliveryZones(zones);
  setZoneAssignments(assignments);
}

function CustomerArea() {
  const initialCustomerSession = readCustomerSession();
  const [loggedIn, setLoggedIn] = useState(() => Boolean(initialCustomerSession));
  const [showSignup, setShowSignup] = useState(false);
  const [tab, setTab] = useState<CustomerTab>("home");
  const [customerName, setCustomerName] = useState(initialCustomerSession?.name ?? "");
  const [phone, setPhone] = useState(initialCustomerSession?.phone ?? "");
  const [address, setAddress] = useState(initialCustomerSession?.address ?? "");
  const [detailAddress, setDetailAddress] = useState(initialCustomerSession?.detailAddress ?? "");
  const [email, setEmail] = useState(initialCustomerSession?.email ?? "");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState([2, 9, 16]);
  const [request, setRequest] = useState("");
  const [notice, setNotice] = useState("");

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  }

  function applyCustomerSession(session: { name: string; phone: string | null; address: string | null; detailAddress?: string | null; email: string | null }) {
    setCustomerName(session.name);
    setPhone(session.phone ?? phone);
    setAddress(session.address ?? address);
    setDetailAddress(session.detailAddress ?? detailAddress);
    setEmail(session.email ?? email);
    saveCustomerSession({ ...session, detailAddress: session.detailAddress ?? detailAddress });
    setLoggedIn(true);
  }

  function logoutCustomer() {
    clearStoredSession(CUSTOMER_SESSION_STORAGE_KEY);
    setPassword("");
    setPasswordConfirm("");
    setLoggedIn(false);
    flash("로그아웃되었습니다.");
  }

  async function submitCustomerAuth() {
    if (!email.trim() || !password.trim()) {
      flash("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    if (showSignup && (!customerName.trim() || !phone.trim() || !address.trim())) {
      flash("이름, 전화번호, 주소를 모두 입력해주세요.");
      return;
    }
    if (showSignup && password !== passwordConfirm) {
      flash("비밀번호가 일치하지 않습니다.");
      return;
    }

    setAuthLoading(true);
    try {
      const session = showSignup
        ? await signupSpringCustomer({
            address: combineAddress(address, detailAddress),
            email: email.trim(),
            name: customerName.trim(),
            password,
            phone: phone.trim(),
          })
        : await loginSpringCustomer({ loginId: email.trim(), password });
      applyCustomerSession({ ...session, address: session.address ?? address.trim(), detailAddress });
      setPasswordConfirm("");
    } catch (error) {
      flash(error instanceof Error ? error.message : "로그인 처리에 실패했습니다.");
    } finally {
      setAuthLoading(false);
    }
  }

  function openCustomerKakaoPostcode() {
    openKakaoPostcode(
      (nextAddress, data) => {
        setAddress(nextAddress);
        flash(`${data.zonecode ? `${data.zonecode} · ` : ""}카카오 주소가 입력되었습니다.`);
      },
      flash,
    );
  }

  if (!loggedIn) {
    return (
      <ScreenShell
        eyebrow="SALAD DELIVERY"
        title="샐러드 정기배송"
        subtitle="회원가입하고 원하는 배송일과 문 앞 요청사항을 관리하세요."
      >
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{showSignup ? "회원가입" : "로그인"}</IonCardTitle>
            <IonCardSubtitle>고객 전용 앱</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            {showSignup && (
              <>
                <IonInput label="이름" labelPlacement="stacked" placeholder="이름 입력" value={customerName} onIonInput={(e) => setCustomerName(String(e.detail.value ?? ""))} />
                <IonInput label="전화번호" labelPlacement="stacked" placeholder="010-0000-0000" value={phone} onIonInput={(e) => setPhone(String(e.detail.value ?? ""))} />
                <IonInput label="주소" labelPlacement="stacked" placeholder="주소찾기로 입력" value={address} onIonInput={(e) => setAddress(String(e.detail.value ?? ""))} />
                <IonInput
                  label="상세 주소"
                  labelPlacement="stacked"
                  placeholder="동/호수, 건물명, 출입 위치"
                  value={detailAddress}
                  onIonInput={(e) => setDetailAddress(String(e.detail.value ?? ""))}
                />
                <IonButton className="kakao-address-button" fill="outline" expand="block" onClick={openCustomerKakaoPostcode}>
                  <IonIcon slot="start" icon={searchOutline} />
                  카카오 주소찾기
                </IonButton>
              </>
            )}
            <IonInput label="이메일" labelPlacement="stacked" placeholder="email@example.com" value={email} onIonInput={(e) => setEmail(String(e.detail.value ?? ""))} />
            <IonInput label="비밀번호" labelPlacement="stacked" placeholder="비밀번호 입력" type="password" value={password} onIonInput={(e) => setPassword(String(e.detail.value ?? ""))} />
            {showSignup && (
              <IonInput
                label="비밀번호 확인"
                labelPlacement="stacked"
                placeholder="비밀번호 다시 입력"
                type="password"
                value={passwordConfirm}
                onIonInput={(e) => setPasswordConfirm(String(e.detail.value ?? ""))}
              />
            )}
            <IonButton expand="block" disabled={authLoading} onClick={submitCustomerAuth}>
              <IonIcon slot="start" icon={logInOutline} />
              {authLoading ? "확인 중..." : showSignup ? "가입하고 시작" : "로그인"}
            </IonButton>
            <IonButton
              fill="clear"
              expand="block"
              onClick={() => {
                setShowSignup(!showSignup);
                setPasswordConfirm("");
              }}
            >
              {showSignup ? "로그인으로 돌아가기" : "회원가입"}
            </IonButton>
            {notice && <IonChip color="warning">{notice}</IonChip>}
          </IonCardContent>
        </IonCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      eyebrow="CUSTOMER APP"
      title={`안녕하세요, ${customerName}님`}
      subtitle="정기배송 예약, 주문 내역, 주소와 요청사항을 관리합니다."
    >
      <div className="app-session-bar">
        <span>{customerName}님 로그인 중</span>
        <IonButton fill="outline" size="small" onClick={logoutCustomer}>
          <IonIcon slot="start" icon={logOutOutline} />
          로그아웃
        </IonButton>
      </div>
      <SideMenuLayout menu={<RightSideMenu current={tab} items={customerMenuItems} title="고객 메뉴" onChange={setTab} />}>
        <SummaryCard
          rows={[
            ["이번 주 배송", selectedDays.map((day) => `${day}일`).join(" · ")],
            ["배송 주소", shortAddress(combineAddress(address, detailAddress))],
            ["요청사항", request.includes("문 앞") ? "문 앞 배송" : "요청 저장"],
          ]}
        />
        {notice && <IonChip color="success">{notice}</IonChip>}
        {tab === "home" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>오늘의 상태</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <StatusRows rows={[["다음 배송", `${selectedDays[0] ?? "-"}일 오전`], ["배송 상태", "예약 완료"], ["보냉백", "회수 예정 1개"]]} />
            </IonCardContent>
          </IonCard>
        )}
        {tab === "reserve" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>배송일 선택</IonCardTitle>
              <IonCardSubtitle>달력에서 배송받을 날짜를 선택하세요.</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="calendar-box" aria-label="2026년 9월 배송일 달력">
                <div className="calendar-header">
                  <strong>2026년 9월</strong>
                  <span>선택 {selectedDays.length}일</span>
                </div>
                <div className="weekday-grid">
                  {["일", "월", "화", "수", "목", "금", "토"].map((weekday) => (
                    <span key={weekday}>{weekday}</span>
                  ))}
                </div>
                <div className="calendar-grid">
                  {Array.from({ length: 2 }, (_, index) => (
                    <div className="calendar-empty" key={`empty-${index}`} />
                  ))}
                  {Array.from({ length: 30 }, (_, index) => {
                    const day = index + 1;
                    const selected = selectedDays.includes(day);

                    return (
                      <button
                        className={selected ? "calendar-day selected" : "calendar-day"}
                        key={day}
                        type="button"
                        aria-pressed={selected}
                        aria-label={`9월 ${day}일 배송일 ${selected ? "선택됨" : "선택 안 됨"}`}
                        onClick={() =>
                          setSelectedDays((days) =>
                            days.includes(day)
                              ? days.filter((item) => item !== day)
                              : [...days, day].sort((a, b) => a - b),
                          )
                        }
                      >
                        <span>{day}</span>
                        {selected && <small>배송</small>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <IonTextarea label="요청사항" labelPlacement="stacked" placeholder="출입 방법, 문 앞 요청사항 등을 입력하세요." value={request} onIonInput={(e) => setRequest(String(e.detail.value ?? ""))} />
              <IonButton expand="block" onClick={() => flash("예약이 저장되었습니다.")}>
                예약 저장
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}
        {tab === "orders" && (
          <IonList inset>
            {selectedDays.map((day, index) => (
              <IonItem key={day}>
                <IonIcon icon={calendarOutline} slot="start" />
                <IonLabel>{day}일 오전 배송</IonLabel>
                <IonBadge color={index === 0 ? "success" : "medium"}>{index === 0 ? "예약 완료" : "배송 준비"}</IonBadge>
              </IonItem>
            ))}
          </IonList>
        )}
        {tab === "profile" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>내 정보</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonInput label="이름" labelPlacement="stacked" placeholder="이름 입력" value={customerName} onIonInput={(e) => setCustomerName(String(e.detail.value ?? ""))} />
              <IonInput label="전화번호" labelPlacement="stacked" placeholder="010-0000-0000" value={phone} onIonInput={(e) => setPhone(String(e.detail.value ?? ""))} />
              <IonInput label="주소" labelPlacement="stacked" placeholder="주소찾기로 입력" value={address} onIonInput={(e) => setAddress(String(e.detail.value ?? ""))} />
              <IonInput
                label="상세 주소"
                labelPlacement="stacked"
                placeholder="동/호수, 건물명, 출입 위치"
                value={detailAddress}
                onIonInput={(e) => setDetailAddress(String(e.detail.value ?? ""))}
              />
              <IonButton className="kakao-address-button" fill="outline" expand="block" onClick={openCustomerKakaoPostcode}>
                <IonIcon slot="start" icon={searchOutline} />
                카카오 주소찾기
              </IonButton>
              <IonInput label="이메일" labelPlacement="stacked" placeholder="email@example.com" value={email} onIonInput={(e) => setEmail(String(e.detail.value ?? ""))} />
              <IonButton
                expand="block"
                onClick={() => {
                  saveCustomerSession({ name: customerName, phone, address, detailAddress, email });
                  flash("내 정보가 저장되었습니다.");
                }}
              >
                내 정보 저장
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}
      </SideMenuLayout>
    </ScreenShell>
  );
}

function DriverArea() {
  const initialDriverSession = readDriverSession();
  const initialDriverName = initialDriverSession?.name ?? readInitialDriverName();
  const [loggedIn, setLoggedIn] = useState(() => Boolean(initialDriverSession));
  const [showApply, setShowApply] = useState(false);
  const [driverProfiles, setDriverProfiles] = useState(() => readDriverProfiles());
  const [currentDriverName, setCurrentDriverName] = useState(initialDriverName);
  const [driverPhone, setDriverPhone] = useState(initialDriverSession?.phone ?? "");
  const [driverPassword, setDriverPassword] = useState("");
  const [applyName, setApplyName] = useState("신규기사");
  const [applyPhone, setApplyPhone] = useState("");
  const [applyZone, setApplyZone] = useState("A구역");
  const [applyVehicleNumber, setApplyVehicleNumber] = useState("");
  const [driverAuthLoading, setDriverAuthLoading] = useState(false);
  const [tab, setTab] = useState<DriverTab>("map");
  const [working, setWorking] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => todayInputValue());
  const [routeFilter, setRouteFilter] = useState<"all" | "today">("today");
  const [deliveries, setDeliveries] = useState(() => driverAssignedDeliveries(initialDriverName));
  const [notice, setNotice] = useState("");
  const approvedDrivers = driverProfiles.filter((driver) => driver.status === "승인 완료");
  const currentDriver = approvedDrivers.find((driver) => driver.name === currentDriverName) ?? approvedDrivers[0];
  const visibleDeliveries = deliveries.filter((delivery) => routeFilter === "all" || (delivery.deliveryDate ?? selectedDate) === selectedDate);
  const selected = visibleDeliveries[selectedIndex] ?? visibleDeliveries[0];
  const todayDeliveryCount = deliveries.filter((delivery) => (delivery.deliveryDate ?? selectedDate) === selectedDate).length;
  const allDeliveryCount = deliveries.length;

  const completedCount = visibleDeliveries.filter((delivery) => delivery.done).length;
  const bagRequired = visibleDeliveries.reduce((total, delivery) => total + delivery.bagCount, 0);
  const bagCollected = visibleDeliveries.filter((delivery) => delivery.bagCollected).reduce((total, delivery) => total + delivery.bagCount, 0);
  const saladRequired = visibleDeliveries.reduce((total, delivery) => total + (delivery.saladCount ?? 1), 0);
  const saladDelivered = visibleDeliveries.filter((delivery) => delivery.done).reduce((total, delivery) => total + (delivery.saladCount ?? 1), 0);

  useEffect(() => {
    const syncAssignedDeliveries = () => {
      const assigned = driverAssignedDeliveries(currentDriverName);
      setDeliveries(assigned);
      setSelectedIndex((index) => Math.max(0, Math.min(index, assigned.length - 1)));
    };

    syncAssignedDeliveries();
    window.addEventListener("storage", syncAssignedDeliveries);
    window.addEventListener("salad-dispatch-updated", syncAssignedDeliveries);
    return () => {
      window.removeEventListener("storage", syncAssignedDeliveries);
      window.removeEventListener("salad-dispatch-updated", syncAssignedDeliveries);
    };
  }, [currentDriverName]);

  useEffect(() => {
    const syncDriverProfiles = () => {
      const nextProfiles = readDriverProfiles();
      const nextApproved = nextProfiles.filter((driver) => driver.status === "승인 완료");
      setDriverProfiles(nextProfiles);
      if (!nextApproved.some((driver) => driver.name === currentDriverName) && nextApproved[0]) {
        setCurrentDriverName(nextApproved[0].name);
      }
    };

    window.addEventListener("storage", syncDriverProfiles);
    window.addEventListener("salad-drivers-updated", syncDriverProfiles);
    return () => {
      window.removeEventListener("storage", syncDriverProfiles);
      window.removeEventListener("salad-drivers-updated", syncDriverProfiles);
    };
  }, [currentDriverName]);

  useEffect(() => {
    setSelectedIndex((index) => Math.max(0, Math.min(index, visibleDeliveries.length - 1)));
  }, [routeFilter, selectedDate, visibleDeliveries.length]);

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  }

  function changeRouteFilter(nextFilter: "all" | "today") {
    setRouteFilter(nextFilter);
    setSelectedIndex(0);
    flash(nextFilter === "today" ? `오늘의 배송 ${todayDeliveryCount}건을 표시합니다.` : `전체 고객 ${allDeliveryCount}건을 표시합니다.`);
  }

  function logoutDriver() {
    clearStoredSession(DRIVER_SESSION_STORAGE_KEY);
    setDriverPassword("");
    setWorking(false);
    setLoggedIn(false);
    flash("로그아웃되었습니다.");
  }

  async function submitDriverAuth() {
    setDriverAuthLoading(true);
    try {
      if (showApply) {
        if (!applyName.trim() || !applyPhone.trim() || !driverPassword.trim()) {
          flash("이름, 전화번호, 비밀번호를 입력해주세요.");
          return;
        }
        const zoneId = isUuid(applyZone) ? applyZone : null;
        await createSpringDriver({
          name: applyName.trim(),
          password: driverPassword,
          phone: applyPhone.trim(),
          zoneId,
          vehicleNumber: applyVehicleNumber.trim(),
        });
        flash("관리자 승인 대기 상태입니다.");
        setShowApply(false);
        setDriverPassword("");
        return;
      }

      if (!driverPhone.trim() || !driverPassword.trim()) {
        flash("전화번호와 비밀번호를 입력해주세요.");
        return;
      }
      const session = await loginSpringDriver({ phone: onlyDigits(driverPhone), password: driverPassword });
      setCurrentDriverName(session.name);
      saveDriverSession({ name: session.name, phone: session.phone });
      setLoggedIn(true);
	      loadSpringSnapshot()
	        .then((snapshot) => {
	          setDriverProfiles(mapSpringDrivers(snapshot.drivers));
	          const mapped = mapSpringDeliveries(snapshot.deliveries, snapshot.customers);
	          setDeliveries(mergeDeliveriesById(
	            mapped.filter((delivery) => delivery.assignedDriver === session.name),
	            driverAssignedDeliveries(session.name),
	          ));
	        })
        .catch(() => undefined);
    } catch (error) {
      flash(error instanceof Error ? error.message : "기사 인증 처리에 실패했습니다.");
    } finally {
      setDriverAuthLoading(false);
    }
  }

  function updateDeliveryById(deliveryId: string, patch: Partial<Delivery>) {
    const current = deliveries.find((delivery) => delivery.id === deliveryId);
    if (!current) return;

    const nextDriverDeliveries = deliveries.map((delivery) =>
      delivery.id === deliveryId ? { ...delivery, ...patch } : delivery,
    );
    setDeliveries(nextDriverDeliveries);
    setSelectedIndex((index) => Math.max(0, Math.min(index, visibleDeliveries.length - 1)));

    const storedDeliveries = readDispatchDeliveries();
    if (storedDeliveries.some((delivery) => delivery.id === deliveryId)) {
      saveDispatchDeliveries(
        storedDeliveries.map((delivery) =>
          delivery.id === deliveryId ? { ...delivery, ...patch } : delivery,
        ),
      );
    }

    if (isUuid(deliveryId) && patch.done) {
      completeSpringDelivery(deliveryId, patch.bagCollected ?? current.bagCollected)
        .then(() => undefined)
        .catch(() => flash("배송 완료 API 저장에 실패했습니다."));
    } else if (isUuid(deliveryId) && patch.bagCollected !== undefined) {
      updateSpringDeliveryBag(deliveryId, patch.bagCollected)
        .then(() => undefined)
        .catch(() => flash("보냉백 회수 API 저장에 실패했습니다."));
    }
  }

  function updateSelected(patch: Partial<Delivery>) {
    if (selected) updateDeliveryById(selected.id, patch);
  }

  function reorderVisibleDeliveries(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= visibleDeliveries.length || to >= visibleDeliveries.length) return;
    if (visibleDeliveries[from]?.done) {
      flash("완료된 배송은 순서를 변경할 수 없습니다.");
      return;
    }

    const selectedDeliveryId = visibleDeliveries[selectedIndex]?.id;
    const reorderableSlots = visibleDeliveries
      .map((delivery, index) => (delivery.done ? -1 : index))
      .filter((index) => index >= 0);
    const fromOrderIndex = reorderableSlots.indexOf(from);
    if (fromOrderIndex < 0) {
      flash("완료된 배송은 순서를 변경할 수 없습니다.");
      return;
    }

    const reorderedPending = reorderableSlots.map((index) => visibleDeliveries[index]);
    const [moved] = reorderedPending.splice(fromOrderIndex, 1);
    const toOrderIndex = reorderableSlots.filter((index) => index < to).length;
    reorderedPending.splice(toOrderIndex, 0, moved);

    let pendingIndex = 0;
    const reorderedVisible = visibleDeliveries.map((delivery) => {
      if (delivery.done) return delivery;
      const nextDelivery = reorderedPending[pendingIndex] ?? delivery;
      pendingIndex += 1;
      return nextDelivery;
    });

    const visibleIds = new Set(visibleDeliveries.map((delivery) => delivery.id));
    let nextVisibleIndex = 0;
    const nextDriverDeliveries = deliveries.map((delivery) => {
      if (!visibleIds.has(delivery.id)) return delivery;
      const nextDelivery = reorderedVisible[nextVisibleIndex] ?? delivery;
      nextVisibleIndex += 1;
      return nextDelivery;
    });

    setDeliveries(nextDriverDeliveries);
    setSelectedIndex(Math.max(0, reorderedVisible.findIndex((delivery) => delivery.id === selectedDeliveryId)));

    const storedDeliveries = readDispatchDeliveries();
    const nextById = new Map(nextDriverDeliveries.map((delivery) => [delivery.id, delivery]));
    const orderedDriverIds = nextDriverDeliveries.map((delivery) => delivery.id);
    let nextDriverIndex = 0;
    saveDispatchDeliveries(storedDeliveries.map((delivery) => {
      if (!nextById.has(delivery.id)) return delivery;
      const nextId = orderedDriverIds[nextDriverIndex] ?? delivery.id;
      nextDriverIndex += 1;
      return nextById.get(nextId) ?? delivery;
    }));
    flash("배송 순서가 변경되었습니다.");
  }

  async function copyText(label: string, value?: string) {
    if (!value) {
      flash(`${label} 정보가 없습니다.`);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      flash(`${label} 복사되었습니다.`);
    } catch {
      flash(`${label}: ${value}`);
    }
  }

  function writeDriverMemo(delivery: Delivery) {
    const memo = window.prompt("기사 메모를 입력해주세요.", delivery.driverMemo ?? "");
    if (memo === null) return;
    updateDeliveryById(delivery.id, { driverMemo: memo.trim() });
    flash("기사 메모가 저장되었습니다.");
  }

  if (!loggedIn) {
    return (
      <ScreenShell eyebrow="SALAD DRIVER" title="오늘 배송을 시작하세요" subtitle="승인된 기사만 로그인하고 배송 루트를 확인합니다.">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{showApply ? "기사 가입 신청" : "기사 로그인"}</IonCardTitle>
            <IonCardSubtitle>관리자 승인 후 사용</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            {showApply && (
              <>
                <IonInput label="이름" labelPlacement="stacked" value={applyName} onIonInput={(e) => setApplyName(String(e.detail.value ?? ""))} />
                <IonInput label="희망 구역" labelPlacement="stacked" value={applyZone} onIonInput={(e) => setApplyZone(String(e.detail.value ?? ""))} />
                <IonInput label="차량번호" labelPlacement="stacked" value={applyVehicleNumber} onIonInput={(e) => setApplyVehicleNumber(String(e.detail.value ?? ""))} />
              </>
            )}
            <IonInput label="전화번호" labelPlacement="stacked" value={showApply ? applyPhone : driverPhone} onIonInput={(e) => (showApply ? setApplyPhone(String(e.detail.value ?? "")) : setDriverPhone(String(e.detail.value ?? "")))} />
            <IonInput label="비밀번호" labelPlacement="stacked" placeholder="비밀번호 입력" type="password" value={driverPassword} onIonInput={(e) => setDriverPassword(String(e.detail.value ?? ""))} />
            <IonButton expand="block" disabled={driverAuthLoading} onClick={submitDriverAuth}>
              {driverAuthLoading ? "확인 중..." : showApply ? "승인 요청 보내기" : "기사 앱 시작"}
            </IonButton>
            <IonButton fill="clear" expand="block" onClick={() => setShowApply(!showApply)}>
              {showApply ? "로그인으로 돌아가기" : "기사 가입 신청"}
            </IonButton>
            {notice && <IonChip color="warning">{notice}</IonChip>}
          </IonCardContent>
        </IonCard>
      </ScreenShell>
    );
  }

	  return (
	    <div className={`driver-workspace ${tab === "map" ? "driver-map-mode" : ""}`}>
      <DriverWorkHeader
        currentDriverName={currentDriverName}
        onLogout={logoutDriver}
        onRefresh={() => {
          setDeliveries(driverAssignedDeliveries(currentDriverName));
          flash("배송 목록을 새로고침했습니다.");
        }}
      />

      <div className="driver-date-tabs">
        <div className="driver-date-control">
          <button aria-label="이전 날짜" onClick={() => setSelectedDate(addDaysToInputDate(selectedDate, -1))} type="button">
            <IonIcon icon={chevronBackOutline} />
          </button>
          <label>
            <IonIcon icon={calendarOutline} />
            <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.currentTarget.value)} />
          </label>
          <button aria-label="다음 날짜" onClick={() => setSelectedDate(addDaysToInputDate(selectedDate, 1))} type="button">
            <IonIcon icon={chevronForwardOutline} />
          </button>
        </div>
        <div className="driver-filter-tabs">
          <button
            aria-pressed={routeFilter === "all"}
            className={routeFilter === "all" ? "active" : ""}
            onClick={() => changeRouteFilter("all")}
            type="button"
          >
            전체 고객 <small>{allDeliveryCount}</small>
          </button>
          <button
            aria-pressed={routeFilter === "today"}
            className={routeFilter === "today" ? "active" : ""}
            onClick={() => changeRouteFilter("today")}
            type="button"
          >
            오늘의 배송 <small>{todayDeliveryCount}</small>
          </button>
        </div>
      </div>

      {notice && <div className="driver-toast">{notice}</div>}

      <SideMenuLayout menu={<RightSideMenu current={tab} items={driverMenuItems} title="기사 메뉴" onChange={setTab} />}>
        {tab === "route" && (
          <>
            <DriverTodaySummary
              bagCollected={bagCollected}
              bagRequired={bagRequired}
              completedCount={completedCount}
              deliveries={visibleDeliveries.length}
              saladDelivered={saladDelivered}
              saladRequired={saladRequired}
            />
            <div className="driver-start-row">
              <IonButton onClick={() => { setWorking(true); flash("출근 기록이 저장되었습니다."); }}>
                {working ? "출근 기록 완료" : "출근 기록"}
              </IonButton>
              <IonButton fill="outline" onClick={() => setTab("map")}>
                <IonIcon slot="start" icon={mapOutline} />
                지도 보기
              </IonButton>
            </div>
            <DriverDeliveryList
              deliveries={visibleDeliveries}
              onBag={(delivery) => {
                if (delivery.bagCount === 0) {
                  flash(`${delivery.customer} 고객은 회수할 보냉백이 없습니다.`);
                  return;
                }
                updateDeliveryById(delivery.id, { bagCollected: true });
                flash(`${delivery.customer} 보냉백 ${delivery.bagCount}개 회수 완료되었습니다.`);
              }}
              onComplete={(delivery) => {
                updateDeliveryById(delivery.id, { done: true, bagCollected: delivery.bagCount === 0 ? true : delivery.bagCollected });
                flash(`${delivery.customer} 배송 완료 처리되었습니다.`);
              }}
              onCopy={copyText}
              onMemo={writeDriverMemo}
              onReorder={reorderVisibleDeliveries}
              onSelect={(index) => {
                setSelectedIndex(index);
                setTab("map");
              }}
              selectedIndex={selectedIndex}
            />
          </>
        )}
        {tab === "map" && (
	          <div className="driver-map-stage">
	            <DeliveryRouteMap deliveries={visibleDeliveries} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
	            <div className="driver-map-floating-tools">
	              <button aria-label="배송 목록" type="button" onClick={() => setTab("route")}>
	                <IonIcon icon={homeOutline} />
	              </button>
	              <button type="button" onClick={() => flash("배송 지도 메모 기능은 준비 중입니다.")}>
	                <IonIcon icon={clipboardOutline} />
	              </button>
            </div>
            <div className="driver-map-info-sheet">
              <strong>{currentDriver.zone} · {routeFilter === "today" ? "오늘의 배송" : "전체 고객"}</strong>
              <span>마커를 누르면 배송지가 선택됩니다.</span>
            </div>
            <div className="driver-map-below">
              <DriverZoneMap deliveries={visibleDeliveries} onSelectDelivery={setSelectedIndex} />
              {selected ? (
                <StatusRows
                  rows={[
                    ["선택 고객", selected.customer],
                    ["도로명 주소", selected.address],
                    ["상세 주소", selected.detailAddress ?? "-"],
                    ["요청사항", selected.memo],
                    ["기사 메모", selected.driverMemo || "작성 전"],
                  ]}
                />
              ) : (
                <IonItem>
                  <IonLabel>지도에 표시할 배정 배송이 없습니다.</IonLabel>
                </IonItem>
              )}
            </div>
          </div>
        )}
        {tab === "done" && (
          <IonList inset>
            {visibleDeliveries.filter((delivery) => delivery.done).length === 0 && (
              <IonItem>
                <IonLabel>아직 완료된 배송이 없습니다.</IonLabel>
              </IonItem>
            )}
            {visibleDeliveries.filter((delivery) => delivery.done).map((delivery) => (
              <IonItem key={delivery.id}>
                <IonIcon icon={checkmarkCircleOutline} slot="start" />
                <IonLabel>
                  <h2>{delivery.customer}</h2>
                  <p>{delivery.address} · {delivery.detailAddress}</p>
                </IonLabel>
                <IonBadge color={delivery.bagCount === 0 || delivery.bagCollected ? "success" : "warning"}>
                  {delivery.bagCount === 0 ? "보냉백 없음" : delivery.bagCollected ? "회수 완료" : "미회수"}
                </IonBadge>
              </IonItem>
            ))}
          </IonList>
        )}
        {tab === "profile" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>기사 정보</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonInput label="이름" labelPlacement="stacked" value={currentDriver.name} />
              <IonInput label="전화번호" labelPlacement="stacked" value={currentDriver.phone} />
              <IonInput label="담당 구역" labelPlacement="stacked" value={currentDriver.zone} />
              <IonButton expand="block" onClick={() => flash("기사 정보가 저장되었습니다.")}>내 정보 저장</IonButton>
              <IonButton expand="block" fill="outline" onClick={() => { setWorking(false); flash("퇴근 기록이 저장되었습니다."); }}>퇴근 기록</IonButton>
            </IonCardContent>
          </IonCard>
        )}
      </SideMenuLayout>
    </div>
  );
}

function DriverWorkHeader({
  currentDriverName,
  onLogout,
  onRefresh,
}: {
  currentDriverName: string;
  onLogout: () => void;
  onRefresh: () => void;
}) {
  return (
    <header className="driver-work-header">
      <div className="driver-brand">
        <span className="driver-brand-icon" aria-hidden="true" />
        <div>
          <strong>Salad Fresh</strong>
          <small>{currentDriverName} 기사 업무</small>
        </div>
      </div>
      <div className="driver-header-actions">
        <button aria-label="새로고침" onClick={onRefresh} type="button">
          <IonIcon icon={refreshOutline} />
        </button>
        <button aria-label="로그아웃" onClick={onLogout} type="button">
          <IonIcon icon={logOutOutline} />
        </button>
      </div>
    </header>
  );
}

function DriverTodaySummary({
  bagCollected,
  bagRequired,
  completedCount,
  deliveries,
  saladDelivered,
  saladRequired,
}: {
  bagCollected: number;
  bagRequired: number;
  completedCount: number;
  deliveries: number;
  saladDelivered: number;
  saladRequired: number;
}) {
  const percent = deliveries === 0 ? 0 : Math.round((completedCount / deliveries) * 100);

  return (
    <section className="driver-summary-panel">
      <div className="driver-summary-head">
        <strong>오늘의 요약</strong>
        <span>{percent}% 완료</span>
      </div>
      <div className="driver-progress"><i style={{ width: `${percent}%` }} /></div>
      <div className="driver-summary-grid">
        <SummaryTile icon={mapOutline} label="배송 가구" value={completedCount} total={deliveries} tone="red" />
        <SummaryTile icon={cubeOutline} label="샐러드" value={saladDelivered} total={saladRequired} tone="green" />
        <SummaryTile icon={bagCheckOutline} label="보냉백 회수" value={bagCollected} total={bagRequired} tone="blue" />
      </div>
    </section>
  );
}

function SummaryTile({
  icon,
  label,
  tone,
  total,
  value,
}: {
  icon: string;
  label: string;
  tone: "blue" | "green" | "red";
  total: number;
  value: number;
}) {
  return (
    <div className={`driver-summary-tile ${tone}`}>
      <span><IonIcon icon={icon} /> {label}</span>
      <strong>{value}<em>/ {total}</em></strong>
      <small>남은 수량: {Math.max(total - value, 0)}</small>
    </div>
  );
}

function DriverDeliveryList({
  deliveries,
  onBag,
  onComplete,
  onCopy,
  onMemo,
  onReorder,
  onSelect,
  selectedIndex,
}: {
  deliveries: Delivery[];
  onBag: (delivery: Delivery) => void;
  onComplete: (delivery: Delivery) => void;
  onCopy: (label: string, value?: string) => void;
  onMemo: (delivery: Delivery) => void;
  onReorder: (from: number, to: number) => void;
  onSelect: (index: number) => void;
  selectedIndex: number;
}) {
  if (deliveries.length === 0) {
    return (
      <IonCard>
        <IonCardContent>
          <strong>오늘 배정된 배송이 없습니다.</strong>
          <p>관리자 웹에서 배송을 기사에게 배정하면 여기에 표시됩니다.</p>
        </IonCardContent>
      </IonCard>
    );
  }

  function handleReorder(event: CustomEvent<ItemReorderEventDetail>) {
    onReorder(event.detail.from, event.detail.to);
    event.detail.complete();
  }

  return (
    <IonList className="driver-delivery-list">
      <IonReorderGroup disabled={false} onIonItemReorder={handleReorder}>
      {deliveries.map((delivery, index) => (
        <IonItem className="driver-delivery-reorder-item" key={delivery.id} lines="none">
        <article className={[
          "driver-delivery-card",
          index === selectedIndex ? "selected" : "",
          delivery.done ? "locked" : "",
        ].filter(Boolean).join(" ")}>
          <div className="driver-card-sort-row">
          <button className="driver-address-row" onClick={() => onCopy("도로명 주소", delivery.address)} type="button">
            <span>{index + 1}</span>
            <strong>{delivery.address}</strong>
            <IonIcon icon={copyOutline} />
            <small>터치하여 도로명 주소 복사</small>
          </button>
            {delivery.done ? (
              <div className="driver-reorder-handle locked" aria-label="완료되어 순서 고정" title="완료되어 순서 고정">
                <IonIcon icon={checkmarkCircleOutline} />
              </div>
            ) : (
              <IonReorder className="driver-reorder-handle" aria-label="배송 순서 이동" title="배송 순서 이동">
                <span className="driver-reorder-grip" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </IonReorder>
            )}
          </div>

          <div className="driver-customer-box">
            <div className="driver-customer-line">
              <IonIcon icon={personCircleOutline} />
              <strong>{index + 1}. {delivery.customer}</strong>
              <button onClick={() => onCopy("상세 주소", delivery.detailAddress)} type="button">
                {delivery.detailAddress}
                <IonIcon icon={copyOutline} />
              </button>
              <IonBadge color="tertiary">샐러드 {delivery.saladCount ?? 1}개</IonBadge>
            </div>
            <div className="driver-request-box">
              <IonIcon icon={clipboardOutline} />
              <div>
                <strong>출입 및 고객 요청사항</strong>
                <p>{delivery.memo || "없음"}</p>
              </div>
            </div>
            {delivery.driverMemo && <p className="driver-saved-memo">기사 메모: {delivery.driverMemo}</p>}
            <div className="driver-card-actions">
              <IonButton fill="outline" onClick={() => onMemo(delivery)}>
                <IonIcon slot="start" icon={clipboardOutline} />
                기사 메모 작성
              </IonButton>
              <IonButton color={delivery.bagCount === 0 || delivery.bagCollected ? "success" : undefined} fill={delivery.bagCollected ? "solid" : "outline"} onClick={() => onBag(delivery)}>
                <IonIcon slot="start" icon={bagCheckOutline} />
                {delivery.bagCount === 0 ? "보냉백 없음" : delivery.bagCollected ? "보냉백 회수 완료" : "보냉백 미회수"}
              </IonButton>
              <IonButton color={delivery.done ? "success" : undefined} fill={delivery.done ? "solid" : "outline"} onClick={() => onComplete(delivery)}>
                <IonIcon slot="start" icon={checkmarkCircleOutline} />
                {delivery.done ? "완료됨" : "완료 처리"}
              </IonButton>
              <IonButton className="driver-map-action" onClick={() => onSelect(index)}>
                <IonIcon slot="start" icon={mapOutline} />
                지도 보기
              </IonButton>
            </div>
          </div>
        </article>
        </IonItem>
      ))}
      </IonReorderGroup>
    </IonList>
  );
}

function DeliveryRouteMap({
  deliveries,
  onSelect,
  selectedIndex,
}: {
  deliveries: Delivery[];
  onSelect: (index: number) => void;
  selectedIndex: number;
}) {
  const kakaoMapKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
  const routeStops = useMemo(() => buildRouteStops(deliveries), [deliveries]);

  if (deliveries.length === 0) {
    return (
      <div className="driver-demo-map empty">
        <strong>배정된 배송이 없습니다.</strong>
        <span>관리자 웹에서 기사 배정을 완료하면 지도에 표시됩니다.</span>
      </div>
    );
  }

  if (kakaoMapKey) {
    return <KakaoDeliveryMap appKey={kakaoMapKey} onSelect={onSelect} routeStops={routeStops} selectedIndex={selectedIndex} />;
  }

  return <DemoDeliveryMap onSelect={onSelect} routeStops={routeStops} selectedIndex={selectedIndex} />;
}

type RouteStop = {
  delivery: Delivery;
  deliveryIndex: number;
  lat: number;
  lng: number;
  order: number;
};

function buildRouteStops(deliveries: Delivery[]): RouteStop[] {
  return deliveries.map((delivery, index) => ({
    delivery,
    deliveryIndex: index,
    lat: delivery.lat,
    lng: delivery.lng,
    order: index + 1,
  }));
}

function DemoDeliveryMap({
  message,
  onSelect,
  routeStops,
  selectedIndex,
}: {
  message?: string;
  onSelect: (index: number) => void;
  routeStops: RouteStop[];
  selectedIndex: number;
}) {
  const selectedOrder = routeStops.find((stop) => stop.deliveryIndex === selectedIndex)?.order;

  return (
    <div className="driver-demo-map" aria-label="배송 지도">
      {message && <div className="driver-map-notice">{message}</div>}
      <div className="driver-map-road road-a" />
      <div className="driver-map-road road-b" />
      <div className="driver-map-road road-c" />
      <div className="driver-map-road road-d" />
      <div className="driver-map-route route-a" />
      <div className="driver-map-route route-b" />
      <div className="driver-map-route route-c" />
      {routeStops.map((stop) => (
        <button
          aria-label={`${stop.order}번 배송지 ${stop.delivery.customer}`}
          className={[
            "driver-map-pin",
            stop.order === selectedOrder ? "selected" : "",
            stop.delivery.done ? "done" : "",
            stop.order % 2 === 0 ? "blue" : "green",
          ].filter(Boolean).join(" ")}
          key={`${stop.delivery.id}-${stop.order}`}
          onClick={() => onSelect(stop.deliveryIndex)}
	          style={routeStops.length === 1 ? { left: "50%", top: "50%" } : routeStopPointStyle(stop)}
          type="button"
        >
          {stop.order}
        </button>
      ))}
      <button className="driver-location-button" type="button">
        <IonIcon icon={mapOutline} />
      </button>
    </div>
  );
}

type KakaoMapsWindow = Window & {
  __saladKakaoMapLoader?: Promise<void>;
  kakao?: {
    maps: {
	      event: {
	        addListener: (target: unknown, eventName: string, handler: () => void) => void;
	      };
	      CustomOverlay: new (options: {
	        clickable?: boolean;
	        content: HTMLElement | string;
	        map: unknown;
	        position: unknown;
	        yAnchor?: number;
		      }) => unknown;
		      LatLng: new (lat: number, lng: number) => unknown;
		      LatLngBounds: new () => {
		        extend: (point: unknown) => void;
		      };
      load: (callback: () => void) => void;
      Map: new (container: HTMLElement, options: { center: unknown; level: number }) => {
        setBounds: (bounds: unknown) => void;
      };
      Marker: new (options: { map: unknown; position: unknown }) => unknown;
      Polygon: new (options: {
        fillColor: string;
        fillOpacity: number;
        map: unknown;
        path: unknown[];
        strokeColor: string;
        strokeOpacity: number;
        strokeStyle: string;
        strokeWeight: number;
      }) => unknown;
      Polyline: new (options: {
        map: unknown;
        path: unknown[];
        strokeColor: string;
        strokeOpacity: number;
        strokeStyle: string;
        strokeWeight: number;
      }) => unknown;
    };
  };
};

function loadKakaoMapSdk(appKey: string) {
  const targetWindow = window as KakaoMapsWindow;
  if (isKakaoMapSdkReady(targetWindow)) {
    return Promise.resolve();
  }

  if (targetWindow.__saladKakaoMapLoader) {
    return targetWindow.__saladKakaoMapLoader;
  }

  if (targetWindow.kakao?.maps?.load) {
    targetWindow.__saladKakaoMapLoader = new Promise<void>((resolve, reject) => {
      targetWindow.kakao?.maps.load(() => {
        if (isKakaoMapSdkReady(targetWindow)) {
          resolve();
        } else {
          delete targetWindow.__saladKakaoMapLoader;
          reject(new Error("Kakao 지도 SDK가 완전히 초기화되지 않았습니다. JavaScript 키와 도메인 설정을 확인해주세요."));
        }
      });
    });
    return targetWindow.__saladKakaoMapLoader;
  }

  targetWindow.__saladKakaoMapLoader = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      clearFailedLoader(`Kakao 지도 로딩 시간이 초과되었습니다. 현재 도메인 ${window.location.origin}을 Kakao Developers Web 플랫폼에 등록해주세요.`);
    }, 4500);
    const clearFailedLoader = (message: string) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      delete targetWindow.__saladKakaoMapLoader;
      script.remove();
      reject(new Error(message));
    };
    const finishLoader = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      resolve();
    };

    script.async = true;
    script.onerror = () => clearFailedLoader(`Kakao 지도 스크립트를 불러오지 못했습니다. 현재 도메인 ${window.location.origin}을 Kakao Developers Web 플랫폼에 등록해주세요.`);
    script.onload = () => {
      const kakao = (window as KakaoMapsWindow).kakao;
      if (!kakao?.maps) {
        clearFailedLoader("Kakao 지도 객체를 찾을 수 없습니다.");
        return;
      }
      kakao.maps.load(() => {
        if (isKakaoMapSdkReady(targetWindow)) {
          finishLoader();
        } else {
          clearFailedLoader("Kakao 지도 SDK가 완전히 초기화되지 않았습니다. JavaScript 키와 도메인 설정을 확인해주세요.");
        }
      });
    };
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`;
    document.head.appendChild(script);
  });

  return targetWindow.__saladKakaoMapLoader;
}

function isKakaoMapSdkReady(targetWindow: KakaoMapsWindow) {
  const maps = targetWindow.kakao?.maps;
  return Boolean(
    maps &&
      typeof maps.load === "function" &&
      typeof maps.LatLng === "function" &&
      typeof maps.LatLngBounds === "function" &&
      typeof maps.Map === "function" &&
      typeof maps.Polygon === "function" &&
      typeof maps.CustomOverlay === "function",
  );
}

function KakaoDeliveryMap({
  appKey,
  onSelect,
  routeStops,
  selectedIndex,
}: {
  appKey: string;
  onSelect: (index: number) => void;
  routeStops: RouteStop[];
  selectedIndex: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    let canceled = false;

    loadKakaoMapSdk(appKey)
      .then(() => {
        if (canceled || !containerRef.current) return;

	        const kakao = (window as KakaoMapsWindow).kakao;
	        if (!kakao?.maps) return;
	        containerRef.current.replaceChildren();

	        const selected = routeStops.find((stop) => stop.deliveryIndex === selectedIndex) ?? routeStops[0];
	        const centerLat = routeStops.reduce((sum, stop) => sum + stop.lat, 0) / routeStops.length;
	        const centerLng = routeStops.reduce((sum, stop) => sum + stop.lng, 0) / routeStops.length;
	        const mapLevel = routeStops.length <= 1 ? 4 : routeStops.length <= 6 ? 6 : 7;
		        const center = new kakao.maps.LatLng(centerLat, centerLng);
	        const map = new kakao.maps.Map(containerRef.current, { center, level: mapLevel });
	        const routePath = routeStops.map((stop) => new kakao.maps.LatLng(stop.lat, stop.lng));

        new kakao.maps.Polyline({
          map,
          path: routePath,
          strokeColor: "#16B981",
          strokeOpacity: 0.78,
          strokeStyle: "solid",
          strokeWeight: 6,
        });

	        routeStops.forEach((stop) => {
	          const position = new kakao.maps.LatLng(stop.lat, stop.lng);
	          const isSelected = stop.deliveryIndex === selectedIndex && stop.order === selected.order;
	          const markerButton = document.createElement("button");
	          markerButton.className = [
	            "kakao-route-marker",
	            isSelected ? "selected" : "",
	            stop.delivery.done ? "done" : "",
	            stop.order % 2 === 0 ? "blue" : "green",
	          ].filter(Boolean).join(" ");
	          markerButton.type = "button";
	          markerButton.textContent = String(stop.order);
	          markerButton.title = `${stop.order}. ${stop.delivery.customer}`;
	          markerButton.addEventListener("click", () => onSelect(stop.deliveryIndex));
	          new kakao.maps.CustomOverlay({
	            clickable: true,
	            content: markerButton,
	            map,
	            position,
	            yAnchor: 0.5,
	          });
	        });

        setMapError("");
      })
      .catch((error) => {
        if (!canceled) {
          setMapError(error instanceof Error ? error.message : "Kakao 지도를 불러오지 못했습니다.");
        }
      });

    return () => {
      canceled = true;
    };
  }, [appKey, onSelect, routeStops, selectedIndex]);

  if (mapError) {
    return (
      <DemoDeliveryMap
        message={`${mapError} 등록 후에도 계속 보이면 페이지를 새로고침해주세요.`}
        onSelect={onSelect}
        routeStops={routeStops}
        selectedIndex={selectedIndex}
      />
    );
  }

  return (
    <div className="kakao-map-panel">
      <div className="kakao-map-container" ref={containerRef} />
      <div className="kakao-map-badge">Kakao Maps</div>
    </div>
  );
}

function routeStopPointStyle(stop: RouteStop) {
  const latSpread = (stop.lat - 37.205) * 870;
  const lngSpread = (stop.lng - 126.975) * 610;
  const left = Math.max(8, Math.min(90, 20 + lngSpread));
  const top = Math.max(10, Math.min(88, 82 - latSpread));
  return { left: `${left}%`, top: `${top}%` };
}

const driverZoneDefinitions = [
  {
    name: "역삼",
    className: "zone-1",
    color: "#111827",
    points: [
      [37.508, 127.027],
      [37.509, 127.043],
      [37.498, 127.047],
      [37.493, 127.034],
      [37.500, 127.025],
    ],
  },
  {
    name: "삼성",
    className: "zone-2",
    color: "#2e90fa",
    points: [
      [37.517, 127.044],
      [37.522, 127.064],
      [37.510, 127.071],
      [37.502, 127.058],
      [37.507, 127.045],
    ],
  },
  {
    name: "논현",
    className: "zone-3",
    color: "#10b981",
    points: [
      [37.521, 127.018],
      [37.521, 127.038],
      [37.508, 127.039],
      [37.504, 127.025],
      [37.513, 127.015],
    ],
  },
  {
    name: "대치",
    className: "zone-4",
    color: "#b45309",
    points: [
      [37.503, 127.043],
      [37.506, 127.065],
      [37.492, 127.070],
      [37.488, 127.050],
      [37.496, 127.041],
    ],
  },
  {
    name: "청담",
    className: "zone-5",
    color: "#db2777",
    points: [
      [37.529, 127.039],
      [37.533, 127.058],
      [37.521, 127.067],
      [37.514, 127.051],
      [37.520, 127.038],
    ],
  },
  {
    name: "압구정",
    className: "zone-6",
    color: "#635bff",
    points: [
      [37.537, 127.019],
      [37.537, 127.040],
      [37.526, 127.043],
      [37.520, 127.027],
      [37.528, 127.015],
    ],
  },
];

const seoulOperationZones = [
  {
    name: "서울A-서북권",
    color: "#db2777",
    districts: ["은평구", "서대문구", "마포구"],
    points: [
      [37.650, 126.885],
      [37.635, 126.950],
      [37.610, 126.965],
      [37.585, 126.950],
      [37.535, 126.950],
      [37.535, 126.875],
      [37.585, 126.885],
    ],
  },
  {
    name: "서울B-도심권",
    color: "#111827",
    districts: ["종로구", "중구", "용산구"],
    points: [
      [37.615, 126.955],
      [37.615, 127.020],
      [37.575, 127.030],
      [37.550, 127.020],
      [37.515, 127.025],
      [37.515, 126.960],
      [37.565, 126.955],
    ],
  },
  {
    name: "서울C-동북권",
    color: "#635bff",
    districts: ["도봉구", "강북구", "노원구", "성북구", "동대문구", "중랑구"],
    points: [
      [37.705, 127.025],
      [37.695, 127.105],
      [37.625, 127.115],
      [37.580, 127.075],
      [37.565, 127.025],
      [37.585, 126.995],
      [37.645, 127.000],
    ],
  },
  {
    name: "서울D-서남권",
    color: "#f59e0b",
    districts: ["강서구", "양천구", "구로구", "금천구"],
    points: [
      [37.590, 126.760],
      [37.545, 126.890],
      [37.515, 126.900],
      [37.475, 126.930],
      [37.435, 126.875],
      [37.475, 126.820],
      [37.535, 126.760],
    ],
  },
  {
    name: "서울E-영등포권",
    color: "#10b981",
    districts: ["영등포구", "동작구", "관악구"],
    points: [
      [37.545, 126.880],
      [37.545, 126.960],
      [37.525, 126.985],
      [37.495, 126.985],
      [37.455, 126.915],
      [37.490, 126.880],
    ],
  },
  {
    name: "서울F-동남권",
    color: "#2e90fa",
    districts: ["서초구", "강남구", "송파구", "강동구"],
    points: [
      [37.535, 126.985],
      [37.565, 127.115],
      [37.565, 127.185],
      [37.485, 127.155],
      [37.455, 127.075],
      [37.455, 126.985],
    ],
  },
  {
    name: "서울G-동부권",
    color: "#14b8a6",
    districts: ["성동구", "광진구"],
    points: [
      [37.570, 127.020],
      [37.570, 127.115],
      [37.525, 127.115],
      [37.525, 127.060],
      [37.535, 127.020],
    ],
  },
];

const seoulDeliveryZoneDistricts = seoulOperationZones.reduce<Record<string, string[]>>((districts, zone) => {
  districts[zone.name] = zone.districts;
  return districts;
}, {});

const adminRegionPresets: RegionZonePreset[] = [
  {
    name: "서울전체",
    description: "서울 전체를 배송 운영용 7개 권역으로 나눕니다.",
    zones: seoulOperationZones,
  },
];

function displayZoneName(delivery: Delivery, index: number) {
  const address = `${delivery.address} ${delivery.detailAddress ?? ""}`;
  if (address.includes("삼성") || address.includes("봉은사") || address.includes("코엑스")) return "삼성";
  if (address.includes("논현")) return "논현";
  if (address.includes("대치") || address.includes("선릉")) return "대치";
  if (address.includes("청담")) return "청담";
  if (address.includes("압구정")) return "압구정";
  if (address.includes("역삼") || address.includes("테헤란")) return "역삼";
  return driverZoneDefinitions[index % driverZoneDefinitions.length].name;
}

function deliveryMatchesMapZone(delivery: Delivery, zoneName: string) {
  const address = `${delivery.address} ${delivery.detailAddress ?? ""}`;
  const districtName = zoneName.replace(/구$/, "");
  const zoneDistricts = seoulDeliveryZoneDistricts[zoneName] ?? [];
  return (
    delivery.zone === zoneName ||
    delivery.zone.startsWith(districtName) ||
    address.includes(zoneName) ||
    address.includes(districtName) ||
    zoneDistricts.some((district) => {
      const shortDistrict = district.replace(/구$/, "");
      return (
        delivery.zone === district ||
        delivery.zone.startsWith(shortDistrict) ||
        address.includes(district) ||
        address.includes(shortDistrict)
      );
    })
  );
}

function regionPresetRanges(preset: RegionZonePreset) {
  return preset.zones.reduce<ZoneRangeConfig>((ranges, zone) => {
    ranges[zone.name] = { color: zone.color, points: zone.points };
    return ranges;
  }, {});
}

function DriverZoneMap({
  deliveries,
  onSelectDelivery,
}: {
  deliveries: Delivery[];
  onSelectDelivery: (index: number) => void;
}) {
	  const zoneDeliveries = useMemo(() => driverZoneDefinitions.map((zone) => ({
	    ...zone,
	    deliveries: deliveries
	      .map((delivery, index) => ({ delivery, index, zoneName: displayZoneName(delivery, index) }))
	      .filter((item) => item.zoneName === zone.name),
	  })), [deliveries]);
  const firstZoneWithDelivery = zoneDeliveries.find((zone) => zone.deliveries.length > 0)?.name ?? driverZoneDefinitions[0].name;
  const [selectedZone, setSelectedZone] = useState(firstZoneWithDelivery);
  const selected = zoneDeliveries.find((zone) => zone.name === selectedZone) ?? zoneDeliveries[0];
  const pendingCount = selected.deliveries.filter((item) => !item.delivery.done).length;
  const kakaoMapKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;

  return (
    <section className="driver-zone-map" aria-label="구역 지도">
      <div className="driver-zone-head">
        <strong>강남 구역별 배송 범위</strong>
        <span>강남 배송 구역 {zoneDeliveries.length}개</span>
      </div>
      {kakaoMapKey ? (
        <KakaoZoneRangeMap
          appKey={kakaoMapKey}
          onSelectZone={setSelectedZone}
          selectedZone={selectedZone}
          zones={zoneDeliveries}
        />
      ) : (
        <ZoneRangeCanvas onSelectZone={setSelectedZone} selectedZone={selectedZone} zones={zoneDeliveries} />
      )}
      <div className="zone-detail-panel">
        <div>
          <strong>{selected.name} 구역</strong>
          <span>실제 배정 배송 {selected.deliveries.length}건 · 미완료 {pendingCount}건</span>
        </div>
        {selected.deliveries.length === 0 ? (
          <p>현재 선택한 날짜에는 이 구역 배송이 없습니다.</p>
        ) : (
          <ul>
            {selected.deliveries.map(({ delivery, index }) => (
              <li key={delivery.id}>
                <button onClick={() => onSelectDelivery(index)} type="button">
                  <b>{delivery.customer}</b>
                  <span>{delivery.address} · {delivery.detailAddress}</span>
                  <em>{delivery.done ? "완료" : "배송 대기"}</em>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function AdminZoneRangeMap({
  deliveries,
  deliveryZones,
  drivers,
  onCreateRegionZones,
  onSelectDelivery,
  zoneAssignments,
}: {
  deliveries: Delivery[];
  deliveryZones: string[];
  drivers: DriverProfile[];
  onCreateRegionZones: (zoneNames: string[], ranges: ZoneRangeConfig, regionName: string) => void;
  onSelectDelivery: (deliveryId: string) => void;
  zoneAssignments: ZoneAssignment;
}) {
  const [zoneRanges, setZoneRanges] = useState(() => readZoneRanges());
  const [visibleRegionName, setVisibleRegionName] = useState(adminRegionPresets[0]?.name ?? "");
  const zoneDeliveries = useMemo(() => {
    const visiblePreset = adminRegionPresets.find((preset) => preset.name === visibleRegionName);
    const zones = visiblePreset?.zones.map((zone) => zone.name) ?? (deliveryZones.length > 0 ? deliveryZones : initialDeliveryZones);

    return zones.map((zoneName, index) => {
      const base = driverZoneDefinitions[index % driverZoneDefinitions.length];
      const presetRange = visiblePreset?.zones.find((zone) => zone.name === zoneName);
      const customRange = zoneRanges[zoneName] ?? presetRange;
      return {
        ...base,
        color: customRange?.color ?? base.color,
        name: zoneName,
        points: customRange?.points ?? base.points,
        deliveries: deliveries
          .map((delivery, deliveryIndex) => ({ delivery, index: deliveryIndex, zoneName: delivery.zone }))
          .filter((item) => deliveryMatchesMapZone(item.delivery, zoneName)),
      };
    });
  }, [deliveries, deliveryZones, visibleRegionName, zoneRanges]);
  const firstZone = zoneDeliveries.find((zone) => zone.deliveries.length > 0)?.name ?? zoneDeliveries[0]?.name ?? "강남A";
  const [selectedZone, setSelectedZone] = useState(firstZone);
  const [showRangeSettings, setShowRangeSettings] = useState(false);
  const [rangeText, setRangeText] = useState("");
  const [rangeColor, setRangeColor] = useState("#111827");
  const [rangeMessage, setRangeMessage] = useState("");
  const selected = zoneDeliveries.find((zone) => zone.name === selectedZone) ?? zoneDeliveries[0];
  const selectedDriverName = selected ? zoneAssignments[selected.name] : "";
  const selectedDriver = selectedDriverName
    ? drivers.find((driver) => driver.name === selectedDriverName)
    : drivers.find((driver) => driver.zone === selected?.name);
  const kakaoMapKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;

  useEffect(() => {
    if (!selected && firstZone) setSelectedZone(firstZone);
    if (selected && !zoneDeliveries.some((zone) => zone.name === selectedZone)) {
      setSelectedZone(firstZone);
    }
  }, [firstZone, selected, selectedZone, zoneDeliveries]);

  useEffect(() => {
    if (!selected) return;
    setRangeText(formatZonePoints(selected.points));
    setRangeColor(selected.color);
    setRangeMessage("");
  }, [selected]);

  useEffect(() => {
    const defaultPreset = adminRegionPresets[0];
    if (!defaultPreset) return;

    const hasMissingZone = defaultPreset.zones.some((zone) => !deliveryZones.includes(zone.name));
    const hasMissingRange = defaultPreset.zones.some((zone) => !zoneRanges[zone.name]);
    if (!hasMissingZone && !hasMissingRange) return;

    const presetRanges = regionPresetRanges(defaultPreset);
    if (hasMissingRange) {
      const nextRanges = { ...zoneRanges, ...presetRanges };
      setZoneRanges(nextRanges);
      saveZoneRanges(nextRanges);
    }
    if (hasMissingZone) {
      onCreateRegionZones(defaultPreset.zones.map((zone) => zone.name), presetRanges, defaultPreset.name);
    }
    setVisibleRegionName(defaultPreset.name);
    setSelectedZone((currentZone) =>
      defaultPreset.zones.some((zone) => zone.name === currentZone)
        ? currentZone
        : defaultPreset.zones[0]?.name ?? currentZone,
    );
  }, [deliveryZones, onCreateRegionZones, zoneRanges]);

  if (!selected) return null;

  const pendingCount = selected.deliveries.filter((item) => !item.delivery.done).length;
  const unassignedCount = selected.deliveries.filter((item) => !item.delivery.assignedDriver).length;
  const selectedDistricts = seoulDeliveryZoneDistricts[selected.name] ?? [];

  function saveSelectedRange() {
    const points = parseZonePoints(rangeText);
    if (!points) {
      setRangeMessage("좌표는 최소 3개 이상 필요합니다. 예: 37.508000, 127.027000");
      return;
    }

    const nextRanges = {
      ...zoneRanges,
      [selected.name]: { color: rangeColor, points },
    };
    setZoneRanges(nextRanges);
    saveZoneRanges(nextRanges);
    setRangeMessage(`${selected.name} 범위가 저장되었습니다.`);
  }

  function resetSelectedRange() {
    const { [selected.name]: _removed, ...nextRanges } = zoneRanges;
    setZoneRanges(nextRanges);
    saveZoneRanges(nextRanges);
    setRangeMessage(`${selected.name} 범위를 기본값으로 되돌렸습니다.`);
  }

  function applyPresetRange(presetIndex: number) {
    const preset = driverZoneDefinitions[presetIndex % driverZoneDefinitions.length];
    setRangeText(formatZonePoints(preset.points));
    setRangeColor(preset.color);
    setRangeMessage(`${preset.name} 프리셋을 불러왔습니다. 저장을 눌러 적용하세요.`);
  }

  function applyRegionPreset(preset: RegionZonePreset, openSettings = true) {
    const presetRanges = regionPresetRanges(preset);
    const nextRanges = { ...zoneRanges, ...presetRanges };
    setZoneRanges(nextRanges);
    saveZoneRanges(nextRanges);
    onCreateRegionZones(preset.zones.map((zone) => zone.name), presetRanges, preset.name);
    setVisibleRegionName(preset.name);
    setSelectedZone(preset.zones[0]?.name ?? selected.name);
    if (openSettings) setShowRangeSettings(true);
    setRangeMessage(`${preset.name} 지역을 ${preset.zones.length}개 구역으로 나눴습니다.`);
  }

  return (
    <section className="admin-zone-range-card">
      <div className="admin-zone-range-head">
        <div>
          <span>배송 구역 지도</span>
          <strong>구역별 배송 범위</strong>
          <p>관리자가 담당 구역, 기사, 배송 건수를 한 화면에서 확인합니다.</p>
        </div>
        <div className="admin-zone-range-stats">
          <span>구역 {zoneDeliveries.length}개</span>
          <span>배송 {deliveries.length}건</span>
          <button type="button" onClick={() => setShowRangeSettings((visible) => !visible)}>
            {showRangeSettings ? "범위 설정 닫기" : "범위 설정"}
          </button>
        </div>
      </div>
      <div className="admin-zone-map-region-tabs" aria-label="지도 표시 지역">
        {adminRegionPresets.map((preset) => (
          <button
            className={visibleRegionName === preset.name ? "active" : ""}
            key={preset.name}
            onClick={() => {
              applyRegionPreset(preset, false);
            }}
            type="button"
          >
            {preset.name} 지도 보기
            <span>{preset.zones.length}구역</span>
          </button>
        ))}
      </div>
      {kakaoMapKey ? (
        <KakaoZoneRangeMap
          appKey={kakaoMapKey}
          onSelectZone={setSelectedZone}
          selectedZone={selectedZone}
          zones={zoneDeliveries}
        />
      ) : (
        <ZoneRangeCanvas
          message="Kakao 지도 키가 없어 데모 구역 지도로 표시합니다."
          onSelectZone={setSelectedZone}
          selectedZone={selectedZone}
          zones={zoneDeliveries}
        />
      )}
      <div className="admin-zone-range-detail">
        <div className="admin-zone-range-summary">
          <strong>{selected.name}</strong>
          <span>담당 기사: {(selectedDriver?.name ?? selectedDriverName) || "미지정"}</span>
          {selectedDistricts.length > 0 && <span>포함 지역: {selectedDistricts.join(", ")}</span>}
          <span>배송 {selected.deliveries.length}건 · 미완료 {pendingCount}건 · 미배정 {unassignedCount}건</span>
        </div>
        <div className="admin-zone-range-list">
          {selected.deliveries.length === 0 ? (
            <p>선택한 구역의 배송 주문이 없습니다.</p>
          ) : (
            selected.deliveries.map(({ delivery }) => (
              <button key={delivery.id} onClick={() => onSelectDelivery(delivery.id)} type="button">
                <b>{delivery.customer}</b>
                <span>{delivery.address} {delivery.detailAddress ?? ""}</span>
                <em>{delivery.assignedDriver ?? "미배정"} · {delivery.done ? "완료" : "대기"}</em>
              </button>
            ))
          )}
        </div>
      </div>
      {showRangeSettings && (
        <div className="admin-zone-range-editor">
          <div className="admin-zone-range-editor-head">
            <div>
              <strong>{selected.name} 범위 설정</strong>
              <span>위도, 경도 좌표를 한 줄에 하나씩 입력하면 구역 다각형으로 저장됩니다.</span>
            </div>
            <label>
              색상
              <input type="color" value={rangeColor} onChange={(event) => setRangeColor(event.currentTarget.value)} />
            </label>
          </div>
          <div className="admin-zone-preset-row">
            {driverZoneDefinitions.map((preset, index) => (
              <button key={preset.name} onClick={() => applyPresetRange(index)} type="button">
                {preset.name} 프리셋
              </button>
            ))}
          </div>
          <div className="admin-zone-region-presets">
            <div>
              <strong>지역별 구역 만들기</strong>
              <span>큰 지역을 A/B/C 같은 운영 구역으로 자동 분리합니다.</span>
            </div>
            <div className="admin-zone-region-row">
              {adminRegionPresets.map((preset) => (
                <button key={preset.name} onClick={() => applyRegionPreset(preset)} type="button">
                  <b>{preset.name} · {preset.zones.length}구역</b>
                  <span>{preset.description}</span>
                </button>
              ))}
            </div>
          </div>
          <IonTextarea
            label="범위 좌표"
            labelPlacement="stacked"
            rows={6}
            value={rangeText}
            onIonInput={(event) => setRangeText(String(event.detail.value ?? ""))}
          />
          <div className="admin-zone-editor-actions">
            <IonButton onClick={saveSelectedRange}>범위 저장</IonButton>
            <IonButton fill="outline" onClick={resetSelectedRange}>기본값 복원</IonButton>
            {rangeMessage && <IonChip color={rangeMessage.includes("필요") ? "warning" : "success"}>{rangeMessage}</IonChip>}
          </div>
        </div>
      )}
    </section>
  );
}

type DriverZoneWithDeliveries = (typeof driverZoneDefinitions)[number] & {
  deliveries: Array<{ delivery: Delivery; index: number; zoneName: string }>;
};

function ZoneRangeCanvas({
  message,
  onSelectZone,
  selectedZone,
  zones,
}: {
  message?: string;
  onSelectZone: (zone: string) => void;
  selectedZone: string;
  zones: DriverZoneWithDeliveries[];
}) {
  return (
    <div className="zone-canvas">
      <svg aria-hidden="true" className="zone-canvas-polygons" preserveAspectRatio="none" viewBox="0 0 100 100">
        {zones.map((zone) => (
          <polygon
            className={selectedZone === zone.name ? "active" : ""}
            fill={zone.color}
            key={zone.name}
            onClick={() => onSelectZone(zone.name)}
            points={zoneCanvasPolygonPoints(zone, zones)}
            stroke={zone.color}
          />
        ))}
      </svg>
      {message && <div className="zone-canvas-notice">{message}</div>}
      {zones.map((zone) => (
        <button
          className={`zone-shape ${zone.className} ${selectedZone === zone.name ? "active" : ""}`}
          key={zone.name}
          onClick={() => onSelectZone(zone.name)}
          style={zoneCanvasPosition(zone, zones)}
          type="button"
        >
          <strong>{zone.name}</strong>
          <small>범위</small>
        </button>
      ))}
    </div>
  );
}

function zoneBounds(zones: DriverZoneWithDeliveries[]) {
  const allPoints = zones.flatMap((item) => item.points);
  const minLat = Math.min(...allPoints.map(([lat]) => lat));
  const maxLat = Math.max(...allPoints.map(([lat]) => lat));
  const minLng = Math.min(...allPoints.map(([, lng]) => lng));
  const maxLng = Math.max(...allPoints.map(([, lng]) => lng));

  return { maxLat, maxLng, minLat, minLng };
}

function zonePointToCanvas([lat, lng]: number[], zones: DriverZoneWithDeliveries[]) {
  const { maxLat, maxLng, minLat, minLng } = zoneBounds(zones);
  const x = ((lng - minLng) / Math.max(0.0001, maxLng - minLng)) * 90 + 5;
  const y = ((maxLat - lat) / Math.max(0.0001, maxLat - minLat)) * 84 + 8;

  return `${Math.max(2, Math.min(98, x)).toFixed(2)},${Math.max(2, Math.min(98, y)).toFixed(2)}`;
}

function zoneCanvasPolygonPoints(zone: DriverZoneWithDeliveries, zones: DriverZoneWithDeliveries[]) {
  return zone.points.map((point) => zonePointToCanvas(point, zones)).join(" ");
}

function zoneCenter(points: number[][]) {
  const sums = points.reduce(
    (acc, [lat, lng]) => ({ lat: acc.lat + lat, lng: acc.lng + lng }),
    { lat: 0, lng: 0 },
  );
  return [sums.lat / points.length, sums.lng / points.length];
}

function zoneCanvasPosition(zone: DriverZoneWithDeliveries, zones: DriverZoneWithDeliveries[]) {
  const { maxLat, maxLng, minLat, minLng } = zoneBounds(zones);
  const [lat, lng] = zoneCenter(zone.points);
  const left = ((lng - minLng) / Math.max(0.0001, maxLng - minLng)) * 72 + 10;
  const top = ((maxLat - lat) / Math.max(0.0001, maxLat - minLat)) * 58 + 12;

  return {
    bottom: "auto",
    left: `${Math.max(6, Math.min(82, left))}%`,
    right: "auto",
    top: `${Math.max(6, Math.min(74, top))}%`,
  };
}

function KakaoZoneRangeMap({
  appKey,
  onSelectZone,
  selectedZone,
  zones,
}: {
  appKey: string;
  onSelectZone: (zone: string) => void;
  selectedZone: string;
  zones: DriverZoneWithDeliveries[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    let canceled = false;

    loadKakaoMapSdk(appKey)
      .then(() => {
        if (canceled || !containerRef.current) return;

	        const kakao = (window as KakaoMapsWindow).kakao;
	        if (!kakao?.maps) return;
	        containerRef.current.replaceChildren();

	        const map = new kakao.maps.Map(containerRef.current, {
	          center: new kakao.maps.LatLng(37.512, 127.043),
	          level: 7,
	        });
	        const bounds = new kakao.maps.LatLngBounds();

	        zones.forEach((zone) => {
	          const path = zone.points.map(([lat, lng]) => new kakao.maps.LatLng(lat, lng));
	          path.forEach((point) => bounds.extend(point));
	          const isSelected = zone.name === selectedZone;
          const polygon = new kakao.maps.Polygon({
            fillColor: zone.color,
            fillOpacity: isSelected ? 0.34 : 0.18,
            map,
            path,
            strokeColor: zone.color,
            strokeOpacity: isSelected ? 0.96 : 0.7,
            strokeStyle: "solid",
            strokeWeight: isSelected ? 4 : 2,
          });
          const [lat, lng] = zoneCenter(zone.points);

          new kakao.maps.CustomOverlay({
            content: `<button class="kakao-zone-label ${isSelected ? "active" : ""}" type="button">${zone.name}<small>범위</small></button>`,
            map,
            position: new kakao.maps.LatLng(lat, lng),
            yAnchor: 0.5,
          });

	          kakao.maps.event.addListener(polygon, "click", () => onSelectZone(zone.name));
	        });
	        map.setBounds(bounds);

	        setMapError("");
      })
      .catch((error) => {
        if (!canceled) setMapError(error instanceof Error ? error.message : "Kakao 구역 지도를 불러오지 못했습니다.");
      });

    return () => {
      canceled = true;
    };
  }, [appKey, onSelectZone, selectedZone, zones]);

  if (mapError) {
    return (
      <ZoneRangeCanvas
        message={`${mapError} 구역 기능은 데모 지도로 계속 사용할 수 있습니다.`}
        onSelectZone={onSelectZone}
        selectedZone={selectedZone}
        zones={zones}
      />
    );
  }

  return (
    <div className="kakao-zone-map-panel">
      <div className="kakao-zone-map-container" ref={containerRef} />
      <div className="kakao-map-badge">Kakao Zone Map</div>
    </div>
  );
}

function GoogleDeliveryMap({
  deliveries,
  onSelect,
  selectedIndex,
}: {
  deliveries: Delivery[];
  onSelect: (index: number) => void;
  selectedIndex: number;
}) {
  const selected = deliveries[selectedIndex] ?? deliveries[0];

  if (!selected) {
    return (
      <div className="google-map-empty">
        <strong>배정된 배송이 없습니다.</strong>
        <span>관리자 웹에서 주문을 기사에게 배정하면 지도에 표시됩니다.</span>
      </div>
    );
  }

  return (
    <div className="google-map-wrap" aria-label="Google 지도 배송 루트">
      <iframe
        className="google-map-frame"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={googleMapsEmbedUrl(selected)}
        title="Google Maps delivery route"
      />
      <div className="google-map-shade" />
      {deliveries.map((delivery, index) => (
        <button
          aria-label={`${index + 1}번 배송지 ${delivery.customer}`}
          className={index === selectedIndex ? "google-pin selected" : "google-pin"}
          key={delivery.customer}
          onClick={() => onSelect(index)}
          style={{
            left: `${24 + index * 26}%`,
            top: `${62 - index * 18}%`,
          }}
          type="button"
        >
          <strong>{index + 1}</strong>
          <span>{delivery.customer}</span>
        </button>
      ))}
      <div className="google-map-badge">Google Maps Demo</div>
    </div>
  );
}

function googleMapsEmbedUrl(delivery: Delivery) {
  const query = encodeURIComponent(`${delivery.lat},${delivery.lng}`);
  return `https://www.google.com/maps?q=${query}&z=13&output=embed`;
}

function AdminArea() {
  const [loggedIn, setLoggedIn] = useState(() => readAdminSession());
  const [tab, setTab] = useState<AdminTab>("overview");
  const [apiStatus, setApiStatus] = useState("데모 데이터");
  const [dispatchDeliveries, setDispatchDeliveries] = useState(() => readDispatchDeliveries());
  const [driverProfiles, setDriverProfiles] = useState(() => readDriverProfiles());
  const [deliveryZones, setDeliveryZones] = useState(() => readDeliveryZones());
  const [springZones, setSpringZones] = useState<SpringZone[]>([]);
  const [adminProducts, setAdminProducts] = useState<SpringAdminProduct[]>([]);
  const [naverOrders, setNaverOrders] = useState<SpringNaverOrder[]>([]);
  const [adminAccounts, setAdminAccounts] = useState<SpringAdminAccount[]>([]);
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [selectedAdminListDeliveryId, setSelectedAdminListDeliveryId] = useState<string | null>(null);
  const [zoneAssignments, setZoneAssignments] = useState(() => readZoneAssignments());
  const approvedDrivers = driverProfiles.filter((driver) => driver.status === "승인 완료");
  const unassignedDeliveries = dispatchDeliveries.filter((delivery) => !delivery.assignedDriver);
  const assignedDeliveries = dispatchDeliveries.filter((delivery) => delivery.assignedDriver);
  const nextAddressCheck = dispatchDeliveries.find((delivery) => !delivery.addressConfirmed);
  const nextOrderPrepare = dispatchDeliveries.find((delivery) => delivery.addressConfirmed && !delivery.orderPrepared);
  const nextDispatch = dispatchDeliveries.find((delivery) => delivery.orderPrepared && !delivery.assignedDriver);
  const nextBagCollect = dispatchDeliveries.find((delivery) => delivery.bagCount > 0 && !delivery.bagCollected);

  useEffect(() => {
    const syncDispatchDeliveries = () => setDispatchDeliveries(readDispatchDeliveries());
    const syncDriverProfiles = () => setDriverProfiles(readDriverProfiles());
    const syncDeliveryZones = () => setDeliveryZones(readDeliveryZones());
    const syncZoneAssignments = () => setZoneAssignments(readZoneAssignments());

    window.addEventListener("storage", syncDispatchDeliveries);
    window.addEventListener("salad-dispatch-updated", syncDispatchDeliveries);
    window.addEventListener("salad-drivers-updated", syncDriverProfiles);
    window.addEventListener("salad-zone-list-updated", syncDeliveryZones);
    window.addEventListener("salad-zone-updated", syncZoneAssignments);
    return () => {
      window.removeEventListener("storage", syncDispatchDeliveries);
      window.removeEventListener("salad-dispatch-updated", syncDispatchDeliveries);
      window.removeEventListener("salad-drivers-updated", syncDriverProfiles);
      window.removeEventListener("salad-zone-list-updated", syncDeliveryZones);
      window.removeEventListener("salad-zone-updated", syncZoneAssignments);
    };
  }, []);

  function refreshSpringData() {
    setApiStatus("Spring API 연결 확인중");
    Promise.all([loadSpringSnapshot(), loadSpringAdminResources()])
      .then(([snapshot, adminResources]) => {
        applySpringSnapshot(snapshot, setDispatchDeliveries, setDriverProfiles, setDeliveryZones, setZoneAssignments);
        setSpringZones(snapshot.zones);
        setAdminProducts(adminResources.products);
        setNaverOrders(adminResources.naverOrders);
        setAdminAccounts(adminResources.adminAccounts);
        setApiStatus("Spring API 연결됨");
      })
      .catch(() => {
        setApiStatus("데모 데이터 사용중");
      });
  }

  function logoutAdmin() {
    clearStoredSession(ADMIN_SESSION_STORAGE_KEY);
    setLoggedIn(false);
    setSearchTerm("");
    setApiStatus("로그아웃됨");
  }

  useEffect(() => {
    if (loggedIn) refreshSpringData();
  }, [loggedIn]);

  function updateDispatchDeliveries(nextDeliveries: Delivery[]) {
    setDispatchDeliveries(nextDeliveries);
    saveDispatchDeliveries(nextDeliveries);
  }

  function assignDelivery(deliveryId: string, driverName: string) {
    const targetDelivery = dispatchDeliveries.find((delivery) => delivery.id === deliveryId);
    const targetDriver = driverProfiles.find((driver) => driver.name === driverName);
    updateDispatchDeliveries(
      dispatchDeliveries.map((delivery) =>
        delivery.id === deliveryId
          ? { ...delivery, assignedDriver: driverName, driverId: targetDriver?.id ?? delivery.driverId ?? null }
          : delivery,
      ),
    );
    if (isUuid(deliveryId) && isUuid(targetDriver?.id)) {
      assignSpringDelivery(deliveryId, {
        driverId: targetDriver?.id ?? null,
        zoneId: targetDelivery?.zoneId ?? targetDriver?.zoneId ?? null,
        routeOrder: null,
      }).then(refreshSpringData).catch(() => setApiStatus("API 저장 실패 · 데모 반영"));
    }
  }

  function unassignDelivery(deliveryId: string) {
    updateDispatchDeliveries(
      dispatchDeliveries.map((delivery) =>
        delivery.id === deliveryId ? { ...delivery, assignedDriver: null, driverId: null, done: false } : delivery,
      ),
    );
    if (isUuid(deliveryId)) {
      assignSpringDelivery(deliveryId, { driverId: null, routeOrder: null, zoneId: null })
        .then(refreshSpringData)
        .catch(() => setApiStatus("API 저장 실패 · 데모 반영"));
    }
  }

  function resetDispatchDemo() {
    updateDispatchDeliveries(initialDeliveries);
    updateDriverProfiles(initialDriverProfiles);
    updateDeliveryZones(initialDeliveryZones);
    updateZoneAssignments(initialZoneAssignments);
  }

  function updateDeliveryZones(nextZones: string[]) {
    setDeliveryZones(nextZones);
    saveDeliveryZones(nextZones);
  }

  function updateDriverProfiles(nextProfiles: DriverProfile[]) {
    setDriverProfiles(nextProfiles);
    saveDriverProfiles(nextProfiles);
  }

  function updateDriverStatus(driverName: string, status: DriverProfile["status"]) {
    const targetDriver = driverProfiles.find((driver) => driver.name === driverName);
    updateDriverProfiles(
      driverProfiles.map((driver) => (driver.name === driverName ? { ...driver, status } : driver)),
    );
    const targetDriverId = targetDriver?.id;
    if (isUuid(targetDriverId)) {
      updateSpringDriver(targetDriverId ?? "", {
        approvalStatus: status === "승인 완료" ? "APPROVED" : status === "보류" ? "REJECTED" : "PENDING",
        isActive: status === "승인 완료",
      }).then(refreshSpringData).catch(() => setApiStatus("API 저장 실패 · 데모 반영"));
    }
  }

  function updateZoneAssignments(nextAssignments: ZoneAssignment) {
    setZoneAssignments(nextAssignments);
    saveZoneAssignments(nextAssignments);
  }

  function createRegionZones(zoneNames: string[], ranges: ZoneRangeConfig, regionName: string) {
    const missingZoneNames = zoneNames.filter((zoneName) => !deliveryZones.includes(zoneName));
    if (missingZoneNames.length === 0) {
      saveZoneRanges({ ...readZoneRanges(), ...ranges });
      setApiStatus(`${regionName} 구역이 이미 등록되어 있습니다.`);
      return;
    }

    const nextZones = Array.from(new Set([...deliveryZones, ...zoneNames]));
    const nextAssignments = { ...zoneAssignments };
    missingZoneNames.forEach((zoneName, index) => {
      if (!nextAssignments[zoneName]) {
        nextAssignments[zoneName] = approvedDrivers[index % Math.max(approvedDrivers.length, 1)]?.name ?? "";
      }
    });

    updateDeliveryZones(nextZones);
    updateZoneAssignments(nextAssignments);
    saveZoneRanges({ ...readZoneRanges(), ...ranges });
    setApiStatus(`${regionName} 지역 구역을 생성했습니다.`);

    Promise.all(
      missingZoneNames
        .filter((zoneName) => !springZones.some((zone) => zone.zoneName === zoneName))
        .map((zoneName) =>
          createSpringZone({
            zoneName,
            description: `${regionName} 지역 세부 배송 구역`,
          }),
        ),
    )
      .then(() => refreshSpringData())
      .catch(() => setApiStatus(`${regionName} 구역 데모 반영 · API 저장은 나중에 다시 시도하세요.`));
  }

  function assignZoneDriver(zone: string, driverName: string) {
    const targetDriver = driverProfiles.find((driver) => driver.name === driverName);
    const targetZone = springZones.find((item) => item.zoneName === zone);
    updateZoneAssignments({ ...zoneAssignments, [zone]: driverName });
    updateDriverProfiles(
      driverProfiles.map((driver) =>
        driver.name === driverName ? { ...driver, zone, zoneId: targetZone?.id ?? driver.zoneId } : driver,
      ),
    );
    if (isUuid(targetDriver?.id) && isUuid(targetZone?.id)) {
      updateSpringDriver(targetDriver?.id ?? "", { zoneId: targetZone?.id ?? null })
        .then(refreshSpringData)
        .catch(() => setApiStatus("API 저장 실패 · 구역 담당 데모 반영"));
    }
  }

  async function addDeliveryZone() {
    const zone = newZoneName.trim() || `신규구역 ${deliveryZones.length + 1}`;
    if (!zone || deliveryZones.includes(zone)) return;

    updateDeliveryZones([...deliveryZones, zone]);
    updateZoneAssignments({ ...zoneAssignments, [zone]: approvedDrivers[0]?.name ?? "" });
    setNewZoneName("");
    try {
      const createdZone = await createSpringZone({
        zoneName: zone,
        description: "관리자 웹에서 추가한 배송 구역",
      });
      const firstDriver = approvedDrivers[0];
      if (firstDriver?.id && isUuid(firstDriver.id)) {
        await updateSpringDriver(firstDriver.id, { zoneId: createdZone.id });
      }
      refreshSpringData();
    } catch {
      setApiStatus("API 저장 실패 · 구역 데모 반영");
    }
  }

  function removeDeliveryZone(zone: string) {
    if (dispatchDeliveries.some((delivery) => delivery.zone === zone)) return;

    const { [zone]: _removed, ...nextAssignments } = zoneAssignments;
    updateDeliveryZones(deliveryZones.filter((item) => item !== zone));
    updateZoneAssignments(nextAssignments);
  }

  function autoAssignDelivery(deliveryId: string) {
    const delivery = dispatchDeliveries.find((item) => item.id === deliveryId);
    if (!delivery) return;

    const zoneDriverName = zoneAssignments[delivery.zone];
    const zoneDriver = approvedDrivers.find((driver) => driver.name === zoneDriverName);
    assignDelivery(deliveryId, zoneDriver?.name ?? approvedDrivers[0].name);
  }

  function processNextTask() {
    if (nextAddressCheck) {
      updateDelivery(nextAddressCheck.id, { addressConfirmed: true });
      return;
    }
    if (nextOrderPrepare) {
      updateDelivery(nextOrderPrepare.id, { orderPrepared: true });
      return;
    }
    if (nextDispatch) {
      autoAssignDelivery(nextDispatch.id);
      return;
    }
    if (nextBagCollect) {
      updateDelivery(nextBagCollect.id, { bagCollected: true });
    }
  }

  function updateDelivery(deliveryId: string, patch: Partial<Delivery>) {
    updateDispatchDeliveries(
      dispatchDeliveries.map((delivery) => (delivery.id === deliveryId ? { ...delivery, ...patch } : delivery)),
    );
    if (
      isUuid(deliveryId) &&
      (patch.addressConfirmed !== undefined || patch.orderPrepared !== undefined)
    ) {
      updateSpringAdminOrder(deliveryId, {
        addressConfirmed: patch.addressConfirmed,
        orderPrepared: patch.orderPrepared,
      })
        .then(refreshSpringData)
        .catch(() => setApiStatus("API 저장 실패 · 데모 반영"));
    } else if (isUuid(deliveryId) && patch.done) {
      const current = dispatchDeliveries.find((delivery) => delivery.id === deliveryId);
      completeSpringDelivery(deliveryId, patch.bagCollected ?? current?.bagCollected ?? false)
        .then(refreshSpringData)
        .catch(() => setApiStatus("API 저장 실패 · 데모 반영"));
    } else if (isUuid(deliveryId) && patch.bagCollected !== undefined) {
      updateSpringDeliveryBag(deliveryId, patch.bagCollected)
        .then(refreshSpringData)
        .catch(() => setApiStatus("API 저장 실패 · 데모 반영"));
    }
  }

  function updateCustomer(customerName: string, patch: Partial<Delivery>) {
    updateDispatchDeliveries(
      dispatchDeliveries.map((delivery) => (delivery.customer === customerName ? { ...delivery, ...patch } : delivery)),
    );
    if (patch.addressConfirmed !== undefined) {
      const targetIds = dispatchDeliveries
        .filter((delivery) => delivery.customer === customerName && isUuid(delivery.id))
        .map((delivery) => delivery.id);
      if (targetIds.length > 0) {
        Promise.all(
          targetIds.map((deliveryId) =>
            updateSpringAdminOrder(deliveryId, { addressConfirmed: patch.addressConfirmed }),
          ),
        )
          .then(refreshSpringData)
          .catch(() => setApiStatus("API 저장 실패 · 데모 반영"));
      }
    }
  }

  async function addAdminProduct() {
    const nextNumber = adminProducts.length + 1;
    try {
      await createSpringAdminProduct({
        name: `시즌 샐러드 ${nextNumber}`,
        price: 9900,
        status: "ACTIVE",
        description: "관리자 웹에서 추가한 상품",
        displayOrder: nextNumber + 10,
        visible: true,
      });
      refreshSpringData();
    } catch {
      setApiStatus("API 저장 실패 · 상품 등록 실패");
    }
  }

  async function toggleFirstProductStatus() {
    const product = adminProducts[0];
    if (!product) return;

    try {
      await updateSpringAdminProduct(product.id, {
        name: product.name,
        price: product.price,
        status: product.status === "ACTIVE" ? "SOLD_OUT" : "ACTIVE",
        description: product.description,
        displayOrder: product.displayOrder,
        visible: product.visible,
      });
      refreshSpringData();
    } catch {
      setApiStatus("API 저장 실패 · 상품 상태 변경 실패");
    }
  }

  async function addNaverOrder() {
    const timestamp = Date.now().toString().slice(-6);
    try {
      await createSpringNaverOrder({
        naverOrderNo: `N-${timestamp}`,
        customerName: "신규 네이버 고객",
        phone: "010-0000-0000",
        address: "서울특별시 강남구 테헤란로 100",
        status: "NEEDS_CONFIRMATION",
        deliveryDate: new Date().toISOString().slice(0, 10),
      });
      refreshSpringData();
    } catch {
      setApiStatus("API 저장 실패 · 네이버 주문 등록 실패");
    }
  }

  async function linkNextNaverOrder() {
    const order = naverOrders.find((item) => item.status === "NEEDS_CONFIRMATION") ?? naverOrders[0];
    if (!order) return;

    try {
      await updateSpringNaverOrder(order.id, {
        naverOrderNo: order.naverOrderNo,
        customerName: order.customerName,
        phone: order.phone,
        address: order.address,
        status: order.status === "RESERVED" ? "LINKED" : "RESERVED",
        deliveryDate: order.deliveryDate,
      });
      refreshSpringData();
    } catch {
      setApiStatus("API 저장 실패 · 네이버 주문 변경 실패");
    }
  }

  async function inviteAdminAccount() {
    const timestamp = Date.now().toString().slice(-6);
    try {
      await createSpringAdminAccount({
        name: `운영자 ${adminAccounts.length + 1}`,
        email: `admin${timestamp}@salad.test`,
        password: temporaryRegistrationPassword("admin"),
        phone: "010-0000-0000",
      });
      refreshSpringData();
    } catch {
      setApiStatus("API 저장 실패 · 관리자 초대 실패");
    }
  }

  function futureDate(offsetDays: number) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().slice(0, 10);
  }

  function temporaryRegistrationPassword(prefix: string) {
    return `${prefix}-${Date.now().toString(36)}-Aa1!`;
  }

  async function registerCustomerWithSubscription() {
    const zoneId = springZones[0]?.id;
    if (!zoneId) {
      setApiStatus("구역 API 데이터가 필요합니다.");
      return null;
    }
    const timestamp = Date.now().toString().slice(-6);
    try {
      const registration = await createSpringManualCustomer({
        name: `신규고객 ${dispatchDeliveries.length + 1}`,
        phone: `010-${timestamp.slice(0, 2).padEnd(4, "0")}-${timestamp.slice(-4)}`,
        email: `customer${timestamp}@salad.test`,
        password: temporaryRegistrationPassword("customer"),
        birthdate: "1990-01-01",
        address: "서울특별시 강남구 테헤란로 100",
        zoneId,
        orderSource: "APP",
        totalCount: 10,
        unitPrice: 8900,
        startDate: new Date().toISOString().slice(0, 10),
      });
      refreshSpringData();
      return registration;
    } catch {
      setApiStatus("API 저장 실패 · 고객 등록 실패");
      return null;
    }
  }

  async function registerOrderDelivery() {
    const registration = await registerCustomerWithSubscription();
    if (!registration) return;
    try {
      await createSpringDelivery({
        subscriptionId: registration.subscriptionId,
        deliveryDate: futureDate(dispatchDeliveries.length + 1),
      });
      refreshSpringData();
    } catch {
      setApiStatus("API 저장 실패 · 배송 예약 실패");
    }
  }

  async function registerDriverProfile() {
    const timestamp = Date.now().toString().slice(-6);
    try {
      await createSpringDriver({
        name: `신규기사 ${driverProfiles.length + 1}`,
        password: temporaryRegistrationPassword("driver"),
        phone: `010-8${timestamp.slice(0, 3)}-${timestamp.slice(-4)}`,
        zoneId: springZones[0]?.id ?? null,
        vehicleNumber: `${String(driverProfiles.length + 21).padStart(2, "0")}가${timestamp.slice(-4)}`,
      });
      refreshSpringData();
    } catch {
      setApiStatus("API 저장 실패 · 기사 등록 실패");
    }
  }

  function handleNewRegistration() {
    if (tab === "overview") {
      processNextTask();
      return;
    }
    if (tab === "customers") {
      registerCustomerWithSubscription();
      return;
    }
    if (tab === "orders") {
      registerOrderDelivery();
      return;
    }
    if (tab === "dispatch") {
      addDeliveryZone();
      return;
    }
    if (tab === "drivers") {
      registerDriverProfile();
      return;
    }
    if (tab === "bags") {
      setTab("orders");
      return;
    }
    if (tab === "products") {
      addAdminProduct();
      return;
    }
    if (tab === "naver") {
      addNaverOrder();
      return;
    }
    if (tab === "admins") {
      inviteAdminAccount();
    }
  }

  function primaryActionLabel() {
    if (tab === "overview") return "다음 할 일";
    if (tab === "customers") return "+ 고객 등록";
    if (tab === "orders") return "+ 주문 등록";
    if (tab === "dispatch") return "+ 구역 등록";
    if (tab === "drivers") return "+ 기사 등록";
    if (tab === "bags") return "주문 등록으로 이동";
    if (tab === "products") return "+ 상품 등록";
    if (tab === "naver") return "+ 네이버 주문";
    if (tab === "admins") return "+ 관리자 초대";
    return "+ 신규등록";
  }

  const content = useMemo(() => {
    if (tab === "orders") {
      return {
        title: "주문/정기배송 관리",
        subtitle: "배송일, 상품, 수량, 고객 요청사항을 확인하고 배송 준비 상태로 전환합니다.",
        metrics: [
          ["오늘 주문", `${dispatchDeliveries.length}건`],
          ["준비 완료", `${dispatchDeliveries.filter((delivery) => delivery.orderPrepared).length}건`],
          ["주소 확인", `${dispatchDeliveries.filter((delivery) => !delivery.addressConfirmed).length}건`],
          ["배송 완료", `${dispatchDeliveries.filter((delivery) => delivery.done).length}건`],
        ],
        rows: dispatchDeliveries.map((delivery) => [
          delivery.orderNo,
          `${delivery.customer} · ${delivery.zone} · ${delivery.address}`,
          orderStatus(delivery),
        ]),
        actions: ["주문 생성", "배송일 변경", "상품/수량 수정", "요청사항 확인"],
      };
    }
    if (tab === "dispatch") {
      return {
        title: "배송 배정",
        subtitle: "주문을 기사에게 배정하고 구역별 배송 순서를 관리합니다.",
        metrics: [
          ["미배정", `${unassignedDeliveries.length}건`],
          ["배정 완료", `${assignedDeliveries.length}건`],
          ["승인 기사", `${approvedDrivers.length}명`],
          ["구역 지정", `${deliveryZones.length}개`],
        ],
        rows: assignedDeliveries.length
          ? assignedDeliveries.map((delivery) => [
              delivery.customer,
              `${delivery.orderNo} · ${delivery.zone} · ${delivery.assignedDriver} 기사`,
              delivery.done ? "배송 완료" : "배정 완료",
              delivery.id,
            ])
          : [["배정 대기", "미배정 주문을 기사에게 배정해주세요.", "대기"]],
        actions: ["미배정 주문 확인", "기사에게 배정", "배정 취소", "데모 초기화"],
      };
    }
    if (tab === "customers") {
      return {
        title: "고객 관리",
        subtitle: "고객 가입 정보, 배송 주소, 정기배송 상태를 웹에서 관리합니다.",
        metrics: [
          ["전체 고객", `${dispatchDeliveries.length}명`],
          ["활성", `${dispatchDeliveries.filter((delivery) => delivery.customerActive).length}명`],
          ["주소 확인", `${dispatchDeliveries.filter((delivery) => !delivery.addressConfirmed).length}명`],
          ["중지", `${dispatchDeliveries.filter((delivery) => !delivery.customerActive).length}명`],
        ],
        rows: dispatchDeliveries.map((delivery) => [
          delivery.customer,
          `${delivery.phone} · ${delivery.address} · ${delivery.email}`,
          customerStatus(delivery),
        ]),
        actions: ["고객 추가", "주소/전화번호 수정", "정기배송 상태 변경", "배송 요청사항 관리"],
      };
    }
    if (tab === "drivers") {
      return {
        title: "기사 승인/관리",
        subtitle: "기사 가입 신청을 승인하고 담당 구역, 출근 상태, 배송 권한을 관리합니다.",
        metrics: [
          ["전체 기사", `${driverProfiles.length}명`],
          ["승인 완료", `${approvedDrivers.length}명`],
          ["승인 대기", `${driverProfiles.filter((driver) => driver.status === "승인 대기").length}명`],
          ["보류", `${driverProfiles.filter((driver) => driver.status === "보류").length}명`],
        ],
        rows: driverProfiles.map((driver) => [
          driver.name,
          `${driver.zone} · ${driver.phone} · 배정 ${dispatchDeliveries.filter((delivery) => delivery.assignedDriver === driver.name).length}건`,
          driver.status,
        ]),
        actions: ["기사 승인", "승인 보류", "담당 구역 배정", "출근/퇴근 기록 확인"],
      };
    }
    if (tab === "bags") {
      return {
        title: "보냉백 회수 관리",
        subtitle: "고객별 보냉백 회수 필요 수량과 기사 회수 처리 상태를 확인합니다.",
        metrics: [
          ["회수 필요", `${dispatchDeliveries.reduce((sum, delivery) => sum + (delivery.bagCollected ? 0 : delivery.bagCount), 0)}개`],
          ["회수 완료", `${dispatchDeliveries.reduce((sum, delivery) => sum + (delivery.bagCollected ? delivery.bagCount : 0), 0)}개`],
          ["미회수 고객", `${dispatchDeliveries.filter((delivery) => delivery.bagCount > 0 && !delivery.bagCollected).length}명`],
          ["회수 없음", `${dispatchDeliveries.filter((delivery) => delivery.bagCount === 0).length}건`],
        ],
        rows: dispatchDeliveries.map((delivery) => [
          delivery.customer,
          `${delivery.bagCount}개 · ${delivery.assignedDriver ?? "미배정"} 기사 · ${delivery.address}`,
          bagStatus(delivery),
        ]),
        actions: ["회수 완료 처리", "미회수 사유 등록", "고객별 수량 수정", "기사 회수 현황"],
      };
    }
    if (tab === "products") {
      return {
        title: "상품 관리",
        subtitle: "샐러드 메뉴, 판매 상태, 기본 가격과 노출 여부를 관리합니다. 결제 기능은 제외합니다.",
        metrics: [
          ["전체", `${adminProducts.length}개`],
          ["판매중", `${adminProducts.filter((product) => product.status === "ACTIVE").length}개`],
          ["품절", `${adminProducts.filter((product) => product.status === "SOLD_OUT").length}개`],
          ["숨김", `${adminProducts.filter((product) => product.status === "HIDDEN" || !product.visible).length}개`],
        ],
        rows: adminProducts.length
          ? adminProducts.map((product) => [
              product.name,
              `${product.price.toLocaleString()}원 · ${product.description ?? "설명 없음"}`,
              productStatusLabel(product.status),
            ])
          : [["상품 없음", "상품 API 데이터를 불러오면 표시됩니다.", "대기"]],
        actions: ["상품 추가", "판매 상태 변경", "가격 수정", "앱 노출 순서 변경"],
      };
    }
    if (tab === "admins") {
      return {
        title: "관리자 관리",
        subtitle: "운영자 계정 권한과 접근 범위를 웹에서 관리합니다.",
        metrics: [
          ["운영자", `${adminAccounts.length}명`],
          ["로그인 가능", `${adminAccounts.filter((account) => account.email).length}명`],
          ["최근 추가", adminAccounts[0]?.name ?? "없음"],
          ["권한 그룹", "운영자"],
        ],
        rows: adminAccounts.length
          ? adminAccounts.map((account) => [
              account.name,
              `${account.email ?? "이메일 없음"} · ${account.phone}`,
              "활성",
            ])
          : [["관리자 없음", "관리자 API 데이터를 불러오면 표시됩니다.", "대기"]],
        actions: ["관리자 초대", "권한 수정", "접근 로그 확인", "계정 비활성화"],
      };
    }
    if (tab === "naver") {
      return {
        title: "네이버 주문",
        subtitle: "네이버 주문을 고객 계정과 연결하고 배송 예약으로 전환합니다.",
        metrics: [
          ["수집 주문", `${naverOrders.length}건`],
          ["연결 완료", `${naverOrders.filter((order) => order.status === "LINKED").length}건`],
          ["확인 필요", `${naverOrders.filter((order) => order.status === "NEEDS_CONFIRMATION").length}건`],
          ["예약 전환", `${naverOrders.filter((order) => order.status === "RESERVED").length}건`],
        ],
        rows: naverOrders.length
          ? naverOrders.map((order) => [
              order.naverOrderNo,
              `${order.customerName} · ${order.phone} · ${order.address}`,
              naverStatusLabel(order.status),
            ])
          : [["네이버 주문 없음", "네이버 주문 API 데이터를 불러오면 표시됩니다.", "대기"]],
        actions: ["네이버 주문 가져오기", "고객 계정 연결", "배송 예약 생성", "주소/전화번호 확인"],
      };
    }
    return {
      title: "운영 현황",
      subtitle: "오늘은 아래 순서대로만 처리하면 됩니다.",
      metrics: [
        ["주소 확인", `${dispatchDeliveries.filter((delivery) => !delivery.addressConfirmed).length}건`],
        ["주문 준비", `${dispatchDeliveries.filter((delivery) => delivery.addressConfirmed && !delivery.orderPrepared).length}건`],
        ["배송 배정", `${dispatchDeliveries.filter((delivery) => delivery.orderPrepared && !delivery.assignedDriver).length}건`],
        ["보냉백 회수", `${dispatchDeliveries.filter((delivery) => delivery.bagCount > 0 && !delivery.bagCollected).length}건`],
      ],
      rows: [
        ["1. 고객 확인", nextAddressCheck ? `${nextAddressCheck.customer} 주소를 확인하세요.` : "모든 주소 확인 완료", nextAddressCheck ? "확인 필요" : "완료"],
        ["2. 주문 준비", nextOrderPrepare ? `${nextOrderPrepare.orderNo} 준비가 필요합니다.` : "준비 가능한 주문 완료", nextOrderPrepare ? "대기" : "완료"],
        ["3. 배송 배정", nextDispatch ? `${nextDispatch.customer} 주문을 기사에게 배정하세요.` : "배정 가능한 주문 완료", nextDispatch ? "대기" : "완료"],
        ["4. 보냉백", nextBagCollect ? `${nextBagCollect.customer} 보냉백 회수가 필요합니다.` : "보냉백 확인 완료", nextBagCollect ? "회수 필요" : "완료"],
      ],
      actions: ["다음 할 일 처리", "상세 관리 보기", "데모 초기화"],
    };
  }, [adminAccounts, adminProducts, assignedDeliveries, dispatchDeliveries, naverOrders, nextAddressCheck, nextBagCollect, nextDispatch, nextOrderPrepare, tab, unassignedDeliveries, zoneAssignments]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return content.rows.filter(([title, description, status]) => {
      const matchesSearch = !normalizedSearch || `${title} ${description} ${status}`.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "전체" ||
        status.includes(statusFilter) ||
        (statusFilter === "대기" && (status.includes("대기") || status.includes("확인"))) ||
        (statusFilter === "완료" && (status.includes("완료") || status.includes("활성") || status.includes("판매중") || status.includes("연결 완료")));
      return matchesSearch && matchesStatus;
    });
  }, [content.rows, searchTerm, statusFilter]);

  const selectedAdminListDelivery =
    tab === "dispatch"
      ? dispatchDeliveries.find((delivery) => delivery.id === selectedAdminListDeliveryId) ?? null
      : null;

  useEffect(() => {
    if (tab !== "dispatch") {
      setSelectedAdminListDeliveryId(null);
    }
  }, [tab]);

  if (!loggedIn) {
    return <AdminLogin onLogin={(email) => {
      saveAdminSession(email);
      setLoggedIn(true);
    }} />;
  }

  return (
    <div className={menuCollapsed ? "admin-console-shell sidebar-collapsed" : "admin-console-shell"}>
      <AdminConsoleSidebar
        collapsed={menuCollapsed}
        current={tab}
        onChange={setTab}
        onToggle={() => setMenuCollapsed((collapsed) => !collapsed)}
      />
      <main className="admin-console-main">
        <AdminConsoleTopBar
          apiStatus={apiStatus}
          currentTitle={content.title}
          onLogout={logoutAdmin}
          onSearchTermChange={setSearchTerm}
          searchTerm={searchTerm}
        />
        <div className="admin-module-bar">
          <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")} type="button">셀러드 운영</button>
          <button className={tab === "customers" || tab === "orders" ? "active" : ""} onClick={() => setTab("orders")} type="button">고객/주문</button>
          <button className={tab === "dispatch" || tab === "drivers" || tab === "bags" ? "active" : ""} onClick={() => setTab("dispatch")} type="button">배송관리</button>
        </div>
        <section className="admin-page-panel">
          <div className="admin-breadcrumb">
            <IonIcon icon={homeOutline} />
            <span>관리자 웹</span>
            <span>{content.title}</span>
          </div>
          <div className="admin-page-head">
            <div>
              <h1>{content.title}</h1>
              <p>{content.subtitle}</p>
            </div>
            <IonButton onClick={handleNewRegistration}>
              {primaryActionLabel()}
            </IonButton>
          </div>
          <AdminFilterPanel
            onSearchTermChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            tab={tab}
          />
          <AdminListPanel
            onDetail={(row) => {
              const deliveryId = row[3];
              if (tab === "dispatch" && deliveryId) {
                setSelectedAdminListDeliveryId((current) => (current === deliveryId ? null : deliveryId));
              }
            }}
            detailDelivery={selectedAdminListDelivery}
            detailDrivers={approvedDrivers}
            onAssignDelivery={assignDelivery}
            onAutoAssignDelivery={autoAssignDelivery}
            onUnassignDelivery={unassignDelivery}
            rows={filteredRows}
            selectedDetailId={selectedAdminListDeliveryId}
            totalCount={content.rows.length}
          />
        <div className="admin-kpis">
          {content.metrics.map(([label, value]) => (
            <div className="admin-kpi" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <IonGrid className="admin-layout">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{content.title}</IonCardTitle>
              <IonCardSubtitle>{content.subtitle}</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              {tab === "overview" ? (
                <AdminSimpleWorkflow
                  deliveries={dispatchDeliveries}
                  nextAddressCheck={nextAddressCheck}
                  nextBagCollect={nextBagCollect}
                  nextDispatch={nextDispatch}
                  nextOrderPrepare={nextOrderPrepare}
                  onAutoAssign={autoAssignDelivery}
                  onUpdateDelivery={updateDelivery}
                />
              ) : tab === "dispatch" ? (
                <DispatchManagement
                  assignedDeliveries={assignedDeliveries}
                  deliveryZones={deliveryZones}
                  drivers={approvedDrivers}
                  newZoneName={newZoneName}
                  onAddZone={addDeliveryZone}
                  onAssign={assignDelivery}
                  onAutoAssign={autoAssignDelivery}
                  onCreateRegionZones={createRegionZones}
                  onNewZoneNameChange={setNewZoneName}
                  onUnassign={unassignDelivery}
                  onZoneRemove={removeDeliveryZone}
                  onZoneAssign={assignZoneDriver}
                  unassignedDeliveries={unassignedDeliveries}
                  zoneAssignments={zoneAssignments}
                />
              ) : tab === "customers" ? (
                <CustomerManagement deliveries={dispatchDeliveries} onUpdateCustomer={updateCustomer} />
              ) : tab === "orders" ? (
                <OrderManagement deliveries={dispatchDeliveries} onAutoAssign={autoAssignDelivery} onUpdateDelivery={updateDelivery} />
              ) : tab === "bags" ? (
                <BagManagement deliveries={dispatchDeliveries} onUpdateDelivery={updateDelivery} />
              ) : tab === "drivers" ? (
                <DriverApprovalManagement
                  deliveries={dispatchDeliveries}
                  drivers={driverProfiles}
                  onUpdateStatus={updateDriverStatus}
                />
              ) : (
                <IonList>
                  {content.rows.map(([first, second, third]) => (
                    <IonItem key={`${first}-${second}`}>
                      <IonIcon icon={adminRowIcon(tab)} slot="start" />
                      <IonLabel>
                        <h2>{first}</h2>
                        <p>{second}</p>
                      </IonLabel>
                      <IonBadge color={adminBadgeColor(third)}>{third}</IonBadge>
                    </IonItem>
                  ))}
                </IonList>
              )}
            </IonCardContent>
          </IonCard>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>빠른 작업</IonCardTitle>
              <IonCardSubtitle>한 번에 하나씩 처리하면 됩니다.</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="admin-actions">
                {tab === "overview" ? (
                  <>
                    <IonButton disabled={!nextAddressCheck && !nextOrderPrepare && !nextDispatch && !nextBagCollect} expand="block" onClick={processNextTask}>
                      다음 할 일 처리
                    </IonButton>
                    <IonButton expand="block" fill="outline" onClick={() => setTab("orders")}>주문 관리 보기</IonButton>
                    <IonButton expand="block" fill="outline" onClick={() => setTab("dispatch")}>배송 배정 보기</IonButton>
                    <IonButton expand="block" fill="outline" onClick={resetDispatchDemo}>데모 초기화</IonButton>
                  </>
                ) : tab === "dispatch" ? (
                  <>
                    <IonButton disabled={unassignedDeliveries.length === 0} expand="block" onClick={() => {
                      const nextDelivery = unassignedDeliveries[0];
                      if (nextDelivery) autoAssignDelivery(nextDelivery.id);
                    }}>
                      다음 주문 자동 배정
                    </IonButton>
                    <IonButton disabled={unassignedDeliveries.length === 0} expand="block" fill="outline" onClick={() => {
                      const nextDelivery = unassignedDeliveries[0];
                      const firstDriver = approvedDrivers[0];
                      if (nextDelivery && firstDriver) assignDelivery(nextDelivery.id, firstDriver.name);
                    }}>
                      첫 번째 기사에게 배정
                    </IonButton>
                    <IonButton expand="block" fill="outline" onClick={resetDispatchDemo}>
                      데모 초기화
                    </IonButton>
                  </>
                ) : tab === "customers" ? (
                  <>
                    <IonButton expand="block" onClick={() => setTab("orders")}>고객 주문 보기</IonButton>
                    <IonButton expand="block" fill="outline" onClick={() => setTab("dispatch")}>배송 배정으로 이동</IonButton>
                    <IonButton expand="block" fill="outline" onClick={resetDispatchDemo}>데모 초기화</IonButton>
                  </>
                ) : tab === "orders" ? (
                  <>
                    <IonButton expand="block" onClick={() => {
                      const target = dispatchDeliveries.find((delivery) => !delivery.orderPrepared);
                      if (target) updateDelivery(target.id, { orderPrepared: true });
                    }}>
                      다음 주문 준비 완료
                    </IonButton>
                    <IonButton expand="block" fill="outline" onClick={() => setTab("dispatch")}>배송 배정으로 이동</IonButton>
                    <IonButton expand="block" fill="outline" onClick={resetDispatchDemo}>데모 초기화</IonButton>
                  </>
                ) : tab === "bags" ? (
                  <>
                    <IonButton expand="block" onClick={() => {
                      const target = dispatchDeliveries.find((delivery) => delivery.bagCount > 0 && !delivery.bagCollected);
                      if (target) updateDelivery(target.id, { bagCollected: true });
                    }}>
                      다음 보냉백 회수 완료
                    </IonButton>
                    <IonButton expand="block" fill="outline" onClick={() => setTab("dispatch")}>배송 배정 확인</IonButton>
                    <IonButton expand="block" fill="outline" onClick={resetDispatchDemo}>데모 초기화</IonButton>
                  </>
                ) : tab === "drivers" ? (
                  <>
                    <IonButton expand="block" onClick={() => {
                      const pending = driverProfiles.find((driver) => driver.status === "승인 대기");
                      if (pending) updateDriverStatus(pending.name, "승인 완료");
                    }}>
                      다음 기사 승인
                    </IonButton>
                    <IonButton expand="block" fill="outline" onClick={() => setTab("dispatch")}>배송 배정으로 이동</IonButton>
                    <IonButton expand="block" fill="outline" onClick={resetDispatchDemo}>데모 초기화</IonButton>
                  </>
                ) : tab === "products" ? (
                  <>
                    <IonButton expand="block" onClick={addAdminProduct}>상품 추가</IonButton>
                    <IonButton disabled={adminProducts.length === 0} expand="block" fill="outline" onClick={toggleFirstProductStatus}>
                      첫 상품 판매상태 변경
                    </IonButton>
                    <IonButton expand="block" fill="outline" onClick={refreshSpringData}>상품 API 새로고침</IonButton>
                  </>
                ) : tab === "naver" ? (
                  <>
                    <IonButton expand="block" onClick={addNaverOrder}>네이버 주문 가져오기</IonButton>
                    <IonButton disabled={naverOrders.length === 0} expand="block" fill="outline" onClick={linkNextNaverOrder}>
                      다음 주문 예약 전환
                    </IonButton>
                    <IonButton expand="block" fill="outline" onClick={() => setTab("orders")}>주문 관리로 이동</IonButton>
                  </>
                ) : tab === "admins" ? (
                  <>
                    <IonButton expand="block" onClick={inviteAdminAccount}>관리자 초대</IonButton>
                    <IonButton expand="block" fill="outline" onClick={refreshSpringData}>관리자 계정 새로고침</IonButton>
                    <IonButton expand="block" fill="outline" onClick={() => setTab("overview")}>운영 현황 보기</IonButton>
                  </>
                ) : (
                  content.actions.map((action, index) => (
                    <IonButton expand="block" fill={index === 0 ? "solid" : "outline"} key={action}>
                      {action}
                    </IonButton>
                  ))
                )}
              </div>
            </IonCardContent>
          </IonCard>
        </IonGrid>
        </section>
      </main>
    </div>
  );
}

function AdminSimpleWorkflow({
  deliveries,
  nextAddressCheck,
  nextBagCollect,
  nextDispatch,
  nextOrderPrepare,
  onAutoAssign,
  onUpdateDelivery,
}: {
  deliveries: Delivery[];
  nextAddressCheck?: Delivery;
  nextBagCollect?: Delivery;
  nextDispatch?: Delivery;
  nextOrderPrepare?: Delivery;
  onAutoAssign: (deliveryId: string) => void;
  onUpdateDelivery: (deliveryId: string, patch: Partial<Delivery>) => void;
}) {
  const doneCount = deliveries.filter((delivery) => delivery.done).length;

  return (
    <div className="simple-workflow">
      <div className="simple-workflow-summary">
        <strong>오늘은 4단계만 처리하세요.</strong>
        <span>고객 확인 → 주문 준비 → 배송 배정 → 보냉백 회수</span>
        <small>배송 완료 {doneCount}건 · 전체 주문 {deliveries.length}건</small>
      </div>
      <div className="simple-steps">
        <SimpleStep
          actionLabel="주소 확인"
          description={nextAddressCheck ? `${nextAddressCheck.customer} · ${nextAddressCheck.address}` : "모든 고객 주소 확인 완료"}
          disabled={!nextAddressCheck}
          done={!nextAddressCheck}
          number="1"
          onAction={() => nextAddressCheck && onUpdateDelivery(nextAddressCheck.id, { addressConfirmed: true })}
          title="고객 주소 확인"
        />
        <SimpleStep
          actionLabel="준비 완료"
          description={nextOrderPrepare ? `${nextOrderPrepare.orderNo} · ${nextOrderPrepare.customer}` : "준비할 주문 없음"}
          disabled={!nextOrderPrepare}
          done={!nextOrderPrepare}
          number="2"
          onAction={() => nextOrderPrepare && onUpdateDelivery(nextOrderPrepare.id, { orderPrepared: true })}
          title="주문 준비"
        />
        <SimpleStep
          actionLabel="자동 배정"
          description={nextDispatch ? `${nextDispatch.customer} · ${nextDispatch.zone}` : "배정할 주문 없음"}
          disabled={!nextDispatch}
          done={!nextDispatch}
          number="3"
          onAction={() => nextDispatch && onAutoAssign(nextDispatch.id)}
          title="배송 기사 배정"
        />
        <SimpleStep
          actionLabel="회수 완료"
          description={nextBagCollect ? `${nextBagCollect.customer} · 보냉백 ${nextBagCollect.bagCount}개` : "회수할 보냉백 없음"}
          disabled={!nextBagCollect}
          done={!nextBagCollect}
          number="4"
          onAction={() => nextBagCollect && onUpdateDelivery(nextBagCollect.id, { bagCollected: true })}
          title="보냉백 회수"
        />
      </div>
    </div>
  );
}

function SimpleStep({
  actionLabel,
  description,
  disabled,
  done,
  number,
  onAction,
  title,
}: {
  actionLabel: string;
  description: string;
  disabled: boolean;
  done: boolean;
  number: string;
  onAction: () => void;
  title: string;
}) {
  return (
    <div className={done ? "simple-step done" : "simple-step"}>
      <div className="simple-step-number">{number}</div>
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <IonButton disabled={disabled} size="small" onClick={onAction}>
        {done ? "완료" : actionLabel}
      </IonButton>
    </div>
  );
}

function DispatchManagement({
  assignedDeliveries,
  deliveryZones,
  drivers,
  newZoneName,
  onAddZone,
  onAssign,
  onAutoAssign,
  onCreateRegionZones,
  onNewZoneNameChange,
  onUnassign,
  onZoneRemove,
  onZoneAssign,
  unassignedDeliveries,
  zoneAssignments,
}: {
  assignedDeliveries: Delivery[];
  deliveryZones: string[];
  drivers: DriverProfile[];
  newZoneName: string;
  onAddZone: () => void;
  onAssign: (deliveryId: string, driverName: string) => void;
  onAutoAssign: (deliveryId: string) => void;
  onCreateRegionZones: (zoneNames: string[], ranges: ZoneRangeConfig, regionName: string) => void;
  onNewZoneNameChange: (zoneName: string) => void;
  onUnassign: (deliveryId: string) => void;
  onZoneRemove: (zone: string) => void;
  onZoneAssign: (zone: string, driverName: string) => void;
  unassignedDeliveries: Delivery[];
  zoneAssignments: ZoneAssignment;
}) {
  const usedZones = new Set([...assignedDeliveries, ...unassignedDeliveries].map((delivery) => delivery.zone));
  const [showZoneSettings, setShowZoneSettings] = useState(false);
  const [showManualAssign, setShowManualAssign] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const allDeliveries = [...unassignedDeliveries, ...assignedDeliveries];
  const selectedDelivery = allDeliveries.find((delivery) => delivery.id === selectedDeliveryId) ?? allDeliveries[0];

  useEffect(() => {
    if (selectedDeliveryId && allDeliveries.some((delivery) => delivery.id === selectedDeliveryId)) return;
    setSelectedDeliveryId(allDeliveries[0]?.id ?? null);
  }, [allDeliveries, selectedDeliveryId]);

  return (
    <div className="dispatch-board">
      <AdminZoneRangeMap
        deliveries={allDeliveries}
        deliveryZones={deliveryZones}
        drivers={drivers}
        onCreateRegionZones={onCreateRegionZones}
        onSelectDelivery={setSelectedDeliveryId}
        zoneAssignments={zoneAssignments}
      />
      <section className="zone-assignment-panel">
        <div className="dispatch-section-title">
          <strong>구역별 담당 기사</strong>
          <IonButton fill="clear" size="small" onClick={() => setShowZoneSettings((visible) => !visible)}>
            {showZoneSettings ? "접기" : "설정 보기"}
          </IonButton>
        </div>
        <div className="zone-summary">
          {deliveryZones.map((zone) => (
            <span key={zone}>
              {zone}
              <strong>{zoneAssignments[zone] ?? "미지정"}</strong>
            </span>
          ))}
        </div>
        {showZoneSettings && (
          <>
            <div className="zone-add-row">
              <IonInput
                label="구역 추가"
                labelPlacement="stacked"
                placeholder="예: 여의도G"
                value={newZoneName}
                onIonInput={(event) => onNewZoneNameChange(String(event.detail.value ?? ""))}
              />
              <IonButton disabled={!newZoneName.trim()} onClick={onAddZone}>추가</IonButton>
            </div>
            <div className="zone-assignment-grid">
              {deliveryZones.map((zone) => (
                <div className="zone-assignment-row" key={zone}>
                  <div>
                    <strong>{zone}</strong>
                    <span>현재 담당: {zoneAssignments[zone] ?? "미지정"}</span>
                  </div>
                  <div>
                    {drivers.map((driver) => (
                      <IonButton
                        fill={zoneAssignments[zone] === driver.name ? "solid" : "outline"}
                        key={`${zone}-${driver.name}`}
                        size="small"
                        onClick={() => onZoneAssign(zone, driver.name)}
                      >
                        {driver.name}
                      </IonButton>
                    ))}
                    <IonButton
                      disabled={usedZones.has(zone)}
                      fill="clear"
                      size="small"
                      onClick={() => onZoneRemove(zone)}
                    >
                      삭제
                    </IonButton>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
      <section>
        <div className="dispatch-section-title">
          <strong>미배정 주문</strong>
          <div className="section-tools">
            <span>{unassignedDeliveries.length}건</span>
            <IonButton fill="clear" size="small" onClick={() => setShowManualAssign((visible) => !visible)}>
              {showManualAssign ? "수동 닫기" : "수동 배정"}
            </IonButton>
          </div>
        </div>
        <IonList>
          {unassignedDeliveries.length === 0 && (
            <IonItem>
              <IonLabel>모든 주문이 기사에게 배정되었습니다.</IonLabel>
            </IonItem>
          )}
          {unassignedDeliveries.map((delivery) => (
            <IonItem className={selectedDelivery?.id === delivery.id ? "selected-dispatch-item" : ""} key={delivery.id}>
              <IonIcon icon={clipboardOutline} slot="start" />
              <IonLabel>
                <h2>{delivery.customer}</h2>
                <p>{delivery.orderNo} · {delivery.zone} · {delivery.address}</p>
                <p>{delivery.memo}</p>
              </IonLabel>
              <div className="dispatch-buttons" slot="end">
                <IonButton fill="outline" size="small" onClick={() => setSelectedDeliveryId(delivery.id)}>상세보기</IonButton>
                <IonButton size="small" onClick={() => onAutoAssign(delivery.id)}>자동 배정</IonButton>
                {showManualAssign && drivers.map((driver) => (
                  <IonButton
                    fill={driver.zone === delivery.zone ? "solid" : "outline"}
                    key={driver.name}
                    size="small"
                    onClick={() => onAssign(delivery.id, driver.name)}
                  >
                    {driver.name}
                  </IonButton>
                ))}
              </div>
            </IonItem>
          ))}
        </IonList>
      </section>
      <section>
        <div className="dispatch-section-title">
          <strong>배정 완료</strong>
          <span>{assignedDeliveries.length}건</span>
        </div>
        <IonList>
          {assignedDeliveries.map((delivery, index) => (
            <IonItem className={selectedDelivery?.id === delivery.id ? "selected-dispatch-item" : ""} key={delivery.id}>
              <IonIcon icon={carOutline} slot="start" />
              <IonLabel>
                <h2>#{index + 1} {delivery.customer}</h2>
                <p>{delivery.assignedDriver} 기사 · {delivery.zone} · {delivery.address}</p>
                <p>{delivery.done ? "기사 앱에서 배송 완료 처리됨" : "기사 앱 배송 대기"}</p>
              </IonLabel>
              <div className="dispatch-buttons" slot="end">
                <IonBadge color={delivery.done ? "success" : "medium"}>{delivery.done ? "완료" : "배정"}</IonBadge>
                <IonButton fill="outline" size="small" onClick={() => setSelectedDeliveryId(delivery.id)}>상세보기</IonButton>
                <IonButton fill="clear" size="small" onClick={() => onUnassign(delivery.id)}>
                  배정 취소
                </IonButton>
              </div>
            </IonItem>
          ))}
        </IonList>
      </section>
      <DeliveryDetailPanel
        delivery={selectedDelivery}
        drivers={drivers}
        onAssign={onAssign}
        onAutoAssign={onAutoAssign}
        onUnassign={onUnassign}
      />
    </div>
  );
}

function DeliveryDetailPanel({
  delivery,
  drivers,
  onAssign,
  onAutoAssign,
  onUnassign,
}: {
  delivery: Delivery | null | undefined;
  drivers: DriverProfile[];
  onAssign: (deliveryId: string, driverName: string) => void;
  onAutoAssign: (deliveryId: string) => void;
  onUnassign: (deliveryId: string) => void;
}) {
  if (!delivery) return null;

  const selectedDriver = delivery.assignedDriver
    ? drivers.find((driver) => driver.name === delivery.assignedDriver)
    : null;

  return (
    <section className="dispatch-detail-panel">
      <div className="dispatch-detail-head">
        <div>
          <span>배송 상세</span>
          <strong>{delivery.customer}</strong>
          <p>{delivery.orderNo}</p>
        </div>
        <IonBadge color={delivery.done ? "success" : delivery.assignedDriver ? "primary" : "warning"}>
          {delivery.done ? "배송 완료" : delivery.assignedDriver ? "배정 완료" : "미배정"}
        </IonBadge>
      </div>
      <div className="dispatch-detail-grid">
        <DetailCell label="고객 연락처" value={delivery.phone} />
        <DetailCell label="이메일" value={delivery.email} />
        <DetailCell label="배송일" value={delivery.deliveryDate ?? "오늘"} />
        <DetailCell label="구역" value={delivery.zone} />
        <DetailCell label="담당 기사" value={delivery.assignedDriver ?? "미배정"} />
        <DetailCell label="기사 연락처" value={selectedDriver?.phone ?? "-"} />
        <DetailCell label="샐러드 수량" value={`${delivery.saladCount ?? 1}개`} />
        <DetailCell label="보냉백" value={delivery.bagCount > 0 ? `${delivery.bagCount}개 · ${delivery.bagCollected ? "회수 완료" : "회수 필요"}` : "회수 없음"} />
      </div>
      <div className="dispatch-detail-address">
        <strong>배송 주소</strong>
        <p>{[delivery.address, delivery.detailAddress].filter(Boolean).join(" ")}</p>
      </div>
      <div className="dispatch-detail-memo">
        <div>
          <strong>고객 요청사항</strong>
          <p>{delivery.memo || "요청사항 없음"}</p>
        </div>
        <div>
          <strong>기사 메모</strong>
          <p>{delivery.driverMemo || "작성된 메모 없음"}</p>
        </div>
      </div>
      <div className="dispatch-detail-status">
        <span className={delivery.customerActive ? "done" : ""}>고객 활성</span>
        <span className={delivery.addressConfirmed ? "done" : ""}>주소 확인</span>
        <span className={delivery.orderPrepared ? "done" : ""}>주문 준비</span>
        <span className={delivery.assignedDriver ? "done" : ""}>기사 배정</span>
        <span className={delivery.done ? "done" : ""}>배송 완료</span>
      </div>
      <div className="dispatch-detail-actions">
        {delivery.assignedDriver ? (
          <IonButton fill="outline" onClick={() => onUnassign(delivery.id)}>배정 취소</IonButton>
        ) : (
          <>
            <IonButton onClick={() => onAutoAssign(delivery.id)}>자동 배정</IonButton>
            {drivers.map((driver) => (
              <IonButton
                fill={driver.zone === delivery.zone ? "solid" : "outline"}
                key={`detail-${driver.name}`}
                onClick={() => onAssign(delivery.id, driver.name)}
              >
                {driver.name}
              </IonButton>
            ))}
          </>
        )}
      </div>
    </section>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-cell">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CustomerManagement({
  deliveries,
  onUpdateCustomer,
}: {
  deliveries: Delivery[];
  onUpdateCustomer: (customerName: string, patch: Partial<Delivery>) => void;
}) {
  return (
    <IonList>
      {deliveries.map((delivery) => (
        <IonItem key={delivery.id}>
          <IonIcon icon={personCircleOutline} slot="start" />
          <IonLabel>
            <h2>{delivery.customer}</h2>
            <p>{delivery.phone} · {delivery.email}</p>
            <p>{delivery.address} · {delivery.memo}</p>
          </IonLabel>
          <IonBadge color={adminBadgeColor(customerStatus(delivery))}>{customerStatus(delivery)}</IonBadge>
          <div className="row-actions" slot="end">
            <IonButton
              disabled={delivery.addressConfirmed}
              size="small"
              onClick={() => onUpdateCustomer(delivery.customer, { addressConfirmed: true })}
            >
              주소 확인
            </IonButton>
            <IonButton
              fill="outline"
              size="small"
              onClick={() => onUpdateCustomer(delivery.customer, { customerActive: !delivery.customerActive })}
            >
              {delivery.customerActive ? "정기배송 중지" : "정기배송 재개"}
            </IonButton>
          </div>
        </IonItem>
      ))}
    </IonList>
  );
}

function OrderManagement({
  deliveries,
  onAutoAssign,
  onUpdateDelivery,
}: {
  deliveries: Delivery[];
  onAutoAssign: (deliveryId: string) => void;
  onUpdateDelivery: (deliveryId: string, patch: Partial<Delivery>) => void;
}) {
  return (
    <IonList>
      {deliveries.map((delivery) => (
        <IonItem key={delivery.id}>
          <IonIcon icon={clipboardOutline} slot="start" />
          <IonLabel>
            <h2>{delivery.orderNo}</h2>
            <p>{delivery.customer} · {delivery.zone} · {delivery.address}</p>
            <p>{delivery.memo}</p>
          </IonLabel>
          <IonBadge color={adminBadgeColor(orderStatus(delivery))}>{orderStatus(delivery)}</IonBadge>
          <div className="row-actions" slot="end">
            <IonButton
              disabled={delivery.addressConfirmed}
              fill="outline"
              size="small"
              onClick={() => onUpdateDelivery(delivery.id, { addressConfirmed: true })}
            >
              주소 확인
            </IonButton>
            <IonButton
              disabled={delivery.orderPrepared}
              size="small"
              onClick={() => onUpdateDelivery(delivery.id, { orderPrepared: true })}
            >
              준비 완료
            </IonButton>
            <IonButton
              disabled={Boolean(delivery.assignedDriver)}
              fill="outline"
              size="small"
              onClick={() => onAutoAssign(delivery.id)}
            >
              자동 배정
            </IonButton>
          </div>
        </IonItem>
      ))}
    </IonList>
  );
}

function BagManagement({
  deliveries,
  onUpdateDelivery,
}: {
  deliveries: Delivery[];
  onUpdateDelivery: (deliveryId: string, patch: Partial<Delivery>) => void;
}) {
  return (
    <IonList>
      {deliveries.map((delivery) => (
        <IonItem key={delivery.id}>
          <IonIcon icon={bagCheckOutline} slot="start" />
          <IonLabel>
            <h2>{delivery.customer}</h2>
            <p>{delivery.bagCount === 0 ? "회수 대상 없음" : `보냉백 ${delivery.bagCount}개`}</p>
            <p>{delivery.assignedDriver ?? "미배정"} 기사 · {delivery.address}</p>
          </IonLabel>
          <IonBadge color={adminBadgeColor(bagStatus(delivery))}>{bagStatus(delivery)}</IonBadge>
          <div className="row-actions" slot="end">
            <IonButton
              disabled={delivery.bagCount === 0 || delivery.bagCollected}
              size="small"
              onClick={() => onUpdateDelivery(delivery.id, { bagCollected: true })}
            >
              회수 완료
            </IonButton>
            <IonButton
              disabled={delivery.bagCount === 0 || !delivery.bagCollected}
              fill="outline"
              size="small"
              onClick={() => onUpdateDelivery(delivery.id, { bagCollected: false })}
            >
              미회수 처리
            </IonButton>
          </div>
        </IonItem>
      ))}
    </IonList>
  );
}

function DriverApprovalManagement({
  deliveries,
  drivers,
  onUpdateStatus,
}: {
  deliveries: Delivery[];
  drivers: DriverProfile[];
  onUpdateStatus: (driverName: string, status: DriverProfile["status"]) => void;
}) {
  return (
    <IonList>
      {drivers.map((driver) => {
        const assignedCount = deliveries.filter((delivery) => delivery.assignedDriver === driver.name).length;
        const completedCount = deliveries.filter((delivery) => delivery.assignedDriver === driver.name && delivery.done).length;

        return (
          <IonItem key={driver.name}>
            <IonIcon icon={carOutline} slot="start" />
            <IonLabel>
              <h2>{driver.name}</h2>
              <p>{driver.phone} · 희망/담당 {driver.zone}</p>
              <p>배정 {assignedCount}건 · 완료 {completedCount}건</p>
            </IonLabel>
            <IonBadge color={adminBadgeColor(driver.status)}>{driver.status}</IonBadge>
            <div className="row-actions" slot="end">
              <IonButton
                disabled={driver.status === "승인 완료"}
                size="small"
                onClick={() => onUpdateStatus(driver.name, "승인 완료")}
              >
                승인
              </IonButton>
              <IonButton
                disabled={driver.status === "보류"}
                fill="outline"
                size="small"
                onClick={() => onUpdateStatus(driver.name, "보류")}
              >
                보류
              </IonButton>
              <IonButton
                disabled={driver.status === "승인 대기"}
                fill="clear"
                size="small"
                onClick={() => onUpdateStatus(driver.name, "승인 대기")}
              >
                대기로 변경
              </IonButton>
            </div>
          </IonItem>
        );
      })}
    </IonList>
  );
}

function AdminLogin({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState("admin@salad.test");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submitAdminLogin() {
    if (!email.trim() || !password.trim()) {
      setMessage("관리자 이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await loginSpringAdmin({ email: email.trim(), password });
      onLogin(email.trim());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "관리자 로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-hero">
        <p>SALAD OPS · ADMIN WEB</p>
        <h1>운영자 로그인</h1>
        <span>고객, 주문, 배송 배정, 기사 승인 업무는 승인된 운영자만 접근합니다.</span>
        <div className="admin-login-stats">
          <strong>42</strong>
          <span>오늘 배송</span>
          <strong>8</strong>
          <span>출근 기사</span>
        </div>
      </div>
      <IonCard className="admin-login-card">
        <IonCardHeader>
          <IonCardTitle>관리자 계정</IonCardTitle>
          <IonCardSubtitle>승인된 관리자 계정으로 로그인합니다.</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <IonInput label="관리자 이메일" labelPlacement="stacked" placeholder="admin@salad.test" type="email" value={email} onIonInput={(event) => setEmail(String(event.detail.value ?? ""))} />
          <IonInput label="비밀번호" labelPlacement="stacked" placeholder="비밀번호 입력" type="password" value={password} onIonInput={(event) => setPassword(String(event.detail.value ?? ""))} />
          <IonButton disabled={loading} expand="block" onClick={submitAdminLogin}>
            <IonIcon icon={logInOutline} slot="start" />
            {loading ? "확인 중..." : "관리자 로그인"}
          </IonButton>
          {message && <IonChip color="warning">{message}</IonChip>}
          <div className="admin-login-note">권한: 주문 관리 · 배송 배정 · 기사 승인 · 고객 정보 관리</div>
        </IonCardContent>
      </IonCard>
    </div>
  );
}

function AdminConsoleSidebar({
  collapsed,
  current,
  onChange,
  onToggle,
}: {
  collapsed: boolean;
  current: AdminTab;
  onChange: (tab: AdminTab) => void;
  onToggle: () => void;
}) {
  return (
    <aside className="admin-console-sidebar" aria-label="관리자 메뉴">
      <div className="admin-console-brand">
        <strong>SD</strong>
        <span>
          <b>Salad Admin</b>
          <small>Delivery dashboard</small>
        </span>
        <button
          aria-label={collapsed ? "메뉴 펼치기" : "메뉴 접기"}
          className="admin-sidebar-toggle"
          onClick={onToggle}
          type="button"
        >
          <IonIcon icon={collapsed ? chevronForwardOutline : chevronBackOutline} />
        </button>
      </div>
      <div className="admin-menu-section">MENU</div>
      <nav>
        {adminMenuItems.map((item) => (
          <button
            className={current === item.value ? "active" : ""}
            key={item.value}
            onClick={() => onChange(item.value)}
            type="button"
          >
            <IonIcon icon={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="admin-sidebar-card">
        <span>오늘 운영 상태</span>
        <strong>정상</strong>
        <small>배송/기사/보냉백 모니터링</small>
      </div>
    </aside>
  );
}

function AdminConsoleTopBar({
  apiStatus,
  currentTitle,
  onLogout,
  onSearchTermChange,
  searchTerm,
}: {
  apiStatus: string;
  currentTitle: string;
  onLogout: () => void;
  onSearchTermChange: (value: string) => void;
  searchTerm: string;
}) {
  return (
    <div className="admin-console-topbar">
      <div className="admin-topbar-title">
        <span>Dashboard</span>
        <strong>{currentTitle}</strong>
      </div>
      <div className="admin-topbar-search">
        <IonIcon icon={searchOutline} />
        <input
          onChange={(event) => onSearchTermChange(event.currentTarget.value)}
          placeholder="고객명, 주문번호, 기사명 검색"
          value={searchTerm}
        />
      </div>
      <div className="admin-topbar-actions">
        <span className="admin-api-status">{apiStatus}</span>
        <button aria-label="알림" type="button">
          <IonIcon icon={notificationsOutline} />
          <span>3</span>
        </button>
        <button aria-label="로그아웃" title="로그아웃" type="button" onClick={onLogout}>
          <IonIcon icon={logOutOutline} />
        </button>
        <div className="admin-operator">
          <div>관</div>
          <span>운영자</span>
          <strong>관리자</strong>
        </div>
      </div>
    </div>
  );
}

function AdminFilterPanel({
  onSearchTermChange,
  onStatusFilterChange,
  searchTerm,
  statusFilter,
  tab,
}: {
  onSearchTermChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  searchTerm: string;
  statusFilter: string;
  tab: AdminTab;
}) {
  const label = tab === "overview" ? "업무명" : tab === "dispatch" ? "배송명" : tab === "drivers" ? "기사명" : tab === "bags" ? "고객명" : "검색명";
  const filterOptions = ["전체", "대기", "확인 필요", "완료"];

  return (
    <div className="admin-filter-panel">
      <div className="admin-filter-row">
        <strong>검색옵션</strong>
        {filterOptions.map((option) => (
          <button
            className={statusFilter === option ? "checked" : ""}
            key={option}
            onClick={() => onStatusFilterChange(option)}
            type="button"
          >
            <span />
            {option}
          </button>
        ))}
      </div>
      <div className="admin-filter-row">
        <strong>{label}</strong>
        <button className="admin-select" onClick={() => onStatusFilterChange("전체")} type="button">전체</button>
        <input
          onChange={(event) => onSearchTermChange(event.currentTarget.value)}
          placeholder="검색어를 입력해주세요."
          value={searchTerm}
        />
        <button className="admin-search-button" onClick={() => onSearchTermChange(searchTerm.trim())} type="button">검색</button>
      </div>
    </div>
  );
}

function AdminListPanel({
  detailDelivery,
  detailDrivers = [],
  onDetail,
  onAssignDelivery,
  onAutoAssignDelivery,
  onUnassignDelivery,
  rows,
  selectedDetailId,
  totalCount,
}: {
  detailDelivery?: Delivery | null;
  detailDrivers?: DriverProfile[];
  onDetail?: (row: string[]) => void;
  onAssignDelivery?: (deliveryId: string, driverName: string) => void;
  onAutoAssignDelivery?: (deliveryId: string) => void;
  onUnassignDelivery?: (deliveryId: string) => void;
  rows: string[][];
  selectedDetailId?: string | null;
  totalCount: number;
}) {
  return (
    <div className="admin-list-panel">
      <div className="admin-list-count">전체 {totalCount}건 · 검색결과 {rows.length}건</div>
      <div className="admin-list-table">
        <div className="admin-list-head">
          <span>번호</span>
          <span>상태</span>
          <span>항목</span>
          <span>내용</span>
          <span>상세보기</span>
        </div>
        {rows.map((row, index) => {
          const [title, description, status] = row;
          const rowDeliveryId = row[3];
          const expanded = Boolean(rowDeliveryId && selectedDetailId === rowDeliveryId && detailDelivery?.id === rowDeliveryId);

          return (
            <div className={expanded ? "admin-list-entry expanded" : "admin-list-entry"} key={`${title}-${index}`}>
              <div className="admin-list-row">
                <span>{index + 1}</span>
                <span>
                  <IonBadge color={adminBadgeColor(status)}>{status}</IonBadge>
                </span>
                <strong>{title}</strong>
                <p>{description}</p>
                <button className="admin-detail-button" disabled={!rowDeliveryId} onClick={() => onDetail?.(row)} type="button">
                  {expanded ? "닫기" : "상세보기"}
                </button>
              </div>
              {expanded && onAssignDelivery && onAutoAssignDelivery && onUnassignDelivery && (
                <div className="admin-list-detail-row">
                  <DeliveryDetailPanel
                    delivery={detailDelivery}
                    drivers={detailDrivers}
                    onAssign={onAssignDelivery}
                    onAutoAssign={onAutoAssignDelivery}
                    onUnassign={onUnassignDelivery}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminHeader() {
  return (
    <div className="admin-header">
      <div>
        <p>SALAD OPS · PC WEB</p>
        <h1>관리자 웹</h1>
        <span>오늘 처리할 일부터 확인하고, 필요한 관리 메뉴만 열어 처리합니다.</span>
      </div>
      <div className="admin-header-side">
        <div className="admin-live-badge">
          <span />
          운영중
        </div>
        <strong>2026.09.14</strong>
        <small>오전 배송 모니터링</small>
      </div>
    </div>
  );
}

function adminBadgeColor(status: string) {
  if (status.includes("완료") || status.includes("활성") || status.includes("정상") || status.includes("판매중") || status.includes("준비 완료")) return "success";
  if (status.includes("보류") || status.includes("필요") || status.includes("대기") || status.includes("검토") || status.includes("품절") || status.includes("확인")) return "warning";
  return "medium";
}

function productStatusLabel(status: string) {
  if (status === "ACTIVE") return "판매중";
  if (status === "SOLD_OUT") return "품절";
  if (status === "HIDDEN") return "숨김";
  return status;
}

function naverStatusLabel(status: string) {
  if (status === "LINKED") return "연결 완료";
  if (status === "RESERVED") return "예약 전환";
  if (status === "NEEDS_CONFIRMATION") return "확인 필요";
  if (status === "CANCELLED") return "취소";
  return status;
}

function customerStatus(delivery: Delivery) {
  if (!delivery.customerActive) return "중지";
  if (!delivery.addressConfirmed) return "주소 확인 필요";
  return "활성";
}

function orderStatus(delivery: Delivery) {
  if (delivery.done) return "배송 완료";
  if (!delivery.addressConfirmed) return "주소 확인";
  if (delivery.orderPrepared) return delivery.assignedDriver ? "배정 완료" : "준비 완료";
  return "준비 대기";
}

function bagStatus(delivery: Delivery) {
  if (delivery.bagCount === 0) return "정상";
  return delivery.bagCollected ? "회수 완료" : "회수 필요";
}

function adminRowIcon(tab: AdminTab) {
  if (tab === "orders" || tab === "products" || tab === "naver") return clipboardOutline;
  if (tab === "dispatch" || tab === "drivers") return carOutline;
  if (tab === "bags") return bagCheckOutline;
  if (tab === "admins") return settingsOutline;
  return personCircleOutline;
}

function SideMenuLayout({
  children,
  menu,
  menuPosition = "right",
  wide = false,
}: {
  children: React.ReactNode;
  menu: React.ReactNode;
  menuPosition?: "left" | "right";
  wide?: boolean;
}) {
  return (
    <div className={`${wide ? "side-menu-layout side-menu-layout-wide" : "side-menu-layout"} side-menu-${menuPosition}`}>
      {menuPosition === "left" && menu}
      <main className="side-menu-main">{children}</main>
      {menuPosition === "right" && menu}
    </div>
  );
}

function RightSideMenu<T extends string>({
  current,
  items,
  onChange,
  title,
}: {
  current: T;
  items: SideMenuItem<T>[];
  onChange: (value: T) => void;
  title: string;
}) {
  return (
    <aside className="right-side-menu" aria-label={title}>
      <strong>{title}</strong>
      <div>
        {items.map((item) => (
          <button
            className={current === item.value ? "side-menu-button active" : "side-menu-button"}
            key={item.value}
            onClick={() => onChange(item.value)}
            type="button"
          >
            <IonIcon icon={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function ScreenShell({
  eyebrow,
  title,
  subtitle,
  children,
  wide = false,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "screen-shell screen-shell-wide" : "screen-shell"}>
      <div className="hero-panel">
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span>{subtitle}</span>
      </div>
      {children}
    </div>
  );
}

function SummaryCard({ rows }: { rows: Array<[string, string]> }) {
  return (
    <IonCard>
      <IonCardContent>
        <StatusRows rows={rows} />
      </IonCardContent>
    </IonCard>
  );
}

function StatusRows({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="status-rows">
      {rows.map(([label, value]) => (
        <div className="status-row" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function shortAddress(address: string) {
  return address.replace("테헤란로 100", "").trim() || address;
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}
