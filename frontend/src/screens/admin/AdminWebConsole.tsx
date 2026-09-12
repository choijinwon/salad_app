import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Badge, ErrorState, PrimaryButton, Spinner } from "../../components/ui";
import {
  ApiService,
  type CustomerResponse,
  type DailySettlementResponse,
  type DashboardResponse,
  type DeliveryResponse,
  type DriverResponse,
  type NaverOrderResponse,
} from "../../services/apiService";
import { formatDateToIso } from "../../services/deliveryService";
import { colors } from "../../theme";

type AdminTab = "dashboard" | "orders" | "assignments" | "customers" | "drivers" | "naver";

export default function AdminWebConsole({
  adminName,
  onSignOut,
}: {
  adminName: string;
  onSignOut: () => void;
}) {
  const today = useMemo(() => formatDateToIso(new Date()), []);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [date, setDate] = useState(today);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [settlement, setSettlement] = useState<DailySettlementResponse | null>(null);
  const [orders, setOrders] = useState<DeliveryResponse[]>([]);
  const [assignments, setAssignments] = useState<DeliveryResponse[]>([]);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [drivers, setDrivers] = useState<DriverResponse[]>([]);
  const [naverOrders, setNaverOrders] = useState<NaverOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, daily, orderItems, assignmentItems, customerItems, driverItems, naverItems] =
        await Promise.all([
          ApiService.getDashboard(),
          ApiService.getDailySettlement(date),
          ApiService.getAdminOrders(date, false),
          ApiService.getAssignments(date),
          ApiService.getCustomers(),
          ApiService.getDrivers(),
          ApiService.getNaverOrders(),
        ]);
      setDashboard(dash);
      setSettlement(daily);
      setOrders(orderItems);
      setAssignments(assignmentItems);
      setCustomers(customerItems);
      setDrivers(driverItems);
      setNaverOrders(naverItems);
    } catch (e) {
      setError(e instanceof Error ? e.message : "관리자 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const completedAmount = settlement?.totalAmount ?? 0;

  async function handleApproveDriver(driverId: string) {
    await ApiService.approveDriver(driverId);
    await load();
  }

  return (
    <View style={styles.app}>
      <View style={styles.sidebar}>
        <View>
          <Text style={styles.brand}>SALAD OPS</Text>
          <Text style={styles.sidebarTitle}>관리자 웹</Text>
          <Text style={styles.sidebarMeta}>{adminName}</Text>
        </View>
        <View style={styles.nav}>
          {navItems.map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item.key}
              onPress={() => setActiveTab(item.key)}
              style={[styles.navItem, activeTab === item.key && styles.navItemActive]}
            >
              <Text style={[styles.navText, activeTab === item.key && styles.navTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <PrimaryButton onPress={onSignOut} tone="slate">로그아웃</PrimaryButton>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topbar}>
          <View>
            <Text style={styles.eyebrow}>PC 운영 콘솔</Text>
            <Text style={styles.title}>{navItems.find((item) => item.key === activeTab)?.label}</Text>
          </View>
          <View style={styles.dateControl}>
            <Text style={styles.dateLabel}>운영일</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              style={styles.dateInput}
            />
            <PrimaryButton onPress={load} style={styles.refreshButton}>새로고침</PrimaryButton>
          </View>
        </View>

        {loading ? (
          <Spinner label="관리자 데이터 불러오는 중" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <>
            {activeTab === "dashboard" ? (
              <DashboardView dashboard={dashboard} settlementAmount={completedAmount} orders={orders} />
            ) : null}
            {activeTab === "orders" ? <OrdersView orders={orders} /> : null}
            {activeTab === "assignments" ? (
              <AssignmentsView assignments={assignments} drivers={drivers} />
            ) : null}
            {activeTab === "customers" ? <CustomersView customers={customers} /> : null}
            {activeTab === "drivers" ? (
              <DriversApprovalView drivers={drivers} onApprove={handleApproveDriver} />
            ) : null}
            {activeTab === "naver" ? <NaverView orders={naverOrders} /> : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function DashboardView({
  dashboard,
  orders,
  settlementAmount,
}: {
  dashboard: DashboardResponse | null;
  orders: DeliveryResponse[];
  settlementAmount: number;
}) {
  if (!dashboard) return <ErrorState message="현황 데이터가 없습니다." />;
  return (
    <>
      <View style={styles.metricGrid}>
        <Metric label="오늘 배송" value={`${dashboard.totalCount}건`} tone="blue" />
        <Metric label="완료" value={`${dashboard.completedCount}건`} tone="green" />
        <Metric label="진행/대기" value={`${dashboard.inTransitCount + dashboard.pendingCount}건`} tone="amber" />
        <Metric label="정산 합계" value={`${settlementAmount.toLocaleString("ko-KR")}원`} tone="coral" />
      </View>
      <View style={styles.panelGrid}>
        <Panel title="오늘 주문 흐름" subtitle={`${orders.length}건`}>
          {orders.slice(0, 6).map((order) => (
            <ListRow
              key={order.id}
              title={order.customerName}
              subtitle={`${order.deliveryDate} · ${order.address}`}
              right={<Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge>}
            />
          ))}
        </Panel>
        <Panel title="보냉백 미회수" subtitle={`${dashboard.unreturnedBags.length}건`}>
          {dashboard.unreturnedBags.map((item) => (
            <ListRow
              key={item.customerId}
              title={item.customerName}
              subtitle={`${item.address} · ${item.phone}`}
              right={<Badge tone="coral">미회수</Badge>}
            />
          ))}
          {dashboard.unreturnedBags.length === 0 ? <Text style={styles.empty}>미회수 보냉백이 없습니다.</Text> : null}
        </Panel>
      </View>
    </>
  );
}

function OrdersView({ orders }: { orders: DeliveryResponse[] }) {
  return (
    <Panel title="주문 관리" subtitle={`${orders.length}건`}>
      <TableHeader columns={["고객", "배송일", "주소", "상태", "요청사항"]} />
      {orders.map((order) => (
        <TableRow
          key={order.id}
          cells={[
            order.customerName,
            order.deliveryDate,
            order.address,
            statusLabel(order.status),
            order.requestNotes || "-",
          ]}
        />
      ))}
    </Panel>
  );
}

function AssignmentsView({
  assignments,
  drivers,
}: {
  assignments: DeliveryResponse[];
  drivers: DriverResponse[];
}) {
  return (
    <View style={styles.panelGrid}>
      <Panel title="배송 배정" subtitle={`${assignments.length}건`}>
        <TableHeader columns={["순서", "고객", "기사", "구역", "상태"]} />
        {assignments.map((delivery) => (
          <TableRow
            key={delivery.id}
            cells={[
              delivery.routeOrder ? String(delivery.routeOrder) : "-",
              delivery.customerName,
              delivery.driverName || "미배정",
              delivery.zoneName || "미배정",
              statusLabel(delivery.status),
            ]}
          />
        ))}
      </Panel>
      <Panel title="기사 현황" subtitle={`${drivers.length}명`}>
        {drivers.map((driver) => (
          <ListRow
            key={driver.id}
            title={driver.name}
            subtitle={`${driver.zoneName || "구역 없음"} · ${driver.vehicleNumber || "차량 없음"} · ${driver.phone}`}
            right={<Badge tone={driver.isActive ? "green" : "slate"}>{driver.isActive ? "운행" : "비활성"}</Badge>}
          />
        ))}
      </Panel>
    </View>
  );
}

function CustomersView({ customers }: { customers: CustomerResponse[] }) {
  return (
    <Panel title="고객 관리" subtitle={`${customers.length}명`}>
      <TableHeader columns={["이름", "전화번호", "주소", "고유식별 ID", "구역"]} />
      {customers.map((customer) => (
        <TableRow
          key={customer.id}
          cells={[
            customer.name,
            customer.phone,
            customer.address,
            customer.uniqueCode,
            customer.zoneId || "-",
          ]}
        />
      ))}
    </Panel>
  );
}

function DriversApprovalView({
  drivers,
  onApprove,
}: {
  drivers: DriverResponse[];
  onApprove: (driverId: string) => Promise<void>;
}) {
  const pending = drivers.filter((driver) => driver.approvalStatus === "PENDING");
  const approved = drivers.filter((driver) => driver.approvalStatus === "APPROVED");

  return (
    <View style={styles.panelGrid}>
      <Panel title="승인 대기 기사" subtitle={`${pending.length}명`}>
        {pending.map((driver) => (
          <ListRow
            key={driver.id}
            title={driver.name}
            subtitle={`${driver.phone} · ${driver.zoneName || "구역 미배정"} · ${driver.vehicleNumber || "차량 미등록"}`}
            right={
              <View style={styles.rowActions}>
                <Badge tone="amber">승인 대기</Badge>
                <PrimaryButton onPress={() => onApprove(driver.id)} style={styles.smallButton}>
                  승인
                </PrimaryButton>
              </View>
            }
          />
        ))}
        {pending.length === 0 ? <Text style={styles.empty}>승인 대기 중인 기사가 없습니다.</Text> : null}
      </Panel>
      <Panel title="승인된 기사" subtitle={`${approved.length}명`}>
        {approved.map((driver) => (
          <ListRow
            key={driver.id}
            title={driver.name}
            subtitle={`${driver.phone} · ${driver.zoneName || "구역 미배정"} · ${driver.vehicleNumber || "차량 미등록"}`}
            right={<Badge tone={driver.isActive ? "green" : "slate"}>{driver.isActive ? "사용 가능" : "비활성"}</Badge>}
          />
        ))}
      </Panel>
    </View>
  );
}

function NaverView({ orders }: { orders: NaverOrderResponse[] }) {
  return (
    <Panel title="네이버 주문" subtitle={`${orders.length}건`}>
      <TableHeader columns={["주문자", "상품", "희망일", "상태", "주소"]} />
      {orders.map((order) => (
        <TableRow
          key={order.id}
          cells={[
            order.ordererName,
            order.productName,
            order.hopeDeliveryYmd ?? "-",
            order.claimStatus || order.productOrderStatus,
            `${order.baseAddress} ${order.detailedAddress}`,
          ]}
        />
      ))}
    </Panel>
  );
}

function Metric({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "amber" | "blue" | "coral" | "green";
  value: string;
}) {
  return (
    <View style={[styles.metric, metricTone[tone]]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function Panel({
  children,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  subtitle?: string;
  title: string;
}) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>{title}</Text>
        {subtitle ? <Text style={styles.panelSubtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function ListRow({
  right,
  subtitle,
  title,
}: {
  right?: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.listRow}>
      <View style={styles.listText}>
        <Text style={styles.listTitle}>{title}</Text>
        <Text style={styles.listSubtitle}>{subtitle}</Text>
      </View>
      {right}
    </View>
  );
}

function TableHeader({ columns }: { columns: string[] }) {
  return (
    <View style={[styles.tableRow, styles.tableHeader]}>
      {columns.map((column) => (
        <Text key={column} style={[styles.tableCell, styles.tableHeaderCell]}>
          {column}
        </Text>
      ))}
    </View>
  );
}

function TableRow({ cells }: { cells: string[] }) {
  return (
    <View style={styles.tableRow}>
      {cells.map((cell, index) => (
        <Text key={`${cell}-${index}`} numberOfLines={2} style={styles.tableCell}>
          {cell}
        </Text>
      ))}
    </View>
  );
}

function statusLabel(status: DeliveryResponse["status"]) {
  if (status === "DELIVERED") return "완료";
  if (status === "IN_TRANSIT") return "배송 중";
  if (status === "CANCELLED") return "취소";
  if (status === "SKIPPED") return "건너뜀";
  return "대기";
}

function statusTone(status: DeliveryResponse["status"]) {
  if (status === "DELIVERED") return "green";
  if (status === "IN_TRANSIT") return "blue";
  if (status === "CANCELLED") return "coral";
  return "amber";
}

const navItems: { key: AdminTab; label: string }[] = [
  { key: "dashboard", label: "운영 현황" },
  { key: "orders", label: "주문 관리" },
  { key: "assignments", label: "배송 배정" },
  { key: "customers", label: "고객 관리" },
  { key: "drivers", label: "기사 승인" },
  { key: "naver", label: "네이버 주문" },
];

const metricTone = {
  amber: { borderLeftColor: colors.amber },
  blue: { borderLeftColor: colors.blue },
  coral: { borderLeftColor: colors.coral },
  green: { borderLeftColor: colors.green },
};

const styles = StyleSheet.create({
  app: {
    backgroundColor: colors.background,
    flex: 1,
    flexDirection: "row",
  },
  brand: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "900",
  },
  content: {
    gap: 18,
    padding: 24,
  },
  dateControl: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  dateInput: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.foreground,
    minHeight: 42,
    paddingHorizontal: 12,
    width: 142,
  },
  dateLabel: {
    color: colors.muted,
    fontWeight: "800",
  },
  empty: {
    color: colors.muted,
    paddingTop: 12,
  },
  eyebrow: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: "900",
  },
  listRow: {
    alignItems: "center",
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  listSubtitle: {
    color: colors.muted,
    lineHeight: 19,
    marginTop: 3,
  },
  listText: {
    flex: 1,
  },
  listTitle: {
    color: colors.foreground,
    fontWeight: "900",
  },
  metric: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderLeftWidth: 5,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 190,
    padding: 18,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  metricValue: {
    color: colors.foreground,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 8,
  },
  nav: {
    gap: 8,
    marginVertical: 28,
  },
  navItem: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  navItemActive: {
    backgroundColor: colors.green,
  },
  navText: {
    color: colors.mint,
    fontWeight: "900",
  },
  navTextActive: {
    color: colors.panel,
  },
  panel: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minWidth: 340,
    padding: 18,
  },
  panelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  panelHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  panelSubtitle: {
    color: colors.greenDark,
    fontWeight: "900",
  },
  panelTitle: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: "900",
  },
  refreshButton: {
    minHeight: 42,
  },
  rowActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  sidebar: {
    backgroundColor: colors.slate,
    justifyContent: "space-between",
    minHeight: "100%",
    padding: 22,
    width: 240,
  },
  sidebarMeta: {
    color: colors.mint,
    fontWeight: "800",
    marginTop: 8,
  },
  sidebarTitle: {
    color: colors.panel,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 8,
  },
  smallButton: {
    minHeight: 36,
    minWidth: 64,
    paddingHorizontal: 12,
  },
  tableCell: {
    color: colors.foreground,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 8,
    paddingVertical: 11,
  },
  tableHeader: {
    backgroundColor: colors.slateSoft,
    borderTopWidth: 0,
  },
  tableHeaderCell: {
    color: colors.muted,
    fontWeight: "900",
  },
  tableRow: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: "row",
  },
  title: {
    color: colors.foreground,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 2,
  },
  topbar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
