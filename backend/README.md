# Spring Boot Backend

샐러드 정기배송 앱의 REST API 서버입니다.

## 패키지 구조

- `auth`: 로그인, JWT, 역할 권한
- `customer`: 고객, 고유식별 ID, 네이버 주문 수동 등록
- `driver`: 기사 계정, 출퇴근
- `delivery`: 배송 일정, 상태 변경, 보냉백 회수
- `zone`: 배송 구역
- `settlement`: 일일 정산, 출력 데이터
- `common`: 공통 응답, 예외, 설정

## 실행

```bash
cp .env.example .env
# .env 파일의 DATABASE_PASSWORD 값을 로컬 전용 비밀번호로 설정하세요.
docker compose up -d postgres
gradle bootRun
```

## 환경변수

```bash
DATABASE_URL=jdbc:postgresql://localhost:5432/salad_app
DATABASE_USERNAME=salad_app
DATABASE_PASSWORD=
SERVER_PORT=8080
```
