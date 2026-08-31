import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge, Card, MetricCard, Page, PrimaryButton, SectionTitle } from "../../components/ui";
import { deliveries } from "../../data/mockData";
import { buildDailySettlement } from "../../services/deliveryService";
import { colors } from "../../theme";

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
      <Page>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>관리자 현황</Text>
        <Text style={styles.title}>오늘 배송 운영</Text>
        <Text style={styles.muted}>
          완료, 이동 중, 보냉백 회수 상태를 한 번에 확인합니다.
        </Text>
      </View>

      <View style={styles.grid}>
        <MetricCard label="오늘 배송" value={`${deliveries.length}건`} tone="blue" />
        <MetricCard label="배송 완료" value={`${completed.length}건`} tone="green" />
        <MetricCard label="진행 중" value={`${inTransit.length}건`} tone="amber" />
        <MetricCard label="보냉백 회수" value={`${bagReturned.length}건`} tone="coral" />
      </View>

      <Card>
        <SectionTitle title="일일 정산" subtitle="완료된 배송 기준으로 집계됩니다." />
        <Text style={styles.amount}>{totalAmount.toLocaleString("ko-KR")}원</Text>
        <PrimaryButton onPress={printSettlement}>정산 PDF 출력/공유</PrimaryButton>
      </Card>

      <Card>
        <SectionTitle title="보냉백 미회수" subtitle="다음 배송 전 회수 확인이 필요합니다." />
        {deliveries
          .filter((delivery) => !delivery.insulatedBagReturned)
          .map((delivery) => (
            <View key={delivery.id} style={styles.row}>
              <View>
                <Text style={styles.name}>{delivery.customerName}</Text>
                  <Text style={styles.sub}>{delivery.address}</Text>
                </View>
              <Badge tone="coral">미회수</Badge>
            </View>
          ))}
      </Card>
      </Page>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  amount: {
    color: colors.greenDark,
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 12,
  },
  eyebrow: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: "900",
  },
  hero: {
    backgroundColor: colors.greenSoft,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
  },
  muted: {
    color: colors.muted,
    lineHeight: 21,
    marginTop: 8,
  },
  title: {
    color: colors.foreground,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 4,
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
});
