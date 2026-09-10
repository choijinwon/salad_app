import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Badge, Card, ErrorState, Page, PrimaryButton, SectionTitle, Spinner } from "../../components/ui";
import { ApiService, type DeliveryResponse } from "../../services/apiService";
import { formatDateToIso } from "../../services/deliveryService";
import { colors, spacing } from "../../theme";

export default function AdminOrdersScreen() {
  const [date, setDate] = useState(formatDateToIso(new Date()));
  const [orders, setOrders] = useState<DeliveryResponse[]>([]);
  const [includeCancelled, setIncludeCancelled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await ApiService.getAdminOrders(date, includeCancelled));
    } catch (e) {
      setError(e instanceof Error ? e.message : "주문을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [date, includeCancelled]);

  useEffect(() => {
    load();
  }, [load]);

  async function cancelOrder(order: DeliveryResponse) {
    try {
      await ApiService.adminCancelDelivery(order.id);
      await load();
    } catch (e) {
      Alert.alert("취소 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
    }
  }

  async function moveToToday(order: DeliveryResponse) {
    try {
      await ApiService.adminUpdateDelivery(order.id, { deliveryDate: formatDateToIso(new Date()) });
      await load();
    } catch (e) {
      Alert.alert("수정 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Page>
        <Card style={styles.card}>
          <SectionTitle title="관리자 주문" subtitle="배송 예약 변경과 취소 처리를 관리합니다." />
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <PrimaryButton onPress={() => setIncludeCancelled((value) => !value)} tone="slate">
            {includeCancelled ? "취소 제외" : "취소 포함"}
          </PrimaryButton>
        </Card>

        {loading ? (
          <Spinner label="주문 불러오는 중" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <Card style={styles.card}>
            <SectionTitle title="주문 목록" subtitle={`${orders.length}건`} />
            {orders.map((order) => (
              <View key={order.id} style={styles.row}>
                <View style={styles.rowHeader}>
                  <Text style={styles.name}>{order.customerName}</Text>
                  <Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge>
                </View>
                <Text style={styles.sub}>{order.deliveryDate} · {order.address}</Text>
                <Text style={styles.note}>{order.requestNotes || "요청사항 없음"}</Text>
                <View style={styles.actions}>
                  <PrimaryButton onPress={() => moveToToday(order)} tone="slate" style={styles.smallButton}>
                    오늘로 변경
                  </PrimaryButton>
                  <PrimaryButton onPress={() => cancelOrder(order)} tone="coral" style={styles.smallButton}>
                    주문 취소
                  </PrimaryButton>
                </View>
              </View>
            ))}
            {orders.length === 0 ? <Text style={styles.sub}>표시할 주문이 없습니다.</Text> : null}
          </Card>
        )}
      </Page>
    </ScrollView>
  );
}

function statusLabel(status: DeliveryResponse["status"]) {
  if (status === "DELIVERED") return "완료";
  if (status === "IN_TRANSIT") return "배송 중";
  if (status === "CANCELLED") return "취소";
  if (status === "SKIPPED") return "건너뜀";
  return "대기";
}

function statusTone(status: DeliveryResponse["status"]) {
  if (status === "DELIVERED") return "green";
  if (status === "IN_TRANSIT") return "blue";
  if (status === "CANCELLED") return "coral";
  return "amber";
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  card: {
    gap: 10,
  },
  content: {
    paddingBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    color: colors.foreground,
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  name: {
    color: colors.foreground,
    fontWeight: "900",
  },
  note: {
    color: colors.blue,
    fontWeight: "800",
    marginTop: 6,
  },
  row: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  rowHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  smallButton: {
    flex: 1,
    minHeight: 42,
  },
  sub: {
    color: colors.muted,
    lineHeight: 20,
    marginTop: 3,
  },
});
