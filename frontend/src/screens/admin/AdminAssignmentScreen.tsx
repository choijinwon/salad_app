import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Badge, Card, ErrorState, Page, PrimaryButton, SectionTitle, Spinner } from "../../components/ui";
import {
  ApiService,
  type DeliveryResponse,
  type DeliveryZoneResponse,
  type DriverResponse,
} from "../../services/apiService";
import { formatDateToIso } from "../../services/deliveryService";
import { colors, spacing } from "../../theme";

export default function AdminAssignmentScreen() {
  const today = formatDateToIso(new Date());
  const [date, setDate] = useState(today);
  const [deliveries, setDeliveries] = useState<DeliveryResponse[]>([]);
  const [drivers, setDrivers] = useState<DriverResponse[]>([]);
  const [zones, setZones] = useState<DeliveryZoneResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [items, driverItems, zoneItems] = await Promise.all([
        ApiService.getAssignments(date),
        ApiService.getDrivers(),
        ApiService.getZones(),
      ]);
      setDeliveries(items);
      setDrivers(driverItems);
      setZones(zoneItems);
    } catch (e) {
      setError(e instanceof Error ? e.message : "배정 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  async function assign(deliveryId: string, driverId?: string | null, zoneId?: string | null) {
    setSubmitting(true);
    try {
      await ApiService.assignDriver(deliveryId, { driverId, zoneId });
      await load();
    } catch (e) {
      Alert.alert("배정 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  async function runAction(action: "auto" | "copy" | "reset") {
    setSubmitting(true);
    try {
      if (action === "auto") {
        await ApiService.autoAssign(date);
      }
      if (action === "copy") {
        await ApiService.copyAssignments(today, date);
      }
      if (action === "reset") {
        await ApiService.resetAssignments(date);
      }
      await load();
    } catch (e) {
      Alert.alert("처리 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Page>
        <Card style={styles.card}>
          <SectionTitle title="배송 배정" subtitle="날짜별 기사와 구역을 수동 또는 자동으로 배정합니다." />
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <View style={styles.actions}>
            <PrimaryButton disabled={submitting} onPress={() => runAction("auto")}>
              자동 배정
            </PrimaryButton>
            <PrimaryButton disabled={submitting} onPress={() => runAction("copy")} tone="slate">
              오늘 배정 복사
            </PrimaryButton>
            <PrimaryButton disabled={submitting} onPress={() => runAction("reset")} tone="coral">
              초기화
            </PrimaryButton>
          </View>
        </Card>

        {loading ? (
          <Spinner label="배정 불러오는 중" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <Card style={styles.card}>
            <SectionTitle title="배송 목록" subtitle={`${deliveries.length}건`} />
            {deliveries.map((delivery) => (
              <View key={delivery.id} style={styles.row}>
                <View style={styles.rowBody}>
                  <Text style={styles.name}>{delivery.customerName}</Text>
                  <Text style={styles.sub}>{delivery.address}</Text>
                  <View style={styles.badges}>
                    <Badge tone={delivery.driverId ? "green" : "amber"}>
                      {delivery.driverName || "기사 미배정"}
                    </Badge>
                    <Badge tone={delivery.zoneId ? "blue" : "slate"}>
                      {delivery.zoneName || "구역 미배정"}
                    </Badge>
                  </View>
                  <View style={styles.chips}>
                    {drivers.map((driver) => (
                      <Chip
                        key={driver.id}
                        label={driver.name}
                        selected={delivery.driverId === driver.id}
                        onPress={() => assign(delivery.id, driver.id, delivery.zoneId)}
                      />
                    ))}
                    {zones.map((zone) => (
                      <Chip
                        key={zone.id}
                        label={zone.zoneName}
                        selected={delivery.zoneId === zone.id}
                        onPress={() => assign(delivery.id, delivery.driverId, zone.id)}
                      />
                    ))}
                  </View>
                </View>
              </View>
            ))}
            {deliveries.length === 0 ? <Text style={styles.sub}>배정할 배송이 없습니다.</Text> : null}
          </Card>
        )}
      </Page>
    </ScrollView>
  );
}

function Chip({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 8,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  card: {
    gap: 10,
  },
  chip: {
    backgroundColor: colors.background,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  chipSelected: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  chipText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
  },
  chipTextSelected: {
    color: colors.panel,
  },
  content: {
    paddingBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    color: colors.foreground,
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  name: {
    color: colors.foreground,
    fontWeight: "900",
  },
  row: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  rowBody: {
    flex: 1,
  },
  sub: {
    color: colors.muted,
    lineHeight: 20,
    marginTop: 3,
  },
});
