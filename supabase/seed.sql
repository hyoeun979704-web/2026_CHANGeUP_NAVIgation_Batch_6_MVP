-- PetNoti Demo Seed Data
-- Run AFTER schema.sql
-- Replace store_id and user_id with actual values from your Supabase project

-- Step 1: Create a demo store (or use the one created via onboarding)
insert into public.stores (id, name, store_type, phone, monthly_ai_quota)
values (
  '00000000-0000-0000-0000-000000000001',
  '행복한 펫 미용실',
  'grooming',
  '041-000-0000',
  50
) on conflict (id) do nothing;

-- Step 2: Link your user to the store
-- Replace 'YOUR_USER_ID' with the UUID from auth.users
-- insert into public.store_members (store_id, user_id, role)
-- values ('00000000-0000-0000-0000-000000000001', 'YOUR_USER_ID', 'owner')
-- on conflict do nothing;

-- Step 3: Demo customers
insert into public.customers (id, store_id, owner_name, owner_phone, pet_name, breed, pet_birthday, pet_weight_kg, neutered, allergies, medical_notes, special_notes)
values
  (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    '김보호',
    '010-1111-2222',
    '뽀미',
    '말티즈',
    '2021-05-15',
    3.2,
    true,
    '닭고기, 밀',
    '슬개골 2기',
    '낯선 사람 경계심 있음'
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000001',
    '이사랑',
    '010-3333-4444',
    '초코',
    '미니어처 푸들',
    '2019-03-01',
    5.5,
    true,
    null,
    null,
    '귀 청소할 때 발버둥 심함'
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000001',
    '박행복',
    '010-5555-6666',
    '콩이',
    '시츄',
    '2022-08-20',
    4.1,
    false,
    '특정 샴푸 향료 성분',
    '건성 피부, 주기적 보습 필요',
    null
  )
on conflict (id) do nothing;

-- Step 4: Demo service logs
insert into public.service_logs (customer_id, service_date, services, notes)
values
  (
    '00000000-0000-0000-0000-000000000010',
    current_date - interval '30 days',
    array['목욕', '부분미용', '발톱정리'],
    '털 엉킴 심해서 빗질 추가'
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    current_date - interval '15 days',
    array['목욕', '전체미용'],
    '귀 염증 없음, 상태 양호'
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    current_date - interval '7 days',
    array['목욕', '보습 트리트먼트'],
    '알러지 안전 제품 사용, 피부 상태 개선 중'
  )
on conflict do nothing;
