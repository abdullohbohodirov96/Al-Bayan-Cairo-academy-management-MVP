-- Al-Bayan Academy OS 0.4
-- Adds a short human-readable group code (e.g. S22-22) that staff can put in
-- the Telegram group's title, and the chat id the bot resolves it to once
-- it's added there. Safe to run after 202608191200.

alter table public.groups
  add column if not exists group_code text,
  add column if not exists telegram_chat_id text;

create unique index if not exists groups_group_code_key on public.groups (group_code) where group_code is not null;
create unique index if not exists groups_telegram_chat_id_key on public.groups (telegram_chat_id) where telegram_chat_id is not null;

comment on column public.groups.group_code is
  'Short code staff put in the Telegram group title (e.g. S22-22) so the bot can auto-match it to this group.';
comment on column public.groups.telegram_chat_id is
  'Set automatically by the Telegram bot once it is added to the matching group and reads group_code from the chat title.';
