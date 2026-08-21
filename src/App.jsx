import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { tr } from './i18n.js';

import { Sidebar } from './components/Sidebar.jsx';
import { Topbar } from './components/Topbar.jsx';
import { MobileNav } from './components/MobileNav.jsx';
import { Modal } from './components/UI.jsx';
import { AddStudentForm } from './components/AddStudentForm.jsx';
import { StudentDrawer } from './components/StudentDrawer.jsx';

import { Login } from './pages/Login.jsx';
import { Overview } from './pages/Overview.jsx';
import { Students } from './pages/Students.jsx';
import { Payments } from './pages/Payments.jsx';
import { Groups, Teachers } from './pages/Groups.jsx';
import { Attendance } from './pages/Attendance.jsx';
import { Schedule } from './pages/Schedule.jsx';
import { Leads } from './pages/Leads.jsx';
import { Reminders } from './pages/Reminders.jsx';
import { Analytics } from './pages/Analytics.jsx';
import { SettingsPage } from './pages/Settings.jsx';
import { Staff } from './pages/Staff.jsx';

import { seedStudents, seedTeachers, seedGroups, seedLessons, seedLeads, seedBranches, reminderRules as seedRules } from './data.js';
import { isPrefixMatch } from './search.js';
import { initials, todayISO, addMonths } from './utils.js';
import { rolePages, roleCanEdit, defaultPageFor } from './roles.js';
import { supabase, supabaseEnabled } from './supabaseClient.js';
import { fetchBranches, upsertBranch, deleteBranchRemote, fetchGroups, upsertGroup, fetchTeachers, upsertTeacher, deleteTeacherRemote, fetchLeads, insertLead } from './dataService.js';

const roleLabels = { ceo: 'CEO', admin: 'Админ', teacher: 'Ustoz' };

