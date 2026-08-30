import type {
  DeliverySchedule,
  ManualCustomerInput,
  Profile,
} from "./types";
import { createUniqueCode, deliveries, summarizeDeliveries } from "./mockData";

export function canEditDeliveryDate(deliveryDate: Date, now = new Date()) {
  const cutoff = new Date(deliveryDate);
  cutoff.setDate(cutoff.getDate() - 1);
  cutoff.setHours(18, 0, 0, 0);
  return now < cutoff;
}

export async function createManualCustomer(
  input: ManualCustomerInput,
): Promise<Profile> {
  return {
    id: crypto.randomUUID(),
    role: "CUSTOMER",
    name: input.name,
    phone: input.phone,
    birthdate: input.birthdate,
    address: input.address,
    zoneId: input.zoneId,
    uniqueCode: createUniqueCode(input),
    createdAt: new Date().toISOString(),
  };
}

export async function getTodayDeliveries(driverId?: string) {
  if (!driverId) return deliveries;
  return deliveries.filter((delivery) => delivery.driverId === driverId);
}

export async function completeDelivery(
  records: DeliverySchedule[],
  scheduleId: string,
  insulatedBagReturned: boolean,
) {
  return records.map((record) =>
    record.id === scheduleId
      ? {
          ...record,
          status: "DELIVERED" as const,
          insulatedBagReturned,
          completedAt: new Date().toISOString(),
        }
      : record,
  );
}

export async function buildDailySettlement(records = deliveries) {
  const summary = summarizeDeliveries(records);
  const rows = records
    .filter((record) => record.status === "DELIVERED")
    .map((record) => ({
      customerName: record.customerName,
      zoneName: record.zoneName,
      deductedCount: 1,
      bagStatus: record.insulatedBagReturned ? "RETURNED" : "UNRETURNED",
      amount: record.unitPrice,
    }));

  return {
    ...summary,
    rows,
  };
}
