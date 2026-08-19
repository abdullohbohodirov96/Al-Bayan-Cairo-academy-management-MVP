export const seedStudents = [
  {id:'AB-1042',name:'Muhammadali Karimov',phone:'+998 90 123 45 67',parent:'Karimov Akmal',level:'B2',month:8,start:'2025-12-03',fee:450000,paid:true,paidAmount:450000,due:'2026-08-25',teacher:'Ustoz Ahmad',group:'B2 — Evening',attendance:94,status:'active',avatar:'MK',branch:'Cairo Main'},
  {id:'AB-1037',name:'Maryam Abdullayeva',phone:'+998 91 222 31 44',parent:'Abdullayeva Zebo',level:'A2',month:5,start:'2026-03-10',fee:450000,paid:false,paidAmount:0,due:'2026-08-18',teacher:'Ustoz Yusuf',group:'A2 — Morning',attendance:88,status:'overdue',avatar:'MA',branch:'Cairo Main'},
  {id:'AB-1019',name:'Abdulloh Saidov',phone:'+998 93 555 09 12',parent:'Saidov Ilhom',level:'C1',month:14,start:'2025-06-02',fee:550000,paid:true,paidAmount:550000,due:'2026-08-27',teacher:'Ustoz Ahmad',group:'C1 — Evening',attendance:97,status:'active',avatar:'AS',branch:'Nasr City'},
  {id:'AB-1061',name:'Zaynab Tursunova',phone:'+998 95 808 11 20',parent:'Tursunov Farruh',level:'A1',month:2,start:'2026-07-04',fee:400000,paid:true,paidAmount:400000,due:'2026-08-30',teacher:'Ustoz Hamza',group:'A1 — Weekend',attendance:100,status:'active',avatar:'ZT',branch:'Cairo Main'},
  {id:'AB-0998',name:'Omar Nematov',phone:'+998 99 777 60 31',parent:'Nematov Rustam',level:'B1',month:21,start:'2024-12-15',fee:500000,paid:false,paidAmount:200000,due:'2026-08-20',teacher:'Ustoz Yusuf',group:'B1 — Evening',attendance:79,status:'overdue',avatar:'ON',branch:'Nasr City'},
  {id:'AB-1050',name:'Fatima Rahimova',phone:'+998 97 444 16 88',parent:'Rahimov Aziz',level:'A2',month:7,start:'2026-02-01',fee:450000,paid:true,paidAmount:450000,due:'2026-08-22',teacher:'Ustoz Hamza',group:'A2 — Morning',attendance:92,status:'active',avatar:'FR',branch:'Cairo Main'},
  {id:'AB-1074',name:'Ahmad Abdusattorov',phone:'+998 90 801 10 74',parent:'Abdusattorov Siroj',level:'A1',month:1,start:'2026-08-03',fee:400000,paid:false,paidAmount:0,due:'2026-08-21',teacher:'Ustoz Hamza',group:'A1 — Weekend',attendance:86,status:'overdue',avatar:'AA',branch:'Cairo Main'},
  {id:'AB-1075',name:'Abdurahmon Aliyev',phone:'+998 93 601 20 75',parent:'Aliyev Mansur',level:'A1',month:1,start:'2026-08-04',fee:400000,paid:true,paidAmount:400000,due:'2026-09-04',teacher:'Ustoz Salim',group:'A1 — Intensive',attendance:96,status:'active',avatar:'AA',branch:'Nasr City'},
  {id:'AB-1076',name:'Abdulloh Abdurazzaq',phone:'+998 95 701 30 76',parent:'Abdurazzaq Mahmud',level:'B1',month:3,start:'2026-06-14',fee:500000,paid:false,paidAmount:0,due:'2026-08-19',teacher:'Ustoz Yusuf',group:'B1 — Evening',attendance:90,status:'overdue',avatar:'AA',branch:'Nasr City'},
  {id:'AB-1077',name:'Amina Abduqodirova',phone:'+998 97 501 40 77',parent:'Abduqodirov Kamol',level:'A2',month:4,start:'2026-05-21',fee:450000,paid:true,paidAmount:450000,due:'2026-08-21',teacher:'Ustoz Ahmad',group:'A2 — Speaking',attendance:98,status:'active',avatar:'AA',branch:'Cairo Main'}
];

