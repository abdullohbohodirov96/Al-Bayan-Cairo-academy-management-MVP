import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {
  LayoutDashboard,Users,WalletCards,GraduationCap,CalendarDays,BarChart3,Settings,Search,Plus,
  ChevronRight,Clock3,CheckCircle2,AlertCircle,Menu,X,BookOpen,ShieldCheck,ArrowUpRight,
  UserRoundCheck,ClipboardCheck,UserPlus,MessageSquareText,FlaskConical,Send,Phone,Building2,
  Languages,Database,SlidersHorizontal,BellRing,ChevronDown,Command,RefreshCcw,Filter,MoreHorizontal,
  CircleDollarSign,CalendarClock,UserCheck,UserX,Check,Pause,Play,ExternalLink,Layers3,Target
} from 'lucide-react';
import './styles.css';
import {seedStudents,seedTeachers,seedGroups,seedLessons,seedLeads,reminderRules as seedRules,reminderTemplates,competitors} from './data.js';
import {isPrefixMatch,makeSuggestions} from './search.js';
import {tr} from './i18n.js';

const nav = [
  ['overview','overview',LayoutDashboard],['students','students',Users],['payments','payments',WalletCards],
  ['groups','groups',GraduationCap],['teachers','teachers',UserRoundCheck],['attendance','attendance',ClipboardCheck],
  ['schedule','schedule',CalendarDays],['leads','leads',UserPlus],['reminders','reminders',MessageSquareText],
  ['analytics','analytics',BarChart3],['benchmark','benchmark',FlaskConical],['settings','settings',Settings]
];
const pageTitle = {overview:'Обзор',students:'Ученики',payments:'Оплаты',groups:'Группы',teachers:'Преподаватели',attendance:'Посещаемость',schedule:'Расписание',leads:'Лиды',reminders:'Напоминания',analytics:'Аналитика',benchmark:'Бенчмарк',settings:'Настройки'};
const searchTypeLabel = {student:'Ученик',teacher:'Преподаватель',group:'Группа',lead:'Лид'};
const stageLabel = {new:'Новый',contacted:'Связались',trial:'Пробный урок',won:'Записан',lost:'Потерян'};

