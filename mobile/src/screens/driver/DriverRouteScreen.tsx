import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
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
        <Text style={styles.title}>오늘 배송 루트</Text>
        {deliveries.map((delivery) => (
          <Pressable
            accessibilityRole="button"
            key={delivery.id}
            onPress={() => setSelectedId(delivery.id)}
            style={[styles.routeCard, selectedId === delivery.id && styles.selectedCard]}
          >
            <Text style={styles.routeNo}>#{delivery.routeOrder}</Text>
            <View style={styles.routeBody}>
              <Text style={styles.name}>{delivery.customerName}</Text>
              <Text style={styles.sub}>{delivery.address}</Text>
              <Text style={styles.notes}>{delivery.requestNotes}</Text>
            </View>
          </Pressable>
        ))}

        {selected && (
          <View style={styles.detail}>
            <Text style={styles.name}>{selected.customerName} 상세</Text>
            <Text style={styles.sub}>{selected.address}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                Alert.alert("배송 완료", "보냉백 회수 여부와 함께 저장합니다.");
              }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>배송 완료 / 보냉백 체크</Text>
            </Pressable>
          </View>
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
  title: {
    color: colors.foreground,
    fontSize: 22,
    fontWeight: "900",
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
  routeNo: {
    color: colors.greenDark,
    fontWeight: "900",
    minWidth: 34,
  },
  routeBody: {
    flex: 1,
    gap: 4,
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
    backgroundColor: colors.panelStrong,
    borderRadius: spacing.radius,
    gap: 8,
    padding: 14,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: spacing.radius,
    justifyContent: "center",
    marginTop: 8,
    minHeight: 46,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "900",
  },
});
