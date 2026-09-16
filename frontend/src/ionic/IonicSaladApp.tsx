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
  IonTextarea,
} from "@ionic/react";
import {
  bagCheckOutline,
  calendarOutline,
  carOutline,
  chevronBackOutline,
  chevronForwardOutline,
  checkmarkCircleOutline,
  clipboardOutline,
  homeOutline,
  logInOutline,
  mapOutline,
  notificationsOutline,
  personCircleOutline,
  searchOutline,
  settingsOutline,
} from "ionicons/icons";
import { useEffect, useMemo, useState } from "react";
import {
  assignSpringDelivery,
  completeSpringDelivery,
  createSpringDriver,
  loadSpringSnapshot,
  loginSpringCustomer,
  loginSpringDriver,
  searchSpringAddresses,
  signupSpringCustomer,
  updateSpringDeliveryBag,
  updateSpringDriver,
  type SpringAddressItem,
  type SpringCustomer,
  type SpringDelivery,
  type SpringDriver,
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
  memo: string;
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

const initialDeliveryZones = ["강남A", "서초B", "송파C", "잠실D", "마포E", "성수F"];

const initialDeliveries: Delivery[] = [
  {
    id: "delivery-001",
    orderNo: "ORD-0914-001",
    customer: "김샐러",
    phone: "010-1234-5678",
    email: "salad.kim@example.com",
    address: "강남구 역삼동",
    memo: "공동현관 1234*, 문 앞 배송",
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
  },
  {
    id: "delivery-002",
    orderNo: "ORD-0914-002",
    customer: "이로메인",
    phone: "010-2222-7788",
    email: "romaine.lee@example.com",
    address: "서초구 반포동",
    memo: "배송 완료 사진 필요",
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
  },
  {
    id: "delivery-003",
    orderNo: "ORD-0914-003",
    customer: "최루꼴라",
    phone: "010-3333-8899",
    email: "rucola.choi@example.com",
    address: "송파구 잠실동",
    memo: "초인종 누르지 말아주세요",
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

  return (
    <IonApp>
      <IonPage>
        <IonContent fullscreen>
          {area === "customer" && <CustomerArea />}
          {area === "driver" && <DriverArea />}
          {area === "admin" && <AdminArea />}
        </IonContent>
      </IonPage>
    </IonApp>
  );
}

function readInitialArea(): Area {
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
    return Array.isArray(parsed) && parsed.length > 0 ? parsed.map(normalizeDelivery) : initialDeliveries;
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
    email: delivery.email ?? fallback?.email ?? "",
    orderPrepared: delivery.orderPrepared ?? fallback?.orderPrepared ?? false,
    phone: delivery.phone ?? fallback?.phone ?? "",
  };
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

function driverAssignedDeliveries(driverName: string) {
  return readDispatchDeliveries().filter((delivery) => delivery.assignedDriver === driverName);
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
      addressConfirmed: true,
      assignedDriver: delivery.driverName || null,
      bagCollected: delivery.insulatedBagReturned,
      bagCount: delivery.insulatedBagReturned ? 0 : 1,
      customer: delivery.customerName || customer?.name || "고객",
      customerActive: delivery.status !== "CANCELLED",
      customerId: delivery.customerId,
      done: delivery.status === "DELIVERED",
      driverId: delivery.driverId,
      email: "",
      id: delivery.id,
      lat: delivery.latitude ?? 37.50064,
      lng: delivery.longitude ?? 127.03644,
      memo: delivery.requestNotes || "요청사항 없음",
      orderNo: `ORD-${delivery.deliveryDate.replace(/-/g, "")}-${String(index + 1).padStart(3, "0")}`,
      orderPrepared: delivery.status !== "PENDING",
      phone: customer?.phone ?? "",
      zone: delivery.zoneName || "미지정",
      zoneId: delivery.zoneId,
    };
  });
}

