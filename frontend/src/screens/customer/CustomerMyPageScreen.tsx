import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge, Card, HeroPanel, InfoRow, Page, SectionTitle } from "../../components/ui";
import { customers } from "../../data/mockData";
import { colors } from "../../theme";

export default function CustomerMyPageScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Page>
        <HeroPanel
          eyebrow="내 주문"
          title="정기배송 계정"
          body="고유식별 ID와 잔여 회차를 확인합니다."
          tone="light"
        />
        <SectionTitle title="등록된 고객" subtitle="앱과 네이버 주문을 함께 관리합니다." />
        {customers.map((customer) => (
        <Card key={customer.id}>
          <View style={styles.headerRow}>
            <View>
          <Text style={styles.name}>{customer.name}</Text>
          <Text style={styles.code}>{customer.uniqueCode}</Text>
            </View>
            <Badge tone={customer.orderSource === "APP" ? "blue" : "green"}>
              {customer.orderSource}
            </Badge>
          </View>
          <InfoRow label="잔여 회차" value={`${customer.remainingCount}/${customer.totalCount}회`} />
          <InfoRow label="주소" value={customer.address} />
        </Card>
        ))}
      </Page>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 8,
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
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
