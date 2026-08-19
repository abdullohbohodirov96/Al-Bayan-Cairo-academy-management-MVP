import { Plus, Building2, Phone } from 'lucide-react';
import { PageHead, Progress } from '../components/UI.jsx';

export function Groups({ groups }) {
  return (
    <section className="content">
      <PageHead eyebrow="ACADEMIC STRUCTURE" title="Группы и уровни" sub="Нагрузка, вместимость, преподаватели и аудитории">
        <button className="btn btn-primary"><Plus size={16} /> Новая группа</button>
      </PageHead>
      <div className="cardgrid">
        {groups.map(g => {
          const pct = Math.round((g.students / g.capacity) * 100);
          return (
            <div className="groupcard" key={g.id}>
              <div className="group-top">
                <span className="level big">{g.level}</span>
                <span className="chip">{g.branch}</span>
              </div>
              <h3>{g.name}</h3>
              <p>{g.teacher} · {g.schedule}</p>
              <div className="groupmeta">
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Building2 size={13} /> {g.room}</span>
                <b>{g.students}/{g.capacity} мест</b>
              </div>
              <Progress value={pct} label={`${pct}% заполнено`} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function Teachers({ teachers }) {
  return (
    <section className="content">
      <PageHead eyebrow="TEAM" title="Преподаватели" sub="Группы, нагрузка, специализация и контакты">
        <button className="btn btn-primary"><Plus size={16} /> Добавить преподавателя</button>
      </PageHead>
      <div className="cardgrid">
        {teachers.map(t => (
          <div className="teachercard" key={t.id}>
            <div className="teacherhero">
              <div className="avatar lg">{t.name.replace('Ustoz ', '').slice(0, 2).toUpperCase()}</div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: 15.5 }}>{t.name}</h3>
                <p>{t.speciality}</p>
              </div>
              <span className={'dotstatus ' + t.status} />
            </div>
            <div className="metricsline">
              <div><b>{t.groups}</b><span>групп</span></div>
              <div><b>{t.students}</b><span>учеников</span></div>
              <div><b>{t.load}%</b><span>нагрузка</span></div>
            </div>
            <div className="contactline"><Phone size={14} />{t.phone}</div>
            <Progress value={t.load} label="Нагрузка преподавателя" />
          </div>
        ))}
      </div>
    </section>
  );
}
