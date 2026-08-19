import { Users, WalletCards, UserCheck, TrendingUp, ArrowUpRight, CalendarDays, BellRing } from 'lucide-react';
import { StatCard, Avatar, PageHead } from '../components/UI.jsx';
import { money, shortDate } from '../utils.js';

export function Overview({ stats, students, lessons, leads, setPage, sendReminder, account, canManage = true }) {
  const attention = students.filter(s => !s.paid || s.attendance < 85).slice(0, 5);
  const today = lessons.filter(l => l.date === '2026-08-19');
  const freshLeads = leads.filter(l => l.stage === 'new' || l.stage === 'contacted').slice(0, 4);
  const firstName = account?.name.split(' ')[0] || '';

  return (
    <section className="content">
      <div className="overview-hero">
        <div>
          <h2>Ассаламу алайкум, {firstName}</h2>
          <p>
            {canManage
              ? `${stats.total} учеников, ${stats.attendance}% средняя посещаемость, ${money(stats.due)} к сбору на сегодня.`
              : `${students.length} учеников в ваших группах, ${stats.attendance}% средняя посещаемость.`}
          </p>
        </div>
        <div className="datebadge"><CalendarDays size={15} /> 19 августа 2026 · Cairo Main</div>
      </div>

      <div className="statgrid">
        <StatCard icon={Users} value={students.length} label={canManage ? 'Активных учеников' : 'Учеников в группах'} delta={canManage ? '+4 за месяц' : undefined} />
        {canManage && <StatCard icon={WalletCards} tone="brass" value={money(stats.revenue)} label="Доход за месяц" delta="+8.2%" />}
        <StatCard icon={UserCheck} value={stats.attendance + '%'} label="Средняя посещаемость" />
        {canManage && <StatCard icon={TrendingUp} tone="brick" value={money(stats.due)} label="Дебиторская задолженность" delta="3 просрочки" down />}
      </div>

      <div className="split">
        <div className="card">
          <div className="cardhead">
            <div>
              <h3>Требуют внимания</h3>
              <p>Просрочка оплаты или посещаемость ниже 85%</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage('students')}>
              Открыть CRM <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="tablewrap">
            {attention.length ? (
              <table>
                <tbody>
                  {attention.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="person">
                          <Avatar s={s} />
                          <div><b>{s.name}</b><span>{s.id} · {s.group}</span></div>
                        </div>
                      </td>
                      <td>
                        <span className={'pill ' + (s.paid ? 'pill-warning' : 'pill-danger')}>
                          {s.paid ? `${s.attendance}% посещ.` : 'Долг ' + money(s.fee - s.paidAmount)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'end' }}>
                        {canManage && (
                          <button className="btn btn-ghost btn-sm" onClick={() => sendReminder(s)}>
                            <BellRing size={13} /> SMS
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty"><b>Все в порядке</b><span>Нет должников и отстающих по посещаемости.</span></div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="cardhead">
              <div><h3>Сегодня</h3><p>{today.length} занятия по расписанию</p></div>
            </div>
            {today.map(l => (
              <div className="glance-row" key={l.id}>
                <span className="time mono">{l.time}</span>
                <span style={{ flex: 1 }}>{l.group}</span>
                <span className={'pill ' + (l.status === 'done' ? 'pill-success' : l.status === 'active' ? 'pill-warning' : 'pill-neutral')}>
                  {l.status === 'done' ? 'Завершён' : l.status === 'active' ? 'Идёт' : 'Скоро'}
                </span>
              </div>
            ))}
          </div>
          {canManage && (
            <div className="card">
              <div className="cardhead">
                <div><h3>Новые лиды</h3><p>Ждут первого контакта</p></div>
                <button className="btn btn-ghost btn-sm" onClick={() => setPage('leads')}>Все <ArrowUpRight size={14} /></button>
              </div>
              {freshLeads.map(l => (
                <div className="glance-row" key={l.id}>
                  <span style={{ flex: 1 }}>{l.name}</span>
                  <span className="chip">{l.source}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
