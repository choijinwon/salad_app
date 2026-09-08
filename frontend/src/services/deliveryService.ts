import { ApiService } from "./apiService";

export function canEditDeliveryDate(deliveryDate: Date, now = new Date()) {
  const cutoff = new Date(deliveryDate);
  cutoff.setDate(cutoff.getDate() - 1);
  cutoff.setHours(18, 0, 0, 0);
  return now < cutoff;
}

export function formatDateToIso(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().split("T")[0];
}

export async function getTodayDeliveries(driverId?: string) {
  return ApiService.getTodayDeliveries(driverId);
}

export async function completeDelivery(
  scheduleId: string,
  insulatedBagReturned: boolean,
) {
  return ApiService.completeDelivery(scheduleId, insulatedBagReturned);
}

export async function clockIn(
  driverId: string,
  latitude: number,
  longitude: number,
) {
  return ApiService.clockInDriver(driverId, latitude, longitude);
}

export async function clockOut(
  driverId: string,
  latitude: number,
  longitude: number,
) {
  return ApiService.clockOutDriver(driverId, latitude, longitude);
}

export async function buildDailySettlement() {
  return ApiService.getDailySettlement();
}