import type {
  DeliverySchedule,
  DeliveryStatus,
  DeliveryZone,
  DriverAttendance,
  ManualCustomerInput,
  Profile,
} from "./types";

export const zones: DeliveryZone[] = [
  {
    id: "zone-a",
    name: "A구역",
    description: "매장 반경 3km 이내 아파트 밀집 구역",
  },
  {
    id: "zone-b",
    name: "B구역",
    description: "오피스텔과 상가 복합 구역",
  },
  {
    id: "zone-c",
    name: "C구역",
    description: "정기배송 고객 증가 구역",
  },
];

export const customers: Array<Profile & { remainingCount: number; totalCount: number }> = [
  {
    id: "customer-1",
    role: "CUSTOMER",
    name: "김샐러",
    phone: "010-2478-7821",
    birthdate: "1990-02-14",
    address: "서울시 마포구 월드컵북로 11",
    zoneId: "zone-a",
    uniqueCode: "김샐9002147821",
    createdAt: "2026-08-30T08:20:00+09:00",
    remainingCount: 4,
    totalCount: 10,
  },
  {
    id: "customer-2",
    role: "CUSTOMER",
    name: "박그린",
    phone: "010-5121-4409",
    birthdate: "1988-11-03",
    address: "서울시 마포구 성산동 245",
    zoneId: "zone-b",
    uniqueCode: "박그8811034409",
    createdAt: "2026-08-30T09:05:00+09:00",
    remainingCount: 12,
    totalCount: 20,
  },
  {
    id: "customer-3",
    role: "CUSTOMER",
    name: "최루꼴라",
    phone: "010-9012-3320",
    birthdate: "1995-07-22",
    address: "서울시 서대문구 연희로 41",
    zoneId: "zone-c",
    uniqueCode: "최루9507223320",
    createdAt: "2026-08-30T10:15:00+09:00",
    remainingCount: 1,
    totalCount: 1,
  },
];

export const drivers = [
  {
    id: "driver-1",
    name: "박배송",
    phone: "010-3000-1201",
    zoneId: "zone-a",
    zoneName: "A구역",
    vehicleNumber: "서울12가 3421",
    isActive: true,
  },
  {
    id: "driver-2",
    name: "정루트",
    phone: "010-3000-1202",
    zoneId: "zone-b",
    zoneName: "B구역",
    vehicleNumber: "서울33나 8201",
    isActive: true,
  },
  {
    id: "driver-3",
    name: "한회수",
    phone: "010-3000-1203",
    zoneId: "zone-c",
    zoneName: "C구역",
    vehicleNumber: "서울45다 1029",
    isActive: false,
  },
];

export const deliveries: DeliverySchedule[] = [
  {
    id: "delivery-1",
    subscriptionId: "sub-1",
    customerId: "customer-1",
    customerName: "김샐러",
    driverId: "driver-1",
    driverName: "박배송",
    zoneId: "zone-a",
    zoneName: "A구역",
    deliveryDate: "2026-08-30",
    status: "DELIVERED",
    routeOrder: 1,
    address: "서울시 마포구 월드컵북로 11",
    latitude: 37.5566,
    longitude: 126.9144,
    requestNotes: "공동현관 1234*, 문 앞 보냉백",
    insulatedBagReturned: true,
    unitPrice: 8900,
    completedAt: "2026-08-30T10:31:00+09:00",
  },
  {
    id: "delivery-2",
    subscriptionId: "sub-2",
    customerId: "customer-2",
    customerName: "박그린",
    driverId: "driver-2",
    driverName: "정루트",
    zoneId: "zone-b",
    zoneName: "B구역",
    deliveryDate: "2026-08-30",
    status: "IN_TRANSIT",
    routeOrder: 2,
    address: "서울시 마포구 성산동 245",
    latitude: 37.563,
    longitude: 126.9087,
    requestNotes: "경비실에 맡겨주세요",
    insulatedBagReturned: false,
    unitPrice: 8900,
  },
  {
    id: "delivery-3",
    subscriptionId: "sub-3",
    customerId: "customer-3",
    customerName: "최루꼴라",
    driverId: "driver-3",
    driverName: "한회수",
    zoneId: "zone-c",
    zoneName: "C구역",
    deliveryDate: "2026-08-30",
    status: "PENDING",
    routeOrder: 3,
    address: "서울시 서대문구 연희로 41",
    latitude: 37.5699,
    longitude: 126.9301,
    requestNotes: "초인종 누르지 말아주세요",
    insulatedBagReturned: false,
    unitPrice: 9900,
  },
  {
    id: "delivery-4",
    subscriptionId: "sub-4",
    customerId: "customer-4",
    customerName: "오단백",
    driverId: "driver-1",
    driverName: "박배송",
    zoneId: "zone-a",
    zoneName: "A구역",
    deliveryDate: "2026-08-30",
    status: "DELIVERED",
    routeOrder: 4,
    address: "서울시 마포구 동교로 78",
    latitude: 37.556,
    longitude: 126.9255,
    requestNotes: "보냉백은 현관 왼쪽",
    insulatedBagReturned: false,
    unitPrice: 8900,
    completedAt: "2026-08-30T11:02:00+09:00",
  },
  {
    id: "delivery-5",
    subscriptionId: "sub-5",
    customerId: "customer-5",
    customerName: "문비건",
    driverId: "driver-2",
    driverName: "정루트",
    zoneId: "zone-b",
    zoneName: "B구역",
    deliveryDate: "2026-08-30",
    status: "IN_TRANSIT",
    routeOrder: 5,
    address: "서울시 서대문구 증가로 20",
    latitude: 37.5798,
    longitude: 126.9217,
    requestNotes: "엘리베이터 앞 선반",
    insulatedBagReturned: true,
    unitPrice: 9900,
  },
];

