import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme";
import type { DeliveryResponse } from "../../services/apiService";

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

type RoutePoint = {
  latitude: number;
  longitude: number;
};

type MapPin = DeliveryResponse & {
  left: `${number}%`;
  top: `${number}%`;
};

type NaverMaps = {
  Event: {
    addListener: (target: unknown, eventName: string, listener: () => void) => void;
  };
  LatLng: new (latitude: number, longitude: number) => unknown;
  LatLngBounds: new () => {
    extend: (latLng: unknown) => void;
  };
  Map: new (
    element: HTMLElement,
    options: {
      center: unknown;
      mapDataControl?: boolean;
      scaleControl?: boolean;
      zoom: number;
      zoomControl?: boolean;
    },
  ) => { fitBounds: (bounds: unknown) => void };
  Marker: new (options: { map: unknown; position: unknown; title?: string }) => unknown;
  Polyline: new (options: {
    clickable?: boolean;
    map: unknown;
    path: unknown[];
    strokeColor: string;
    strokeOpacity: number;
    strokeWeight: number;
  }) => unknown;
};

declare global {
  interface Window {
    naver?: {
      maps?: NaverMaps;
    };
    navermap_authFailure?: () => void;
  }
}

export default function DriverRouteMap({
  deliveries,
  onSelectDelivery,
  route,
}: {
  deliveries: DeliveryResponse[];
  onSelectDelivery: (id: string) => void;
  route: RoutePoint[];
}) {
  const naverKey = getNaverMapKey();

  if (naverKey) {
    return (
      <NaverRouteMap
        deliveries={deliveries}
        naverKey={naverKey}
        onSelectDelivery={onSelectDelivery}
        route={route}
      />
    );
  }

  return (
    <FallbackRouteMap
      deliveries={deliveries}
      notice="네이버 지도 API 키를 넣으면 실제 네이버 지도로 전환됩니다."
      onSelectDelivery={onSelectDelivery}
      route={route}
    />
  );
}

function NaverRouteMap({
  deliveries,
  naverKey,
  onSelectDelivery,
  route,
}: {
  deliveries: DeliveryResponse[];
  naverKey: string;
  onSelectDelivery: (id: string) => void;
  route: RoutePoint[];
}) {
  const mapElementRef = useRef<HTMLElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let cancelled = false;

    window.navermap_authFailure = () => {
      if (!cancelled) setStatus("failed");
    };

    loadNaverMapScript(naverKey)
      .then(() => {
        if (cancelled || !mapElementRef.current || !window.naver?.maps) return;
        drawNaverMap({
          deliveries,
          mapElement: mapElementRef.current,
          onSelectDelivery,
          route,
        });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
    };
  }, [deliveries, naverKey, onSelectDelivery, route]);

  if (status === "failed") {
    return (
      <FallbackRouteMap
        deliveries={deliveries}
        notice="네이버 지도 인증을 확인해주세요. 지금은 테스트 지도로 표시합니다."
        onSelectDelivery={onSelectDelivery}
        route={route}
      />
    );
  }

  return (
    <View style={styles.mapCard}>
      <View style={styles.mapHeader}>
        <View>
          <Text style={styles.mapTitle}>네이버 배송 지도</Text>
          <Text style={styles.mapCopy}>실제 네이버 지도 API 테스트</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{route.length}곳</Text>
        </View>
      </View>
      <View
        ref={(node) => {
          mapElementRef.current = node as unknown as HTMLElement | null;
        }}
        style={styles.naverMapCanvas}
      />
      {status === "loading" ? <Text style={styles.mapNotice}>네이버 지도 불러오는 중...</Text> : null}
    </View>
  );
}

function drawNaverMap({
  deliveries,
  mapElement,
  onSelectDelivery,
  route,
}: {
  deliveries: DeliveryResponse[];
  mapElement: HTMLElement;
  onSelectDelivery: (id: string) => void;
  route: RoutePoint[];
}) {
  const naverMaps = window.naver?.maps;
  if (!naverMaps) return;

  mapElement.innerHTML = "";

  const center = route[0] ?? { latitude: 37.563, longitude: 126.918 };
  const map = new naverMaps.Map(mapElement, {
    center: new naverMaps.LatLng(center.latitude, center.longitude),
    mapDataControl: false,
    scaleControl: false,
    zoom: 14,
    zoomControl: true,
  });

  const bounds = new naverMaps.LatLngBounds();
  const path = route.map((point) => new naverMaps.LatLng(point.latitude, point.longitude));

  if (path.length > 1) {
    new naverMaps.Polyline({
      clickable: false,
      map,
      path,
      strokeColor: colors.green,
      strokeOpacity: 0.85,
      strokeWeight: 5,
    });
  }

  deliveries.forEach((delivery) => {
    if (delivery.latitude == null || delivery.longitude == null) return;
    const position = new naverMaps.LatLng(Number(delivery.latitude), Number(delivery.longitude));
    bounds.extend(position);
    const marker = new naverMaps.Marker({
      map,
      position,
      title:
        delivery.routeOrder != null
          ? `${delivery.routeOrder}. ${delivery.customerName}`
          : delivery.customerName,
    });
    naverMaps.Event.addListener(marker, "click", () => onSelectDelivery(delivery.id));
  });

  if (route.length > 0) {
    map.fitBounds(bounds);
  }
}

