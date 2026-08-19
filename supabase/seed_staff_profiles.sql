-- Run this in Supabase SQL Editor AFTER creating the 3 users below via
-- Authentication → Users → Add user (with "Auto Confirm User" turned ON).
--
-- ceo@albayan.uz      / Albayan2026!
-- admin@albayan.uz    / Albayan2026!
-- ustoz@albayan.uz    / Albayan2026!
--
-- This matches each auth user by email and creates/updates their profile
-- row with the right role. It's safe to re-run.

insert into public.profiles (id, full_name, phone, role, is_active)
select id, 'Абдуллох Бохадиров', null, 'ceo', true
from auth.users where email = 'ceo@albayan.uz'
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, is_active = true;

insert into public.profiles (id, full_name, phone, role, is_active)
select id, 'Зилола Рахимова', null, 'admin', true
from auth.users where email = 'admin@albayan.uz'
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, is_active = true;

insert into public.profiles (id, full_name, phone, role, is_active)
select id, 'Ustoz Ahmad', null, 'teacher', true
from auth.users where email = 'ustoz@albayan.uz'
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, is_active = true;

-- Check it worked:
select p.full_name, p.role, u.email from public.profiles p join auth.users u on u.id = p.id;
