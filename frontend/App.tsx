import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "./src/components/ui";
import AdminAccountsScreen from "./src/screens/admin/AdminAccountsScreen";
import AdminDashboardScreen from "./src/screens/admin/AdminDashboardScreen";
import AuthScreen from "./src/screens/AuthScreen";
import CustomerCalendarScreen from "./src/screens/customer/CustomerCalendarScreen";
import CustomerMyPageScreen from "./src/screens/customer/CustomerMyPageScreen";
import DriverAttendanceScreen from "./src/screens/driver/DriverAttendanceScreen";
import DriverRouteScreen from "./src/screens/driver/DriverRouteScreen";
import { colors } from "./src/theme";
import type { UserRole } from "./src/types";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [role, setRole] = useState<UserRole | null>(null);

  return (
    <NavigationContainer>
      <StatusBar style={role ? "light" : "dark"} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {role === null ? (
          <Stack.Screen name="Auth">
            {() => <AuthScreen onSelectRole={setRole} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="RoleTabs">
            {() => (
              <RoleShell role={role} onChangeRole={() => setRole(null)} />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function RoleShell({
  onChangeRole,
  role,
}: {
  onChangeRole: () => void;
  role: UserRole;
}) {
  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>SALAD DELIVERY</Text>
          <Text style={styles.title}>{roleLabel[role]} 앱</Text>
        </View>
        <PrimaryButton onPress={onChangeRole} style={styles.roleButton} tone="slate">
          역할 변경
        </PrimaryButton>
      </View>

      {role === "CUSTOMER" && <CustomerTabs />}
      {role === "DRIVER" && <DriverTabs />}
      {role === "ADMIN" && <AdminTabs />}
    </SafeAreaView>
  );
}

function CustomerTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="Calendar"
        component={CustomerCalendarScreen}
        options={{ title: "배송일" }}
      />
      <Tab.Screen
        name="MyPage"
        component={CustomerMyPageScreen}
        options={{ title: "내 주문" }}
      />
    </Tab.Navigator>
  );
}

function DriverTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="Attendance"
        component={DriverAttendanceScreen}
        options={{ title: "출퇴근" }}
      />
      <Tab.Screen
        name="Route"
        component={DriverRouteScreen}
        options={{ title: "배송지도" }}
      />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{ title: "현황" }}
      />
      <Tab.Screen
        name="Accounts"
        component={AdminAccountsScreen}
        options={{ title: "계정" }}
      />
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
