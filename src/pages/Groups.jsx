import { useState } from 'react';
import { Plus, Building2, Phone, Pencil, MessageCircle, UserPlus, Trash2 } from 'lucide-react';
import { PageHead, Progress, Modal } from '../components/UI.jsx';
import { tr, formatSchedule, weekDays } from '../i18n.js';

function GroupForm({ initial, teachers, branches, locale, onSubmit, onCancel }) {
  const [days, setDays] = useState(initial?.days || []);
  function toggleDay(d) { setDays(v => v.includes(d) ? v.filter(x => x !== d) : [...v, d]); }
  return (
    <form onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); onSubmit({ ...Object.fromEntries(f), days }); }}>
      <div className="grid2">
        <label className="field">{tr(locale, 'groupName')}
          <input name="name" required defaultValue={initial?.name} placeholder="A1 — Weekend" />
        </label>
        <label className="field">{tr(locale, 'level')}
          <select name="level" defaultValue={initial?.level || 'A1'}>
            <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option>
          </select>
        </label>
        <label className="field">{tr(locale, 'teacher')}
          <select name="teacher" required defaultValue={initial?.teacher || ''}>
            <option value="" disabled>— танланг —</option>
            {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
        </label>
        <label className="field">{tr(locale, 'branch')}
          <select name="branch" defaultValue={initial?.branch}>
            {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
        </label>
        <label className="field">{tr(locale, 'room')}
          <input name="room" defaultValue={initial?.room} placeholder="Room 1" />
        </label>
        <label className="field">{tr(locale, 'capacity')}
          <input name="capacity" type="number" defaultValue={initial?.capacity || 16} />
        </label>
        <label className="field">{tr(locale, 'time')}
          <input name="time" type="time" defaultValue={initial?.time || '09:00'} />
        </label>
        <label className="field">{tr(locale, 'groupCode')}
          <input name="groupCode" defaultValue={initial?.groupCode} placeholder="S22-22" />
        </label>
      </div>
      <label className="field" style={{ marginTop: 12 }}>{tr(locale, 'days')}
        <div className="daypicker">
          {weekDays.map(d => (
            <button type="button" key={d} className={days.includes(d) ? 'active' : ''} onClick={() => toggleDay(d)}>{tr(locale, d)}</button>
          ))}
        </div>
      </label>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="submit" className="btn btn-primary btn-sm">{tr(locale, 'save')}</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>{tr(locale, 'cancel')}</button>
      </div>
    </form>
  );
}

