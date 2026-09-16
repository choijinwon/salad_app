import { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
} from "react-native";
import { Badge, Card, PrimaryButton } from "../components/ui";
import { ApiService } from "../services/apiService";
import { colors, spacing } from "../theme";
import type { Session } from "../types";

type AuthMode = "welcome" | "login" | "signup";
const CUSTOMER_DEMO_PASSWORD = ["salad", "123", "!"].join("");

export default function AuthScreen({
  onAuthenticated,
}: {
  onAuthenticated: (session: Session) => void;
}) {
  const [mode, setMode] = useState<AuthMode>("welcome");
  const [loginValue, setLoginValue] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registeredSession, setRegisteredSession] = useState<Session | null>(null);
  const [registeredPassword, setRegisteredPassword] = useState("");
  const [signup, setSignup] = useState({
    address: "",
    email: "",
    name: "",
    password: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    const trimmed = loginValue.trim();
    const password = loginPassword.trim();
    if (!trimmed || !password) {
      Alert.alert("로그인 정보 입력", "가입한 이메일 또는 전화번호와 비밀번호를 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      if (
        registeredSession &&
        registeredPassword === password &&
        (registeredSession.email === trimmed || registeredSession.phone === trimmed)
      ) {
        onAuthenticated(registeredSession);
        return;
      }
      const session = await ApiService.loginCustomer({
        loginId: trimmed,
        password,
      });
      onAuthenticated(session);
    } catch (e) {
      Alert.alert("로그인 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  function updateSignup(field: keyof typeof signup, value: string) {
    setSignup((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCustomerSignup() {
    const name = signup.name.trim();
    const phone = signup.phone.trim();
    const address = signup.address.trim();
    const email = signup.email.trim();
    const password = signup.password.trim();

    if (!name || !phone || !address || !email || !password) {
      Alert.alert("회원가입 정보 입력", "이름, 전화번호, 주소, 이메일, 비밀번호를 모두 입력해주세요.");
      return;
    }
    if (!email.includes("@")) {
      Alert.alert("이메일 확인", "사용 가능한 이메일 주소를 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const session = await ApiService.signupCustomer({
        address,
        email,
        name,
        password,
        phone,
      });
      setRegisteredSession(session);
      setRegisteredPassword(password);
      onAuthenticated(session);
    } catch (e) {
      Alert.alert("회원가입 실패", e instanceof Error ? e.message : "다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  if (mode === "welcome") {
    return (
      <SafeAreaView style={styles.welcomeScreen}>
        <View style={styles.welcomeTop}>
          <Text style={styles.brandText}>SALAD DELIVERY</Text>
        </View>

        <View style={styles.welcomeMain}>
          <SaladMark />
          <Text style={styles.welcomeTitle}>샐러드 정기배송</Text>
          <Text style={styles.welcomeCopy}>
            원하는 배송일을 고르고, 문 앞 요청까지 한 번에 관리하세요.
          </Text>
          <View style={styles.marketingPills}>
            <MarketingPill label="배송일 직접 선택" />
            <MarketingPill label="요청사항 저장" />
            <MarketingPill label="주문 내역 확인" />
          </View>
          <View style={styles.previewPanel}>
            <View>
              <Text style={styles.previewLabel}>이번 주 예약</Text>
              <Text style={styles.previewTitle}>화 · 목 · 토 배송 가능</Text>
            </View>
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>신선 배송</Text>
            </View>
          </View>
        </View>

        <View style={styles.welcomeActions}>
          <WelcomeButton onPress={() => setMode("signup")}>
            회원가입하고 시작
          </WelcomeButton>
          <WelcomeButton onPress={() => setMode("login")} tone="light">로그인</WelcomeButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.authContent}>
        <View style={styles.authHeader}>
          <BackButton onPress={() => setMode("welcome")} />
          <Text style={styles.authBrand}>SALAD DELIVERY</Text>
          <Text style={styles.authTitle}>
            {mode === "login" ? "다시 오신 걸 환영해요" : "정기배송을 시작해요"}
          </Text>
          <Text style={styles.authCopy}>
            {mode === "login"
              ? "가입한 이메일 또는 전화번호로 오늘의 배송 일정을 바로 확인하세요."
              : "배송 예약에 필요한 고객 정보를 입력하면 바로 시작할 수 있습니다."}
          </Text>
        </View>

        {mode === "login" ? (
          <Card style={styles.card}>
            <View style={styles.loginBenefit}>
              <Text style={styles.loginBenefitLabel}>로그인하면 바로 확인 가능</Text>
              <Text style={styles.loginBenefitText}>예약일 · 배송 요청사항 · 내 주문 내역</Text>
            </View>
            <TextInput
              placeholder="이메일 또는 전화번호"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={loginValue}
              onChangeText={setLoginValue}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TextInput
              placeholder="비밀번호"
              placeholderTextColor={colors.muted}
              secureTextEntry
              style={styles.input}
              value={loginPassword}
              onChangeText={setLoginPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <PrimaryButton disabled={submitting} onPress={handleLogin}>
              {submitting ? "확인 중..." : "로그인"}
            </PrimaryButton>
            <Text style={styles.helper}>
              데모: customer@salad.test / {CUSTOMER_DEMO_PASSWORD}
            </Text>
            <Pressable accessibilityRole="button" onPress={() => setMode("signup")}>
              <Text style={styles.switchText}>처음 이용하시나요? 회원가입</Text>
            </Pressable>
          </Card>
        ) : null}

        {mode === "signup" ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>회원가입</Text>
            <Text style={styles.customerIntro}>
              배송 예약에 필요한 고객 정보를 입력해주세요.
            </Text>
            <TextInput
              autoCapitalize="none"
              placeholder="이름"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={signup.name}
              onChangeText={(value) => updateSignup("name", value)}
            />
            <TextInput
              keyboardType="phone-pad"
              placeholder="전화번호"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={signup.phone}
              onChangeText={(value) => updateSignup("phone", value)}
            />
            <TextInput
              placeholder="고객 주소"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={signup.address}
              onChangeText={(value) => updateSignup("address", value)}
            />
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="이메일"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={signup.email}
              onChangeText={(value) => updateSignup("email", value)}
            />
            <TextInput
              autoCapitalize="none"
              placeholder="비밀번호"
              placeholderTextColor={colors.muted}
              secureTextEntry
              style={styles.input}
              value={signup.password}
              onChangeText={(value) => updateSignup("password", value)}
            />
            <PrimaryButton onPress={handleCustomerSignup}>회원가입하고 시작</PrimaryButton>
            <Pressable accessibilityRole="button" onPress={() => setMode("login")}>
              <Text style={styles.switchText}>이미 가입하셨나요? 로그인</Text>
            </Pressable>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Text style={styles.backText}>‹ 처음으로</Text>
    </Pressable>
  );
}

function MarketingPill({ label }: { label: string }) {
  return (
    <View style={styles.marketingPill}>
      <Text style={styles.marketingPillText}>{label}</Text>
    </View>
  );
}

function WelcomeButton({
  children,
  onPress,
  tone = "green",
}: PressableProps & {
  children: string;
  tone?: "green" | "light" | "slate";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.welcomeButton,
        tone === "light" && styles.welcomeButtonLight,
        tone === "slate" && styles.welcomeButtonSlate,
        pressed && styles.welcomeButtonPressed,
      ]}
    >
      <Text style={[styles.welcomeButtonText, tone === "light" && styles.welcomeButtonTextLight]}>
        {children}
      </Text>
    </Pressable>
  );
}

function SaladMark() {
  return (
    <View style={styles.saladMark}>
      <View style={styles.bowl}>
        <View style={[styles.leaf, styles.leafOne]} />
        <View style={[styles.leaf, styles.leafTwo]} />
        <View style={[styles.leaf, styles.leafThree]} />
        <View style={styles.tomato} />
      </View>
      <View style={styles.bowlBase} />
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeScreen: {
    backgroundColor: colors.panelStrong,
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  welcomeTop: {
    alignItems: "center",
    minHeight: 58,
    paddingTop: 18,
  },
  brandText: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  welcomeMain: {
    alignItems: "center",
    gap: 14,
    marginTop: -22,
    paddingHorizontal: 14,
  },
  welcomeTitle: {
    color: colors.foreground,
    fontSize: 33,
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "center",
  },
  welcomeCopy: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 300,
    textAlign: "center",
  },
  marketingPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    justifyContent: "center",
    maxWidth: 320,
  },
  marketingPill: {
    backgroundColor: colors.greenSoft,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  marketingPillText: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: "900",
  },
  previewPanel: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    maxWidth: 340,
    paddingHorizontal: 14,
    paddingVertical: 13,
    width: "100%",
  },
  previewBadge: {
    backgroundColor: colors.slate,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  previewBadgeText: {
    color: colors.panel,
    fontSize: 11,
    fontWeight: "900",
  },
  previewLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  previewTitle: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 3,
  },
  welcomeActions: {
    alignSelf: "center",
    gap: 10,
    maxWidth: 390,
    paddingBottom: 14,
    width: "100%",
  },
  welcomeButton: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: spacing.radius,
    justifyContent: "center",
    minHeight: 54,
    width: "100%",
  },
  welcomeButtonPressed: {
    opacity: 0.82,
  },
  welcomeButtonLight: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
  },
  welcomeButtonSlate: {
    backgroundColor: colors.slate,
  },
  welcomeButtonText: {
    color: colors.panel,
    fontSize: 15,
    fontWeight: "900",
  },
  welcomeButtonTextLight: {
    color: colors.foreground,
  },
  saladMark: {
    alignItems: "center",
    height: 128,
    justifyContent: "center",
    width: 158,
  },
  bowl: {
    backgroundColor: colors.greenSoft,
    borderColor: colors.line,
    borderRadius: 54,
    borderWidth: 1,
    height: 96,
    overflow: "hidden",
    width: 136,
  },
  bowlBase: {
    backgroundColor: colors.greenDark,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    height: 18,
    marginTop: -14,
    width: 104,
  },
  leaf: {
    backgroundColor: colors.green,
    borderRadius: 999,
    position: "absolute",
  },
  leafOne: {
    height: 48,
    left: 22,
    top: 25,
    transform: [{ rotate: "-22deg" }],
    width: 72,
  },
  leafTwo: {
    backgroundColor: colors.mint,
    height: 42,
    right: 18,
    top: 18,
    transform: [{ rotate: "24deg" }],
    width: 64,
  },
  leafThree: {
    backgroundColor: "#8FCB7E",
    bottom: 18,
    height: 38,
    left: 48,
    transform: [{ rotate: "8deg" }],
    width: 70,
  },
  tomato: {
    backgroundColor: colors.coral,
    borderRadius: 999,
    height: 20,
    position: "absolute",
    right: 36,
    top: 46,
    width: 20,
  },
  screen: {
    backgroundColor: colors.panelStrong,
    flex: 1,
  },
  authContent: {
    justifyContent: "flex-start",
    minHeight: "100%",
    padding: 22,
    paddingTop: 26,
  },
  authBrand: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 18,
  },
  authCopy: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 340,
  },
  authHeader: {
    marginBottom: 20,
  },
  authTitle: {
    color: colors.foreground,
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 9,
  },
  card: {
    gap: 12,
  },
  cardTitle: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: "900",
  },
  backText: {
    color: colors.greenDark,
    fontSize: 14,
    fontWeight: "900",
  },
  customerIntro: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  input: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    color: colors.foreground,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  helper: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  loginBenefit: {
    backgroundColor: colors.greenSoft,
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    padding: 12,
  },
  loginBenefitLabel: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: "900",
  },
  loginBenefitText: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 4,
  },
  switchText: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: "900",
    paddingVertical: 4,
    textAlign: "center",
  },
});
