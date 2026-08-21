import { Users, WalletCards, UserCheck, TrendingUp, ArrowUpRight, CalendarDays, BellRing } from 'lucide-react';
import { StatCard, Avatar, PageHead } from '../components/UI.jsx';
import { money, shortDate } from '../utils.js';
import { tr } from '../i18n.js';

function fill(template, vars) {
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), template);
}

export function Overview({ stats, students, lessons, leads, setPage, sendReminder, account, canManage = true, locale = 'ru' }) {
  const attention = students.filter(s => !s.paid || s.attendance < 85).slice(0, 5);
  const today = lessons.filter(l => l.date === '2026-08-19');
  const freshLeads = leads.filter(l => l.stage === 'new' || l.stage === 'contacted').slice(0, 4);
  const firstName = account?.name.split(' ')[0] || '';

  const summary = fill(tr(locale, canManage ? 'heroManage' : 'heroTeacher'), {
    total: canManage ? stats.total : students.length,
    attendance: stats.attendance,
    due: money(stats.due),
  });

  return (
    <section className="content">
      <div className="overview-hero">
        <div>
          <h2>{tr(locale, 'heroGreeting')}, {firstName}</h2>
          <p>{summary}</p>
        </div>
        <div className="datebadge"><CalendarDays size={15} /> 19 августа 2026 · Cairo Main</div>
      </div>

      <div className="statgrid">
        <StatCard icon={Users} value={students.length} label={tr(locale, canManage ? 'statActiveStudents' : 'statStudentsInGroups')} delta={canManage ? tr(locale, 'statMonthlyGrowth') : undefined} />
        {canManage && <StatCard icon={WalletCards} tone="brass" value={money(stats.revenue)} label={tr(locale, 'statMonthlyRevenue')} delta="+8.2%" />}
        <StatCard icon={UserCheck} value={stats.attendance + '%'} label={tr(locale, 'statAvgAttendance')} />
        {canManage && <StatCard icon={TrendingUp} tone="brick" value={money(stats.due)} label={tr(locale, 'statDebt')} delta={`3 ${tr(locale, 'statOverdueSuffix')}`} down />}
      </div>

      <div className="split">
        <div className="card">
          <div className="cardhead">
            <div>
              <h3>{tr(locale, 'attentionTitle')}</h3>
              <p>{tr(locale, 'attentionSub')}</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage('students')}>
              {tr(locale, 'openCrm')} <ArrowUpRight size={14} />
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
                          {s.paid ? `${s.attendance}% ${tr(locale, 'attendanceSuffix')}` : `${tr(locale, 'debtPrefix')} ${money(s.fee - s.paidAmount)}`}
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
              <div className="empty"><b>{tr(locale, 'allGood')}</b><span>{tr(locale, 'noDebtorsSub')}</span></div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="cardhead">
              <div><h3>{tr(locale, 'todayTitle')}</h3><p>{fill(tr(locale, 'lessonsScheduled'), { n: today.length })}</p></div>
            </div>
            {today.map(l => (
              <div className="glance-row" key={l.id}>
                <span className="time mono">{l.time}</span>
                <span style={{ flex: 1 }}>{l.group}</span>
                <span className={'pill ' + (l.status === 'done' ? 'pill-success' : l.status === 'active' ? 'pill-warning' : 'pill-neutral')}>
                  {l.status === 'done' ? tr(locale, 'statusDone') : l.status === 'active' ? tr(locale, 'statusActive') : tr(locale, 'statusSoon')}
                </span>
              </div>
            ))}
          </div>
          {canManage && (
            <div className="card">
              <div className="cardhead">
                <div><h3>{tr(locale, 'newLeadsTitle')}</h3><p>{tr(locale, 'newLeadsSub')}</p></div>
                <button className="btn btn-ghost btn-sm" onClick={() => setPage('leads')}>{tr(locale, 'allBtn')} <ArrowUpRight size={14} /></button>
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
