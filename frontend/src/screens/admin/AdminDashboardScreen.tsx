import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { deliveries } from "../../data/mockData";
import { buildDailySettlement } from "../../services/deliveryService";
import { colors, spacing } from "../../theme";

export default function AdminDashboardScreen() {
  const completed = deliveries.filter((delivery) => delivery.status === "DELIVERED");
  const inTransit = deliveries.filter((delivery) => delivery.status === "IN_TRANSIT");
  const bagReturned = deliveries.filter((delivery) => delivery.insulatedBagReturned);
  const totalAmount = completed.reduce((sum, delivery) => sum + delivery.unitPrice, 0);

  async function printSettlement() {
    const settlement = await buildDailySettlement(deliveries);
    const html = `
      <html>
        <body>
          <h1>샐러드 일일 배송 및 정산 리포트</h1>
          <p>총 배송: ${settlement.totalDeliveryCount}건</p>
          <p>완료: ${settlement.completedDeliveryCount}건</p>
          <p>정산 합계: ${settlement.totalAmount.toLocaleString("ko-KR")}원</p>
        </body>
      </html>
    `;
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert("PDF 생성 완료", uri);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.grid}>
        <Metric label="오늘 배송" value={`${deliveries.length}건`} />
        <Metric label="배송 완료" value={`${completed.length}건`} />
        <Metric label="진행 중" value={`${inTransit.length}건`} />
        <Metric label="보냉백 회수" value={`${bagReturned.length}건`} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>일일 정산</Text>
        <Text style={styles.amount}>{totalAmount.toLocaleString("ko-KR")}원</Text>
        <Pressable accessibilityRole="button" onPress={printSettlement} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>정산 PDF 출력/공유</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>보냉백 미회수</Text>
        {deliveries
          .filter((delivery) => !delivery.insulatedBagReturned)
          .map((delivery) => (
            <View key={delivery.id} style={styles.row}>
              <View>
                <Text style={styles.name}>{delivery.customerName}</Text>
                <Text style={styles.sub}>{delivery.address}</Text>
              </View>
              <Text style={styles.badge}>미회수</Text>
            </View>
          ))}
      </View>
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    padding: spacing.page,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metric: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    padding: 14,
    width: "48%",
  },
  metricLabel: {
    color: colors.muted,
    fontWeight: "800",
  },
  metricValue: {
    color: colors.foreground,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    padding: 16,
  },
  cardTitle: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },
  amount: {
    color: colors.greenDark,
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 12,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: spacing.radius,
    justifyContent: "center",
    minHeight: 46,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "900",
  },
  row: {
    alignItems: "center",
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  name: {
    color: colors.foreground,
    fontWeight: "900",
  },
  sub: {
    color: colors.muted,
    marginTop: 3,
  },
  badge: {
    backgroundColor: "#ffe6df",
    borderRadius: 999,
    color: colors.coral,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
});
