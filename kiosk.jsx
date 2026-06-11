/* kiosk.jsx — primary recognition view (employees clock in/out) */

function KioskView({ t, lang, setLang, setRoute, theme }) {
  const [state, setState] = React.useState('idle'); // idle | scanning | success | error
  const [now, setNow] = React.useState(new Date());
  const [recognized, setRecognized] = React.useState(null); // employee
  const [feed, setFeed] = React.useState(RECENT_LOG.slice(0, 4));
  const timerRef = React.useRef(null);

  // Clock
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Simulated scan
  const startScan = () => {
    if (state === 'scanning') return;
    clearTimeout(timerRef.current);
    setState('scanning');
    setRecognized(null);

    timerRef.current = setTimeout(() => {
      // 85% success
      const ok = Math.random() > 0.15;
      if (ok) {
        // Pick a random ok employee
        const pool = EMPLOYEES.filter((e) => e.status === 'ok');
        const emp = pool[Math.floor(Math.random() * pool.length)];
        const kind = Math.random() > 0.4 ? 'in' : 'out';
        const bank = kind === 'in' ? t.kiosk_welcome_bank : t.kiosk_farewell_bank;
        const greeting = bank[Math.floor(Math.random() * bank.length)];
        setRecognized({ ...emp, kind, greeting, time: formatTime(new Date(), lang) });
        setState('success');
        setFeed((prev) => [{
          empId: emp.id,
          name: emp.name.split(' ').slice(0, 2).join(' '),
          dept: emp.dept.replace(/^Facultad de /, ''),
          time: formatTime(new Date(), lang).slice(0, 5),
          kind
        }, ...prev].slice(0, 5));

        // Auto-reset after a moment
        timerRef.current = setTimeout(() => {
          setState('idle');
          setRecognized(null);
        }, 4500);
      } else {
        setState('error');
        timerRef.current = setTimeout(() => {
          setState('idle');
          setRecognized(null);
        }, 2400);
      }
    }, 2200);
  };

  const reset = () => {
    clearTimeout(timerRef.current);
    setState('idle');
    setRecognized(null);
  };

  React.useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className={`kiosk ${theme === 'light' ? 'kiosk--light' : ''}`}>
      <div className="kiosk__bg"></div>

      <div className="kiosk__main">
        <div className="kiosk__head">
          <div className="kiosk__brand">
            <div className="kiosk__crest">
              <img src="assets/uasd-crest.png" alt="Escudo UASD" style={{ objectFit: "contain", display: "block", height: "80%", width: "80%" }} />
            </div>
            <div>
              <div className="kiosk__brand-name">{t.appName}</div>
              <div className="kiosk__brand-sub">{t.kiosk_pre}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
            <LangSwitch lang={lang} setLang={setLang} dark={true} />
            <div className="kiosk__time">
              <div className="kiosk__time-main mono">{formatTime(now, lang)}</div>
              <div className="kiosk__time-sub">{formatDate(now, lang)}</div>
            </div>
          </div>
        </div>

        <div className="kiosk__center">
          <div className="kiosk__prompt" style={{ marginBottom: 18 }}>
            <div className="kiosk__prompt-title">
              <T html={t.kiosk_title} />
            </div>
          </div>

          <div onClick={startScan} style={{ cursor: state === 'idle' ? 'pointer' : 'default' }}>
            <FingerprintScanner state={state} size={400} />
          </div>

          <div className="kiosk__action">
            <div className="kiosk__chip">
              <span className="kiosk__chip-dot"></span>
              <span>{state === 'scanning' ? t.kiosk_scanning : t.kiosk_ready}</span>
            </div>
            {state !== 'idle' &&
            <button className="btn btn--ghost btn--lg" onClick={reset}
            style={{ borderColor: 'rgba(245,242,234,0.15)', color: 'var(--ink-200)' }}>
                <Icon name="refresh" size={16} /> {t.kiosk_reset}
              </button>
            }
          </div>
        </div>

        <div className="kiosk__foot">
          <div className="hstack" style={{ gap: 18 }}>
            <span><Icon name="shield" size={11} /> &nbsp;{t.kiosk_status_secure}</span>
            <span>{t.kiosk_status_device}</span>
          </div>

          <div className="hstack" style={{ gap: 12 }}>
            <a onClick={() => setRoute('login')} style={{
              color: "var(--cream-100)",
              background: "var(--ink-900)",
              fontFamily: "inherit",
              fontWeight: 600,
              padding: "9px 16px",
              borderRadius: "999px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "background .15s ease", fontSize: "12px"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ink-700)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--ink-900)'}>{t.kiosk_admin} →</a>
          </div>
        </div>
      </div>

      {state === 'success' && recognized || state === 'error' ?
      <div className="recog-overlay" onClick={reset}>
          <div className="recog-overlay__inner" onClick={(e) => e.stopPropagation()}>
            {state === 'success' && recognized ?
          <RecognizedCard emp={recognized} t={t} /> :
          <ErrorCard t={t} />
          }
          </div>
        </div> :
      null}
    </div>);

}

function RecognizedCard({ emp, t }) {
  return (
    <div className={`recog-panel__card ${emp.kind === 'out' ? 'recog-panel__card--out' : ''}`}>
      <div className={`recog-banner ${emp.kind === 'out' ? 'recog-banner--out' : ''}`}>
        <div className="recog-banner__icon">
          <Icon name={emp.kind === 'out' ? 'logOut' : 'check'} size={14} stroke={2.4} />
        </div>
        <div style={{ fontWeight: 600 }}>
          {emp.kind === 'in' ? t.kiosk_clockin : t.kiosk_clockout} · {emp.time}
        </div>
      </div>

      <div className="recog-panel__person">
        <div className="recog-panel__avatar">{initials(emp.name)}</div>
        <div>
          <div className="recog-panel__name">
            {emp.kind === 'in' ? t.kiosk_welcome : t.kiosk_farewell} {emp.name.split(' ')[0]}
          </div>
          <div className="recog-panel__role">{emp.role}</div>
        </div>
      </div>

      <div className="recog-panel__greeting">
        {emp.greeting || (emp.kind === 'in' ? t.kiosk_welcome_sub : t.kiosk_farewell_sub)}
      </div>

      <div className="recog-panel__divider"></div>

      <div className="recog-panel__meta">
        <div className="recog-panel__meta-item">
          <div className="recog-panel__meta-label">ID</div>
          <div className="recog-panel__meta-val mono">{emp.id}</div>
        </div>
        <div className="recog-panel__meta-item">
          <div className="recog-panel__meta-label">Cédula</div>
          <div className="recog-panel__meta-val mono">{emp.cedula}</div>
        </div>
        <div className="recog-panel__meta-item" style={{ gridColumn: 'span 2' }}>
          <div className="recog-panel__meta-label">{t.dash_col_dept}</div>
          <div className="recog-panel__meta-val">{emp.dept}</div>
        </div>
        <div className="recog-panel__meta-item">
          <div className="recog-panel__meta-label">{t.dash_col_schedule}</div>
          <div className="recog-panel__meta-val mono">{emp.schedule}</div>
        </div>
        <div className="recog-panel__meta-item">
          <div className="recog-panel__meta-label">{emp.kind === 'in' ? t.kiosk_in : t.kiosk_out}</div>
          <div className="recog-panel__meta-val mono">{emp.time}</div>
        </div>
      </div>
    </div>);

}

function ErrorCard({ t }) {
  return (
    <div className="recog-panel__card recog-panel__card--error">
      <div className="error-card">
        <div className="error-card__icon">
          <Icon name="x" size={40} stroke={2.6} />
        </div>
        <div className="error-card__title">{t.kiosk_not_recognized}</div>
        <div className="error-card__sub">{t.kiosk_try_again}</div>
      </div>
    </div>);

}

Object.assign(window, { KioskView });