function money(n){return new Intl.NumberFormat('ru-RU').format(Math.max(0,Number(n)||0))+' сум'}
function shortDate(date){if(!date)return'—';return new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'short'}).format(new Date(date+'T12:00:00'))}
function initials(name=''){return name.split(/\s+/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase()}
function todayISO(){return new Date().toISOString().slice(0,10)}
function dayDiff(a,b){const x=new Date(a+'T12:00:00'),y=new Date(b+'T12:00:00');return Math.round((x-y)/86400000)}

function App(){
  const [page,setPage]=useState('overview');
  const [role,setRole]=useState('CEO');
  const [locale,setLocale]=useState('ru');
  const [mobile,setMobile]=useState(false);
  const [query,setQuery]=useState('');
  const [students,setStudents]=useState(seedStudents);
  const [leads,setLeads]=useState(seedLeads);
  const [rules,setRules]=useState(seedRules);
  const [messageLog,setMessageLog]=useState([
    {id:'M-001',student:'Maryam Abdullayeva',phone:'+998 91 222 31 44',type:'Просрочка оплаты',status:'delivered',at:'2026-08-19 09:03'},
    {id:'M-002',student:'Abdulloh Abdurazzaq',phone:'+998 95 701 30 76',type:'Оплата сегодня',status:'queued',at:'2026-08-19 10:15'}
  ]);
  const [modal,setModal]=useState(null);
  const [selected,setSelected]=useState(null);
  const [toast,setToast]=useState('');
  const [searchOpen,setSearchOpen]=useState(false);

  useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dir=locale==='ar'?'rtl':'ltr'},[locale]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),2600);return()=>clearTimeout(t)},[toast]);

  const filteredStudents=useMemo(()=>students.filter(s=>isPrefixMatch(s,query)),[students,query]);
  const stats=useMemo(()=>{
    const paid=students.filter(x=>x.paid).length;
    const overdue=students.filter(x=>!x.paid).length;
    const revenue=students.reduce((a,x)=>a+(x.paidAmount||0),0);
    const due=students.reduce((a,x)=>a+Math.max(0,x.fee-(x.paidAmount||0)),0);
    const attendance=Math.round(students.reduce((a,x)=>a+x.attendance,0)/students.length);
    return {total:students.length,paid,overdue,revenue,due,attendance};
  },[students]);

  function addStudent(e){
    e.preventDefault();const f=new FormData(e.currentTarget);const name=String(f.get('name')||'').trim();
    const s={id:'AB-'+String(1100+students.length),name,phone:f.get('phone')||'',parent:f.get('parent')||'',level:f.get('level'),month:1,start:todayISO(),fee:Number(f.get('fee')),paid:false,paidAmount:0,due:f.get('due'),teacher:f.get('teacher'),group:f.get('group'),attendance:100,status:'active',avatar:initials(name),branch:f.get('branch')};
    setStudents(v=>[s,...v]);setModal(null);setToast('Карточка ученика создана');
  }
  function togglePay(id){setStudents(v=>v.map(s=>s.id===id?{...s,paid:!s.paid,paidAmount:!s.paid?s.fee:0,status:!s.paid?'active':'overdue'}:s));setToast('Статус оплаты обновлён')}
  function sendReminder(student,type='Ручное напоминание'){
    setMessageLog(v=>[{id:'M-'+String(v.length+3).padStart(3,'0'),student:student.name,phone:student.phone,type,status:'queued',at:new Date().toLocaleString('ru-RU')},...v]);
    setToast('SMS добавлено в очередь. Провайдер подключается отдельно.');
  }
  function openResult(item){
    setQuery(item.name);setSearchOpen(false);
    if(item.type==='student'){setPage('students');setSelected(item)}
    if(item.type==='teacher')setPage('teachers');
    if(item.type==='group')setPage('groups');
    if(item.type==='lead')setPage('leads');
  }

  return <div className="app">
    <Sidebar page={page} setPage={setPage} role={role} mobile={mobile} setMobile={setMobile} stats={stats} locale={locale}/>
    <main className="main">
      <Header page={page} role={role} query={query} setQuery={setQuery} locale={locale} setLocale={setLocale} searchOpen={searchOpen} setSearchOpen={setSearchOpen} openResult={openResult} data={{students,teachers:seedTeachers,groups:seedGroups,leads}} setMobile={setMobile}/>
      {page==='overview'&&<Overview stats={stats} students={students} setPage={setPage} setModal={setModal} sendReminder={sendReminder} locale={locale}/>} 
      {page==='students'&&<Students students={filteredStudents} query={query} setModal={setModal} setSelected={setSelected} togglePay={togglePay} sendReminder={sendReminder}/>} 
      {page==='payments'&&<Payments students={filteredStudents} togglePay={togglePay} sendReminder={sendReminder}/>} 
      {page==='groups'&&<Groups groups={seedGroups}/>} 
      {page==='teachers'&&<Teachers teachers={seedTeachers}/>} 
      {page==='attendance'&&<Attendance students={students}/>} 
      {page==='schedule'&&<Schedule lessons={seedLessons}/>} 
      {page==='leads'&&<Leads leads={leads} setLeads={setLeads}/>} 
      {page==='reminders'&&<Reminders students={students} rules={rules} setRules={setRules} messageLog={messageLog} sendReminder={sendReminder}/>} 
      {page==='analytics'&&<Analytics stats={stats} students={students} leads={leads}/>} 
      {page==='benchmark'&&<Benchmark/>} 
      {page==='settings'&&<SettingsPage role={role} setRole={setRole} locale={locale} setLocale={setLocale}/>} 
    </main>
    {modal==='add'&&<Modal title="Новый ученик" close={()=>setModal(null)}><AddStudentForm addStudent={addStudent}/></Modal>}
    {selected&&<StudentDrawer s={students.find(x=>x.id===selected.id)||selected} close={()=>setSelected(null)} togglePay={togglePay} sendReminder={sendReminder}/>} 
    {toast&&<div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
  </div>
}

function Sidebar({page,setPage,role,mobile,setMobile,stats,locale}){return <aside className={'sidebar '+(mobile?'open':'')}>
  <div className="brand"><div className="brandmark">أ</div><div><b>Аль-Баян</b><span>CAIRO · ACADEMY OS</span></div><button className="mobile-x" onClick={()=>setMobile(false)}><X size={18}/></button></div>
  <div className="rolebox"><ShieldCheck size={17}/><div><small>Текущий доступ</small><strong>{role}</strong></div></div>
  <nav>{nav.map(([id,key,Icon])=><button className={page===id?'active':''} onClick={()=>{setPage(id);setMobile(false)}} key={id}><Icon size={17}/><span>{tr(locale,key)}</span>{id==='payments'&&stats.overdue>0&&<em>{stats.overdue}</em>}</button>)}</nav>
  <div className="sidebar-bottom"><div className="arabic">العلم نور</div><span>MVP 0.2 · lightweight</span></div>
</aside>}

