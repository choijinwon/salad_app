import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Badge, Card, HeroPanel, Page, PrimaryButton, SectionTitle } from "../../components/ui";
import { customers, drivers, zones } from "../../data/mockData";
import { colors, spacing } from "../../theme";

export default function AdminAccountsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Page>
      <HeroPanel
        eyebrow="계정 관리"
        title="고객과 기사 운영"
        body="네이버 주문 고객을 등록하고 배송 구역과 기사 계정을 확인합니다."
        tone="light"
      />

      <Card style={styles.card}>
        <SectionTitle title="네이버 주문 고객 수동 등록" subtitle="고유식별 ID는 입력 정보 기준으로 생성됩니다." />
        <TextInput placeholder="고객명" placeholderTextColor={colors.muted} style={styles.input} />
        <TextInput placeholder="생년월일 YYYY-MM-DD" placeholderTextColor={colors.muted} style={styles.input} />
        <TextInput placeholder="연락처" placeholderTextColor={colors.muted} style={styles.input} />
        <TextInput placeholder="주소" placeholderTextColor={colors.muted} style={styles.input} />
        <Text style={styles.generated}>자동 식별 ID 예시: 이정9104127821</Text>
        <PrimaryButton>고객 등록</PrimaryButton>
      </Card>

      <Card style={styles.card}>
        <SectionTitle title="배송 구역" subtitle="기사 배정과 루트 구성 기준입니다." />
        {zones.map((zone) => (
          <View key={zone.id} style={styles.row}>
            <View>
              <Text style={styles.name}>{zone.name}</Text>
              <Text style={styles.sub}>{zone.description}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Card style={styles.card}>
        <SectionTitle title="기사 계정" subtitle="구역과 차량 정보를 확인합니다." />
        {drivers.map((driver) => (
          <View key={driver.id} style={styles.row}>
            <View>
              <Text style={styles.name}>{driver.name}</Text>
              <Text style={styles.sub}>
                {driver.zoneName} / {driver.vehicleNumber}
              </Text>
            </View>
            <Badge tone={driver.isActive ? "green" : "slate"}>
              {driver.isActive ? "활성" : "비활성"}
            </Badge>
          </View>
        ))}
      </Card>

      <Card style={styles.card}>
        <SectionTitle title="등록 고객" subtitle="잔여 회차가 적은 고객을 먼저 확인하세요." />
        {customers.map((customer) => (
          <View key={customer.id} style={styles.row}>
            <View>
              <Text style={styles.name}>{customer.name}</Text>
              <Text style={styles.sub}>{customer.uniqueCode}</Text>
            </View>
            <Text style={styles.count}>{customer.remainingCount}회</Text>
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
});
