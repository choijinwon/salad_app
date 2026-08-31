import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { lockedDays, reservedDays } from "../../data/mockData";
import { colors, spacing } from "../../theme";

export default function CustomerCalendarScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.summary}>
        <Text style={styles.eyebrow}>나의 정기배송</Text>
        <Text style={styles.title}>10회권 중 4회 남음</Text>
        <Text style={styles.muted}>배송 전날 18:00 이후에는 수정할 수 없습니다.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>9월 배송일</Text>
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
                  <Text style={styles.dayLabel}>{isLocked ? "마감" : "예약"}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>배송 요청사항</Text>
        <TextInput
          multiline
          defaultValue="공동현관 1234*, 문 앞 보냉백에 넣어주세요."
          style={styles.textarea}
        />
        <Pressable accessibilityRole="button" style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>요청사항 저장</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    padding: spacing.page,
  },
  summary: {
    backgroundColor: colors.slate,
    borderRadius: spacing.radius,
    padding: 18,
  },
  eyebrow: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "900",
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 4,
  },
  muted: {
    color: "#d7e5da",
    lineHeight: 21,
    marginTop: 8,
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
    marginBottom: 12,
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  day: {
    alignItems: "center",
    backgroundColor: "#fbfdf9",
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
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
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
  },
  textarea: {
    backgroundColor: "#fbfdf9",
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    minHeight: 120,
    padding: 12,
    textAlignVertical: "top",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: spacing.radius,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 46,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "900",
  },
});
