"use client";

import { useMemo, useState } from "react";
import {
  attendance,
  architectureLayers,
  customers,
  deliveries,
  drivers,
  roadmap,
  schedules,
  services,
  zones,
} from "@/src/domain/mockData";
import type { DeliveryStatus, UserRole } from "@/src/domain/types";

const tabs: Array<{ id: UserRole | "ARCHITECTURE"; label: string }> = [
  { id: "ADMIN", label: "관리자" },
  { id: "DRIVER", label: "기사" },
  { id: "CUSTOMER", label: "고객" },
  { id: "ARCHITECTURE", label: "아키텍처" },
];

const statusLabel: Record<DeliveryStatus, string> = {
  PENDING: "대기",
  IN_TRANSIT: "배송중",
  DELIVERED: "완료",
  SKIPPED: "건너뜀",
};

const statusClass: Record<DeliveryStatus, string> = {
  PENDING: "status pending",
  IN_TRANSIT: "status transit",
  DELIVERED: "status done",
  SKIPPED: "status skipped",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<UserRole | "ARCHITECTURE">("ADMIN");
  const [selectedZone, setSelectedZone] = useState("ALL");

  const filteredDeliveries = useMemo(() => {
    if (selectedZone === "ALL") return deliveries;
    return deliveries.filter((delivery) => delivery.zoneId === selectedZone);
  }, [selectedZone]);

  const completedCount = filteredDeliveries.filter(
    (delivery) => delivery.status === "DELIVERED",
  ).length;
  const inTransitCount = filteredDeliveries.filter(
    (delivery) => delivery.status === "IN_TRANSIT",
  ).length;
  const bagReturnedCount = filteredDeliveries.filter(
    (delivery) => delivery.insulatedBagReturned,
  ).length;
  const settlementTotal = filteredDeliveries
    .filter((delivery) => delivery.status === "DELIVERED")
    .reduce((sum, delivery) => sum + delivery.unitPrice, 0);
  const bagReturnRate =
    filteredDeliveries.length === 0
      ? 0
      : Math.round((bagReturnedCount / filteredDeliveries.length) * 100);

  return (
    <main className="shell">
      <section className="topbar" aria-label="앱 개요">
        <div>
          <p className="eyebrow">Salad Store Delivery OS</p>
          <h1>샐러드 정기배송 운영 아키텍처</h1>
          <p className="lede">
            엑셀 요구사항을 고객 예약, 기사 배송, 관리자 정산이 연결되는
            React 기반 운영 콘솔 구조로 정리했습니다.
          </p>
        </div>
        <div className="topbar-actions" aria-label="핵심 스택">
          <span>React</span>
          <span>Supabase</span>
          <span>PostGIS</span>
          <span>Realtime</span>
        </div>
      </section>

      <nav className="role-tabs" aria-label="역할별 화면">
        {tabs.map((tab) => (
          <button
            aria-pressed={activeTab === tab.id}
            className={activeTab === tab.id ? "tab active" : "tab"}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "ADMIN" && (
        <AdminWorkspace
          bagReturnRate={bagReturnRate}
          completedCount={completedCount}
          filteredDeliveries={filteredDeliveries}
          inTransitCount={inTransitCount}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
          settlementTotal={settlementTotal}
        />
      )}

      {activeTab === "DRIVER" && <DriverWorkspace />}
      {activeTab === "CUSTOMER" && <CustomerWorkspace />}
      {activeTab === "ARCHITECTURE" && <ArchitectureWorkspace />}
    </main>
  );
}

function AdminWorkspace({
  bagReturnRate,
  completedCount,
  filteredDeliveries,
  inTransitCount,
  selectedZone,
  setSelectedZone,
  settlementTotal,
}: {
  bagReturnRate: number;
  completedCount: number;
  filteredDeliveries: typeof deliveries;
  inTransitCount: number;
  selectedZone: string;
  setSelectedZone: (zoneId: string) => void;
  settlementTotal: number;
}) {
  return (
    <section className="workspace" aria-label="관리자 워크스페이스">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Admin Console</p>
          <h2>오늘 배송, 보냉백, 정산을 한 번에 봅니다</h2>
        </div>
        <label className="zone-filter">
          배송 구역
          <select
            aria-label="배송 구역 필터"
            onChange={(event) => setSelectedZone(event.target.value)}
            value={selectedZone}
          >
            <option value="ALL">전체</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="metric-grid">
        <Metric title="오늘 배송" value={`${filteredDeliveries.length}건`} note="구역 필터 반영" />
        <Metric title="배송 완료" value={`${completedCount}건`} note={`${inTransitCount}건 진행 중`} />
        <Metric title="보냉백 회수율" value={`${bagReturnRate}%`} note="미회수 고객 별도 추적" />
        <Metric
          title="금일 정산"
          value={`${settlementTotal.toLocaleString("ko-KR")}원`}
          note="완료 건 기준"
        />
      </div>

      <div className="split-grid">
        <section className="panel">
          <div className="panel-title">
            <h3>실시간 배송 현황</h3>
            <span className="pill">Supabase Realtime</span>
          </div>
          <div className="delivery-list">
            {filteredDeliveries.map((delivery) => (
              <article className="delivery-row" key={delivery.id}>
                <div className="route-number">{delivery.routeOrder}</div>
                <div>
                  <strong>{delivery.customerName}</strong>
                  <span>{delivery.address}</span>
                </div>
                <div className="delivery-meta">
                  <span className={statusClass[delivery.status]}>
                    {statusLabel[delivery.status]}
                  </span>
                  <span>{delivery.driverName}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <h3>수동 등록/계정 관리</h3>
            <span className="pill accent">네이버 주문 대체</span>
          </div>
          <div className="form-preview">
            <label>
              고객명
              <input readOnly value="이정기" />
            </label>
            <label>
              생년월일
              <input readOnly value="1991-04-12" />
            </label>
            <label>
              구매 회차
              <select aria-label="구매 회차" defaultValue="10">
                <option value="1">1회권</option>
                <option value="10">10회권</option>
                <option value="20">20회권</option>
              </select>
            </label>
            <div className="generated-code">자동 식별 ID: 이정9104127821</div>
          </div>
          <div className="driver-status">
            {drivers.map((driver) => (
              <div className="driver-row" key={driver.id}>
                <div>
                  <strong>{driver.name}</strong>
                  <span>{driver.zoneName}</span>
                </div>
                <span className={driver.isActive ? "status done" : "status skipped"}>
                  {driver.isActive ? "활성" : "비활성"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-title">
          <h3>정산 및 출력 테이블</h3>
          <button className="icon-button" type="button" aria-label="일일 리포트 출력">
            PDF
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>고객</th>
                <th>구역</th>
                <th>상태</th>
                <th>보냉백</th>
                <th>차감</th>
                <th>정산</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id}>
                  <td>{delivery.customerName}</td>
                  <td>{delivery.zoneName}</td>
                  <td>{statusLabel[delivery.status]}</td>
                  <td>{delivery.insulatedBagReturned ? "회수" : "미회수"}</td>
                  <td>{delivery.status === "DELIVERED" ? "1회" : "-"}</td>
                  <td>{delivery.unitPrice.toLocaleString("ko-KR")}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function DriverWorkspace() {
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(deliveries[0].id);
  const selectedDelivery = deliveries.find(
    (delivery) => delivery.id === selectedDeliveryId,
  );

  return (
    <section className="workspace" aria-label="기사 워크스페이스">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Driver App</p>
          <h2>출퇴근, 배송 루트, 보냉백 회수를 모바일 우선으로</h2>
        </div>
        <div className="attendance-box">
          <span>오늘 근태</span>
          <strong>{attendance[0].clockInTime} 출근</strong>
        </div>
      </div>

      <div className="driver-layout">
        <section className="map-surface" aria-label="배송 지도 미리보기">
          {deliveries.slice(0, 5).map((delivery, index) => (
            <button
              aria-label={`${delivery.customerName} 배송지 선택`}
              className={
                selectedDeliveryId === delivery.id
                  ? "map-marker selected"
                  : "map-marker"
              }
              key={delivery.id}
              onClick={() => setSelectedDeliveryId(delivery.id)}
              style={{
                left: `${16 + index * 15}%`,
                top: `${24 + ((index * 17) % 48)}%`,
              }}
              type="button"
            >
              {delivery.routeOrder}
            </button>
          ))}
          <div className="route-line" />
        </section>

        <section className="panel route-panel">
          <div className="panel-title">
            <h3>오늘 배송 루트</h3>
            <span className="pill">Zone A</span>
          </div>
          <div className="delivery-list compact">
            {deliveries.slice(0, 5).map((delivery) => (
              <button
                className={
                  selectedDeliveryId === delivery.id
                    ? "route-card selected"
                    : "route-card"
                }
                key={delivery.id}
                onClick={() => setSelectedDeliveryId(delivery.id)}
                type="button"
              >
                <span>{delivery.routeOrder}</span>
                <strong>{delivery.customerName}</strong>
                <small>{delivery.requestNotes}</small>
              </button>
            ))}
          </div>
          {selectedDelivery && (
            <div className="completion-box">
              <strong>{selectedDelivery.customerName} 상세</strong>
              <p>{selectedDelivery.address}</p>
              <label className="checkbox-line">
                <input type="checkbox" defaultChecked={selectedDelivery.insulatedBagReturned} />
                보냉백 회수 확인
              </label>
              <button className="primary-button" type="button">
                배송 완료 처리
              </button>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function CustomerWorkspace() {
  return (
    <section className="workspace" aria-label="고객 워크스페이스">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Customer Booking</p>
          <h2>남은 회차와 변경 마감 시간을 먼저 보여줍니다</h2>
        </div>
        <div className="attendance-box">
          <span>10회권 중</span>
          <strong>4회 남음</strong>
        </div>
      </div>

      <div className="customer-layout">
        <section className="panel">
          <div className="panel-title">
            <h3>배송일 선택</h3>
            <span className="pill">전날 18:00 마감</span>
          </div>
          <div className="calendar-grid" aria-label="배송일 달력 예시">
            {Array.from({ length: 30 }, (_, index) => {
              const day = index + 1;
              const schedule = schedules.find((item) => item.day === day);
              return (
                <button
                  className={schedule ? `day scheduled ${schedule.kind}` : "day"}
                  key={day}
                  type="button"
                >
                  <span>{day}</span>
                  {schedule && <small>{schedule.label}</small>}
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <h3>요청사항과 주문 상태</h3>
            <span className="pill accent">App 주문</span>
          </div>
          <div className="request-box">
            <label>
              배송 요청사항
              <textarea
                readOnly
                value="공동현관 1234*, 문 앞 보냉백에 넣어주세요."
              />
            </label>
            <div className="subscription-list">
              {customers.map((customer) => (
                <article className="subscription-row" key={customer.id}>
                  <div>
                    <strong>{customer.name}</strong>
                    <span>{customer.uniqueCode}</span>
                  </div>
                  <span>{customer.remainingCount}/{customer.totalCount}회</span>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function ArchitectureWorkspace() {
  return (
    <section className="workspace" aria-label="아키텍처 워크스페이스">
      <div className="section-heading">
        <div>
          <p className="eyebrow">System Architecture</p>
          <h2>React 프론트와 Supabase 백엔드를 느슨하게 연결합니다</h2>
        </div>
      </div>

      <div className="architecture-grid">
        {architectureLayers.map((layer) => (
          <section className="panel" key={layer.title}>
            <div className="panel-title">
              <h3>{layer.title}</h3>
              <span className="pill">{layer.kind}</span>
            </div>
            <p className="layer-copy">{layer.description}</p>
            <ul className="plain-list">
              {layer.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="panel">
        <div className="panel-title">
          <h3>서비스 모듈 경계</h3>
          <span className="pill accent">src/domain/services.ts</span>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <article className="service-block" key={service.name}>
              <strong>{service.name}</strong>
              <span>{service.description}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <h3>개발 단계</h3>
          <span className="pill">MVP Roadmap</span>
        </div>
        <ol className="roadmap">
          {roadmap.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}

function Metric({
  note,
  title,
  value,
}: {
  note: string;
  title: string;
  value: string;
}) {
  return (
    <article className="metric">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
