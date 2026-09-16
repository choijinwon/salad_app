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

## Local

```bash
docker compose up -d postgres
./scripts/run-local.sh
```
