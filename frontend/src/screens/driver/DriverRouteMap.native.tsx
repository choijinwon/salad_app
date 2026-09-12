import MapView, { Marker, Polyline } from "react-native-maps";
import { colors } from "../../theme";
import type { DeliveryResponse } from "../../services/apiService";

type RoutePoint = {
  latitude: number;
  longitude: number;
};

export default function DriverRouteMap({
  deliveries,
  onSelectDelivery,
  route,
}: {
  deliveries: DeliveryResponse[];
  onSelectDelivery: (id: string) => void;
  route: RoutePoint[];
}) {
  return (
    <MapView
      initialRegion={{
        latitude: 37.563,
        latitudeDelta: 0.04,
        longitude: 126.918,
        longitudeDelta: 0.04,
      }}
      style={{ height: 310, width: "100%" }}
    >
      {route.length > 1 ? (
        <Polyline coordinates={route} strokeColor={colors.green} strokeWidth={4} />
      ) : null}
      {deliveries.map((delivery) =>
        delivery.latitude != null && delivery.longitude != null ? (
          <Marker
            coordinate={{
              latitude: Number(delivery.latitude),
              longitude: Number(delivery.longitude),
            }}
            description={delivery.requestNotes}
            key={delivery.id}
            onPress={() => onSelectDelivery(delivery.id)}
            title={
              delivery.routeOrder != null
                ? `${delivery.routeOrder}. ${delivery.customerName}`
                : delivery.customerName
            }
          />
        ) : null,
      )}
    </MapView>
  );
}
