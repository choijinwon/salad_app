import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge, Card, ErrorState, HeroPanel, Page, PrimaryButton, SectionTitle, Spinner } from "../../components/ui";
import { ApiService, type AttendanceResponse, type DriverResponse } from "../../services/apiService";
import { colors } from "../../theme";
import type { Session } from "../../types";

export default function DriverAttendanceScreen({ user }: { user: Session }) {
  const [attendances, setAttendances] = useState<AttendanceResponse[]>([]);
  const [drivers, setDrivers] = useState<DriverResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const myAttendance = attendances.find((item) => item.driverId === user.id);
  const clockedIn = !!myAttendance?.clockInTime && !myAttendance?.clockOutTime;
  const lastTime = clockedIn
    ? formatTime(myAttendance?.clockInTime)
    : formatTime(myAttendance?.clockOutTime);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [att, drv] = await Promise.all([
        ApiService.getTodayDriverAttendances(),
        ApiService.getDrivers(),
      ]);
      setAttendances(att);
      setDrivers(drv);
    } catch (e) {
      setError(e instanceof Error ? e.message : "근태 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAttendance() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("위치 권한 필요", "출퇴근 위치 인증을 위해 위치 권한이 필요합니다.");
      return;
    }

    setActionLoading(true);
    try {
      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;
      const result = clockedIn
        ? await ApiService.clockOutDriver(user.id, latitude, longitude)
        : await ApiService.clockInDriver(user.id, latitude, longitude);
      setAttendances((prev) => {
        const filtered = prev.filter((item) => item.driverId !== user.id);
        return [...filtered, result];
      });
      Alert.alert(
        result.status === "CLOCKED_OUT" ? "퇴근 처리" : "출근 처리",
        `${formatTime(result.clockOutTime ?? result.clockInTime)} 기록 완료`,
      );
    } catch (e) {
      Alert.alert("처리 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Page>
        <HeroPanel
          eyebrow="기사 근태"
          title={clockedIn ? "출근 중" : "퇴근 상태"}
          body={lastTime ? `최근 기록 ${lastTime}` : "출퇴근 버튼으로 기록합니다."}
        >
          <View style={styles.statusRow}>
            <Badge tone={clockedIn ? "green" : "slate"}>
              {clockedIn ? "근무 활성" : "대기"}
            </Badge>
          </View>
        </HeroPanel>

        <PrimaryButton
          disabled={actionLoading}
          onPress={handleAttendance}
          tone={clockedIn ? "slate" : "green"}
        >
          {actionLoading ? "기록 중..." : clockedIn ? "퇴근하기" : "출근하기"}
        </PrimaryButton>

        {loading ? (
          <Spinner label="근태 현황 불러오는 중" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <Card>
            <SectionTitle title="오늘 기사 현황" subtitle="출근 시간과 현재 근무 상태입니다." />
            {attendances.map((item) => (
              <View key={item.id ?? item.driverId} style={styles.row}>
                <View>
                  <Text style={styles.name}>{driverName(drivers, item.driverId)}</Text>
                  <Text style={styles.sub}>
                    {formatTime(item.clockInTime) ?? "-"} 출근 /
                    {" "}{item.clockOutTime ? `${formatTime(item.clockOutTime)} 퇴근` : "배송 중"}
                  </Text>
                </View>
                <Badge tone={item.status === "CLOCKED_OUT" ? "slate" : "green"}>
                  {item.status === "CLOCKED_OUT" ? "퇴근" : "출근"}
                </Badge>
              </View>
            ))}
            {attendances.length === 0 ? (
              <Text style={styles.empty}>아직 출근한 기사가 없습니다.</Text>
            ) : null}
          </Card>
        )}
      </Page>
    </ScrollView>
  );
}

function driverName(drivers: DriverResponse[], driverId: string) {
  return drivers.find((item) => item.id === driverId)?.name ?? driverId.slice(0, 8);
}

function formatTime(iso: string | null | undefined) {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
  empty: {
    color: colors.muted,
    paddingVertical: 8,
  },
});