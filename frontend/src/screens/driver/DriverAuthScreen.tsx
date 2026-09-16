import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Card, PrimaryButton } from "../../components/ui";
import { ApiService } from "../../services/apiService";
import { colors, spacing } from "../../theme";
import type { Session } from "../../types";

export default function DriverAuthScreen({
  onAuthenticated,
}: {
  onAuthenticated: (session: Session) => void;
}) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    const phoneValue = onlyDigits(phone);
    const passwordValue = password.trim();

    if (!phoneValue || !passwordValue) {
      Alert.alert("기사 로그인", "전화번호와 비밀번호를 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const session = await ApiService.loginDriver({
        password: passwordValue,
        phone: phoneValue,
      });
      onAuthenticated(session);
    } catch (e) {
      Alert.alert("로그인 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <Text style={styles.brand}>SALAD DRIVER</Text>
          <Text style={styles.title}>오늘 배송을 시작하세요</Text>
          <Text style={styles.copy}>
            출근 기록, 배송 순서, 고객 요청사항을 기사 전용 앱에서 확인합니다.
          </Text>
        </View>

        <View style={styles.routePreview}>
          <View style={styles.routeGraphic}>
            <View style={styles.routeLine} />
            <View style={styles.routeDot} />
            <View style={[styles.routeDot, styles.routeDotMiddle]} />
            <View style={[styles.routeDot, styles.routeDotLast]} />
          </View>
          <View style={styles.routeMeta}>
            <Text style={styles.routeCount}>3개 배송지</Text>
            <Text style={styles.routeArea}>A구역 · 오전 루트</Text>
          </View>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>기사 로그인</Text>
          <TextInput
            keyboardType="phone-pad"
            placeholder="전화번호"
            placeholderTextColor={colors.muted}
            returnKeyType="next"
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
          />
          <TextInput
            autoCapitalize="none"
            placeholder="비밀번호"
            placeholderTextColor={colors.muted}
            returnKeyType="done"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
          />
          <PrimaryButton disabled={submitting} onPress={handleLogin}>
            {submitting ? "확인 중..." : "기사 앱 시작"}
          </PrimaryButton>
          <Text style={styles.helper}>관리자 승인 후 기사 앱을 사용할 수 있습니다.</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.slate,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.page,
    paddingVertical: 24,
  },
  top: {
    alignSelf: "center",
    marginBottom: 18,
    maxWidth: 360,
    width: "100%",
  },
  brand: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 14,
    textAlign: "center",
  },
  title: {
    color: colors.panel,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
    textAlign: "center",
  },
  copy: {
    color: colors.mint,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    textAlign: "center",
  },
  routePreview: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: spacing.radius,
    borderWidth: 1,
    minHeight: 124,
    marginBottom: 16,
    maxWidth: 360,
    overflow: "hidden",
    padding: 16,
    width: "100%",
  },
  routeGraphic: {
    height: 46,
    position: "relative",
  },
  routeLine: {
    backgroundColor: colors.mint,
    height: 3,
    left: 16,
    opacity: 0.78,
    position: "absolute",
    right: 16,
    top: 22,
  },
  routeDot: {
    backgroundColor: colors.green,
    borderColor: colors.panel,
    borderRadius: 999,
    borderWidth: 3,
    height: 22,
    left: 6,
    position: "absolute",
    top: 13,
    width: 22,
  },
  routeDotMiddle: {
    left: "48%",
  },
  routeDotLast: {
    left: undefined,
    right: 6,
  },
  routeMeta: {
    borderTopColor: "rgba(255,255,255,0.18)",
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  routeCount: {
    color: colors.panel,
    fontSize: 20,
    fontWeight: "900",
  },
  routeArea: {
    color: colors.mint,
    fontWeight: "800",
    marginTop: 3,
  },
  card: {
    gap: 12,
  },
  cardTitle: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 2,
  },
  input: {
    backgroundColor: colors.panelStrong,
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    color: colors.foreground,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  helper: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});
