create table salad_products (
    id uuid primary key,
    name varchar(120) not null,
    price integer not null check (price >= 0),
    status varchar(20) not null default 'ACTIVE'
        check (status in ('ACTIVE', 'SOLD_OUT', 'HIDDEN')),
    description text,
    display_order integer not null default 0,
    visible boolean not null default true,
    created_at timestamptz not null default now()
);

create table naver_orders (
    id uuid primary key,
    naver_order_no varchar(80) not null unique,
    customer_name varchar(80) not null,
    phone varchar(30) not null,
    address text not null,
    status varchar(20) not null default 'NEEDS_CONFIRMATION'
        check (status in ('NEEDS_CONFIRMATION', 'LINKED', 'RESERVED', 'CANCELLED')),
    delivery_date date,
    created_at timestamptz not null default now()
);

create index idx_salad_products_status on salad_products(status);
create index idx_naver_orders_status on naver_orders(status);

insert into salad_products (id, name, price, status, description, display_order, visible)
values
    ('d1000000-0000-0000-0000-000000000001', '닭가슴살 샐러드', 8900, 'ACTIVE', '정기배송 기본 상품', 1, true),
    ('d1000000-0000-0000-0000-000000000002', '연어 샐러드', 11900, 'ACTIVE', '오전 배송 권장 상품', 2, true),
    ('d1000000-0000-0000-0000-000000000003', '아보카도 샐러드', 10900, 'SOLD_OUT', '재료 입고 확인 필요', 3, true)
on conflict (id) do nothing;

insert into naver_orders (id, naver_order_no, customer_name, phone, address, status, delivery_date)
values
    ('e1000000-0000-0000-0000-000000000001', 'N-240912-01', '김샐러', '010-1234-5678', '서울특별시 강남구 테헤란로 123', 'LINKED', current_date),
    ('e1000000-0000-0000-0000-000000000002', 'N-240912-02', '이로메인', '010-2222-3333', '서울특별시 강남구 논현로 85', 'NEEDS_CONFIRMATION', current_date),
    ('e1000000-0000-0000-0000-000000000003', 'N-240912-03', '신규고객', '010-4444-5555', '서울특별시 강남구 선릉로 152', 'RESERVED', current_date)
on conflict (id) do nothing;