function Header({page,role,query,setQuery,locale,setLocale,searchOpen,setSearchOpen,openResult,data,setMobile}){
  const box=useRef(null);const inputRef=useRef(null);const [active,setActive]=useState(0);
  const suggestions=useMemo(()=>makeSuggestions(query,data,8),[query,data]);
  useEffect(()=>{function outside(e){if(box.current&&!box.current.contains(e.target))setSearchOpen(false)}document.addEventListener('mousedown',outside);return()=>document.removeEventListener('mousedown',outside)},[setSearchOpen]);
  useEffect(()=>{function shortcut(e){if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearchOpen(true);setTimeout(()=>inputRef.current?.focus(),0)}}document.addEventListener('keydown',shortcut);return()=>document.removeEventListener('keydown',shortcut)},[setSearchOpen]);
  function keyDown(e){if(!searchOpen||!suggestions.length)return;if(e.key==='ArrowDown'){e.preventDefault();setActive(v=>(v+1)%suggestions.length)}if(e.key==='ArrowUp'){e.preventDefault();setActive(v=>(v-1+suggestions.length)%suggestions.length)}if(e.key==='Enter'){e.preventDefault();openResult(suggestions[active])}if(e.key==='Escape')setSearchOpen(false)}
  return <header>
    <button className="hamb" onClick={()=>setMobile(true)}><Menu size={21}/></button>
    <div className="crumb">Аль-Баян Каиро <ChevronRight size={14}/> <b>{tr(locale,page)||pageTitle[page]}</b></div>
    <div className="header-actions">
      <div className="search-wrap" ref={box}>
        <div className={'search '+(searchOpen?'focus':'')}><Search size={17}/><input ref={inputRef} aria-label="Глобальный поиск" placeholder={tr(locale,'search')} value={query} onFocus={()=>setSearchOpen(true)} onChange={e=>{setQuery(e.target.value);setSearchOpen(true);setActive(0)}} onKeyDown={keyDown}/>{query&&<button className="clear" onClick={()=>setQuery('')}><X size={14}/></button>}<kbd>⌘K</kbd></div>
        {searchOpen&&query&&<SearchSuggestions items={suggestions} active={active} openResult={openResult}/>} 
      </div>
      <select className="lang" value={locale} onChange={e=>setLocale(e.target.value)} aria-label="Язык интерфейса"><option value="ru">RU</option><option value="uz">UZ</option><option value="ar">AR</option></select>
      <div className="profile"><div className="avatar">AK</div><div><b>Абдуллах</b><span>{role}</span></div></div>
    </div>
  </header>
}

function SearchSuggestions({items,active,openResult}){return <div className="suggestions">
  <div className="suggest-head"><span><Command size={13}/> Быстрый поиск по префиксу</span><small>↑↓ выбрать · Enter открыть</small></div>
  {items.length?items.map((x,i)=><button key={x.type+x.id} className={i===active?'selected':''} onMouseDown={e=>e.preventDefault()} onClick={()=>openResult(x)}><div className="suggest-icon">{x.type==='student'?<Users size={15}/>:x.type==='teacher'?<UserRoundCheck size={15}/>:x.type==='group'?<GraduationCap size={15}/>:<UserPlus size={15}/>}</div><div className="grow"><b>{x.name}</b><span>{x.subtitle}</span></div><em>{searchTypeLabel[x.type]}</em></button>):<div className="suggest-empty">Ничего не найдено. Попробуйте имя, ID или группу.</div>}
</div>}

function Overview({stats,students,setPage,setModal,sendReminder,locale}){const attention=students.filter(s=>!s.paid||s.attendance<85);return <section className="content">
  <div className="hero"><div><div className="eyebrow">ACADEMY OPERATING SYSTEM</div><h1>{tr(locale,'welcome')} <span>Аль-Баян</span></h1><p>{tr(locale,'subtitle')}</p></div><button className="primary" onClick={()=>setModal('add')}><Plus size={18}/> {tr(locale,'addStudent')}</button></div>
  <div className="kpis"><Kpi title="Всего учеников" value={stats.total} sub="активные карточки" icon={Users}/><Kpi title="Собрано за месяц" value={money(stats.revenue)} sub={`${stats.paid} оплат`} icon={CircleDollarSign} good/><Kpi title="Ожидают оплаты" value={stats.overdue} sub={money(stats.due)} icon={AlertCircle} warn/><Kpi title="Средняя посещаемость" value={stats.attendance+'%'} sub="по текущим ученикам" icon={BarChart3}/></div>
  <div className="two">
    <div className="card"><div className="cardhead"><div><h3>Контроль оплат</h3><p>Собрано, долг и ближайшие сроки</p></div><button className="ghost" onClick={()=>setPage('payments')}>Все оплаты <ArrowUpRight size={15}/></button></div><Progress value={stats.paid/stats.total*100} label={`${Math.round(stats.paid/stats.total*100)}% учеников оплатили`}/><div className="mini-list">{students.filter(s=>!s.paid).slice(0,4).map(s=><div className="mini" key={s.id}><Avatar s={s}/><div className="grow"><b>{s.name}</b><span>{s.id} · срок {shortDate(s.due)}</span></div><strong className="due">{money(s.fee-s.paidAmount)}</strong><button className="iconbtn" title="Напомнить" onClick={()=>sendReminder(s)}><BellRing size={15}/></button></div>)}</div></div>
    <div className="card dark"><div className="cardhead"><div><h3>Сегодня в центре</h3><p>Операционный пульс</p></div><BookOpen size={20}/></div><div className="pulsegrid"><Pulse value="4" label="занятия"/><Pulse value="3" label="преподавателя"/><Pulse value="58" label="мест на уроках"/><Pulse value="2" label="просрочки"/></div><div className="notice"><Clock3 size={18}/><div><b>Следующий урок · 14:00</b><span>A1 — Intensive · Ustoz Salim · Room 5</span></div></div></div>
  </div>
  <div className="card tablecard"><div className="cardhead"><div><h3>Требуют внимания</h3><p>Просрочка или посещаемость ниже 85%</p></div><button className="ghost" onClick={()=>setPage('students')}>Открыть CRM <ArrowUpRight size={15}/></button></div><StudentTable students={attention} onOpen={()=>{}} compact/></div>
</section>}

