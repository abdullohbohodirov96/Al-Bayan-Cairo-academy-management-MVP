import { useState } from 'react';
import { X, Phone, BellRing, WalletCards, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { Avatar, Progress } from './UI.jsx';
import { money, shortDate } from '../utils.js';

function EditForm({ s, branches, onCancel, onSubmit }) {
  return (
    <form onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); onSubmit(Object.fromEntries(f)); }}>
      <div className="grid2">
        <label className="field">Имя ученика
          <input name="name" required defaultValue={s.name} />
        </label>
        <label className="field">Телефон
          <input name="phone" required defaultValue={s.phone} />
        </label>
        <label className="field">Родитель / контакт
          <input name="parent" defaultValue={s.parent} />
        </label>
        <label className="field">Уровень
          <select name="level" defaultValue={s.level}>
            <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option>
          </select>
        </label>
        <label className="field">Группа
          <input name="group" required defaultValue={s.group} />
        </label>
        <label className="field">Преподаватель
          <input name="teacher" required defaultValue={s.teacher} />
        </label>
        <label className="field">Ежемесячная оплата
          <input name="fee" type="number" required defaultValue={s.fee} />
        </label>
        <label className="field">Срок оплаты
          <input name="due" type="date" required defaultValue={s.due} />
        </label>
        <label className="field">Филиал
          <select name="branch" defaultValue={s.branch}>
            {branches.map(b => <option key={b.id}>{b.name}</option>)}
          </select>
        </label>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="submit" className="btn btn-primary btn-sm">Сақлаш</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Отмена</button>
      </div>
    </form>
  );
}

export function StudentDrawer({ s, onClose, togglePay, sendReminder, canManage = true, branches = [], onUpdateStudent, onDeleteStudent }) {
  const [editing, setEditing] = useState(false);
  if (!s) return null;

  function remove() {
    if (!confirm(`${s.name} — ўчирасизми? Бу қайтарилмайди.`)) return;
    onDeleteStudent(s.id);
    onClose();
  }

  return (
    <div className="modalscrim" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        <div className="modalhead">
          <div className="person"><Avatar s={s} size="lg" /><div><b style={{ fontSize: 16 }}>{s.name}</b><span>{s.id} · {s.branch}</span></div></div>
          <button className="closebtn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modalbody">
          {editing ? (
            <EditForm
              s={s} branches={branches}
              onCancel={() => setEditing(false)}
              onSubmit={data => { onUpdateStudent(s.id, data); setEditing(false); }}
            />
          ) : (
            <>
              <div className="grid2">
                <div className="field">Уровень / группа<b style={{ fontSize: 14 }}>{s.level} · {s.group}</b></div>
                <div className="field">Преподаватель<b style={{ fontSize: 14 }}>{s.teacher}</b></div>
                <div className="field">Телефон<b className="mono" style={{ fontSize: 14 }}><Phone size={13} style={{ verticalAlign: -2, marginInlineEnd: 4 }} />{s.phone}</b></div>
                <div className="field">Родитель<b style={{ fontSize: 14 }}>{s.parent || '—'}</b></div>
              </div>
              <div>
                <Progress value={s.attendance} label={`Посещаемость · ${s.attendance}%`} />
              </div>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                  <span>Начислено</span><b className="mono">{money(s.fee)}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginTop: 6 }}>
                  <span>Оплачено</span><b className="mono">{money(s.paidAmount)}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginTop: 6 }}>
                  <span>Срок</span><b className="mono">{shortDate(s.due)}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginTop: 6 }}>
                  <span>Дарслар қолди</span><b className="mono">{Math.max(0, 12 - (s.lessonsUsed || 0))} / 12</b>
                </div>
              </div>
            </>
          )}
        </div>
        {canManage && !editing && (
          <div className="modalfoot" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={() => setEditing(true)}><Pencil size={15} /> Таҳрирлаш</button>
            <button className="btn btn-ghost" onClick={() => sendReminder(s)}><BellRing size={15} /> Отправить SMS</button>
            <button className="btn btn-primary" onClick={() => togglePay(s.id)}><CheckCircle2 size={15} /> {s.paid ? 'Отменить оплату' : 'Отметить оплаченным'}</button>
            <button className="btn btn-ghost" style={{ color: 'var(--brick)' }} onClick={remove}><Trash2 size={15} /> Ўчириш</button>
          </div>
        )}
      </div>
    </div>
  );
}
