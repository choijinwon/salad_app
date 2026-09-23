# Backend Deployment

Spring Boot 백엔드는 Netlify에 직접 배포할 수 없습니다. Netlify는 프론트 정적 사이트용이고,
백엔드는 Render, Railway, Fly.io, AWS 같은 서버 호스팅이 필요합니다.

## Docker

이 백엔드는 `backend/Dockerfile`로 배포할 수 있습니다.

필수 환경변수:

```bash
DATABASE_URL=jdbc:postgresql://<host>:<port>/<database>
DATABASE_USERNAME=<database-user>
DATABASE_PASSWORD=<database-password>
SERVER_PORT=8080
JUSO_API_ENABLED=false
JUSO_API_KEY=
```

운영에서 주소 검색을 실제 도로명주소 API로 연결하려면:

```bash
JUSO_API_ENABLED=true
JUSO_API_KEY=<도로명주소 승인키>
```

## Health Check

```text
/actuator/health
```

## Render Blueprint

저장소 루트의 `render.yaml`로 Render Web Service와 Render Postgres를 함께 만들 수 있습니다.

1. Render Dashboard에서 **New > Blueprint**를 선택합니다.
2. GitHub 저장소 `choijinwon/salad_app`를 연결합니다.
3. Blueprint 파일은 기본값인 `render.yaml`을 사용합니다.
4. `ADMIN_BOOTSTRAP_PASSWORD`는 Render가 입력을 요청하면 운영자 비밀번호로 입력합니다.
5. 배포 후 생성된 백엔드 URL 뒤에 `/api`를 붙여 Netlify 환경변수 `VITE_API_BASE_URL`에 등록합니다.

예:

```text
VITE_API_BASE_URL=https://salad-app-backend.onrender.com/api
```

## Local

```bash
docker compose up -d postgres
./scripts/run-local.sh
```
