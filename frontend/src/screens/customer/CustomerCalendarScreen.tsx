import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Badge, Card, ErrorState, HeroPanel, Page, PrimaryButton, SectionTitle, Spinner } from "../../components/ui";
import { canEditDeliveryDate } from "../../services/deliveryService";
import { ApiService, type DeliveryResponse, type SubscriptionResponse } from "../../services/apiService";
import { colors, spacing } from "../../theme";
import type { Session } from "../../types";

export default function CustomerCalendarScreen({ user }: { user: Session }) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionResponse[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryResponse[]>([]);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subs, customerDeliveries] = await Promise.all([
        ApiService.getMySubscriptions(user.id),
        ApiService.getCustomerDeliveries(user.id),
      ]);
      const activeDeliveries = customerDeliveries.filter((item) => item.status !== "CANCELLED");
      setSubscriptions(subs);
      setDeliveries(activeDeliveries);
      const target = activeDeliveries.find((item) => canEditDeliveryDate(toDate(item.deliveryDate)))
        ?? activeDeliveries[0];
      setNotes(target?.requestNotes ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "배송 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}-`;
  const daysInMonth = new Date(year, month, 0).getDate();

  const monthDeliveries = deliveries.filter((item) => item.deliveryDate.startsWith(monthPrefix));
  const reservedDateSet = new Set(monthDeliveries.map((item) => item.deliveryDate));
  const lockedDates = monthDeliveries.filter((item) => !canEditDeliveryDate(toDate(item.deliveryDate)));

  const subscription = subscriptions[0];

  function toDate(iso: string) {
    return new Date(`${iso}T00:00:00`);
  }

  async function handleDayPress(day: number) {
    const isoDate = `${monthPrefix}${String(day).padStart(2, "0")}`;
    const existing = monthDeliveries.find((item) => item.deliveryDate === isoDate);
    const isLocked = existing ? !canEditDeliveryDate(toDate(existing.deliveryDate)) : false;

    if (existing && isLocked) {
      Alert.alert("수정 불가", "배송 전날 18:00가 지나 변경할 수 없습니다.");
      return;
    }
    if (existing) {
      Alert.alert("예약 취소", `${day}일 배송 예약을 취소할까요?`, [
        { text: "닫기", style: "cancel" },
        {
          text: "예약 취소",
          style: "destructive",
          onPress: async () => {
            try {
              await ApiService.deleteDelivery(existing.id);
              await load();
              Alert.alert("취소 완료", `${day}일 예약이 취소되었습니다.`);
            } catch (e) {
              Alert.alert("취소 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
            }
          },
        },
      ]);
      return;
    }
    if (!subscription) {
      Alert.alert("구독 없음", "등록된 구독권이 없습니다.");
      return;
    }
    if (day <= now.getDate()) {
      Alert.alert("지난 날짜", "오늘 이후 날짜를 선택해주세요.");
      return;
    }
    Alert.alert("배송일 예약", `${day}일 배송일로 예약할까요?`, [
      { text: "닫기", style: "cancel" },
      {
        text: "예약",
        onPress: async () => {
          try {
            await ApiService.createDelivery(subscription.id, isoDate);
            await load();
            Alert.alert("예약 완료", `${day}일 배송일이 예약되었습니다.`);
          } catch (e) {
            Alert.alert("예약 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
          }
        },
      },
    ]);
  }

  async function handleSaveNotes() {
    const target =
      deliveries.find((item) => item.status === "PENDING") ??
      deliveries.find((item) => canEditDeliveryDate(toDate(item.deliveryDate))) ??
      deliveries[0];
    if (!target) {
      Alert.alert("저장 실패", "배송 일정이 없습니다.");
      return;
    }
    setSavingNotes(true);
    try {
      await ApiService.updateDelivery(target.id, { deliveryNotes: notes });
      await load();
      Alert.alert("저장 완료", "요청사항이 저장되었습니다.");
    } catch (e) {
      Alert.alert("저장 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
    } finally {
      setSavingNotes(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Page style={styles.page}>
        <HeroPanel
          eyebrow="나의 정기배송"
          title={subscription ? `${subscription.totalCount}회권 중 ${subscription.remainingCount}회 남음` : "정기배송"}
          body="배송 전날 18:00 이후에는 수정할 수 없습니다."
        >
          <View style={styles.statusRow}>
            <Badge tone="green">예약 {monthDeliveries.length}일</Badge>
            <Badge tone="coral">마감 {lockedDates.length}일</Badge>
          </View>
        </HeroPanel>

        {loading ? (
          <Spinner label="배송일 불러오는 중" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <>
            <Card>
              <SectionTitle title={`${month}월 배송일`} subtitle="원하는 날짜를 눌러 예약하거나 취소하세요." />
              <View style={styles.calendar}>
                {Array.from({ length: daysInMonth }, (_, index) => {
                  const day = index + 1;
                  const isoDate = `${monthPrefix}${String(day).padStart(2, "0")}`;
                  const isReserved = reservedDateSet.has(isoDate);
                  const isLocked = lockedDates.some((item) => item.deliveryDate === isoDate);
                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={day}
                      onPress={() => handleDayPress(day)}
                      style={[
                        styles.day,
                        isReserved && !isLocked && styles.reservedDay,
                        isLocked && styles.lockedDay,
                      ]}
                    >
                      <Text style={styles.dayText}>{day}</Text>
                      {(isReserved || isLocked) && (
                        <Text style={[styles.dayLabel, isLocked && styles.lockedLabel]}>
                          {isLocked ? "마감" : "예약"}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            <Card>
              <SectionTitle title="배송 요청사항" subtitle="기사님에게 전달될 문구입니다." />
              <TextInput
                multiline
                value={notes}
                onChangeText={setNotes}
                placeholder="예: 공동현관 1234*, 문 앞 보냉백에 넣어주세요."
                placeholderTextColor={colors.muted}
                style={styles.textarea}
              />
              <PrimaryButton disabled={savingNotes} onPress={handleSaveNotes} style={styles.primaryButton}>
                {savingNotes ? "저장 중..." : "요청사항 저장"}
              </PrimaryButton>
            </Card>
          </>
        )}
      </Page>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 8,
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  day: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    height: 52,
    justifyContent: "center",
    width: "13.3%",
  },
  reservedDay: {
    backgroundColor: colors.mint,
    borderColor: "#9fd1ab",
  },
  lockedDay: {
    backgroundColor: "#ffe6df",
    borderColor: "#f0aa99",
  },
  dayText: {
    color: colors.foreground,
    fontWeight: "900",
  },
  dayLabel: {
    color: colors.greenDark,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 1,
  },
  lockedLabel: {
    color: colors.coral,
  },
  textarea: {
    backgroundColor: colors.background,
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    color: colors.foreground,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 120,
    padding: 12,
    textAlignVertical: "top",
  },
  page: {
    paddingBottom: 18,
  },
  primaryButton: {
    marginTop: 12,
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
});