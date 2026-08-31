import * as Location from "expo-location";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge, Card, HeroPanel, Page, PrimaryButton, SectionTitle } from "../../components/ui";
import { attendance } from "../../data/mockData";
import { colors } from "../../theme";

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
      <Page>
        <HeroPanel
          eyebrow="기사 근태"
          title={clockedIn ? "출근 중" : "퇴근 상태"}
          body={`최근 기록 ${lastTime}`}
        >
          <View style={styles.statusRow}>
            <Badge tone={clockedIn ? "green" : "slate"}>
              {clockedIn ? "근무 활성" : "대기"}
            </Badge>
          </View>
        </HeroPanel>

      <PrimaryButton onPress={handleAttendance} tone={clockedIn ? "slate" : "green"}>
        {clockedIn ? "퇴근하기" : "출근하기"}
      </PrimaryButton>

      <Card>
        <SectionTitle title="오늘 기사 현황" subtitle="출근 시간과 현재 근무 상태입니다." />
        {attendance.map((item) => (
          <View key={item.id} style={styles.row}>
            <View>
              <Text style={styles.name}>{item.driverName}</Text>
              <Text style={styles.sub}>
                {item.clockInTime ?? "-"} 출근 / {item.clockOutTime ?? "배송 중"}
              </Text>
            </View>
            <Badge>출근</Badge>
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
  statusRow: {
    flexDirection: "row",
    marginTop: 14,
  },
});
