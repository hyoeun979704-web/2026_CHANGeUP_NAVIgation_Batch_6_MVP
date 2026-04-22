-- PUPPY NOTE Schema — Neon PostgreSQL (no RLS, Clerk auth)
-- Run in Neon SQL Editor

create extension if not exists "uuid-ossp";

-- 1) 매장
create table if not exists stores (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  phone             text,
  business_number   text,
  store_type        text not null default 'grooming'
    check (store_type in ('grooming','daycare','kindergarten','mixed')),
  plan              text not null default 'free'
    check (plan in ('free','starter','pro','pro_pg')),
  monthly_ai_quota  int  not null default 20,
  toss_customer_key text,
  created_at        timestamptz not null default now()
);

-- 2) 사용자-매장 매핑 (user_id = Clerk userId string e.g. "user_2abc...")
create table if not exists store_members (
  store_id   uuid not null references stores(id) on delete cascade,
  user_id    text not null,
  role       text not null default 'owner'
    check (role in ('owner','staff')),
  created_at timestamptz not null default now(),
  primary key (store_id, user_id)
);

create index if not exists store_members_user_id_idx on store_members(user_id);

-- 3) 고객
create table if not exists customers (
  id             uuid primary key default uuid_generate_v4(),
  store_id       uuid not null references stores(id) on delete cascade,
  owner_name     text not null,
  owner_phone    text not null,
  pet_name       text not null,
  breed          text,
  pet_birthday   date,
  pet_weight_kg  numeric(4,1),
  neutered       boolean,
  allergies      text,
  medical_notes  text,
  special_notes  text,
  last_visit_at  timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists customers_store_id_idx on customers(store_id);

-- 4) 서비스 이력
create table if not exists service_logs (
  id           uuid primary key default uuid_generate_v4(),
  customer_id  uuid not null references customers(id) on delete cascade,
  service_date date not null default current_date,
  services     jsonb not null default '[]',
  notes        text,
  created_at   timestamptz not null default now()
);

create index if not exists service_logs_customer_date_idx on service_logs(customer_id, service_date desc);

-- 5) 알림장
create table if not exists notifications (
  id                       uuid primary key default uuid_generate_v4(),
  store_id                 uuid not null references stores(id)    on delete cascade,
  customer_id              uuid not null references customers(id) on delete cascade,
  keywords                 text not null,
  image_url                text,
  ai_draft                 text,
  final_text               text,
  tokens_used              int,
  latency_ms               int,
  draft_accepted_as_is     boolean,
  edit_distance            int,
  estimated_seconds_saved  int not null default 240,
  is_sent                  boolean not null default false,
  sent_at                  timestamptz,
  created_at               timestamptz not null default now()
);

create index if not exists notifications_store_id_idx on notifications(store_id, created_at desc);
