import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge, Card, ErrorState, MetricCard, Page, PrimaryButton, SectionTitle, Spinner } from "../../components/ui";
import { ApiService, type DailySettlementResponse, type DashboardResponse } from "../../services/apiService";
import { colors } from "../../theme";

export default function AdminDashboardScreen() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [settlement, setSettlement] = useState<DailySettlementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, sett] = await Promise.all([
        ApiService.getDashboard(),
        ApiService.getDailySettlement(),
      ]);
      setDashboard(dash);
      setSettlement(sett);
    } catch (e) {
      setError(e instanceof Error ? e.message : "현황을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function printSettlement() {
    if (!settlement) return;
    const rowsHtml = settlement.rows
      .map(
        (row) => `
        <tr>
          <td>${row.customerId}</td>
          <td>${row.status}</td>
          <td>${row.insulatedBagReturned ? "회수" : "미회수"}</td>
          <td>${row.deductedCount}회</td>
          <td style="text-align:right">${row.amount.toLocaleString("ko-KR")}원</td>
        </tr>`,
      )
      .join("");

    const html = `
      <html>
        <body style="font-family:sans-serif;padding:24px">
          <h1>샐러드 일일 배송 및 정산 리포트</h1>
          <p>정산 일자: ${settlement.settlementDate}</p>
          <p>총 배송: ${settlement.totalDeliveryCount}건 / 완료: ${settlement.completedDeliveryCount}건 / 보냉백 회수: ${settlement.bagReturnedCount}건</p>
          <h2>정산 합계: ${settlement.totalAmount.toLocaleString("ko-KR")}원</h2>
          <table style="width:100%;border-collapse:collapse;margin-top:16px">
            <thead>
              <tr style="background:#EAF7F0">
                <th style="border:1px solid #ccc;padding:8px;text-align:left">고객ID</th>
                <th style="border:1px solid #ccc;padding:8px;text-align:left">상태</th>
                <th style="border:1px solid #ccc;padding:8px;text-align:left">보냉백</th>
                <th style="border:1px solid #ccc;padding:8px;text-align:left">차감</th>
                <th style="border:1px solid #ccc;padding:8px;text-align:right">금액</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
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

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Page>
          <Spinner label="현황 불러오는 중" />
        </Page>
      </ScrollView>
    );
  }

  if (error || !dashboard) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Page>
          <ErrorState message={error ?? "현황이 없습니다."} onRetry={load} />
        </Page>
      </ScrollView>
    );
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
          <MetricCard label="오늘 배송" value={`${dashboard.totalCount}건`} tone="blue" />
          <MetricCard label="배송 완료" value={`${dashboard.completedCount}건`} tone="green" />
          <MetricCard label="진행 중" value={`${dashboard.inTransitCount + dashboard.pendingCount}건`} tone="amber" />
          <MetricCard label="보냉백 회수" value={`${dashboard.bagReturnedCount}건`} tone="coral" />
        </View>

        {settlement ? (
          <Card>
            <SectionTitle title="일일 정산" subtitle="완료된 배송 기준으로 집계됩니다." />
            <Text style={styles.amount}>{settlement.totalAmount.toLocaleString("ko-KR")}원</Text>
            <PrimaryButton onPress={printSettlement}>정산 PDF 출력/공유</PrimaryButton>
          </Card>
        ) : null}

        <Card>
          <SectionTitle title="보냉백 미회수" subtitle="다음 배송 전 회수 확인이 필요합니다." />
          {dashboard.unreturnedBags.map((row) => (
            <View key={row.customerId} style={styles.row}>
              <View>
                <Text style={styles.name}>{row.customerName}</Text>
                <Text style={styles.sub}>
                  {row.address}
                  {row.phone ? ` · ${row.phone}` : ""}
                </Text>
              </View>
              <Badge tone="coral">미회수</Badge>
            </View>
          ))}
          {dashboard.unreturnedBags.length === 0 ? (
            <Text style={styles.sub}>미회수 보냉백이 없습니다.</Text>
          ) : null}
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