export const attendance: DriverAttendance[] = [
  {
    id: "att-1",
    driverId: "driver-1",
    driverName: "박배송",
    workDate: "2026-08-30",
    clockInTime: "08:42",
    status: "CLOCKED_IN",
    latitude: 37.5566,
    longitude: 126.9144,
  },
  {
    id: "att-2",
    driverId: "driver-2",
    driverName: "정루트",
    workDate: "2026-08-30",
    clockInTime: "08:51",
    status: "CLOCKED_IN",
    latitude: 37.563,
    longitude: 126.9087,
  },
];

export const schedules: Array<{ day: number; label: string; kind: "ok" | "locked" }> = [
  { day: 2, label: "예약", kind: "ok" },
  { day: 5, label: "마감", kind: "locked" },
  { day: 9, label: "예약", kind: "ok" },
  { day: 16, label: "예약", kind: "ok" },
  { day: 23, label: "예약", kind: "ok" },
];

export const kpis = [
  "역할 기반 접근 제어",
  "배송 상태 실시간 반영",
  "보냉백 회수율 관리",
  "일일 정산 PDF 출력",
];

export const architectureLayers = [
  {
    title: "프론트엔드",
    kind: "React",
    description:
      "역할별 워크스페이스를 같은 앱 안에서 분리하고, 관리자 콘솔을 MVP의 첫 화면으로 둡니다.",
    items: [
      "관리자: 배송 현황, 기사 근태, 계정, 정산",
      "기사: 출퇴근, 지도, 루트, 완료/회수 체크",
      "고객: 배송일 선택, 주문 수정, 요청사항",
    ],
  },
  {
    title: "백엔드",
    kind: "Supabase",
    description:
      "인증, PostgreSQL, Realtime을 함께 쓰며 복잡한 서버 구축 없이 운영 데이터를 관리합니다.",
    items: [
      "profiles, subscriptions, delivery_schedules",
      "driver_attendances, delivery_zones",
      "RLS 정책으로 역할별 권한 분리",
    ],
  },
  {
    title: "지도/물류",
    kind: "PostGIS",
    description:
      "배송 구역과 좌표를 구조화하고, 기사별 오늘 루트와 보냉백 회수 상태를 연결합니다.",
    items: [
      "zone boundary 저장",
      "route_order 기반 배송 순서",
      "위치 권한과 백그라운드 추적은 모바일 앱에서 확장",
    ],
  },
  {
    title: "운영 리포트",
    kind: "PDF/CSV",
    description:
      "오늘 완료 고객 명단, 회차 차감, 금액 정산, 미회수 보냉백을 출력 가능한 형태로 만듭니다.",
    items: [
      "일일 정산 리포트",
      "보냉백 미회수 목록",
      "네이버 주문 수동 등록 감사 로그",
    ],
  },
];

export const services = [
  {
    name: "customerService",
    description: "배송 가능일 조회, 예약 변경, 요청사항 저장, 전날 마감 검증",
  },
  {
    name: "driverService",
    description: "오늘 배송 목록, 출퇴근 기록, 완료 처리, 보냉백 회수 상태 업데이트",
  },
  {
    name: "adminService",
    description: "고객 수동 등록, 기사 계정 관리, 구역 배정, 배송 현황 구독",
  },
  {
    name: "settlementService",
    description: "완료 배송 집계, 회차 차감 내역, 금액 정산, PDF/CSV 출력",
  },
];

export const roadmap = [
  {
    title: "1. MVP 데이터 모델",
    description: "Supabase 테이블, 고유식별 ID, RLS 정책, 잔여 회차 차감 트리거",
  },
  {
    title: "2. 관리자 웹 콘솔",
    description: "네이버 주문 수동 등록, 배송 모니터링, 기사/구역 관리, 정산 출력",
  },
  {
    title: "3. 기사 모바일 화면",
    description: "출퇴근, 오늘 배송 지도, 루트 순서, 완료/보냉백 회수 체크",
  },
  {
    title: "4. 고객 예약 화면",
    description: "잔여 회차 확인, 달력 기반 배송일 추가/변경/취소, 요청사항 수정",
  },
  {
    title: "5. 운영 자동화",
    description: "알림, 마감 시간 잠금, 미회수 보냉백 리마인드, 일일 리포트 자동 생성",
  },
];

export function createUniqueCode(input: Pick<ManualCustomerInput, "birthdate" | "name" | "phone">) {
  const compactBirthdate = input.birthdate.replaceAll("-", "").slice(2);
  const phoneTail = input.phone.replaceAll("-", "").slice(-4);
  return `${input.name.slice(0, 2)}${compactBirthdate}${phoneTail}`;
}

export function summarizeDeliveries(records: DeliverySchedule[]) {
  const completed = records.filter((record) => record.status === "DELIVERED");
  const byStatus = records.reduce<Record<DeliveryStatus, number>>(
    (acc, record) => {
      acc[record.status] += 1;
      return acc;
    },
    { DELIVERED: 0, IN_TRANSIT: 0, PENDING: 0, SKIPPED: 0 },
  );

  return {
    total: records.length,
    byStatus,
    bagReturned: records.filter((record) => record.insulatedBagReturned).length,
    settlementTotal: completed.reduce((sum, record) => sum + record.unitPrice, 0),
  };
}
