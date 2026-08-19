import { PageHead, Donut } from '../components/UI.jsx';
import { money } from '../utils.js';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function Analytics({ stats, students, leads }) {
  const leadWon = leads.filter(l => l.stage === 'won').length;
  return (
    <section className="content">
      <PageHead title="Аналитика" sub="Финансы, академика и воронка набора" />
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
            <div><span>Конверсия лидов</span><b>{Math.round((leadWon / leads.length) * 100)}%</b></div>
            <div><span>ARPU</span><b>{money(Math.round(stats.revenue / stats.total))}</b></div>
          </div>
        </div>
      </div>
    </section>
  );
}
