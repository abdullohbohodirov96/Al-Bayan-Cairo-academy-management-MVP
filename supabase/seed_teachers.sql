-- Run once in SQL Editor. Populates public.teachers to match the names
-- already used across the frontend demo data, so groups.teacher_id can
-- resolve correctly when groups are saved for real.
-- Safe to re-run (matches by full_name).

insert into public.teachers (full_name, phone, specialization)
select v.full_name, v.phone, v.specialization
from (values
  ('Ustoz Ahmad', '+998 90 111 22 33', 'Nahv · Sarf · Speaking'),
  ('Ustoz Yusuf', '+998 91 444 55 66', 'A1–B1 · Quranic Arabic'),
  ('Ustoz Hamza', '+998 93 777 88 99', 'A1–A2 · Foundation'),
  ('Ustoz Salim', '+998 95 333 44 55', 'Intensive · Conversation')
) as v(full_name, phone, specialization)
where not exists (select 1 from public.teachers t where t.full_name = v.full_name);