function isUuid(value?: string | null) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
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
  const [loggedIn, setLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [tab, setTab] = useState<CustomerTab>("home");
  const [customerName, setCustomerName] = useState("김샐러");
  const [phone, setPhone] = useState("010-1234-5678");
  const [address, setAddress] = useState("서울 강남구 테헤란로 100");
  const [email, setEmail] = useState("customer@salad.test");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [addressKeyword, setAddressKeyword] = useState("");
  const [addressResults, setAddressResults] = useState<SpringAddressItem[]>([]);
  const [addressSource, setAddressSource] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState([2, 9, 16]);
  const [request, setRequest] = useState("공동현관 1234*, 문 앞에 놓아주세요.");
  const [notice, setNotice] = useState("");

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  }

  function applyCustomerSession(session: { name: string; phone: string | null; address: string | null; email: string | null }) {
    setCustomerName(session.name);
    setPhone(session.phone ?? phone);
    setAddress(session.address ?? address);
    setEmail(session.email ?? email);
    setLoggedIn(true);
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

    setAuthLoading(true);
    try {
      const session = showSignup
        ? await signupSpringCustomer({
            address: address.trim(),
            email: email.trim(),
            name: customerName.trim(),
            password,
            phone: phone.trim(),
          })
        : await loginSpringCustomer({ loginId: email.trim(), password });
      applyCustomerSession(session);
    } catch (error) {
      flash(error instanceof Error ? error.message : "로그인 처리에 실패했습니다.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function submitAddressSearch() {
    if (addressKeyword.trim().length < 2) {
      flash("주소 검색어를 2글자 이상 입력해주세요.");
      return;
    }

    setAddressLoading(true);
    try {
      const result = await searchSpringAddresses(addressKeyword.trim());
      setAddressResults(result.addresses);
      setAddressSource(result.source === "JUSO" ? "도로명주소 API" : "데모 주소");
      if (result.addresses.length === 0) {
        flash("검색 결과가 없습니다.");
      }
    } catch (error) {
      flash(error instanceof Error ? error.message : "주소 검색에 실패했습니다.");
    } finally {
      setAddressLoading(false);
    }
  }

  function selectAddress(item: SpringAddressItem) {
    setAddress(item.roadAddress || item.jibunAddress);
    setAddressKeyword("");
    setAddressResults([]);
    flash("주소가 입력되었습니다. 상세주소는 내 정보에서 보완해주세요.");
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
                <IonInput label="이름" labelPlacement="stacked" value={customerName} onIonInput={(e) => setCustomerName(String(e.detail.value ?? ""))} />
                <IonInput label="전화번호" labelPlacement="stacked" value={phone} onIonInput={(e) => setPhone(String(e.detail.value ?? ""))} />
                <IonInput label="주소" labelPlacement="stacked" value={address} onIonInput={(e) => setAddress(String(e.detail.value ?? ""))} />
                <div className="address-search-row">
                  <IonInput
                    label="주소 검색"
                    labelPlacement="stacked"
                    placeholder="예: 테헤란로 123"
                    value={addressKeyword}
                    onIonInput={(e) => setAddressKeyword(String(e.detail.value ?? ""))}
                  />
                  <IonButton fill="outline" disabled={addressLoading} onClick={submitAddressSearch}>
                    <IonIcon slot="start" icon={searchOutline} />
                    {addressLoading ? "검색중" : "검색"}
                  </IonButton>
                </div>
                {addressResults.length > 0 && (
                  <IonList className="address-search-results" inset>
                    {addressSource && (
                      <IonItem lines="none">
                        <IonLabel color="medium">{addressSource}</IonLabel>
                      </IonItem>
                    )}
                    {addressResults.map((item) => (
                      <IonItem button detail={false} key={`${item.zipNo}-${item.roadAddress}`} onClick={() => selectAddress(item)}>
                        <IonLabel>
                          <h2>{item.roadAddress}</h2>
                          <p>{item.jibunAddress}</p>
                          <p>{item.zipNo} · {item.detailHint || "상세주소 입력 필요"}</p>
                        </IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                )}
              </>
            )}
            <IonInput label="이메일" labelPlacement="stacked" value={email} onIonInput={(e) => setEmail(String(e.detail.value ?? ""))} />
            <IonInput label="비밀번호" labelPlacement="stacked" placeholder="비밀번호 입력" type="password" value={password} onIonInput={(e) => setPassword(String(e.detail.value ?? ""))} />
            <IonButton expand="block" disabled={authLoading} onClick={submitCustomerAuth}>
              <IonIcon slot="start" icon={logInOutline} />
              {authLoading ? "확인 중..." : showSignup ? "가입하고 시작" : "로그인"}
            </IonButton>
            <IonButton fill="clear" expand="block" onClick={() => setShowSignup(!showSignup)}>
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
      <SideMenuLayout menu={<RightSideMenu current={tab} items={customerMenuItems} title="고객 메뉴" onChange={setTab} />}>
        <SummaryCard
          rows={[
            ["이번 주 배송", selectedDays.map((day) => `${day}일`).join(" · ")],
            ["배송 주소", shortAddress(address)],
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
              <IonTextarea label="요청사항" labelPlacement="stacked" value={request} onIonInput={(e) => setRequest(String(e.detail.value ?? ""))} />
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
              <IonInput label="이름" labelPlacement="stacked" value={customerName} onIonInput={(e) => setCustomerName(String(e.detail.value ?? ""))} />
              <IonInput label="전화번호" labelPlacement="stacked" value={phone} onIonInput={(e) => setPhone(String(e.detail.value ?? ""))} />
              <IonInput label="주소" labelPlacement="stacked" value={address} onIonInput={(e) => setAddress(String(e.detail.value ?? ""))} />
              <IonInput label="이메일" labelPlacement="stacked" value={email} onIonInput={(e) => setEmail(String(e.detail.value ?? ""))} />
              <IonButton expand="block" onClick={() => flash("내 정보가 저장되었습니다.")}>내 정보 저장</IonButton>
            </IonCardContent>
          </IonCard>
        )}
      </SideMenuLayout>
    </ScreenShell>
  );
}

function DriverArea() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [driverProfiles, setDriverProfiles] = useState(() => readDriverProfiles());
  const [currentDriverName, setCurrentDriverName] = useState(() => readInitialDriverName());
  const [driverPhone, setDriverPhone] = useState("");
  const [driverPassword, setDriverPassword] = useState("");
  const [applyName, setApplyName] = useState("신규기사");
  const [applyPhone, setApplyPhone] = useState("");
  const [applyZone, setApplyZone] = useState("A구역");
  const [applyVehicleNumber, setApplyVehicleNumber] = useState("");
  const [driverAuthLoading, setDriverAuthLoading] = useState(false);
  const [tab, setTab] = useState<DriverTab>("route");
  const [working, setWorking] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [deliveries, setDeliveries] = useState(() => driverAssignedDeliveries(readInitialDriverName()));
  const [notice, setNotice] = useState("");
  const approvedDrivers = driverProfiles.filter((driver) => driver.status === "승인 완료");
  const currentDriver = approvedDrivers.find((driver) => driver.name === currentDriverName) ?? approvedDrivers[0];

  const completedCount = deliveries.filter((delivery) => delivery.done).length;
  const bagRequired = deliveries.reduce((total, delivery) => total + delivery.bagCount, 0);
  const bagCollected = deliveries.filter((delivery) => delivery.bagCollected).reduce((total, delivery) => total + delivery.bagCount, 0);
  const selected = deliveries[selectedIndex] ?? deliveries[0];

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

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
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
      const session = await loginSpringDriver({ phone: driverPhone.trim(), password: driverPassword });
      setCurrentDriverName(session.name);
      setLoggedIn(true);
      loadSpringSnapshot()
        .then((snapshot) => {
          setDriverProfiles(mapSpringDrivers(snapshot.drivers));
          const mapped = mapSpringDeliveries(snapshot.deliveries, snapshot.customers);
          setDeliveries(mapped.filter((delivery) => delivery.assignedDriver === session.name));
        })
        .catch(() => undefined);
    } catch (error) {
      flash(error instanceof Error ? error.message : "기사 인증 처리에 실패했습니다.");
    } finally {
      setDriverAuthLoading(false);
    }
  }

  function updateSelected(patch: Partial<Delivery>) {
    if (!selected) return;

    const nextDriverDeliveries = deliveries.map((delivery) =>
      delivery.id === selected.id ? { ...delivery, ...patch } : delivery,
    );
    setDeliveries(nextDriverDeliveries);
    setSelectedIndex((index) => Math.max(0, Math.min(index, nextDriverDeliveries.length - 1)));

    const storedDeliveries = readDispatchDeliveries();
    if (storedDeliveries.some((delivery) => delivery.id === selected.id)) {
      saveDispatchDeliveries(
        storedDeliveries.map((delivery) =>
          delivery.id === selected.id ? { ...delivery, ...patch } : delivery,
        ),
      );
    }

    if (isUuid(selected.id) && patch.done) {
      completeSpringDelivery(selected.id, patch.bagCollected ?? selected.bagCollected)
        .then(() => undefined)
        .catch(() => flash("배송 완료 API 저장에 실패했습니다."));
    } else if (isUuid(selected.id) && patch.bagCollected !== undefined) {
      updateSpringDeliveryBag(selected.id, patch.bagCollected)
        .then(() => undefined)
        .catch(() => flash("보냉백 회수 API 저장에 실패했습니다."));
    }
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
    <ScreenShell eyebrow="DRIVER APP" title={`${currentDriverName} 기사 업무`} subtitle={`${currentDriver.zone} 담당 배송, 배송 완료, 보냉백 회수를 처리합니다.`}>
      <SideMenuLayout menu={<RightSideMenu current={tab} items={driverMenuItems} title="기사 메뉴" onChange={setTab} />}>
        <SummaryCard
          rows={[
            ["근무 상태", working ? "출근 완료" : "출근 전"],
            ["배송 완료", `${completedCount} / ${deliveries.length}`],
            ["보냉백 회수", `${bagCollected} / ${bagRequired}`],
          ]}
        />
        {notice && <IonChip color="success">{notice}</IonChip>}
        {tab === "route" && (
          <>
            <IonButton expand="block" onClick={() => { setWorking(true); flash("출근 기록이 저장되었습니다."); }}>
              출근 기록
            </IonButton>
            <IonList inset>
              {deliveries.length === 0 && (
                <IonItem>
                  <IonLabel>아직 배정된 배송이 없습니다. 관리자 웹에서 배송 배정을 진행해주세요.</IonLabel>
                </IonItem>
              )}
              {deliveries.map((delivery, index) => (
                <IonItem key={delivery.id} button detail={false} color={index === selectedIndex ? "light" : undefined} onClick={() => setSelectedIndex(index)}>
                  <IonIcon icon={carOutline} slot="start" />
                  <IonLabel>
                    <h2>#{index + 1} {delivery.customer}</h2>
                    <p>{delivery.orderNo} · {delivery.zone} · {delivery.address}</p>
                    <p>{delivery.memo}</p>
                    <p>{delivery.bagCount === 0 ? "보냉백 없음" : delivery.bagCollected ? `보냉백 ${delivery.bagCount}개 회수 완료` : `보냉백 ${delivery.bagCount}개 회수 필요`}</p>
                  </IonLabel>
                  <div className="driver-route-badges" slot="end">
                    <IonBadge color={delivery.done ? "success" : "medium"}>{delivery.done ? "배송 완료" : "배송 대기"}</IonBadge>
                    <IonBadge color={delivery.bagCount === 0 || delivery.bagCollected ? "success" : "warning"}>
                      {delivery.bagCount === 0 ? "보냉백 없음" : delivery.bagCollected ? "보냉백 회수 완료" : "보냉백 미회수"}
                    </IonBadge>
                  </div>
                </IonItem>
              ))}
            </IonList>
            <IonButton disabled={!selected} expand="block" onClick={() => { updateSelected({ done: true }); flash(`${selected.customer} 배송 완료 처리되었습니다.`); }}>
              선택 배송 완료
            </IonButton>
            <IonButton disabled={!selected || selected.bagCollected} expand="block" fill={selected?.bagCollected ? "solid" : "outline"} color={selected?.bagCollected ? "success" : undefined} onClick={() => {
              if (selected.bagCount === 0) {
                flash(`${selected.customer} 고객은 회수할 보냉백이 없습니다.`);
                return;
              }
              updateSelected({ bagCollected: true });
              flash(`${selected.customer} 보냉백 ${selected.bagCount}개 회수 완료되었습니다.`);
            }}>
              <IonIcon slot="start" icon={bagCheckOutline} />
              {selected?.bagCollected ? "보냉백 회수 완료됨" : "보냉백 회수 완료"}
            </IonButton>
          </>
        )}
        {tab === "map" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>배송 지도</IonCardTitle>
              <IonCardSubtitle>A구역 오전 루트</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <GoogleDeliveryMap deliveries={deliveries} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
              {selected ? (
                <StatusRows
                  rows={[
                    ["선택 고객", selected.customer],
                    ["주소", selected.address],
                    ["요청사항", selected.memo],
                    ["보냉백", selected.bagCount === 0 ? "회수 없음" : selected.bagCollected ? `회수 완료 ${selected.bagCount}개` : `회수 필요 ${selected.bagCount}개`],
                  ]}
                />
              ) : (
                <IonItem>
                  <IonLabel>지도에 표시할 배정 배송이 없습니다.</IonLabel>
                </IonItem>
              )}
            </IonCardContent>
          </IonCard>
        )}
        {tab === "done" && (
          <IonList inset>
            {deliveries.filter((delivery) => delivery.done).length === 0 && (
              <IonItem>
                <IonLabel>아직 완료된 배송이 없습니다.</IonLabel>
              </IonItem>
            )}
            {deliveries.filter((delivery) => delivery.done).map((delivery) => (
              <IonItem key={delivery.id}>
                <IonIcon icon={checkmarkCircleOutline} slot="start" />
                <IonLabel>{delivery.customer}</IonLabel>
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
    </ScreenShell>
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
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [apiStatus, setApiStatus] = useState("데모 데이터");
  const [dispatchDeliveries, setDispatchDeliveries] = useState(() => readDispatchDeliveries());
  const [driverProfiles, setDriverProfiles] = useState(() => readDriverProfiles());
  const [deliveryZones, setDeliveryZones] = useState(() => readDeliveryZones());
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
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
    loadSpringSnapshot()
      .then((snapshot) => {
        applySpringSnapshot(snapshot, setDispatchDeliveries, setDriverProfiles, setDeliveryZones, setZoneAssignments);
        setApiStatus("Spring API 연결됨");
      })
      .catch(() => {
        setApiStatus("데모 데이터 사용중");
      });
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

  function assignZoneDriver(zone: string, driverName: string) {
    updateZoneAssignments({ ...zoneAssignments, [zone]: driverName });
  }

  function addDeliveryZone() {
    const zone = newZoneName.trim();
    if (!zone || deliveryZones.includes(zone)) return;

    updateDeliveryZones([...deliveryZones, zone]);
    updateZoneAssignments({ ...zoneAssignments, [zone]: approvedDrivers[0]?.name ?? "" });
    setNewZoneName("");
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
    if (isUuid(deliveryId) && patch.done) {
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
        metrics: [["판매중", "8개"], ["품절", "1개"], ["숨김", "2개"], ["오늘 인기", "닭가슴살"]],
        rows: [
          ["닭가슴살 샐러드", "8,900원 · 정기배송 기본 상품", "판매중"],
          ["연어 샐러드", "11,900원 · 오전 배송 권장", "판매중"],
          ["아보카도 샐러드", "10,900원 · 재료 확인 필요", "품절"],
        ],
        actions: ["상품 추가", "판매 상태 변경", "가격 수정", "앱 노출 순서 변경"],
      };
    }
    if (tab === "admins") {
      return {
        title: "관리자 관리",
        subtitle: "운영자 계정 권한과 접근 범위를 웹에서 관리합니다.",
        metrics: [["운영자", "3명"], ["초대 대기", "1명"], ["최근 로그인", "오늘"], ["권한 그룹", "4개"]],
        rows: [
          ["최고관리자", "전체 권한 · 계정/주문/기사 승인", "활성"],
          ["운영 매니저", "주문/배송 배정 권한", "활성"],
          ["CS 담당", "고객/요청사항 조회 권한", "초대 대기"],
        ],
        actions: ["관리자 초대", "권한 수정", "접근 로그 확인", "계정 비활성화"],
      };
    }
    if (tab === "naver") {
      return {
        title: "네이버 주문",
        subtitle: "네이버 주문을 고객 계정과 연결하고 배송 예약으로 전환합니다.",
        metrics: [["수집 주문", "9건"], ["연결 완료", "6건"], ["확인 필요", "3건"], ["예약 전환", "5건"]],
        rows: [
          ["N-240912-01", "김샐러 · 주소 확인", "연결 완료"],
          ["N-240912-02", "이로메인 · 전화 확인 필요", "확인 필요"],
          ["N-240912-03", "신규 고객 · 회원 계정 연결 대기", "대기"],
        ],
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
  }, [assignedDeliveries, dispatchDeliveries, nextAddressCheck, nextBagCollect, nextDispatch, nextOrderPrepare, tab, unassignedDeliveries, zoneAssignments]);

  if (!loggedIn) {
    return <AdminLogin onLogin={() => setLoggedIn(true)} />;
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
        <AdminConsoleTopBar apiStatus={apiStatus} currentTitle={content.title} />
        <div className="admin-module-bar">
          <button className="active" type="button">샐러드 운영</button>
          <button type="button">고객/주문</button>
          <button type="button">배송관리</button>
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
            <IonButton onClick={() => (tab === "overview" ? processNextTask() : resetDispatchDemo())}>
              {tab === "overview" ? "다음 할 일" : "+ 신규등록"}
            </IonButton>
          </div>
          <AdminFilterPanel tab={tab} />
          <AdminListPanel rows={content.rows} />
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

  return (
    <div className="dispatch-board">
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
            <IonItem key={delivery.id}>
              <IonIcon icon={clipboardOutline} slot="start" />
              <IonLabel>
                <h2>{delivery.customer}</h2>
                <p>{delivery.orderNo} · {delivery.zone} · {delivery.address}</p>
                <p>{delivery.memo}</p>
              </IonLabel>
              <div className="dispatch-buttons" slot="end">
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
            <IonItem key={delivery.id}>
              <IonIcon icon={carOutline} slot="start" />
              <IonLabel>
                <h2>#{index + 1} {delivery.customer}</h2>
                <p>{delivery.assignedDriver} 기사 · {delivery.zone} · {delivery.address}</p>
                <p>{delivery.done ? "기사 앱에서 배송 완료 처리됨" : "기사 앱 배송 대기"}</p>
              </IonLabel>
              <IonBadge color={delivery.done ? "success" : "medium"}>{delivery.done ? "완료" : "배정"}</IonBadge>
              <IonButton fill="clear" size="small" slot="end" onClick={() => onUnassign(delivery.id)}>
                배정 취소
              </IonButton>
            </IonItem>
          ))}
        </IonList>
      </section>
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

function AdminLogin({ onLogin }: { onLogin: () => void }) {
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
          <IonCardSubtitle>데모에서는 이메일과 비밀번호 입력 후 로그인됩니다.</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <IonInput label="관리자 이메일" labelPlacement="stacked" placeholder="admin@salad.test" type="email" />
          <IonInput label="비밀번호" labelPlacement="stacked" placeholder="비밀번호 입력" type="password" />
          <IonButton expand="block" onClick={onLogin}>
            <IonIcon icon={logInOutline} slot="start" />
            관리자 로그인
          </IonButton>
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

function AdminConsoleTopBar({ apiStatus, currentTitle }: { apiStatus: string; currentTitle: string }) {
  return (
    <div className="admin-console-topbar">
      <div className="admin-topbar-title">
        <span>Dashboard</span>
        <strong>{currentTitle}</strong>
      </div>
      <div className="admin-topbar-search">
        <IonIcon icon={searchOutline} />
        <input placeholder="고객명, 주문번호, 기사명 검색" />
      </div>
      <div className="admin-topbar-actions">
        <span className="admin-api-status">{apiStatus}</span>
        <button aria-label="알림" type="button">
          <IonIcon icon={notificationsOutline} />
          <span>3</span>
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

function AdminFilterPanel({ tab }: { tab: AdminTab }) {
  const label = tab === "overview" ? "업무명" : tab === "dispatch" ? "배송명" : tab === "drivers" ? "기사명" : tab === "bags" ? "고객명" : "검색명";

  return (
    <div className="admin-filter-panel">
      <div className="admin-filter-row">
        <strong>검색옵션</strong>
        {["전체", "대기", "확인 필요", "완료"].map((option, index) => (
          <button className={index === 0 ? "checked" : ""} key={option} type="button">
            <span />
            {option}
          </button>
        ))}
      </div>
      <div className="admin-filter-row">
        <strong>{label}</strong>
        <button className="admin-select" type="button">전체</button>
        <input placeholder="검색어를 입력해주세요." />
        <button className="admin-search-button" type="button">검색</button>
      </div>
    </div>
  );
}

function AdminListPanel({ rows }: { rows: string[][] }) {
  return (
    <div className="admin-list-panel">
      <div className="admin-list-count">전체 {rows.length}건</div>
      <div className="admin-list-table">
        <div className="admin-list-head">
          <span>번호</span>
          <span>상태</span>
          <span>항목</span>
          <span>내용</span>
          <span>상세보기</span>
        </div>
        {rows.map(([title, description, status], index) => (
          <div className="admin-list-row" key={`${title}-${index}`}>
            <span>{index + 1}</span>
            <span>
              <IonBadge color={adminBadgeColor(status)}>{status}</IonBadge>
            </span>
            <strong>{title}</strong>
            <p>{description}</p>
            <IonButton fill="clear" size="small">상세보기</IonButton>
          </div>
        ))}
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
