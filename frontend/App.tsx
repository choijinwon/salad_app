import { Platform, StyleSheet, Text, View } from "react-native";
import AdminApp from "./src/apps/AdminApp";
import CustomerApp from "./src/apps/CustomerApp";
import DriverApp from "./src/apps/DriverApp";
import { colors } from "./src/theme";

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

type AppVariant = "admin" | "customer" | "driver";

export default function App() {
  const variant = readAppVariant();

  if (variant === "admin") {
    return <AdminApp />;
  }

  if (variant === "driver") {
    return <DriverApp />;
  }

  return <CustomerApp />;
}

function readAppVariant(): AppVariant {
  const envVariant =
    typeof process !== "undefined" ? process.env?.EXPO_PUBLIC_APP_VARIANT : undefined;
  if (envVariant === "admin") return "admin";
  if (envVariant === "driver") return "driver";

  if (Platform.OS === "web" && typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const queryVariant = params.get("app") ?? params.get("variant");
    if (queryVariant === "admin") return "admin";
    if (queryVariant === "driver") return "driver";
  }

  return "customer";
}

export function UnsupportedVariant() {
  return (
    <View style={styles.unsupported}>
      <Text style={styles.unsupportedTitle}>지원하지 않는 앱입니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  unsupported: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
  },
  unsupportedTitle: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: "900",
  },
});
