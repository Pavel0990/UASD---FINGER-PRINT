/* app.jsx — main router */

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

  const [route, setRoute] = React.useState('kiosk'); // start at kiosk (employee view)
  const [lang, setLang] = React.useState('es');
  const [flash, setFlash] = React.useState(null);
  const kioskTheme = t_state.kioskTheme || 'light';

  const t = I18N[lang];

  React.useEffect(() => {
    if (flash) {
      const id = setTimeout(() => setFlash(null), 2400);
      return () => clearTimeout(id);
    }
  }, [flash]);

  const isAdminLayout = route !== 'kiosk' && route !== 'login';

  // Keyboard shortcuts for fast admin navigation (1/2/3, and G then key)
  React.useEffect(() => {
    if (!isAdminLayout) return;
    const map = { '1': 'dashboard', '2': 'reports' };
    const onKey = (e) => {
      // ignore when typing in a field
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (map[e.key]) { setRoute(map[e.key]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAdminLayout]);

  return (
    <div className={`app-shell ${route === 'kiosk' && kioskTheme === 'dark' ? 'app-shell--dark' : ''}`}>
      {isAdminLayout && (
        <TopBar route={route} setRoute={setRoute} lang={lang} setLang={setLang} t={t}/>
      )}

      <div key={route} className={isAdminLayout ? 'route-fade' : ''}>
      {route === 'kiosk'     && <KioskView      t={t} lang={lang} setLang={setLang} setRoute={setRoute} theme={kioskTheme}/>}
      {route === 'login'     && <LoginView      t={t} lang={lang} setLang={setLang} setRoute={setRoute}/>}
      {route === 'dashboard' && <DashboardView  t={t} lang={lang} setLang={setLang} setRoute={setRoute}/>}
      {route === 'register'  && <RegisterView   t={t} setRoute={setRoute} setFlash={setFlash}/>}
      {route === 'reports'   && <ReportsView    t={t} lang={lang} setRoute={setRoute}/>}
      </div>

      {flash && <div className="flash">{flash}</div>}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Vista inicial"/>
        <TweakRadio label="Pantalla"
                    value={route}
                    options={['kiosk','login','dashboard','register','reports']}
                    onChange={(v) => setRoute(v)}/>
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
