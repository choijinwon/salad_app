import { useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { Badge, Card, PrimaryButton } from "../components/ui";
import { USE_MOCK } from "../lib/config";
import { ApiService, createMockSession } from "../services/apiService";
import { colors, spacing } from "../theme";
import type { Session, UserRole } from "../types";

export default function AuthScreen({
  onAuthenticated,
}: {
  onAuthenticated: (session: Session) => void;
}) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    const trimmed = code.trim();
    if (!trimmed) {
      Alert.alert("고유식별 ID 입력", "로그인에 필요한 고유식별 ID를 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const session = await ApiService.login(trimmed);
      onAuthenticated(session);
    } catch (error) {
      Alert.alert("로그인 실패", error instanceof Error ? error.message : "로그인에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleQuickStart(role: UserRole) {
    onAuthenticated(createMockSession(role));
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.hero}>
        <Badge tone="green">MVP 운영 앱</Badge>
        <Text style={styles.title}>샐러드 정기배송</Text>
        <Text style={styles.copy}>
          고객 예약부터 기사 배송, 관리자 정산까지 하루 운영 흐름을 한 화면 구조로 연결합니다.
        </Text>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>3</Text>
            <Text style={styles.heroStatLabel}>역할</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>30</Text>
            <Text style={styles.heroStatLabel}>배송일</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>PDF</Text>
            <Text style={styles.heroStatLabel}>정산</Text>
          </View>
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>로그인</Text>
        <TextInput
          placeholder="고유식별 ID 예: 김샐9002147821"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
        <PrimaryButton disabled={submitting} onPress={handleLogin}>
          {submitting ? "확인 중..." : "로그인"}
        </PrimaryButton>

        {USE_MOCK ? (
          <>
            <View style={styles.quickDivider}>
              <Text style={styles.quickDividerText}>데모(mock) 전용 빠른 시작</Text>
            </View>
            <RoleButton label="고객으로 시작" onPress={() => handleQuickStart("CUSTOMER")} />
            <RoleButton label="기사로 시작" onPress={() => handleQuickStart("DRIVER")} />
            <RoleButton label="관리자로 시작" onPress={() => handleQuickStart("ADMIN")} />
          </>
        ) : (
          <Text style={styles.realNotice}>백엔드에 등록된 고유식별 ID로 로그인합니다.</Text>
        )}
      </Card>
    </SafeAreaView>
  );
}

function RoleButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.roleRow, pressed && styles.pressed]}>
      <View>
        <Text style={styles.roleLabel}>{label}</Text>
        <Text style={styles.roleHint}>{roleHint[label] ?? "앱 화면으로 이동"}</Text>
      </View>
      <Text style={styles.roleArrow}>›</Text>
    </Pressable>
  );
}

const roleHint: Record<string, string> = {
  "고객으로 시작": "배송일 예약과 내 주문 확인",
  "기사로 시작": "출퇴근과 배송 루트 확인",
  "관리자로 시작": "고객, 기사, 정산 관리",
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: spacing.page,
  },
  hero: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
  },
  title: {
    color: colors.foreground,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 14,
  },
  copy: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  heroStats: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },
  heroStat: {
    backgroundColor: colors.greenSoft,
    borderRadius: spacing.radius,
    flex: 1,
    padding: 12,
  },
  heroStatLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  heroStatValue: {
    color: colors.greenDark,
    fontSize: 18,
    fontWeight: "900",
  },
  card: {
    gap: 10,
  },
  cardTitle: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "900",
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    color: colors.foreground,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  pressed: {
    opacity: 0.78,
  },
  quickDivider: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  quickDividerText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  realNotice: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  roleArrow: {
    color: colors.greenDark,
    fontSize: 26,
    fontWeight: "900",
  },
  roleHint: {
    color: colors.muted,
    marginTop: 3,
  },
  roleLabel: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "900",
  },
  roleRow: {
    alignItems: "center",
    backgroundColor: colors.greenSoft,
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});