import { X, Phone, BellRing, WalletCards, CheckCircle2 } from 'lucide-react';
import { Avatar, Progress } from './UI.jsx';
import { money, shortDate } from '../utils.js';

export function StudentDrawer({ s, onClose, togglePay, sendReminder, canManage = true }) {
  if (!s) return null;
  return (
    <div className="modalscrim" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        <div className="modalhead">
          <div className="person"><Avatar s={s} size="lg" /><div><b style={{ fontSize: 16 }}>{s.name}</b><span>{s.id} · {s.branch}</span></div></div>
          <button className="closebtn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modalbody">
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
          </div>
        </div>
        {canManage && (
          <div className="modalfoot">
            <button className="btn btn-ghost" onClick={() => sendReminder(s)}><BellRing size={15} /> Отправить SMS</button>
            <button className="btn btn-primary" onClick={() => togglePay(s.id)}><CheckCircle2 size={15} /> {s.paid ? 'Отменить оплату' : 'Отметить оплаченным'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
