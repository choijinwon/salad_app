const today = new Date().toISOString().slice(0, 10);

const state = {
  zones: [
    { id: "zone-a", zoneName: "A구역", description: "매장 반경 3km 아파트 구역" },
    { id: "zone-b", zoneName: "B구역", description: "오피스텔과 상가 복합 구역" },
    { id: "zone-c", zoneName: "C구역", description: "정기배송 확장 구역" },
  ],
  customers: [
    {
      id: "customer-1",
      role: "CUSTOMER",
      name: "김샐러",
      phone: "010-2478-7821",
      birthdate: null,
      address: "서울시 마포구 월드컵북로 11",
      zoneId: "zone-a",
      email: "customer@salad.test",
      uniqueCode: "김샐9002147821",
      password: "customer123!",
    },
    {
      id: "customer-2",
      role: "CUSTOMER",
      name: "박그린",
      phone: "010-5121-4409",
      birthdate: null,
      address: "서울시 마포구 성산동 245",
      zoneId: "zone-b",
      email: "green@salad.test",
      uniqueCode: "박그8811034409",
      password: "customer123!",
    },
  ],
  drivers: [
    {
      id: "driver-1",
      name: "박배송",
      phone: "010-3000-1201",
      password: "driver123!",
      zoneId: "zone-a",
      vehicleNumber: "서울12가 3421",
      isActive: true,
      approvalStatus: "APPROVED",
    },
    {
      id: "driver-2",
      name: "정루트",
      phone: "010-3000-1202",
      password: "driver123!",
      zoneId: "zone-b",
      vehicleNumber: "서울33나 8201",
      isActive: true,
      approvalStatus: "APPROVED",
    },
    {
      id: "driver-3",
      name: "이미승인대기",
      phone: "010-3000-1203",
      password: "driver123!",
      zoneId: "zone-c",
      vehicleNumber: "서울45다 1203",
      isActive: false,
      approvalStatus: "PENDING",
    },
  ],
  deliveries: [
    {
      id: "delivery-1",
      subscriptionId: "subscription-1",
      customerId: "customer-1",
      customerName: "김샐러",
      driverId: "driver-1",
      zoneId: "zone-a",
      deliveryDate: today,
      status: "IN_TRANSIT",
      routeOrder: 1,
      address: "서울시 마포구 월드컵북로 11",
      latitude: 37.5566,
      longitude: 126.9144,
      requestNotes: "공동현관 1234*, 문 앞 보냉백",
      addressConfirmed: true,
      orderPrepared: true,
      insulatedBagReturned: false,
      unitPrice: 8900,
      completedAt: null,
      canceledAt: null,
    },
    {
      id: "delivery-2",
      subscriptionId: "subscription-2",
      customerId: "customer-2",
      customerName: "박그린",
      driverId: "driver-2",
      zoneId: "zone-b",
      deliveryDate: today,
      status: "PENDING",
      routeOrder: 2,
      address: "서울시 마포구 성산동 245",
      latitude: 37.563,
      longitude: 126.9087,
      requestNotes: "경비실에 맡겨주세요",
      addressConfirmed: false,
      orderPrepared: false,
      insulatedBagReturned: false,
      unitPrice: 8900,
      completedAt: null,
      canceledAt: null,
    },
    {
      id: "delivery-3",
      subscriptionId: "subscription-3",
      customerId: "customer-3",
      customerName: "최루꼴라",
      driverId: "driver-1",
      zoneId: "zone-a",
      deliveryDate: today,
      status: "PENDING",
      routeOrder: 3,
      address: "서울시 서대문구 연희로 41",
      latitude: 37.5699,
      longitude: 126.9301,
      requestNotes: "초인종 누르지 말아주세요",
      addressConfirmed: true,
      orderPrepared: false,
      insulatedBagReturned: false,
      unitPrice: 9900,
      completedAt: null,
      canceledAt: null,
    },
  ],
  products: [
    {
      id: "product-1",
      name: "정기 샐러드 10회권",
      price: 89000,
      status: "ACTIVE",
      description: "평일 아침 샐러드 정기배송",
      displayOrder: 1,
      visible: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "product-2",
      name: "프리미엄 샐러드 20회권",
      price: 168000,
      status: "ACTIVE",
      description: "고단백 프리미엄 구성",
      displayOrder: 2,
      visible: true,
      createdAt: new Date().toISOString(),
    },
  ],
  naverOrders: [
    {
      id: "naver-1",
      naverOrderNo: "NV-20260916-001",
      customerName: "네이버고객",
      phone: "010-9000-1111",
      address: "서울시 강남구 테헤란로 100",
      status: "NEEDS_CONFIRMATION",
      deliveryDate: today,
      createdAt: new Date().toISOString(),
    },
  ],
  adminAccounts: [
    {
      id: "admin-1",
      name: "샐러드 관리자",
      email: "admin@salad.test",
      password: "admin123!",
      phone: "010-0000-0000",
      uniqueCode: "샐러0000000000",
      createdAt: new Date().toISOString(),
    },
  ],
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  };
}