function Kpi({title,value,sub,icon:Icon,warn,good}){return <div className="kpi"><div className={'kpiicon '+(warn?'orange ':'')+(good?'green':'')}><Icon size={19}/></div><span>{title}</span><strong>{value}</strong><small>{sub}</small></div>}
function Pulse({value,label}){return <div><strong>{value}</strong><span>{label}</span></div>}
function Progress({value,label}){return <div className="progressblock"><div className="bar"><i style={{width:`${Math.min(100,value)}%`}}/></div><div><span>{label}</span><b>Цель: 100%</b></div></div>}
function Avatar({s,large=false}){return <div className={'avatar '+(large?'large':'small')}>{s.avatar||initials(s.name)}</div>}

function Students({students,query,setModal,setSelected,togglePay,sendReminder}){return <section className="content"><PageHead eyebrow="STUDENT CRM" title="Ученики" sub="Карточки, группы, оплаты, посещаемость и контакты"><button className="primary" onClick={()=>setModal('add')}><Plus size={17}/> Добавить ученика</button></PageHead><div className="toolbar"><div className="filters"><button className="filter active">Все <b>{students.length}</b></button><button className="filter">С долгом <b>{students.filter(s=>!s.paid).length}</b></button><button className="filter">Посещаемость &lt;85% <b>{students.filter(s=>s.attendance<85).length}</b></button></div>{query&&<div className="querynote"><Search size={13}/> Префикс: <b>{query}</b></div>}</div><div className="card tablecard"><StudentTable students={students} onOpen={setSelected} togglePay={togglePay} sendReminder={sendReminder}/></div></section>}

function StudentTable({students,onOpen=()=>{},togglePay,sendReminder,compact=false}){return <div className="tablewrap">{students.length?<table><thead><tr><th>Ученик</th><th>Уровень / группа</th><th>Преподаватель</th><th>Посещаемость</th><th>Оплата</th>{!compact&&<th></th>}</tr></thead><tbody>{students.map(s=><tr key={s.id} onClick={()=>onOpen(s)}><td><div className="person"><Avatar s={s}/><div><b>{s.name}</b><span>{s.id} · {s.phone}</span></div></div></td><td><span className="level">{s.level}</span><span>{s.group}</span></td><td><b>{s.teacher}</b><span>{s.branch}</span></td><td><div className="att"><b>{s.attendance}%</b><div><i style={{width:s.attendance+'%'}}/></div></div></td><td><div className={'status '+(s.paid?'paid':'overdue')}><b>{s.paid?'Оплачено':s.paidAmount>0?'Частично':'К оплате'}</b><span>{s.paid?shortDate(s.due):money(s.fee-s.paidAmount)}</span></div></td>{!compact&&<td><div className="rowactions"><button title="SMS" onClick={e=>{e.stopPropagation();sendReminder(s)}}><BellRing size={14}/></button><button title="Изменить оплату" onClick={e=>{e.stopPropagation();togglePay(s.id)}}><WalletCards size={14}/></button><ChevronRight size={15}/></div></td>}</tr>)}</tbody></table>:<div className="empty"><Search size={24}/><b>Совпадений нет</b><span>Поиск работает по началу имени, ID, группы и других полей.</span></div>}</div>}

