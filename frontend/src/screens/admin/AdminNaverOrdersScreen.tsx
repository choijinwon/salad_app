import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Badge, Card, ErrorState, Page, PrimaryButton, SectionTitle, Spinner } from "../../components/ui";
import { ApiService, type NaverOrderResponse } from "../../services/apiService";
import { colors, spacing } from "../../theme";

export default function AdminNaverOrdersScreen() {
  const [orders, setOrders] = useState<NaverOrderResponse[]>([]);
  const [hopeDate, setHopeDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await ApiService.getNaverOrders());
    } catch (e) {
      setError(e instanceof Error ? e.message : "네이버 주문을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(order: NaverOrderResponse, action: "sync" | "link" | "hope" | "cancel" | "approve") {
    setSubmittingId(order.id);
    try {
      if (action === "sync") {
        setOrders(await ApiService.syncNaverOrders());
      }
      if (action === "link") {
        await ApiService.linkNaverOrder(order.id);
      }
      if (action === "hope") {
        if (!hopeDate) {
          Alert.alert("날짜 입력", "배송 희망일을 YYYYMMDD 형식으로 입력해주세요.");
          return;
        }
        await ApiService.changeNaverHopeDelivery(order.id, hopeDate, "고객 요청 배송일 변경");
      }
      if (action === "cancel") {
        await ApiService.cancelNaverOrder(order.id, "판매자 요청", "배송 일정 조정 필요");
      }
      if (action === "approve") {
        await ApiService.approveNaverCancel(order.id);
      }
      if (action !== "sync") {
        await load();
      }
    } catch (e) {
      Alert.alert("처리 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Page>
        <Card style={styles.card}>
          <SectionTitle
            title="네이버 주문"
            subtitle="주문 조회, 고객 연결, 배송 희망일 조정만 관리합니다."
          />
          <TextInput
            value={hopeDate}
            onChangeText={setHopeDate}
            placeholder="배송 희망일 YYYYMMDD"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <PrimaryButton
            onPress={() => orders[0] && run(orders[0], "sync")}
            tone="slate"
            disabled={submittingId !== null}
          >
            네이버 주문 동기화
          </PrimaryButton>
        </Card>

        {loading ? (
          <Spinner label="네이버 주문 불러오는 중" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <Card style={styles.card}>
            <SectionTitle title="주문 목록" subtitle={`${orders.length}건`} />
            {orders.map((order) => (
              <View key={order.id} style={styles.row}>
                <View style={styles.rowHeader}>
                  <Text style={styles.name}>{order.ordererName}</Text>
                  <Badge tone={order.productOrderStatus === "CANCELED" ? "coral" : "green"}>
                    {order.productOrderStatus}
                  </Badge>
                </View>
                <Text style={styles.sub}>
                  {order.productName} · 희망일 {order.hopeDeliveryYmd ?? "-"}
                </Text>
                <Text style={styles.sub}>{order.baseAddress} {order.detailedAddress}</Text>
                {order.claimStatus ? <Text style={styles.warning}>클레임: {order.claimStatus}</Text> : null}
                <View style={styles.actions}>
                  <PrimaryButton
                    onPress={() => run(order, "link")}
                    tone="slate"
                    style={styles.smallButton}
                    disabled={submittingId === order.id}
                  >
                    고객 연결
                  </PrimaryButton>
                  <PrimaryButton
                    onPress={() => run(order, "hope")}
                    tone="amber"
                    style={styles.smallButton}
                    disabled={submittingId === order.id}
                  >
                    희망일 변경
                  </PrimaryButton>
                </View>
                <View style={styles.actions}>
                  <PrimaryButton
                    onPress={() => run(order, "cancel")}
                    tone="coral"
                    style={styles.smallButton}
                    disabled={submittingId === order.id}
                  >
                    취소 요청
                  </PrimaryButton>
                  <PrimaryButton
                    onPress={() => run(order, "approve")}
                    tone="slate"
                    style={styles.smallButton}
                    disabled={submittingId === order.id}
                  >
                    취소 승인
                  </PrimaryButton>
                </View>
              </View>
            ))}
            {orders.length === 0 ? <Text style={styles.sub}>네이버 주문이 없습니다.</Text> : null}
          </Card>
        )}
      </Page>
    </ScrollView>
  );
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
  warning: {
    color: colors.coral,
    fontWeight: "900",
    marginTop: 6,
  },
});
