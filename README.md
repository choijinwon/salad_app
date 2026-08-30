# 샐러드 정기배송 운영 아키텍처

엑셀 요구사항을 바탕으로 만든 React 기반 샐러드 가게 정기배송 운영 콘솔입니다. 고객 예약, 기사 배송, 관리자 정산을 한 도메인 모델로 연결하는 초기 아키텍처와 화면 골격을 포함합니다.

## 포함된 화면

- 관리자: 오늘 배송 현황, 보냉백 회수율, 고객 수동 등록, 기사/구역 관리, 정산 출력 테이블
- 기사: 출퇴근 상태, 배송 지도형 루트, 배송 상세, 완료/보냉백 회수 체크
- 고객: 잔여 회차, 달력 기반 배송일 선택, 배송 요청사항
- 아키텍처: React, Supabase, PostGIS, Realtime, 리포트 모듈 경계

## 주요 파일

- `app/page.tsx`: 역할별 운영 콘솔 화면
- `app/globals.css`: 반응형 UI 스타일
- `src/domain/types.ts`: 핵심 도메인 타입
- `src/domain/mockData.ts`: 화면 검증용 샘플 데이터와 유틸리티
- `src/domain/services.ts`: Supabase 연동 전 단계의 서비스 경계
- `docs/architecture.md`: 요구사항 분석 기반 시스템 설계
- `supabase/schema.sql`: Supabase/PostgreSQL 초안 스키마, 트리거, RLS 정책

## 실행

```bash
npm install
npm run dev
npm run build
npm test
```

## 다음 개발 순서

1. Supabase 프로젝트를 만들고 `supabase/schema.sql`을 적용합니다.
2. `src/domain/services.ts`의 mock 로직을 Supabase client 호출로 교체합니다.
3. 관리자 고객 등록 폼을 실제 insert 흐름에 연결합니다.
4. 기사 화면에 지도 SDK와 위치 권한 처리를 붙입니다.
5. 정산 테이블을 PDF/CSV 출력으로 확장합니다.
