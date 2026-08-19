export function AddStudentForm({ onSubmit, branches = [] }) {
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
        <label className="field">Уровень
          <select name="level" defaultValue="A1">
            <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option>
          </select>
        </label>
        <label className="field">Группа
          <input name="group" required placeholder="A1 — Weekend" />
        </label>
        <label className="field">Преподаватель
          <input name="teacher" required placeholder="Ustoz Ahmad" />
        </label>
        <label className="field">Ежемесячная оплата
          <input name="fee" type="number" required defaultValue={450000} />
        </label>
        <label className="field">Срок оплаты
          <input name="due" type="date" required defaultValue="2026-09-01" />
        </label>
        <label className="field">Филиал
          <select name="branch" defaultValue={branches[0]?.name}>
            {branches.map(b => <option key={b.id}>{b.name}</option>)}
          </select>
        </label>
      </div>
    </form>
  );
}
