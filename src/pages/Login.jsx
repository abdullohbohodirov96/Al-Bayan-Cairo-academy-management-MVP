import { useState } from 'react';
import { LogIn, ShieldCheck } from 'lucide-react';
import { Rosette } from '../components/Rosette.jsx';
import { accounts } from '../roles.js';

export function Login({ onLogin }) {
  const [picked, setPicked] = useState(accounts[0].id);

  function submit(e) {
    e.preventDefault();
    onLogin(accounts.find(a => a.id === picked));
  }

  return (
    <div className="loginwrap">
      <form className="logincard" onSubmit={submit}>
        <Rosette className="loginmark" />
        <h1>Аль-Баян</h1>
        <p>Academy OS · тизимга киришни танланг</p>

        <div className="loginlist">
          {accounts.map(a => (
            <label key={a.id} className={'loginrow' + (picked === a.id ? ' active' : '')}>
              <input type="radio" name="account" checked={picked === a.id} onChange={() => setPicked(a.id)} />
              <div className="avatar">{a.avatar}</div>
              <div className="logininfo">
                <b>{a.name}</b>
                <span>{a.title}</span>
              </div>
              <span className="chip">{a.roleLabel}</span>
            </label>
          ))}
        </div>

        <button type="submit" className="btn btn-primary btn-full">
          <LogIn size={16} /> Кириш
        </button>
        <div className="loginfoot"><ShieldCheck size={13} /> Ҳар бир роль фақат ўзига керакли бўлимларни кўради</div>
      </form>
    </div>
  );
}
