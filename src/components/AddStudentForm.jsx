import { useState, useEffect } from 'react';
import { tr } from '../i18n.js';

export function AddStudentForm({ onSubmit, branches = [], groups = [], teachers = [], prefill, locale = 'ru' }) {
  const locked = Boolean(prefill?.group);

  const [groupName, setGroupName] = useState(prefill?.group || '');
  const [teacherName, setTeacherName] = useState(prefill?.teacher || '');

  const activeGroup = groups.find(g => g.name === groupName) || (locked ? prefill : null);

  // Picking a group whose teacher is already known locks the teacher field
  // to match it (a group only has one teacher). Picking a teacher instead
  // narrows the group list down to that teacher's own groups.
  useEffect(() => {
    if (locked) return;
    if (activeGroup?.teacher) setTeacherName(activeGroup.teacher);
  }, [groupName]); // eslint-disable-line react-hooks/exhaustive-deps

  function onTeacherChange(name) {
    setTeacherName(name);
    // If the currently chosen group belongs to someone else, clear it so
    // the two selections never disagree.
    if (activeGroup && activeGroup.teacher && activeGroup.teacher !== name) setGroupName('');
  }

  const groupOptions = teacherName ? groups.filter(g => !g.teacher || g.teacher === teacherName) : groups;
  const teacherLocked = Boolean(activeGroup?.teacher);

  return (
    <form id="add-student-form" onSubmit={onSubmit}>
      <div className="grid2">
        <label className="field">Имя ученика
          <input name="name" required placeholder="Например, Amina Yusupova" />
        </label>
        <label className="field">Телефон
          <input name="phone" required placeholder="+998 90 000 00 00" />
        </label>
        <label className="field">Родитель / контакт
          <input name="parent" placeholder="ФИО родителя" />
        </label>

        <label className="field">{tr(locale, 'teacher')}
          {locked ? (
            <input readOnly defaultValue={prefill.teacher} />
          ) : (
            <select value={teacherName} onChange={e => onTeacherChange(e.target.value)} disabled={teacherLocked}>
              <option value="">— танланмаган —</option>
              {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          )}
          <input type="hidden" name="teacher" value={locked ? prefill.teacher : teacherName} />
        </label>

        <label className="field">Группа
          {locked ? (
            <input readOnly defaultValue={prefill.group} />
          ) : (
            <select value={groupName} onChange={e => setGroupName(e.target.value)}>
              <option value="">— Гуруҳсиз (кейин бириктирилади) —</option>
              {groupOptions.map(g => <option key={g.id} value={g.name}>{g.name}{g.teacher ? '' : ' · устоз йўқ'}</option>)}
            </select>
          )}
          <input type="hidden" name="group" value={locked ? prefill.group : groupName} />
        </label>

        <label className="field">{tr(locale, 'level')}
          {activeGroup?.level ? (
            <>
              <input readOnly value={activeGroup.level} onChange={() => {}} />
              <input type="hidden" name="level" value={activeGroup.level} />
            </>
          ) : (
            <select name="level" defaultValue="A1">
              <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option>
            </select>
          )}
        </label>

        <label className="field">Ежемесячная оплата
          <input name="fee" type="number" required defaultValue={450000} />
        </label>
        <label className="field">Срок оплаты
          <input name="due" type="date" required defaultValue="2026-09-01" />
        </label>
        <label className="field">Филиал
          {activeGroup?.branch ? (
            <>
              <input readOnly value={activeGroup.branch} onChange={() => {}} />
              <input type="hidden" name="branch" value={activeGroup.branch} />
            </>
          ) : (
            <select name="branch" defaultValue={branches[0]?.name}>
              {branches.map(b => <option key={b.id}>{b.name}</option>)}
            </select>
          )}
        </label>
      </div>
    </form>
  );
}
