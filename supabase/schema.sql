-- PetNoti MVP Schema
-- Run this in Supabase SQL Editor

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1) 매장
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table if not exists public.stores (
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

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2) 사용자-매장 매핑 (멀티테넌시 핵심)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table if not exists public.store_members (
  store_id   uuid not null references public.stores(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'owner'
    check (role in ('owner','staff')),
  created_at timestamptz not null default now(),
  primary key (store_id, user_id)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3) 고객 (보호자 + 반려동물 + 특이사항)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table if not exists public.customers (
  id             uuid primary key default uuid_generate_v4(),
  store_id       uuid not null references public.stores(id) on delete cascade,
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

create index if not exists customers_store_id_idx on public.customers(store_id);
create index if not exists customers_store_phone_idx on public.customers(store_id, owner_phone);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4) 서비스 이력 (RAG 소스)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table if not exists public.service_logs (
  id           uuid primary key default uuid_generate_v4(),
  customer_id  uuid not null references public.customers(id) on delete cascade,
  service_date date not null default current_date,
  services     text[] not null,
  notes        text,
  created_at   timestamptz not null default now()
);

create index if not exists service_logs_customer_date_idx on public.service_logs(customer_id, service_date desc);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5) 알림 (KPI 측정 컬럼 포함)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table if not exists public.notifications (
  id                       uuid primary key default uuid_generate_v4(),
  store_id                 uuid not null references public.stores(id)    on delete cascade,
  customer_id              uuid not null references public.customers(id) on delete cascade,
  keywords                 text not null,
  image_url                text,
  ai_draft                 text,
  final_text               text,
  tokens_used              int,
  latency_ms               int,
  draft_accepted_as_is     boolean default false,
  edit_distance            int,
  estimated_seconds_saved  int default 240,
  is_sent                  boolean not null default false,
  sent_at                  timestamptz,
  created_at               timestamptz not null default now()
);

create index if not exists notifications_store_created_idx on public.notifications(store_id, created_at desc);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6) Post-MVP 스키마 (UI 미구현, 스키마만 선반영)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
create table if not exists public.reservations (
  id              uuid primary key default uuid_generate_v4(),
  store_id        uuid not null references public.stores(id)    on delete cascade,
  customer_id     uuid not null references public.customers(id) on delete cascade,
  scheduled_at    timestamptz not null,
  duration_min    int not null default 90,
  services        text[] not null default '{}',
  status          text not null default 'pending'
    check (status in ('pending','confirmed','completed','no_show','cancelled')),
  deposit_amount  int,
  deposit_paid_at timestamptz,
  notes           text,
  created_at      timestamptz not null default now()
);

create index if not exists reservations_store_scheduled_idx on public.reservations(store_id, scheduled_at);

create table if not exists public.payments (
  id                uuid primary key default uuid_generate_v4(),
  store_id          uuid not null references public.stores(id) on delete cascade,
  reservation_id    uuid references public.reservations(id) on delete set null,
  toss_payment_key  text unique,
  amount            int not null,
  status            text not null,
  paid_at           timestamptz,
  raw_response      jsonb,
  created_at        timestamptz not null default now()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7) Storage Bucket
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', false)
on conflict (id) do nothing;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8) RLS: 매장 단위 격리
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
alter table public.stores         enable row level security;
alter table public.store_members  enable row level security;
alter table public.customers      enable row level security;
alter table public.service_logs   enable row level security;
alter table public.notifications  enable row level security;
alter table public.reservations   enable row level security;
alter table public.payments       enable row level security;

create or replace function public.current_user_stores()
returns setof uuid language sql stable security definer as $$
  select store_id from public.store_members where user_id = auth.uid();
$$;

-- stores
drop policy if exists "members read own store"   on public.stores;
drop policy if exists "members update own store" on public.stores;
drop policy if exists "any auth create store"    on public.stores;

create policy "members read own store" on public.stores
  for select using (id in (select public.current_user_stores()));
create policy "members update own store" on public.stores
  for update using (id in (select public.current_user_stores()));
create policy "any auth create store" on public.stores
  for insert with check (auth.role() = 'authenticated');

-- store_members
drop policy if exists "self membership read"   on public.store_members;
drop policy if exists "self membership insert" on public.store_members;

create policy "self membership read" on public.store_members
  for select using (user_id = auth.uid());
create policy "self membership insert" on public.store_members
  for insert with check (user_id = auth.uid());

-- customers
drop policy if exists "store-scoped customers" on public.customers;

create policy "store-scoped customers" on public.customers
  for all using (store_id in (select public.current_user_stores()))
  with check (store_id in (select public.current_user_stores()));

-- service_logs
drop policy if exists "store-scoped service_logs" on public.service_logs;

create policy "store-scoped service_logs" on public.service_logs
  for all using (
    customer_id in (
      select id from public.customers
      where store_id in (select public.current_user_stores())
    )
  );

-- notifications
drop policy if exists "store-scoped notifications" on public.notifications;

create policy "store-scoped notifications" on public.notifications
  for all using (store_id in (select public.current_user_stores()))
  with check (store_id in (select public.current_user_stores()));

-- reservations & payments
drop policy if exists "store-scoped reservations" on public.reservations;
drop policy if exists "store-scoped payments"     on public.payments;

create policy "store-scoped reservations" on public.reservations
  for all using (store_id in (select public.current_user_stores()))
  with check (store_id in (select public.current_user_stores()));

create policy "store-scoped payments" on public.payments
  for all using (store_id in (select public.current_user_stores()))
  with check (store_id in (select public.current_user_stores()));

-- Storage: 파일 경로 첫 세그먼트 = store_id 강제
drop policy if exists "store-scoped pet-photos upload" on storage.objects;
drop policy if exists "store-scoped pet-photos read"   on storage.objects;

create policy "store-scoped pet-photos upload" on storage.objects
  for insert with check (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1]::uuid in (select public.current_user_stores())
  );

create policy "store-scoped pet-photos read" on storage.objects
  for select using (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1]::uuid in (select public.current_user_stores())
  );
