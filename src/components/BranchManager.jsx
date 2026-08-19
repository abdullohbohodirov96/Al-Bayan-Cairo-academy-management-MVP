import { useState } from 'react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { Modal } from './UI.jsx';
import { tr } from '../i18n.js';

function emptyForm() { return { name: '', city: '', address: '' }; }

export function BranchManager({ branches, onSave, onDelete, onClose, locale }) {
  const [editing, setEditing] = useState(null); // branch id being edited, or 'new'
  const [form, setForm] = useState(emptyForm());

  function startAdd() { setEditing('new'); setForm(emptyForm()); }
  function startEdit(b) { setEditing(b.id); setForm({ name: b.name, city: b.city || '', address: b.address || '' }); }
  function cancelForm() { setEditing(null); setForm(emptyForm()); }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(editing === 'new' ? null : editing, form);
    cancelForm();
  }

  return (
    <Modal title={tr(locale, 'branches')} onClose={onClose}>
      <div className="branchlist">
        {branches.map(b => (
          <div className="branchrow" key={b.id}>
            <div className="branchicon"><Building2 size={15} /></div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <b>{b.name}</b>
              <div style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>{[b.city, b.address].filter(Boolean).join(' · ')}</div>
            </div>
            <button className="iconbtn sm" onClick={() => startEdit(b)} aria-label="edit"><Pencil size={14} /></button>
            <button className="iconbtn sm" onClick={() => onDelete(b.id)} aria-label="delete"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>

      {editing ? (
        <form onSubmit={submit} className="branchform">
          <label className="field">{tr(locale, 'branchName')}
            <input required value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} placeholder="Cairo Main" />
          </label>
          <label className="field">{tr(locale, 'city')}
            <input value={form.city} onChange={e => setForm(v => ({ ...v, city: e.target.value }))} placeholder="Cairo" />
          </label>
          <label className="field">{tr(locale, 'address')}
            <input value={form.address} onChange={e => setForm(v => ({ ...v, address: e.target.value }))} />
          </label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="submit" className="btn btn-primary btn-sm">{tr(locale, 'save')}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={cancelForm}>{tr(locale, 'cancel')}</button>
          </div>
        </form>
      ) : (
        <button className="btn btn-ghost btn-full" onClick={startAdd} style={{ marginTop: 10 }}><Plus size={15} /> {tr(locale, 'addBranch')}</button>
      )}
    </Modal>
  );
}
