const cyrToLat = {
  а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'j',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'x',ц:'ts',ч:'ch',ш:'sh',щ:'sh',ъ:'',ы:'i',ь:'',э:'e',ю:'yu',я:'ya',
  қ:'q',ғ:'g',ҳ:'h',ў:'o'
};

export function normalizeSearch(value='') {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g,'')
    .split('')
    .map(ch=>cyrToLat[ch] ?? ch)
    .join('')
    .replace(/[‘’ʻʼ`']/g,'')
    .replace(/[^a-z0-9\u0600-\u06ff]+/g,' ')
    .trim()
    .replace(/\s+/g,' ');
}

export function recordTokens(record) {
  const raw = [record.name,record.id,record.phone,record.group,record.level,record.teacher,record.parent,record.source,record.stage]
    .filter(Boolean)
    .join(' ');
  const normalized = normalizeSearch(raw);
  return [...new Set([normalized,...normalized.split(' ')])];
}

export function isPrefixMatch(record, query) {
  const q = normalizeSearch(query);
  if (!q) return true;
  const words = q.split(' ');
  const tokens = recordTokens(record);
  return words.every(word=>tokens.some(token=>token.startsWith(word)));
}

export function rankPrefix(record, query) {
  const q = normalizeSearch(query);
  if (!q) return 0;
  const name = normalizeSearch(record.name || '');
  const id = normalizeSearch(record.id || '');
  const tokens = recordTokens(record);
  if (name.startsWith(q)) return 100;
  if (id.startsWith(q)) return 95;
  if (tokens.some(t=>t.startsWith(q))) return 80;
  return 0;
}

export function makeSuggestions(query,{students=[],teachers=[],groups=[],leads=[]},limit=8) {
  const q = normalizeSearch(query);
  if (!q) return [];
  const rows = [
    ...students.map(x=>({...x,type:'student',subtitle:`${x.id} · ${x.level} · ${x.group}`})),
    ...teachers.map(x=>({...x,type:'teacher',subtitle:`${x.id} · ${x.speciality}`})),
    ...groups.map(x=>({...x,type:'group',subtitle:`${x.level} · ${x.teacher} · ${(x.days||[]).join('/')} ${x.time||''}`})),
    ...leads.map(x=>({...x,type:'lead',subtitle:`${x.id} · ${x.source} · ${x.stage}`}))
  ];
  return rows
    .map(row=>({...row,_score:rankPrefix(row,q)}))
    .filter(row=>row._score>0)
    .sort((a,b)=>b._score-a._score || String(a.name).localeCompare(String(b.name)))
    .slice(0,limit);
}
