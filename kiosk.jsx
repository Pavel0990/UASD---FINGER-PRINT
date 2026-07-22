/* kiosk.jsx — primary recognition view (employees clock in/out) */

const WA_TIMEOUT = 8000;

// El `timeout` de WebAuthn es solo una sugerencia, no una garantía — si el
// authenticator de la plataforma no completa la ceremonia, la promesa puede
// quedar colgada indefinidamente sin resolver ni rechazar. Este wrapper
// asegura que SIEMPRE se libera el kiosco, incluso si el navegador nunca
// respeta su propio timeout. También cubre las llamadas al backend (una red
// caída no debe dejar el kiosco colgado en "scanning" para siempre).
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

  // Umbral de tardanza — antes 15 fijo acá mismo; ahora configurable (ver
  // reports.jsx, popover "Ajustes" y backend SystemConfig). Solo se usa para
  // la etiqueta "llegada tarde" en la tarjeta de reconocimiento del kiosco —
  // el `late` real que queda en la base de datos lo decide el backend
  // (attendance.service.js), este valor es puramente cosmético acá.
  const [lateThreshold, setLateThreshold] = React.useState(15);
  React.useEffect(() => {
    const load = () => {
      if (typeof isBackendActive === 'function' && isBackendActive() && typeof apiGetSettings === 'function') {
        apiGetSettings().then(s => setLateThreshold(s.lateThresholdMinutes)).catch(() => {});
      } else {
        try {
          const s = JSON.parse(localStorage.getItem('uasd_settings') || '{}');
          setLateThreshold(Number.isInteger(s.lateThresholdMinutes) ? s.lateThresholdMinutes : 15);
        } catch { setLateThreshold(15); }
      }
    };
    load();
    const id = setInterval(load, 30000);
    window.addEventListener('storage', load);
    return () => { clearInterval(id); window.removeEventListener('storage', load); };
  }, []);

  // Camino real: el backend ya verificó la firma WebAuthn contra la public key
  // guardada, confirmó que el empleado sigue status==='ok' en la fila real de
  // Postgres (no en un array cacheado en el navegador), y grabó el marcaje de
  // forma atómica (UNIQUE(employee_id,date) resuelve la condición de carrera).
  // Acá solo queda pintar el resultado — nada de esto es una decisión de
  // seguridad del cliente.
  const onRealScanSuccess = (result) => {
    const emp = EMPLOYEES.find(e => e.id === result.employee.id) || result.employee;
    const { kind, time } = result;

    if (kind === 'done') {
      setRecognized({ ...emp, kind: 'done', time, isDemo: false });
      setState('success');
      timerRef.current = setTimeout(() => { setState('idle'); setRecognized(null); }, 3200);
      return;
    }

    const bank = kind === 'in' ? t.kiosk_welcome_bank : t.kiosk_farewell_bank;
    const greeting = bank[Math.floor(Math.random() * bank.length)];
    const late = kind === 'in' && emp.schedule ? getLateMinutes(emp.schedule, time) > lateThreshold : false;
    setRecognized({ ...emp, kind, greeting, time, late, isDemo: false });
    setState('success');
    timerRef.current = setTimeout(() => { setState('idle'); setRecognized(null); }, 4500);
  };

  // Modo demo: SOLO se permite cuando el backend confirma que este sistema no
  // tiene ninguna credencial real registrada todavía (allowCredentials vacío)
  // — nunca en un kiosco que ya está en uso con empleados reales. No persiste
  // asistencia real, así que mantiene el sorteo cosmético de siempre.
  const runDemoScan = () => {
    timerRef.current = setTimeout(() => {
      if (Math.random() <= 0.15) { onScanError(); return; }
      const pool = EMPLOYEES.filter(e => e.status === 'ok');
      const emp = pool[Math.floor(Math.random() * pool.length)];
      const kind = Math.random() > 0.4 ? 'in' : 'out';
      const time = formatTime(new Date(), lang);
      const bank = kind === 'in' ? t.kiosk_welcome_bank : t.kiosk_farewell_bank;
      const greeting = bank[Math.floor(Math.random() * bank.length)];
      setRecognized({ ...emp, kind, greeting, time, late: false, isDemo: true });
      setState('success');
      timerRef.current = setTimeout(() => { setState('idle'); setRecognized(null); }, 4500);
    }, 2200);
  };

  const onScanError = () => {
    setState('error');
    timerRef.current = setTimeout(() => { setState('idle'); setRecognized(null); }, 2400);
  };

  const canUseWebAuthn = () =>
    location.protocol !== 'file:' &&
    !!window.PublicKeyCredential &&
    (['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'https:') &&
    typeof SimpleWebAuthnBrowser !== 'undefined';

  // ── Entry point ───────────────────────────────────────────────────────
  const startScan = () => {
    if (state === 'scanning') return;
    clearTimeout(timerRef.current);
    setState('scanning');
    setRecognized(null);

    if (typeof waAuthOptions !== 'function' || !canUseWebAuthn()) {
      runDemoScan();
      return;
    }

    withTimeout(waAuthOptions(), WA_TIMEOUT)
      .then((options) => {
        const allowDemoFallback = !options.allowCredentials || options.allowCredentials.length === 0;
        if (allowDemoFallback) { runDemoScan(); return Promise.reject('handled'); }

        return withTimeout(SimpleWebAuthnBrowser.startAuthentication({ optionsJSON: options }), WA_TIMEOUT + 2000)
          .catch((err) => Promise.reject(err.name === 'NotAllowedError' ? 'auth-denied' : 'auth-failed'))
          .then((assertionResponse) => withTimeout(waAuthVerify(assertionResponse), WA_TIMEOUT));
      })
      .then((result) => onRealScanSuccess(result))
      .catch((err) => {
        if (err === 'handled') return;
        onScanError();
      });
  };

  const reset = () => {
    clearTimeout(timerRef.current);
    setState('idle');
    setRecognized(null);
  };

  // ── Auto-arm: cuando vuelve a idle, escucha el lector solo. startScan ya
  // decide internamente (vía waAuthOptions) si hay hardware real o si cae a
  // demo, así que no hace falta duplicar esa lógica acá.
  const startScanRef = React.useRef(startScan);
  React.useEffect(() => { startScanRef.current = startScan; });

  React.useEffect(() => {
    if (state !== 'idle') return;
    const timer = setTimeout(() => startScanRef.current(), 900);
    return () => clearTimeout(timer);
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
