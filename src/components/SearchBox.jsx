import { useEffect, useRef, useState } from 'react';
import { Search, User, GraduationCap, Layers, Target } from 'lucide-react';
import { makeSuggestions } from '../search.js';

const typeMeta = {
  student: { icon: User, label: 'Ученик' },
  teacher: { icon: GraduationCap, label: 'Преподаватель' },
  group: { icon: Layers, label: 'Группа' },
  lead: { icon: Target, label: 'Лид' },
};

function highlight(text, query) {
  if (!query) return text;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

export function SearchBox({ query, setQuery, dataset, onOpenRecord, placeholder, autoFocus }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const boxRef = useRef(null);
  const suggestions = query ? makeSuggestions(query, dataset, 8) : [];

  useEffect(() => {
    function onClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => { setHi(0); }, [query]);

  function choose(row) {
    setOpen(false);
    onOpenRecord?.(row);
  }

  function onKeyDown(e) {
    if (!open || !suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => (h + 1) % suggestions.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => (h - 1 + suggestions.length) % suggestions.length); }
    if (e.key === 'Enter') { e.preventDefault(); choose(suggestions[hi]); }
    if (e.key === 'Escape') setOpen(false);
  }

  return (
    <div className="searchbox" ref={boxRef}>
      <div className="searchfield">
        <Search size={16} />
        <input
          autoFocus={autoFocus}
          value={query}
          placeholder={placeholder}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {query && <kbd onClick={() => setQuery('')} style={{ cursor: 'pointer' }}>Esc</kbd>}
      </div>
      {open && query && (
        <div className="suggestions">
          {suggestions.length === 0 && (
            <div className="suggest-empty">Ничего не найдено по «{query}»</div>
          )}
          {suggestions.length > 0 && (
            <>
              <div className="group-label">Подсказки · {suggestions.length}</div>
              {suggestions.map((row, i) => {
                const meta = typeMeta[row.type];
                const Icon = meta.icon;
                return (
                  <div
                    key={row.type + row.id}
                    className={'suggestitem' + (i === hi ? ' hi' : '')}
                    onMouseEnter={() => setHi(i)}
                    onMouseDown={() => choose(row)}
                  >
                    <Icon size={15} />
                    <div>
                      <b>{highlight(row.name, query)}</b>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>{row.subtitle}</div>
                    </div>
                    <span className="type">{meta.label}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
