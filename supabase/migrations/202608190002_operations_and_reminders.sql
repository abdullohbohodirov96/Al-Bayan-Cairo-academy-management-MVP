-- Al-Bayan Academy OS 0.2
-- Operational modules + SMS reminder queue. Safe to run after 202608190001_init.sql.

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  address text,
  timezone text not null default 'Africa/Cairo',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id) on delete cascade,
  name text not null,
  capacity integer not null default 20,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(branch_id,name)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  teacher_id uuid references public.teachers(id) on delete set null,
  room_id uuid references public.rooms(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'planned' check(status in ('planned','active','done','cancelled')),
  topic text,
  note text,
  created_at timestamptz not null default now(),
  check(ends_at > starts_at)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  source text,
  desired_level text,
  stage text not null default 'new' check(stage in ('new','contacted','trial','won','lost')),
  owner_id uuid references public.profiles(id) on delete set null,
  next_follow_up_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_contacts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  full_name text not null,
  relationship text,
  phone text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- Keep secrets OUT of this table. Credentials live in Edge Function secrets/env.
create table if not exists public.messaging_integrations (
  id uuid primary key default gen_random_uuid(),
  channel text not null default 'sms' check(channel in ('sms','email','telegram','whatsapp')),
  provider text not null default 'generic_webhook',
  sender_name text not null default 'ALBAYAN',
  is_enabled boolean not null default false,
  public_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(channel)
);

create table if not exists public.notification_templates (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  channel text not null default 'sms' check(channel in ('sms','email','telegram','whatsapp')),
  body text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reminder_rules (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  event_type text not null default 'payment_due' check(event_type in ('payment_due','lesson','attendance','lead_followup')),
  -- -3 = three days before due date, 0 = due date, +2 = two days overdue.
  days_from_event integer not null default 0,
  channel text not null default 'sms' check(channel in ('sms','email','telegram','whatsapp')),
  template_id uuid references public.notification_templates(id) on delete restrict,
  is_enabled boolean not null default true,
  send_local_time time not null default '10:00',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete cascade,
  rule_id uuid references public.reminder_rules(id) on delete set null,
  channel text not null default 'sms' check(channel in ('sms','email','telegram','whatsapp')),
  recipient text not null,
  template_code text,
  payload jsonb not null default '{}'::jsonb,
  scheduled_for timestamptz not null default now(),
  status text not null default 'queued' check(status in ('queued','processing','sent','delivered','failed','cancelled')),
  attempts integer not null default 0,
  provider_message_id text,
  last_error text,
  dedupe_key text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.notification_jobs(id) on delete set null,
  student_id uuid references public.students(id) on delete set null,
  channel text not null,
  recipient text,
  provider text,
  provider_message_id text,
  status text not null,
  response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.messaging_integrations(channel,provider,sender_name,is_enabled)
values('sms','generic_webhook','ALBAYAN',false)
on conflict(channel) do nothing;

insert into public.notification_templates(code,name,channel,body) values
('payment_before','Оплата скоро','sms','Ассаламу алайкум, {{name}}. Напоминаем: оплата {{amount}} сум за обучение в Аль-Баян до {{due_date}}. Благодарим вас.'),
('payment_due_today','Оплата сегодня','sms','Ассаламу алайкум, {{name}}. Сегодня срок оплаты за обучение: {{amount}} сум. Аль-Баян.'),
('payment_overdue','Просрочка оплаты','sms','Ассаламу алайкум, {{name}}. Оплата {{amount}} сум за обучение просрочена. Пожалуйста, свяжитесь с администрацией Аль-Баян.')
on conflict(code) do nothing;

insert into public.reminder_rules(code,name,event_type,days_from_event,channel,template_id,is_enabled,send_local_time)
select x.code,x.name,'payment_due',x.days,'sms',t.id,x.enabled,'10:00'::time
from (values
 ('payment_minus_3','За 3 дня до оплаты',-3,'payment_before',true),
 ('payment_due_day','В день оплаты',0,'payment_due_today',true),
 ('payment_plus_2','Через 2 дня просрочки',2,'payment_overdue',true),
 ('payment_plus_7','Через 7 дней просрочки',7,'payment_overdue',false)
) as x(code,name,days,template_code,enabled)
join public.notification_templates t on t.code=x.template_code
on conflict(code) do nothing;

-- Queue payment reminders idempotently. Run daily from Supabase Cron or another scheduler.
create or replace function public.enqueue_payment_reminders(reference_date date default current_date)
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  inserted_count integer := 0;
begin
  insert into public.notification_jobs(student_id,payment_id,rule_id,channel,recipient,template_code,payload,scheduled_for,dedupe_key)
  select
    s.id,
    p.id,
    r.id,
    r.channel,
    s.phone,
    t.code,
    jsonb_build_object(
      'name',s.full_name,
      'amount',greatest(p.amount-p.paid_amount,0),
      'due_date',p.due_date,
      'student_code',s.student_code
    ),
    (reference_date::timestamp + r.send_local_time) at time zone 'Africa/Cairo',
    concat('payment:',p.id,':rule:',r.id,':date:',reference_date)
  from public.payments p
  join public.students s on s.id=p.student_id
  join public.reminder_rules r on r.event_type='payment_due' and r.is_enabled and r.channel='sms'
  join public.notification_templates t on t.id=r.template_id and t.is_active
  where p.status in ('pending','overdue','partial')
    and coalesce(s.phone,'') <> ''
    and (reference_date - p.due_date) = r.days_from_event
  on conflict(dedupe_key) do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

-- Prefix-search-friendly indexes. For cross-script aliases keep transliteration in app/search service.
create index if not exists idx_students_full_name_prefix on public.students (lower(full_name) text_pattern_ops);
create index if not exists idx_students_code_prefix on public.students (lower(student_code) text_pattern_ops);
create index if not exists idx_teachers_full_name_prefix on public.teachers (lower(full_name) text_pattern_ops);
create index if not exists idx_groups_name_prefix on public.groups (lower(name) text_pattern_ops);
create index if not exists idx_leads_full_name_prefix on public.leads (lower(full_name) text_pattern_ops);
create index if not exists idx_lessons_starts_at on public.lessons(starts_at);
create index if not exists idx_leads_follow_up on public.leads(next_follow_up_at,stage);
create index if not exists idx_notification_jobs_queue on public.notification_jobs(status,scheduled_for);

alter table public.branches enable row level security;
alter table public.rooms enable row level security;
alter table public.lessons enable row level security;
alter table public.leads enable row level security;
alter table public.student_contacts enable row level security;
alter table public.messaging_integrations enable row level security;
alter table public.notification_templates enable row level security;
alter table public.reminder_rules enable row level security;
alter table public.notification_jobs enable row level security;
alter table public.notification_logs enable row level security;

create policy "staff read branches" on public.branches for select to authenticated using (is_staff());
create policy "managers manage branches" on public.branches for all to authenticated using (is_manager()) with check (is_manager());
create policy "staff read rooms" on public.rooms for select to authenticated using (is_staff());
create policy "managers manage rooms" on public.rooms for all to authenticated using (is_manager()) with check (is_manager());
create policy "staff read lessons" on public.lessons for select to authenticated using (is_staff());
create policy "staff manage lessons" on public.lessons for all to authenticated using (is_staff()) with check (is_staff());
create policy "staff read leads" on public.leads for select to authenticated using (is_staff());
create policy "managers manage leads" on public.leads for all to authenticated using (is_manager()) with check (is_manager());
create policy "staff read contacts" on public.student_contacts for select to authenticated using (is_staff());
create policy "managers manage contacts" on public.student_contacts for all to authenticated using (is_manager()) with check (is_manager());
create policy "managers read integrations" on public.messaging_integrations for select to authenticated using (is_manager());
create policy "managers manage integrations" on public.messaging_integrations for all to authenticated using (is_manager()) with check (is_manager());
create policy "staff read templates" on public.notification_templates for select to authenticated using (is_staff());
create policy "managers manage templates" on public.notification_templates for all to authenticated using (is_manager()) with check (is_manager());
create policy "staff read reminder rules" on public.reminder_rules for select to authenticated using (is_staff());
create policy "managers manage reminder rules" on public.reminder_rules for all to authenticated using (is_manager()) with check (is_manager());
create policy "staff read notification jobs" on public.notification_jobs for select to authenticated using (is_staff());
create policy "managers manage notification jobs" on public.notification_jobs for all to authenticated using (is_manager()) with check (is_manager());
create policy "staff read notification logs" on public.notification_logs for select to authenticated using (is_staff());
create policy "managers insert notification logs" on public.notification_logs for insert to authenticated with check (is_manager());

-- Basic overlap checks for room and teacher conflicts can be applied at API level first.
-- If scheduling becomes highly concurrent, add exclusion constraints using tstzrange + btree_gist.
