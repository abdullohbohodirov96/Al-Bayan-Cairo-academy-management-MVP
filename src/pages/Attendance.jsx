import { useState, useMemo, useEffect } from 'react';
import { CalendarDays, UserCheck, Clock3, UserX, Check } from 'lucide-react';
import { PageHead, Avatar, Donut } from '../components/UI.jsx';
import { tr, formatSchedule } from '../i18n.js';

export function Attendance({ students, groups = [], account, locale = 'ru', onSaveAttendance }) {
  const myGroups = useMemo(
    () => account?.role === 'teacher' ? groups.filter(g => g.teacher === account.name) : groups,
    [groups, account]
  );

  const [groupId, setGroupId] = useState(myGroups[0]?.id || null);
  useEffect(() => {
    if (!myGroups.find(g => g.id === groupId)) setGroupId(myGroups[0]?.id || null);
  }, [myGroups, groupId]);

  const activeGroup = myGroups.find(g => g.id === groupId);
  const roster = activeGroup ? students.filter(s => s.group === activeGroup.name) : [];

  const [marked, setMarked] = useState({});
  useEffect(() => {
    setMarked(Object.fromEntries(roster.map((s, i) => [s.id, i % 7 === 0 ? 'absent' : 'present'])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const present = Object.values(marked).filter(x => x === 'present').length;
  const late = Object.values(marked).filter(x => x === 'late').length;
  const absent = Object.values(marked).filter(x => x === 'absent').length;
  const total = roster.length || 1;

  function save() {
    onSaveAttendance?.(activeGroup, marked);
  }

  return (
    <section className="content">
      <PageHead title={tr(locale, 'attendance')} sub={tr(locale, 'subAttendance')}>
        <div className="datebadge"><CalendarDays size={15} /> 19 августа 2026</div>
      </PageHead>

      {myGroups.length > 1 && (
        <div className="groupswitch">
          {myGroups.map(g => (
            <button key={g.id} className={g.id === groupId ? 'active' : ''} onClick={() => setGroupId(g.id)}>{g.name}</button>
          ))}
        </div>
      )}

      {!activeGroup ? (
        <div className="card"><div className="emptynote">{tr(locale, 'noGroup')}</div></div>
      ) : (
        <div className="attendance-layout">
          <div className="card">
            <div className="cardhead">
              <div><h3>{activeGroup.name}</h3><p>{activeGroup.teacher} · {formatSchedule(activeGroup.days, activeGroup.time, locale)} · {activeGroup.room}</p></div>
              <span className="pill pill-success">{present}/{roster.length} присутствуют</span>
            </div>
            <div>
              {roster.map(s => (
                <div className="attendance-row" key={s.id}>
                  <div className="person"><Avatar s={s} /><div><b>{s.name}</b><span>{s.id}</span></div></div>
                  <div className="segmented">
                    <button className={marked[s.id] === 'present' ? 'active present' : ''} onClick={() => setMarked(v => ({ ...v, [s.id]: 'present' }))}><UserCheck size={14} /> {tr(locale, 'present')}</button>
                    <button className={marked[s.id] === 'late' ? 'active late' : ''} onClick={() => setMarked(v => ({ ...v, [s.id]: 'late' }))}><Clock3 size={14} /> {tr(locale, 'late')}</button>
                    <button className={marked[s.id] === 'absent' ? 'active absent' : ''} onClick={() => setMarked(v => ({ ...v, [s.id]: 'absent' }))}><UserX size={14} /> {tr(locale, 'absent')}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="cardhead"><h3>Сводка урока</h3></div>
            <Donut value={Math.round((present / total) * 100)} />
            <div className="metriclist">
              <div><span>Присутствуют</span><b>{present}</b></div>
              <div><span>Опоздали</span><b>{late}</b></div>
              <div><span>Отсутствуют</span><b>{absent}</b></div>
            </div>
            <div style={{ padding: '0 19px 19px' }}>
              <button className="btn btn-primary btn-full" onClick={save}><Check size={16} /> {tr(locale, 'saveAndExit')}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
