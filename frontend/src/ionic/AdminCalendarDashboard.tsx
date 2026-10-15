import { IonIcon } from "@ionic/react";
import { calendarOutline, carOutline, cashOutline, chevronBackOutline, chevronForwardOutline, searchOutline, arrowForwardOutline } from "ionicons/icons";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { dailyOperations, dateRangeError, deliveryAmount, deliverySettlementStatus, filterPeriod, monthCells, monthRange, operationSummary, parseCalendarDate, periodRange, seoulToday, shiftCalendarMonth, type DateRange, type OperationalDelivery, type PeriodPreset } from "./adminCalendar";
import "./adminCalendar.css";

const money = (value: number) => `${value.toLocaleString("ko-KR")}원`;
const readableDate = (date: string) => date.replace(/-/g, ".");

export function AdminDataSource({ demo, onChange }: { demo: boolean; onChange: (demo: boolean) => void }) {
  return <div className="admin-data-source"><div role="group" aria-label="데이터 선택">
    <button type="button" aria-pressed={!demo} onClick={() => onChange(false)}>실제 내역</button>
    <button type="button" aria-pressed={demo} onClick={() => onChange(true)}>샘플 내역</button>
  </div>{demo && <span>샘플 데이터</span>}</div>;
}

function Stat({ label, value, detail, tone = "" }: { label: string; value: string; detail: string; tone?: string }) {
  return <div className={`operation-stat ${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

export function AdminCalendarDashboard<T extends OperationalDelivery>({ deliveries, selectedDate, month, onMonthChange, onSelectDate, onOpen, demo, approvalCount }: {
  deliveries: T[];
  selectedDate: string;
  month: string;
  onMonthChange: (month: string) => void;
  onSelectDate: (date: string) => void;
  onOpen: (section: "orders" | "dispatch" | "settlements", date: string) => void;
  demo: boolean;
  approvalCount: number;
}) {
  const range = monthRange(month);
  const monthly = useMemo(() => filterPeriod(deliveries, range), [deliveries, range.from, range.to]);
  const summary = operationSummary(monthly);
  const daily = useMemo(() => dailyOperations(deliveries), [deliveries]);
  const selected = deliveries.filter((delivery) => delivery.deliveryDate === selectedDate);
  const day = operationSummary(selected);
  const date = parseCalendarDate(selectedDate)!;
  const percent = day.total ? Math.round(day.completed / day.total * 100) : 0;

  return <div className="operations-dashboard">
    <div className="operation-stats" aria-label="월간 운영 요약">
      <Stat label="월간 배송" value={`${summary.total}건`} detail={`샐러드 ${summary.quantity}개`} />
      <Stat label="배송 완료" value={`${summary.completed}건`} detail={`미완료 ${summary.total - summary.completed}건`} tone="green" />
      <Stat label="정산 가능액" value={money(summary.availableAmount)} detail={`정산 완료 ${money(summary.settledAmount)}`} tone="blue" />
      <Stat label="확인 필요" value={`${summary.unassigned + summary.held}건`} detail={`미배정 ${summary.unassigned} · 보냉백 확인 ${summary.held}`} tone="amber" />
    </div>
    <div className="operations-calendar-layout">
      <section className="operations-calendar" aria-label="월간 운영 달력">
        <div className="operations-calendar-toolbar">
          <label className="operations-month"><IonIcon icon={calendarOutline} /><input aria-label="대시보드 조회 월" type="month" min="1000-01" value={month.slice(0, 7)} onChange={(event) => { if (/^\d{4}-\d{2}$/.test(event.currentTarget.value)) onMonthChange(`${event.currentTarget.value}-01`); }} /></label>
          <div><button type="button" onClick={() => { onMonthChange(monthRange(seoulToday()).from); onSelectDate(seoulToday()); }}>오늘</button><button type="button" aria-label="이전 달" title="이전 달" onClick={() => onMonthChange(shiftCalendarMonth(month, -1))}><IonIcon icon={chevronBackOutline} /></button><button type="button" aria-label="다음 달" title="다음 달" onClick={() => onMonthChange(shiftCalendarMonth(month, 1))}><IonIcon icon={chevronForwardOutline} /></button></div>
        </div>
        <div className="operations-calendar-legend"><span className="scheduled">배송 예정</span><span className="completed">배송 완료</span><span className="amount">정산 가능액</span></div>
        <div className="operations-weekdays" aria-hidden="true">{["일", "월", "화", "수", "목", "금", "토"].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="operations-month-grid">
          {monthCells(month).map((cell, index) => {
            const totals = daily.get(cell);
            const outside = cell.slice(0, 7) !== month.slice(0, 7);
            return <button key={cell} type="button" aria-label={`${readableDate(cell)} 배송 ${totals?.total ?? 0}건`} aria-pressed={selectedDate === cell} aria-current={cell === seoulToday() ? "date" : undefined} className={`operations-day ${outside ? "outside" : ""} ${index % 7 === 0 ? "sunday" : ""}`} onClick={() => { if (outside) onMonthChange(monthRange(cell).from); onSelectDate(cell); }}>
              <span className="operations-day-number">{Number(cell.slice(-2))}</span>
              {totals ? <div className="operations-day-stats"><span className="scheduled">배송 {totals.total}건</span><span className="completed">완료 {totals.completed}건</span>{totals.availableAmount > 0 && <strong>{money(totals.availableAmount)}</strong>}</div> : <span className="operations-no-events">—</span>}
            </button>;
          })}
        </div>
      </section>
      <aside className="operations-day-detail" aria-label="선택일 운영 현황">
        <div className="operations-detail-heading"><span>선택일 현황</span><h2>{date.getMonth() + 1}월 {date.getDate()}일 <small>{["일", "월", "화", "수", "목", "금", "토"][date.getDay()]}요일</small></h2></div>
        <div className="operations-day-counts"><div><span>배송</span><strong>{day.total}</strong></div><div><span>완료</span><strong>{day.completed}</strong></div><div><span>미배정</span><strong>{day.unassigned}</strong></div></div>
        <div className="operations-progress"><span>배송 완료율 <b>{percent}%</b></span><progress aria-label="선택일 배송 완료율" value={day.completed} max={Math.max(day.total, 1)} /></div>
        <dl className="operations-day-finances"><div><dt>정산 가능</dt><dd>{money(day.availableAmount)}</dd></div><div><dt>정산 완료</dt><dd>{money(day.settledAmount)}</dd></div><div><dt>미회수 보냉백</dt><dd>{day.bags}개</dd></div>{approvalCount > 0 && <div><dt>기사 승인 대기</dt><dd>{approvalCount}명</dd></div>}</dl>
        <div className="operations-detail-actions"><button type="button" disabled={demo} title={demo ? "실제 내역에서 확인할 수 있습니다." : "선택일 주문 관리"} onClick={() => onOpen("orders", selectedDate)}><IonIcon icon={calendarOutline} />주문 보기</button><button type="button" disabled={demo} title={demo ? "실제 내역에서 확인할 수 있습니다." : "선택일 배송 배정"} onClick={() => onOpen("dispatch", selectedDate)}><IonIcon icon={carOutline} />배송 배정</button></div>
        <button className="operations-open-settlement" type="button" onClick={() => onOpen("settlements", selectedDate)}><IonIcon icon={cashOutline} />이날 정산 보기<IonIcon icon={arrowForwardOutline} /></button>
        <div className="operations-day-orders"><strong>배송 목록 <span>{selected.length}건</span></strong>{selected.length ? <ul>{selected.slice(0, 8).map((delivery) => <li key={delivery.id}><div><b>{delivery.customer}</b><small>{delivery.assignedDriver ?? "기사 미배정"}</small></div><span className={delivery.done ? "done" : "pending"}>{delivery.done ? "배송 완료" : "배송 예정"}</span></li>)}</ul> : <p>배송 일정이 없습니다.</p>}{selected.length > 8 && <small>외 {selected.length - 8}건</small>}</div>
      </aside>
    </div>
  </div>;
}

export function AdminPeriodSelector({ range, onChange }: { range: DateRange; onChange: (range: DateRange) => void }) {
  const [draft, setDraft] = useState(range);
  const [active, setActive] = useState<PeriodPreset | null>("month");
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => { setDraft(range); setSubmitted(false); }, [range.from, range.to]);
  const error = dateRangeError(draft);
  const presets: Array<[PeriodPreset, string]> = [["today", "오늘"], ["week", "최근 7일"], ["month", "이번 달"], ["previousMonth", "지난달"], ["quarter", "최근 3개월"]];
  return <div className="settlement-period-controls">
    <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); if (!error) { onChange(draft); setActive(null); } }}>
      <label>시작일<input aria-label="정산 시작일" type="date" required value={draft.from} onChange={(event) => { const value = event.currentTarget.value; setDraft((current) => ({ ...current, from: value })); }} /></label><span className="period-separator">~</span><label>종료일<input aria-label="정산 종료일" type="date" required value={draft.to} onChange={(event) => { const value = event.currentTarget.value; setDraft((current) => ({ ...current, to: value })); }} /></label><button type="submit" className="operation-primary"><IonIcon icon={searchOutline} />조회</button>
    </form>
    <div role="group" aria-label="정산 기간 빠른 선택">{presets.map(([preset, label]) => <button key={preset} type="button" aria-pressed={active === preset && range.from === periodRange(preset).from && range.to === periodRange(preset).to} onClick={() => { const next = periodRange(preset); setDraft(next); setSubmitted(false); onChange(next); setActive(preset); }}>{label}</button>)}</div>
    {submitted && error && <p className="period-error" role="alert">{error}</p>}
  </div>;
}

export function AdminSettlementWorkspace<T extends OperationalDelivery>({ deliveries, range, onRangeChange, renderDetails }: {
  deliveries: T[];
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
  renderDetails: (deliveries: T[]) => ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [driver, setDriver] = useState("");
  const [status, setStatus] = useState("");
  const periodDeliveries = useMemo(() => filterPeriod(deliveries, range), [deliveries, range.from, range.to]);
  const completed = periodDeliveries.filter((delivery) => delivery.done);
  const summary = operationSummary(periodDeliveries);
  const drivers = Array.from(new Set(completed.map((delivery) => delivery.assignedDriver ?? "미배정"))).sort();
  useEffect(() => { setDriver(""); }, [range.from, range.to]);
  const filtered = completed.filter((delivery) => {
    const term = search.trim().toLocaleLowerCase();
    return (!term || `${delivery.customer} ${delivery.orderNo} ${delivery.assignedDriver ?? ""}`.toLocaleLowerCase().includes(term)) &&
      (!driver || (delivery.assignedDriver ?? "미배정") === driver) && (!status || deliverySettlementStatus(delivery) === status);
  }).sort((a, b) => (a.deliveryDate ?? "").localeCompare(b.deliveryDate ?? "") || a.orderNo.localeCompare(b.orderNo));
  return <div className="settlement-workspace">
    <AdminPeriodSelector range={range} onChange={onRangeChange} />
    <div className="settlement-period-caption"><strong>{readableDate(range.from)} ~ {readableDate(range.to)}</strong><span>배송 완료 {summary.completed}건</span></div>
    <div className="operation-stats" aria-label="기간 정산 요약">
      <Stat label="완료 배송 총액" value={money(summary.completedAmount)} detail={`${summary.completed}건 · 배송일 기준`} />
      <Stat label="정산 가능액" value={money(summary.availableAmount)} detail={`${summary.available}건`} tone="blue" />
      <Stat label="정산 완료액" value={money(summary.settledAmount)} detail={`${summary.settled}건`} tone="green" />
      <Stat label="보류 금액" value={money(summary.heldAmount)} detail={`보냉백 확인 ${summary.held}건`} tone="amber" />
    </div>
    <section className="settlement-period-list" aria-label="기간별 정산 내역">
      <div className="settlement-period-list-heading"><h2>정산 내역 <span>{filtered.length}건</span></h2><span>조회 금액 {money(filtered.reduce((sum, delivery) => sum + deliveryAmount(delivery), 0))}</span></div>
      <div className="settlement-list-filters"><label className="settlement-search"><IonIcon icon={searchOutline} /><input aria-label="정산 내역 검색" placeholder="고객명, 주문번호, 기사명" value={search} onChange={(event) => setSearch(event.currentTarget.value)} /></label><select aria-label="정산 기사 필터" value={driver} onChange={(event) => setDriver(event.currentTarget.value)}><option value="">전체 기사</option>{drivers.map((name) => <option key={name} value={name}>{name}</option>)}</select><select aria-label="정산 상태 필터" value={status} onChange={(event) => setStatus(event.currentTarget.value)}><option value="">전체 상태</option>{["정산 가능", "정산 완료", "보냉백 확인"].map((value) => <option key={value} value={value}>{value}</option>)}</select>{(search || driver || status) && <button type="button" onClick={() => { setSearch(""); setDriver(""); setStatus(""); }}>초기화</button>}</div>
      {renderDetails(filtered)}
    </section>
  </div>;
}
