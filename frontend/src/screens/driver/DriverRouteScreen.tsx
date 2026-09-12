import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Badge, Card, ErrorState, PrimaryButton, SectionTitle, Spinner } from "../../components/ui";
import { ApiService, type DeliveryResponse } from "../../services/apiService";
import { colors, spacing } from "../../theme";
import type { Session } from "../../types";
import DriverRouteMap from "./DriverRouteMap";

export default function DriverRouteScreen({ user }: { user: Session }) {
  const [deliveries, setDeliveries] = useState<DeliveryResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [bagReturned, setBagReturned] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getTodayDeliveries(user.id);
      setDeliveries(data);
      setSelectedId((prev) => prev ?? data[0]?.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "배송 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = deliveries.find((delivery) => delivery.id === selectedId) ?? null;
  const route = deliveries
    .filter((delivery) => delivery.latitude != null && delivery.longitude != null)
    .map((delivery) => ({
      latitude: Number(delivery.latitude),
      longitude: Number(delivery.longitude),
    }));

  useEffect(() => {
    if (selected) setBagReturned(selected.insulatedBagReturned);
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleComplete() {
    if (!selected) return;
    setCompleting(true);
    try {
      const result = await ApiService.completeDelivery(selected.id, bagReturned);
      setDeliveries((prev) =>
        prev.map((item) =>
          item.id === selected.id ? ({ ...item, ...result } as DeliveryResponse) : item,
        ),
      );
      Alert.alert("배송 완료", bagReturned ? "보냉백 회수와 함께 저장했습니다." : "보냉백 미회수로 저장했습니다.");
    } catch (e) {
      Alert.alert("처리 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
    } finally {
      setCompleting(false);
    }
  }

  return (
    <View style={styles.screen}>
      {loading ? (
        <Spinner label="배송 루트 불러오는 중" style={styles.center} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <DriverRouteMap deliveries={deliveries} route={route} onSelectDelivery={setSelectedId} />

          <ScrollView contentContainerStyle={styles.sheet}>
            <SectionTitle
              title="오늘 배송 루트"
              subtitle={`${deliveries.length}개 배송지, 선택한 고객의 요청사항을 확인하세요.`}
            />
            {deliveries.map((delivery) => (
              <Pressable
                accessibilityRole="button"
                key={delivery.id}
                onPress={() => setSelectedId(delivery.id)}
                style={({ pressed }) => [
                  styles.routeCard,
                  selectedId === delivery.id && styles.selectedCard,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.routeNo}>
                  {delivery.routeOrder != null ? `#${delivery.routeOrder}` : "#-"}
                </Text>
                <View style={styles.routeBody}>
                  <View style={styles.routeHeader}>
                    <Text style={styles.name}>{delivery.customerName}</Text>
                    <Badge tone={statusTone[delivery.status] ?? "amber"}>
                      {statusLabel[delivery.status] ?? delivery.status}
                    </Badge>
                  </View>
                  <Text style={styles.sub}>{delivery.address}</Text>
                  {delivery.requestNotes ? <Text style={styles.notes}>{delivery.requestNotes}</Text> : null}
                </View>
              </Pressable>
            ))}

            {selected ? (
              <Card style={styles.detail}>
                <SectionTitle title={`${selected.customerName} 상세`} subtitle={selected.address} />
                <View style={styles.bagRow}>
                  <Text style={styles.bagLabel}>보냉백 회수</Text>
                  <Switch
                    value={bagReturned}
                    onValueChange={setBagReturned}
                    trackColor={{ false: colors.line, true: colors.green }}
                    thumbColor={colors.panel}
                  />
                </View>
                <PrimaryButton
                  disabled={completing || selected.status === "DELIVERED"}
                  onPress={handleComplete}
                  style={styles.primaryButton}
                >
                  {selected.status === "DELIVERED"
                    ? "배송 완료됨"
                    : completing
                      ? "저장 중..."
                      : "배송 완료 / 보냉백 체크"}
                </PrimaryButton>
              </Card>
            ) : null}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const statusLabel: Record<string, string> = {
  DELIVERED: "완료",
  IN_TRANSIT: "이동 중",
  PENDING: "대기",
  SKIPPED: "건너뜀",
};

const statusTone: Record<string, "green" | "blue" | "amber" | "coral" | "slate"> = {
  DELIVERED: "green",
  IN_TRANSIT: "blue",
  PENDING: "amber",
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  center: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.background,
    gap: 10,
    padding: spacing.page,
  },
  routeCard: {
    alignItems: "flex-start",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  selectedCard: {
    borderColor: colors.green,
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.78,
  },
  routeNo: {
    color: colors.greenDark,
    fontWeight: "900",
    minWidth: 34,
  },
  routeBody: {
    flex: 1,
    gap: 4,
  },
  routeHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "900",
  },
  sub: {
    color: colors.muted,
    lineHeight: 20,
  },
  notes: {
    color: colors.blue,
    fontWeight: "800",
  },
  detail: {
    gap: 8,
  },
  bagRow: {
    alignItems: "center",
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  bagLabel: {
    color: colors.foreground,
    fontWeight: "800",
  },
  primaryButton: {
    marginTop: 8,
  },
});