function ok(data, message = null) {
  return json(200, { success: true, data, message });
}

function fail(statusCode, message) {
  return json(statusCode, { success: false, data: null, message });
}

function readBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function apiPath(event) {
  const rawPath = event.path || "";
  return rawPath
    .replace(/^\/api/, "")
    .replace(/^\/\.netlify\/functions\/api/, "")
    .replace(/^\/+/, "/") || "/";
}

function zoneById(zoneId) {
  return state.zones.find((zone) => zone.id === zoneId) || null;
}

function driverById(driverId) {
  return state.drivers.find((driver) => driver.id === driverId) || null;
}

function publicCustomer(customer) {
  const { password, email, ...rest } = customer;
  return rest;
}

function publicDriver(driver) {
  const { password, ...rest } = driver;
  const zone = zoneById(driver.zoneId);
  return { ...rest, zoneName: zone ? zone.zoneName : null };
}

function publicDelivery(delivery) {
  const driver = driverById(delivery.driverId);
  const zone = zoneById(delivery.zoneId);
  return {
    ...delivery,
    driverName: driver ? driver.name : null,
    zoneName: zone ? zone.zoneName : null,
  };
}

function session(user, role) {
  return {
    id: user.id,
    role,
    name: user.name,
    phone: user.phone || null,
    address: user.address || null,
    email: user.email || null,
    uniqueCode: user.uniqueCode || null,
  };
}

