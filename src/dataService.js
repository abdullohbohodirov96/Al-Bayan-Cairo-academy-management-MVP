import { supabase, supabaseEnabled } from './supabaseClient.js';

// Branches are the first table wired to real data — small, no auth-gated
// joins, and both the group form and student form already read from it.
// Students/groups/attendance stay on demo data until Supabase Auth +
// per-role RLS testing is done (needs real staff accounts, not just a
// demo account-picker).

export async function fetchBranches() {
  if (!supabaseEnabled) return null; // caller keeps using seed data
  const { data, error } = await supabase.from('branches').select('id,name,city,address').order('created_at');
  if (error) { console.error('fetchBranches failed:', error.message); return null; }
  return data;
}

export async function upsertBranch(id, form) {
  if (!supabaseEnabled) return null;
  if (id) {
    const { data, error } = await supabase.from('branches').update(form).eq('id', id).select().single();
    if (error) { console.error('updateBranch failed:', error.message); return null; }
    return data;
  }
  const { data, error } = await supabase.from('branches').insert(form).select().single();
  if (error) { console.error('insertBranch failed:', error.message); return null; }
  return data;
}

export async function deleteBranchRemote(id) {
  if (!supabaseEnabled) return false;
  const { error } = await supabase.from('branches').delete().eq('id', id);
  if (error) { console.error('deleteBranch failed:', error.message); return false; }
  return true;
}

// --- Groups -----------------------------------------------------------
// The frontend works with plain names (level "A1", teacher "Ustoz Ahmad",
// branch "Cairo Main") while the DB uses foreign keys. These helpers
// translate between the two so the rest of the app never has to think
// about UUIDs.

const GROUP_SELECT = 'id, name, capacity, room, days, time_of_day, group_code, telegram_chat_id, level:levels(code), teacher:teachers(full_name), branch:branches(id,name)';

function rowToGroup(row) {
  return {
    id: row.id,
    name: row.name,
    level: row.level?.code || '',
    teacher: row.teacher?.full_name || '',
    branch: row.branch?.name || '',
    room: row.room || '',
    capacity: row.capacity || 16,
    days: row.days || [],
    time: row.time_of_day ? row.time_of_day.slice(0, 5) : '',
    groupCode: row.group_code || '',
    telegramChatId: row.telegram_chat_id || null,
    students: 0, // filled in from the students table separately
  };
}

export async function fetchGroups() {
  if (!supabaseEnabled) return null;
  const { data, error } = await supabase.from('groups').select(GROUP_SELECT).order('created_at');
  if (error) { console.error('fetchGroups failed:', error.message); return null; }
  return data.map(rowToGroup);
}

async function resolveId(table, column, value) {
  if (!value) return null;
  const { data } = await supabase.from(table).select('id').eq(column, value).maybeSingle();
  return data?.id || null;
}

export async function upsertGroup(id, form) {
  if (!supabaseEnabled) return null;
  const [level_id, teacher_id, branchRow] = await Promise.all([
    resolveId('levels', 'code', form.level),
    resolveId('teachers', 'full_name', form.teacher),
    form.branch ? supabase.from('branches').select('id').eq('name', form.branch).maybeSingle().then(r => r.data) : null,
  ]);
  const payload = {
    name: form.name,
    level_id,
    teacher_id,
    branch_id: branchRow?.id || null,
    room: form.room || null,
    capacity: Number(form.capacity) || 16,
    days: form.days || [],
    time_of_day: form.time || null,
    group_code: form.groupCode || form.group_code || null,
    schedule_text: (form.days || []).join('/') + (form.time ? ' · ' + form.time : ''),
  };
  if (id) {
    const { data, error } = await supabase.from('groups').update(payload).eq('id', id).select(GROUP_SELECT).single();
    if (error) { console.error('updateGroup failed:', error.message); return null; }
    return rowToGroup(data);
  }
  const { data, error } = await supabase.from('groups').insert(payload).select(GROUP_SELECT).single();
  if (error) { console.error('insertGroup failed:', error.message); return null; }
  return rowToGroup(data);
}
