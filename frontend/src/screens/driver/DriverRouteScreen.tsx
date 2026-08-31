import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Badge, Card, PrimaryButton, SectionTitle } from "../../components/ui";
import { deliveries } from "../../data/mockData";
import { colors, spacing } from "../../theme";

export default function DriverRouteScreen() {
  const [selectedId, setSelectedId] = useState(deliveries[0].id);
  const selected = deliveries.find((delivery) => delivery.id === selectedId);
  const route = deliveries.map((delivery) => ({
    latitude: delivery.latitude,
    longitude: delivery.longitude,
  }));

  return (
    <View style={styles.screen}>
      <MapView
        initialRegion={{
          latitude: 37.563,
          latitudeDelta: 0.04,
          longitude: 126.918,
          longitudeDelta: 0.04,
        }}
        style={styles.map}
      >
        <Polyline coordinates={route} strokeColor={colors.green} strokeWidth={4} />
        {deliveries.map((delivery) => (
          <Marker
            coordinate={{
              latitude: delivery.latitude,
              longitude: delivery.longitude,
            }}
            key={delivery.id}
            onPress={() => setSelectedId(delivery.id)}
            title={`${delivery.routeOrder}. ${delivery.customerName}`}
            description={delivery.requestNotes}
          />
        ))}
      </MapView>

      <ScrollView contentContainerStyle={styles.sheet}>
        <SectionTitle
          title="오늘 배송 루트"
          subtitle={`${deliveries.length}개 배송지, 선택한 고객의 요청사항을 확인하세요.`}
        />
        {deliveries.map((delivery) => (
          <Pressable
            accessibilityRole="button"
            key={delivery.id}
            onPress={() => setSelectedId(delivery.id)}
            style={({ pressed }) => [
              styles.routeCard,
              selectedId === delivery.id && styles.selectedCard,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.routeNo}>#{delivery.routeOrder}</Text>
            <View style={styles.routeBody}>
              <View style={styles.routeHeader}>
              <Text style={styles.name}>{delivery.customerName}</Text>
                <Badge tone={delivery.status === "DELIVERED" ? "green" : delivery.status === "IN_TRANSIT" ? "blue" : "amber"}>
                  {statusLabel[delivery.status]}
                </Badge>
              </View>
              <Text style={styles.sub}>{delivery.address}</Text>
              <Text style={styles.notes}>{delivery.requestNotes}</Text>
            </View>
          </Pressable>
        ))}

        {selected && (
          <Card style={styles.detail}>
            <SectionTitle title={`${selected.customerName} 상세`} subtitle={selected.address} />
            <Text style={styles.sub}>{selected.address}</Text>
            <PrimaryButton
              onPress={() => {
                Alert.alert("배송 완료", "보냉백 회수 여부와 함께 저장합니다.");
              }}
              style={styles.primaryButton}
            >
              배송 완료 / 보냉백 체크
            </PrimaryButton>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  map: {
    flex: 1,
    minHeight: 290,
  },
  sheet: {
    backgroundColor: colors.background,
    gap: 10,
    padding: spacing.page,
  },
  routeCard: {
    alignItems: "flex-start",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: spacing.radius,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  selectedCard: {
    borderColor: colors.green,
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.78,
  },
  routeNo: {
    color: colors.greenDark,
    fontWeight: "900",
    minWidth: 34,
  },
  routeBody: {
    flex: 1,
    gap: 4,
  },
  routeHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "900",
  },
  sub: {
    color: colors.muted,
    lineHeight: 20,
  },
  notes: {
    color: colors.blue,
    fontWeight: "800",
  },
  detail: {
    gap: 8,
  },
  primaryButton: {
    marginTop: 8,
  },
});

const statusLabel = {
  DELIVERED: "완료",
  IN_TRANSIT: "이동 중",
  PENDING: "대기",
  SKIPPED: "건너뜀",
};
