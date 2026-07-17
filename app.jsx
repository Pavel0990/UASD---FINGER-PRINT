/* app.jsx — main router */

// Rutas administrativas — requieren sesión de backend real. Sin sesión,
// cualquier intento de navegar a una de estas rebota a 'login' (antes no
// existía ningún gate: la app arrancaba directo en 'dashboard' y
// userHasPermission() concedía todo sin sesión).
const ADMIN_ROUTES = ['dashboard', 'register', 'reports', 'roles', 'finca', 'liceo', 'vacaciones'];

function App() {
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

  const [route, setRoute_] = React.useState('login'); // TEMP: mientras trabajamos en Reportes (normalmente 'kiosk')
  const [lang, setLang] = React.useState('es');
  const [flash, setFlash] = React.useState(null);
  const [addedEmployees, setAddedEmployees] = React.useState([]);
  const kioskTheme = t_state.kioskTheme || 'light';

  const go = (r) => {
    if (ADMIN_ROUTES.includes(r)) {
      const hasSession = typeof isBackendActive === 'function' && isBackendActive();
      if (!hasSession) { setRoute_('login'); return; }
    }
    setRoute_(r);
  };

  // Intenta restaurar la sesión de backend desde la cookie de refresh (httpOnly,
  // dura 7 días y se renueva en cada visita) al montar. Si había una sesión
  // válida, salta directo a 'dashboard' — así solo hace falta loguearse la
  // primera vez, no en cada recarga mientras se trabaja. Sin cookie válida o
  // con el backend caído, se queda en 'kiosk' como siempre (sin gate roto:
  // 'dashboard' sigue exigiendo sesión real vía go()).
  React.useEffect(() => {
    if (typeof restoreSession !== 'function') return;
    restoreSession().then(async (ok) => {
      if (ok) { go('reports'); return; }
      // TEMP: sin sesión, auto-login con credenciales reales de desarrollo para
      // no perder tiempo tecleando login mientras iteramos en Reportes. Sigue
      // siendo una sesión real vía backend (no bypassea userHasPermission) —
      // quitar este bloque junto con los demás marcados TEMP al terminar.
      if (typeof loginRequest === 'function') {
        try {
          await loginRequest('ggomez@uasd.edu.do', '123456789');
          if (typeof bootstrapStore === 'function') await bootstrapStore();
          go('reports');
        } catch (err) { /* backend caído u otro error: se queda en login */ }
      }
    }).catch(() => {});
  }, []);

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
      {visibleRoute === 'roles'      && <RolesView      t={t} setRoute={go}/>}
      {visibleRoute === 'vacaciones' && <VacacionesView t={t} lang={lang} setRoute={go}/>}
      </div>


      {flash && <div className="flash">{flash}</div>}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Vista inicial"/>
        <TweakRadio label="Pantalla"
                    value={route}
                    options={['kiosk','login','dashboard','register','reports','finca','liceo','roles','vacaciones']}
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
