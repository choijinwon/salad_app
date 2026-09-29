# 샐러드 정기배송 Ionic 앱

Ionic React + Capacitor 기반 고객/기사 앱, 관리자 웹 콘솔입니다. 고객 배송일 예약, 기사 출퇴근/배송 지도, 관리자 운영/배송 배정 화면을 포함합니다.

## 실행

```bash
npm install
npm run serve:ionic
```

## 빌드

```bash
npm run build:ionic
npm run sync:ionic
```

고객/기사 APK를 별도로 만들 때는 빌드 변수를 나눠서 사용합니다.

```bash
VITE_APP_VARIANT=customer VITE_API_BASE_URL=https://saltest1.netlify.app/api npm run build
npm run icons:customer
APP_VARIANT=customer npx cap sync android
APP_VARIANT=customer ./android/gradlew -p android assembleDebug

VITE_APP_VARIANT=driver VITE_API_BASE_URL=https://saltest1.netlify.app/api npm run build
npm run icons:driver
APP_VARIANT=driver npx cap sync android
APP_VARIANT=driver ./android/gradlew -p android assembleDebug
```

## iOS / Android 열기

```bash
npm run ios:ionic
npm run android:ionic
```

## 주요 구조

- `src/main.tsx`: Ionic React 앱 엔트리
- `src/ionic/IonicSaladApp.tsx`: 고객/기사/관리자 화면
- `src/ionic/springApi.ts`: API 클라이언트
- `netlify/functions/api.cjs`: Netlify Functions 데모 API
- `capacitor.config.ts`: iOS/Android Capacitor 설정

## 환경변수

```bash
VITE_API_BASE_URL=http://localhost:8080/api
```
