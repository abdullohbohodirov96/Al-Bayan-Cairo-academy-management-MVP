import { useState } from 'react';
import { LogIn, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Rosette } from '../components/Rosette.jsx';
import { accounts } from '../roles.js';
import { supabase, supabaseEnabled } from '../supabaseClient.js';

function DemoLogin({ onLogin }) {
  const [picked, setPicked] = useState(accounts[0].id);
  function submit(e) {
    e.preventDefault();
    onLogin(accounts.find(a => a.id === picked));
  }
  return (
    <form className="logincard" onSubmit={submit}>
      <Rosette className="loginmark" />
      <h1>Аль-Баян</h1>
      <p>Academy OS · тизимга киришни танланг (демо)</p>
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
  );
}

function SupabaseLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      // Show Supabase's actual reason (wrong password vs unconfirmed email vs
      // rate-limited, etc.) instead of a single generic message — makes it
      // possible to tell these apart while setting accounts up.
      setError(authError.message || 'Email ёки пароль нотўғри');
    }
    // On success, App.jsx's onAuthStateChange listener picks up the session.
  }

  return (
    <form className="logincard" onSubmit={submit}>
      <Rosette className="loginmark" />
      <h1>Аль-Баян</h1>
      <p>Academy OS · тизимга киринг</p>

      <div className="loginlist" style={{ gap: 10 }}>
        <label className="field">Email
          <input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="ceo@albayan.uz" />
        </label>
        <label className="field">Пароль
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              required autoComplete="current-password"
              value={password} onChange={e => setPassword(e.target.value)}
              style={{ paddingInlineEnd: 38 }}
            />
            <button
              type="button" onClick={() => setShowPassword(v => !v)}
              className="pwdtoggle" aria-label={showPassword ? 'Паролни яшириш' : 'Паролни кўрсатиш'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </label>
      </div>

      {error && (
        <div className="loginfoot" style={{ color: 'var(--brick)' }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
        <LogIn size={16} /> {loading ? 'Текширилмоқда…' : 'Кириш'}
      </button>
      <div className="loginfoot"><ShieldCheck size={13} /> Ҳар бир роль фақат ўзига керакли бўлимларни кўради</div>
    </form>
  );
}

export function Login({ onLogin }) {
  return (
    <div className="loginwrap">
      {supabaseEnabled ? <SupabaseLogin /> : <DemoLogin onLogin={onLogin} />}
    </div>
  );
}