export const seedTeachers = [
  {id:'T-01',name:'Ustoz Ahmad',groups:3,students:38,phone:'+998 90 111 22 33',status:'online',speciality:'Nahv · Sarf · Speaking',load:78},
  {id:'T-02',name:'Ustoz Yusuf',groups:4,students:44,phone:'+998 91 444 55 66',status:'online',speciality:'A1–B1 · Quranic Arabic',load:91},
  {id:'T-03',name:'Ustoz Hamza',groups:2,students:26,phone:'+998 93 777 88 99',status:'offline',speciality:'A1–A2 · Foundation',load:62},
  {id:'T-04',name:'Ustoz Salim',groups:2,students:21,phone:'+998 95 333 44 55',status:'online',speciality:'Intensive · Conversation',load:55}
];

export const seedGroups = [
  {id:'G-01',name:'A1 — Weekend',level:'A1',teacher:'Ustoz Hamza',schedule:'Сб / Вс · 10:00',room:'Room 1',students:14,capacity:18,branch:'Cairo Main'},
  {id:'G-02',name:'A2 — Morning',level:'A2',teacher:'Ustoz Hamza',schedule:'Пн / Ср / Пт · 09:00',room:'Room 2',students:16,capacity:18,branch:'Cairo Main'},
  {id:'G-03',name:'B1 — Evening',level:'B1',teacher:'Ustoz Yusuf',schedule:'Пн / Ср / Пт · 18:30',room:'Room 4',students:17,capacity:20,branch:'Nasr City'},
  {id:'G-04',name:'B2 — Evening',level:'B2',teacher:'Ustoz Ahmad',schedule:'Вт / Чт · 19:00',room:'Room 3',students:13,capacity:18,branch:'Cairo Main'},
  {id:'G-05',name:'C1 — Evening',level:'C1',teacher:'Ustoz Ahmad',schedule:'Вт / Чт · 20:30',room:'Room 3',students:11,capacity:16,branch:'Nasr City'},
  {id:'G-06',name:'A1 — Intensive',level:'A1',teacher:'Ustoz Salim',schedule:'Пн–Чт · 14:00',room:'Room 5',students:12,capacity:16,branch:'Nasr City'},
  {id:'G-07',name:'A2 — Speaking',level:'A2',teacher:'Ustoz Ahmad',schedule:'Сб · 16:00',room:'Room 2',students:9,capacity:14,branch:'Cairo Main'}
];

export const seedLessons = [
  {id:'L-01',date:'2026-08-19',time:'09:00',group:'A2 — Morning',teacher:'Ustoz Hamza',room:'Room 2',count:16,status:'done'},
  {id:'L-02',date:'2026-08-19',time:'14:00',group:'A1 — Intensive',teacher:'Ustoz Salim',room:'Room 5',count:12,status:'active'},
  {id:'L-03',date:'2026-08-19',time:'18:30',group:'B1 — Evening',teacher:'Ustoz Yusuf',room:'Room 4',count:17,status:'planned'},
  {id:'L-04',date:'2026-08-20',time:'14:00',group:'A1 — Intensive',teacher:'Ustoz Salim',room:'Room 5',count:12,status:'planned'},
  {id:'L-05',date:'2026-08-20',time:'19:00',group:'B2 — Evening',teacher:'Ustoz Ahmad',room:'Room 3',count:13,status:'planned'},
  {id:'L-06',date:'2026-08-20',time:'20:30',group:'C1 — Evening',teacher:'Ustoz Ahmad',room:'Room 3',count:11,status:'planned'},
  {id:'L-07',date:'2026-08-21',time:'09:00',group:'A2 — Morning',teacher:'Ustoz Hamza',room:'Room 2',count:16,status:'planned'},
  {id:'L-08',date:'2026-08-21',time:'18:30',group:'B1 — Evening',teacher:'Ustoz Yusuf',room:'Room 4',count:17,status:'planned'}
];

