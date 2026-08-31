# Salad App

샐러드 정기배송 앱 monorepo입니다.

```text
salad_app/
├── frontend/   # React Native Expo Android/iOS 앱
└── backend/    # Spring Boot API 서버 + PostgreSQL/Flyway
```

## Frontend

```bash
cd frontend
npm install
npm run android
npm run ios
```

## Backend

```bash
cd backend
docker compose up -d postgres
gradle bootRun
```

DB 마이그레이션은 `backend/src/main/resources/db/migration/`에서 관리합니다.
