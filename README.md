# 샐러드 정기배송 운영 아키텍처

엑셀 요구사항을 바탕으로 만든 샐러드 가게 정기배송 앱입니다. 프론트는 React Native, 백엔드는 Spring Boot, DB는 PostgreSQL 기준으로 구성합니다.

## 포함된 화면

- 관리자: 오늘 배송 현황, 보냉백 회수율, 고객 수동 등록, 기사/구역 관리, 정산 출력 테이블
- 기사: 출퇴근 상태, 배송 지도형 루트, 배송 상세, 완료/보냉백 회수 체크
- 고객: 잔여 회차, 달력 기반 배송일 선택, 배송 요청사항
- 아키텍처: React Native, Spring Boot, PostgreSQL, 리포트 모듈 경계
- 모바일: `frontend/` Expo React Native 앱으로 Android/iOS 고객, 기사, 관리자 화면 제공

## 주요 파일

- `docs/architecture.md`: 요구사항 분석 기반 시스템 설계
- `frontend/`: Expo React Native Android/iOS 앱
- `backend/`: Spring Boot API 서버
- `database/`: PostgreSQL Flyway 마이그레이션과 개발 시드
- `docs/directory-structure.md`: 전체 폴더 구조 설명
- `docs/api.md`: 첫 REST API 엔드포인트 목록
- `docker-compose.yml`: 로컬 PostgreSQL 실행

## 실행

```bash
npm install
npm run dev
npm run build
npm test
```

## 다음 개발 순서

1. PostgreSQL 로컬 DB를 만들고 `database/migrations`를 적용합니다.
2. Spring Boot에서 고객, 기사, 배송, 구역, 정산 API를 구현합니다.
3. React Native `frontend/src/services`를 Spring Boot API 호출로 교체합니다.
4. Android/iOS 위치 권한, 지도, 알림, PDF 공유 기능을 고도화합니다.

## 모바일 앱 실행

```bash
cd frontend
npm run android
npm run ios
```

## 백엔드 실행

```bash
docker compose up -d postgres
cd backend
gradle bootRun
```
