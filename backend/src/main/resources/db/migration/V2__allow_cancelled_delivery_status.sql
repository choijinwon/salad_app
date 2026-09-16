alter table delivery_schedules
    add column if not exists canceled_at timestamptz;

alter table delivery_schedules
    drop constraint if exists delivery_schedules_status_check;

alter table delivery_schedules
    add constraint delivery_schedules_status_check
    check (status in ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'SKIPPED', 'CANCELLED'));
