import { useState } from 'react';

export function AddStudentForm({ onSubmit, branches = [], groups = [], prefill }) {
  const locked = Boolean(prefill?.group);
  const [groupName, setGroupName] = useState(prefill?.group || '');
  const activeGroup = groups.find(g => g.name === groupName) || (locked ? prefill : null);

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
        <label className="field">Группа
          {locked ? (
            <input name="group" required defaultValue={prefill.group} readOnly />
          ) : (
            <select name="group" value={groupName} onChange={e => setGroupName(e.target.value)}>
              <option value="">— Гуруҳсиз (кейин бириктирилади) —</option>
              {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
          )}
        </label>

        {activeGroup ? (
          <>
            <input type="hidden" name="level" value={activeGroup.level || ''} />
            <label className="field">Уровень<input readOnly value={activeGroup.level || ''} onChange={() => {}} /></label>
            <input type="hidden" name="teacher" value={activeGroup.teacher || ''} />
            <label className="field">Преподаватель<input readOnly value={activeGroup.teacher || ''} onChange={() => {}} /></label>
          </>
        ) : (
          <>
            <label className="field">Уровень
              <select name="level" defaultValue="A1">
                <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option>
              </select>
            </label>
            <label className="field">Преподаватель
              <input name="teacher" placeholder="Гуруҳ танлансангиз автоматик тўлади" />
            </label>
          </>
        )}

        <label className="field">Ежемесячная оплата
          <input name="fee" type="number" required defaultValue={450000} />
        </label>
        <label className="field">Срок оплаты
          <input name="due" type="date" required defaultValue="2026-09-01" />
        </label>
        <label className="field">Филиал
          {activeGroup?.branch ? (
            <>
              <input type="hidden" name="branch" value={activeGroup.branch} />
              <input readOnly value={activeGroup.branch} onChange={() => {}} />
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
