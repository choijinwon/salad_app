export type DateRange = { from: string; to: string };
export type PeriodPreset = "today" | "week" | "month" | "previousMonth" | "quarter";
export type OperationalDelivery = {
  id: string;
  deliveryDate?: string;
  done: boolean;
  settled?: boolean;
  bagCount: number;
  bagCollected: boolean;
  saladCount?: number;
  settlementUnitPrice?: number;
  assignedDriver: string | null;
  customer: string;
  orderNo: string;
};

export function calendarDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function seoulToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function parseCalendarDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1000) return null;
  const date = new Date(year, month - 1, day, 12);
  return calendarDate(date) === value ? date : null;
}

export function shiftCalendarDate(value: string, days: number) {
  const date = parseCalendarDate(value);
  if (!date) throw new Error("올바른 날짜가 아닙니다.");
  date.setDate(date.getDate() + days);
  return calendarDate(date);
}

export function monthRange(value: string): DateRange {
  const date = parseCalendarDate(value);
  if (!date) throw new Error("올바른 날짜가 아닙니다.");
  return { from: calendarDate(new Date(date.getFullYear(), date.getMonth(), 1)), to: calendarDate(new Date(date.getFullYear(), date.getMonth() + 1, 0)) };
}

export function shiftCalendarMonth(value: string, offset: number) {
  const date = parseCalendarDate(value);
  if (!date) throw new Error("올바른 날짜가 아닙니다.");
  return calendarDate(new Date(date.getFullYear(), date.getMonth() + offset, 1));
}

export function monthCells(value: string) {
  const first = monthRange(value).from;
  const start = shiftCalendarDate(first, -parseCalendarDate(first)!.getDay());
  return Array.from({ length: 42 }, (_, index) => shiftCalendarDate(start, index));
}

export function periodRange(preset: PeriodPreset, today = seoulToday()): DateRange {
  const current = monthRange(today);
  if (preset === "today") return { from: today, to: today };
  if (preset === "week") return { from: shiftCalendarDate(today, -6), to: today };
  if (preset === "previousMonth") return monthRange(shiftCalendarMonth(today, -1));
  if (preset === "quarter") return { from: shiftCalendarMonth(today, -2), to: current.to };
  return current;
}

export function dateRangeError(range: DateRange) {
  const from = parseCalendarDate(range.from);
  const to = parseCalendarDate(range.to);
  if (!from || !to) return "시작일과 종료일을 입력해주세요.";
  if (range.from > range.to) return "종료일은 시작일과 같거나 이후여야 합니다.";
  const days = (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) - Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) / 86400000 + 1;
  return days > 366 ? "한 번에 최대 366일까지 조회할 수 있습니다." : "";
}

export function inDateRange(date: string, range: DateRange) {
  return !!parseCalendarDate(date) && date >= range.from && date <= range.to;
}

export function filterPeriod<T extends OperationalDelivery>(deliveries: T[], range: DateRange) {
  if (dateRangeError(range)) return [];
  return deliveries.filter((delivery) => inDateRange(delivery.deliveryDate ?? seoulToday(), range));
}

export function deliveryAmount(delivery: OperationalDelivery) {
  return (delivery.saladCount ?? 1) * (delivery.settlementUnitPrice ?? 8900);
}

export function deliverySettlementStatus(delivery: OperationalDelivery) {
  if (!delivery.done) return "배송 미완료";
  if (delivery.settled) return "정산 완료";
  if (delivery.bagCount > 0 && !delivery.bagCollected) return "보냉백 확인";
  return "정산 가능";
}

export function operationSummary(deliveries: OperationalDelivery[]) {
  return deliveries.reduce((summary, delivery) => {
    summary.total++;
    summary.quantity += delivery.saladCount ?? 1;
    if (!delivery.assignedDriver && !delivery.done) summary.unassigned++;
    if (!delivery.bagCollected) summary.bags += delivery.bagCount;
    if (!delivery.done) return summary;
    summary.completed++;
    const amount = deliveryAmount(delivery);
    summary.completedAmount += amount;
    const status = deliverySettlementStatus(delivery);
    if (status === "정산 완료") { summary.settledAmount += amount; summary.settled++; }
    else if (status === "보냉백 확인") { summary.heldAmount += amount; summary.held++; }
    else { summary.availableAmount += amount; summary.available++; }
    return summary;
  }, { total: 0, quantity: 0, completed: 0, unassigned: 0, bags: 0, completedAmount: 0, availableAmount: 0, settledAmount: 0, heldAmount: 0, available: 0, settled: 0, held: 0 });
}

export function dailyOperations(deliveries: OperationalDelivery[]) {
  const grouped = new Map<string, OperationalDelivery[]>();
  deliveries.forEach((delivery) => {
    const date = delivery.deliveryDate ?? seoulToday();
    const entries = grouped.get(date) ?? [];
    entries.push(delivery);
    grouped.set(date, entries);
  });
  return new Map([...grouped].map(([date, entries]) => [date, operationSummary(entries)]));
}
