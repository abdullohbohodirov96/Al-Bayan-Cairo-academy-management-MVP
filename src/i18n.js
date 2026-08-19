export const dictionaries = {
  ru:{overview:'Обзор',students:'Ученики',payments:'Оплаты',groups:'Группы',teachers:'Преподаватели',attendance:'Посещаемость',schedule:'Расписание',leads:'Лиды',reminders:'Напоминания',analytics:'Аналитика',settings:'Настройки',search:'Поиск ученика, преподавателя, группы…',welcome:'Добро пожаловать в',subtitle:'Единая лёгкая система для учебного центра.',addStudent:'Добавить ученика',
    branches:'Филиалы',manage:'Управлять',addBranch:'Добавить филиал',editBranch:'Изменить филиал',branchName:'Название филиала',city:'Город',address:'Адрес',save:'Сохранить',cancel:'Отмена',delete:'Удалить',
    addGroup:'Новая группа',editGroup:'Изменить группу',groupName:'Название группы',days:'Дни занятий',time:'Время',capacity:'Вместимость',room:'Аудитория',level:'Уровень',teacher:'Преподаватель',branch:'Филиал',groupCode:'Код группы (для Telegram-бота)',
    saveAndExit:'Сохранить и выйти',present:'Есть',late:'Опоздал',absent:'Нет',chooseGroup:'Выберите группу',myGroup:'Моя группа',language:'Язык',noGroup:'У вас пока нет назначенной группы',
    mon:'Пн',tue:'Вт',wed:'Ср',thu:'Чт',fri:'Пт',sat:'Сб',sun:'Вс'},
  uz:{overview:'Bosh sahifa',students:'O‘quvchilar',payments:'To‘lovlar',groups:'Guruhlar',teachers:'Ustozlar',attendance:'Davomat',schedule:'Jadval',leads:'Lidlar',reminders:'Eslatmalar',analytics:'Analitika',settings:'Sozlamalar',search:'O‘quvchi, ustoz yoki guruh qidiring…',welcome:'Xush kelibsiz',subtitle:'O‘quv markazi uchun yagona yengil tizim.',addStudent:'O‘quvchi qo‘shish',
    branches:'Filiallar',manage:'Boshqarish',addBranch:'Filial qo‘shish',editBranch:'Filialni tahrirlash',branchName:'Filial nomi',city:'Shahar',address:'Manzil',save:'Saqlash',cancel:'Bekor qilish',delete:'O‘chirish',
    addGroup:'Yangi guruh',editGroup:'Guruhni tahrirlash',groupName:'Guruh nomi',days:'Dars kunlari',time:'Vaqt',capacity:'Sig‘im',room:'Xona',level:'Daraja',teacher:'Ustoz',branch:'Filial',groupCode:'Guruh kodi (Telegram-bot uchun)',
    saveAndExit:'Saqlash va chiqish',present:'Keldi',late:'Kechikdi',absent:'Kelmadi',chooseGroup:'Guruhni tanlang',myGroup:'Mening guruhim',language:'Til',noGroup:'Sizga hali guruh biriktirilmagan',
    mon:'Du',tue:'Se',wed:'Cho',thu:'Pa',fri:'Ju',sat:'Sha',sun:'Ya'},
  ar:{overview:'نظرة عامة',students:'الطلاب',payments:'المدفوعات',groups:'المجموعات',teachers:'المعلمون',attendance:'الحضور',schedule:'الجدول',leads:'العملاء المحتملون',reminders:'التذكيرات',analytics:'التحليلات',settings:'الإعدادات',search:'ابحث عن طالب أو معلم أو مجموعة…',welcome:'مرحباً بكم في',subtitle:'نظام خفيف وموحد لإدارة المركز التعليمي.',addStudent:'إضافة طالب',
    branches:'الفروع',manage:'إدارة',addBranch:'إضافة فرع',editBranch:'تعديل الفرع',branchName:'اسم الفرع',city:'المدينة',address:'العنوان',save:'حفظ',cancel:'إلغاء',delete:'حذف',
    addGroup:'مجموعة جديدة',editGroup:'تعديل المجموعة',groupName:'اسم المجموعة',days:'أيام الدراسة',time:'الوقت',capacity:'السعة',room:'القاعة',level:'المستوى',teacher:'المعلم',branch:'الفرع',groupCode:'رمز المجموعة (لبوت تيليجرام)',
    saveAndExit:'حفظ وخروج',present:'حاضر',late:'متأخر',absent:'غائب',chooseGroup:'اختر المجموعة',myGroup:'مجموعتي',language:'اللغة',noGroup:'لم يتم تعيين مجموعة لك بعد',
    mon:'إثنين',tue:'ثلاثاء',wed:'أربعاء',thu:'خميس',fri:'جمعة',sat:'سبت',sun:'أحد'},
  en:{overview:'Overview',students:'Students',payments:'Payments',groups:'Groups',teachers:'Teachers',attendance:'Attendance',schedule:'Schedule',leads:'Leads',reminders:'Reminders',analytics:'Analytics',settings:'Settings',search:'Search a student, teacher, group…',welcome:'Welcome to',subtitle:'One lightweight system for the academy.',addStudent:'Add student',
    branches:'Branches',manage:'Manage',addBranch:'Add branch',editBranch:'Edit branch',branchName:'Branch name',city:'City',address:'Address',save:'Save',cancel:'Cancel',delete:'Delete',
    addGroup:'New group',editGroup:'Edit group',groupName:'Group name',days:'Class days',time:'Time',capacity:'Capacity',room:'Room',level:'Level',teacher:'Teacher',branch:'Branch',groupCode:'Group code (for Telegram bot)',
    saveAndExit:'Save and exit',present:'Present',late:'Late',absent:'Absent',chooseGroup:'Choose a group',myGroup:'My group',language:'Language',noGroup:'No group assigned to you yet',
    mon:'Mon',tue:'Tue',wed:'Wed',thu:'Thu',fri:'Fri',sat:'Sat',sun:'Sun'}
};

export const localeNames = { ru:'Русский', uz:'O‘zbek', ar:'العربية', en:'English' };

export function tr(locale,key){return dictionaries[locale]?.[key] ?? dictionaries.ru[key] ?? key}

export const weekDays = ['mon','tue','wed','thu','fri','sat','sun'];

export function formatSchedule(days, time, locale) {
  if (!days || !days.length) return time || '';
  return days.map(d => tr(locale, d)).join('/') + (time ? ' · ' + time : '');
}
