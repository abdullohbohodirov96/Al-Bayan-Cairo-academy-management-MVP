export const accounts = [
  { id: 'ceo', role: 'ceo', roleLabel: 'CEO', name: 'Абдуллох Бохадиров', title: 'Асосчи · CEO', avatar: 'АБ' },
  { id: 'admin', role: 'admin', roleLabel: 'Админ', name: 'Зилола Рахимова', title: 'Бош администратор', avatar: 'ЗР' },
  { id: 'teacher', role: 'teacher', roleLabel: 'Ustoz', name: 'Ustoz Ahmad', title: 'Преподаватель', avatar: 'УА' },
];

// Which nav pages each role can open. Order here defines nav order.
export const rolePages = {
  ceo: ['overview', 'students', 'payments', 'groups', 'teachers', 'attendance', 'schedule', 'leads', 'reminders', 'analytics', 'settings'],
  admin: ['overview', 'students', 'payments', 'groups', 'teachers', 'attendance', 'schedule', 'leads', 'reminders', 'settings'],
  teacher: ['overview', 'students', 'attendance', 'schedule'],
};

// Whether the signed-in role can change money / SMS / records, or only view them.
export const roleCanEdit = {
  ceo: true,
  admin: true,
  teacher: false,
};

export function defaultPageFor(role) {
  return rolePages[role]?.[0] || 'overview';
}
