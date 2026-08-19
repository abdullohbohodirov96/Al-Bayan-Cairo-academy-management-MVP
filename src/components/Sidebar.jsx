import {
  LayoutDashboard, Users, WalletCards, Layers, GraduationCap, UserCheck,
  CalendarClock, Target, BellRing, BarChart3, Settings, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { Rosette } from './Rosette.jsx';
import { tr } from '../i18n.js';

const groups = [
  { label: 'Работа', items: [
    ['overview', LayoutDashboard], ['students', Users], ['payments', WalletCards],
  ]},
  { label: 'Учебный процесс', items: [
    ['groups', Layers], ['teachers', GraduationCap], ['attendance', UserCheck], ['schedule', CalendarClock],
  ]},
  { label: 'Рост', items: [
    ['leads', Target], ['reminders', BellRing], ['analytics', BarChart3],
  ]},
];

export function Sidebar({ page, setPage, locale, allowedPages, railMode, setRailMode, mobileOpen, setMobileOpen }) {
  const visibleGroups = groups
    .map(g => ({ ...g, items: g.items.filter(([key]) => allowedPages.includes(key)) }))
    .filter(g => g.items.length);
  return (
    <>
      <aside className={'sidebar' + (mobileOpen ? ' open' : '')}>
        <div className="brand">
          <Rosette className="brandmark" />
          <div className="brandtext">
            <b>Аль-Баян</b>
            <span>Academy OS</span>
          </div>
        </div>
        <nav className="nav">
          {visibleGroups.map(g => (
            <div key={g.label}>
              <div className="navlabel">{g.label}</div>
              {g.items.map(([key, Icon]) => (
                <button
                  key={key}
                  className={'navitem' + (page === key ? ' active' : '')}
                  onClick={() => { setPage(key); setMobileOpen(false); }}
                >
                  <Icon size={18} />
                  <span>{tr(locale, key)}</span>
                </button>
              ))}
            </div>
          ))}
          {allowedPages.includes('settings') && (
            <>
              <div className="navlabel">Система</div>
              <button className={'navitem' + (page === 'settings' ? ' active' : '')} onClick={() => { setPage('settings'); setMobileOpen(false); }}>
                <Settings size={18} />
                <span>{tr(locale, 'settings')}</span>
              </button>
            </>
          )}
        </nav>
        <div className="sidebarfoot">
          <button className="railtoggle" onClick={() => setRailMode(v => !v)}>
            {railMode ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            <span>Свернуть меню</span>
          </button>
        </div>
      </aside>
      <div className={'drawerscrim' + (mobileOpen ? ' show' : '')} onClick={() => setMobileOpen(false)} />
    </>
  );
}
