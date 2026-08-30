import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, spacing } from "../theme";
import type { UserRole } from "../types";

export default function AuthScreen({
  onSelectRole,
}: {
  onSelectRole: (role: UserRole) => void;
}) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Salad Delivery OS</Text>
        <Text style={styles.title}>샐러드 정기배송</Text>
        <Text style={styles.copy}>
          고객 예약, 기사 배송, 관리자 정산을 하나의 앱 구조로 연결합니다.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>고유식별 ID 또는 전화번호</Text>
        <TextInput
          placeholder="예: 김샐9002147821"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <RoleButton label="고객으로 시작" onPress={() => onSelectRole("CUSTOMER")} />
        <RoleButton label="기사로 시작" onPress={() => onSelectRole("DRIVER")} />
        <RoleButton label="관리자로 시작" onPress={() => onSelectRole("ADMIN")} />
      </View>
    </SafeAreaView>
  );
}

function RoleButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: spacing.page,
  },
  hero: {
    marginBottom: 24,
  },
  eyebrow: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 8,
  },
  title: {
    color: colors.foreground,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0,
  },
  copy: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
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
    fontSize: 16,
    fontWeight: "900",
  },
  input: {
    backgroundColor: "#fbfdf9",
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: spacing.radius,
    minHeight: 48,
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "900",
  },
});
