# Al-Bayan Academy OS — competitor audit

Research date: 2026-08-19.

This is not a claim to cover every school-management product in existence. The benchmark focuses on representative tutoring/language-school products whose workflows are directly relevant to Al-Bayan.

## 1. TutorCruncher
Official: https://tutorcruncher.com/features

What stands out:
- CRM/client management and sales pipeline
- Calendar and scheduling with automated reminders
- Billing, invoicing and tutor payroll
- Payment integrations
- Automated email/SMS communication
- Business analytics and role/security foundations

Frontend/UX takeaway: operational dashboard with a lot of data. Powerful, but Al-Bayan should keep fewer actions visible at once.

What Al-Bayan adopts now: student CRM, billing control, roles, reminder automation, dashboard metrics.

## 2. Teachworks
Official: https://www.teachworks.com/tutoring-management-software

What stands out:
- student and family records
- scheduling and attendance
- lesson notes
- invoices/payments
- automated email and optional SMS lesson reminders
- integrations such as accounting/calendar tools

Frontend/UX takeaway: straightforward admin workflows. Good reference for fast daily operations rather than decorative dashboards.

What Al-Bayan adopts now: attendance workflow, parent/contact field, lightweight daily actions, message log foundation.

## 3. Teach 'n Go
Official: https://www.teachngo.com/solutions/language-school-management-software
Official multilingual documentation: https://intercom.help/teach-n-go/en/articles/4873602-teach-n-go-is-multilingual

What stands out:
- language-school-specific scheduling
- attendance, payments and messaging
- teacher availability/conflict handling
- student/parent portal
- reports
- multiple locations/programs
- 24 interface languages according to their 2026 help center

Frontend/UX takeaway: modern, friendly, accessible across web/mobile. Multi-language is treated as a first-class product feature.

What Al-Bayan adopts now: RU/UZ/AR language-ready shell, RTL support, branches, schedule/conflict-ready data model, portal-ready roadmap.

## 4. Classcard
Official: https://www.classcardapp.com/
Features: https://www.classcardapp.com/features

What stands out:
- very lightweight class-management UX
- calendar and attendance
- online booking/self-booking
- memberships and fees
- automated reminders and segmentation
- lead management and follow-up tasks
- branded student web app/PWA
- grade books and course resources

Frontend/UX takeaway: strongest reference for Al-Bayan's lightweight admin frontend. Avoid heavy charts and keep scheduling/CRM actions close to the record.

What Al-Bayan adopts now: light visual system, lead pipeline, reminders, compact cards/tables.

## 5. TutorBird
Official: https://www.tutorbird.com/pricing/

What stands out:
- student profiles and family contacts
- attendance and scheduling
- automatic invoicing and online payments
- overdue reminders and late-fee automation
- email/SMS messaging
- student portal
- tutor roles, schedules and payroll tracking

Frontend/UX takeaway: calendar-centric and friendly for small/medium tutoring teams.

What Al-Bayan adopts now: contacts, payment due dates, reminders, teacher load cards, portal-ready data model.

## 6. Classpro
Official: https://www.classpro.in/
Fee-management tour: https://www.classpro.in/tour

What stands out:
- fee installment tracking
- automatic SMS reminders before due dates
- online fees/receipts
- biometric attendance options
- lead/enquiry management
- exams/performance
- student/parent app
- notifications/reminders

Frontend/UX takeaway: rich coaching-center operations, though Al-Bayan should expose only the most common workflows in the default UI.

What Al-Bayan adopts now: payment reminder rules, lead follow-up, fee status, queue/log model.


## Existing Al-Bayan student-facing platform
Official: https://www.al-bayanacademy.com/

The public academy experience already exposes a learning layer with registration, payment/receipt flow, video lessons, downloadable PDF materials, assessments with teacher feedback, live speaking class booking, community posts, admin chat and a student dashboard.

Product implication: the management MVP should not become a second heavy LMS. It should become the **operations source of truth** (students, groups, attendance, billing, reminders, teachers, leads), and later expose selected data to the student/teacher portal. That keeps the admin frontend fast while preserving the richer learning experience for students.

## Common pattern across the market

The repeated core is:
1. Student CRM + contacts
2. Leads/admissions pipeline
3. Groups, levels and teachers
4. Schedule + conflict checks
5. Attendance
6. Billing/payments/receipts
7. Automated reminders and communication
8. Student/parent portal
9. Analytics/reports
10. Roles, audit and integrations

## Al-Bayan MVP 0.2 product decision

Implemented now:
- Overview dashboard
- Students CRM
- Prefix autocomplete search across students/teachers/groups/leads
- Cyrillic → Latin normalization for name search (`АБД` → `abd`)
- Payments and partial-payment display
- Groups/levels
- Teachers and load
- Attendance marking UI
- Schedule
- Leads pipeline
- Reminder rules + SMS preview + queue/log UX
- Supabase schema for lessons, leads, branches, contacts and notification queue
- Edge Function adapter for future SMS provider
- RU/UZ/AR interface shell with RTL readiness
- Competitor benchmark inside the app

Next logical layer:
- Supabase client wiring + real authentication
- real payment rows/receipts/installments
- SMS provider credentials and delivery webhooks
- student/parent portal
- teacher portal
- exam/gradebook/homework if Al-Bayan needs a learning layer, not only operations
- import/export (Excel/CSV)
- audit log UI
- calendar drag/drop only if scheduling volume justifies the added frontend weight
