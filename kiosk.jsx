/* kiosk.jsx — primary recognition view (employees clock in/out) */

const CRED_MAP_KEY = 'uasd_cred_map_v1';
const WA_TIMEOUT   = 8000;
const kioskTodayStr = () => new Date().toLocaleDateString('en-CA');
const getCredMap  = () => { try { return JSON.parse(localStorage.getItem(CRED_MAP_KEY) || '{}'); } catch { return {}; } };
const saveCredMap = (map) => { try { localStorage.setItem(CRED_MAP_KEY, JSON.stringify(map)); } catch {} };

// El `timeout` de WebAuthn es solo una sugerencia, no una garantía — si el
// authenticator de la plataforma no completa la ceremonia, la promesa puede
// quedar colgada indefinidamente sin resolver ni rechazar. Este wrapper
// asegura que SIEMPRE se libera el kiosco, incluso si el navegador nunca
// respeta su propio timeout.
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(
      () => reject(Object.assign(new Error('El lector no respondió a tiempo'), { name: 'TimeoutError' })),
      ms
    )),
  ]);
}

function KioskView({ t, lang, setLang, setRoute, theme }) {
  const [state, setState] = React.useState('idle'); // idle | scanning | success | error
  const [now, setNow] = React.useState(new Date());
  const [recognized, setRecognized] = React.useState(null); // employee
  const timerRef = React.useRef(null);

  // Clock
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Antes esto grababa UN solo marcaje por empleado/día y la tarjeta de
  // "entrada"/"salida" se decidía con Math.random() — nunca se guardaba una
  // salida real, así que "horas trabajadas" era imposible de calcular. Ahora
  // el primer marcaje del día es entrada (timeIn), el segundo es salida
  // (timeOut) — el kind que se muestra en pantalla ya no es cosmético.
  const recordPresence = (empId, scheduleStr) => {
    try {
      const att = JSON.parse(localStorage.getItem('uasd_daily_attendance') || '{}');
      const key = `${empId}:${kioskTodayStr()}`;
      const time = formatTime(new Date(), lang);

      if (!att[key]) {
        const late = scheduleStr ? getLateMinutes(scheduleStr, time) > 15 : false;
        att[key] = { empId, date: kioskTodayStr(), timeIn: time, timeOut: null, late, justified: false };
        localStorage.setItem('uasd_daily_attendance', JSON.stringify(att));
        return { kind: 'in', time };
      }
      if (!att[key].timeOut) {
        att[key].timeOut = time;
        localStorage.setItem('uasd_daily_attendance', JSON.stringify(att));
        return { kind: 'out', time };
      }
      return { kind: 'done', time: att[key].timeOut };
    } catch { return { kind: 'in', time: formatTime(new Date(), lang) }; }
  };

  const onScanSuccess = (credId) => {
    const map   = getCredMap();
    const empId = credId ? map[credId] : null;
    const linked = empId ? EMPLOYEES.find(e => e.id === empId) : null;

    let emp, isDemo = false;
    if (linked && linked.status === 'ok') {
      // Camino real: credencial WebAuthn válida, vinculada a un empleado activo.
      emp = linked;
    } else if (!credId) {
      // Solo llega aquí desde runSimulation(), que ya verificó que este
      // dispositivo no tiene NINGUNA credencial real enrolada (modo demo/dev
      // sin hardware) — nunca se activa en un kiosco con empleados reales.
      const pool = EMPLOYEES.filter(e => e.status === 'ok');
      emp = pool[Math.floor(Math.random() * pool.length)];
      isDemo = true;
    } else {
      // Hubo una credencial real pero no corresponde a ningún empleado activo
      // vigente — NO se fabrica una identidad al azar, se trata como error.
      onScanError();
      return;
    }

    // El modo demo no persiste asistencia real, así que no hay un "estado
    // del día" que consultar — mantiene el sorteo cosmético de siempre. El
    // camino real usa el resultado real de recordPresence (entrada → salida
    // → ya completó el día), nunca al azar.
    const result = isDemo
      ? { kind: Math.random() > 0.4 ? 'in' : 'out', time: formatTime(new Date(), lang) }
      : recordPresence(emp.id, emp.schedule);
    const { kind, time } = result;

    if (kind === 'done') {
      setRecognized({ ...emp, kind: 'done', time, isDemo });
      setState('success');
      timerRef.current = setTimeout(() => { setState('idle'); setRecognized(null); }, 3200);
      return;
    }

    const bank  = kind === 'in' ? t.kiosk_welcome_bank : t.kiosk_farewell_bank;
    const greeting = bank[Math.floor(Math.random() * bank.length)];
    const late = kind === 'in' && emp.schedule ? getLateMinutes(emp.schedule, time) > 15 : false;
    setRecognized({ ...emp, kind, greeting, time, late, isDemo });
    setState('success');
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
    withTimeout(navigator.credentials.create({ publicKey: {
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
    }}), WA_TIMEOUT + 2000).then(cred => {
      const credId = btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));
      const map = getCredMap();
      map[credId] = empId;
      saveCredMap(map);
      return { rawId: new Uint8Array(cred.rawId), credId };
    });

  const waAuth = (rpId, allowList) =>
    withTimeout(navigator.credentials.get({ publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rpId,
      allowCredentials: allowList,
      userVerification: 'required',
      timeout: WA_TIMEOUT,
    }}), WA_TIMEOUT + 2000);

  // ── Entry point ───────────────────────────────────────────────────────
  const startScan = (empIdToRegister) => {
    if (state === 'scanning') return;
    clearTimeout(timerRef.current);
    setState('scanning');
    setRecognized(null);

    const map = getCredMap();
    const allowList = Object.keys(map).map(credId => ({
      type: 'public-key',
      id: Uint8Array.from(atob(credId), c => c.charCodeAt(0)),
      transports: ['internal'],
    }));

    // El modo demo (empleado al azar, sin persistir asistencia) SOLO se
    // permite cuando este dispositivo no tiene ninguna credencial real
    // enrolada todavía — nunca en un kiosco que ya está en uso con empleados
    // reales, para no fabricar un "reconocimiento exitoso" con la persona
    // equivocada cuando el hardware real falla.
    const allowDemoFallback = allowList.length === 0;

    if (!canUseWebAuthn()) {
      if (allowDemoFallback) runSimulation(); else onScanError();
      return;
    }

    const rpId = location.hostname;

    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then(available => {
        if (!available) {
          if (allowDemoFallback) { runSimulation(); return Promise.reject('handled'); }
          return Promise.reject('hw-unavailable');
        }

        if (allowList.length > 0) {
          // Hay credenciales registradas — autenticar directamente. Cualquier
          // fallo que no sea "el usuario canceló" se trata como error real,
          // nunca como reingreso silencioso a un empleado default.
          return waAuth(rpId, allowList).then(cred => {
            const credId = btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));
            return credId;
          }).catch(err => Promise.reject(err.name === 'NotAllowedError' ? 'auth-denied' : 'auth-failed'));
        }

        // Sin credenciales — registrar vinculada al empleado indicado (primer
        // registro real, disparado desde register.jsx). waRegister() ya exige
        // userVerification:'required' para crear la credencial, así que la
        // huella ya quedó confirmada ahí mismo — encadenar un waAuth() extra
        // aquí (sin un click nuevo de por medio) violaba el requisito de
        // "user activation" de WebAuthn y fallaba justo después de registrar.
        const empId = empIdToRegister || 'EMP-00702';
        return waRegister(rpId, empId)
          .then(({ credId }) => credId)
          .catch(() => Promise.reject('setup-fail'));
      })
      .then(credId => onScanSuccess(credId))
      .catch(err => {
        if (err === 'handled') return;
        if (err === 'auth-denied' || err === 'auth-failed' || err === 'hw-unavailable' || err === 'setup-fail') { onScanError(); return; }
        if (allowDemoFallback) runSimulation(); else onScanError();
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

  React.useEffect(() => {
    const onKey = (e) => { if (e.shiftKey && e.key === 'P') setRoute('login'); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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

          <div
            role="button"
            tabIndex={0}
            aria-label={t.kiosk_ready}
            onClick={startScan}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startScan(); } }}
            style={{ cursor: state === 'idle' ? 'pointer' : 'default' }}>
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

          <div className="hstack kiosk__foot-actions" style={{ gap: 12 }}>
            <button type="button" className="kiosk__admin-link" onClick={() => setRoute('login')}>
              {t.kiosk_admin} →
            </button>
          </div>
        </div>
      </div>

      {(state === 'success' && recognized) || state === 'error' ?
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
  if (emp.kind === 'done') {
    return (
      <div className="recog-panel__card recog-panel__card--error">
        <div className="error-card">
          <div className="error-card__icon"><Icon name="check" size={40} stroke={2.6} /></div>
          <div className="error-card__title">{t.kiosk_already_done_title}</div>
          <div className="error-card__sub">{t.kiosk_already_done_sub}</div>
        </div>
      </div>
    );
  }
  return (
      <div className={`recog-panel__card ${emp.kind === 'out' ? 'recog-panel__card--out' : ''}`}>
        {emp.isDemo && (
          <div className="badge badge--neutral" style={{ position:'absolute', top:14, right:14, fontSize:10, gap:5, zIndex:2 }}>
            <Icon name="alertTriangle" size={11} stroke={2}/>
            {t.kiosk_demo_badge}
          </div>
        )}
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