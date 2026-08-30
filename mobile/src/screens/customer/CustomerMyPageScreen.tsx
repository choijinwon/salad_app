import { ScrollView, StyleSheet, Text, View } from "react-native";
import { customers } from "../../data/mockData";
import { colors, spacing } from "../../theme";

export default function CustomerMyPageScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      {customers.map((customer) => (
        <View key={customer.id} style={styles.card}>
          <Text style={styles.name}>{customer.name}</Text>
          <Text style={styles.code}>{customer.uniqueCode}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>주문 경로</Text>
            <Text style={styles.value}>{customer.orderSource}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>잔여 회차</Text>
            <Text style={styles.value}>
              {customer.remainingCount}/{customer.totalCount}회
            </Text>
          </View>
          <Text style={styles.address}>{customer.address}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    padding: spacing.page,
  },
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    padding: 16,
  },
  name: {
    color: colors.foreground,
    fontSize: 22,
    fontWeight: "900",
  },
  code: {
    color: colors.greenDark,
    fontWeight: "900",
    marginBottom: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  label: {
    color: colors.muted,
    fontWeight: "800",
  },
  value: {
    color: colors.foreground,
    fontWeight: "900",
  },
  address: {
    color: colors.muted,
    lineHeight: 21,
    marginTop: 10,
  },
});
