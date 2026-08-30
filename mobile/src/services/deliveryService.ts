import { deliveries } from "../data/mockData";
import type { DeliverySchedule } from "../types";

export function canEditDeliveryDate(deliveryDate: Date, now = new Date()) {
  const cutoff = new Date(deliveryDate);
  cutoff.setDate(cutoff.getDate() - 1);
  cutoff.setHours(18, 0, 0, 0);
  return now < cutoff;
}

export function completeDelivery(
  records: DeliverySchedule[],
  scheduleId: string,
  insulatedBagReturned: boolean,
) {
  return records.map((record) =>
    record.id === scheduleId
      ? { ...record, status: "DELIVERED" as const, insulatedBagReturned }
      : record,
  );
}

export async function getTodayDeliveries(driverId?: string) {
  if (!driverId) return deliveries;
  return deliveries.filter((delivery) => delivery.driverId === driverId);
}

export async function buildDailySettlement(records = deliveries) {
  const completedRecords = records.filter((record) => record.status === "DELIVERED");
  return {
    total: records.length,
    completed: completedRecords.length,
    bagReturned: records.filter((record) => record.insulatedBagReturned).length,
    amount: completedRecords.reduce((sum, record) => sum + record.unitPrice, 0),
  };
}
