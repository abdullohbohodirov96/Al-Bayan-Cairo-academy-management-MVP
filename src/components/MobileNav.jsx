import { LayoutDashboard, Users, WalletCards, CalendarClock, Menu } from 'lucide-react';
import { tr } from '../i18n.js';

const items = [
  ['overview', LayoutDashboard],
  ['students', Users],
  ['payments', WalletCards],
  ['schedule', CalendarClock],
];

export function MobileNav({ page, setPage, locale, allowedPages, onMore }) {
  const visible = items.filter(([key]) => allowedPages.includes(key));
  const rest = allowedPages.filter(k => !visible.some(([vk]) => vk === k));
  return (
    <nav className="mobilenav">
      <ul>
        {visible.map(([key, Icon]) => (
          <li key={key}>
            <button className={page === key ? 'active' : ''} onClick={() => setPage(key)}>
              <Icon size={19} />
              <span>{tr(locale, key)}</span>
            </button>
          </li>
        ))}
        {rest.length > 0 && (
          <li>
            <button onClick={onMore}>
              <Menu size={19} />
              <span>Ещё</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
