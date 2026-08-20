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

export async function deleteBranchRemote(id) {  if (!supabaseEnabled) return false;
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

export async function upsertGroup(id, form) {  if (!supabaseEnabled) return null;
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

// --- Teachers -----------------------------------------------------------

export async function fetchTeachers() {
  if (!supabaseEnabled) return null;
  const { data, error } = await supabase.from('teachers').select('id, full_name, phone, specialization').order('created_at');
  if (error) { console.error('fetchTeachers failed:', error.message); return null; }
  return data.map(t => ({ id: t.id, name: t.full_name, phone: t.phone || '', speciality: t.specialization || '', groups: 0, students: 0, load: 0, status: 'offline' }));
}

export async function upsertTeacher(id, form) {
  if (!supabaseEnabled) return null;
  const payload = { full_name: form.name, phone: form.phone || null, specialization: form.speciality || null };
  if (id) {
    const { data, error } = await supabase.from('teachers').update(payload).eq('id', id).select().single();
    if (error) { console.error('updateTeacher failed:', error.message); return null; }
    return data;
  }
  const { data, error } = await supabase.from('teachers').insert(payload).select().single();
  if (error) { console.error('insertTeacher failed:', error.message); return null; }
  return data;
}

export async function deleteTeacherRemote(id) {
  if (!supabaseEnabled) return false;
  const { error } = await supabase.from('teachers').delete().eq('id', id);
  if (error) { console.error('deleteTeacher failed:', error.message); return false; }
  return true;
}

// --- Leads ----------------------------------------------------------------

function rowToLead(row) {
  return {
    id: row.id,
    name: row.full_name,
    phone: row.phone || '',
    source: row.source || '',
    level: row.desired_level || '',
    stage: row.stage || 'new',
    next: row.next_follow_up_at ? row.next_follow_up_at.slice(0, 10) : '',
    owner: row.owner?.full_name || '',
  };
}

export async function fetchLeads() {
  if (!supabaseEnabled) return null;
  const { data, error } = await supabase.from('leads').select('id, full_name, phone, source, desired_level, stage, next_follow_up_at, owner:profiles(full_name)').order('created_at', { ascending: false });
  if (error) { console.error('fetchLeads failed:', error.message); return null; }
  return data.map(rowToLead);
}

export async function insertLead(form) {
  if (!supabaseEnabled) return null;
  const payload = {
    full_name: form.name,
    phone: form.phone || null,
    source: form.source || null,
    desired_level: form.level || null,
    stage: 'new',
    next_follow_up_at: form.next || null,
    owner_id: form.ownerId || null,
  };
  const { data, error } = await supabase.from('leads').insert(payload).select('id, full_name, phone, source, desired_level, stage, next_follow_up_at, owner:profiles(full_name)').single();
  if (error) { console.error('insertLead failed:', error.message); return null; }
  return rowToLead(data);
}

export async function updateLeadStage(id, stage) {
  if (!supabaseEnabled) return false;
  const { error } = await supabase.from('leads').update({ stage }).eq('id', id);
  if (error) { console.error('updateLeadStage failed:', error.message); return false; }
  return true;
}

// --- Telegram broadcast -----------------------------------------------
// Calls the telegram-send Edge Function (service-role only — the bot token
// never reaches the browser). Only works for groups that already have a
// telegram_chat_id (i.e. the bot has been added to that Telegram group and
// matched it via group_code).

export async function sendTelegramMessage(groupId, message) {
  if (!supabaseEnabled) return { ok: false, error: 'Supabase ulanmagan' };
  const { data, error } = await supabase.functions.invoke('telegram-send', {
    body: { group_id: groupId, message },
  });
  if (error) return { ok: false, error: error.message || 'Xabar yuborishda xatolik' };
  if (data && data.ok === false) return { ok: false, error: data.error || 'Xabar yuborishda xatolik' };
  return { ok: true, sentTo: data?.sent_to };
}
