import { BellRing, CheckCircle2, Database } from 'lucide-react';
import { PageHead, Avatar, StatCard } from '../components/UI.jsx';
import { money, shortDate, dayDiff, todayISO } from '../utils.js';
import { WalletCards, Clock3, AlertTriangle } from 'lucide-react';

export function Payments({ students, togglePay, sendReminder }) {
  const unpaid = students.filter(s => !s.paid);
  const collected = students.reduce((a, s) => a + s.paidAmount, 0);
  const remaining = students.reduce((a, s) => a + Math.max(0, s.fee - s.paidAmount), 0);
  const nextDue = unpaid.length ? [...unpaid].sort((a, b) => a.due.localeCompare(b.due))[0] : null;

  return (
    <section className="content">
      <PageHead eyebrow="BILLING" title="Оплаты" sub="Ежемесячные начисления, частичные оплаты и напоминания" />

      <div className="statgrid">
        <StatCard icon={WalletCards} value={money(collected)} label="Собрано по выборке" />
        <StatCard icon={AlertTriangle} tone="brick" value={money(remaining)} label={`Остаток · ${unpaid.length} учеников`} />
        <StatCard icon={Clock3} tone="brass" value={nextDue ? shortDate(nextDue.due) : '—'} label="Ближайший срок оплаты" />
      </div>

      <div className="card">
        <div className="cardhead">
          <div><h3>Платёжный реестр</h3><p>Нажмите «Напомнить», чтобы создать SMS-job в очереди</p></div>
          <span className="chip"><Database size={13} /> Queue-ready</span>
        </div>
        <div className="tablewrap">
          <table>
            <thead>
              <tr><th>Ученик</th><th>Срок</th><th>Начислено</th><th>Оплачено</th><th>Статус</th><th>Действия</th></tr>
            </thead>
            <tbody>
              {students.map(s => {
                const diff = dayDiff(s.due, todayISO());
                return (
                  <tr key={s.id}>
                    <td>
                      <div className="person">
                        <Avatar s={s} />
                        <div><b>{s.name}</b><span>{s.id} · {s.phone}</span></div>
                      </div>
                    </td>
                    <td>
                      <b>{shortDate(s.due)}</b><br />
                      <span style={{ fontSize: 11.5, color: diff < 0 ? 'var(--brick)' : 'var(--ink-faint)' }}>
                        {diff < 0 ? 'просрочено' : diff === 0 ? 'сегодня' : `через ${diff} дн.`}
                      </span>
                    </td>
                    <td><b>{money(s.fee)}</b></td>
                    <td><b>{money(s.paidAmount)}</b></td>
                    <td>
                      <span className={'pill ' + (s.paid ? 'pill-success' : s.paidAmount ? 'pill-warning' : 'pill-danger')}>
                        {s.paid ? 'Оплачено' : s.paidAmount ? 'Частично' : 'Ожидает'}
                      </span>
                    </td>
                    <td>
                      <div className="rowactions" style={{ justifyContent: 'flex-start' }}>
                        <button title="Напомнить" onClick={() => sendReminder(s)} disabled={s.paid}><BellRing size={14} /></button>
                        <button title={s.paid ? 'Отменить оплату' : 'Отметить оплаченным'} onClick={() => togglePay(s.id)}><CheckCircle2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
