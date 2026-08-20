import { PageHead, Donut, Avatar } from '../components/UI.jsx';
import { tr } from '../i18n.js';
import { money, shortDate, dayDiff, todayISO } from '../utils.js';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function Analytics({ stats, students, leads, branches = [], locale = 'ru' }) {
  const leadWon = leads.filter(l => l.stage === 'won').length;
  const debtors = students
    .filter(s => !s.paid)
    .map(s => ({ ...s, overdueDays: -dayDiff(s.due, todayISO()) }))
    .sort((a, b) => b.overdueDays - a.overdueDays);

  return (
    <section className="content">
      <PageHead title={tr(locale, 'analytics')} sub="Финансы, академика и воронка набора" />
      <div className="analyticgrid">
        <div className="card">
          <div className="cardhead"><div><h3>Ученики по уровням</h3><p>Текущая структура центра</p></div></div>
          <div className="bars">
            {LEVELS.map(l => {
              const count = students.filter(s => s.level === l).length;
              return (
                <div key={l}>
                  <b>{count}</b>
                  <i style={{ height: `${Math.max(10, count * 34)}px` }} />
                  <span>{l}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="cardhead"><div><h3>Оплата</h3><p>Доля закрытых начислений</p></div></div>
          <Donut value={Math.round((stats.paid / stats.total) * 100)} />
          <div className="legend"><span><i /> Оплачено</span><span><i /> Остаток</span></div>
        </div>
        <div className="card">
          <div className="cardhead"><div><h3>Ключевые метрики</h3><p>Для руководителя</p></div></div>
          <div className="metriclist">
            <div><span>Средняя посещаемость</span><b>{stats.attendance}%</b></div>
            <div><span>Дебиторка</span><b>{money(stats.due)}</b></div>
            <div><span>Конверсия лидов</span><b>{leads.length ? Math.round((leadWon / leads.length) * 100) : 0}%</b></div>
            <div><span>ARPU</span><b>{money(stats.total ? Math.round(stats.revenue / stats.total) : 0)}</b></div>
          </div>
        </div>

        {branches.length > 0 && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="cardhead"><div><h3>Филиаллар кесимида</h3><p>Ҳар бир филиалдаги ўқувчилар ва даромад</p></div></div>
            <div className="tablewrap">
              <table>
                <thead><tr><th>Филиал</th><th>Ўқувчилар</th><th>Ойлик даромад</th><th>Қарздорлик</th></tr></thead>
                <tbody>
                  {branches.map(b => {
                    const bs = students.filter(s => s.branch === b.name);
                    const revenue = bs.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
                    const due = bs.reduce((sum, s) => sum + (s.paid ? 0 : (s.fee - s.paidAmount)), 0);
                    return (
                      <tr key={b.id}>
                        <td><b>{b.name}</b></td>
                        <td>{bs.length}</td>
                        <td className="mono">{money(revenue)}</td>
                        <td className="mono" style={{ color: due > 0 ? 'var(--brick)' : undefined }}>{money(due)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="cardhead"><div><h3>Қарздорлар рўйхати</h3><p>Тўламаган барча ўқувчилар, муддати ўтиш тартибида</p></div></div>
          {debtors.length === 0 ? (
            <div className="empty"><b>Қарздорлар йўқ</b><span>Барча ўқувчилар тўлаган.</span></div>
          ) : (
            <div className="tablewrap">
              <table>
                <thead><tr><th>Ўқувчи</th><th>Гуруҳ</th><th>Муддат</th><th>Қарз</th></tr></thead>
                <tbody>
                  {debtors.map(s => (
                    <tr key={s.id}>
                      <td><div className="person"><Avatar s={s} /><div><b>{s.name}</b><span>{s.id} · {s.phone}</span></div></div></td>
                      <td>{s.group || '—'}</td>
                      <td>
                        <b className="mono">{shortDate(s.due)}</b><br />
                        <span style={{ fontSize: 11.5, color: s.overdueDays > 0 ? 'var(--brick)' : 'var(--ink-faint)' }}>
                          {s.overdueDays > 0 ? `${s.overdueDays} кун ўтди` : 'муддати келмаган'}
                        </span>
                      </td>
                      <td className="mono" style={{ color: 'var(--brick)' }}>{money(s.fee - s.paidAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