function Payments({students,togglePay,sendReminder}){const unpaid=students.filter(s=>!s.paid);const collected=students.reduce((a,s)=>a+s.paidAmount,0);return <section className="content"><PageHead eyebrow="BILLING" title="Оплаты" sub="Ежемесячные начисления, частичные оплаты и напоминания"/><div className="finance"><Fin title="Собрано" value={money(collected)} sub="по текущей выборке"/><Fin title="Остаток" value={money(students.reduce((a,s)=>a+Math.max(0,s.fee-s.paidAmount),0))} sub={`${unpaid.length} учеников`}/><Fin title="Ближайший срок" value={unpaid.length?shortDate([...unpaid].sort((a,b)=>a.due.localeCompare(b.due))[0].due):'—'} sub="автонапоминания включены"/></div><div className="card tablecard"><div className="cardhead"><div><h3>Платёжный реестр</h3><p>Нажмите «Напомнить», чтобы создать SMS-job</p></div><span className="chip"><Database size={13}/> Queue-ready</span></div><div className="tablewrap"><table><thead><tr><th>Ученик</th><th>Срок</th><th>Начислено</th><th>Оплачено</th><th>Статус</th><th>Действия</th></tr></thead><tbody>{students.map(s=><tr key={s.id}><td><div className="person"><Avatar s={s}/><div><b>{s.name}</b><span>{s.id} · {s.phone}</span></div></div></td><td><b>{shortDate(s.due)}</b><span>{dayDiff(s.due,todayISO())<0?'просрочено':dayDiff(s.due,todayISO())===0?'сегодня':`через ${dayDiff(s.due,todayISO())} дн.`}</span></td><td><b>{money(s.fee)}</b></td><td><b>{money(s.paidAmount)}</b></td><td><span className={'pill '+(s.paid?'success':s.paidAmount?'warning':'danger')}>{s.paid?'Оплачено':s.paidAmount?'Частично':'Ожидает'}</span></td><td><div className="rowactions"><button onClick={()=>sendReminder(s)} disabled={s.paid}><BellRing size={14}/> Напомнить</button><button onClick={()=>togglePay(s.id)}><CheckCircle2 size={14}/> {s.paid?'Отменить':'Оплачено'}</button></div></td></tr>)}</tbody></table></div></div></section>}
function Fin({title,value,sub}){return <div className="finbig"><span>{title}</span><strong>{value}</strong><small>{sub}</small></div>}

function Groups({groups}){return <section className="content"><PageHead eyebrow="ACADEMIC STRUCTURE" title="Группы и уровни" sub="Нагрузка, вместимость, преподаватели и аудитории"><button className="primary"><Plus size={16}/> Новая группа</button></PageHead><div className="groupgrid">{groups.map(g=><div className="groupcard" key={g.id}><div className="group-top"><span className="level big">{g.level}</span><span className="chip">{g.branch}</span></div><h3>{g.name}</h3><p>{g.teacher} · {g.schedule}</p><div className="groupmeta"><span><Building2 size={13}/>{g.room}</span><b>{g.students}/{g.capacity} мест</b></div><Progress value={g.students/g.capacity*100} label={`${Math.round(g.students/g.capacity*100)}% заполнено`}/></div>)}</div></section>}

function Teachers({teachers}){return <section className="content"><PageHead eyebrow="TEAM" title="Преподаватели" sub="Группы, нагрузка, специализация и контакты"><button className="primary"><Plus size={16}/> Добавить преподавателя</button></PageHead><div className="teachergrid">{teachers.map(t=><div className="card teachercard" key={t.id}><div className="teacherhero"><div className="avatar large">{initials(t.name.replace('Ustoz ',''))}</div><div className="grow"><h3>{t.name}</h3><p>{t.speciality}</p></div><span className={'dotstatus '+t.status}></span></div><div className="metricsline"><div><b>{t.groups}</b><span>групп</span></div><div><b>{t.students}</b><span>учеников</span></div><div><b>{t.load}%</b><span>нагрузка</span></div></div><div className="contactline"><Phone size={14}/>{t.phone}</div><Progress value={t.load} label="Нагрузка преподавателя"/></div>)}</div></section>}

function Attendance({students}){const [marked,setMarked]=useState(()=>Object.fromEntries(students.map((s,i)=>[s.id,i%7===0?'absent':'present'])));const present=Object.values(marked).filter(x=>x==='present').length;return <section className="content"><PageHead eyebrow="ATTENDANCE" title="Посещаемость" sub="Отметка за урок — без отдельной тяжёлой LMS"><div className="datebadge"><CalendarDays size={15}/> 19 августа 2026</div></PageHead><div className="attendance-layout"><div className="card attendance-main"><div className="cardhead"><div><h3>B1 — Evening</h3><p>Ustoz Yusuf · 18:30 · Room 4</p></div><span className="chip successchip">{present}/{students.length} присутствуют</span></div><div className="attendance-list">{students.map(s=><div className="attendance-row" key={s.id}><div className="person"><Avatar s={s}/><div><b>{s.name}</b><span>{s.id}</span></div></div><div className="segmented"><button className={marked[s.id]==='present'?'active present':''} onClick={()=>setMarked(v=>({...v,[s.id]:'present'}))}><UserCheck size={14}/> Есть</button><button className={marked[s.id]==='late'?'active late':''} onClick={()=>setMarked(v=>({...v,[s.id]:'late'}))}><Clock3 size={14}/> Опоздал</button><button className={marked[s.id]==='absent'?'active absent':''} onClick={()=>setMarked(v=>({...v,[s.id]:'absent'}))}><UserX size={14}/> Нет</button></div></div>)}</div></div><div className="card attendance-side"><h3>Сводка урока</h3><Donut value={Math.round(present/students.length*100)}/><div className="metriclist"><Metric label="Присутствуют" value={present}/><Metric label="Опоздали" value={Object.values(marked).filter(x=>x==='late').length}/><Metric label="Отсутствуют" value={Object.values(marked).filter(x=>x==='absent').length}/></div><button className="primary full"><Check size={16}/> Сохранить отметку</button></div></div></section>}

