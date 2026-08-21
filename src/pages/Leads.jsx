import { useState } from 'react';
import { Plus, Target, ChevronRight } from 'lucide-react';
import { PageHead, Modal } from '../components/UI.jsx';
import { tr } from '../i18n.js';
import { shortDate, initials, todayISO } from '../utils.js';

const STAGES = ['new', 'contacted', 'trial', 'won'];
const STAGE_LABEL = { new: 'Новые', contacted: 'Связались', trial: 'Пробный урок', won: 'Записаны', lost: 'Отказ' };

function LeadForm({ onSubmit, onCancel, locale }) {
  return (
    <form onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); onSubmit(Object.fromEntries(f)); }}>
      <div className="grid2">
        <label className="field">Ф.И.Ш.
          <input name="name" required placeholder="Karimova Nilufar" />
        </label>
        <label className="field">Телефон
          <input name="phone" placeholder="+998 90 123 45 67" />
        </label>
        <label className="field">Манба
          <select name="source" defaultValue="Instagram">
            <option>Instagram</option><option>Facebook</option><option>Telegram</option>
            <option>Дўстлар тавсияси</option><option>Сайт</option><option>Бошқа</option>
          </select>
        </label>
        <label className="field">Даража
          <select name="level" defaultValue="A1">
            <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option>
          </select>
        </label>
        <label className="field">Кейинги алоқа санаси
          <input name="next" type="date" defaultValue={todayISO()} />
        </label>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="submit" className="btn btn-primary btn-sm">{tr(locale, 'save')}</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>{tr(locale, 'cancel')}</button>
      </div>
    </form>
  );
}

export function Leads({ leads, setLeads, locale = 'ru', onAddLead }) {
  const [modal, setModal] = useState(false);

  function advance(id) {
    setLeads(v => v.map(l => {
      if (l.id !== id) return l;
      const i = STAGES.indexOf(l.stage);
      return { ...l, stage: STAGES[Math.min(i + 1, STAGES.length - 1)] };
    }));
  }

  return (
    <section className="content">
      <PageHead title={tr(locale, 'leads')} sub={tr(locale, 'subLeads')}>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Новый лид</button>
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

      {modal && (
        <Modal title="Янги лид" onClose={() => setModal(false)}>
          <LeadForm locale={locale} onCancel={() => setModal(false)} onSubmit={data => { onAddLead(data); setModal(false); }} />
        </Modal>
      )}
    </section>
  );
}
