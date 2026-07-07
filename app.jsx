/* app.jsx — main router */

function App() {
  // Seed demo attendance with tardanza for Ana Cristina
  React.useEffect(() => {
    if (localStorage.getItem('uasd_demo_seeded')) return;
    try {
      const att = JSON.parse(localStorage.getItem('uasd_daily_attendance') || '{}');
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toLocaleDateString('en-CA');
      const key = `EMP-00298:${yStr}`;
      if (!att[key]) {
        att[key] = { empId: 'EMP-00298', date: yStr, time: '08:42:00 AM', late: true, justified: false };
      }
      const todayKey = `EMP-00298:${new Date().toLocaleDateString('en-CA')}`;
      if (!att[todayKey]) {
        att[todayKey] = { empId: 'EMP-00298', date: new Date().toLocaleDateString('en-CA'), time: '08:35:00 AM', late: true, justified: false };
      }
      // Justified tardanza for Carlos Méndez (EMP-00187)
      if (!att[`EMP-00187:${yStr}`]) {
        att[`EMP-00187:${yStr}`] = { empId: 'EMP-00187', date: yStr, time: '08:55:00 AM', late: true, justified: true, justifyNote: 'Médico' };
      }
      // Ensure all existing late records have justified field
      Object.keys(att).forEach(k => {
        if (att[k].late && att[k].justified === undefined) att[k].justified = false;
      });
      localStorage.setItem('uasd_daily_attendance', JSON.stringify(att));
      // Seed absences for StrikeBadge demo
      const abs = JSON.parse(localStorage.getItem('uasd_absences') || '{}');
      const m = new Date().toLocaleDateString('en-CA').slice(0, 7); // YYYY-MM
      // EMP-00214 → 1 absence (green)
      if (!abs['EMP-00214']) {
        abs['EMP-00214'] = [{ id: Date.now()+1, date: m+'-02', reason: 'Inasistencia automática', justified: false, auto: true }];
      }
      // EMP-00187 → 2 absences (gold)
      if (!abs['EMP-00187']) {
        abs['EMP-00187'] = [
          { id: Date.now()+2, date: m+'-03', reason: 'Inasistencia automática', justified: false, auto: true },
          { id: Date.now()+3, date: m+'-04', reason: 'Inasistencia automática', justified: false, auto: true },
        ];
      }
      // EMP-00342 → 3 absences (red)
      if (!abs['EMP-00342']) {
        abs['EMP-00342'] = [
          { id: Date.now()+4, date: m+'-05', reason: 'Inasistencia automática', justified: false, auto: true },
          { id: Date.now()+5, date: m+'-06', reason: 'Inasistencia automática', justified: false, auto: true },
          { id: Date.now()+6, date: m+'-07', reason: 'Inasistencia automática', justified: false, auto: true },
        ];
      }
      localStorage.setItem('uasd_absences', JSON.stringify(abs));
      localStorage.setItem('uasd_demo_seeded', '1');
    } catch {}
  }, []);

  const [t_state, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweaks as CSS vars
  React.useEffect(() => {
    const root = document.documentElement;
    if (t_state.accent)   root.style.setProperty('--gold-500', t_state.accent);
    if (t_state.primary)  root.style.setProperty('--ink-800',  t_state.primary);
    if (t_state.primary2) root.style.setProperty('--ink-600',  t_state.primary2);
    if (t_state.font) {
      root.style.setProperty('--font-sans', t_state.font);
    }
    if (t_state.serif) {
      root.style.setProperty('--font-serif', t_state.serif);
      root.style.setProperty('--font-display', t_state.serif);
    }
  }, [t_state]);

  const [route, setRoute_] = React.useState('dashboard'); // dev default: start at dashboard
  const [lang, setLang] = React.useState('es');
  const [flash, setFlash] = React.useState(null);
  const [addedEmployees, setAddedEmployees] = React.useState([]);
  const kioskTheme = t_state.kioskTheme || 'light';

  const go = (r) => {
    setRoute_(r);
  };

  const t = I18N[lang];

  React.useEffect(() => {
    if (flash) {
      const id = setTimeout(() => setFlash(null), 2400);
      return () => clearTimeout(id);
    }
  }, [flash]);


  // Two-phase route transition: exit current → mount + enter next
  const [visibleRoute, setVisibleRoute] = React.useState(route);
  const [routeAnim, setRouteAnim] = React.useState('');
  const transRef = React.useRef([]);

  React.useEffect(() => {
    if (route === visibleRoute) return;
    transRef.current.forEach(clearTimeout);
    setRouteAnim('route-exit');
    transRef.current[0] = setTimeout(() => {
      setVisibleRoute(route);
      setRouteAnim('route-enter');
      transRef.current[1] = setTimeout(() => setRouteAnim(''), 500);
    }, 105);
  }, [route]);

  const isAdminLayout = visibleRoute !== 'kiosk' && visibleRoute !== 'login';

  // Keyboard shortcuts — work from any screen
  React.useEffect(() => {
    const canFarm    = typeof userHasPermission === 'function' && userHasPermission('farm');
    const canLiceo   = typeof userHasPermission === 'function' && userHasPermission('liceo');
    const canEnroll  = typeof userHasPermission !== 'function' || userHasPermission('enroll');
    const canReports = typeof userHasPermission !== 'function' || userHasPermission('reports');
    const map = { '1': 'dashboard', '2': canEnroll ? 'register' : undefined, '3': canReports ? 'reports' : undefined, '4': (typeof userHasPermission === 'function' && userHasPermission('roles')) ? 'roles' : undefined, '5': canFarm ? 'finca' : undefined, '6': canLiceo ? 'liceo' : undefined };
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.shiftKey && e.key === 'D') { go('dashboard'); return; }
      if (e.shiftKey) return;
      if (isAdminLayout && map[e.key]) { go(map[e.key]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAdminLayout]);

  return (
    <div className={`app-shell ${visibleRoute === 'kiosk' && kioskTheme === 'dark' ? 'app-shell--dark' : ''}`}>
      {isAdminLayout && (
        <TopBar route={visibleRoute} setRoute={go} lang={lang} setLang={setLang} t={t}/>
      )}

      <div key={visibleRoute} className={routeAnim}>
      {visibleRoute === 'kiosk'     && <KioskView      t={t} lang={lang} setLang={setLang} setRoute={go} theme={kioskTheme}/>}
      {visibleRoute === 'login'     && <LoginView      t={t} lang={lang} setLang={setLang} setRoute={go}/>}
      {visibleRoute === 'dashboard' && <DashboardView  t={t} lang={lang} setLang={setLang} setRoute={go} extraEmployees={addedEmployees}/>}
      {visibleRoute === 'register'  && <RegisterView   t={t} setRoute={go} setFlash={setFlash} onRegister={(emp) => setAddedEmployees(prev => [...prev, emp])}/>}
      {visibleRoute === 'reports'   && <ReportsView    t={t} lang={lang} setRoute={go}/>}
      {visibleRoute === 'finca'     && <FarmView      t={t} lang={lang} setRoute={go}/>}
      {visibleRoute === 'liceo'     && <LiceoView    t={t} lang={lang} setRoute={go}/>}
      </div>


      {flash && <div className="flash">{flash}</div>}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Vista inicial"/>
        <TweakRadio label="Pantalla"
                    value={route}
                    options={['kiosk','login','dashboard','register','reports','finca','liceo']}
                    onChange={(v) => go(v)}/>
        <TweakSection label="Terminal de marcaje"/>
        <TweakRadio label="Fondo del terminal"
                    value={kioskTheme}
                    options={['dark','light']}
                    onChange={(v) => setTweak('kioskTheme', v)}/>
        <TweakSection label="Idioma"/>
        <TweakRadio label="Idioma" value={lang} options={['es','en']}
                    onChange={(v) => setLang(v)}/>
        <TweakSection label="Paleta"/>
        <TweakColor label="Color institucional principal"
                    value={t_state.primary}
                    options={['#1A1F3A','#0F2C4D','#0E1226','#1F2A44']}
                    onChange={(v) => setTweak('primary', v)}/>
        <TweakColor label="Acento (dorado)"
                    value={t_state.accent}
                    options={['#C9A961','#D4AF37','#B8956A','#a88a3d']}
                    onChange={(v) => setTweak('accent', v)}/>
        <TweakSection label="Tipografía"/>
        <TweakRadio label="Serif (títulos)"
                    value={t_state.serif}
                    options={[
                      "'Source Serif 4', serif",
                      "'Lora', serif",
                    ]}
                    onChange={(v) => setTweak('serif', v)}/>
        <TweakRadio label="Sans (texto / UI)"
                    value={t_state.font}
                    options={[
                      "'Manrope', sans-serif",
                      "'DM Sans', sans-serif",
                      "'Geist', sans-serif",
                    ]}
                    onChange={(v) => setTweak('font', v)}/>
      </TweaksPanel>
    </div>
  );
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primary":  "#1A1F3A",
  "primary2": "#2C3E66",
  "accent":   "#C9A961",
  "font":     "'Manrope', sans-serif",
  "serif":    "'Source Serif 4', serif",
  "kioskTheme": "light"
}/*EDITMODE-END*/;

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
