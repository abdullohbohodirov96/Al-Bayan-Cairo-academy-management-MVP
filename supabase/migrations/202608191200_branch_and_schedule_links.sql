-- Al-Bayan Academy OS 0.3
-- Aligns groups/students with branches, and adds structured weekday
-- scheduling (used by the group day-picker in the frontend) alongside the
-- existing free-text schedule_text. Safe to run after 202608190002.

alter table public.groups
  add column if not exists branch_id uuid references public.branches(id) on delete set null,
  add column if not exists days text[] not null default '{}',
  add column if not exists time_of_day time;

alter table public.students
  add column if not exists branch_id uuid references public.branches(id) on delete set null;

comment on column public.groups.days is
  'Short weekday codes: mon,tue,wed,thu,fri,sat,sun — drives the frontend day-picker.';