exports.handler = async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return json(204, null);
  }

  const method = event.httpMethod;
  const path = apiPath(event);
  const body = readBody(event);

  if (path === "/" && method === "GET") {
    return ok({ name: "saltest1 Netlify API", status: "UP" });
  }

  if (path === "/auth/admin/login" && method === "POST") {
    const admin = state.adminAccounts.find((item) => item.email === body.email && item.password === body.password);
    if (!admin) return fail(401, "관리자 이메일 또는 비밀번호가 올바르지 않습니다.");
    return ok(session(admin, "ADMIN"), "관리자 로그인되었습니다.");
  }

  if (path === "/auth/customer/login" && method === "POST") {
    const loginId = body.loginId || body.email || body.phone;
    const customer = state.customers.find(
      (item) => [item.email, item.phone, item.uniqueCode].includes(loginId) && item.password === body.password,
    );
    if (!customer) return fail(401, "고객 계정 정보가 올바르지 않습니다.");
    return ok(session(customer, "CUSTOMER"), "고객 로그인되었습니다.");
  }

  if (path === "/auth/customer/signup" && method === "POST") {
    const customer = {
      id: id("customer"),
      role: "CUSTOMER",
      name: body.name,
      phone: body.phone,
      birthdate: null,
      address: body.address,
      zoneId: "zone-a",
      email: body.email,
      uniqueCode: `${String(body.name || "고객").slice(0, 2)}${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: body.password,
    };
    state.customers.push(customer);
    return ok(session(customer, "CUSTOMER"), "회원가입이 완료되었습니다.");
  }

  if (path === "/auth/driver/login" && method === "POST") {
    const driver = state.drivers.find((item) => item.phone === body.phone && item.password === body.password);
    if (!driver) return fail(401, "기사 전화번호 또는 비밀번호가 올바르지 않습니다.");
    if (driver.approvalStatus !== "APPROVED") return fail(403, "관리자 승인 후 로그인할 수 있습니다.");
    return ok(session(driver, "DRIVER"), "기사 로그인되었습니다.");
  }

  if (path === "/customers" && method === "GET") {
    return ok(state.customers.map(publicCustomer));
  }

  if (path === "/customers/manual" && method === "POST") {
    const customer = {
      id: id("customer"),
      role: "CUSTOMER",
      name: body.name,
      phone: body.phone,
      birthdate: body.birthdate || null,
      address: body.address,
      zoneId: body.zoneId || "zone-a",
      email: body.email || null,
      uniqueCode: `${String(body.name || "고객").slice(0, 2)}${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: body.password || "customer123!",
    };
    const subscriptionId = id("subscription");
    state.customers.push(customer);
    return ok({ customerId: customer.id, subscriptionId, uniqueCode: customer.uniqueCode }, "고객이 등록되었습니다.");
  }

  if (path === "/deliveries/today" && method === "GET") {
    return ok(state.deliveries.map(publicDelivery));
  }

  if (path === "/deliveries" && method === "POST") {
    const delivery = {
      id: id("delivery"),
      subscriptionId: body.subscriptionId,
      customerId: "customer-1",
      customerName: "신규 예약 고객",
      driverId: null,
      zoneId: "zone-a",
      deliveryDate: body.deliveryDate || today,
      status: "PENDING",
      routeOrder: null,
      address: "서울시 마포구 신규 배송지",
      latitude: 37.5566,
      longitude: 126.9144,
      requestNotes: null,
      addressConfirmed: false,
      orderPrepared: false,
      insulatedBagReturned: false,
      unitPrice: 8900,
      completedAt: null,
      canceledAt: null,
    };
    state.deliveries.push(delivery);
    return ok(publicDelivery(delivery), "배송이 등록되었습니다.");
  }

  const completeMatch = path.match(/^\/deliveries\/([^/]+)\/complete$/);
  if (completeMatch && method === "PATCH") {
    const delivery = state.deliveries.find((item) => item.id === completeMatch[1]);
    if (!delivery) return fail(404, "배송을 찾을 수 없습니다.");
    delivery.status = "DELIVERED";
    delivery.insulatedBagReturned = Boolean(body.insulatedBagReturned);
    delivery.completedAt = new Date().toISOString();
    return ok(publicDelivery(delivery), "배송 완료 처리되었습니다.");
  }

  const bagMatch = path.match(/^\/deliveries\/([^/]+)\/bag-return$/);
  if (bagMatch && method === "PATCH") {
    const delivery = state.deliveries.find((item) => item.id === bagMatch[1]);
    if (!delivery) return fail(404, "배송을 찾을 수 없습니다.");
    delivery.insulatedBagReturned = Boolean(body.insulatedBagReturned);
    return ok(publicDelivery(delivery), "보냉백 회수 상태가 변경되었습니다.");
  }

  if (path === "/drivers" && method === "GET") {
    return ok(state.drivers.map(publicDriver));
  }

  if (path === "/drivers" && method === "POST") {
    const driver = {
      id: id("driver"),
      name: body.name,
      phone: body.phone,
      password: body.password || "driver123!",
      zoneId: body.zoneId || null,
      vehicleNumber: body.vehicleNumber || null,
      isActive: false,
      approvalStatus: "PENDING",
    };
    state.drivers.push(driver);
    return ok(publicDriver(driver), "기사 승인 요청이 등록되었습니다.");
  }

  const driverMatch = path.match(/^\/drivers\/([^/]+)$/);
  if (driverMatch && method === "PATCH") {
    const driver = state.drivers.find((item) => item.id === driverMatch[1]);
    if (!driver) return fail(404, "기사를 찾을 수 없습니다.");
    if (Object.prototype.hasOwnProperty.call(body, "approvalStatus")) driver.approvalStatus = body.approvalStatus;
    if (Object.prototype.hasOwnProperty.call(body, "isActive")) driver.isActive = Boolean(body.isActive);
    if (Object.prototype.hasOwnProperty.call(body, "zoneId")) driver.zoneId = body.zoneId;
    return ok(publicDriver(driver), "기사 정보가 수정되었습니다.");
  }

  if (path === "/zones" && method === "GET") {
    return ok(state.zones);
  }

  if (path === "/zones" && method === "POST") {
    const zone = { id: id("zone"), zoneName: body.zoneName, description: body.description || null };
    state.zones.push(zone);
    return ok(zone, "배송 구역이 등록되었습니다.");
  }

  if (path === "/admin/products" && method === "GET") return ok(state.products);
  if (path === "/admin/products" && method === "POST") {
    const product = {
      id: id("product"),
      name: body.name,
      price: Number(body.price || 0),
      status: body.status || "ACTIVE",
      description: body.description || null,
      displayOrder: Number(body.displayOrder || state.products.length + 1),
      visible: body.visible !== false,
      createdAt: new Date().toISOString(),
    };
    state.products.push(product);
    return ok(product, "상품이 등록되었습니다.");
  }

  const productMatch = path.match(/^\/admin\/products\/([^/]+)$/);
  if (productMatch && method === "PATCH") {
    const product = state.products.find((item) => item.id === productMatch[1]);
    if (!product) return fail(404, "상품을 찾을 수 없습니다.");
    Object.assign(product, body);
    return ok(product, "상품이 수정되었습니다.");
  }

  if (path === "/admin/naver-orders" && method === "GET") return ok(state.naverOrders);
  if (path === "/admin/naver-orders" && method === "POST") {
    const order = {
      id: id("naver"),
      naverOrderNo: body.naverOrderNo,
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      status: body.status || "NEEDS_CONFIRMATION",
      deliveryDate: body.deliveryDate || null,
      createdAt: new Date().toISOString(),
    };
    state.naverOrders.push(order);
    return ok(order, "네이버 주문이 등록되었습니다.");
  }

  const naverMatch = path.match(/^\/admin\/naver-orders\/([^/]+)$/);
  if (naverMatch && method === "PATCH") {
    const order = state.naverOrders.find((item) => item.id === naverMatch[1]);
    if (!order) return fail(404, "네이버 주문을 찾을 수 없습니다.");
    Object.assign(order, body);
    return ok(order, "네이버 주문이 수정되었습니다.");
  }

  if (path === "/admin/accounts" && method === "GET") {
    return ok(state.adminAccounts.map(({ password, ...account }) => account));
  }

  if (path === "/admin/accounts" && method === "POST") {
    const account = {
      id: id("admin"),
      name: body.name,
      email: body.email,
      password: body.password || "admin123!",
      phone: body.phone || "010-0000-0000",
      uniqueCode: `관리${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      createdAt: new Date().toISOString(),
    };
    state.adminAccounts.push(account);
    const { password, ...publicAccount } = account;
    return ok(publicAccount, "관리자 계정이 등록되었습니다.");
  }

  const assignmentMatch = path.match(/^\/admin\/assignments\/([^/]+)$/);
  if (assignmentMatch && method === "PATCH") {
    const delivery = state.deliveries.find((item) => item.id === assignmentMatch[1]);
    if (!delivery) return fail(404, "배송을 찾을 수 없습니다.");
    delivery.driverId = body.driverId || null;
    delivery.routeOrder = body.routeOrder ?? null;
    delivery.zoneId = body.zoneId || delivery.zoneId;
    return ok(publicDelivery(delivery), "배송 기사가 배정되었습니다.");
  }

  const adminOrderMatch = path.match(/^\/admin\/orders\/([^/]+)$/);
  if (adminOrderMatch && method === "PATCH") {
    const delivery = state.deliveries.find((item) => item.id === adminOrderMatch[1]);
    if (!delivery) return fail(404, "주문을 찾을 수 없습니다.");
    if (Object.prototype.hasOwnProperty.call(body, "addressConfirmed")) delivery.addressConfirmed = Boolean(body.addressConfirmed);
    if (Object.prototype.hasOwnProperty.call(body, "orderPrepared")) delivery.orderPrepared = Boolean(body.orderPrepared);
    if (Object.prototype.hasOwnProperty.call(body, "deliveryDate")) delivery.deliveryDate = body.deliveryDate;
    if (Object.prototype.hasOwnProperty.call(body, "deliveryNotes")) delivery.requestNotes = body.deliveryNotes;
    return ok(publicDelivery(delivery), "주문 정보가 수정되었습니다.");
  }

  if (path.startsWith("/addresses/search") && method === "GET") {
    const keyword = event.queryStringParameters?.keyword || "테헤란로";
    return ok({
      source: "DEMO",
      totalCount: 3,
      currentPage: 1,
      countPerPage: 10,
      addresses: [
        {
          roadAddress: `서울특별시 강남구 ${keyword} 100`,
          jibunAddress: "서울특별시 강남구 역삼동 100",
          zipNo: "06234",
          siNm: "서울특별시",
          sggNm: "강남구",
          emdNm: "역삼동",
          detailHint: "건물명 또는 동/호수를 입력해주세요.",
        },
        {
          roadAddress: "서울특별시 마포구 월드컵북로 11",
          jibunAddress: "서울특별시 마포구 서교동 11",
          zipNo: "03992",
          siNm: "서울특별시",
          sggNm: "마포구",
          emdNm: "서교동",
          detailHint: "공동현관 정보를 확인해주세요.",
        },
        {
          roadAddress: "서울특별시 서대문구 연희로 41",
          jibunAddress: "서울특별시 서대문구 연희동 41",
          zipNo: "03708",
          siNm: "서울특별시",
          sggNm: "서대문구",
          emdNm: "연희동",
          detailHint: "배송 메모를 남겨주세요.",
        },
      ],
    });
  }

  return fail(404, `지원하지 않는 API입니다: ${method} ${path}`);
};
