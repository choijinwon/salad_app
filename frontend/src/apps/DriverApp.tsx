import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/ui";
import DriverAuthScreen from "../screens/driver/DriverAuthScreen";
import DriverAttendanceScreen from "../screens/driver/DriverAttendanceScreen";
import DriverRouteScreen from "../screens/driver/DriverRouteScreen";
import { colors } from "../theme";
import type { Session } from "../types";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function DriverApp() {
  const [session, setSession] = useState<Session | null>(null);

  return (
    <NavigationContainer>
      <StatusBar style={session ? "light" : "dark"} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session === null ? (
          <Stack.Screen name="DriverAuth">
            {() => <DriverAuthScreen onAuthenticated={setSession} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="DriverTabs">
            {() => <DriverShell session={session} onSignOut={() => setSession(null)} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function DriverShell({
  onSignOut,
  session,
}: {
  onSignOut: () => void;
  session: Session;
}) {
  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>SALAD DRIVER</Text>
          <Text style={styles.title}>{session.name} 기사님</Text>
        </View>
        <PrimaryButton onPress={onSignOut} style={styles.headerButton} tone="slate">
          로그아웃
        </PrimaryButton>
      </View>
      <DriverTabs user={session} />
    </SafeAreaView>
  );
}

function DriverTabs({ user }: { user: Session }) {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Attendance" options={{ title: "출퇴근" }}>
        {() => <DriverAttendanceScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Route" options={{ title: "배송지도" }}>
        {() => <DriverRouteScreen user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.greenDark,
  tabBarInactiveTintColor: colors.muted,
  tabBarHideOnKeyboard: true,
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: "800" as const,
  },
  tabBarStyle: {
    backgroundColor: colors.panel,
    borderTopColor: "transparent",
    height: 68,
    paddingBottom: 9,
    paddingTop: 6,
  },
};

const styles = StyleSheet.create({
  shell: {
    backgroundColor: colors.background,
    flex: 1,
  },
  header: {
    alignItems: "center",
    backgroundColor: colors.slate,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    color: colors.mint,
    fontSize: 11,
    fontWeight: "900",
  },
  title: {
    color: colors.panel,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2,
  },
  headerButton: {
    minHeight: 40,
    minWidth: 86,
  },
});
