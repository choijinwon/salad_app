import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import AdminWebConsole from "../screens/admin/AdminWebConsole";

export default function AdminApp() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AdminWebConsole adminName="샐러드 관리자" onSignOut={() => undefined} />
    </NavigationContainer>
  );
}
