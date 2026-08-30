import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { customers, drivers, zones } from "../../data/mockData";
import { colors, spacing } from "../../theme";

export default function AdminAccountsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>네이버 주문 고객 수동 등록</Text>
        <TextInput placeholder="고객명" placeholderTextColor={colors.muted} style={styles.input} />
        <TextInput placeholder="생년월일 YYYY-MM-DD" placeholderTextColor={colors.muted} style={styles.input} />
        <TextInput placeholder="연락처" placeholderTextColor={colors.muted} style={styles.input} />
        <TextInput placeholder="주소" placeholderTextColor={colors.muted} style={styles.input} />
        <Text style={styles.generated}>자동 식별 ID 예시: 이정9104127821</Text>
        <Pressable accessibilityRole="button" style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>고객 등록</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>배송 구역</Text>
        {zones.map((zone) => (
          <View key={zone.id} style={styles.row}>
            <View>
              <Text style={styles.name}>{zone.name}</Text>
              <Text style={styles.sub}>{zone.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>기사 계정</Text>
        {drivers.map((driver) => (
          <View key={driver.id} style={styles.row}>
            <View>
              <Text style={styles.name}>{driver.name}</Text>
              <Text style={styles.sub}>
                {driver.zoneName} / {driver.vehicleNumber}
              </Text>
            </View>
            <Text style={styles.badge}>{driver.isActive ? "활성" : "비활성"}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>등록 고객</Text>
        {customers.map((customer) => (
          <View key={customer.id} style={styles.row}>
            <View>
              <Text style={styles.name}>{customer.name}</Text>
              <Text style={styles.sub}>{customer.uniqueCode}</Text>
            </View>
            <Text style={styles.count}>{customer.remainingCount}회</Text>
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
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  cardTitle: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: "900",
  },
  input: {
    backgroundColor: "#fbfdf9",
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
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
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: spacing.radius,
    justifyContent: "center",
    minHeight: 46,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "900",
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
  count: {
    color: colors.greenDark,
    fontWeight: "900",
  },
});