function Schedule({lessons}){const dates=[...new Set(lessons.map(x=>x.date))];return <section className="content"><PageHead eyebrow="CALENDAR" title="Расписание" sub="Уроки, аудитории и конфликты"><button className="primary"><Plus size={16}/> Новый урок</button></PageHead><div className="card schedule"><div className="schedulebar"><div><CalendarClock size={17}/><b>Неделя 17–23 августа</b></div><span className="chip"><CheckCircle2 size={13}/> Конфликтов: 0</span></div>{dates.map(date=><div className="dayblock" key={date}><div className="daylabel"><b>{shortDate(date)}</b><span>{lessons.filter(x=>x.date===date).length} занятия</span></div><div>{lessons.filter(x=>x.date===date).map(l=><div className="slot" key={l.id}><time>{l.time}</time><div className="lesson"><b>{l.group}</b><span>{l.teacher} · {l.room}</span></div><span className={'pill '+(l.status==='done'?'success':l.status==='active'?'warning':'neutral')}>{l.status==='done'?'Завершён':l.status==='active'?'Идёт':'Запланирован'}</span><span className="slotcount">{l.count} уч.</span></div>)}</div></div>)}</div></section>}

function Leads({leads,setLeads}){const stages=['new','contacted','trial','won','lost'];function advance(id){setLeads(v=>v.map(l=>{if(l.id!==id)return l;const i=stages.indexOf(l.stage);return {...l,stage:stages[Math.min(i+1,stages.length-1)]}}))}return <section className="content"><PageHead eyebrow="ADMISSIONS CRM" title="Лиды и набор" sub="От заявки до записи в группу"><button className="primary"><Plus size={16}/> Новый лид</button></PageHead><div className="pipeline">{stages.slice(0,4).map(stage=><div className="pipe" key={stage}><div className="pipehead"><b>{stageLabel[stage]}</b><span>{leads.filter(l=>l.stage===stage).length}</span></div>{leads.filter(l=>l.stage===stage).map(l=><div className="leadcard" key={l.id}><div className="person"><div className="avatar small">{initials(l.name)}</div><div><b>{l.name}</b><span>{l.id} · {l.level}</span></div></div><p><Target size={13}/>{l.source} · follow-up {shortDate(l.next)}</p><div className="leadfoot"><span>{l.owner}</span>{stage!=='won'&&<button onClick={()=>advance(l.id)}>Дальше <ChevronRight size={13}/></button>}</div></div>)}</div>)}</div></section>}

