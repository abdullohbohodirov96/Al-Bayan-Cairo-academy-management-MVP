create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('ceo','admin','teacher','student');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.student_status as enum ('active','paused','graduated','left');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending','paid','overdue','cancelled','partial');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role public.app_role not null default 'teacher',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  order_index integer not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  full_name text not null,
  phone text,
  specialization text,
  created_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level_id uuid references public.levels(id) on delete set null,
  teacher_id uuid references public.teachers(id) on delete set null,
  capacity integer not null default 20,
  schedule_text text,
  room text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  student_code text unique not null,
  full_name text not null,
  phone text,
  email text,
  birth_date date,
  enrollment_date date not null default current_date,
  status public.student_status not null default 'active',
  current_level_id uuid references public.levels(id) on delete set null,
  current_group_id uuid references public.groups(id) on delete set null,
  monthly_fee numeric(12,2) not null default 0,
  notes text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  level_id uuid references public.levels(id) on delete set null,
  group_id uuid references public.groups(id) on delete set null,
  started_at date not null default current_date,
  ended_at date,
  monthly_fee numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  billing_month date not null,
  due_date date not null,
  amount numeric(12,2) not null,
  paid_amount numeric(12,2) not null default 0,
  status public.payment_status not null default 'pending',
  paid_at timestamptz,
  method text,
  receipt_no text unique,
  note text,
  created_at timestamptz not null default now(),
  unique(student_id, billing_month)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  group_id uuid references public.groups(id) on delete set null,
  lesson_date date not null,
  status text not null check (status in ('present','absent','late','excused')),
  note text,
  marked_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(student_id, lesson_date, group_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.levels(code,name,order_index) values
('A1','Beginner',1),('A2','Elementary',2),('B1','Intermediate',3),('B2','Upper Intermediate',4),('C1','Advanced',5),('C2','Mastery',6)
on conflict(code) do nothing;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('ceo','admin','teacher') and p.is_active)
$$;

create or replace function public.is_manager()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('ceo','admin') and p.is_active)
$$;

alter table public.profiles enable row level security;
alter table public.levels enable row level security;
alter table public.teachers enable row level security;
alter table public.groups enable row level security;
alter table public.students enable row level security;
alter table public.enrollments enable row level security;
alter table public.payments enable row level security;
alter table public.attendance enable row level security;
alter table public.audit_logs enable row level security;

create policy "staff read profiles" on public.profiles for select to authenticated using (is_staff() or id = auth.uid());
create policy "managers manage profiles" on public.profiles for all to authenticated using (is_manager()) with check (is_manager());
create policy "staff read levels" on public.levels for select to authenticated using (is_staff());
create policy "managers manage levels" on public.levels for all to authenticated using (is_manager()) with check (is_manager());
create policy "staff read teachers" on public.teachers for select to authenticated using (is_staff());
create policy "managers manage teachers" on public.teachers for all to authenticated using (is_manager()) with check (is_manager());
create policy "staff read groups" on public.groups for select to authenticated using (is_staff());
create policy "managers manage groups" on public.groups for all to authenticated using (is_manager()) with check (is_manager());
create policy "staff read students" on public.students for select to authenticated using (is_staff());
create policy "managers manage students" on public.students for all to authenticated using (is_manager()) with check (is_manager());
create policy "staff read enrollments" on public.enrollments for select to authenticated using (is_staff());
create policy "managers manage enrollments" on public.enrollments for all to authenticated using (is_manager()) with check (is_manager());
create policy "staff read payments" on public.payments for select to authenticated using (is_staff());
create policy "managers manage payments" on public.payments for all to authenticated using (is_manager()) with check (is_manager());
create policy "staff read attendance" on public.attendance for select to authenticated using (is_staff());
create policy "staff mark attendance" on public.attendance for insert to authenticated with check (is_staff());
create policy "staff update attendance" on public.attendance for update to authenticated using (is_staff()) with check (is_staff());
create policy "managers read audit" on public.audit_logs for select to authenticated using (is_manager());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, role) values (new.id, coalesce(new.raw_user_meta_data->>'full_name','New User'), 'teacher') on conflict(id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create index if not exists idx_students_status on public.students(status);
create index if not exists idx_students_group on public.students(current_group_id);
create index if not exists idx_payments_due on public.payments(due_date,status);
create index if not exists idx_attendance_date on public.attendance(lesson_date);
