import { useState } from 'react';
import { LogIn, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { LogoMark } from '../components/LogoMark.jsx';
import { accounts } from '../roles.js';
import { supabase, supabaseEnabled } from '../supabaseClient.js';
import { tr, localeNames } from '../i18n.js';

function LangPicker({ locale, setLocale }) {
  if (!setLocale) return null;
  return (
    <select className="langswitch loginlang" value={locale} onChange={e => setLocale(e.target.value)} aria-label={tr(locale, 'language')}>
      {Object.entries(localeNames).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
    </select>
  );
}

function DemoLogin({ onLogin, locale, setLocale }) {
  const [picked, setPicked] = useState(accounts[0].id);
  function submit(e) {
    e.preventDefault();
    onLogin(accounts.find(a => a.id === picked));
  }
  return (
    <form className="logincard" onSubmit={submit}>
      <LangPicker locale={locale} setLocale={setLocale} />
      <LogoMark className="loginmark" />
      <h1>Аль-Баян</h1>
      <p>{tr(locale, 'loginSubtitleDemo')}</p>
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
        <LogIn size={16} /> {tr(locale, 'login')}
      </button>
      <div className="loginfoot"><ShieldCheck size={13} /> {tr(locale, 'roleNote')}</div>
    </form>
  );
}

function SupabaseLogin({ locale, setLocale }) {
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
      // rate-limited, network issue, etc.) instead of one generic message —
      // makes it possible to tell these apart while setting accounts up.
      setError(authError.message || tr(locale, 'genericAuthError'));
    }
    // On success, App.jsx's onAuthStateChange listener picks up the session.
  }

  return (
    <form className="logincard" onSubmit={submit}>
      <LangPicker locale={locale} setLocale={setLocale} />
      <LogoMark className="loginmark" />
      <h1>Аль-Баян</h1>
      <p>{tr(locale, 'loginSubtitle')}</p>

      <div className="loginlist" style={{ gap: 10 }}>
        <label className="field">{tr(locale, 'email')}
          <input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="ceo@albayan.uz" />
        </label>
        <label className="field">{tr(locale, 'password')}
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              required autoComplete="current-password"
              value={password} onChange={e => setPassword(e.target.value)}
              style={{ paddingInlineEnd: 38 }}
            />
            <button
              type="button" onClick={() => setShowPassword(v => !v)}
              className="pwdtoggle" aria-label={showPassword ? tr(locale, 'hidePassword') : tr(locale, 'showPassword')}
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
        <LogIn size={16} /> {loading ? tr(locale, 'loggingIn') : tr(locale, 'login')}
      </button>
      <div className="loginfoot"><ShieldCheck size={13} /> {tr(locale, 'roleNote')}</div>
    </form>
  );
}

export function Login({ onLogin, locale = 'uz', setLocale }) {
  return (
    <div className="loginwrap">
      {supabaseEnabled ? <SupabaseLogin locale={locale} setLocale={setLocale} /> : <DemoLogin onLogin={onLogin} locale={locale} setLocale={setLocale} />}
    </div>
  );
}