export default function App() {
  const [account, setAccount] = useState(null);
  const [authChecked, setAuthChecked] = useState(!supabaseEnabled);
  const [page, setPage] = useState('overview');
  const [locale, setLocale] = useState('uz');
  const [railMode, setRailMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState(seedStudents);
  const [groups, setGroups] = useState(seedGroups);
  const [branches, setBranches] = useState(seedBranches);
  const [teachers, setTeachers] = useState(seedTeachers);
  const [leads, setLeads] = useState(seedLeads);
  const [rules, setRules] = useState(seedRules);
  const [messageLog, setMessageLog] = useState([
    { id: 'M-001', student: 'Maryam Abdullayeva', phone: '+998 91 222 31 44', type: 'Просрочка оплаты', status: 'delivered', at: '2026-08-19 09:03' },
    { id: 'M-002', student: 'Abdulloh Abdurazzaq', phone: '+998 95 701 30 76', type: 'Оплата сегодня', status: 'queued', at: '2026-08-19 10:15' },
  ]);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [prefillGroup, setPrefillGroup] = useState(null);
  const [payModalStudent, setPayModalStudent] = useState(null);
  const [assignModalGroup, setAssignModalGroup] = useState(null);
  const [toast, setToast] = useState('');

  // Real Supabase Auth session — replaces the demo account-picker whenever
  // env vars are configured. We fetch the matching `profiles` row to learn
  // the person's role, since that (not the auth user) drives what they see.
  useEffect(() => {
    if (!supabaseEnabled) return;

    // Supabase's client can re-fire a 'SIGNED_IN' event on background token
    // refreshes AND on tab-focus/visibility changes — not just on an actual
    // login. Relying on the event name alone was still resetting people
    // back to Overview mid-work. Instead we track which user id we've
    // already loaded and only treat it as a fresh sign-in when that
    // actually changes (null -> someone, or person A -> person B).
    let loadedUserId = null;

    async function loadProfile(user) {
      if (!user) { loadedUserId = null; setAccount(null); setAuthChecked(true); return; }

      const isFreshSignIn = loadedUserId !== user.id;
      if (!isFreshSignIn) return; // same person, nothing changed — ignore the event entirely

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role, avatar_url, is_active')
        .eq('id', user.id)
        .single();
      if (error || !profile || !profile.is_active) {
        setToast(error ? 'Профиль топилмади — админга мурожаат қилинг' : '');
        setAccount(null);
        setAuthChecked(true);
        return;
      }

      loadedUserId = user.id;
      setAccount({
        id: profile.id,
        role: profile.role,
        roleLabel: roleLabels[profile.role] || profile.role,
        name: profile.full_name,
        title: roleLabels[profile.role] || profile.role,
        avatar: profile.avatar_url || initials(profile.full_name),
      });
      setAuthChecked(true);
      setPage(defaultPageFor(profile.role));
      const remoteBranches = await fetchBranches();
      if (remoteBranches) setBranches(remoteBranches);
      const remoteTeachers = await fetchTeachers();
      if (remoteTeachers && remoteTeachers.length) setTeachers(remoteTeachers);
      const remoteGroups = await fetchGroups();
      if (remoteGroups && remoteGroups.length) setGroups(remoteGroups);
      const remoteLeads = await fetchLeads();
      if (remoteLeads) setLeads(remoteLeads);
    }

    supabase.auth.getSession().then(({ data }) => loadProfile(data.session?.user));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') { loadedUserId = null; setAccount(null); setAuthChecked(true); return; }
      loadProfile(session?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredStudents = useMemo(() => students.filter(s => isPrefixMatch(s, query)), [students, query]);

  const stats = useMemo(() => {
    const paid = students.filter(x => x.paid).length;
    const overdue = students.filter(x => !x.paid).length;
    const revenue = students.reduce((a, x) => a + (x.paidAmount || 0), 0);
    const due = students.reduce((a, x) => a + Math.max(0, x.fee - (x.paidAmount || 0)), 0);
    const attendance = Math.round(students.reduce((a, x) => a + x.attendance, 0) / students.length);
    return { total: students.length, paid, overdue, revenue, due, attendance };
  }, [students]);

  function addStudent(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get('name') || '').trim();
    const s = {
      id: 'AB-' + String(1100 + students.length), name,
      phone: f.get('phone') || '', parent: f.get('parent') || '', level: f.get('level'),
      month: 1, start: todayISO(), fee: Number(f.get('fee')), paid: false, paidAmount: 0,
      due: f.get('due'), teacher: f.get('teacher'), group: f.get('group'), attendance: 100,
      status: 'active', avatar: initials(name), branch: f.get('branch'),
    };
    setStudents(v => [s, ...v]);
    setModal(null);
    setPrefillGroup(null);
    setToast('Карточка ученика создана');
  }

  function addStudentToGroup(group) {
    setPrefillGroup({ group: group.name, teacher: group.teacher, branch: group.branch, level: group.level });
    setModal('add');
  }

  function assignStudentToGroup(group) {
    setAssignModalGroup(group);
  }

  function confirmAssign(studentId, group) {
    updateStudent(studentId, { group: group.name, teacher: group.teacher, branch: group.branch, level: group.level });
    setAssignModalGroup(null);
  }

  function updateStudent(id, form) {
    setStudents(v => v.map(s => s.id === id ? { ...s, ...form, fee: form.fee !== undefined ? Number(form.fee) : s.fee } : s));
    setToast('Ўзгаришлар сақланди');
  }

  function deleteStudent(id) {
    setStudents(v => v.filter(s => s.id !== id));
    setToast('Ўчирилди');
  }

  function togglePay(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;
    if (student.paid) {
      // Un-marking a payment is a plain revert, no date needed.
      setStudents(v => v.map(s => s.id === id ? { ...s, paid: false, paidAmount: 0, status: 'overdue' } : s));
      setToast('Статус оплаты обновлён');
      return;
    }
    setPayModalStudent(student);
  }

  function confirmPayment(id, paidDate) {
    setStudents(v => v.map(s => s.id === id
      ? { ...s, paid: true, paidAmount: s.fee, status: 'active', paidAt: paidDate, due: addMonths(paidDate, 1), lessonsUsed: 0 }
      : s));
    setPayModalStudent(null);
    setToast('Тўлов қайд этилди, кейинги тўлов санаси автоматик ҳисобланди');
  }

  function sendReminder(student, type = 'Ручное напоминание') {
    setMessageLog(v => [{
      id: 'M-' + String(v.length + 3).padStart(3, '0'),
      student: student.name, phone: student.phone, type, status: 'queued',
      at: new Date().toLocaleString('ru-RU'),
    }, ...v]);
    setToast('SMS добавлено в очередь. Провайдер подключается отдельно.');
  }

  async function saveBranch(id, form) {
    if (id) {
      setBranches(v => v.map(b => b.id === id ? { ...b, ...form } : b));
      if (supabaseEnabled) await upsertBranch(id, form);
    } else {
      const tempId = 'BR-' + Date.now().toString(36);
      setBranches(v => [...v, { id: tempId, ...form }]);
      if (supabaseEnabled) {
        const saved = await upsertBranch(null, form);
        if (saved) setBranches(v => v.map(b => b.id === tempId ? { id: saved.id, ...form } : b));
      }
    }
    setToast('Филиал сохранён');
  }

  async function deleteBranch(id) {
    setBranches(v => v.filter(b => b.id !== id));
    setToast('Филиал удалён');
    if (supabaseEnabled) await deleteBranchRemote(id);
  }

  async function saveGroup(id, form) {
    const capacity = Number(form.capacity) || 16;
    if (id) {
      setGroups(v => v.map(g => g.id === id ? { ...g, ...form, capacity } : g));
    } else {
      setGroups(v => [...v, {
        id: 'G-' + String(v.length + 1).padStart(2, '0') + '-' + Date.now().toString(36),
        ...form, capacity, students: 0,
      }]);
    }
    setToast('Группа сохранена');
    if (supabaseEnabled) {
      const saved = await upsertGroup(id, form);
      if (saved) setGroups(v => v.map(g => (g.id === id || g.name === form.name) ? saved : g));
    }
  }

  async function saveTeacher(id, form) {
    if (id) {
      setTeachers(v => v.map(t => t.id === id ? { ...t, ...form } : t));
    } else {
      const tempId = 'T-' + Date.now().toString(36);
      setTeachers(v => [...v, { id: tempId, ...form, groups: 0, students: 0, load: 0, status: 'offline' }]);
    }
    setToast('Преподаватель сохранён');
    if (supabaseEnabled) {
      const saved = await upsertTeacher(id, form);
      if (saved) setTeachers(v => v.map(t => (t.id === id || t.name === form.name) ? { ...t, id: saved.id, name: saved.full_name, phone: saved.phone || '', speciality: saved.specialization || '' } : t));
    }
  }

  async function deleteTeacher(id) {
    setTeachers(v => v.filter(t => t.id !== id));
    setToast('Преподаватель ўчирилди');
    if (supabaseEnabled) await deleteTeacherRemote(id);
  }

  async function refreshTeachers() {
    if (!supabaseEnabled) return;
    const remoteTeachers = await fetchTeachers();
    if (remoteTeachers) setTeachers(remoteTeachers);
  }

  async function addLead(form) {
    const tempId = 'L-' + Date.now().toString(36);
    setLeads(v => [{ id: tempId, ...form, stage: 'new' }, ...v]);
    setToast('Лид қўшилди');
    if (supabaseEnabled) {
      const saved = await insertLead({ ...form, ownerId: account?.id });
      if (saved) setLeads(v => v.map(l => l.id === tempId ? saved : l));
    }
  }

  function saveAttendance(group, marked) {
    setStudents(v => v.map(s => {
      const mark = marked[s.id];
      if (!mark || s.group !== group?.name) return s;
      const bump = mark === 'present' ? 1 : mark === 'late' ? 0 : -2;
      // Present/late count as an attended lesson against the monthly 12,
      // shown as "N dars qoldi" until the next payment resets it.
      const lessonsUsed = (mark === 'present' || mark === 'late') ? (s.lessonsUsed || 0) + 1 : (s.lessonsUsed || 0);
      return { ...s, attendance: Math.max(0, Math.min(100, s.attendance + bump)), lessonsUsed };
    }));
    setToast('Посещаемость сохранена');
    setPage('overview');
  }

  function openRecord(item) {
    setQuery('');
    if (item.type === 'student') { setPage('students'); setSelected(item); }
    if (item.type === 'teacher') setPage('teachers');
    if (item.type === 'group') setPage('groups');
    if (item.type === 'lead') setPage('leads');
    setMobileOpen(false);
  }

  function handleLogin(picked) {
    setAccount(picked);
    setPage(defaultPageFor(picked.role));
    setToast(`Хуш келибсиз, ${picked.name}`);
  }

  function handleLogout() {
    if (supabaseEnabled) supabase.auth.signOut();
    setAccount(null);
    setSelected(null);
    setModal(null);
    setQuery('');
  }

  if (!authChecked) {
    return null; // brief flash while we check for an existing Supabase session
  }

  if (!account) {
    return <Login onLogin={handleLogin} locale={locale} setLocale={setLocale} />;
  }

  const allowedPages = rolePages[account.role] || rolePages.teacher;
  const canManage = roleCanEdit[account.role];
  // A teacher only works with their own groups' students — everyone else sees the full center.
  const scopedStudents = account.role === 'teacher'
    ? students.filter(s => s.teacher === account.name)
    : students;
  const scopedFiltered = scopedStudents.filter(s => isPrefixMatch(s, query));
  const dataset = { students: scopedStudents, teachers, groups, leads };

  return (
    <div className={'shell' + (railMode ? ' rail' : '')}>
      <Sidebar
        page={page} setPage={setPage} locale={locale} allowedPages={allowedPages}
        railMode={railMode} setRailMode={setRailMode}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
      />
      <div className="main">
        <Topbar
          locale={locale} setLocale={setLocale} account={account} query={query} setQuery={setQuery}
          dataset={dataset} onOpenRecord={openRecord}
          onMenu={() => setMobileOpen(true)} unread={stats.overdue}
          onLogout={handleLogout}
        />

        {page === 'overview' && allowedPages.includes('overview') && (
          <Overview stats={stats} students={scopedStudents} lessons={seedLessons} leads={leads} setPage={setPage} sendReminder={sendReminder} account={account} canManage={canManage} locale={locale} />
        )}
        {page === 'students' && allowedPages.includes('students') && (
          <Students students={scopedFiltered} query={query} setModal={setModal} setSelected={setSelected} togglePay={togglePay} sendReminder={sendReminder} canManage={canManage} locale={locale} />
        )}
        {page === 'payments' && allowedPages.includes('payments') && (
          <Payments students={filteredStudents} togglePay={togglePay} sendReminder={sendReminder} locale={locale} />
        )}
        {page === 'groups' && allowedPages.includes('groups') && (
          <Groups groups={groups} teachers={teachers} branches={branches} students={students} canManage={canManage} locale={locale} onSaveGroup={saveGroup} onAddStudentToGroup={addStudentToGroup} onAssignStudentToGroup={assignStudentToGroup} />
        )}
        {page === 'teachers' && allowedPages.includes('teachers') && <Teachers teachers={teachers} canManage={canManage} locale={locale} onSaveTeacher={saveTeacher} onDeleteTeacher={deleteTeacher} />}
        {page === 'attendance' && allowedPages.includes('attendance') && (
          <Attendance students={scopedStudents} groups={groups} account={account} locale={locale} onSaveAttendance={saveAttendance} />
        )}
        {page === 'schedule' && allowedPages.includes('schedule') && <Schedule lessons={seedLessons} locale={locale} />}
        {page === 'leads' && allowedPages.includes('leads') && <Leads leads={leads} setLeads={setLeads} locale={locale} onAddLead={addLead} />}
        {page === 'reminders' && allowedPages.includes('reminders') && (
          <Reminders students={students} rules={rules} setRules={setRules} messageLog={messageLog} sendReminder={sendReminder} groups={groups} locale={locale} />
        )}
        {page === 'analytics' && allowedPages.includes('analytics') && <Analytics stats={stats} students={students} leads={leads} branches={branches} locale={locale} />}
        {page === 'staff' && allowedPages.includes('staff') && <Staff locale={locale} onStaffChanged={refreshTeachers} />}
        {page === 'settings' && allowedPages.includes('settings') && (
          <SettingsPage account={account} locale={locale} setLocale={setLocale} onLogout={handleLogout} branches={branches} onSaveBranch={saveBranch} onDeleteBranch={deleteBranch} />
        )}
      </div>

      <MobileNav
        page={page} setPage={setPage} locale={locale} allowedPages={allowedPages}
        onMore={() => { setMobileOpen(true); }}
      />

      {modal === 'add' && canManage && (
        <Modal
          title="Новый ученик"
          onClose={() => { setModal(null); setPrefillGroup(null); }}
          footer={<>
            <button className="btn btn-ghost" onClick={() => { setModal(null); setPrefillGroup(null); }}>Отмена</button>
            <button className="btn btn-primary" type="submit" form="add-student-form">Создать</button>
          </>}
        >
          <AddStudentForm onSubmit={addStudent} branches={branches} groups={groups} teachers={teachers} prefill={prefillGroup} locale={locale} />
        </Modal>
      )}

      {payModalStudent && (
        <Modal title="Тўловни қайд этиш" onClose={() => setPayModalStudent(null)}>
          <form onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); confirmPayment(payModalStudent.id, f.get('paidAt')); }}>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 12 }}>
              <b>{payModalStudent.name}</b> — {payModalStudent.group}
            </p>
            <label className="field">Тўлов санаси
              <input name="paidAt" type="date" required defaultValue={todayISO()} />
            </label>
            <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 8 }}>
              Кейинги тўлов санаси автоматик +1 ойга ҳисобланади.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="submit" className="btn btn-primary btn-sm">Сақлаш</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPayModalStudent(null)}>Отмена</button>
            </div>
          </form>
        </Modal>
      )}

      {assignModalGroup && (
        <Modal title={`${tr(locale, 'assignToGroupTitle')} — ${assignModalGroup.name}`} onClose={() => setAssignModalGroup(null)}>
          {(() => {
            const ungrouped = students.filter(s => !s.group);
            if (ungrouped.length === 0) {
              return <p style={{ fontSize: 13, color: 'var(--ink-faint)' }}>{tr(locale, 'noUngrouped')}</p>;
            }
            return (
              <form onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); confirmAssign(f.get('studentId'), assignModalGroup); }}>
                <label className="field">{tr(locale, 'pickStudent')}
                  <select name="studentId" required>
                    {ungrouped.map(s => <option key={s.id} value={s.id}>{s.name} · {s.phone}</option>)}
                  </select>
                </label>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button type="submit" className="btn btn-primary btn-sm">{tr(locale, 'attach')}</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAssignModalGroup(null)}>{tr(locale, 'cancel')}</button>
                </div>
              </form>
            );
          })()}
        </Modal>
      )}

      {selected && (
        <StudentDrawer
          s={students.find(x => x.id === selected.id) || selected}
          onClose={() => setSelected(null)}
          togglePay={togglePay}
          sendReminder={sendReminder}
          canManage={canManage}
          branches={branches}
          onUpdateStudent={updateStudent}
          onDeleteStudent={deleteStudent}
          locale={locale}
        />
      )}

      {toast && <div className="toast-el"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
