import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Badge, Card, HeroPanel, Page, PrimaryButton, SectionTitle } from "../../components/ui";
import { lockedDays, reservedDays } from "../../data/mockData";
import { colors, spacing } from "../../theme";

export default function CustomerCalendarScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Page style={styles.page}>
        <HeroPanel
          eyebrow="나의 정기배송"
          title="10회권 중 4회 남음"
          body="배송 전날 18:00 이후에는 수정할 수 없습니다."
        >
          <View style={styles.statusRow}>
            <Badge tone="green">예약 4일</Badge>
            <Badge tone="coral">마감 1일</Badge>
          </View>
        </HeroPanel>

      <Card>
        <SectionTitle title="9월 배송일" subtitle="원하는 날짜를 눌러 예약을 변경하세요." />
        <View style={styles.calendar}>
          {Array.from({ length: 30 }, (_, index) => {
            const day = index + 1;
            const isReserved = reservedDays.includes(day);
            const isLocked = lockedDays.includes(day);
            return (
              <Pressable
                accessibilityRole="button"
                key={day}
                onPress={() => {
                  Alert.alert(
                    isLocked ? "수정 불가" : "배송일 선택",
                    isLocked
                      ? "배송 전날 18:00가 지나 변경할 수 없습니다."
                      : `${day}일 배송 예약을 변경합니다.`,
                  );
                }}
                style={[
                  styles.day,
                  isReserved && styles.reservedDay,
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
          defaultValue="공동현관 1234*, 문 앞 보냉백에 넣어주세요."
          placeholderTextColor={colors.muted}
          style={styles.textarea}
        />
        <PrimaryButton style={styles.primaryButton}>요청사항 저장</PrimaryButton>
      </Card>
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
