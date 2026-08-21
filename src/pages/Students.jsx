import { useState, useMemo } from 'react';
import { Plus, Search, BellRing, WalletCards, ChevronRight } from 'lucide-react';
import { PageHead, Avatar } from '../components/UI.jsx';
import { tr } from '../i18n.js';
import { money, shortDate } from '../utils.js';

export function Students({ students, query, setModal, setSelected, togglePay, sendReminder, canManage = true, locale = 'ru' }) {
  const [filter, setFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');

  const FILTERS = [
    ['all', tr(locale, 'filterAll'), () => true],
    ['debt', tr(locale, 'filterDebt'), s => !s.paid],
    ['low', tr(locale, 'filterLow'), s => s.attendance < 85],
  ];
  const active = FILTERS.find(f => f[0] === filter)[2];

  const groupNames = useMemo(() => [...new Set(students.map(s => s.group).filter(Boolean))].sort(), [students]);
  const list = students.filter(active).filter(s => groupFilter === 'all' || s.group === groupFilter);

  return (
    <section className="content">
      <PageHead title={tr(locale, 'students')} sub={canManage ? tr(locale, 'subStudentsManage') : tr(locale, 'subStudentsTeacher')}>
        {canManage && <button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={16} /> {tr(locale, 'addStudentBtn')}</button>}
      </PageHead>

      <div className="toolbar">
        <div className="filters">
          {FILTERS.map(([key, label, fn]) => (
            <button key={key} className={'filter' + (filter === key ? ' active' : '')} onClick={() => setFilter(key)}>
              {label} <b>{students.filter(fn).length}</b>
            </button>
          ))}
          {groupNames.length > 0 && (
            <select className="filter" style={{ paddingInlineEnd: 10 }} value={groupFilter} onChange={e => setGroupFilter(e.target.value)}>
              <option value="all">{tr(locale, 'allGroups')}</option>
              {groupNames.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          )}
        </div>
        {query && <div className="querynote"><Search size={13} /> {tr(locale, 'searchPrefix')}: <b>{query}</b></div>}
      </div>

      <div className="card tablewrap">
        {list.length ? (
          <table>
            <thead>
              <tr>
                <th>{tr(locale, 'colStudent')}</th><th>{tr(locale, 'colLevelGroup')}</th><th>{tr(locale, 'colTeacher')}</th><th>{tr(locale, 'colAttendance')}</th><th>{tr(locale, 'colPayment')}</th><th></th>
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
                      <b>{s.paid ? tr(locale, 'statusPaid') : s.paidAmount > 0 ? tr(locale, 'statusPartial') : tr(locale, 'statusDue')}</b>
                      <span>{s.paid ? shortDate(s.due) : money(s.fee - s.paidAmount)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="rowactions">
                      {canManage && <button title={tr(locale, 'sendSms')} onClick={e => { e.stopPropagation(); sendReminder(s); }}><BellRing size={14} /></button>}
                      {canManage && <button title={tr(locale, 'editPayment')} onClick={e => { e.stopPropagation(); togglePay(s.id); }}><WalletCards size={14} /></button>}
                      <ChevronRight size={15} color="var(--ink-faint)" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty"><Search size={22} /><b>{tr(locale, 'noMatches')}</b><span>{tr(locale, 'tryOther')}</span></div>
        )}
      </div>
    </section>
  );
}
