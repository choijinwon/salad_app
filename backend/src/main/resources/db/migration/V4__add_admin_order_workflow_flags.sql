alter table delivery_schedules
    add column address_confirmed boolean not null default false,
    add column order_prepared boolean not null default false;
