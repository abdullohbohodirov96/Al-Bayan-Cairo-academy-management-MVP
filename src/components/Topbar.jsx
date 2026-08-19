import { Menu, BellRing } from 'lucide-react';
import { SearchBox } from './SearchBox.jsx';
import { tr, localeNames } from '../i18n.js';

export function Topbar({ locale, setLocale, account, query, setQuery, dataset, onOpenRecord, onMenu, unread, onLogout }) {
  return (
    <header className="topbar">
      <button className="hamburger" onClick={onMenu} aria-label="Меню">
        <Menu size={20} />
      </button>
      <div className="topbar-search">
        <SearchBox
          query={query}
          setQuery={setQuery}
          dataset={dataset}
          onOpenRecord={onOpenRecord}
          placeholder={tr(locale, 'search')}
        />
      </div>
      <div className="topbar-right">
        {setLocale && (
          <select className="langswitch" value={locale} onChange={e => setLocale(e.target.value)} aria-label={tr(locale, 'language')}>
            {Object.entries(localeNames).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
          </select>
        )}
        <button className="iconbtn" aria-label="Уведомления">
          <BellRing size={16} />
          {unread > 0 && <span className="dot" />}
        </button>
        <button className="who" onClick={onLogout} title="Чиқиш">
          <div className="avatar sm">{account.avatar}</div>
          <div className="role">
            <b>{account.name.split(' ')[0]}</b>
            <span>{account.roleLabel}</span>
          </div>
        </button>
      </div>
    </header>
  );
}
