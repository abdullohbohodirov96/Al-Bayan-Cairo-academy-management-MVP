export const dictionaries = {
  ru:{overview:'Обзор',students:'Ученики',payments:'Оплаты',groups:'Группы',teachers:'Преподаватели',attendance:'Посещаемость',schedule:'Расписание',leads:'Лиды',reminders:'Напоминания',analytics:'Аналитика',settings:'Настройки',search:'Поиск ученика, преподавателя, группы…',welcome:'Добро пожаловать в',subtitle:'Единая лёгкая система для учебного центра.',addStudent:'Добавить ученика'},
  uz:{overview:'Bosh sahifa',students:'O‘quvchilar',payments:'To‘lovlar',groups:'Guruhlar',teachers:'Ustozlar',attendance:'Davomat',schedule:'Jadval',leads:'Lidlar',reminders:'Eslatmalar',analytics:'Analitika',settings:'Sozlamalar',search:'O‘quvchi, ustoz yoki guruh qidiring…',welcome:'Xush kelibsiz',subtitle:'O‘quv markazi uchun yagona yengil tizim.',addStudent:'O‘quvchi qo‘shish'},
  ar:{overview:'نظرة عامة',students:'الطلاب',payments:'المدفوعات',groups:'المجموعات',teachers:'المعلمون',attendance:'الحضور',schedule:'الجدول',leads:'العملاء المحتملون',reminders:'التذكيرات',analytics:'التحليلات',settings:'الإعدادات',search:'ابحث عن طالب أو معلم أو مجموعة…',welcome:'مرحباً بكم في',subtitle:'نظام خفيف وموحد لإدارة المركز التعليمي.',addStudent:'إضافة طالب'}
};

export function tr(locale,key){return dictionaries[locale]?.[key] ?? dictionaries.ru[key] ?? key}
