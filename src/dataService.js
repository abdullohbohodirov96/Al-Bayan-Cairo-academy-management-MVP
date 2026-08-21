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

// --- Staff accounts (CEO only) ------------------------------------------
// All calls go through the manage-staff Edge Function, which checks the
// caller is a CEO and does the actual Auth admin work with the service-role
// key — the browser never sees that key.

async function callManageStaff(payload) {
  if (!supabaseEnabled) return { ok: false, error: 'Supabase ulanmagan' };
  const { data, error } = await supabase.functions.invoke('manage-staff', { body: payload });
  if (error) return { ok: false, error: error.message || 'Server xatosi' };
  return data;
}

export const listStaff = () => callManageStaff({ action: 'list' });
export const createStaff = (fields) => callManageStaff({ action: 'create', ...fields });
export const updateStaffProfile = (user_id, fields) => callManageStaff({ action: 'update_profile', user_id, ...fields });
export const resetStaffPassword = (user_id, password) => callManageStaff({ action: 'reset_password', user_id, password });
export const setStaffActive = (user_id, is_active) => callManageStaff({ action: 'set_active', user_id, is_active });
export const deleteStaff = (user_id) => callManageStaff({ action: 'delete', user_id });

// --- Students, payments, attendance ---------------------------------------
// The `id` the rest of the frontend uses everywhere (search, table rows,
// URLs-in-spirit) is the human-readable student_code (e.g. "AB-1042"), not
// the internal UUID — student_code is unique in the DB too, so every
// read/write below filters by it directly and never exposes the UUID in
// the UI. We still keep the UUID on each object as `_uuid` for the rare
// internal calls (attendance, payments) that need a real foreign key.

const STUDENT_SELECT = 'id, student_code, full_name, phone, parent_name, monthly_fee, status, current_level_id, level:levels(code), group:groups(id,name,teacher:teachers(full_name)), branch:branches(name)';

function rowToStudent(row, payment, lessonsUsed, attendancePct) {
  return {
    id: row.student_code,
    _uuid: row.id,
    _groupId: row.group?.id || null,
    name: row.full_name,
    phone: row.phone || '',
    parent: row.parent_name || '',
    level: row.level?.code || '',
    group: row.group?.name || '',
    teacher: row.group?.teacher?.full_name || '',
    branch: row.branch?.name || '',
    fee: Number(row.monthly_fee) || 0,
    paid: payment?.status === 'paid',
    paidAmount: Number(payment?.paid_amount) || 0,
    due: payment?.due_date || null,
    paidAt: payment?.paid_at ? payment.paid_at.slice(0, 10) : null,
    attendance: attendancePct,
    lessonsUsed,
    avatar: undefined, // computed client-side from name, same as before
  };
}

export async function fetchStudents() {
  if (!supabaseEnabled) return null;

  const { data: students, error } = await supabase.from('students').select(STUDENT_SELECT).order('created_at');
  if (error) { console.error('fetchStudents failed:', error.message); return null; }

  const { data: payments } = await supabase
    .from('payments')
    .select('student_id, status, paid_amount, due_date, paid_at, billing_month')
    .order('due_date', { ascending: false });
  const latestPaymentByStudent = new Map();
  for (const p of payments || []) {
    if (!latestPaymentByStudent.has(p.student_id)) latestPaymentByStudent.set(p.student_id, p);
  }

  const { data: attendanceRows } = await supabase.from('attendance').select('student_id, lesson_date, status');

  return students.map(row => {
    const payment = latestPaymentByStudent.get(row.id);
    const sinceDate = payment?.paid_at ? payment.paid_at.slice(0, 10) : '2000-01-01';
    const mine = (attendanceRows || []).filter(a => a.student_id === row.id);
    const lessonsUsed = mine.filter(a => (a.status === 'present' || a.status === 'late') && a.lesson_date > sinceDate).length;
    const attended = mine.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendancePct = mine.length ? Math.round((attended / mine.length) * 100) : 100;
    return rowToStudent(row, payment, lessonsUsed, attendancePct);
  });
}

async function resolveGroupIdByName(name) {
  if (!name) return null;
  const { data } = await supabase.from('groups').select('id').eq('name', name).maybeSingle();
  return data?.id || null;
}
async function resolveBranchIdByName(name) {
  if (!name) return null;
  const { data } = await supabase.from('branches').select('id').eq('name', name).maybeSingle();
  return data?.id || null;
}

export async function insertStudent(code, form) {
  if (!supabaseEnabled) return null;
  const [level_id, current_group_id, branch_id] = await Promise.all([
    resolveId('levels', 'code', form.level),
    resolveGroupIdByName(form.group),
    resolveBranchIdByName(form.branch),
  ]);
  const payload = {
    student_code: code,
    full_name: form.name,
    phone: form.phone || null,
    parent_name: form.parent || null,
    current_level_id: level_id,
    current_group_id,
    branch_id,
    monthly_fee: Number(form.fee) || 0,
    status: 'active',
  };
  const { data, error } = await supabase.from('students').insert(payload).select(STUDENT_SELECT).single();
  if (error) { console.error('insertStudent failed:', error.message); return null; }

  if (form.due) {
    const { error: payError } = await supabase.from('payments').insert({
      student_id: data.id,
      billing_month: form.due.slice(0, 7) + '-01',
      due_date: form.due,
      amount: Number(form.fee) || 0,
      paid_amount: 0,
      status: 'pending',
    });
    if (payError) console.error('initial payment row failed:', payError.message);
  }
  return rowToStudent(data, null, 0, 100);
}

export async function updateStudentRemote(code, form) {
  if (!supabaseEnabled) return false;
  const updates = {};
  if (form.name !== undefined) updates.full_name = form.name;
  if (form.phone !== undefined) updates.phone = form.phone;
  if (form.parent !== undefined) updates.parent_name = form.parent;
  if (form.fee !== undefined) updates.monthly_fee = Number(form.fee);
  if (form.level !== undefined) updates.current_level_id = await resolveId('levels', 'code', form.level);
  if (form.group !== undefined) updates.current_group_id = await resolveGroupIdByName(form.group);
  if (form.branch !== undefined) updates.branch_id = await resolveBranchIdByName(form.branch);

  const { error } = await supabase.from('students').update(updates).eq('student_code', code);
  if (error) { console.error('updateStudent failed:', error.message); return false; }
  return true;
}

export async function deleteStudentRemote(code) {
  if (!supabaseEnabled) return false;
  const { error } = await supabase.from('students').delete().eq('student_code', code);
  if (error) { console.error('deleteStudent failed:', error.message); return false; }
  return true;
}

export async function recordPaymentRemote(studentUuid, paidDate, amount) {
  if (!supabaseEnabled || !studentUuid) return false;
  const dueDate = addMonthsIso(paidDate, 1);
  const { error } = await supabase.from('payments').upsert({
    student_id: studentUuid,
    billing_month: paidDate.slice(0, 7) + '-01',
    due_date: dueDate,
    amount,
    paid_amount: amount,
    status: 'paid',
    paid_at: paidDate,
  }, { onConflict: 'student_id,billing_month' });
  if (error) { console.error('recordPayment failed:', error.message); return false; }
  return true;
}

function addMonthsIso(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}

export async function markAttendanceRemote(rows) {
  // rows: [{ student_id, group_id, lesson_date, status, marked_by }]
  if (!supabaseEnabled || !rows.length) return false;
  const { error } = await supabase.from('attendance').upsert(rows, { onConflict: 'student_id,lesson_date,group_id' });
  if (error) { console.error('markAttendance failed:', error.message); return false; }
  return true;
}
