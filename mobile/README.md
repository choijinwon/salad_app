# 샐러드 정기배송 모바일 앱

Expo React Native 기반 Android/iOS 앱입니다. 고객 배송일 예약, 기사 출퇴근/배송 지도, 관리자 현황/정산 화면을 포함합니다.

## 실행

```bash
npm install
npm run android
npm run ios
```

## 주요 구조

- `App.tsx`: 역할 선택과 역할별 탭 네비게이션
- `src/screens/customer`: 고객 예약/주문 화면
- `src/screens/driver`: 기사 출퇴근/배송지도 화면
- `src/screens/admin`: 관리자 현황/계정 화면
- `src/lib/supabase.ts`: Supabase 세션 저장 설정
- `src/services/deliveryService.ts`: 배송/정산 서비스 경계

## 환경변수

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```
