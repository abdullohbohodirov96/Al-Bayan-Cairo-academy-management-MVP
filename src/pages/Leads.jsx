import { Plus, Target, ChevronRight } from 'lucide-react';
import { PageHead } from '../components/UI.jsx';
import { shortDate, initials } from '../utils.js';

const STAGES = ['new', 'contacted', 'trial', 'won'];
const STAGE_LABEL = { new: 'Новые', contacted: 'Связались', trial: 'Пробный урок', won: 'Записаны', lost: 'Отказ' };

export function Leads({ leads, setLeads }) {
  function advance(id) {
    setLeads(v => v.map(l => {
      if (l.id !== id) return l;
      const i = STAGES.indexOf(l.stage);
      return { ...l, stage: STAGES[Math.min(i + 1, STAGES.length - 1)] };
    }));
  }
  return (
    <section className="content">
      <PageHead eyebrow="ADMISSIONS CRM" title="Лиды и набор" sub="От заявки до записи в группу">
        <button className="btn btn-primary"><Plus size={16} /> Новый лид</button>
      </PageHead>
      <div className="pipeline">
        {STAGES.map(stage => (
          <div className="pipe" key={stage}>
            <div className="pipehead"><b>{STAGE_LABEL[stage]}</b><span>{leads.filter(l => l.stage === stage).length}</span></div>
            {leads.filter(l => l.stage === stage).map(l => (
              <div className="leadcard" key={l.id}>
                <div className="person">
                  <div className="avatar sm">{initials(l.name)}</div>
                  <div><b>{l.name}</b><span>{l.id} · {l.level}</span></div>
                </div>
                <p><Target size={13} />{l.source} · далее {shortDate(l.next)}</p>
                <div className="leadfoot">
                  <span>{l.owner}</span>
                  {stage !== 'won' && <button onClick={() => advance(l.id)}>Дальше <ChevronRight size={13} /></button>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
