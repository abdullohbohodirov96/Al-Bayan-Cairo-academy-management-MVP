import { Plus, CalendarClock, CheckCircle2 } from 'lucide-react';
import { PageHead } from '../components/UI.jsx';
import { shortDate } from '../utils.js';

export function Schedule({ lessons }) {
  const dates = [...new Set(lessons.map(x => x.date))];
  return (
    <section className="content">
      <PageHead eyebrow="CALENDAR" title="Расписание" sub="Уроки, аудитории и конфликты">
        <button className="btn btn-primary"><Plus size={16} /> Новый урок</button>
      </PageHead>
      <div className="card">
        <div className="schedulebar">
          <div><CalendarClock size={17} /><b>Неделя 17–23 августа</b></div>
          <span className="chip"><CheckCircle2 size={13} /> Конфликтов: 0</span>
        </div>
        {dates.map(date => (
          <div className="dayblock" key={date}>
            <div className="daylabel"><b>{shortDate(date)}</b><span>{lessons.filter(x => x.date === date).length} занятия</span></div>
            <div>
              {lessons.filter(x => x.date === date).map(l => (
                <div className="slot" key={l.id}>
                  <time>{l.time}</time>
                  <div className="lesson"><b>{l.group}</b><span>{l.teacher} · {l.room}</span></div>
                  <span className={'pill ' + (l.status === 'done' ? 'pill-success' : l.status === 'active' ? 'pill-warning' : 'pill-neutral')}>
                    {l.status === 'done' ? 'Завершён' : l.status === 'active' ? 'Идёт' : 'Запланирован'}
                  </span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)', minWidth: 46, textAlign: 'end' }}>{l.count} уч.</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