function Reminders({students,rules,setRules,messageLog,sendReminder}){const [previewId,setPreviewId]=useState(students.find(s=>!s.paid)?.id||students[0].id);const [templateId,setTemplateId]=useState(reminderTemplates[0].id);const s=students.find(x=>x.id===previewId)||students[0];const tpl=reminderTemplates.find(x=>x.id===templateId);const body=tpl.body.replace('{{name}}',s.name).replace('{{amount}}',new Intl.NumberFormat('ru-RU').format(Math.max(0,s.fee-s.paidAmount))).replace('{{due_date}}',s.due);return <section className="content"><PageHead eyebrow="AUTOMATION" title="Напоминания и SMS" sub="Правила, очередь, шаблоны и журнал отправки"><span className="provider"><span></span> Провайдер не подключён</span></PageHead><div className="remindergrid"><div className="card"><div className="cardhead"><div><h3>Правила оплаты</h3><p>Когда автоматически создавать SMS-job</p></div><SlidersHorizontal size={18}/></div>{rules.map(r=><div className="toggle" key={r.id}><div><b>{r.title}</b><small>{r.channel} · sender ALBAYAN</small></div><label className="switch"><input type="checkbox" checked={r.enabled} onChange={()=>setRules(v=>v.map(x=>x.id===r.id?{...x,enabled:!x.enabled}:x))}/><span></span></label></div>)}</div><div className="card"><div className="cardhead"><div><h3>Предпросмотр SMS</h3><p>Шаблон с переменными ученика</p></div><MessageSquareText size={18}/></div><div className="grid2 compact"><label>Ученик<select value={previewId} onChange={e=>setPreviewId(e.target.value)}>{students.map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select></label><label>Шаблон<select value={templateId} onChange={e=>setTemplateId(e.target.value)}>{reminderTemplates.map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select></label></div><div className="smsphone"><div className="smshead">ALBAYAN</div><div className="bubble">{body}</div><small>{body.length} символов · SMS preview</small></div><button className="primary full" onClick={()=>sendReminder(s,tpl.name)}><Send size={16}/> Добавить в очередь</button></div></div><div className="card tablecard"><div className="cardhead"><div><h3>Журнал сообщений</h3><p>Статусы сохраняются отдельно от UI</p></div><button className="ghost"><RefreshCcw size={14}/> Обновить</button></div><div className="tablewrap"><table><thead><tr><th>Получатель</th><th>Тип</th><th>Телефон</th><th>Время</th><th>Статус</th></tr></thead><tbody>{messageLog.map(m=><tr key={m.id}><td><b>{m.student}</b><span>{m.id}</span></td><td>{m.type}</td><td>{m.phone}</td><td>{m.at}</td><td><span className={'pill '+(m.status==='delivered'?'success':'warning')}>{m.status==='delivered'?'Доставлено':'В очереди'}</span></td></tr>)}</tbody></table></div></div></section>}

function Analytics({stats,students,leads}){const levels=['A1','A2','B1','B2','C1','C2'];const leadWon=leads.filter(l=>l.stage==='won').length;return <section className="content"><PageHead eyebrow="DECISION SUPPORT" title="Аналитика" sub="Финансы, академика и воронка набора"/><div className="analyticgrid"><div className="card chart"><div className="cardhead"><div><h3>Ученики по уровням</h3><p>Текущая структура центра</p></div></div><div className="bars">{levels.map(l=>{const count=students.filter(s=>s.level===l).length;return <div key={l}><b>{count}</b><i style={{height:`${Math.max(10,count*34)}px`}}></i><span>{l}</span></div>})}</div></div><div className="card"><div className="cardhead"><div><h3>Оплата</h3><p>Доля закрытых начислений</p></div></div><Donut value={Math.round(stats.paid/stats.total*100)}/><div className="legend"><span><i></i> Оплачено</span><span><i></i> Остаток</span></div></div><div className="card"><div className="cardhead"><div><h3>Ключевые метрики</h3><p>Для руководителя</p></div></div><div className="metriclist"><Metric label="Средняя посещаемость" value={stats.attendance+'%'}/><Metric label="Дебиторка" value={money(stats.due)}/><Metric label="Конверсия лидов" value={Math.round(leadWon/leads.length*100)+'%'}/><Metric label="ARPU" value={money(Math.round(stats.revenue/stats.total))}/></div></div></div></section>}
function Donut({value}){return <div className="donut" style={{'--value':value}}><div><b>{value}%</b><span>показатель</span></div></div>}
function Metric({label,value}){return <div><span>{label}</span><b>{value}</b></div>}

function Benchmark(){const features=['CRM','Расписание','Посещаемость','Оплаты','SMS/автоматизация','Лиды','Портал','Мультиязычность'];const support={TutorCruncher:[1,1,1,1,1,1,1,0],Teachworks:[1,1,1,1,1,0,1,0],"Teach ’n Go":[1,1,1,1,1,0,1,1],Classcard:[1,1,1,1,1,1,1,0],TutorBird:[1,1,1,1,1,1,1,0],Classpro:[1,1,1,1,1,1,1,0],"Al-Bayan MVP":[1,1,1,1,1,1,0,1]};return <section className="content"><PageHead eyebrow="MARKET BENCHMARK" title="Что взяли у лучших платформ" sub="Сравнение ключевых подходов и наш облегчённый MVP"><span className="chip"><Layers3 size={13}/> 6 систем изучено</span></PageHead><div className="benchmarkcards">{competitors.map(c=><div className="card benchmarkcard" key={c.name}><div className="cardhead"><div><h3>{c.name}</h3><p>{c.fit}</p></div><ExternalLink size={15}/></div><b className="strength">{c.strength}</b><div className="benchrow"><span>Frontend/UX</span><b>{c.ux}</b></div><div className="benchrow"><span>Языки</span><b>{c.languages}</b></div><div className="tags">{c.adopt.map(x=><span key={x}>{x}</span>)}</div></div>)}</div><div className="card tablecard"><div className="cardhead"><div><h3>Матрица возможностей</h3><p>Наша цель — взять сильные рабочие контуры без перегруза интерфейса</p></div></div><div className="tablewrap"><table className="matrix"><thead><tr><th>Платформа</th>{features.map(f=><th key={f}>{f}</th>)}</tr></thead><tbody>{Object.entries(support).map(([name,row])=><tr key={name} className={name==='Al-Bayan MVP'?'ours':''}><td><b>{name}</b></td>{row.map((v,i)=><td key={i}>{v?<CheckCircle2 size={16}/>:<span className="dash">—</span>}</td>)}</tr>)}</tbody></table></div></div></section>}

function SettingsPage({role,setRole,locale,setLocale}){return <section className="content"><PageHead eyebrow="SYSTEM" title="Настройки" sub="Роли, язык, SMS и инфраструктура"/><div className="settingsgrid"><div className="card"><div className="cardhead"><div><h3>Организация</h3><p>Базовые параметры центра</p></div><Building2 size={18}/></div><div className="settingrow"><div className="settingicon"><ShieldCheck size={16}/></div><div className="grow"><b>Текущая роль</b><span>Демо-переключатель интерфейса</span></div><select value={role} onChange={e=>setRole(e.target.value)}><option>CEO</option><option>Админ</option><option>Учитель</option></select></div><div className="settingrow"><div className="settingicon"><Languages size={16}/></div><div className="grow"><b>Язык интерфейса</b><span>RU / UZ / AR, RTL-ready</span></div><select value={locale} onChange={e=>setLocale(e.target.value)}><option value="ru">Русский</option><option value="uz">O‘zbek</option><option value="ar">العربية</option></select></div><div className="settingrow"><div className="settingicon"><Building2 size={16}/></div><div className="grow"><b>Филиалы</b><span>Cairo Main · Nasr City</span></div><button className="ghost">Управлять</button></div></div><div className="card"><div className="cardhead"><div><h3>Интеграции</h3><p>Секреты хранятся только на сервере</p></div><Database size={18}/></div><Integration name="Supabase" status="Схема готова" ok/><Integration name="SMS provider" status="Нужны API credentials"/><Integration name="Payment gateway" status="Следующий этап"/><Integration name="Student portal" status="Следующий этап"/></div></div><div className="card architecture"><div><Database size={20}/><div><h3>Архитектура SMS безопасная</h3><p>Frontend создаёт/показывает правила и очередь. Supabase Edge Function отправляет сообщения. API token провайдера никогда не попадает в браузер.</p></div></div><code>payment → reminder rule → notification_jobs → Edge Function → SMS provider → notification_logs</code></div></section>}
function Integration({name,status,ok}){return <div className="integration"><div className={'integrationdot '+(ok?'ok':'')}></div><div className="grow"><b>{name}</b><span>{status}</span></div><ChevronRight size={15}/></div>}

function PageHead({eyebrow,title,sub,children}){return <div className="pagehead"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2><p>{sub}</p></div><div className="pageactions">{children}</div></div>}
function Modal({title,close,children}){return <div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><div className="modal"><div className="modalhead"><h3>{title}</h3><button onClick={close}><X size={18}/></button></div>{children}</div></div>}
function AddStudentForm({addStudent}){return <form className="form" onSubmit={addStudent}><div className="grid2"><label>Имя и фамилия<input name="name" required placeholder="Например, Ahmad Ali" autoFocus/></label><label>Телефон<input name="phone" placeholder="+998 …"/></label><label>Контакт родителя<input name="parent" placeholder="Имя родителя"/></label><label>Уровень<select name="level"><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option></select></label><label>Ежемесячная оплата<input name="fee" type="number" defaultValue="450000"/></label><label>Группа<select name="group">{seedGroups.map(g=><option key={g.id}>{g.name}</option>)}</select></label><label>Преподаватель<select name="teacher">{seedTeachers.map(t=><option key={t.id}>{t.name}</option>)}</select></label><label>Филиал<select name="branch"><option>Cairo Main</option><option>Nasr City</option></select></label><label>Дата следующей оплаты<input name="due" type="date" defaultValue="2026-08-25"/></label></div><button className="primary full"><Plus size={17}/> Создать карточку</button></form>}

function StudentDrawer({s,close,togglePay,sendReminder}){return <div className="overlay draweroverlay" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><aside className="drawer"><div className="drawerhead"><button onClick={close}><X size={18}/></button><span>Карточка ученика</span><div className="grow"></div><button><MoreHorizontal size={18}/></button></div><div className="studenthero"><Avatar s={s} large/><h2>{s.name}</h2><p>{s.id} · {s.level} · {s.group}</p><span className={'pill '+(s.paid?'success':'danger')}>{s.paid?'Оплачено':'Требуется оплата'}</span></div><div className="detailgrid"><Detail label="Телефон" value={s.phone}/><Detail label="Родитель / контакт" value={s.parent}/><Detail label="Преподаватель" value={s.teacher}/><Detail label="Филиал" value={s.branch}/><Detail label="Посещаемость" value={s.attendance+'%'}/><Detail label="Следующая оплата" value={shortDate(s.due)}/></div><div className="draweractions"><button className="primary" onClick={()=>sendReminder(s)}><BellRing size={15}/> Напомнить</button><button className="secondary" onClick={()=>togglePay(s.id)}><WalletCards size={15}/> {s.paid?'Отменить оплату':'Отметить оплату'}</button></div><div className="timeline"><h3>История</h3><TimelineDot good={s.paid} title={s.paid?'Оплата получена':'Начисление открыто'} sub={s.paid?money(s.paidAmount):`${money(s.fee-s.paidAmount)} · срок ${shortDate(s.due)}`}/><TimelineDot good title="Зачислен в группу" sub={`${s.group} · ${s.start}`}/><TimelineDot title="Карточка создана" sub={`Старт обучения · ${s.start}`}/></div></aside></div>}
function Detail({label,value}){return <div><small>{label}</small><b>{value||'—'}</b></div>}
function TimelineDot({good,title,sub}){return <div><span className={'dot '+(good?'paid':'')}></span><div><b>{title}</b><small>{sub}</small></div></div>}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
