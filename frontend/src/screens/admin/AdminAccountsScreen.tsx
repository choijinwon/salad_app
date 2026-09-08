import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Badge, Card, ErrorState, HeroPanel, Page, PrimaryButton, SectionTitle, Spinner } from "../../components/ui";
import { ApiService, type CustomerResponse, type DeliveryZoneResponse, type DriverResponse } from "../../services/apiService";
import { formatDateToIso } from "../../services/deliveryService";
import { colors, spacing } from "../../theme";

export default function AdminAccountsScreen() {
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [drivers, setDrivers] = useState<DriverResponse[]>([]);
  const [zones, setZones] = useState<DeliveryZoneResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [customerForm, setCustomerForm] = useState({ name: "", birthdate: "", phone: "", address: "" });
  const [orderZoneId, setOrderZoneId] = useState<string | null>(null);

  const [zoneForm, setZoneForm] = useState({ zoneName: "", description: "" });
  const [driverForm, setDriverForm] = useState({ name: "", phone: "", vehicleNumber: "" });
  const [driverZoneId, setDriverZoneId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cus, drv, zon] = await Promise.all([
        ApiService.getCustomers(),
        ApiService.getDrivers(),
        ApiService.getZones(),
      ]);
      setCustomers(cus);
      setDrivers(drv);
      setZones(zon);
    } catch (e) {
      setError(e instanceof Error ? e.message : "데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRegisterCustomer() {
    if (!customerForm.name || !customerForm.birthdate || !customerForm.phone || !customerForm.address) {
      Alert.alert("입력 필요", "고객명, 생년월일, 연락처, 주소를 모두 입력해주세요.");
      return;
    }
    if (!orderZoneId) {
      Alert.alert("구역 선택", "배송 구역을 선택해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await ApiService.registerManualCustomer({
        name: customerForm.name,
        phone: customerForm.phone,
        birthdate: customerForm.birthdate,
        address: customerForm.address,
        zoneId: orderZoneId,
        orderSource: "NAVER",
        totalCount: 10,
        unitPrice: 8900,
        startDate: formatDateToIso(new Date()),
      });
      Alert.alert("고객 등록 완료", `식별 ID: ${result.uniqueCode}`);
      setCustomerForm({ name: "", birthdate: "", phone: "", address: "" });
      await load();
    } catch (e) {
      Alert.alert("등록 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateZone() {
    if (!zoneForm.zoneName) {
      Alert.alert("입력 필요", "구역명을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await ApiService.createZone(zoneForm);
      setZoneForm({ zoneName: "", description: "" });
      await load();
    } catch (e) {
      Alert.alert("등록 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateDriver() {
    if (!driverForm.name || !driverForm.phone) {
      Alert.alert("입력 필요", "기사명과 연락처를 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await ApiService.createDriver({
        name: driverForm.name,
        phone: driverForm.phone,
        zoneId: driverZoneId,
        vehicleNumber: driverForm.vehicleNumber,
      });
      setDriverForm({ name: "", phone: "", vehicleNumber: "" });
      setDriverZoneId(null);
      await load();
    } catch (e) {
      Alert.alert("등록 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Page>
        <HeroPanel
          eyebrow="계정 관리"
          title="고객과 기사 운영"
          body="네이버 주문 고객을 등록하고 배송 구역과 기사 계정을 관리합니다."
          tone="light"
        />

        {loading ? (
          <Spinner label="데이터 불러오는 중" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <>
            <Card style={styles.card}>
              <SectionTitle title="네이버 주문 고객 수동 등록" subtitle="고유식별 ID는 입력 정보 기준으로 생성됩니다." />
              <TextInput
                placeholder="고객명"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={customerForm.name}
                onChangeText={(text) => setCustomerForm((prev) => ({ ...prev, name: text }))}
              />
              <TextInput
                placeholder="생년월일 YYYY-MM-DD"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={customerForm.birthdate}
                onChangeText={(text) => setCustomerForm((prev) => ({ ...prev, birthdate: text }))}
                autoCapitalize="none"
              />
              <TextInput
                placeholder="연락처"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={customerForm.phone}
                onChangeText={(text) => setCustomerForm((prev) => ({ ...prev, phone: text }))}
              />
              <TextInput
                placeholder="주소"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={customerForm.address}
                onChangeText={(text) => setCustomerForm((prev) => ({ ...prev, address: text }))}
              />
              <View style={styles.chips}>
                {zones.map((zone) => (
                  <ZoneChip
                    key={zone.id}
                    label={zone.zoneName}
                    selected={orderZoneId === zone.id}
                    onPress={() => setOrderZoneId(zone.id)}
                  />
                ))}
              </View>
              <Text style={styles.generated}>
                예시 자동 식별 ID: {customerForm.name || "이정"}{customerForm.birthdate.replace(/-/g, "").slice(2) || "910412"}7821
              </Text>
              <PrimaryButton disabled={submitting} onPress={handleRegisterCustomer}>
                {submitting ? "등록 중..." : "고객 등록"}
              </PrimaryButton>
            </Card>

            <Card style={styles.card}>
              <SectionTitle title="배송 구역" subtitle="기사 배정과 루트 구성 기준입니다." />
              {zones.map((zone) => (
                <View key={zone.id} style={styles.row}>
                  <View>
                    <Text style={styles.name}>{zone.zoneName}</Text>
                    <Text style={styles.sub}>{zone.description}</Text>
                  </View>
                </View>
              ))}
              <TextInput
                placeholder="새 구역명"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={zoneForm.zoneName}
                onChangeText={(text) => setZoneForm((prev) => ({ ...prev, zoneName: text }))}
              />
              <TextInput
                placeholder="구역 설명"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={zoneForm.description}
                onChangeText={(text) => setZoneForm((prev) => ({ ...prev, description: text }))}
              />
              <PrimaryButton disabled={submitting} onPress={handleCreateZone} tone="slate">
                구역 추가
              </PrimaryButton>
            </Card>

            <Card style={styles.card}>
              <SectionTitle title="기사 계정" subtitle="구역과 차량 정보를 관리합니다." />
              {drivers.map((driver) => (
                <View key={driver.id} style={styles.row}>
                  <View>
                    <Text style={styles.name}>{driver.name}</Text>
                    <Text style={styles.sub}>
                      {driver.zoneName ?? "미배정"} / {driver.vehicleNumber || "차량 미등록"}
                    </Text>
                  </View>
                  <Badge tone={driver.isActive ? "green" : "slate"}>
                    {driver.isActive ? "활성" : "비활성"}
                  </Badge>
                </View>
              ))}
              <View style={styles.chips}>
                <ZoneChip
                  label="미배정"
                  selected={driverZoneId === null}
                  onPress={() => setDriverZoneId(null)}
                />
                {zones.map((zone) => (
                  <ZoneChip
                    key={zone.id}
                    label={zone.zoneName}
                    selected={driverZoneId === zone.id}
                    onPress={() => setDriverZoneId(zone.id)}
                  />
                ))}
              </View>
              <TextInput
                placeholder="기사명"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={driverForm.name}
                onChangeText={(text) => setDriverForm((prev) => ({ ...prev, name: text }))}
              />
              <TextInput
                placeholder="연락처"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={driverForm.phone}
                onChangeText={(text) => setDriverForm((prev) => ({ ...prev, phone: text }))}
              />
              <TextInput
                placeholder="차량번호"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={driverForm.vehicleNumber}
                onChangeText={(text) => setDriverForm((prev) => ({ ...prev, vehicleNumber: text }))}
              />
              <PrimaryButton disabled={submitting} onPress={handleCreateDriver} tone="slate">
                기사 등록
              </PrimaryButton>
            </Card>

            <Card style={styles.card}>
              <SectionTitle title="등록 고객" subtitle="잔여 회차가 적은 고객을 먼저 확인하세요." />
              {customers.map((customer) => (
                <View key={customer.id} style={styles.row}>
                  <View>
                    <Text style={styles.name}>{customer.name}</Text>
                    <Text style={styles.sub}>{customer.uniqueCode}</Text>
                  </View>
                  <Text style={styles.count}>{customer.zoneId ? "등록" : "-"}</Text>
                </View>
              ))}
              {customers.length === 0 ? <Text style={styles.sub}>등록된 고객이 없습니다.</Text> : null}
            </Card>
          </>
        )}
      </Page>
    </ScrollView>
  );
}

function ZoneChip({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 8,
  },
  card: {
    gap: 10,
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
  generated: {
    backgroundColor: colors.panelStrong,
    borderRadius: spacing.radius,
    color: colors.greenDark,
    fontWeight: "900",
    padding: 12,
  },
  row: {
    alignItems: "center",
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  name: {
    color: colors.foreground,
    fontWeight: "900",
  },
  sub: {
    color: colors.muted,
    lineHeight: 20,
    marginTop: 3,
  },
  count: {
    color: colors.greenDark,
    fontWeight: "900",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: colors.background,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  chipText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  chipTextSelected: {
    color: colors.panel,
  },
});