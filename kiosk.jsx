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

  // ── Mapa credencial → empleado (persiste en localStorage) ───────────────
  const CRED_MAP_KEY = 'uasd_cred_map_v1'; // { credId: empId }
  const WA_TIMEOUT   = 8000;

  const getCredMap  = () => JSON.parse(localStorage.getItem(CRED_MAP_KEY) || '{}');
  const saveCredMap = (map) => localStorage.setItem(CRED_MAP_KEY, JSON.stringify(map));

  // ── Resultado: usa el empleado vinculado a la credencial, si existe ────
  const todayStr = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local

  const recordPresence = (empId, scheduleStr) => {
    try {
      const att = JSON.parse(localStorage.getItem('uasd_daily_attendance') || '{}');
      const key = `${empId}:${todayStr()}`;
      if (!att[key]) {
        const time = formatTime(new Date(), lang);
        const late = scheduleStr ? getLateMinutes(scheduleStr, time) > 15 : false;
        att[key] = { empId, date: todayStr(), time, late, justified: false };
        localStorage.setItem('uasd_daily_attendance', JSON.stringify(att));
      }
    } catch {}
  };

  const onScanSuccess = (credId) => {
    const map   = getCredMap();
    const empId = credId ? map[credId] : null;
    const linked = empId ? EMPLOYEES.find(e => e.id === empId) : null;
    const pool  = EMPLOYEES.filter(e => e.status === 'ok');
    const emp   = (linked && linked.status === 'ok') ? linked : pool[Math.floor(Math.random() * pool.length)];
    const kind  = Math.random() > 0.4 ? 'in' : 'out';
    const bank  = kind === 'in' ? t.kiosk_welcome_bank : t.kiosk_farewell_bank;
    const greeting = bank[Math.floor(Math.random() * bank.length)];
    recordPresence(emp.id, emp.schedule);
    const time = formatTime(new Date(), lang);
    const late = emp.schedule ? getLateMinutes(emp.schedule, time) > 15 : false;
    setRecognized({ ...emp, kind, greeting, time, late });
    setState('success');
    setFeed(prev => [{
      empId: emp.id,
      name: emp.name.split(' ').slice(0, 2).join(' '),
      dept: emp.dept.replace(/^Facultad de /, ''),
      time: formatTime(new Date(), lang).slice(0, 5),
      kind,
    }, ...prev].slice(0, 5));
    timerRef.current = setTimeout(() => { setState('idle'); setRecognized(null); }, 4500);
  };

  const onScanError = () => {
    setState('error');
    timerRef.current = setTimeout(() => { setState('idle'); setRecognized(null); }, 2400);
  };

  // ── Simulation fallback ───────────────────────────────────────────────
  const runSimulation = () => {
    timerRef.current = setTimeout(() => {
      Math.random() > 0.15 ? onScanSuccess(null) : onScanError();
    }, 2200);
  };

  // ── WebAuthn / Touch ID ───────────────────────────────────────────────
  const canUseWebAuthn = () =>
    location.protocol !== 'file:' &&
    !!window.PublicKeyCredential &&
    (['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'https:');

  // Registra una credencial y la vincula a un empleado
  const waRegister = (rpId, empId) =>
    navigator.credentials.create({ publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: 'UASD Sistema de Asistencia', id: rpId },
      user: {
        id: new TextEncoder().encode(empId),
        name: empId + '@uasd.edu.do',
        displayName: (EMPLOYEES.find(e => e.id === empId) || {}).name || empId,
      },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
      timeout: WA_TIMEOUT,
    }}).then(cred => {
      const credId = btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));
      const map = getCredMap();
      map[credId] = empId;
      saveCredMap(map);
      return { rawId: new Uint8Array(cred.rawId), credId };
    });

  const waAuth = (rpId, allowList) =>
    navigator.credentials.get({ publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rpId,
      allowCredentials: allowList,
      userVerification: 'required',
      timeout: WA_TIMEOUT,
    }});

  // ── Entry point ───────────────────────────────────────────────────────
  const startScan = (empIdToRegister) => {
    if (state === 'scanning') return;
    clearTimeout(timerRef.current);
    setState('scanning');
    setRecognized(null);

    if (!canUseWebAuthn()) { runSimulation(); return; }

    const rpId   = location.hostname;
    const map    = getCredMap();

    // Construir lista de credenciales registradas para allowCredentials
    const allowList = Object.keys(map).map(credId => ({
      type: 'public-key',
      id: Uint8Array.from(atob(credId), c => c.charCodeAt(0)),
      transports: ['internal'],
    }));

    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then(available => {
        if (!available) { runSimulation(); return Promise.reject('handled'); }

        if (allowList.length > 0) {
          // Hay credenciales registradas — autenticar directamente
          return waAuth(rpId, allowList).then(cred => {
            const credId = btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));
            return credId;
          }).catch(err => {
            if (err.name === 'NotAllowedError') return Promise.reject('auth-denied');
            // Credenciales inválidas — limpiar y re-registrar
            localStorage.removeItem(CRED_MAP_KEY);
            const empId = empIdToRegister || 'EMP-00702';
            return waRegister(rpId, empId).then(({ rawId, credId }) =>
              waAuth(rpId, [{ type: 'public-key', id: rawId, transports: ['internal'] }])
                .then(cred => btoa(String.fromCharCode(...new Uint8Array(cred.rawId))))
            ).catch(() => Promise.reject('setup-fail'));
          });
        }

        // Sin credenciales — registrar vinculada al empleado indicado
        const empId = empIdToRegister || 'EMP-00702';
        return waRegister(rpId, empId).then(({ rawId, credId }) =>
          waAuth(rpId, [{ type: 'public-key', id: rawId, transports: ['internal'] }])
            .then(cred => btoa(String.fromCharCode(...new Uint8Array(cred.rawId))))
        ).catch(() => Promise.reject('setup-fail'));
      })
      .then(credId => onScanSuccess(credId))
      .catch(err => {
        if (err === 'auth-denied') { onScanError(); }
        else if (err !== 'handled') { runSimulation(); }
      });
  };

  const reset = () => {
    clearTimeout(timerRef.current);
    setState('idle');
    setRecognized(null);
  };

  // ── Auto-arm: cuando vuelve a idle y hay credencial registrada, escucha el lector solo
  const startScanRef = React.useRef(startScan);
  React.useEffect(() => { startScanRef.current = startScan; });

  React.useEffect(() => {
    if (state !== 'idle') return;
    if (!canUseWebAuthn()) return;
    if (!localStorage.getItem(CRED_MAP_KEY)) return; // sin credencial → requiere primer registro manual
    const t = setTimeout(() => startScanRef.current(), 900);
    return () => clearTimeout(t);
  }, [state]);

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
          {emp.kind === 'in' && emp.late && (
            <span className={`badge badge--warn`} style={{fontSize:10,padding:'2px 8px',marginLeft:'auto'}}>{t.kiosk_late || 'Tardanza'}</span>
          )}
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