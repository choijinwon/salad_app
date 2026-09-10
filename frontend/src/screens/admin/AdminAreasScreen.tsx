import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Badge, Card, ErrorState, Page, PrimaryButton, SectionTitle, Spinner } from "../../components/ui";
import {
  ApiService,
  type DeliveryAreaResponse,
  type DeliveryZoneResponse,
} from "../../services/apiService";
import { colors, spacing } from "../../theme";

export default function AdminAreasScreen() {
  const [areas, setAreas] = useState<DeliveryAreaResponse[]>([]);
  const [zones, setZones] = useState<DeliveryZoneResponse[]>([]);
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [areaItems, zoneItems] = await Promise.all([
        ApiService.getAreas(),
        ApiService.getZones(),
      ]);
      setAreas(areaItems);
      setZones(zoneItems);
    } catch (e) {
      setError(e instanceof Error ? e.message : "배달 지역을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateArea(area: DeliveryAreaResponse, zoneId?: string | null) {
    setSubmittingId(area.id);
    try {
      await ApiService.updateArea(area.id, {
        deliveryFee: Number(deliveryFee) || 0,
        isActive: true,
        zoneId: zoneId ?? area.zoneId,
      });
      await load();
    } catch (e) {
      Alert.alert("수정 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
    } finally {
      setSubmittingId(null);
    }
  }

  async function deactivate(area: DeliveryAreaResponse) {
    setSubmittingId(area.id);
    try {
      await ApiService.deactivateArea(area.id);
      await load();
    } catch (e) {
      Alert.alert("비활성화 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Page>
        <Card style={styles.card}>
          <SectionTitle title="배달 지역" subtitle="동 단위 지역을 배송 구역에 연결합니다." />
          <TextInput
            value={deliveryFee}
            onChangeText={setDeliveryFee}
            keyboardType="number-pad"
            placeholder="배송비"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </Card>

        {loading ? (
          <Spinner label="지역 불러오는 중" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <Card style={styles.card}>
            <SectionTitle title="지역 목록" subtitle={`${areas.length}건`} />
            {areas.map((area) => (
              <View key={area.id} style={styles.row}>
                <View style={styles.rowHeader}>
                  <Text style={styles.name}>{area.guName} {area.dongName}</Text>
                  <Badge tone={area.active ? "green" : "slate"}>
                    {area.active ? "활성" : "비활성"}
                  </Badge>
                </View>
                <Text style={styles.sub}>
                  행정코드 {area.admCode} · 배송비 {area.deliveryFee.toLocaleString("ko-KR")}원
                </Text>
                <View style={styles.chips}>
                  {zones.map((zone) => (
                    <PrimaryButton
                      key={zone.id}
                      onPress={() => updateArea(area, zone.id)}
                      tone={area.zoneId === zone.id ? "green" : "slate"}
                      style={styles.chipButton}
                      disabled={submittingId === area.id}
                    >
                      {zone.zoneName}
                    </PrimaryButton>
                  ))}
                </View>
                <PrimaryButton
                  onPress={() => deactivate(area)}
                  tone="coral"
                  style={styles.deactivateButton}
                  disabled={submittingId === area.id}
                >
                  지역 비활성화
                </PrimaryButton>
              </View>
            ))}
            {areas.length === 0 ? <Text style={styles.sub}>등록된 배달 지역이 없습니다.</Text> : null}
          </Card>
        )}
      </Page>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  chipButton: {
    minHeight: 38,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  content: {
    paddingBottom: 8,
  },
  deactivateButton: {
    marginTop: 10,
    minHeight: 42,
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
  rowHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sub: {
    color: colors.muted,
    lineHeight: 20,
    marginTop: 3,
  },
});
