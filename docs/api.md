# API 초안

## Customer

- `GET /api/customers`: 고객 목록
- `POST /api/customers/manual`: 네이버 주문 고객 수동 등록 및 구독 생성

## Delivery

- `GET /api/deliveries/today`: 오늘 배송 목록
- `GET /api/deliveries/today?driverId={uuid}`: 기사별 오늘 배송 목록
- `GET /api/deliveries/today?zoneId={uuid}`: 구역별 오늘 배송 목록
- `PATCH /api/deliveries/{deliveryId}/complete`: 배송 완료 및 보냉백 회수 여부 저장

## Driver

- `GET /api/drivers/attendances/today`: 오늘 기사 출퇴근 현황
- `POST /api/drivers/{driverId}/attendance/clock-in`: 기사 출근 처리
- `POST /api/drivers/{driverId}/attendance/clock-out`: 기사 퇴근 처리

## Zone

- `GET /api/zones`: 배송 구역 목록

## Settlement

- `GET /api/settlements/daily`: 오늘 정산
- `GET /api/settlements/daily?date=2026-08-31`: 특정 날짜 정산
