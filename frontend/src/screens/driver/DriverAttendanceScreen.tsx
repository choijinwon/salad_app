import * as Location from "expo-location";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { attendance } from "../../data/mockData";
import { colors, spacing } from "../../theme";

export default function DriverAttendanceScreen() {
  const [clockedIn, setClockedIn] = useState(true);
  const [lastTime, setLastTime] = useState("08:42");

  async function handleAttendance() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("위치 권한 필요", "출퇴근 위치 인증을 위해 위치 권한이 필요합니다.");
      return;
    }

    const now = new Date();
    const formatted = now.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setClockedIn((value) => !value);
    setLastTime(formatted);
    Alert.alert(clockedIn ? "퇴근 처리" : "출근 처리", `${formatted} 기록 완료`);
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>기사 근태</Text>
        <Text style={styles.title}>{clockedIn ? "출근 중" : "퇴근 상태"}</Text>
        <Text style={styles.muted}>최근 기록 {lastTime}</Text>
      </View>

      <Pressable accessibilityRole="button" onPress={handleAttendance} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>{clockedIn ? "퇴근하기" : "출근하기"}</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>오늘 기사 현황</Text>
        {attendance.map((item) => (
          <View key={item.id} style={styles.row}>
            <View>
              <Text style={styles.name}>{item.driverName}</Text>
              <Text style={styles.sub}>
                {item.clockInTime ?? "-"} 출근 / {item.clockOutTime ?? "배송 중"}
              </Text>
            </View>
            <Text style={styles.badge}>출근</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    padding: spacing.page,
  },
  hero: {
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
    fontSize: 34,
    fontWeight: "900",
    marginTop: 4,
  },
  muted: {
    color: "#d7e5da",
    marginTop: 8,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: spacing.radius,
    justifyContent: "center",
    minHeight: 54,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
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
    backgroundColor: colors.mint,
    borderRadius: 999,
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
});
