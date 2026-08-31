import { deliveries } from "../data/mockData";
import { apiRequest } from "../lib/api";
import type { DeliverySchedule } from "../types";

export function canEditDeliveryDate(deliveryDate: Date, now = new Date()) {
  const cutoff = new Date(deliveryDate);
  cutoff.setDate(cutoff.getDate() - 1);
  cutoff.setHours(18, 0, 0, 0);
  return now < cutoff;
}

export async function getTodayDeliveries(driverId?: string) {
  const query = driverId ? `?driverId=${encodeURIComponent(driverId)}` : "";
  return apiRequest<DeliverySchedule[]>(`/deliveries/today${query}`).catch(
    () => {
      return driverId
        ? deliveries.filter((delivery) => delivery.driverId === driverId)
        : deliveries;
    },
  );
}

export async function completeDelivery(
  scheduleId: string,
  insulatedBagReturned: boolean,
) {
  return apiRequest<DeliverySchedule>(`/deliveries/${scheduleId}/complete`, {
    body: JSON.stringify({ insulatedBagReturned }),
    method: "PATCH",
  });
}

export async function clockIn(
  driverId: string,
  latitude: number,
  longitude: number,
) {
  return apiRequest(`/drivers/${driverId}/attendance/clock-in`, {
    body: JSON.stringify({ latitude, longitude }),
    method: "POST",
  });
}

export async function clockOut(
  driverId: string,
  latitude: number,
  longitude: number,
) {
  return apiRequest(`/drivers/${driverId}/attendance/clock-out`, {
    body: JSON.stringify({ latitude, longitude }),
    method: "POST",
  });
}

export async function buildDailySettlement(records = deliveries) {
  return apiRequest<{
    totalDeliveryCount: number;
    completedDeliveryCount: number;
    bagReturnedCount: number;
    totalAmount: number;
  }>("/settlements/daily").catch(() => {
    const completedRecords = records.filter(
      (record) => record.status === "DELIVERED",
    );
    return {
      totalDeliveryCount: records.length,
      completedDeliveryCount: completedRecords.length,
      bagReturnedCount: records.filter((record) => record.insulatedBagReturned)
        .length,
      totalAmount: completedRecords.reduce(
        (sum, record) => sum + record.unitPrice,
        0,
      ),
    };
  });
}
