export function money(v) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(v)) + ' сум';
}
export function shortDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
}
export function dayDiff(iso, todayIso) {
  const a = new Date(iso + 'T00:00:00');
  const b = new Date(todayIso + 'T00:00:00');
  return Math.round((a - b) / 86400000);
}
export function todayISO() {
  return '2026-08-19';
}
export function addMonths(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}
export function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
