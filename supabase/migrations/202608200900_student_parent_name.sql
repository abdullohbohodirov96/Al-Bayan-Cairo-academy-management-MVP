-- Al-Bayan Academy OS 0.5
-- Adds a simple parent/contact name field directly on students (the fuller
-- student_contacts table exists for multiple contacts, but the frontend's
-- "Родитель" field is a single quick text field at enrollment time).

alter table public.students
  add column if not exists parent_name text;