export function Groups({ groups, teachers = [], branches = [], students = [], canManage = true, locale = 'ru', onSaveGroup, onAddStudentToGroup, onAssignStudentToGroup }) {
  const [modal, setModal] = useState(null); // null | 'new' | group id

  const editingGroup = typeof modal === 'string' && modal !== 'new' ? groups.find(g => g.id === modal) : null;

  return (
    <section className="content">
      <PageHead title={tr(locale, 'groups')} sub={tr(locale, 'subGroups')}>
        {canManage && <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={16} /> {tr(locale, 'addGroup')}</button>}
      </PageHead>
      <div className="cardgrid">
        {groups.map(g => {
          const roster = students.filter(s => s.group === g.name);
          const enrolled = roster.length;
          const pct = Math.round((enrolled / g.capacity) * 100);
          return (
            <div className="groupcard" key={g.id}>
              <div className="group-top">
                <span className="level big">{g.level}</span>
                <span className="chip">{g.branch}</span>
                {canManage && (
                  <button className="iconbtn sm" style={{ marginInlineStart: 'auto' }} onClick={() => setModal(g.id)} aria-label="edit">
                    <Pencil size={13} />
                  </button>
                )}
              </div>
              <h3>{g.name}</h3>
              <p>{g.teacher} · {formatSchedule(g.days, g.time, locale)}</p>
              {g.groupCode && (
                <div className={'chip' + (g.telegramChatId ? ' chip-ok' : '')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  <MessageCircle size={12} /> {g.groupCode}{g.telegramChatId ? ` · ${tr(locale, 'botLinked')}` : ` · ${tr(locale, 'botPending')}`}
                </div>
              )}
              <div className="groupmeta">
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Building2 size={13} /> {g.room}</span>
                <b>{enrolled}/{g.capacity} {tr(locale, 'seats')}</b>
              </div>
              <Progress value={pct} label={`${pct}% ${tr(locale, 'filled')}`} />
              {enrolled > 0 && (
                <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 8 }}>
                  {roster.slice(0, 3).map(s => s.name).join(', ')}{enrolled > 3 ? ` +${enrolled - 3}` : ''}
                </div>
              )}
              {canManage && onAddStudentToGroup && (
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onAddStudentToGroup(g)}>
                    <UserPlus size={14} /> {tr(locale, 'newStudentBtn')}
                  </button>
                  {onAssignStudentToGroup && (
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onAssignStudentToGroup(g)}>
                      <UserPlus size={14} /> {tr(locale, 'assignExistingBtn')}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal title={modal === 'new' ? tr(locale, 'addGroup') : tr(locale, 'editGroup')} onClose={() => setModal(null)}>
          <GroupForm
            initial={editingGroup}
            teachers={teachers}
            branches={branches}
            locale={locale}
            onCancel={() => setModal(null)}
            onSubmit={data => { onSaveGroup(modal === 'new' ? null : modal, data); setModal(null); }}
          />
        </Modal>
      )}
    </section>
  );
}

function TeacherForm({ initial, locale, onSubmit, onCancel }) {
  return (
    <form onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); onSubmit(Object.fromEntries(f)); }}>
      <div className="grid2">
        <label className="field">Ф.И.Ш.
          <input name="name" required defaultValue={initial?.name} placeholder="Ustoz Ahmad" />
        </label>
        <label className="field">Телефон
          <input name="phone" defaultValue={initial?.phone} placeholder="+998 90 111 22 33" />
        </label>
      </div>
      <label className="field" style={{ marginTop: 12 }}>Специализация
        <input name="speciality" defaultValue={initial?.speciality} placeholder="Nahv · Sarf · Speaking" />
      </label>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="submit" className="btn btn-primary btn-sm">{tr(locale, 'save')}</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>{tr(locale, 'cancel')}</button>
      </div>
    </form>
  );
}

export function Teachers({ teachers, canManage = true, locale = 'ru', onSaveTeacher, onDeleteTeacher }) {
  const [modal, setModal] = useState(null); // null | 'new' | teacher id
  const editingTeacher = typeof modal === 'string' && modal !== 'new' ? teachers.find(t => t.id === modal) : null;

  function remove(t) {
    if (!confirm(`${t.name}ni o'chirasizmi?`)) return;
    onDeleteTeacher(t.id);
  }

  return (
    <section className="content">
      <PageHead title={tr(locale, 'teachers')} sub={tr(locale, 'subTeachers')}>
        {canManage && <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={16} /> Добавить преподавателя</button>}
      </PageHead>
      <div className="cardgrid">
        {teachers.map(t => (
          <div className="teachercard" key={t.id}>
            <div className="teacherhero">
              <div className="avatar lg">{t.name.replace('Ustoz ', '').slice(0, 2).toUpperCase()}</div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: 15.5 }}>{t.name}</h3>
                <p>{t.speciality}</p>
              </div>
              {canManage && (
                <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 4 }}>
                  <button className="iconbtn sm" onClick={() => setModal(t.id)} aria-label="edit"><Pencil size={13} /></button>
                  <button className="iconbtn sm" onClick={() => remove(t)} aria-label="delete"><Trash2 size={13} /></button>
                </div>
              )}
            </div>
            <div className="metricsline">
              <div><b>{t.groups}</b><span>групп</span></div>
              <div><b>{t.students}</b><span>учеников</span></div>
              <div><b>{t.load}%</b><span>нагрузка</span></div>
            </div>
            <div className="contactline"><Phone size={14} />{t.phone}</div>
            <Progress value={t.load} label="Нагрузка преподавателя" />
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal === 'new' ? tr(locale, 'newTeacherTitle') : tr(locale, 'editItem')} onClose={() => setModal(null)}>
          <TeacherForm
            initial={editingTeacher}
            locale={locale}
            onCancel={() => setModal(null)}
            onSubmit={data => { onSaveTeacher(modal === 'new' ? null : modal, data); setModal(null); }}
          />
        </Modal>
      )}
    </section>
  );
}