export const seedLeads = [
  {id:'LD-201',name:'Ali Akramov',phone:'+998 90 987 10 01',source:'Instagram',level:'A1',stage:'new',next:'2026-08-19',owner:'Admin'},
  {id:'LD-202',name:'Abbos Murodov',phone:'+998 93 387 10 02',source:'Telegram',level:'A2',stage:'contacted',next:'2026-08-20',owner:'Abdulloh'},
  {id:'LD-203',name:'Aisha Nur',phone:'+20 10 555 20 03',source:'Referral',level:'A1',stage:'trial',next:'2026-08-20',owner:'Admin'},
  {id:'LD-204',name:'Hasan Karim',phone:'+998 95 287 10 04',source:'Website',level:'B1',stage:'won',next:'2026-08-18',owner:'Abdulloh'},
  {id:'LD-205',name:'Malika Ergasheva',phone:'+998 97 187 10 05',source:'Instagram',level:'A2',stage:'lost',next:'2026-08-16',owner:'Admin'}
];

export const reminderRules = [
  {id:'R-1',title:'За 3 дня до оплаты',offset:-3,enabled:true,channel:'SMS'},
  {id:'R-2',title:'В день оплаты',offset:0,enabled:true,channel:'SMS'},
  {id:'R-3',title:'Через 2 дня просрочки',offset:2,enabled:true,channel:'SMS'},
  {id:'R-4',title:'Через 7 дней просрочки',offset:7,enabled:false,channel:'SMS'}
];

export const reminderTemplates = [
  {id:'TPL-1',name:'Оплата скоро',body:'Ассаламу алайкум, {{name}}. Напоминаем: оплата {{amount}} сум за обучение в Аль-Баян до {{due_date}}. Благодарим вас.'},
  {id:'TPL-2',name:'Оплата сегодня',body:'Ассаламу алайкум, {{name}}. Сегодня срок оплаты за обучение: {{amount}} сум. Аль-Баян.'},
  {id:'TPL-3',name:'Просрочка оплаты',body:'Ассаламу алайкум, {{name}}. Оплата {{amount}} сум за обучение просрочена. Пожалуйста, свяжитесь с администрацией Аль-Баян.'}
];

export const competitors = [
  {name:'TutorCruncher',fit:'Tutoring CRM',strength:'CRM + scheduling + billing/payroll + automated email/SMS',ux:'Dense but operational',languages:'English-first',adopt:['CRM','billing','automation','roles']},
  {name:'Teachworks',fit:'Tutoring centers',strength:'Scheduling, attendance, invoicing, lesson notes, SMS reminders',ux:'Simple admin workflow',languages:'English-first',adopt:['attendance','lesson notes','SMS logs']},
  {name:"Teach ’n Go",fit:'Language schools',strength:'Scheduling, attendance, payments, messaging, reporting, portals',ux:'Modern and friendly',languages:'24 interface languages',adopt:['multilingual','portal-ready','conflict checks']},
  {name:'Classcard',fit:'Academies/classes',strength:'Calendar, self booking, attendance, fees, leads, automation',ux:'Very lightweight',languages:'English help center',adopt:['light UI','lead CRM','automation']},
  {name:'TutorBird',fit:'Tutors/centers',strength:'Student CRM, attendance, invoices, SMS, portal, payroll',ux:'Calendar-centric',languages:'English-first',adopt:['family contacts','portal-ready','late reminders']},
  {name:'Classpro',fit:'Coaching institutes',strength:'Fee installments, auto SMS, leads, attendance, exams, parent app',ux:'Feature-rich admin',languages:'Region-focused',adopt:['installments','fee reminders','lead follow-up']}
];
