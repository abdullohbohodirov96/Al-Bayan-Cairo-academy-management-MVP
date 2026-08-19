import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

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

import { seedStudents, seedTeachers, seedGroups, seedLessons, seedLeads, reminderRules as seedRules } from './data.js';
import { isPrefixMatch } from './search.js';
import { initials, todayISO } from './utils.js';
import { rolePages, roleCanEdit, defaultPageFor } from './roles.js';

export default function App() {
  const [account, setAccount] = useState(null);
  const [page, setPage] = useState('overview');
  const [locale, setLocale] = useState('ru');
  const [railMode, setRailMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState(seedStudents);
  const [leads, setLeads] = useState(seedLeads);
  const [rules, setRules] = useState(seedRules);
  const [messageLog, setMessageLog] = useState([
    { id: 'M-001', student: 'Maryam Abdullayeva', phone: '+998 91 222 31 44', type: 'Просрочка оплаты', status: 'delivered', at: '2026-08-19 09:03' },
    { id: 'M-002', student: 'Abdulloh Abdurazzaq', phone: '+998 95 701 30 76', type: 'Оплата сегодня', status: 'queued', at: '2026-08-19 10:15' },
  ]);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');

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
    setToast('Карточка ученика создана');
  }

  function togglePay(id) {
    setStudents(v => v.map(s => s.id === id
      ? { ...s, paid: !s.paid, paidAmount: !s.paid ? s.fee : 0, status: !s.paid ? 'active' : 'overdue' }
      : s));
    setToast('Статус оплаты обновлён');
  }

  function sendReminder(student, type = 'Ручное напоминание') {
    setMessageLog(v => [{
      id: 'M-' + String(v.length + 3).padStart(3, '0'),
      student: student.name, phone: student.phone, type, status: 'queued',
      at: new Date().toLocaleString('ru-RU'),
    }, ...v]);
    setToast('SMS добавлено в очередь. Провайдер подключается отдельно.');
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
    setAccount(null);
    setSelected(null);
    setModal(null);
    setQuery('');
  }

  if (!account) {
    return <Login onLogin={handleLogin} />;
  }

  const allowedPages = rolePages[account.role] || rolePages.teacher;
  const canManage = roleCanEdit[account.role];
  // A teacher only works with their own groups' students — everyone else sees the full center.
  const scopedStudents = account.role === 'teacher'
    ? students.filter(s => s.teacher === account.name)
    : students;
  const scopedFiltered = scopedStudents.filter(s => isPrefixMatch(s, query));
  const dataset = { students: scopedStudents, teachers: seedTeachers, groups: seedGroups, leads };

  return (
    <div className={'shell' + (railMode ? ' rail' : '')}>
      <Sidebar
        page={page} setPage={setPage} locale={locale} allowedPages={allowedPages}
        railMode={railMode} setRailMode={setRailMode}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
      />
      <div className="main">
        <Topbar
          locale={locale} account={account} query={query} setQuery={setQuery}
          dataset={dataset} onOpenRecord={openRecord}
          onMenu={() => setMobileOpen(true)} unread={stats.overdue}
          onLogout={handleLogout}
        />

        {page === 'overview' && allowedPages.includes('overview') && (
          <Overview stats={stats} students={scopedStudents} lessons={seedLessons} leads={leads} setPage={setPage} sendReminder={sendReminder} account={account} canManage={canManage} />
        )}
        {page === 'students' && allowedPages.includes('students') && (
          <Students students={scopedFiltered} query={query} setModal={setModal} setSelected={setSelected} togglePay={togglePay} sendReminder={sendReminder} canManage={canManage} />
        )}
        {page === 'payments' && allowedPages.includes('payments') && (
          <Payments students={filteredStudents} togglePay={togglePay} sendReminder={sendReminder} />
        )}
        {page === 'groups' && allowedPages.includes('groups') && <Groups groups={seedGroups} />}
        {page === 'teachers' && allowedPages.includes('teachers') && <Teachers teachers={seedTeachers} />}
        {page === 'attendance' && allowedPages.includes('attendance') && <Attendance students={scopedStudents} />}
        {page === 'schedule' && allowedPages.includes('schedule') && <Schedule lessons={seedLessons} />}
        {page === 'leads' && allowedPages.includes('leads') && <Leads leads={leads} setLeads={setLeads} />}
        {page === 'reminders' && allowedPages.includes('reminders') && (
          <Reminders students={students} rules={rules} setRules={setRules} messageLog={messageLog} sendReminder={sendReminder} />
        )}
        {page === 'analytics' && allowedPages.includes('analytics') && <Analytics stats={stats} students={students} leads={leads} />}
        {page === 'settings' && allowedPages.includes('settings') && (
          <SettingsPage account={account} locale={locale} setLocale={setLocale} onLogout={handleLogout} />
        )}
      </div>

      <MobileNav
        page={page} setPage={setPage} locale={locale} allowedPages={allowedPages}
        onMore={() => { setMobileOpen(true); }}
      />

      {modal === 'add' && canManage && (
        <Modal
          title="Новый ученик"
          onClose={() => setModal(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Отмена</button>
            <button className="btn btn-primary" type="submit" form="add-student-form">Создать</button>
          </>}
        >
          <AddStudentForm onSubmit={addStudent} />
        </Modal>
      )}

      {selected && (
        <StudentDrawer
          s={students.find(x => x.id === selected.id) || selected}
          onClose={() => setSelected(null)}
          togglePay={togglePay}
          sendReminder={sendReminder}
          canManage={canManage}
        />
      )}

      {toast && <div className="toast-el"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
