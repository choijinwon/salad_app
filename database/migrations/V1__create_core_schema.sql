create table delivery_zones (
    id uuid primary key,
    zone_name varchar(100) not null,
    description text,
    created_at timestamptz not null default now()
);

create table profiles (
    id uuid primary key,
    role varchar(20) not null check (role in ('ADMIN', 'DRIVER', 'CUSTOMER')),
    name varchar(80) not null,
    phone varchar(30) not null,
    birthdate date,
    address text,
    zone_id uuid references delivery_zones(id),
    unique_code varchar(40) unique,
    created_at timestamptz not null default now()
);

create table driver_profiles (
    id uuid primary key,
    profile_id uuid not null unique references profiles(id) on delete cascade,
    zone_id uuid references delivery_zones(id),
    vehicle_number varchar(40),
    is_active boolean not null default true
);

create table subscriptions (
    id uuid primary key,
    customer_id uuid not null references profiles(id) on delete cascade,
    order_source varchar(20) not null check (order_source in ('NAVER', 'APP')),
    total_count integer not null check (total_count in (1, 10, 20)),
    remaining_count integer not null check (remaining_count >= 0),
    unit_price integer not null default 8900,
    status varchar(20) not null default 'ACTIVE'
        check (status in ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')),
    start_date date not null,
    end_date date,
    created_at timestamptz not null default now()
);

create table delivery_schedules (
    id uuid primary key,
    subscription_id uuid not null references subscriptions(id) on delete cascade,
    customer_id uuid not null references profiles(id) on delete cascade,
    driver_id uuid references profiles(id),
    zone_id uuid references delivery_zones(id),
    delivery_date date not null,
    status varchar(20) not null default 'PENDING'
        check (status in ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'SKIPPED')),
    route_order integer,
    address text not null,
    latitude numeric(10, 7),
    longitude numeric(10, 7),
    delivery_notes text,
    insulated_bag_returned boolean not null default false,
    completed_at timestamptz,
    created_at timestamptz not null default now()
);

create table driver_attendances (
    id uuid primary key,
    driver_id uuid not null references profiles(id) on delete cascade,
    work_date date not null,
    clock_in_time timestamptz,
    clock_out_time timestamptz,
    status varchar(20) not null default 'ABSENT'
        check (status in ('CLOCKED_IN', 'CLOCKED_OUT', 'ABSENT')),
    clock_in_latitude numeric(10, 7),
    clock_in_longitude numeric(10, 7),
    clock_out_latitude numeric(10, 7),
    clock_out_longitude numeric(10, 7),
    unique (driver_id, work_date)
);

create index idx_profiles_role on profiles(role);
create index idx_profiles_unique_code on profiles(unique_code);
create index idx_delivery_schedules_date on delivery_schedules(delivery_date);
create index idx_delivery_schedules_driver_date on delivery_schedules(driver_id, delivery_date);
create index idx_delivery_schedules_zone_date on delivery_schedules(zone_id, delivery_date);
