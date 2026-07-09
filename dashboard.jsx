/* dashboard.jsx — employee directory */

/* ── Shared time helpers (used by TimePickerField + SimpleTimePicker) ── */
function parseTimeParts(s) {
  if (!s) return { h: 8, min: 0, ampm: 'AM' };
  const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(s.trim());
  return m ? { h: parseInt(m[1]) % 12 || 12, min: parseInt(m[2]), ampm: m[3].toUpperCase() } : { h: 8, min: 0, ampm: 'AM' };
}
function fmtTimeParts(t) { return `${t.h}:${String(t.min).padStart(2,'0')} ${t.ampm}`; }

/* ── ComboBoxField ───────────────────────────────────────────── */
// requireSelection=true: only select/Agregar commit the value; typing alone does not
// removableOptions: Set of option strings that show an X button
// onRemoveOption(label): called when user clicks X on a removable option
function ComboBoxField({ value, onChange, options, maxLength, placeholder, requireSelection, removableOptions, onRemoveOption }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ]       = React.useState(value || '');
  const wrapRef = React.useRef(null);
  const menuRef = React.useRef(null);

  React.useEffect(() => { setQ(value || ''); }, [value]);

  const filtered = React.useMemo(() =>
    options.filter(o => o.toLowerCase().includes(q.toLowerCase())),
    [options, q]
  );

  React.useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (!wrapRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const select = (o) => { onChange(o); setQ(o); setOpen(false); };

  const handleChange = (e) => {
    const v = e.target.value;
    setQ(v);
    if (!requireSelection) onChange(v);
    setOpen(true);
  };

  const handleBlur = () => {
    if (!requireSelection) return;
    setTimeout(() => { setQ(value || ''); setOpen(false); }, 180);
  };

  const menuStyle = { position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:1000 };

  const trimmed = q.trim();
  const exactMatch = options.some(o => o.toLowerCase() === trimmed.toLowerCase());
  const showAdd = trimmed.length > 0 && !exactMatch;
  const showMenu = open && (filtered.length > 0 || showAdd);

  return (
    <div className="cbx-wrap" ref={wrapRef} style={{position:'relative'}}>
      <input className="field__input" value={q} maxLength={maxLength}
        onChange={handleChange} onFocus={() => setOpen(true)} onBlur={handleBlur}
        placeholder={placeholder || 'Seleccionar o agregar…'} />
      {showMenu && (
        <div className="cbx-menu" ref={menuRef} style={menuStyle}>
          {filtered.map(o => {
            const isRemovable = removableOptions && removableOptions.has(o);
            return (
              <div key={o} className={'cbx-opt' + (isRemovable ? ' cbx-opt--removable' : '')}>
                <button type="button" className={`cbx-item${o===q?' cbx-item--sel':''}`}
                  onMouseDown={() => select(o)}>{o}</button>
                {isRemovable && (
                  <button type="button" className="cbx-opt__del"
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); if (onRemoveOption) onRemoveOption(o); }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
                  </button>
                )}
              </div>
            );
          })}
          {showAdd && (
            <button type="button" className="cbx-item cbx-item--add"
              onMouseDown={() => select(trimmed)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Agregar "{trimmed}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── PhoneField ──────────────────────────────────────────────── */
const PHONE_COUNTRIES = [
  // Caribe
  { flag: '🇩🇴', name: 'Rep. Dominicana', code: '+1',   area: ['809','829','849'], fmt: [3,3,4] },
  { flag: '🇵🇷', name: 'Puerto Rico',      code: '+1',   area: ['787','939'],       fmt: [3,3,4] },
  { flag: '🇨🇺', name: 'Cuba',             code: '+53',  area: [],                  fmt: [1,4,4] },
  { flag: '🇭🇹', name: 'Haití',            code: '+509', area: [],                  fmt: [4,4]   },
  // Norteamérica
  { flag: '🇺🇸', name: 'Estados Unidos',   code: '+1',   area: [],                  fmt: [3,3,4] },
  { flag: '🇨🇦', name: 'Canadá',           code: '+1',   area: [],                  fmt: [3,3,4] },
  { flag: '🇲🇽', name: 'México',           code: '+52',  area: [],                  fmt: [2,4,4] },
  // Centroamérica
  { flag: '🇬🇹', name: 'Guatemala',        code: '+502', area: [],                  fmt: [4,4]   },
  { flag: '🇸🇻', name: 'El Salvador',      code: '+503', area: [],                  fmt: [4,4]   },
  { flag: '🇭🇳', name: 'Honduras',         code: '+504', area: [],                  fmt: [4,4]   },
  { flag: '🇳🇮', name: 'Nicaragua',        code: '+505', area: [],                  fmt: [4,4]   },
  { flag: '🇨🇷', name: 'Costa Rica',       code: '+506', area: [],                  fmt: [4,4]   },
  { flag: '🇵🇦', name: 'Panamá',           code: '+507', area: [],                  fmt: [4,4]   },
  // Suramérica
  { flag: '🇨🇴', name: 'Colombia',         code: '+57',  area: [],                  fmt: [3,3,4] },
  { flag: '🇻🇪', name: 'Venezuela',        code: '+58',  area: [],                  fmt: [3,3,4] },
  { flag: '🇪🇨', name: 'Ecuador',          code: '+593', area: [],                  fmt: [2,3,4] },
  { flag: '🇵🇪', name: 'Perú',             code: '+51',  area: [],                  fmt: [3,3,3] },
  { flag: '🇧🇴', name: 'Bolivia',          code: '+591', area: [],                  fmt: [1,3,4] },
  { flag: '🇧🇷', name: 'Brasil',           code: '+55',  area: [],                  fmt: [2,5,4] },
  { flag: '🇦🇷', name: 'Argentina',        code: '+54',  area: [],                  fmt: [3,4,4] },
  { flag: '🇨🇱', name: 'Chile',            code: '+56',  area: [],                  fmt: [1,4,4] },
  { flag: '🇵🇾', name: 'Paraguay',         code: '+595', area: [],                  fmt: [3,3,3] },
  { flag: '🇺🇾', name: 'Uruguay',          code: '+598', area: [],                  fmt: [2,3,4] },
  // Europa
  { flag: '🇪🇸', name: 'España',           code: '+34',  area: [],                  fmt: [3,3,3] },
  { flag: '🇫🇷', name: 'Francia',          code: '+33',  area: [],                  fmt: [1,2,2,2,2] },
  { flag: '🇮🇹', name: 'Italia',           code: '+39',  area: [],                  fmt: [3,3,4] },
  { flag: '🇩🇪', name: 'Alemania',         code: '+49',  area: [],                  fmt: [3,4,4] },
  { flag: '🇬🇧', name: 'Reino Unido',      code: '+44',  area: [],                  fmt: [4,3,4] },
];

function applyPhoneFmt(digits, fmt) {
  let out = '', pos = 0;
  for (let i = 0; i < fmt.length; i++) {
    if (pos >= digits.length) break;
    if (i > 0) out += ' ';
    out += digits.slice(pos, pos + fmt[i]);
    pos += fmt[i];
  }
  if (pos < digits.length) out += ' ' + digits.slice(pos);
  return out.trim();
}

function parsePhoneValue(full) {
  if (!full) return { country: PHONE_COUNTRIES[0], digits: '' };
  const s = full.trim();
  // Sort by code length desc to match longest prefix first
  const sorted = [...PHONE_COUNTRIES].sort((a,b) => b.code.length - a.code.length);
  for (const c of sorted) {
    if (!s.startsWith(c.code)) continue;
    const local = s.slice(c.code.length).trim();
    const digits = local.replace(/\D/g,'');
    if (c.area.length === 0) return { country: c, digits };
    if (c.area.some(a => digits.startsWith(a))) return { country: c, digits };
  }
  return { country: PHONE_COUNTRIES[0], digits: s.replace(/\D/g,'') };
}

function PhoneField({ value, onChange }) {
  const init = React.useMemo(() => parsePhoneValue(value), []);
  const [country, setCountry] = React.useState(init.country);
  const [digits,  setDigits ] = React.useState(init.digits);
  const [open,    setOpen   ] = React.useState(false);
  const [rect,    setRect   ] = React.useState(null);
  const btnRef  = React.useRef(null);
  const dropRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (!btnRef.current?.contains(e.target) && !dropRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const emit = (c, d) => onChange(`${c.code} ${applyPhoneFmt(d, c.fmt)}`);

  const handleLocal = (e) => {
    const detectedFirst = PHONE_COUNTRIES.find(c => c.area.length > 0 && c.area.some(a => e.target.value.replace(/\D/g,'').startsWith(a)));
    const activeCountry = detectedFirst || country;
    const maxDigits = activeCountry.fmt.reduce((a, b) => a + b, 0);
    const raw = e.target.value.replace(/\D/g,'').slice(0, maxDigits);
    setDigits(raw);
    if (detectedFirst) setCountry(detectedFirst);
    emit(activeCountry, raw);
  };

  const selectCountry = (c) => { setCountry(c); setOpen(false); emit(c, digits); };

  const toggleDrop = () => {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen(o => !o);
  };
  const dropStyle = rect ? { position:'fixed', top: rect.bottom + 4, left: rect.left, zIndex: 1000 } : {};
  const displayed = applyPhoneFmt(digits, country.fmt);

  return (
    <div className="phone-wrap">
      <button type="button" ref={btnRef} className="phone-flag-btn" onClick={toggleDrop}>
        <span className="phone-flag">{country.flag}</span>
        <span className="phone-code mono">{country.code}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <input className="field__input phone-num-input mono" value={displayed}
        onChange={handleLocal} placeholder="000 000 0000" />
      {open && (
        <div className="phone-drop" ref={dropRef} style={dropStyle}>
          {PHONE_COUNTRIES.map((c) => (
            <button key={c.code} type="button" className={`phone-drop__item${c===country?' phone-drop__item--sel':''}`}
              onClick={() => selectCountry(c)}>
              <span className="phone-flag">{c.flag}</span>
              <span className="phone-drop__name">{c.name}</span>
              <span className="mono" style={{fontSize:12,color:'var(--ink-400)'}}>{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── EmailField ──────────────────────────────────────────────── */
function EmailField({ value, onChange }) {
  return (
    <input className="field__input" type="email" value={value || ''}
      onChange={(e) => onChange(e.target.value)} maxLength={50}
      placeholder="correo@ejemplo.com" />
  );
}

/* ── DatePickerField ─────────────────────────────────────────── */
function DatePickerField({ value, onChange, minAge = 0, maxAge = 0, disabledDates = null }) {
  const [open,     setOpen    ] = React.useState(false);
  const [manual,   setManual  ] = React.useState(value || '');
  const [ageError, setAgeError] = React.useState(false);
  const [calPos,   setCalPos  ] = React.useState({ top: 0, left: 0, minWidth: 0 });
  const trigRef   = React.useRef(null);
  const calRef    = React.useRef(null);
  const manualRef = React.useRef(null);

  // Recalculate fixed position whenever calendar opens or window scrolls/resizes
  React.useEffect(() => {
    if (!open || !trigRef.current) return;
    const update = () => {
      const r = trigRef.current.getBoundingClientRect();
      const calH = calRef.current?.offsetHeight || 300;
      const spaceBelow = window.innerHeight - r.bottom;
      const top = spaceBelow >= calH + 8 ? r.bottom + 6 : r.top - calH - 6;
      setCalPos({ top, left: r.left, minWidth: r.width });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  const parseVal = (v) => {
    if (!v) return null;
    const [d, m, y] = v.split('/');
    return (!d || !m || !y || isNaN(+y) || +y < 1900) ? null : new Date(+y, +m - 1, +d);
  };
  const sel = parseVal(value);
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const maxAllowed = minAge > 0 ? new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate()) : null;
  const minAllowed = maxAge > 0 ? new Date(now.getFullYear() - maxAge, now.getMonth(), now.getDate()) : null;
  const defaultYear = minAge > 0 ? now.getFullYear() - (minAge + 7) : now.getFullYear();
  const [month, setMonth] = React.useState(() => sel ? sel.getMonth() : now.getMonth());
  const [year,  setYear ] = React.useState(() => sel ? sel.getFullYear() : defaultYear);

  React.useEffect(() => {
    if (document.activeElement !== manualRef.current) setManual(value || '');
  }, [value]);

  const toggle = () => setOpen(o => !o);

  React.useEffect(() => {
    if (!open) return;
    const onMouse = (e) => {
      if (!trigRef.current?.contains(e.target) && !calRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','PageUp','PageDown',' '].includes(e.key)
          && e.target.tagName !== 'INPUT')
        e.preventDefault();
    };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const DOW = ['L','M','X','J','V','S','D'];
  const firstDow   = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMo   = () => month === 0  ? (setMonth(11), setYear(y => y-1)) : setMonth(m => m-1);
  const nextMo   = () => month === 11 ? (setMonth(0),  setYear(y => y+1)) : setMonth(m => m+1);
  const prevYear = () => setYear(y => y - 1);
  const nextYear = () => setYear(y => y + 1);

  const pick = (d) => {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if (disabledDates && disabledDates.has(dateStr)) return;
    const candidate = new Date(year, month, d);
    if (maxAllowed && candidate > maxAllowed) { setAgeError('min'); return; }
    if (minAllowed && candidate < minAllowed) { setAgeError('max'); return; }
    setAgeError(false);
    const v = `${String(d).padStart(2,'0')}/${String(month+1).padStart(2,'0')}/${year}`;
    onChange(v); setManual(v); setOpen(false);
  };

  const handleManual = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    let v = raw;
    if (raw.length > 4) v = raw.slice(0,2) + '/' + raw.slice(2,4) + '/' + raw.slice(4);
    else if (raw.length > 2) v = raw.slice(0,2) + '/' + raw.slice(2);
    setManual(v);

    // Navegación progresiva del calendario mientras se escribe
    if (raw.length >= 4) {
      const m = parseInt(raw.slice(2, 4), 10) - 1;
      if (m >= 0 && m <= 11) setMonth(m);
    }
    if (raw.length === 8) {
      const y = parseInt(raw.slice(4, 8), 10);
      if (y >= 1900) setYear(y);
    }

    const parsed = parseVal(v);
    if (parsed) {
      if (maxAllowed && parsed > maxAllowed) { setAgeError('min'); onChange(''); return; }
      if (minAllowed && parsed < minAllowed) { setAgeError('max'); onChange(''); return; }
      setAgeError(false);
      onChange(v); setMonth(parsed.getMonth()); setYear(parsed.getFullYear());
    } else {
      setAgeError(false);
    }
  };

  const calStyle = { position:'fixed', top: calPos.top, left: calPos.left, minWidth: calPos.minWidth, zIndex:2000 };

  return (
    <div className="dp-wrap" ref={trigRef}>
      <div className="dp-field">
        <input ref={manualRef} className="dp-field__input mono" value={manual}
          onChange={handleManual} placeholder="DD/MM/AAAA" maxLength={10}
          onFocus={() => { if (!open) setOpen(true); }}/>
        <button type="button" className="dp-field__icon" onClick={toggle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
          </svg>
        </button>
      </div>
      {open && (
        <div className="dp-cal" ref={calRef} style={calStyle}
          onKeyDown={(e) => {
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key) && e.target.tagName !== 'INPUT')
              e.preventDefault();
          }}>
          <div className="dp-cal__nav">
            <button type="button" className="dp-cal__arrow" onClick={prevYear} title="Año anterior">«</button>
            <button type="button" className="dp-cal__arrow" onClick={prevMo}   title="Mes anterior">‹</button>
            <span className="dp-cal__month">{MONTHS_ES[month]} {year}</span>
            <button type="button" className="dp-cal__arrow" onClick={nextMo}   title="Mes siguiente">›</button>
            <button type="button" className="dp-cal__arrow" onClick={nextYear} title="Año siguiente">»</button>
          </div>
          <div className="dp-cal__grid">
            {DOW.map(d => <span key={d} className="dp-cal__dow">{d}</span>)}
            {Array.from({length: firstDow}).map((_,i) => <span key={'b'+i}/>)}
            {Array.from({length: daysInMonth}, (_,i) => {
              const d = i + 1;
              const isSel = sel && sel.getDate()===d && sel.getMonth()===month && sel.getFullYear()===year;
              const isNow = now.getDate()===d && now.getMonth()===month && now.getFullYear()===year;
              const dayDate = new Date(year, month, d);
              const isDisabled = (maxAllowed && dayDate > maxAllowed) || (minAllowed && dayDate < minAllowed);
              const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
              const isUsed = disabledDates && disabledDates.has(dateStr);
              return (
                <button type="button" key={d}
                  disabled={isUsed || isDisabled}
                  className={`dp-cal__day${isSel?' dp-cal__day--sel':''}${isNow&&!isSel?' dp-cal__day--today':''}${isUsed?' dp-cal__day--used':''}${isDisabled?' dp-cal__day--disabled':''}`}
                  title={isUsed ? 'Fecha ya registrada' : undefined}
                  onClick={() => pick(d)}>{d}</button>
              );
            })}
          </div>
          {ageError === 'min' && (
            <div style={{fontSize:11,color:'var(--error,#c0392b)',padding:'6px 10px 4px',textAlign:'center',borderTop:'1px solid var(--ink-100)'}}>
              El empleado debe tener al menos {minAge} años
            </div>
          )}
          {ageError === 'max' && (
            <div style={{fontSize:11,color:'var(--error,#c0392b)',padding:'6px 10px 4px',textAlign:'center',borderTop:'1px solid var(--ink-100)'}}>
              La edad máxima permitida es {maxAge} años
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── TimePickerField ─────────────────────────────────────────── */
function TimePickerField({ value, onChange }) {
  const parts = (value || '8:00 AM — 4:00 PM').split('—').map(s => s.trim());
  const [start, setStart]     = React.useState(() => parseTimeParts(parts[0]));
  const [end,   setEnd  ]     = React.useState(() => parseTimeParts(parts[1] || '4:00 PM'));
  const [open,  setOpen ]     = React.useState(false);
  const [tab,   setTab  ]     = React.useState('start');
  const [manual, setManual]   = React.useState(() => fmtTimeParts(parseTimeParts(parts[0])));
  const trigRef   = React.useRef(null);
  const popRef    = React.useRef(null);
  const manualRef = React.useRef(null);

  const toggle = () => setOpen(o => !o);

  React.useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (!trigRef.current?.contains(e.target) && !popRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  React.useEffect(() => {
    if (document.activeElement !== manualRef.current) {
      setManual(fmtTimeParts(tab === 'start' ? start : end));
    }
  }, [tab, start, end]);

  const emit = (s, e) => onChange(`${fmtTimeParts(s)} — ${fmtTimeParts(e)}`);
  const setH   = (h)    => { if (tab==='start'){const s={...start,h};    setStart(s); emit(s,end);}  else {const e={...end,h};      setEnd(e);  emit(start,e);} };
  const setMin = (min)  => { if (tab==='start'){const s={...start,min};  setStart(s); emit(s,end);}  else {const e={...end,min};    setEnd(e);  emit(start,e);} };
  const setAP  = (ampm) => {
    if (tab==='start') {
      const s = {...start, ampm};
      const e = {...end, ampm: ampm === 'AM' ? 'PM' : 'AM'};
      setStart(s); setEnd(e); emit(s, e);
    } else {
      const e = {...end, ampm}; setEnd(e); emit(start, e);
    }
  };

  const handleManual = (ev) => {
    const raw = ev.target.value.toUpperCase();
    const filtered = raw.replace(/[^0-9:AMP ]/g, '').slice(0, 8);

    // BORRAR — mostrar exactamente lo que queda
    if (filtered.length < manual.length) {
      setManual(filtered);
      const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(filtered.trim());
      if (m) {
        const h = parseInt(m[1]), min = parseInt(m[2]), ampm = m[3].toUpperCase();
        if (h >= 1 && h <= 12 && min >= 0 && min <= 59) {
          if (tab==='start') { const s={h,min,ampm}; setStart(s); emit(s,end); }
          else               { const e={h,min,ampm};  setEnd(e);  emit(start,e); }
        }
      }
      return;
    }

    // ESCRIBIR — validar dígito por dígito
    const digits = filtered.replace(/\D/g, '');
    let v = '';
    for (let i = 0; i < digits.length; i++) {
      const d = parseInt(digits[i]);
      if (i === 0) { if (d < 1) break; v += digits[i]; }
      else if (i === 1) {
        if (v[0] === '1') { if (d <= 5) v += digits[i]; else break; }
        else              { if (d <= 5) v += digits[i]; else break; }
      }
      else if (i === 2) {
        const dblH = v[0] === '1' && '012'.includes(v[1]);
        if (dblH) { if (d <= 5) v += digits[i]; else break; }
        else      { v += digits[i]; break; }
      }
      else if (i === 3) { v += digits[i]; break; }
    }

    const dblH = v.length >= 2 && v[0] === '1' && '012'.includes(v[1]);
    const hLen = dblH ? 2 : 1;
    const hPart = v.slice(0, Math.min(hLen, v.length));
    const mPart = v.slice(hLen);
    const typedAP = /P/.test(filtered) ? 'PM' : /A/.test(filtered) ? 'AM' : null;

    let display = hPart;
    if (mPart.length > 0) display += ':' + mPart;
    if (typedAP) display += ' ' + typedAP;
    setManual(display);

    if (mPart.length === 2) {
      const h = parseInt(hPart), min = parseInt(mPart);
      const ampm = typedAP || cur.ampm;
      if (h >= 1 && h <= 12 && min >= 0 && min <= 59) {
        if (tab==='start') { const s={h,min,ampm}; setStart(s); emit(s,end); }
        else               { const e={h,min,ampm};  setEnd(e);  emit(start,e); }
      }
    }
  };

  const calcHours = (s, e) => {
    const toMin = (t) => { let h = t.h % 12; if (t.ampm === 'PM') h += 12; return h * 60 + t.min; };
    let diff = toMin(e) - toMin(s);
    if (diff <= 0) diff += 24 * 60;
    const h = Math.floor(diff / 60), m = diff % 60;
    return m === 0 ? `${h} h` : `${h} h ${m} min`;
  };

  const cur = tab === 'start' ? start : end;
  const CX = 70, CY = 70, R = 50;
  const HOURS = [12,1,2,3,4,5,6,7,8,9,10,11];
  const ang   = (n) => -Math.PI/2 + (n % 12) / 12 * 2 * Math.PI;
  const handX = CX + 38 * Math.cos(ang(cur.h));
  const handY = CY + 38 * Math.sin(ang(cur.h));
  const MINS  = [0, 15, 30, 45];
  const [popPos, setPopPos] = React.useState({ top:0, left:0, minWidth:0 });
  React.useEffect(() => {
    if (!open || !trigRef.current) return;
    const update = () => {
      const r = trigRef.current.getBoundingClientRect();
      const popH = popRef.current?.offsetHeight || 320;
      const top = window.innerHeight - r.bottom >= popH + 8 ? r.bottom + 6 : r.top - popH - 6;
      setPopPos({ top, left: r.left });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
  }, [open]);
  const popStyle = { position:'fixed', top: popPos.top, left: popPos.left, zIndex:2000 };

  return (
    <div className="tp-wrap" ref={trigRef}>
      <button type="button" className="dp-trigger" onClick={toggle}>
        <span className="tp-trigger__left">
          <span className={value ? '' : 'dp-trigger__placeholder'}>{value || '8:00 AM — 4:00 PM'}</span>
          {value && <span className="tp-hours-badge">({calcHours(start, end)})</span>}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </button>
      {open && (
        <div className="tp-popup" ref={popRef} style={popStyle}>
          <div className="tp-tabs">
            <button type="button" className={`tp-tab${tab==='start'?' tp-tab--act':''}`} onClick={() => setTab('start')}>
              <span className="tp-tab__lbl">Inicio</span>
              <span className="tp-tab__time">{fmtTimeParts(start)}</span>
            </button>
            <span className="tp-sep">→</span>
            <button type="button" className={`tp-tab${tab==='end'?' tp-tab--act':''}`} onClick={() => setTab('end')}>
              <span className="tp-tab__lbl">Fin</span>
              <span className="tp-tab__time">{fmtTimeParts(end)}</span>
            </button>
          </div>
          <input ref={manualRef} className="tp-manual" value={manual}
            onChange={handleManual} placeholder="8:00 AM" />
          <div className="tp-clock">
            <svg width="140" height="140">
              <circle cx={CX} cy={CY} r={66} fill="var(--cream-50)" stroke="var(--ink-100)" strokeWidth="1.5"/>
              <line x1={CX} y1={CY} x2={handX} y2={handY} stroke="var(--ink-700)" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx={CX} cy={CY} r={4} fill="var(--ink-700)"/>
              {HOURS.map(n => {
                const a = ang(n);
                const nx = CX + R * Math.cos(a);
                const ny = CY + R * Math.sin(a);
                const isSel = (cur.h % 12 || 12) === n;
                return (
                  <g key={n} onClick={() => setH(n)} style={{cursor:'pointer'}}>
                    <circle cx={nx} cy={ny} r={14} fill={isSel ? 'var(--ink-800)' : 'transparent'} style={{transition:'fill .15s'}}/>
                    <text x={nx} y={ny} textAnchor="middle" dominantBaseline="central"
                      fill={isSel ? '#fff' : 'var(--ink-600)'}
                      fontSize="12" fontFamily="Manrope, sans-serif" fontWeight={isSel?'700':'500'}>{n}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="tp-ampm">
            {['AM','PM'].map(a => (
              <button key={a} type="button" className={`tp-ampm__btn${cur.ampm===a?' tp-ampm__btn--sel':''}`}
                onClick={() => setAP(a)}>{a}</button>
            ))}
          </div>
          <div className="tp-mins">
            <span className="tp-mins__label">Min</span>
            {MINS.map(m => (
              <button key={m} type="button" className={`tp-min__btn${cur.min===m?' tp-min__btn--sel':''}`}
                onClick={() => setMin(m)}>:{String(m).padStart(2,'0')}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── FlipCounter (slide‑up overlay) ────────────────────────────── */
function FlipCounter({ value, className = '' }) {
  const [prev, setPrev] = React.useState(value);
  const [anim, setAnim] = React.useState('idle');
  const timer = React.useRef(null);
  React.useEffect(() => {
    if (value === prev) return;
    setAnim('out');
    timer.current = setTimeout(() => {
      setPrev(value);
      setAnim('in');
      setTimeout(() => setAnim('idle'), 300);
    }, 180);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [value]);
  const display = anim === 'idle' ? value : (anim === 'out' ? prev : value);
  const cls = `flip-counter__inner${anim === 'out' ? ' flip-counter__out' : anim === 'in' ? ' flip-counter__in' : ''}`;
  return <span className={`flip-counter ${className}`}><span className={cls}>{display}</span></span>;
}

/* ── SimpleTimePicker ─────────────────────────────────────────── */
function SimpleTimePicker({ value, onChange }) {
  const [parts, setParts] = React.useState(() => parseTimeParts(value));
  const [open, setOpen] = React.useState(false);
  const [manual, setManual] = React.useState('');
  const [popPos, setPopPos] = React.useState({ top: 0, left: 0, minWidth: 0 });
  const trigRef = React.useRef(null);
  const popRef = React.useRef(null);
  const manualRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const update = () => {
      const r = trigRef.current?.getBoundingClientRect();
      if (!r) return;
      const popH = popRef.current?.offsetHeight || 320;
      const spaceBelow = window.innerHeight - r.bottom;
      const top = spaceBelow >= popH + 8 ? r.bottom + 6 : r.top - popH - 6;
      setPopPos({ top, left: r.left, minWidth: r.width });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    const h = (e) => { if (!trigRef.current?.contains(e.target) && !popRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => {
      document.removeEventListener('mousedown', h);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  React.useEffect(() => {
    if (document.activeElement !== manualRef.current) setManual(fmtTimeParts(parts));
  }, [parts, open]);

  const emit = (p) => { setParts(p); onChange(fmtTimeParts(p)); };
  const setH = (h) => { const p = { ...parts, h }; emit(p); };
  const setMin = (min) => { const p = { ...parts, min }; emit(p); };
  const setAP = (ampm) => { const p = { ...parts, ampm }; emit(p); };

  const HOURS = [12,1,2,3,4,5,6,7,8,9,10,11];
  const MINS = [0, 15, 30, 45];
  const CX = 70, CY = 70, R = 50;
  const ang = (n) => -Math.PI/2 + (n % 12) / 12 * 2 * Math.PI;
  const handX = CX + 38 * Math.cos(ang(parts.h));
  const handY = CY + 38 * Math.sin(ang(parts.h));

  return (
    <div className="tp-wrap" ref={trigRef}>
      <button type="button" className="dp-trigger" onClick={() => setOpen(o => !o)}>
        <span className={value ? '' : 'dp-trigger__placeholder'}>{value || '8:00 AM'}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </button>
      {open && (
        <div className="tp-popup" ref={popRef} style={{ position:'fixed', top: popPos.top, left: popPos.left, minWidth: popPos.minWidth, zIndex:2000 }}>
          <input ref={manualRef} className="tp-manual" value={manual}
            onChange={(e) => {
              const raw = e.target.value.toUpperCase();
              const filtered = raw.replace(/[^0-9:AMP ]/g, '').slice(0, 8);

              // BORRAR — mostrar exactamente lo que queda, sin reconstruir
              if (filtered.length < manual.length) {
                setManual(filtered);
                const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(filtered.trim());
                if (m) {
                  const h = parseInt(m[1]), min = parseInt(m[2]), ampm = m[3].toUpperCase();
                  if (h >= 1 && h <= 12 && min >= 0 && min <= 59) emit({ h, min, ampm });
                }
                return;
              }

              // ESCRIBIR — validar dígito por dígito y reconstruir display
              const digits = filtered.replace(/\D/g, '');
              let v = '';
              for (let i = 0; i < digits.length; i++) {
                const d = parseInt(digits[i]);
                if (i === 0) { if (d < 1) break; v += digits[i]; }
                else if (i === 1) {
                  if (v[0] === '1') { if (d <= 5) v += digits[i]; else break; }
                  else              { if (d <= 5) v += digits[i]; else break; }
                }
                else if (i === 2) {
                  const dblH = v[0] === '1' && '012'.includes(v[1]);
                  if (dblH) { if (d <= 5) v += digits[i]; else break; }
                  else      { v += digits[i]; break; }
                }
                else if (i === 3) { v += digits[i]; break; }
              }

              const dblH = v.length >= 2 && v[0] === '1' && '012'.includes(v[1]);
              const hLen = dblH ? 2 : 1;
              const hPart = v.slice(0, Math.min(hLen, v.length));
              const mPart = v.slice(hLen);
              const typedAP = /P/.test(filtered) ? 'PM' : /A/.test(filtered) ? 'AM' : null;

              let display = hPart;
              if (mPart.length > 0) display += ':' + mPart;
              if (typedAP) display += ' ' + typedAP;
              setManual(display);

              if (mPart.length === 2) {
                const h = parseInt(hPart), min = parseInt(mPart);
                const ampm = typedAP || parts.ampm;
                if (h >= 1 && h <= 12 && min >= 0 && min <= 59) emit({ h, min, ampm });
              }
            }}
            placeholder="8:00 AM" />
          <div className="tp-clock">
            <svg width="140" height="140">
              <circle cx={CX} cy={CY} r={66} fill="var(--cream-50)" stroke="var(--ink-100)" strokeWidth="1.5"/>
              <line x1={CX} y1={CY} x2={handX} y2={handY} stroke="var(--ink-700)" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx={CX} cy={CY} r={4} fill="var(--ink-700)"/>
              {HOURS.map(n => {
                const a = ang(n);
                const nx = CX + R * Math.cos(a);
                const ny = CY + R * Math.sin(a);
                const isSel = (parts.h % 12 || 12) === n;
                return (
                  <g key={n} onClick={() => setH(n)} style={{cursor:'pointer'}}>
                    <circle cx={nx} cy={ny} r={14} fill={isSel ? 'var(--ink-800)' : 'transparent'} style={{transition:'fill .15s'}}/>
                    <text x={nx} y={ny} textAnchor="middle" dominantBaseline="central"
                      fill={isSel ? '#fff' : 'var(--ink-600)'}
                      fontSize="12" fontFamily="Manrope, sans-serif" fontWeight={isSel?'700':'500'}>{n}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="tp-ampm">
            {['AM','PM'].map(a => (
              <button key={a} type="button" className={`tp-ampm__btn${parts.ampm===a?' tp-ampm__btn--sel':''}`}
                onClick={() => setAP(a)}>{a}</button>
            ))}
          </div>
          <div className="tp-mins">
            <span className="tp-mins__label">Min</span>
            {MINS.map(m => (
              <button key={m} type="button" className={`tp-min__btn${parts.min===m?' tp-min__btn--sel':''}`}
                onClick={() => setMin(m)}>:{String(m).padStart(2,'0')}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Custom status helpers ───────────────────────────────────── */
const CUSTOM_STATUS_KEY = 'uasd_custom_statuses';
function getCustomStatuses() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_STATUS_KEY) || '[]'); } catch { return []; }
}
function saveCustomStatuses(list) {
  localStorage.setItem(CUSTOM_STATUS_KEY, JSON.stringify(list));
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ── StatusPicker ────────────────────────────────────────────── */
function StatusPicker({ status, inactiveReason, onChange, t }) {
  const [customList, setCustomList] = React.useState(getCustomStatuses);
  const [adding, setAdding]         = React.useState(false);
  const [newLabel, setNewLabel]     = React.useState('');
  const [newDesc,  setNewDesc ]     = React.useState('');
  const [newCls, setNewCls]         = React.useState('badge--neutral');
  const [newColor, setNewColor]     = React.useState(null);

  const builtIn = [
    { status:'ok',       reason:null,        cls:'badge--ok',      color:'#2f7a5a', label: t.dash_status_ok,                               desc:'Huella biométrica registrada, acceso activo' },
    { status:'pending',  reason:null,        cls:'badge--warn',    color:'#8a6c2c', label: t.dash_status_pending,                          desc:'Pendiente de captura de huella' },
    { status:'inactive', reason:'other',     cls:'badge--neutral', color:'#8b97b3', label: t.dash_status_inactive_other || 'Lic. laboral', desc:'Licencia temporal autorizada por RRHH' },
    { status:'inactive', reason:'suspended', cls:'badge--warn',    color:'#8a6c2c', label: t.dash_status_suspended      || 'Suspensión',   desc:'Inactividad por medida disciplinaria' },
    { status:'inactive', reason:'retired',   cls:'badge--retired', color:'#2C3E66', label: t.dash_status_retired        || 'Pensionado',   desc:'Retirado del servicio activo' },
  ];

  const customOpts = customList.map(cs => {
    const badgeStyle = cs.color ? { background: hexToRgba(cs.color, 0.12), color: cs.color } : {};
    return { status: 'custom', reason: cs.id, cls: cs.cls || '', label: cs.label,
             desc: cs.desc || 'Estado personalizado', custom: true, id: cs.id, badgeStyle };
  });

  const opts = [...builtIn, ...customOpts];

  function pickPreset(bg) { setNewColor(bg); }
  function pickCustomColor(hex) { setNewColor(hex); setNewCls(''); }

  function addStatus() {
    if (!newLabel.trim()) return;
    const entry = { id: 'cs_' + Date.now(), label: newLabel.trim(), desc: newDesc.trim() };
    if (newColor) entry.color = newColor;
    else entry.cls = newCls;
    const updated = [...customList, entry];
    saveCustomStatuses(updated);
    setCustomList(updated);
    setNewLabel('');
    setNewDesc('');
    setNewColor(null);
    setNewCls('badge--neutral');
    setAdding(false);
  }

  function deleteCustom(id) {
    const updated = customList.filter(cs => cs.id !== id);
    saveCustomStatuses(updated);
    setCustomList(updated);
  }

  function isLightColor(hex) {
    if (!hex || !hex.startsWith('#')) return false;
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return (0.299*r + 0.587*g + 0.114*b) / 255 > 0.58;
  }

  const previewStyle = newColor
    ? { background: hexToRgba(newColor, 0.15), color: isLightColor(newColor) ? '#2a2a2a' : newColor }
    : {};

  return (
    <div className="status-picker">
      {opts.map((o, i) => {
        const on = o.status === status && o.reason === (inactiveReason || null);
        const accentColor = o.color || (o.badgeStyle?.color) || 'var(--ink-600)';
        const cardStyle = on ? {
          borderLeftColor: accentColor,
          background: hexToRgba(accentColor.startsWith('#') ? accentColor : '#303c66', 0.05),
        } : {};
        return (
          <button key={i} type="button" className={`status-card${on ? ' status-card--on' : ''}`}
            style={cardStyle}
            onClick={() => onChange(o.status, o.reason)}>
            <div className="status-card__body">
              <span className={`badge ${o.cls}`} style={o.badgeStyle || {}}>
                <span className="badge__dot"/>{o.label}
              </span>
              <span className="status-card__desc">{o.desc}</span>
            </div>
            {o.custom && (
              <span className="status-card__del" role="button"
                onClick={e => { e.stopPropagation(); deleteCustom(o.id); }}>
                <Icon name="x" size={12} stroke={2.2} />
              </span>
            )}
            <span className={`status-card__radio${on ? ' status-card__radio--on' : ''}`}
              style={on ? {background: accentColor, borderColor: accentColor} : {}}>
              {on && <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3.5" fill="currentColor"/></svg>}
            </span>
          </button>
        );
      })}

      {adding ? (
        <div className="status-card status-card--new">
          <div className="status-new__preview">
            <span className={`badge ${newCls}`} style={previewStyle}>
              <span className="badge__dot"/>
              {newLabel || 'Nombre del estado'}
            </span>
            {newDesc && (
              <span style={{
                fontSize:11, color:'var(--ink-500)', marginTop:4,
                display:'block', fontStyle:'italic',
              }}>{newDesc}</span>
            )}
          </div>
          <input className="field__input status-new__input" placeholder="Nombre del estado…"
            value={newLabel} autoFocus
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addStatus(); if (e.key === 'Escape') setAdding(false); }} />
          <input className="field__input status-new__input" placeholder="Descripción (Opcional)"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addStatus(); if (e.key === 'Escape') setAdding(false); }}
            style={{marginTop: 6}} />
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
            {PRESET_COLORS.map(bg => {
              const on = newColor === bg;
              return (
                <div key={bg} className="color-swatch" data-tip={PRESET_COLOR_NAMES[bg]} onClick={() => pickPreset(bg)}
                  style={{width:'28px',height:'28px',borderRadius:'50%',background:bg,cursor:'pointer',
                    border: on ? '2px solid var(--ink-800)' : '2px solid var(--ink-100)',
                    boxShadow: on ? '0 0 0 3px rgba(201,169,97,0.25)' : 'none'}} />
              );
            })}
            {(() => {
              const isCustom = newColor && !PRESET_COLORS.includes(newColor);
              return (
                <label className="color-swatch" data-tip={isCustom ? nearestColorName(newColor) : 'Otro…'}
                  style={{position:'relative',width:'28px',height:'28px',borderRadius:'50%',cursor:'pointer',display:'grid',placeItems:'center',
                    background: isCustom ? newColor : 'conic-gradient(from 0deg,#e3494a,#e8a33d,#e3d23f,#4caf6e,#4a6fa5,#8b2942,#e3494a)',
                    border: isCustom ? '2px solid var(--ink-800)' : '2px solid var(--ink-100)',
                    boxShadow: isCustom ? '0 0 0 3px rgba(201,169,97,0.25)' : 'none'}}>
                  {!isCustom && <span style={{color:'#fff'}}><Icon name="plus" size={12} stroke={2.4} /></span>}
                  <input type="color" value={newColor || '#6366f1'}
                    onChange={e => pickCustomColor(e.target.value)}
                    style={{position:'absolute',inset:0,opacity:0,cursor:'pointer',width:'100%',height:'100%',border:'none',padding:0}} />
                </label>
              );
            })()}
          </div>
          <div className="status-new__actions">
            <button type="button" className="status-new__cancel" onClick={() => { setAdding(false); setNewColor(null); setNewCls('badge--neutral'); }}>Cancelar</button>
            <button type="button" className="status-new__save" onClick={addStatus}>Guardar</button>
          </div>
        </div>
      ) : (
        <button type="button" className="status-card status-card--add" onClick={() => setAdding(true)}>
          <Icon name="plus" size={13} stroke={2} />
          Nuevo estado
        </button>
      )}
    </div>
  );
}

function DashClock({ lang }) {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const h12 = String(h % 12 || 12).padStart(2, '0');
  const ampm = h < 12 ? 'AM' : 'PM';
  const dateStr = now.toLocaleDateString(lang === 'es' ? 'es-DO' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="dash-clock">
<div className="dash-clock__time">
        <span className="dash-clock__hm">{h12}:{m}</span>
        <span className="dash-clock__ss">{ss}</span>
        <span className="dash-clock__ampm">{ampm}</span>
      </div>
      <div className="dash-clock__date">{dateStr}</div>
    </div>
  );
}

function EditPhotoField({ gender, photo, onChange, t }) {
  const fileRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const [lightbox, setLightbox] = React.useState(false);

  React.useEffect(() => {
    if (!lightbox) return;
    const onKey = e => { if (e.key === 'Escape') setLightbox(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox]);

  function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => onChange(e.target.result);
    reader.readAsDataURL(file);
  }

  const iconName = gender === 'M' ? 'photoMale' : gender === 'F' ? 'photoFemale' : 'user';

  return (
    <div className="edit-photo">
      <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}}
        onChange={e => loadFile(e.target.files[0])}/>

      <div className={`edit-photo__avatar${gender ? ' edit-photo__avatar--active' : ''}`}
        onClick={() => photo ? setLightbox(true) : fileRef.current.click()}
        style={{cursor: photo ? 'zoom-in' : 'pointer'}}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); loadFile(e.dataTransfer.files[0]); }}>
        {photo
          ? <img src={photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/>
          : <Icon name={iconName} size={30} stroke={1.4}/>}
        {dragging && <div className="edit-photo__drag-overlay"/>}
      </div>

      <div className="edit-photo__actions">
        <div className="edit-photo__hint">
          {photo ? 'Toca la foto para ampliar' : 'JPG / PNG · máx. 2MB'}
        </div>
        <button type="button" className="btn btn--ghost" style={{fontSize:12,padding:'6px 14px'}}
          onClick={() => fileRef.current.click()}>
          <Icon name="upload" size={13}/> {photo ? 'Cambiar foto' : (t.reg_photo_upload || 'Subir foto')}
        </button>
        {photo && (
          <button type="button" className="btn btn--ghost" style={{fontSize:12,padding:'6px 14px',color:'var(--danger)',borderColor:'rgba(193,85,77,.3)'}}
            onClick={() => onChange(null)}>
            <Icon name="trash" size={13}/> Quitar
          </button>
        )}
      </div>

      {lightbox && (
        <div className="photo-lightbox" onClick={() => setLightbox(false)}>
          <img src={photo} alt="" className="photo-lightbox__img" onClick={e => e.stopPropagation()}/>
          <button className="photo-lightbox__close" onClick={() => setLightbox(false)}>
            <Icon name="x" size={20} stroke={2}/>
          </button>
        </div>
      )}
    </div>
  );
}

function MonthGroup({ label, unjust, total, defaultOpen, children }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div>
      {/* cabecera de mes — patrón acc-sec__title */}
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        width:'100%', display:'flex', alignItems:'center', gap:8,
        padding:'10px 0', background:'none', border:'none', cursor:'pointer',
      }}>
        <span style={{
          fontFamily:'var(--font-sans)', fontSize:11, color:'var(--ink-300)',
          display:'inline-block',
          transition:'transform .15s', transform: open ? 'rotate(180deg)' : 'none',
        }}>▾</span>
        <span style={{
          fontFamily:'var(--font-sans)', fontSize:11, fontWeight:700,
          textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--ink-400)',
          flex:1, textAlign:'left',
        }}>{label}</span>
        {unjust > 0 && (
          <span className="badge badge--err" style={{ fontSize:10, padding:'2px 8px' }}>
            {unjust} sin justificar
          </span>
        )}
      </button>
      <div style={{ display:'grid', gridTemplateRows: open ? '1fr' : '0fr', transition:'grid-template-rows 0.28s cubic-bezier(0, 0, 0.2, 1)', overflow:'hidden' }}>
        <div style={{ minHeight:0, paddingBottom: open ? 6 : 0 }}>{children}</div>
      </div>
    </div>
  );
}

function AbsenceSection({ empId, absences, workDays, onAdd, onJustify, onUnjustify, onRemove }) {
  const [open,         setOpen        ] = React.useState(false);
  const [date,         setDate        ] = React.useState(''); // DD/MM/YYYY
  const [isJustified,  setIsJustified ] = React.useState(false);
  const [justifyNote,  setJustifyNote ] = React.useState('');
  const [formErrors,   setFormErrors  ] = React.useState({});
  const [justifyingId, setJustifyingId] = React.useState(null);
  const [laterNote,    setLaterNote   ] = React.useState('');
  const [laterErr,     setLaterErr    ] = React.useState(false);
  const [deletingAbsId, setDeletingAbsId] = React.useState(null);
  const [hoveredAbsId,  setHoveredAbsId ] = React.useState(null);
  const unjustified = absences.filter(a => !a.justified).length;
  const isOut = unjustified >= 3;

  const resetForm = () => { setDate(''); setIsJustified(false); setJustifyNote(''); setFormErrors({}); };

  const usedAbsDates = React.useMemo(() => new Set(absences.map(a => a.date)), [absences]);

  const submit = () => {
    const errs = {};
    const sd = toStorageDate(date);
    if (!sd) errs.date = true;
    if (sd && usedAbsDates.has(sd)) errs.date = 'dup';
    if (isJustified && !justifyNote.trim()) errs.note = true;
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    onAdd(empId, sd, isJustified, isJustified ? justifyNote.trim() : '');
    resetForm(); setOpen(false);
  };

  return (
    <div>
      {/* ── encabezado de sección — patrón acc-sec__title ── */}
      <div className="acc-sec__title" style={{ marginBottom: open ? 16 : 18 }}>
        <Icon name="absent" size={15}/>
        Ausencias
        {absences.length > 0 && <span className="badge badge--neutral" style={{ fontSize:10, padding:'2px 8px' }}>{absences.length}</span>}
        {isOut && <span className="badge badge--err" style={{ fontSize:10, padding:'2px 8px' }}>OUT</span>}
        <button className="btn btn--ghost" style={{ marginLeft:'auto', fontSize:13, padding:'7px 16px', gap:6 }}
          onClick={() => setOpen(o => !o)}>
          <Icon name="plus" size={13}/> Registrar ausencia
        </button>
      </div>

      {/* ── formulario de registro — patrón acc-sec ── */}
      <div style={{ display:'grid', gridTemplateRows: open ? '1fr' : '0fr', transition:'grid-template-rows 0.30s cubic-bezier(0, 0, 0.2, 1)', overflow:'hidden' }}><div style={{ minHeight:0 }}>
        <div style={{
          background:'var(--cream-100)', border:'1px solid var(--ink-100)',
          borderRadius:'var(--radius-md)', padding:'16px', marginBottom:16,
          display:'flex', flexDirection:'column', gap:14,
        }}>
          {/* fila fecha + toggle justificación */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, alignItems:'end' }}>
            <div className={`field${formErrors.date ? ' field--error' : ''}`}>
              <span className="field__label">Fecha <span className="field__req">*</span></span>
              <DatePickerField value={date} onChange={v => { setDate(v); setFormErrors(p => ({ ...p, date: false })); }} disabledDates={usedAbsDates} />
              {formErrors.date === 'dup' && <span className="field__err">Ya existe una ausencia en esta fecha.</span>}
            </div>
            <div className="field">
              <span className="field__label">¿Tiene justificación?</span>
              <button type="button" onClick={() => { setIsJustified(j => !j); setJustifyNote(''); setFormErrors(p => ({ ...p, note: false })); }}
                style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'10px 14px', width:'100%', textAlign:'left',
                  border:`1px solid ${isJustified ? 'var(--success)' : 'var(--ink-100)'}`,
                  borderRadius:10, background: isJustified ? 'rgba(79,157,122,0.07)' : '#fff',
                  fontFamily:'var(--font-sans)', fontSize:13,
                  color: isJustified ? 'var(--success)' : 'var(--ink-400)',
                  cursor:'pointer', transition:'all .15s',
                }}>
                <span style={{
                  width:18, height:18, borderRadius:'50%', flexShrink:0,
                  background: isJustified ? 'var(--success)' : 'transparent',
                  border:`2px solid ${isJustified ? 'var(--success)' : 'var(--ink-200)'}`,
                  display:'grid', placeItems:'center',
                }}>
                  {isJustified && <Icon name="check" size={10} stroke={3}/>}
                </span>
                {isJustified ? 'Sí, está justificada' : 'No, sin justificación'}
              </button>
            </div>
          </div>

          {/* campo de nota — solo si está justificada */}
          {isJustified && (
            <div className={`field${formErrors.note ? ' field--error' : ''}`}>
              <span className="field__label">Razón de justificación <span className="field__req">*</span></span>
              <input className="field__input" value={justifyNote}
                onChange={e => { setJustifyNote(e.target.value); setFormErrors(p => ({ ...p, note: false })); }}
                placeholder="Ej. Certificado médico, permiso aprobado…"
                autoFocus />
            </div>
          )}

          <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
            <button className="btn btn--ghost" onClick={() => { setOpen(false); resetForm(); }}>Cancelar</button>
            <button className="btn btn--primary" onClick={submit}>Agregar</button>
          </div>
        </div>
      </div></div>

      {/* ── lista de ausencias agrupada por mes (solo año en curso) ── */}
      {absences.length === 0 ? (
        <p style={{ fontFamily:'var(--font-sans)', fontSize:13, color:'var(--ink-400)', margin:0 }}>Sin ausencias registradas.</p>
      ) : (() => {
        const currentYear = String(new Date().getFullYear());
        const sorted = [...absences]
          .filter(a => a.date.startsWith(currentYear))
          .sort((a,b) => b.date.localeCompare(a.date));
        if (sorted.length === 0) return (
          <p style={{ fontFamily:'var(--font-sans)', fontSize:13, color:'var(--ink-400)', margin:0 }}>Sin ausencias en {currentYear}.</p>
        );
        const groups = [];
        sorted.forEach(a => {
          const key = a.date.slice(0,7); // YYYY-MM
          let g = groups.find(g => g.key === key);
          if (!g) { groups.push({ key, items:[] }); g = groups[groups.length-1]; }
          g.items.push(a);
        });
        return (
          <div style={{ display:'flex', flexDirection:'column' }}>
            {groups.map((g, gi) => {
              const [y, m] = g.key.split('-');
              const label = `${MONTHS_ES[+m-1]} ${y}`;
              const unjust = g.items.filter(a => !a.justified).length;
              return (
                <MonthGroup key={g.key} label={label} unjust={unjust} total={g.items.length} defaultOpen={gi === 0}>
                  {g.items.map((a, ai) => (
                    <div key={a.id}>
                      <div
                        onMouseEnter={e => { setHoveredAbsId(a.id); e.currentTarget.style.background='var(--cream-100)'; }}
                        onMouseLeave={e => { setHoveredAbsId(null); e.currentTarget.style.background='transparent'; }}
                        style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 10px', borderRadius:8, background:'transparent', transition:'background .12s' }}>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink-600)', flexShrink:0 }}>{toDisplayDate(a.date)}</span>
                        <span style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--ink-300)', flexShrink:0 }}>
                          {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][new Date(a.date).getDay()]}
                        </span>
                        {a.justified
                          ? <span className="badge badge--ok"  style={{ fontSize:10, padding:'2px 8px', flexShrink:0 }}>Justificada</span>
                          : <span className="badge badge--err" style={{ fontSize:10, padding:'2px 8px', flexShrink:0 }}>No Justificada</span>
                        }
                        {a.justified && a.justifyNote && (
                          <span style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--ink-400)', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {a.justifyNote}
                          </span>
                        )}
                        <div style={{ marginLeft:'auto', display:'flex', gap:2, opacity: hoveredAbsId === a.id || justifyingId === a.id || deletingAbsId === a.id ? 1 : 0, transition:'opacity .15s' }}>
                          <button
                            title={a.justified ? 'Quitar justificación' : 'Justificar'}
                            onClick={() => {
                              if (a.justified) { onUnjustify(empId, a.id); }
                              else { setJustifyingId(justifyingId === a.id ? null : a.id); setLaterNote(''); setLaterErr(false); setDeletingAbsId(null); }
                            }}
                            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink-400)', display:'flex', alignItems:'center', padding:4, borderRadius:4, transition:'color .12s' }}
                            onMouseEnter={e => e.currentTarget.style.color = a.justified ? 'var(--danger)' : 'var(--ink-700)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-400)'}>
                            <Icon name="edit" size={12} stroke={1.8}/>
                          </button>
                          <button onClick={() => { setDeletingAbsId(deletingAbsId === a.id ? null : a.id); setJustifyingId(null); }}
                            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink-400)', display:'flex', alignItems:'center', padding:4, borderRadius:4, transition:'color .12s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-400)'}>
                            <Icon name="trash" size={12} stroke={1.8}/>
                          </button>
                        </div>
                      </div>

                      {/* confirmación eliminar — animada */}
                      <div style={{ display:'grid', gridTemplateRows: deletingAbsId === a.id ? '1fr' : '0fr', transition:'grid-template-rows 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)', overflow:'hidden' }}>
                        <div style={{ minHeight:0, opacity: deletingAbsId === a.id ? 1 : 0, transform: deletingAbsId === a.id ? 'translateY(0)' : 'translateY(-4px)', transition:'opacity 0.18s ease, transform 0.18s ease' }}>
                          <div style={{ margin:'4px 0 8px', padding:'10px 14px', background:'rgba(220,38,38,0.06)', borderRadius:'var(--radius-md)', border:'1px solid rgba(220,38,38,0.2)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                            <span style={{ fontFamily:'var(--font-sans)', fontSize:12, color:'var(--danger)' }}>¿Eliminar esta ausencia? Esta acción no se puede deshacer.</span>
                            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                              <button className="btn btn--ghost" style={{ fontSize:11, padding:'3px 10px' }}
                                onClick={() => setDeletingAbsId(null)}>Cancelar</button>
                              <button style={{ fontSize:11, padding:'3px 10px', background:'var(--danger)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight:600 }}
                                onClick={() => { onRemove(empId, a.id); setDeletingAbsId(null); }}>Eliminar</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* formulario inline justificación — animado */}
                      <div style={{ display:'grid', gridTemplateRows: justifyingId === a.id ? '1fr' : '0fr', transition:'grid-template-rows 0.28s cubic-bezier(0, 0, 0.2, 1)', overflow:'hidden' }}>
                        <div style={{ minHeight:0 }}>
                          <div style={{
                            margin:'4px 0 8px', padding:'8px 10px',
                            background:'var(--cream-100)', borderRadius:'var(--radius-md)',
                            display:'flex', gap:8, alignItems:'center',
                            border: laterErr ? '1px solid var(--danger)' : '1px solid var(--ink-100)',
                          }}>
                            <input
                              value={laterNote}
                              onChange={e => { setLaterNote(e.target.value); setLaterErr(false); }}
                              placeholder="Razón de justificación…"
                              style={{
                                flex:1, border:'none', background:'transparent', outline:'none',
                                fontFamily:'var(--font-sans)', fontSize:12, color:'var(--ink-700)',
                              }} />
                            <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                              <button className="btn btn--ghost" style={{ fontSize:11, padding:'3px 10px' }}
                                onClick={() => { setJustifyingId(null); setLaterNote(''); }}>Cancelar</button>
                              <button className="btn btn--primary" style={{ fontSize:11, padding:'3px 10px' }}
                                onClick={() => {
                                  if (!laterNote.trim()) { setLaterErr(true); return; }
                                  onJustify(empId, a.id, laterNote.trim());
                                  setJustifyingId(null); setLaterNote('');
                                }}>Confirmar</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </MonthGroup>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}


/* ── Eventualidades Section ────────────────────────────────── */
const EVENT_KEY = 'uasd_eventualidades';
function getEventualidades() {
  try { return JSON.parse(localStorage.getItem(EVENT_KEY) || '{}'); } catch { return {}; }
}
function saveEventualidades(map) {
  localStorage.setItem(EVENT_KEY, JSON.stringify(map));
}

function toDisplayDate(v) {
  if (!v) return v;
  const [y, m, d] = v.split('-');
  return (!y || !m || !d) ? v : `${d}/${m}/${y}`;
}
function toStorageDate(v) {
  if (!v) return '';
  const [d, m, y] = v.split('/');
  if (!d || !m || !y || y.length < 4) return '';
  return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
}

const EVENT_TYPE = {
  eventualidad: { label_es: 'Trabajo extra',      label_en: 'Extra work',        cls: 'badge--ok'      },
  dia_libre:    { label_es: 'Día compensatorio',  label_en: 'Compensatory day',  cls: 'badge--warn'    },
  permiso:      { label_es: 'Permiso',            label_en: 'Leave permit',      cls: 'badge--neutral' },
};

function EventualidadSection({ empId, lang }) {
  const [map, setMap]         = React.useState(getEventualidades);
  const [customLabels, setCustomLabels] = React.useState(function() {
    try { return JSON.parse(localStorage.getItem('uasd_event_type_labels') || '[]'); } catch(e) { return []; }
  });
  const [open, setOpen]       = React.useState(false);
  const [date, setDate]       = React.useState('');
  const [type, setType]       = React.useState('eventualidad');
  const [motivo, setMotivo]   = React.useState('');
  const [err, setErr]         = React.useState({});
  const [deletingEvId, setDeletingEvId] = React.useState(null);


  const items = (map[empId] || []).slice().sort((a, b) => b.date.localeCompare(a.date));

  const usedEvDates = React.useMemo(() => new Set(items.map(x => x.date)), [items]);

  const tLabel = (typeKey) => {
    if (EVENT_TYPE[typeKey]) return lang === 'es' ? EVENT_TYPE[typeKey].label_es : EVENT_TYPE[typeKey].label_en;
    return typeKey;
  };

  const typeOptions = React.useMemo(function() {
    var builtin = Object.keys(EVENT_TYPE).map(function(k) {
      return lang === 'es' ? EVENT_TYPE[k].label_es : EVENT_TYPE[k].label_en;
    });
    return builtin.concat(customLabels);
  }, [customLabels, lang]);

  const handleTypeChange = function(label) {
    var trimmed = label.trim();
    if (!trimmed) return;
    var builtinKey = Object.keys(EVENT_TYPE).find(function(k) {
      return (lang === 'es' ? EVENT_TYPE[k].label_es : EVENT_TYPE[k].label_en).toLowerCase() === trimmed.toLowerCase();
    });
    if (builtinKey) { setType(builtinKey); return; }
    setType(trimmed);
    if (!customLabels.some(function(l) { return l.toLowerCase() === trimmed.toLowerCase(); })) {
      var updated = customLabels.concat([trimmed]);
      localStorage.setItem('uasd_event_type_labels', JSON.stringify(updated));
      setCustomLabels(updated);
    }
  };

  const handleRemoveType = function(label) {
    var updated = customLabels.filter(function(l) { return l !== label; });
    localStorage.setItem('uasd_event_type_labels', JSON.stringify(updated));
    setCustomLabels(updated);
    if (type === label) setType('eventualidad');
  };

  const removableTypeOptions = React.useMemo(function() {
    return new Set(customLabels);
  }, [customLabels]);

  const reset = () => { setDate(''); setType('eventualidad'); setMotivo(''); setErr({}); };

  const submit = () => {
    const e = {};
    const sd = toStorageDate(date);
    if (!sd) e.date = true;
    if (sd && usedEvDates.has(sd)) e.date = 'dup';
    if (!motivo.trim()) e.motivo = true;
    if (Object.keys(e).length) { setErr(e); return; }
    const entry = { id: Date.now() + Math.random(), date: sd, type, motivo: motivo.trim() };
    const next = { ...map, [empId]: [...(map[empId] || []), entry] };
    setMap(next); saveEventualidades(next);
    reset(); setOpen(false);
  };

  const remove = (id) => {
    const next = { ...map, [empId]: (map[empId] || []).filter(x => x.id !== id) };
    setMap(next); saveEventualidades(next);
  };

  return (
    <div>
      <div className="acc-sec__title" style={{ marginBottom: open ? 16 : 18 }}>
        <Icon name="calendar" size={15}/>
        {lang === 'es' ? 'Eventualidades' : 'Eventualities'}
        {items.length > 0 && <span className="badge badge--neutral" style={{fontSize:10,padding:'2px 8px'}}>{items.length}</span>}
        <button className="btn btn--ghost" style={{ marginLeft:'auto', fontSize:13, padding:'7px 16px', gap:6 }}
          onClick={() => setOpen(o => !o)}>
          <Icon name="plus" size={13}/> {lang === 'es' ? 'Agregar eventualidad' : 'Add record'}
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateRows: open ? '1fr' : '0fr', transition:'grid-template-rows 0.30s cubic-bezier(0, 0, 0.2, 1)', overflow:'hidden' }}><div style={{ minHeight:0 }}>
        <div style={{
          background:'var(--cream-100)', border:'1px solid var(--ink-100)',
          borderRadius:'var(--radius-md)', padding:'16px', marginBottom:16,
          display:'flex', flexDirection:'column', gap:14,
        }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, alignItems:'end' }}>
            <div className={`field${err.date ? ' field--error' : ''}`}>
              <span className="field__label">{lang === 'es' ? 'Fecha' : 'Date'} <span className="field__req">*</span></span>
              <DatePickerField value={date} onChange={v => { setDate(v); setErr(p => ({...p, date: false})); }} disabledDates={usedEvDates} />
              {err.date === 'dup' && <span className="field__err">{lang === 'es' ? 'Ya existe una eventualidad en esta fecha.' : 'A record already exists for this date.'}</span>}
            </div>
            <div className="field">
              <span className="field__label">{lang === 'es' ? 'Tipo' : 'Type'} <span className="field__req">*</span></span>
              <ComboBoxField
                value={tLabel(type)}
                options={typeOptions}
                maxLength={50}
                placeholder={lang === 'es' ? 'Seleccionar o agregar tipo…' : 'Select or add type…'}
                onChange={handleTypeChange}
                requireSelection
                removableOptions={removableTypeOptions}
                onRemoveOption={handleRemoveType}
              />
            </div>
          </div>
          <div className={`field${err.motivo ? ' field--error' : ''}`}>
            <span className="field__label">{lang === 'es' ? 'Motivo' : 'Reason'} <span className="field__req">*</span></span>
            <input className="field__input" value={motivo}
              onChange={e => { setMotivo(e.target.value); setErr(p => ({...p, motivo: false})); }}
              placeholder={type === 'eventualidad'
                ? (lang === 'es' ? 'Ej. Proyecto especial, sustitución…'   : 'e.g. Special project, substitution…')
                : type === 'dia_libre'
                ? (lang === 'es' ? 'Ej. Permiso personal, cita médica…'    : 'e.g. Personal leave, medical appointment…')
                : type === 'permiso'
                ? (lang === 'es' ? 'Ej. Cita médica, diligencia personal…' : 'e.g. Medical appointment, personal errand…')
                : (lang === 'es' ? 'Descripción…' : 'Description…')
              } />
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
            <button className="btn btn--ghost" onClick={() => { setOpen(false); reset(); }}>{lang === 'es' ? 'Cancelar' : 'Cancel'}</button>
            <button className="btn btn--primary" onClick={submit}>{lang === 'es' ? 'Guardar' : 'Save'}</button>
          </div>
        </div>
      </div></div>

      {(() => {
        const currentYear = String(new Date().getFullYear());
        const yearItems = items.filter(ev => ev.date.startsWith(currentYear));
        if (yearItems.length === 0) return (
          <p style={{ fontFamily:'var(--font-sans)', fontSize:13, color:'var(--ink-400)', margin:0 }}>
            {lang === 'es' ? `Sin eventualidades en ${currentYear}.` : `No eventualities in ${currentYear}.`}
          </p>
        );
        const groups = [];
        yearItems.forEach(ev => {
          const key = ev.date.slice(0, 7);
          let g = groups.find(g => g.key === key);
          if (!g) { groups.push({ key, items: [] }); g = groups[groups.length - 1]; }
          g.items.push(ev);
        });
        return (
          <div style={{ display:'flex', flexDirection:'column' }}>
            {groups.map((g, gi) => {
              const [y, m] = g.key.split('-');
              const label = `${MONTHS_ES[+m - 1]} ${y}`;
              return (
                <MonthGroup key={g.key} label={label} total={g.items.length} defaultOpen={gi === 0}>
                  {g.items.map(ev => (
                    <div key={ev.id}>
                      <div
                        onMouseEnter={e => { e.currentTarget.style.background='var(--cream-100)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}
                        style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 10px', borderRadius:8, background:'transparent', transition:'background .12s' }}>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink-600)', flexShrink:0 }}>
                          {toDisplayDate(ev.date)}
                        </span>
                        <span style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--ink-300)', flexShrink:0 }}>
                          {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][new Date(ev.date).getDay()]}
                        </span>
                        <span className={`badge ${EVENT_TYPE[ev.type] ? EVENT_TYPE[ev.type].cls : 'badge--neutral'}`} style={{ fontSize:10, padding:'2px 8px', flexShrink:0 }}>
                          {tLabel(ev.type)}
                        </span>
                        <span style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--ink-400)', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {ev.motivo}
                        </span>
                        <div style={{ marginLeft:'auto', display:'flex', gap:2, opacity: deletingEvId === ev.id ? 1 : 0, transition:'opacity .15s' }}>
                          <button onClick={() => setDeletingEvId(deletingEvId === ev.id ? null : ev.id)}
                            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink-400)', display:'flex', alignItems:'center', padding:4, borderRadius:4, transition:'color .12s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-400)'}>
                            <Icon name="trash" size={12} stroke={1.8}/>
                          </button>
                        </div>
                      </div>
                      <div style={{ display:'grid', gridTemplateRows: deletingEvId === ev.id ? '1fr' : '0fr', transition:'grid-template-rows 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)', overflow:'hidden' }}>
                        <div style={{ minHeight:0, opacity: deletingEvId === ev.id ? 1 : 0, transform: deletingEvId === ev.id ? 'translateY(0)' : 'translateY(-4px)', transition:'opacity 0.18s ease, transform 0.18s ease' }}>
                          <div style={{ margin:'4px 0 8px', padding:'10px 14px', background:'rgba(220,38,38,0.06)', borderRadius:'var(--radius-md)', border:'1px solid rgba(220,38,38,0.2)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                            <span style={{ fontFamily:'var(--font-sans)', fontSize:12, color:'var(--danger)' }}>¿Eliminar esta eventualidad? Esta acción no se puede deshacer.</span>
                            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                              <button className="btn btn--ghost" style={{ fontSize:11, padding:'3px 10px' }}
                                onClick={() => setDeletingEvId(null)}>Cancelar</button>
                              <button style={{ fontSize:11, padding:'3px 10px', background:'var(--danger)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight:600 }}
                                onClick={() => { remove(ev.id); setDeletingEvId(null); }}>Eliminar</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </MonthGroup>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}

function StrikeBadge({ count }) {
  const color = count >= 3 ? 'var(--danger)'
              : count === 2 ? 'var(--gold-500)'
              : count === 1 ? 'var(--success)'
              : null;
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:3 }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width:7, height:7, borderRadius:'50%', display:'block',
          background: color && i < count ? color : 'var(--ink-100)',
          border: `1.5px solid ${color && i < count ? color : 'var(--ink-200)'}`,
        }}/>
      ))}
    </div>
  );
}

function DashboardView({ t, lang, setLang, setRoute, extraEmployees = [] }) {
  const canEnroll = typeof userHasPermission !== 'function' || userHasPermission('enroll');
  const canManage = typeof userHasPermission !== 'function' || userHasPermission('manage');
  const [filter, setFilter] = React.useState('all');
  const [subFilter, setSubFilter] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [employees, setEmployees] = React.useState(() => {
    const emailOverrides = typeof getEmployeeEmails === 'function' ? getEmployeeEmails() : {};
    return [...EMPLOYEES, ...extraEmployees].map(e =>
      emailOverrides[e.id] ? { ...e, email: emailOverrides[e.id] } : e
    );
  });
  const [selectedId, setSelectedId] = React.useState(EMPLOYEES[0]?.id || null);
  const allDepts = React.useMemo(() => [...new Set(employees.map(e => e.dept))].sort(), [employees]);
  const allRoles = React.useMemo(() => [...new Set(employees.map(e => e.role))].sort(), [employees]);
  const [editTarget, setEditTarget] = React.useState(null);
  const [editErrors, setEditErrors] = React.useState({});
  const [editTab, setEditTab] = React.useState('profile');
  const [pendingTab, setPendingTab] = React.useState(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);
  const [photoExpanded, setPhotoExpanded] = React.useState(false);
  const [justifyingTard, setJustifyingTard] = React.useState(null);
  const [tardNote, setTardNote] = React.useState('');
  const [tardErr, setTardErr] = React.useState(false);
  const [deletingTardDate, setDeletingTardDate] = React.useState(null);
  const [hoveredTardDate, setHoveredTardDate] = React.useState(null);
  const [tardRegOpen, setTardRegOpen] = React.useState(false);
  const [tardRegDate, setTardRegDate] = React.useState('');
  const [tardRegTime, setTardRegTime] = React.useState('');
  const [tardRegJustified, setTardRegJustified] = React.useState(false);
  const [tardRegNote, setTardRegNote] = React.useState('');
  const [tardRegErrors, setTardRegErrors] = React.useState({});

  const [absencesMap, setAbsencesMap] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('uasd_absences') || '{}'); } catch { return {}; }
  });
  const saveAbsences = (map) => {
    setAbsencesMap(map);
    localStorage.setItem('uasd_absences', JSON.stringify(map));
  };
  const addAbsence = (empId, date, justified, justifyNote) => {
    const prev = absencesMap[empId] || [];
    saveAbsences({ ...absencesMap, [empId]: [...prev, { id: Date.now(), date, justified: !!justified, justifyNote: justifyNote || '' }] });
  };
  const justifyAbsence = (empId, absId, note) => {
    saveAbsences({ ...absencesMap, [empId]: (absencesMap[empId] || []).map(a => a.id === absId ? { ...a, justified: true, justifyNote: note || '' } : a) });
  };
  const unjustifyAbsence = (empId, absId) => {
    saveAbsences({ ...absencesMap, [empId]: (absencesMap[empId] || []).map(a => a.id === absId ? { ...a, justified: false, justifyNote: '' } : a) });
  };
  const removeAbsence = (empId, absId) => {
    saveAbsences({ ...absencesMap, [empId]: (absencesMap[empId] || []).filter(a => a.id !== absId) });
  };
  const unjustifiedCount = (empId) => (absencesMap[empId] || []).filter(a => !a.justified).length;
  const currentMonth = React.useMemo(() => new Date().toLocaleDateString('en-CA').slice(0, 7), []);
  const unjustifiedThisMonth = React.useCallback(
    (empId) => (absencesMap[empId] || []).filter(a => !a.justified && a.date.startsWith(currentMonth)).length,
    [absencesMap, currentMonth]
  );

  // Lock background scroll when any modal is open
  React.useEffect(() => {
    const locked = !!(editTarget || deleteConfirm);
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [editTarget, deleteConfirm]);
  const [exportOpen, setExportOpen] = React.useState(false);
  const exportRef    = React.useRef(null);
  const photoInputRef = React.useRef(null);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const statusRef = React.useRef(null);
  const [displayList, setDisplayList] = React.useState([]);
  const [phase, setPhase] = React.useState('idle');
  const first = React.useRef(true);

  React.useEffect(() => {
    if (!exportOpen) return;
    const onDoc = (e) => { if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [exportOpen]);

  React.useEffect(() => {
    if (!statusOpen) return;
    const onDoc = (e) => { if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [statusOpen]);

  const statusLabel = (e) => {
    if (e.status === 'inactive' && e.inactiveReason === 'retired') return t.dash_status_retired;
    if (e.status === 'inactive' && e.inactiveReason === 'suspended') return t.dash_status_suspended || 'Suspensión';
    if (e.status === 'inactive' && e.inactiveReason === 'other') return t.dash_status_inactive_other || t.dash_filter_licensed;
    if (e.status === 'inactive') return t.dash_status_inactive;
    const statusMap = { ok: t.dash_status_ok, pending: t.dash_status_pending, inactive: t.dash_status_inactive };
    return statusMap[e.status] || e.status;
  };

  const updateEmployee = (id, field, value) => {
    setEmployees((prev) => prev.map((emp) => emp.id === id ? { ...emp, [field]: value } : emp));
  };

  const deleteEmployee = (id) => {
    const emp = employees.find(e => e.id === id);
    if (emp) window.auditLog?.delete({ name: emp.name, id: emp.id });
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    setDeleteConfirm(null);
  };

  const openEditor = (employee) => { setEditTarget({ ...employee }); setEditTab('profile'); };

  const closeEditor = () => { setEditTarget(null); setEditErrors({}); setEditTab('profile'); };

  // Only updates editTarget — employees stays untouched until Guardar
  const updateEditField = (updates) => setEditTarget(prev => ({ ...prev, ...updates }));

  const REQUIRED_FIELDS = [
    { key: 'name',     label: 'Nombre' },
    { key: 'cedula',   label: 'Cédula o Pasaporte' },
    { key: 'dept',     label: 'Departamento' },
    { key: 'role',     label: 'Cargo' },
    { key: 'email',    label: 'Correo' },
    { key: 'phone',    label: 'Teléfono' },
    { key: 'dob',      label: 'Fecha de nacimiento' },
    { key: 'schedule',  label: 'Jornada' },
    { key: 'workDays',  label: 'Jornada laboral' },
  ];

  const saveEditor = () => {
    if (!editTarget) return;
    const errs = {};
    if (!editTarget.name?.trim()) errs.name = true;
    if (!editTarget.cedula?.trim()) errs.cedula = true;
    if (!editTarget.dept?.trim()) errs.dept = true;
    if (!editTarget.role?.trim()) errs.role = true;
    if (!editTarget.email?.trim()) errs.email = true;
    if (!editTarget.phone || editTarget.phone.replace(/\D/g,'').length === 0) errs.phone = true;
    if (!editTarget.dob?.trim()) errs.dob = true;
    if (!editTarget.schedule?.trim()) errs.schedule = true;
    if (!editTarget.workDays || editTarget.workDays.length === 0) errs.workDays = true;
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    setEditErrors({});
    window.auditLog?.edit({ name: editTarget.name, id: editTarget.id });
    setEmployees(prev => prev.map(e => e.id === editTarget.id ? editTarget : e));
    if (typeof saveEmployeeEmail === 'function') saveEmployeeEmail(editTarget.id, editTarget.email.trim());
    if (typeof getCredentials === 'function' && typeof saveCredential === 'function') {
      const c = getCredentials()[editTarget.id];
      if (c) saveCredential(editTarget.id, editTarget.email.trim(), c.password);
    }
    setEditTarget(null);
  };

  const clearError = (key) => setEditErrors((prev) => { const n = {...prev}; delete n[key]; return n; });

  const rawList = React.useMemo(() => {
    return employees.filter(e => {
      if (filter === 'active' && e.status !== 'ok') return false;
      if (filter === 'pending' && e.status !== 'pending') return false;
      if (filter === 'inactive' && e.status !== 'inactive') return false;
      if (subFilter === 'licensed' && !(e.status === 'inactive' && e.inactiveReason === 'other')) return false;
      if (subFilter === 'retired' && !(e.status === 'inactive' && e.inactiveReason === 'retired')) return false;
      if (subFilter === 'suspended' && !(e.status === 'inactive' && e.inactiveReason === 'suspended')) return false;
      if (query) {
        const q = query.toLowerCase();
        return e.name.toLowerCase().includes(q) ||
               e.cedula.includes(q) ||
               e.id.toLowerCase().includes(q) ||
               e.dept.toLowerCase().includes(q) ||
               e.role.toLowerCase().includes(q) ||
               (e.email && e.email.toLowerCase().includes(q)) ||
               (e.phone && e.phone.includes(q)) ||
               statusLabel(e).toLowerCase().includes(q) ||
               (e.inactiveComment && e.inactiveComment.toLowerCase().includes(q));
      }
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [filter, subFilter, query, employees]);

  // Crossfade: out → swap → in
  React.useEffect(() => {
    if (first.current) { first.current = false; setDisplayList(rawList); return; }
    setPhase('out');
    const t1 = setTimeout(() => {
      setDisplayList(rawList);
      setPhase('in');
    }, 70);
    return () => clearTimeout(t1);
  }, [rawList]);

  React.useEffect(() => {
    if (phase === 'in') {
      const t2 = setTimeout(() => setPhase('idle'), 580);
      return () => clearTimeout(t2);
    }
  }, [phase]);

  const tableRef = React.useRef(null);
  const segRef = React.useRef(null);
  const segItems = React.useRef({});
  const paneRefs = React.useRef({});

  React.useLayoutEffect(() => {
    if (!pendingTab) return;
    const panel = paneRefs.current[pendingTab];
    if (panel) {
      const inner = panel.querySelector('.edit-modal__pane__inner');
      const h = inner ? inner.scrollHeight : 300;
      const dur = Math.max(0.28, Math.min(0.60, h / 1400)) + 's';
      panel.style.setProperty('--pane-dur', dur);
    }
    setEditTab(pendingTab);
    setPendingTab(null);
  }, [pendingTab]);
  const [segPill, setSegPill] = React.useState({ opacity: 0 });

  React.useLayoutEffect(() => {
    const el = segItems.current[filter];
    const wrap = segRef.current;
    if (!el || !wrap) { setSegPill({ opacity: 0 }); return; }
    const er = el.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    setSegPill({
      opacity: 1,
      width: `${Math.round(er.width)}px`,
      transform: `translateX(${Math.round(er.left - wr.left)}px)`,
    });
  }, [filter, t]);

  const goPending = () => {
    setFilter('pending');
    setQuery('');
  };

  const chooseStatusFilter = (next) => {
    setSubFilter(next);
    setStatusOpen(false);
  };

  const filterOptions = [
    { id: 'all', label: t.dash_filter_all },
    { id: 'active', label: t.dash_filter_active },
    { id: 'pending', label: t.dash_filter_pending },
    { id: 'inactive', label: t.dash_filter_inactive },
  ];

  const statusMenuEnabled = filter === 'inactive';
  const statusFilterLabel =
    subFilter === 'licensed' ? t.dash_filter_licensed :
    subFilter === 'retired' ? t.dash_filter_retired :
    subFilter === 'suspended' ? t.dash_filter_suspended :
    filterOptions.find((entry) => entry.id === filter)?.label || t.dash_col_status;

  const activeCount  = React.useMemo(() => employees.filter(e => e.status === 'ok').length,      [employees]);
  const pendingCount = React.useMemo(() => employees.filter(e => e.status === 'pending').length,  [employees]);

  const todayStr = React.useMemo(() => new Date().toLocaleDateString('en-CA'), []);

  const [allAtt, setAllAtt] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('uasd_daily_attendance') || '{}'); } catch { return {}; }
  });
  const saveAllAtt = (map) => {
    setAllAtt(map);
    localStorage.setItem('uasd_daily_attendance', JSON.stringify(map));
  };
  const getTardanzas = (empId) => {
    if (!empId || !allAtt) return [];
    return Object.values(allAtt).filter(a => a.empId === empId && a.late);
  };
  const justifyTardanza = (empId, date, note) => {
    const key = `${empId}:${date}`;
    const rec = allAtt[key];
    if (!rec) return;
    saveAllAtt({ ...allAtt, [key]: { ...rec, justified: true, justifyNote: note || '' } });
  };
  const unjustifyTardanza = (empId, date) => {
    const key = `${empId}:${date}`;
    const rec = allAtt[key];
    if (!rec) return;
    const { justifyNote, ...rest } = rec;
    saveAllAtt({ ...allAtt, [key]: { ...rest, justified: false } });
  };
  const removeTardanza = (empId, date) => {
    const key = `${empId}:${date}`;
    const next = { ...allAtt };
    delete next[key];
    saveAllAtt(next);
  };

  const addTardanza = (empId, date, time, justified, note) => {
    const key = `${empId}:${date}`;
    const existing = allAtt[key];
    saveAllAtt({ ...allAtt, [key]: { ...existing, empId, date, time, late: true, justified: !!justified, justifyNote: justified ? (note || '') : (existing?.justifyNote || '') } });
  };

  // Poll for real-time attendance updates
  React.useEffect(() => {
    const id = setInterval(() => {
      try {
        const fresh = JSON.parse(localStorage.getItem('uasd_daily_attendance') || '{}');
        setAllAtt(fresh);
      } catch {}
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const todayAtt = React.useMemo(() => {
    const result = {};
    Object.entries(allAtt).forEach(([key, val]) => {
      if (key.endsWith(`:${todayStr}`)) result[key.split(':')[0]] = val;
    });
    return result;
  }, [allAtt, todayStr]);

  const lateToday = React.useMemo(() => {
    return Object.values(todayAtt).filter(a => a.late).length;
  }, [todayAtt]);

  const getLiveLastIn = (empId) => {
    const records = Object.values(allAtt).filter(a => a.empId === empId);
    return records.sort((a, b) => b.date.localeCompare(a.date))[0]?.time?.slice(0, 5) || null;
  };

  const kpis = [
    { label: t.dash_kpi_total,   value: employees.length, icon: 'usersTotal' },
    { label: t.dash_kpi_active,  value: activeCount,  icon: 'usersActive', accent: 'ok', live: true },
    { label: t.dash_kpi_late,
      value: lateToday,
      icon: 'clock', accent: lateToday > 0 ? 'warn' : '' },
    { label: t.dash_kpi_pending, value: pendingCount, icon: 'doorOpen', accent: 'warn' },
  ];

  const exportExcel = () => {
    setExportOpen(false);
    const headers = ['ID', 'Cédula', t.dash_col_employee, t.dash_col_dept, t.dash_col_role, t.dash_col_schedule, t.dash_col_status, t.dash_fld_dob || 'Fecha nac.', t.dash_col_comment, t.dash_col_last];
    const rows = displayList.map(e => [e.id, e.cedula, e.name, e.dept, e.role, e.schedule, statusLabel(e), e.dob || '—', e.inactiveComment || t.dash_no_comment, e.lastIn]);
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(esc).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'UASD_empleados.xls';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    setExportOpen(false);
    const escHtml = (v) => String(v).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    const rowsHtml = displayList.map(e => `<tr>
      <td>${escHtml(e.id)}</td><td>${escHtml(e.cedula)}</td><td>${escHtml(e.name)}</td><td>${escHtml(e.dept)}</td>
      <td>${escHtml(e.role)}</td><td>${escHtml(e.schedule)}</td><td>${escHtml(statusLabel(e))}</td><td>${escHtml(e.dob || '—')}</td><td>${escHtml(e.inactiveComment || t.dash_no_comment)}</td><td>${escHtml(e.lastIn)}</td>
    </tr>`).join('');
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${t.dash_title} — UASD</title>
      <style>
        * { font-family: 'Manrope', Arial, sans-serif; }
        body { padding: 40px; color: #1A1F3A; }
        h1 { font-size: 20px; margin: 0 0 2px; }
        .sub { color: #5a6a90; font-size: 12px; margin-bottom: 22px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { text-align: left; text-transform: uppercase; letter-spacing: 0.06em; font-size: 9px; color: #5a6a90; border-bottom: 2px solid #1A1F3A; padding: 8px 6px; }
        td { padding: 8px 6px; border-bottom: 1px solid #e8ebf1; }
        @media print { @page { margin: 16mm; } }
      </style></head><body>
      <h1>${t.dash_title} — UASD</h1>
      <div class="sub">${t.appSub} · ${new Date().toLocaleDateString(lang === 'es' ? 'es-DO' : 'en-US')}</div>
      <table><thead><tr>
        <th>ID</th><th>Cédula</th><th>${t.dash_col_employee}</th><th>${t.dash_col_dept}</th>
        <th>${t.dash_col_role}</th><th>${t.dash_col_schedule}</th><th>${t.dash_col_status}</th><th>${t.dash_fld_dob || 'Fecha nac.'}</th><th>${t.dash_col_comment}</th><th>${t.dash_col_last}</th>
      </tr></thead><tbody>${rowsHtml}</tbody></table>
      </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 350);
  };

  return (
    <div className="page" onClick={() => setSelectedId(null)}>
      <div className="page__head">
        <div>
          <div className="page__title">{t.dash_title}</div>
          <div className="page__subtitle">{t.dash_sub}</div>
        </div>
        <div className="page__actions">
          <div className="export-wrap" ref={exportRef}>
            <button className="btn btn--ghost" onClick={() => setExportOpen(o => !o)}>
              <Icon name="download" size={14}/> {t.dash_export} <Icon name="chevDown" size={12}/>
            </button>
            {exportOpen && (
              <div className="export-menu">
                <button className="export-menu__item" onClick={exportPDF}>
                  <span className="export-menu__tag export-menu__tag--pdf">PDF</span> {t.dash_export_pdf}
                </button>
                <button className="export-menu__item" onClick={exportExcel}>
                  <span className="export-menu__tag export-menu__tag--xls">XLS</span> {t.dash_export_excel}
                </button>
              </div>
            )}
          </div>
          {canEnroll && (
            <button className="btn btn--primary" onClick={() => setRoute('register')}>
              <Icon name="plus" size={14}/> {t.dash_new}
            </button>
          )}
        </div>
      </div>

      <div className={`kpi-grid kpi-grid--${kpis.length}`}>
        {kpis.map((k, i) => (
          <div className={`kpi ${k.fill ? 'kpi--fill' : ''} ${k.accent ? 'kpi--' + k.accent : ''}`} key={i}>
            <div className="kpi__top">
              <div className="kpi__icon"><Icon name={k.icon} size={26}/></div>
              {k.pill && (
                k.action ? (
                  <button className={`kpi__pill kpi__pill--btn ${k.dir === 'up' ? 'kpi__pill--up' : ''}`} onClick={k.action}>
                    {k.live && <span className="kpi__pill-dot"></span>}
                    {k.pill} <Icon name="arrowRight" size={12}/>
                  </button>
                ) : (
                  <span className={`kpi__pill ${k.dir === 'up' ? 'kpi__pill--up' : ''}`}>
                    {k.live && <span className="kpi__pill-dot"></span>}
                    {k.pill}
                  </span>
                )
              )}
            </div>
            <div className="kpi__foot">
              <div className="kpi__label">{k.label}</div>
              <div className="kpi__value"><FlipCounter value={typeof k.value === 'number' ? k.value.toLocaleString() : k.value} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="card card--table" ref={tableRef}>

        <div className="card__head">
          <div className="toolbar">
            <div className="toolbar__left">
              <div className="toolbar__search">
                <span className="toolbar__search-icon"><Icon name="search" size={15}/></span>
                <input placeholder={t.dash_search}
                       value={query} onChange={e => setQuery(e.target.value)}/>
                {query && (
                  <>
                    <span className="toolbar__search-count">{displayList.length}</span>
                    <button className="toolbar__search-clear" onClick={() => setQuery('')} aria-label="Limpiar">
                      <Icon name="x" size={13} stroke={2.4}/>
                    </button>
                  </>
                )}
              </div>
            </div>
            <DashClock lang={lang} />
            <div className="seg-filter" ref={segRef}>
              <span className="seg-filter__pill" style={segPill}></span>
              {filterOptions.map(f => (
                  <button key={f.id}
                          ref={(el) => (segItems.current[f.id] = el)}
                          className={`seg-filter__item ${filter === f.id ? 'seg-filter__item--active' : ''}`}
                          onClick={() => { setFilter(f.id); setSubFilter(null); }}>
                    {f.label}
                  </button>
              ))}
            </div>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th style={{width:'20%'}}>{t.dash_col_employee}</th>
              <th style={{width:'10%'}}>{t.dash_col_dept}</th>
              <th style={{width:'12%'}}>{t.dash_col_role}</th>
              <th style={{width:'10%'}}>{t.dash_col_schedule}</th>
              <th style={{width:'13%'}}>
                <div className="table__status-wrap" ref={statusRef}>
                  <button className={`table__status-filter ${statusMenuEnabled ? 'table__status-filter--active' : ''}`}
                          onClick={() => statusMenuEnabled && setStatusOpen((o) => !o)}
                          title={t.dash_col_status}>
                    {statusFilterLabel}
                    {statusMenuEnabled && <Icon name="chevDown" size={10} className="table__status-chevron"/>}
                  </button>
                  {statusOpen && statusMenuEnabled && (
                    <div className="table__status-menu">
                      <button className={`table__status-menu-item ${subFilter === null ? 'is-active' : ''}`}
                              onClick={() => chooseStatusFilter(null)}>
                        {t.dash_filter_all}
                      </button>
                      <button className={`table__status-menu-item ${subFilter === 'licensed' ? 'is-active' : ''}`}
                              onClick={() => chooseStatusFilter('licensed')}>
                        <StatusBadge status="inactive" t={t} employee={{ status: 'inactive', inactiveReason: 'other' }} />
                      </button>
                      <button className={`table__status-menu-item ${subFilter === 'suspended' ? 'is-active' : ''}`}
                              onClick={() => chooseStatusFilter('suspended')}>
                        <StatusBadge status="inactive" t={t} employee={{ status: 'inactive', inactiveReason: 'suspended' }} />
                      </button>
                      <button className={`table__status-menu-item ${subFilter === 'retired' ? 'is-active' : ''}`}
                              onClick={() => chooseStatusFilter('retired')}>
                        <StatusBadge status="inactive" t={t} employee={{ status: 'inactive', inactiveReason: 'retired' }} />
                      </button>
                    </div>
                  )}
                </div>
              </th>
              <th style={{width:'16%'}}>{t.dash_col_comment}</th>
              <th style={{width:'6%', textAlign:'center'}}>Ausencias</th>
              <th style={{width:'7%'}}></th>
              <th style={{width:'11%',textAlign:'right'}}>{t.dash_col_last}</th>
            </tr>
          </thead>
          <tbody className={phase !== 'idle' ? 'tbody--' + phase : ''}>
            {displayList.map((e, i) => {
              // Show live edits in the row without mutating employees
              const d = (editTarget && editTarget.id === e.id) ? editTarget : e;
              return (
                <tr
                key={e.id}
                className={selectedId === e.id ? 'table__row--selected' : ''}
                onClick={(ev) => { ev.stopPropagation(); setSelectedId(prev => prev === e.id ? null : e.id); }}
              >
                <td>
                  <div className="table__person">
                    <div className="table__avatar">{initials(d.name)}</div>
                    <div>
                      <div className="table__person-name">{d.name}</div>
                      <div className="table__person-id mono">{e.id} · {formatCedula(d.cedula)}</div>
                    </div>
                  </div>
                </td>
                <td><span className="table__text-value">{d.dept}</span></td>
                <td><span className="table__text-value">{d.role}</span></td>
                <td><span className="table__text-value mono">{d.schedule}</span></td>
                <td>
                  <StatusBadge status={e.status} t={t} employee={e} />
                </td>
                <td>
                  <div className={`table__comment ${d.inactiveComment ? '' : 'table__comment--empty'}`}>
                    {d.inactiveComment || t.dash_no_comment}
                  </div>
                </td>
                <td style={{textAlign:'center'}}>
                  <StrikeBadge count={unjustifiedThisMonth(e.id)}/>
                </td>
                <td className="table__actions-cell">
                  {canManage && (
                    <div className="table__actions">
                      <button className="table__action-btn" onClick={(event) => { event.stopPropagation(); openEditor(e); }} title="Editar">
                        <Icon name="edit" size={14}/>
                      </button>
                      <button className="table__action-btn table__action-btn--del" onClick={(event) => { event.stopPropagation(); setDeleteConfirm(e); }} title="Eliminar">
                        <Icon name="trash" size={14}/>
                      </button>
                    </div>
                  )}
                </td>
                <td className="mono table__cell-last"><FlipCounter value={getLiveLastIn(e.id) || e.lastIn} /></td>
              </tr>
            ); })}
            {displayList.length === 0 && (
              <tr>
                <td colSpan="9" className="table__empty">
                  {t.dash_empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="table__footer">
          <span>{t.dash_showing.split('{n}').join(displayList.length).split('{total}').join(employees.length)}</span>
          <div className="hstack table__pagination">
            <button className="filter-chip">‹</button>
            <span className="mono">1 / {Math.max(1, Math.ceil(employees.length / 10))}</span>
            <button className="filter-chip">›</button>
          </div>
        </div>
      </div>

      {/* Card expandida de foto — fuera del modal para evitar stacking context del transform */}
      {photoExpanded && editTarget?.photo && (
        <div style={{
          position:'fixed', inset:0, zIndex:99999,
          background:'rgba(10,12,24,0.72)', backdropFilter:'blur(4px)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }} onClick={() => setPhotoExpanded(false)}>
          <div style={{
            background:'var(--paper)', borderRadius:'var(--radius-lg)',
            boxShadow:'0 24px 64px rgba(0,0,0,0.35)',
            padding:40, display:'flex', flexDirection:'column', alignItems:'center', gap:24,
            width:460,
          }} onClick={e => e.stopPropagation()}>
            <img src={editTarget.photo} alt="Foto de perfil"
              style={{width:280, height:280, objectFit:'cover', borderRadius:'50%',
                border:'4px solid var(--ink-100)', boxShadow:'0 12px 32px rgba(0,0,0,0.18)'}}/>
            <div style={{textAlign:'center'}}>
              <div style={{fontWeight:700, fontSize:18, color:'var(--ink-800)'}}>{editTarget.name}</div>
              <div style={{fontSize:13, color:'var(--ink-400)', marginTop:6, fontFamily:'var(--font-mono)'}}>{editTarget.id}</div>
            </div>
            <div style={{display:'flex', gap:10, width:'100%'}}>
              <button className="btn btn--ghost" style={{flex:1}} onClick={() => setPhotoExpanded(false)}>
                Cerrar
              </button>
              <button className="btn btn--primary" style={{flex:1}}
                onClick={() => { setPhotoExpanded(false); setTimeout(() => photoInputRef.current?.click(), 50); }}>
                <Icon name="upload" size={13}/> Cambiar foto
              </button>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="edit-overlay" onClick={closeEditor}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal__head">
              <div className="edit-modal__head-id">
                <div className="edit-modal__avatar-wrap">
                  <input type="file" accept="image/*" style={{display:'none'}}
                    ref={photoInputRef}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => { updateEditField({ photo: ev.target.result }); setPhotoExpanded(false); };
                      reader.readAsDataURL(file);
                    }}/>
                  <div className="edit-modal__avatar"
                    onClick={() => editTarget.photo ? setPhotoExpanded(true) : photoInputRef.current?.click()}
                    style={{cursor: editTarget.photo ? 'zoom-in' : 'pointer'}}>
                    {editTarget.photo
                      ? <img src={editTarget.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/>
                      : initials(editTarget.name)}
                    <div className="edit-modal__avatar-overlay">
                      <Icon name={editTarget.photo ? 'eye' : 'upload'} size={14} stroke={2}/>
                    </div>
                  </div>

                </div>
                <div>
                  <div className="edit-modal__title">{editTarget.name}</div>
                  <div className="edit-modal__sub">{editTarget.id} · {formatCedula(editTarget.cedula)}</div>
                </div>
              </div>
              <button className="edit-modal__close" onClick={closeEditor} aria-label="Cerrar"><Icon name="x" size={18}/></button>
            </div>
            <div className="edit-modal__tabs">
              {[
                { id:'profile',        label:'Perfil' },
                { id:'tardanzas',      label:'Tardanzas' },
                { id:'eventualidades', label:'Eventualidades' },
                { id:'absences',       label:'Ausencias' },
              ].map(tab => (
                <button key={tab.id}
                  className={`edit-modal__tab ${editTab === tab.id ? 'edit-modal__tab--active' : ''}`}
                  onClick={() => setPendingTab(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="edit-modal__body">
              <div ref={el => paneRefs.current['profile'] = el} className={`edit-modal__pane${editTab === 'profile' ? ' edit-modal__pane--open' : ''}`}><div className="edit-modal__pane__inner edit-modal__grid">
                <div className={`field${editErrors.name ? ' field--error' : ''}`}>
                  <span className="field__label">{t.dash_col_employee} <span className="field__req">*</span></span>
                  <input className="field__input" value={editTarget.name} maxLength={30}
                    onChange={(e) => { clearError('name'); updateEditField({ name: e.target.value }); }} />
                </div>
                <div className={`field${editErrors.cedula ? ' field--error' : ''}`}>
                  <span className="field__label">Cédula o Pasaporte <span className="field__req">*</span></span>
                  <input className="field__input mono" value={formatCedula(editTarget.cedula)} maxLength={13}
                    onChange={(e) => {
                      clearError('cedula');
                      updateEditField({ cedula: e.target.value.replace(/\D/g, '').slice(0, 11) });
                    }} placeholder="000-0000000-0" />
                </div>
                {/* Género */}
                <div className="field edit-modal__full">
                  <span className="field__label">Género</span>
                  <div className="gender-picker">
                    {[{val:'M',label:'Masculino',color:'var(--ink-600)'},{val:'F',label:'Femenino',color:'#9e4d6b'}].map(o => {
                      const on = editTarget.gender === o.val;
                      return (
                        <button key={o.val} type="button"
                          className={`gender-picker__opt${on ? ' gender-picker__opt--on' : ''}`}
                          style={on ? { borderColor: o.color, background: o.color } : {}}
                          onClick={() => updateEditField({ gender: o.val })}>
                          {o.val === 'M' && <Icon name="userMale" size={13} stroke={1.6}/>}
                          {o.val === 'F' && <Icon name="userFemale" size={13} stroke={1.6}/>}
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>


                <div className={`field${editErrors.dept ? ' field--error' : ''}`}>
                  <span className="field__label">{t.dash_col_dept} <span className="field__req">*</span></span>
                  <ComboBoxField value={editTarget.dept} maxLength={50}
                    options={allDepts} requireSelection
                    onChange={(v) => { clearError('dept'); updateEditField({ dept: v }); }} />
                </div>
                <div className={`field${editErrors.role ? ' field--error' : ''}`}>
                  <span className="field__label">{t.dash_col_role} <span className="field__req">*</span></span>
                  <ComboBoxField value={editTarget.role} maxLength={30}
                    options={allRoles}
                    onChange={(v) => { clearError('role'); updateEditField({ role: v }); }} />
                </div>
                <div className={`field${editErrors.email ? ' field--error' : ''}`}>
                  <span className="field__label">{t.reg_fld_email || 'Correo institucional'} <span className="field__req">*</span></span>
                  <EmailField value={editTarget.email || ''}
                    onChange={(v) => { clearError('email'); updateEditField({ email: v }); }} />
                </div>
                <div className={`field${editErrors.phone ? ' field--error' : ''}`}>
                  <span className="field__label">{t.reg_fld_phone || 'Teléfono'} <span className="field__req">*</span></span>
                  <PhoneField value={editTarget.phone || ''}
                    onChange={(v) => { clearError('phone'); updateEditField({ phone: v }); }} />
                </div>
                <div className={`field${editErrors.dob ? ' field--error' : ''}`}>
                  <span className="field__label">{t.dash_fld_dob || 'Fecha de nacimiento'} <span className="field__req">*</span></span>
                  <DatePickerField value={editTarget.dob || ''} minAge={18} maxAge={100}
                    onChange={(v) => { clearError('dob'); updateEditField({ dob: v }); }} />
                </div>
                <div className={`field${editErrors.schedule ? ' field--error' : ''}`}>
                  <span className="field__label">{t.dash_col_schedule} <span className="field__req">*</span></span>
                  <TimePickerField value={editTarget.schedule}
                    onChange={(v) => { clearError('schedule'); updateEditField({ schedule: v }); }} />
                </div>
                <div className={`field${editErrors.workDays ? ' field--error' : ''}`}>
                  <span className="field__label">Jornada laboral <span className="field__req">*</span></span>
                  <WorkDaysPicker
                    value={editTarget.workDays}
                    onChange={(v) => { setEditErrors(p => ({...p, workDays: false})); updateEditField({ workDays: v }); }} />
                  <span style={{ fontSize:11, color:'var(--ink-300)', marginTop:4, display:'block' }}>
                    {workDaysLabel(editTarget.workDays)}
                  </span>
                </div>
                <div className="field edit-modal__full">
                  <span className="field__label">{t.dash_col_status}</span>
                  <StatusPicker
                    status={editTarget.status}
                    inactiveReason={editTarget.inactiveReason || null}
                    onChange={(status, reason) => setEditTarget(prev => ({ ...prev, status, inactiveReason: reason }))}
                    t={t} />
                </div>

                {/* ── Detalles de licencia laboral ── */}
                {editTarget.status === 'inactive' && editTarget.inactiveReason === 'other' && (<>
                  <div className="edit-modal__full">
                    <div className="acc-sec__title" style={{ marginBottom:0, paddingBottom:10, borderBottom:'1px solid var(--ink-100)' }}>
                      <Icon name="clock" size={14}/>
                      Detalles de licencia
                    </div>
                  </div>
                  <div className="field edit-modal__full">
                    <span className="field__label">Tipo de licencia <span className="field__req">*</span></span>
                    <ComboBoxField
                      value={editTarget.licenseType || ''}
                      onChange={v => updateEditField({ licenseType: v })}
                      options={['Comisión de servicio','Accidente / Enfermedad','Maternidad / Paternidad','Personal','Estudio']}
                      placeholder="Seleccionar tipo…"
                      requireSelection />
                  </div>
                  <div className="field">
                    <span className="field__label">Fecha inicio <span className="field__req">*</span></span>
                    <DatePickerField value={editTarget.licenseStart || ''}
                      onChange={v => updateEditField({ licenseStart: v })} />
                  </div>
                  <div className="field">
                    <span className="field__label">Fecha fin <span className="field__req">*</span></span>
                    <DatePickerField value={editTarget.licenseEnd || ''}
                      onChange={v => updateEditField({ licenseEnd: v })} />
                  </div>
                </>)}

                <div className="field edit-modal__full">
                  <span className="field__label">{t.dash_col_comment}</span>
                  <input className="field__input" value={editTarget.inactiveComment || ''}
                    onChange={(e) => updateEditField({ inactiveComment: e.target.value })}
                    placeholder="Opcional" />
                </div>
              </div></div>

              <div ref={el => paneRefs.current['tardanzas'] = el} className={`edit-modal__pane${editTab === 'tardanzas' ? ' edit-modal__pane--open' : ''}`}><div className="edit-modal__pane__inner edit-modal__grid" style={{ gridTemplateColumns:'1fr' }}>
                <div>
                  {/* ── registrar tardanza ── */}
                  <div className="acc-sec__title" style={{ marginBottom: tardRegOpen ? 16 : 18 }}>
                    <Icon name="clock" size={15}/>
                    {lang === 'es' ? 'Tardanzas' : 'Late arrivals'}
                    {editTarget && (() => { const m = new Date().toLocaleDateString('en-CA').slice(0,7); const n = getTardanzas(editTarget.id).filter(a => a.date?.slice(0,7) === m).length; return n > 0 && <span className="badge badge--neutral" style={{ fontSize:10, padding:'2px 8px' }}>{n}</span>; })()}
                    <button className="btn btn--ghost" style={{ marginLeft:'auto', fontSize:13, padding:'7px 16px', gap:6 }}
                      onClick={() => setTardRegOpen(o => !o)}>
                      <Icon name="plus" size={13}/> {lang === 'es' ? 'Registrar tardanza' : 'Register late'}
                    </button>
                  </div>
                  <div style={{
                    display:'grid',
                    gridTemplateRows: tardRegOpen ? '1fr' : '0fr',
                    transition:'grid-template-rows 0.30s cubic-bezier(0, 0, 0.2, 1)',
                    overflow:'hidden',
                  }}><div style={{ minHeight:0 }}>
                    <div style={{
                      background:'var(--cream-100)', border:'1px solid var(--ink-100)',
                      borderRadius:'var(--radius-md)', padding:'16px', marginBottom:16,
                      display:'flex', flexDirection:'column', gap:14,
                    }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, alignItems:'end' }}>
                        <div className={`field${tardRegErrors.date ? ' field--error' : ''}`}>
                          <span className="field__label">{lang === 'es' ? 'Fecha' : 'Date'} <span className="field__req">*</span></span>
                          <DatePickerField value={tardRegDate} onChange={v => { setTardRegDate(v); setTardRegErrors(p => ({ ...p, date: false })); }}
                            disabledDates={editTarget ? new Set(getTardanzas(editTarget.id).map(t => t.date)) : null} />
                          {tardRegErrors.date === 'dup' && <span className="field__err">{lang === 'es' ? 'Ya existe una tardanza en esta fecha.' : 'A record already exists for this date.'}</span>}
                        </div>
                        <div className={`field${tardRegErrors.time ? ' field--error' : ''}`}>
                          <span className="field__label">{lang === 'es' ? 'Hora de entrada' : 'Clock-in time'} <span className="field__req">*</span></span>
                          <SimpleTimePicker value={tardRegTime}
                            onChange={v => { setTardRegTime(v); setTardRegErrors(p => ({ ...p, time: false })); }} />
                        </div>
                      </div>
                      <div className="field">
                        <span className="field__label">{lang === 'es' ? '¿Tiene justificación?' : 'Justified?'}</span>
                        <button type="button" onClick={() => { setTardRegJustified(j => !j); setTardRegNote(''); setTardRegErrors(p => ({ ...p, note: false })); }}
                          style={{
                            display:'flex', alignItems:'center', gap:10,
                            padding:'10px 14px', width:'100%', textAlign:'left',
                            border:`1px solid ${tardRegJustified ? 'var(--success)' : 'var(--ink-100)'}`,
                            borderRadius:10, background: tardRegJustified ? 'rgba(79,157,122,0.07)' : '#fff',
                            fontFamily:'var(--font-sans)', fontSize:13,
                            color: tardRegJustified ? 'var(--success)' : 'var(--ink-400)',
                            cursor:'pointer', transition:'all .15s',
                          }}>
                          <span style={{
                            width:18, height:18, borderRadius:'50%', flexShrink:0,
                            background: tardRegJustified ? 'var(--success)' : 'transparent',
                            border:`2px solid ${tardRegJustified ? 'var(--success)' : 'var(--ink-200)'}`,
                            display:'grid', placeItems:'center',
                          }}>
                            {tardRegJustified && <Icon name="check" size={10} stroke={3}/>}
                          </span>
                          {tardRegJustified ? (lang === 'es' ? 'Sí, justificada' : 'Yes, justified') : (lang === 'es' ? 'No, sin justificación' : 'No, unjustified')}
                        </button>
                      </div>
                      {tardRegJustified && (
                        <div className={`field${tardRegErrors.note ? ' field--error' : ''}`}>
                          <span className="field__label">{lang === 'es' ? 'Razón de justificación' : 'Justification reason'} <span className="field__req">*</span></span>
                          <input className="field__input" value={tardRegNote}
                            onChange={e => { setTardRegNote(e.target.value); setTardRegErrors(p => ({ ...p, note: false })); }}
                            placeholder={lang === 'es' ? 'Ej. Certificado médico, permiso aprobado…' : 'e.g. Medical certificate, approved permit…'}
                            autoFocus />
                        </div>
                      )}
                      <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
                        <button className="btn btn--ghost" onClick={() => { setTardRegOpen(false); setTardRegDate(''); setTardRegTime(''); setTardRegJustified(false); setTardRegNote(''); setTardRegErrors({}); }}>
                          {lang === 'es' ? 'Cancelar' : 'Cancel'}
                        </button>
                        <button className="btn btn--primary" onClick={() => {
                          const errs = {};
                          const sd = toStorageDate(tardRegDate);
                          if (!sd) errs.date = true;
                          if (sd && editTarget && getTardanzas(editTarget.id).some(t => t.date === sd)) errs.date = 'dup';
                          if (!tardRegTime.trim()) errs.time = true;
                          if (tardRegJustified && !tardRegNote.trim()) errs.note = true;
                          if (Object.keys(errs).length) { setTardRegErrors(errs); return; }
                          addTardanza(editTarget.id, sd, tardRegTime.trim(), tardRegJustified, tardRegNote.trim());
                          setTardRegDate(''); setTardRegTime(''); setTardRegJustified(false); setTardRegNote(''); setTardRegErrors({}); setTardRegOpen(false);
                        }}>
                          {lang === 'es' ? 'Agregar' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div></div>
                  {(() => {
                    const list = editTarget ? getTardanzas(editTarget.id) : [];
                    const sorted = [...list].sort((a,b) => b.date.localeCompare(a.date));
                    const currentYear = String(new Date().getFullYear());
                    const yearTardanzas = sorted.filter(t => t.date.startsWith(currentYear));
                    if (yearTardanzas.length === 0) return (
                      <p style={{ fontFamily:'var(--font-sans)', fontSize:13, color:'var(--ink-400)', margin:0 }}>
                        {lang === 'es' ? 'Sin tardanzas registradas.' : 'No late arrivals recorded.'}
                      </p>
                    );
                    return (
                      <div>
                        <div style={{ display:'flex', flexDirection:'column' }}>
                          {(() => {
                                                const groups = [];
                            yearTardanzas.forEach(t => {
                              const key = t.date.slice(0,7);
                              let g = groups.find(g => g.key === key);
                              if (!g) { groups.push({ key, items:[] }); g = groups[groups.length-1]; }
                              g.items.push(t);
                            });
                            return groups.map((g, gi) => {
                              const [y, m] = g.key.split('-');
                              const label = `${MONTHS_ES[+m-1]} ${y}`;
                              const unjust = g.items.filter(t => !t.justified).length;
                              return (
                                <MonthGroup key={g.key} label={label} unjust={unjust} total={g.items.length} defaultOpen={gi === 0}>
                                  {g.items.map(t => (
                                    <div key={t.date}>
                                      <div
                                        onMouseEnter={e => { setHoveredTardDate(t.date); e.currentTarget.style.background='var(--cream-100)'; }}
                                        onMouseLeave={e => { setHoveredTardDate(null); e.currentTarget.style.background='transparent'; }}
                                        style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 10px', borderRadius:8, background:'transparent', transition:'background .12s' }}>
                                        <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink-600)', flexShrink:0 }}>
                                          {toDisplayDate(t.date)}
                                        </span>
                                        <span style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--ink-300)', flexShrink:0 }}>
                                          {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][new Date(t.date).getDay()]}
                                        </span>
                                        <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink-400)', flexShrink:0 }}>
                                          {t.time?.slice(0, 5)} <span style={{ fontSize:10 }}>{t.time?.slice(-2)}</span>
                                        </span>
                                        {t.justified
                                          ? <span className="badge badge--ok"  style={{ fontSize:10, padding:'2px 8px', flexShrink:0 }}>Justificada</span>
                                          : <span className="badge badge--err" style={{ fontSize:10, padding:'2px 8px', flexShrink:0 }}>No Justificada</span>
                                        }
                                        {t.justified && t.justifyNote && (
                                          <span style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--ink-400)', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                            {t.justifyNote}
                                          </span>
                                        )}
                                        <div style={{ marginLeft:'auto', display:'flex', gap:2, opacity: hoveredTardDate === t.date || justifyingTard === t.date || deletingTardDate === t.date ? 1 : 0, transition:'opacity .15s' }}>
                                          <button
                                            title={t.justified ? 'Quitar justificación' : 'Justificar'}
                                            onClick={() => {
                                              if (t.justified) {
                                                unjustifyTardanza(editTarget.id, t.date);
                                              } else {
                                                setJustifyingTard(justifyingTard === t.date ? null : t.date);
                                                setTardNote(''); setTardErr(false); setDeletingTardDate(null);
                                              }
                                            }}
                                            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink-400)', display:'flex', alignItems:'center', padding:4, borderRadius:4, transition:'color .12s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = t.justified ? 'var(--danger)' : 'var(--ink-700)'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-400)'}>
                                            <Icon name="edit" size={12} stroke={1.8}/>
                                          </button>
                                          <button onClick={() => { setDeletingTardDate(deletingTardDate === t.date ? null : t.date); setJustifyingTard(null); }}
                                            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink-400)', display:'flex', alignItems:'center', padding:4, borderRadius:4, transition:'color .12s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-400)'}>
                                            <Icon name="trash" size={12} stroke={1.8}/>
                                          </button>
                                        </div>
                                      </div>
                                      <div style={{ display:'grid', gridTemplateRows: justifyingTard === t.date ? '1fr' : '0fr', transition:'grid-template-rows 0.28s cubic-bezier(0, 0, 0.2, 1)', overflow:'hidden' }}>
                                        <div style={{ minHeight:0 }}>
                                          <div style={{
                                            margin:'4px 0 8px', padding:'8px 10px',
                                            background:'var(--cream-100)', borderRadius:'var(--radius-md)',
                                            display:'flex', gap:8, alignItems:'center',
                                            border: tardErr ? '1px solid var(--danger)' : '1px solid var(--ink-100)',
                                          }}>
                                            <input
                                              value={tardNote}
                                              onChange={e => { setTardNote(e.target.value); setTardErr(false); }}
                                              placeholder="Razón de justificación…"
                                              style={{
                                                flex:1, border:'none', background:'transparent', outline:'none',
                                                fontFamily:'var(--font-sans)', fontSize:12, color:'var(--ink-700)',
                                              }} />
                                            <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                                              <button className="btn btn--ghost" style={{ fontSize:11, padding:'3px 10px' }}
                                                onClick={() => { setJustifyingTard(null); setTardNote(''); }}>Cancelar</button>
                                              <button className="btn btn--primary" style={{ fontSize:11, padding:'3px 10px' }}
                                                onClick={() => {
                                                  if (!tardNote.trim()) { setTardErr(true); return; }
                                                  justifyTardanza(editTarget.id, t.date, tardNote.trim());
                                                  setJustifyingTard(null); setTardNote('');
                                                }}>Confirmar</button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div style={{ display:'grid', gridTemplateRows: deletingTardDate === t.date ? '1fr' : '0fr', transition:'grid-template-rows 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)', overflow:'hidden' }}>
                                        <div style={{ minHeight:0, opacity: deletingTardDate === t.date ? 1 : 0, transform: deletingTardDate === t.date ? 'translateY(0)' : 'translateY(-4px)', transition:'opacity 0.18s ease, transform 0.18s ease' }}>
                                          <div style={{ margin:'4px 0 8px', padding:'10px 14px', background:'rgba(220,38,38,0.06)', borderRadius:'var(--radius-md)', border:'1px solid rgba(220,38,38,0.2)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                                            <span style={{ fontFamily:'var(--font-sans)', fontSize:12, color:'var(--danger)' }}>¿Eliminar esta tardanza? Esta acción no se puede deshacer.</span>
                                            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                                              <button className="btn btn--ghost" style={{ fontSize:11, padding:'3px 10px' }}
                                                onClick={() => setDeletingTardDate(null)}>Cancelar</button>
                                              <button style={{ fontSize:11, padding:'3px 10px', background:'var(--danger)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight:600 }}
                                                onClick={() => { removeTardanza(editTarget.id, t.date); setDeletingTardDate(null); }}>Eliminar</button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </MonthGroup>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div></div>
              <div ref={el => paneRefs.current['absences'] = el} className={`edit-modal__pane${editTab === 'absences' ? ' edit-modal__pane--open' : ''}`}><div className="edit-modal__pane__inner edit-modal__grid" style={{ gridTemplateColumns:'1fr' }}>
                  <AbsenceSection
                    empId={editTarget?.id}
                    absences={absencesMap[editTarget?.id] || []}
                    workDays={editTarget?.workDays}
                    onAdd={addAbsence}
                    onJustify={justifyAbsence}
                    onUnjustify={unjustifyAbsence}
                    onRemove={removeAbsence}
                  />
              </div></div>
              <div ref={el => paneRefs.current['eventualidades'] = el} className={`edit-modal__pane${editTab === 'eventualidades' ? ' edit-modal__pane--open' : ''}`}><div className="edit-modal__pane__inner edit-modal__grid" style={{ gridTemplateColumns:'1fr' }}>
                  <EventualidadSection empId={editTarget?.id} lang={lang} />
              </div></div>

              {editTab === 'profile' && Object.keys(editErrors).length > 0 && (
                <div className="edit-modal__errors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Completa los campos obligatorios: {REQUIRED_FIELDS.filter(f => editErrors[f.key]).map(f => f.label).join(', ')}.
                </div>
              )}
              <div className="edit-modal__foot">
                {editTab === 'profile' && (
                  <button className="btn btn--primary" onClick={saveEditor}>{t.reg_save || 'Guardar'}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="edit-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="del-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="del-confirm__hero">
              <div className="del-confirm__icon">
                <Icon name="trash" size={40} stroke={1.6}/>
              </div>
              <div className="del-confirm__title">¿Eliminar empleado?</div>
              <div className="del-confirm__sub">
                Estás a punto de eliminar a <strong style={{color:'#fff'}}>{deleteConfirm.name}</strong>.<br/>Esta acción no se puede deshacer.
              </div>
              <div className="del-confirm__id mono">{deleteConfirm.id} · {formatCedula(deleteConfirm.cedula)}</div>
            </div>
            <div className="del-confirm__foot">
              <button className="btn btn--ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className="btn btn--danger" onClick={() => deleteEmployee(deleteConfirm.id)}>
                <Icon name="trash" size={14}/> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { DashboardView });
