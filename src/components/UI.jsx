import { X } from 'lucide-react';
import { initials } from '../utils.js';

export function Avatar({ s, size = '' }) {
  return <div className={'avatar ' + size}>{s.avatar || initials(s.name)}</div>;
}

export function PageHead({ title, sub, children }) {
  return (
    <div className="pagehead">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="pagehead-actions">{children}</div>}
    </div>
  );
}

export function Progress({ value, label }) {
  return (
    <div>
      <div className="bar"><i style={{ width: Math.min(100, value) + '%' }} /></div>
      {label && <div className="barlabel"><span>{label}</span></div>}
    </div>
  );
}

export function StatCard({ icon: Icon, tone = '', value, label, delta, down }) {
  return (
    <div className={'statcard ' + tone}>
      <div className="icon"><Icon size={17} /></div>
      <b>{value}</b>
      <div className="label">{label}</div>
      {delta && <div className={'delta' + (down ? ' down' : '')}>{delta}</div>}
    </div>
  );
}

export function Donut({ value }) {
  const r = 46, c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="donutwrap">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="12" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke="var(--emerald)" strokeWidth="12"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="66" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="22" fontWeight="700" fill="var(--ink)">
          {value}%
        </text>
      </svg>
    </div>
  );
}

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modalscrim" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        <div className="modalhead">
          <h3>{title}</h3>
          <button className="closebtn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modalbody">{children}</div>
        {footer && <div className="modalfoot">{footer}</div>}
      </div>
    </div>
  );
}
