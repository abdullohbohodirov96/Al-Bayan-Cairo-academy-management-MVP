import { useState } from 'react';
import { Plus, Search, BellRing, WalletCards, ChevronRight } from 'lucide-react';
import { PageHead, Avatar } from '../components/UI.jsx';
import { money, shortDate } from '../utils.js';

const FILTERS = [
  ['all', 'Все', s => true],
  ['debt', 'С долгом', s => !s.paid],
  ['low', 'Посещаемость <85%', s => s.attendance < 85],
];

export function Students({ students, query, setModal, setSelected, togglePay, sendReminder, canManage = true }) {
  const [filter, setFilter] = useState('all');
  const active = FILTERS.find(f => f[0] === filter)[2];
  const list = students.filter(active);

  return (
    <section className="content">
      <PageHead eyebrow="STUDENT CRM" title="Ученики" sub={canManage ? 'Карточки, группы, оплаты, посещаемость и контакты' : 'Ваши группы: карточки и посещаемость'}>
        {canManage && <button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={16} /> Добавить ученика</button>}
      </PageHead>

      <div className="toolbar">
        <div className="filters">
          {FILTERS.map(([key, label, fn]) => (
            <button key={key} className={'filter' + (filter === key ? ' active' : '')} onClick={() => setFilter(key)}>
              {label} <b>{students.filter(fn).length}</b>
            </button>
          ))}
        </div>
        {query && <div className="querynote"><Search size={13} /> Префикс поиска: <b>{query}</b></div>}
      </div>

      <div className="card tablewrap">
        {list.length ? (
          <table>
            <thead>
              <tr>
                <th>Ученик</th><th>Уровень / группа</th><th>Преподаватель</th><th>Посещаемость</th><th>Оплата</th><th></th>
              </tr>
            </thead>
            <tbody>
              {list.map(s => (
                <tr key={s.id} onClick={() => setSelected(s)}>
                  <td>
                    <div className="person">
                      <Avatar s={s} />
                      <div><b>{s.name}</b><span>{s.id} · {s.phone}</span></div>
                    </div>
                  </td>
                  <td><span className="level">{s.level}</span> <span>{s.group}</span></td>
                  <td><b>{s.teacher}</b><br /><span style={{ color: 'var(--ink-faint)', fontSize: 11.5 }}>{s.branch}</span></td>
                  <td>
                    <div className="att">
                      <b>{s.attendance}%</b>
                      <div><i style={{ width: s.attendance + '%' }} /></div>
                    </div>
                  </td>
                  <td>
                    <div className={'status ' + (s.paid ? 'paid' : 'overdue')}>
                      <b>{s.paid ? 'Оплачено' : s.paidAmount > 0 ? 'Частично' : 'К оплате'}</b>
                      <span>{s.paid ? shortDate(s.due) : money(s.fee - s.paidAmount)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="rowactions">
                      {canManage && <button title="Отправить SMS" onClick={e => { e.stopPropagation(); sendReminder(s); }}><BellRing size={14} /></button>}
                      {canManage && <button title="Изменить оплату" onClick={e => { e.stopPropagation(); togglePay(s.id); }}><WalletCards size={14} /></button>}
                      <ChevronRight size={15} color="var(--ink-faint)" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty"><Search size={22} /><b>Совпадений нет</b><span>Попробуйте другой запрос или фильтр.</span></div>
        )}
      </div>
    </section>
  );
}
