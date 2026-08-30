create extension if not exists postgis;

create type user_role as enum ('ADMIN', 'DRIVER', 'CUSTOMER');
create type order_source as enum ('NAVER', 'APP');
create type subscription_status as enum ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
create type delivery_status as enum ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'SKIPPED');
create type attendance_status as enum ('CLOCKED_IN', 'CLOCKED_OUT', 'ABSENT');

create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  zone_name text not null,
  description text,
  boundary geography(polygon, 4326),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'CUSTOMER',
  name text not null,
  phone text not null,
  birthdate date,
  address text,
  zone_id uuid references public.delivery_zones(id),
  unique_code text unique,
  created_at timestamptz not null default now()
);

create table public.driver_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  zone_id uuid references public.delivery_zones(id),
  vehicle_number text,
  is_active boolean not null default true
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  order_source order_source not null,
  total_count integer not null check (total_count in (1, 10, 20)),
  remaining_count integer not null check (remaining_count >= 0),
  unit_price integer not null default 8900,
  status subscription_status not null default 'ACTIVE',
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now()
);

create table public.delivery_schedules (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  driver_id uuid references public.profiles(id),
  zone_id uuid references public.delivery_zones(id),
  delivery_date date not null,
  status delivery_status not null default 'PENDING',
  route_order integer,
  address text not null,
  location geography(point, 4326),
  delivery_notes text,
  insulated_bag_returned boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.driver_attendances (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  work_date date not null,
  clock_in_time timestamptz,
  clock_out_time timestamptz,
  status attendance_status not null default 'ABSENT',
  clock_in_location geography(point, 4326),
  clock_out_location geography(point, 4326),
  unique (driver_id, work_date)
);

create or replace function public.generate_unique_code()
returns trigger
language plpgsql
as $$
begin
  if new.role = 'CUSTOMER' and new.unique_code is null then
    new.unique_code :=
      left(new.name, 2) ||
      to_char(new.birthdate, 'YYMMDD') ||
      right(regexp_replace(new.phone, '[^0-9]', '', 'g'), 4);
  end if;
  return new;
end;
$$;

create trigger profiles_generate_unique_code
before insert or update of name, phone, birthdate, role
on public.profiles
for each row
execute function public.generate_unique_code();

create or replace function public.decrement_remaining_count()
returns trigger
language plpgsql
as $$
begin
  if old.status is distinct from 'DELIVERED' and new.status = 'DELIVERED' then
    update public.subscriptions
    set remaining_count = greatest(remaining_count - 1, 0)
    where id = new.subscription_id;
  end if;
  return new;
end;
$$;

create trigger delivery_decrement_remaining_count
after update of status
on public.delivery_schedules
for each row
execute function public.decrement_remaining_count();

alter table public.delivery_zones enable row level security;
alter table public.profiles enable row level security;
alter table public.driver_profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.delivery_schedules enable row level security;
alter table public.driver_attendances enable row level security;

create policy "admins can manage all profiles"
on public.profiles
for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'));

create policy "customers can read own profile"
on public.profiles
for select
using (id = auth.uid());

create policy "customers can read own subscriptions"
on public.subscriptions
for select
using (customer_id = auth.uid());

create policy "drivers can update assigned deliveries"
on public.delivery_schedules
for update
using (driver_id = auth.uid())
with check (driver_id = auth.uid());

create policy "drivers can read assigned deliveries"
on public.delivery_schedules
for select
using (driver_id = auth.uid() or customer_id = auth.uid());
