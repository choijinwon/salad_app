import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge, Card, ErrorState, HeroPanel, InfoRow, Page, SectionTitle, Spinner } from "../../components/ui";
import { ApiService, type SubscriptionResponse } from "../../services/apiService";
import { colors } from "../../theme";
import type { Session } from "../../types";

export default function CustomerMyPageScreen({ user }: { user: Session }) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getMySubscriptions(user.id);
      setSubscriptions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "구독 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Page>
        <HeroPanel
          eyebrow="내 주문"
          title="정기배송 계정"
          body={`${user.name} 님, 고유식별 ID와 잔여 회차를 확인합니다.`}
          tone="light"
        />

        {loading ? (
          <Spinner label="구독 정보 불러오는 중" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : subscriptions.length === 0 ? (
          <ErrorState message="등록된 구독권이 없습니다." />
        ) : (
          <>
            <SectionTitle title="내 구독" subtitle="앱과 네이버 주문을 함께 관리합니다." />
            {subscriptions.map((subscription) => (
              <Card key={subscription.id}>
                <View style={styles.headerRow}>
                  <View>
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.code}>{user.uniqueCode ?? "-"}</Text>
                  </View>
                  <Badge tone={subscription.orderSource === "APP" ? "blue" : "green"}>
                    {subscription.orderSource}
                  </Badge>
                </View>
                <InfoRow
                  label="잔여 회차"
                  value={`${subscription.remainingCount}/${subscription.totalCount}회`}
                />
                <InfoRow label="시작일" value={subscription.startDate} />
                <InfoRow label="단가" value={`${subscription.unitPrice.toLocaleString("ko-KR")}원`} />
                <InfoRow
                  label="상태"
                  value={subscriptionStatusLabel[subscription.status] ?? subscription.status}
                />
              </Card>
            ))}
          </>
        )}
      </Page>
    </ScrollView>
  );
}

const subscriptionStatusLabel: Record<string, string> = {
  ACTIVE: "진행 중",
  PAUSED: "일시정지",
  COMPLETED: "완료",
  CANCELLED: "취소",
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 8,
  },
  name: {
    color: colors.foreground,
    fontSize: 22,
    fontWeight: "900",
  },
  code: {
    color: colors.greenDark,
    fontWeight: "900",
    marginBottom: 12,
    marginTop: 4,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});