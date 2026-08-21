import { useState } from 'react';
import { Languages, Building2, Database, LogOut } from 'lucide-react';
import { PageHead, Avatar } from '../components/UI.jsx';
import { BranchManager } from '../components/BranchManager.jsx';
import { tr, localeNames } from '../i18n.js';

export function SettingsPage({ account, locale, setLocale, onLogout, branches = [], onSaveBranch, onDeleteBranch }) {
  const [showBranches, setShowBranches] = useState(false);
  return (
    <section className="content">
      <PageHead title={tr(locale, 'settings')} sub={tr(locale, 'subSettings')} />
      <div className="settingsgrid">
        <div className="card">
          <div className="cardhead"><div><h3>Организация</h3><p>Базовые параметры центра</p></div><Building2 size={17} /></div>
          <div className="settingrow">
            <Avatar s={{ avatar: account.avatar, name: account.name }} />
            <div><b>{account.name}</b><br /><span style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>{account.title} · {account.roleLabel}</span></div>
            <button className="btn btn-ghost btn-sm" style={{ marginInlineStart: 'auto' }} onClick={onLogout}><LogOut size={14} /> Чиқиш</button>
          </div>
          <div className="settingrow">
            <div className="settingicon"><Languages size={16} /></div>
            <div><b>{tr(locale, 'language')}</b><br /><span style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>RU / UZ / AR / EN</span></div>
            <select value={locale} onChange={e => setLocale(e.target.value)}>
              {Object.entries(localeNames).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </div>
          <div className="settingrow">
            <div className="settingicon"><Building2 size={16} /></div>
            <div><b>{tr(locale, 'branches')}</b><br /><span style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>{branches.map(b => b.name).join(' · ')}</span></div>
            <button className="btn btn-ghost btn-sm" style={{ marginInlineStart: 'auto' }} onClick={() => setShowBranches(true)}>{tr(locale, 'manage')}</button>
          </div>
        </div>

        <div className="card">
          <div className="cardhead"><div><h3>Интеграции</h3><p>Секреты хранятся только на сервере</p></div><Database size={17} /></div>
          <div className="integration"><span className="dot ok" /><b>Supabase</b><span>Схема готова</span></div>
          <div className="integration"><span className="dot" /><b>SMS-провайдер</b><span>Нужны API-ключи</span></div>
          <div className="integration"><span className="dot" /><b>Telegram-бот</b><span>Токен получен, ждёт подключения к Supabase</span></div>
          <div className="integration"><span className="dot" /><b>Платёжный шлюз</b><span>Следующий этап</span></div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="archnote">
            <Database size={20} color="var(--emerald-deep)" />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 14.5 }}>Как устроены SMS-напоминания</h3>
              <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>
                Фронтенд только показывает правила и очередь. Отправку выполняет серверная функция — ключ провайдера в браузер никогда не попадает.
              </p>
              <code>оплата → правило → notification_jobs → Edge Function → SMS-провайдер → журнал</code>
            </div>
          </div>
        </div>
      </div>

      {showBranches && (
        <BranchManager
          branches={branches}
          locale={locale}
          onSave={onSaveBranch}
          onDelete={onDeleteBranch}
          onClose={() => setShowBranches(false)}
        />
      )}
    </section>
  );
}