function loadNaverMapScript(naverKey: string) {
  if (window.naver?.maps) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>("script[data-naver-map-script='true']");
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Naver map script failed")));
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.async = true;
    script.dataset.naverMapScript = "true";
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(naverKey)}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Naver map script failed"));
    document.head.appendChild(script);
  });
}

function getNaverMapKey() {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const queryKey =
      params.get("naverMapClientId") ??
      params.get("naverMapKey") ??
      params.get("ncpKeyId");
    if (queryKey?.trim()) return queryKey.trim();
  }

  return typeof process !== "undefined"
    ? process.env?.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID?.trim()
    : undefined;
}

function FallbackRouteMap({
  deliveries,
  notice,
  onSelectDelivery,
  route,
}: {
  deliveries: DeliveryResponse[];
  notice?: string;
  onSelectDelivery: (id: string) => void;
  route: RoutePoint[];
}) {
  const pins = makePins(deliveries);

  return (
    <View style={styles.mapCard}>
      <View style={styles.mapHeader}>
        <View>
          <Text style={styles.mapTitle}>배송 지도</Text>
          <Text style={styles.mapCopy}>오늘 루트와 배송지 위치</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{route.length}곳</Text>
        </View>
      </View>
      {notice ? <Text style={styles.mapNotice}>{notice}</Text> : null}

      <View style={styles.mapCanvas}>
        <View style={[styles.zone, styles.zoneA]} />
        <View style={[styles.zone, styles.zoneB]} />
        <View style={[styles.road, styles.roadMain]} />
        <View style={[styles.road, styles.roadSecond]} />
        <View style={[styles.road, styles.roadThird]} />
        {pins.map((pin) => (
          <Pressable
            accessibilityRole="button"
            key={pin.id}
            onPress={() => onSelectDelivery(pin.id)}
            style={[styles.pinWrap, { left: pin.left, top: pin.top }]}
          >
            <View style={styles.pin}>
              <Text style={styles.pinText}>{pin.routeOrder ?? "-"}</Text>
            </View>
            <Text numberOfLines={1} style={styles.pinLabel}>
              {pin.customerName}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function makePins(deliveries: DeliveryResponse[]): MapPin[] {
  const points = deliveries.filter(
    (delivery) => delivery.latitude != null && delivery.longitude != null,
  );

  if (points.length === 0) return [];

  const latitudes = points.map((point) => Number(point.latitude));
  const longitudes = points.map((point) => Number(point.longitude));
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const latRange = maxLat - minLat || 0.01;
  const lngRange = maxLng - minLng || 0.01;

  return points.map((point) => {
    const latitude = Number(point.latitude);
    const longitude = Number(point.longitude);
    const x = 12 + ((longitude - minLng) / lngRange) * 72;
    const y = 12 + ((maxLat - latitude) / latRange) * 62;

    return {
      ...point,
      left: `${Math.round(x)}%` as `${number}%`,
      top: `${Math.round(y)}%` as `${number}%`,
    };
  });
}

const styles = StyleSheet.create({
  countBadge: {
    backgroundColor: colors.panel,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  countText: {
    color: colors.greenDark,
    fontWeight: "900",
  },
  mapCard: {
    backgroundColor: colors.slate,
    padding: 14,
  },
  mapCanvas: {
    backgroundColor: "#E7F0E7",
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 8,
    borderWidth: 1,
    height: 250,
    marginTop: 12,
    overflow: "hidden",
    position: "relative",
  },
  mapCopy: {
    color: colors.mint,
    fontWeight: "800",
    marginTop: 3,
  },
  mapHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mapNotice: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 10,
  },
  mapTitle: {
    color: colors.panel,
    fontSize: 20,
    fontWeight: "900",
  },
  naverMapCanvas: {
    backgroundColor: colors.panelStrong,
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 8,
    borderWidth: 1,
    height: 290,
    marginTop: 12,
    overflow: "hidden",
    width: "100%",
  },
  pin: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderColor: colors.panel,
    borderRadius: 999,
    borderWidth: 3,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  pinLabel: {
    backgroundColor: colors.panel,
    borderRadius: 999,
    color: colors.foreground,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 4,
    maxWidth: 82,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  pinText: {
    color: colors.panel,
    fontWeight: "900",
  },
  pinWrap: {
    alignItems: "center",
    marginLeft: -17,
    marginTop: -17,
    position: "absolute",
  },
  road: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderColor: "#D5E2D2",
    borderWidth: 1,
    position: "absolute",
  },
  roadMain: {
    height: 34,
    left: "-6%",
    top: "52%",
    transform: [{ rotate: "-12deg" }],
    width: "115%",
  },
  roadSecond: {
    height: "118%",
    left: "35%",
    top: "-8%",
    transform: [{ rotate: "28deg" }],
    width: 32,
  },
  roadThird: {
    height: 28,
    left: "5%",
    top: "22%",
    transform: [{ rotate: "18deg" }],
    width: "80%",
  },
  zone: {
    backgroundColor: "rgba(47,125,70,0.12)",
    borderRadius: 999,
    position: "absolute",
  },
  zoneA: {
    height: 120,
    left: -30,
    top: -24,
    width: 150,
  },
  zoneB: {
    bottom: -30,
    height: 140,
    right: -36,
    width: 170,
  },
});
