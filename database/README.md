# PostgreSQL Database

Spring Boot 백엔드는 `backend/src/main/resources/application.yml`의 Flyway 설정으로 이 폴더의 마이그레이션을 읽습니다.

## 구조

- `migrations/`: 운영 스키마 변경 SQL
- `seeds/`: 로컬 개발용 샘플 데이터

## 로컬 기본값

- DB: `salad_app`
- User: `salad_app`
- Password: `salad_app`
