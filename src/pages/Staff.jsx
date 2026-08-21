import { useState, useEffect } from 'react';
import { Plus, KeyRound, Pencil, Trash2, UserCog, ShieldOff, ShieldCheck } from 'lucide-react';
import { PageHead, Modal, Avatar } from '../components/UI.jsx';
import { tr } from '../i18n.js';
import { initials } from '../utils.js';
import { listStaff, createStaff, updateStaffProfile, resetStaffPassword, setStaffActive, deleteStaff } from '../dataService.js';

const ROLE_LABEL = { ceo: 'CEO', admin: 'Админ', teacher: 'Ustoz' };

function CreateForm({ onCancel, onCreated }) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', role: 'teacher' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    const res = await createStaff(form);
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    onCreated();
  }

  return (
    <form onSubmit={submit}>
      <div className="grid2">
        <label className="field">Ф.И.Ш.
          <input required value={form.full_name} onChange={e => setForm(v => ({ ...v, full_name: e.target.value }))} placeholder="Ustoz Karimov" />
        </label>
        <label className="field">Роль
          <select value={form.role} onChange={e => setForm(v => ({ ...v, role: e.target.value }))}>
            <option value="teacher">Ustoz</option>
            <option value="admin">Админ</option>
          </select>
        </label>
        <label className="field">Email (логин)
          <input required type="email" value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))} placeholder="karimov@albayan.uz" />
        </label>
        <label className="field">Дастлабки парол
          <input required minLength={6} value={form.password} onChange={e => setForm(v => ({ ...v, password: e.target.value }))} placeholder="кам ошанда 6 та белги" />
        </label>
        <label className="field">Телефон
          <input value={form.phone} onChange={e => setForm(v => ({ ...v, phone: e.target.value }))} placeholder="+998 90 111 22 33" />
        </label>
      </div>
      {error && <p style={{ color: 'var(--brick)', fontSize: 12.5, marginTop: 8 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Яратилмоқда…' : 'Яратиш'}</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Отмена</button>
      </div>
    </form>
  );
}

function EditForm({ person, onCancel, onSaved }) {
  const [form, setForm] = useState({ full_name: person.full_name, phone: person.phone || '', role: person.role });
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function saveProfile(e) {
    e.preventDefault();
    setBusy(true); setError('');
    const res = await updateStaffProfile(person.id, form);
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    onSaved();
  }

  async function savePassword() {
    if (newPassword.length < 6) { setError('Парол камида 6 та белгидан иборат бўлсин'); return; }
    setBusy(true); setError('');
    const res = await resetStaffPassword(person.id, newPassword);
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    setNewPassword('');
    onSaved('Парол янгиланди');
  }

  return (
    <div>
      <form onSubmit={saveProfile}>
        <div className="grid2">
          <label className="field">Ф.И.Ш.
            <input required value={form.full_name} onChange={e => setForm(v => ({ ...v, full_name: e.target.value }))} />
          </label>
          <label className="field">Роль
            <select value={form.role} onChange={e => setForm(v => ({ ...v, role: e.target.value }))}>
              <option value="teacher">Ustoz</option>
              <option value="admin">Админ</option>
            </select>
          </label>
          <label className="field">Телефон
            <input value={form.phone} onChange={e => setForm(v => ({ ...v, phone: e.target.value }))} />
          </label>
          <label className="field">Email
            <input value={person.email || ''} disabled style={{ opacity: 0.6 }} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>Сақлаш</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Ёпиш</button>
        </div>
      </form>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
        <label className="field">Янги парол ўрнатиш
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Янги парол" />
            <button type="button" className="btn btn-primary btn-sm" onClick={savePassword} disabled={busy}><KeyRound size={14} /> Ўрнатиш</button>
          </div>
        </label>
      </div>

      {error && <p style={{ color: 'var(--brick)', fontSize: 12.5, marginTop: 10 }}>{error}</p>}
    </div>
  );
}

export function Staff({ locale = 'ru', onStaffChanged }) {
  const [staff, setStaff] = useState(null);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | person object (edit)

  async function reload() {
    const res = await listStaff();
    if (!res.ok) { setError(res.error); return; }
    setStaff(res.staff);
    setError('');
    onStaffChanged?.(); // keep Groups/Teachers pages' teacher list in sync
  }

  useEffect(() => { reload(); }, []);

  async function toggleActive(person) {
    await setStaffActive(person.id, !person.is_active);
    reload();
  }

  async function remove(person) {
    if (!confirm(`${person.full_name} ҳисобини бутунлай ўчирасизми? Бу қайтарилмайди.`)) return;
    await deleteStaff(person.id);
    reload();
  }

  return (
    <section className="content">
      <PageHead title={tr(locale, 'staff')} sub={tr(locale, 'subStaff')}>
        <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={16} /> Yangi hisob</button>
      </PageHead>

      {error && <div className="card" style={{ padding: 16, color: 'var(--brick)', fontSize: 13 }}>{error}</div>}

      {staff && (
        <div className="cardgrid">
          {staff.map(p => (
            <div className="teachercard" key={p.id}>
              <div className="teacherhero">
                <div className="avatar lg">{initials(p.full_name)}</div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: 15.5 }}>{p.full_name}</h3>
                  <p>{p.email}</p>
                </div>
                <span className="chip">{ROLE_LABEL[p.role] || p.role}</span>
              </div>
              <div className="contactline">{p.phone || '—'}</div>
              <p style={{ fontSize: 12, color: p.is_active ? 'var(--emerald-deep)' : 'var(--brick)', marginTop: 4 }}>
                {p.is_active ? 'Faol' : 'Faol emas (kira olmaydi)'}
              </p>
              <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setModal(p)}><Pencil size={13} /> Таҳрирлаш</button>
                <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(p)}>
                  {p.is_active ? <><ShieldOff size={13} /> Тўхтатиш</> : <><ShieldCheck size={13} /> Фаоллаштириш</>}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => remove(p)}><Trash2 size={13} /> Ўчириш</button>
              </div>
            </div>
          ))}
          {staff.length === 0 && (
            <div className="card" style={{ padding: 24, color: 'var(--ink-faint)', fontSize: 13 }}>
              <UserCog size={18} style={{ marginBottom: 8 }} /><br />
              Ҳали ustoz/admin ҳисоби йўқ. "Yangi hisob" тугмасидан яратинг.
            </div>
          )}
        </div>
      )}

      {modal === 'new' && (
        <Modal title="Янги ходим ҳисоби" onClose={() => setModal(null)}>
          <CreateForm onCancel={() => setModal(null)} onCreated={() => { setModal(null); reload(); }} />
        </Modal>
      )}
      {modal && modal !== 'new' && (
        <Modal title={modal.full_name} onClose={() => setModal(null)}>
          <EditForm person={modal} onCancel={() => setModal(null)} onSaved={() => { setModal(null); reload(); }} />
        </Modal>
      )}
    </section>
  );
}
