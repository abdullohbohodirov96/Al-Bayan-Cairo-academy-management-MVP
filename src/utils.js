const CURRENCY_WORD = { ru: 'сум', uz: 'so‘m', ar: 'سوم', en: 'UZS' };
const MONTH_SHORT = {
  ru: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  uz: ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'],
  ar: ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export function money(v, locale = 'ru') {
  // Amounts stay in plain Western digits (0-9) in every language — mixing
  // digit scripts with money/phone/ID formatting causes more confusion
  // than it solves — but the currency word and digit grouping follow
  // the interface language.
  const grouped = new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'ru-RU').format(Math.round(v || 0));
  const word = CURRENCY_WORD[locale] || CURRENCY_WORD.ru;
  return `${grouped} ${word}`;
}
export function shortDate(iso, locale = 'ru') {
  const d = new Date(iso + 'T00:00:00');
  const months = MONTH_SHORT[locale] || MONTH_SHORT.ru;
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  return locale === 'en' ? `${month} ${day}` : `${day} ${month}`;
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
