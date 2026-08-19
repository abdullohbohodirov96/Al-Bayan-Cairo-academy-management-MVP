import { useState } from 'react';
import { CalendarDays, UserCheck, Clock3, UserX, Check } from 'lucide-react';
import { PageHead, Avatar, Donut } from '../components/UI.jsx';

export function Attendance({ students }) {
  const [marked, setMarked] = useState(() =>
    Object.fromEntries(students.map((s, i) => [s.id, i % 7 === 0 ? 'absent' : 'present']))
  );
  const present = Object.values(marked).filter(x => x === 'present').length;
  const late = Object.values(marked).filter(x => x === 'late').length;
  const absent = Object.values(marked).filter(x => x === 'absent').length;

  return (
    <section className="content">
      <PageHead eyebrow="ATTENDANCE" title="Посещаемость" sub="Отметка за урок — без отдельной тяжёлой LMS">
        <div className="datebadge"><CalendarDays size={15} /> 19 августа 2026</div>
      </PageHead>
      <div className="attendance-layout">
        <div className="card">
          <div className="cardhead">
            <div><h3>B1 — Evening</h3><p>Ustoz Yusuf · 18:30 · Room 4</p></div>
            <span className="pill pill-success">{present}/{students.length} присутствуют</span>
          </div>
          <div>
            {students.map(s => (
              <div className="attendance-row" key={s.id}>
                <div className="person"><Avatar s={s} /><div><b>{s.name}</b><span>{s.id}</span></div></div>
                <div className="segmented">
                  <button className={marked[s.id] === 'present' ? 'active present' : ''} onClick={() => setMarked(v => ({ ...v, [s.id]: 'present' }))}><UserCheck size={14} /> Есть</button>
                  <button className={marked[s.id] === 'late' ? 'active late' : ''} onClick={() => setMarked(v => ({ ...v, [s.id]: 'late' }))}><Clock3 size={14} /> Опоздал</button>
                  <button className={marked[s.id] === 'absent' ? 'active absent' : ''} onClick={() => setMarked(v => ({ ...v, [s.id]: 'absent' }))}><UserX size={14} /> Нет</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="cardhead"><h3>Сводка урока</h3></div>
          <Donut value={Math.round((present / students.length) * 100)} />
          <div className="metriclist">
            <div><span>Присутствуют</span><b>{present}</b></div>
            <div><span>Опоздали</span><b>{late}</b></div>
            <div><span>Отсутствуют</span><b>{absent}</b></div>
          </div>
          <div style={{ padding: '0 19px 19px' }}>
            <button className="btn btn-primary btn-full"><Check size={16} /> Сохранить отметку</button>
          </div>
        </div>
      </div>
    </section>
  );
}
