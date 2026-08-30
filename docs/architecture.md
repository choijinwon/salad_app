# 샐러드 정기배송 앱 아키텍처

## 결론

엑셀 요구사항은 단순 주문 앱이 아니라 고객 예약, 기사 배송, 관리자 운영이 결합된 정기배송 운영 시스템입니다. 첫 버전은 React 웹 관리자 콘솔을 중심으로 만들고, 기사/고객 모바일 화면은 같은 도메인 모델을 공유하는 별도 React Native 또는 PWA 화면으로 확장하는 구조가 적합합니다.

## 역할

- `CUSTOMER`: 고유식별 ID 로그인, 배송일 선택/변경/취소, 요청사항 수정, 잔여 회차 확인
- `DRIVER`: 출퇴근 기록, 오늘 배송 지도, 루트 순서 확인, 배송 완료, 보냉백 회수 체크
- `ADMIN`: 고객 수동 등록, 기사 계정/구역 관리, 실시간 배송 모니터링, 보냉백 미회수 관리, 일일 정산 출력

## 추천 스택

- Frontend: React, TypeScript, CSS/Tailwind 계열 스타일링
- Mobile extension: React Native Expo
- Backend: Supabase Auth, PostgreSQL, Realtime
- Geo: PostGIS, delivery zone boundary, latitude/longitude
- Reporting: browser PDF print, CSV export, 추후 서버 리포트 자동화

## 핵심 데이터 흐름

1. 고객이 앱 또는 네이버 스토어에서 1회/10회/20회권을 구매합니다.
2. 앱 주문은 고객이 직접 예약하고, 네이버 주문은 관리자가 고객을 수동 등록합니다.
3. 고객 등록 시 이름, 생년월일, 전화번호 기반 고유식별 ID를 발급합니다.
4. 구독권은 `subscriptions.remaining_count`로 잔여 회차를 관리합니다.
5. 배송일이 생기면 `delivery_schedules`에 배송 예정 건이 생성됩니다.
6. 관리자는 구역과 기사를 배정하고, 기사는 오늘 배송 목록을 지도에서 확인합니다.
7. 배송 완료 시 `delivery_schedules.status`가 `DELIVERED`로 바뀌고 잔여 회차가 1 차감됩니다.
8. 보냉백 회수 여부는 배송 완료와 함께 기록하고, 미회수 목록은 관리자 화면에서 추적합니다.

## MVP 우선순위

1. Supabase 테이블/RLS/트리거 구축
2. 관리자 웹 콘솔: 고객 등록, 기사 관리, 배송 현황, 정산 출력
3. 기사 화면: 출퇴근, 오늘 배송 리스트, 완료/회수 체크
4. 고객 화면: 달력 예약, 요청사항, 잔여 회차
5. 지도와 최적 경로, 알림, 백그라운드 위치 추적 고도화
