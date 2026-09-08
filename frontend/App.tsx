import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "./src/components/ui";
import AdminAccountsScreen from "./src/screens/admin/AdminAccountsScreen";
import AdminAreasScreen from "./src/screens/admin/AdminAreasScreen";
import AdminAssignmentScreen from "./src/screens/admin/AdminAssignmentScreen";
import AdminOrdersScreen from "./src/screens/admin/AdminOrdersScreen";
import AdminNaverOrdersScreen from "./src/screens/admin/AdminNaverOrdersScreen";
import AdminDashboardScreen from "./src/screens/admin/AdminDashboardScreen";
import AuthScreen from "./src/screens/AuthScreen";
import CustomerCalendarScreen from "./src/screens/customer/CustomerCalendarScreen";
import CustomerMyPageScreen from "./src/screens/customer/CustomerMyPageScreen";
import DriverAttendanceScreen from "./src/screens/driver/DriverAttendanceScreen";
import DriverRouteScreen from "./src/screens/driver/DriverRouteScreen";
import { colors } from "./src/theme";
import type { Session, UserRole } from "./src/types";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  return (
    <NavigationContainer>
      <StatusBar style={session ? "light" : "dark"} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session === null ? (
          <Stack.Screen name="Auth">
            {() => <AuthScreen onAuthenticated={setSession} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="RoleTabs">
            {() => (
              <RoleShell session={session} onChangeRole={() => setSession(null)} />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function RoleShell({
  onChangeRole,
  session,
}: {
  onChangeRole: () => void;
  session: Session;
}) {
  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>SALAD DELIVERY</Text>
          <Text style={styles.title}>{roleLabel[session.role]} 앱 · {session.name}</Text>
        </View>
        <PrimaryButton onPress={onChangeRole} style={styles.roleButton} tone="slate">
          역할 변경
        </PrimaryButton>
      </View>

      {session.role === "CUSTOMER" && <CustomerTabs user={session} />}
      {session.role === "DRIVER" && <DriverTabs user={session} />}
      {session.role === "ADMIN" && <AdminTabs />}
    </SafeAreaView>
  );
}

function CustomerTabs({ user }: { user: Session }) {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Calendar" options={{ title: "배송일" }}>
        {() => <CustomerCalendarScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen name="MyPage" options={{ title: "내 주문" }}>
        {() => <CustomerMyPageScreen user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
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

function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
        <Tab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ title: "현황" }} />
        <Tab.Screen name="Assignment" component={AdminAssignmentScreen} options={{ title: "배정" }} />
        <Tab.Screen name="Orders" component={AdminOrdersScreen} options={{ title: "주문" }} />
        <Tab.Screen name="Naver" component={AdminNaverOrdersScreen} options={{ title: "네이버" }} />
        <Tab.Screen name="Accounts" component={AdminAccountsScreen} options={{ title: "계정" }} />
      <Tab.Screen name="Areas" component={AdminAreasScreen} options={{ title: "지역" }} />
    </Tab.Navigator>
  );
}

const roleLabel: Record<UserRole, string> = {
  ADMIN: "관리자",
  CUSTOMER: "고객",
  DRIVER: "기사",
};

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
  roleButton: {
    minHeight: 40,
  },
});