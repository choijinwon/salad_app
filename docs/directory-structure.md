# 폴더 디렉토리 구조

```text
salad_app/
├── frontend/                     # React Native Expo 앱
│   ├── App.tsx
│   ├── app.json                  # Android/iOS 권한, 앱 이름, 패키지 설정
│   ├── package.json
│   └── src/
│       ├── data/                 # 임시 mock 데이터
│       ├── lib/                  # Supabase client 등 외부 SDK 설정
│       ├── screens/
│       │   ├── admin/            # 관리자: 현황, 정산, 계정/구역 관리
│       │   ├── customer/         # 고객: 배송일 선택, 주문/잔여회차
│       │   └── driver/           # 기사: 출퇴근, 배송지도, 완료/회수
│       ├── services/             # API 연동 전 비즈니스 함수 경계
│       ├── theme.ts
│       └── types.ts
├── backend/                      # Spring Boot API 서버
│   ├── build.gradle
│   ├── settings.gradle
│   └── src/
│       ├── main/
│       │   ├── java/com/saladapp/
│       │   │   ├── auth/         # 인증/권한
│       │   │   ├── common/       # 공통 응답, 예외, 설정
│       │   │   ├── customer/     # 고객/고유식별 ID
│       │   │   ├── delivery/     # 배송 일정/상태
│       │   │   ├── driver/       # 기사/출퇴근
│       │   │   ├── settlement/   # 정산/리포트
│       │   │   └── zone/         # 배송 구역
│       │   └── resources/
│       │       └── application.yml
│       └── test/
├── database/                     # PostgreSQL 스키마
│   ├── migrations/
│   │   └── V1__create_core_schema.sql
│   └── seeds/
│       └── dev_seed.sql
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── directory-structure.md
├── docker-compose.yml
├── .env.example
└── README.md
```

## 개발 흐름

1. `database/migrations`에서 PostgreSQL 테이블을 관리합니다.
2. `backend` Spring Boot가 Flyway로 마이그레이션을 적용하고 REST API를 제공합니다.
3. `frontend` React Native 앱이 고객, 기사, 관리자 화면에서 Spring Boot API를 호출합니다.
