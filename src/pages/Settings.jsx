import { Languages, Building2, Database, LogOut } from 'lucide-react';
import { PageHead, Avatar } from '../components/UI.jsx';

export function SettingsPage({ account, locale, setLocale, onLogout }) {
  return (
    <section className="content">
      <PageHead title="Настройки" sub="Аккаунт, язык интерфейса и интеграции" />
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
            <div><b>Язык интерфейса</b><br /><span style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>RU / UZ / AR, с поддержкой RTL</span></div>
            <select value={locale} onChange={e => setLocale(e.target.value)}>
              <option value="ru">Русский</option><option value="uz">O‘zbek</option><option value="ar">العربية</option>
            </select>
          </div>
          <div className="settingrow">
            <div className="settingicon"><Building2 size={16} /></div>
            <div><b>Филиалы</b><br /><span style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>Cairo Main · Nasr City</span></div>
            <button className="btn btn-ghost btn-sm" style={{ marginInlineStart: 'auto' }}>Управлять</button>
          </div>
        </div>

        <div className="card">
          <div className="cardhead"><div><h3>Интеграции</h3><p>Секреты хранятся только на сервере</p></div><Database size={17} /></div>
          <div className="integration"><span className="dot ok" /><b>Supabase</b><span>Схема готова</span></div>
          <div className="integration"><span className="dot" /><b>SMS-провайдер</b><span>Нужны API-ключи</span></div>
          <div className="integration"><span className="dot" /><b>Платёжный шлюз</b><span>Следующий этап</span></div>
          <div className="integration"><span className="dot" /><b>Портал ученика</b><span>Следующий этап</span></div>
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
    </section>
  );
}
