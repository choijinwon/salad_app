alter table profiles
    add column if not exists email varchar(120),
    add column if not exists password_hash varchar(255);

create unique index if not exists idx_profiles_email_lower
    on profiles (lower(email))
    where email is not null;
