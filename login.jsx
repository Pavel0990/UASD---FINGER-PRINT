/* login.jsx — institutional login (floating card + crest panel) */

// Bloqueo simple tras intentos fallidos repetidos — mitigación del lado
// cliente (la protección real de fuerza bruta vive/debe vivir en el backend);
// esto solo evita el caso trivial de reintentar sin fricción desde la UI.
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_SECONDS = 30;

function LoginView({ t, lang, setLang, setRoute }) {
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [attempts, setAttempts] = React.useState(0);
  const [lockedUntil, setLockedUntil] = React.useState(null);
  const [lockCountdown, setLockCountdown] = React.useState(0);

  React.useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) { setLockedUntil(null); setLockCountdown(0); setAttempts(0); clearInterval(id); }
      else setLockCountdown(remaining);
    }, 250);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const submit = (e) => {
    e.preventDefault();
    if (submitting || lockedUntil) return;
    setError(false);
    setSubmitting(true);

    (async () => {
      // El login exige backend real (password hasheado, sesión JWT) — ya no
      // hay camino alterno por localStorage ni credencial maestra hardcodeada.
      if (typeof loginRequest !== 'function') {
        setSubmitting(false);
        setError('offline');
        return;
      }
      try {
        await loginRequest(email.trim(), pass);
        if (typeof bootstrapStore === 'function') {
          try { await bootstrapStore(); } catch (err) { console.error('bootstrapStore', err); }
        }
        setSubmitting(false);
        setAttempts(0);
        setRoute('dashboard');
      } catch (err) {
        setSubmitting(false);
        if (err && err.status) {
          // El backend respondió: credenciales inválidas o sin rol asignado.
          setError(err.body?.error === 'no_role' ? 'no_role' : 'credentials');
          const next = attempts + 1;
          setAttempts(next);
          if (next >= LOGIN_MAX_ATTEMPTS) setLockedUntil(Date.now() + LOGIN_LOCK_SECONDS * 1000);
        } else {
          // Sin status = el backend no respondió (caído / red / CORS).
          setError('offline');
        }
      }
    })();
  };

  const errTitle = error === 'no_role' ? t.login_err_norole_title
    : error === 'offline' ? t.login_err_offline_title
    : lockedUntil ? t.login_err_locked_title
    : t.login_err_title;
  const errSub = error === 'no_role' ? t.login_err_norole_sub
    : error === 'offline' ? t.login_err_offline_sub
    : lockedUntil ? t.login_err_locked_sub.replace('{n}', lockCountdown)
    : t.login_err_sub;

  return (
    <div className="login">
      <div className="login__card">

        {/* ---- Left: form ---- */}
        <div className="login__form-wrap">
          <button type="button" className="login__back-top" onClick={() => setRoute('kiosk')} aria-label={t.login_back} title={t.login_back}>
            <Icon name="arrowLeft" size={24} />
          </button>

          <form className="login__form" onSubmit={submit}>
            <div className="login__form-head">
              <div className="login__form-title">{t.login_title}</div>
              <div className="login__form-sub">{t.login_sub}</div>
            </div>

            {(error || lockedUntil) &&
            <div className="login__error" role="alert">
              <div className="login__error-icon"><Icon name={error === 'no_role' || lockedUntil ? 'lock' : 'x'} size={16} stroke={2.6} /></div>
              <div>
                <div className="login__error-title">{errTitle}</div>
                <div className="login__error-sub">{errSub}</div>
              </div>
            </div>
            }

            <div className="field">
              <label className="field__label">{t.login_email}</label>
              <input className={`field__input field__input--soft ${error ? 'field__input--err' : ''}`} type="email"
              value={email} onChange={(e) => {setEmail(e.target.value);setError(false);}}
              placeholder="usuario@uasd.edu.do" />
            </div>

            <div className="field">
              <label className="field__label">{t.login_pass}</label>
              <div className="field__pass">
                <input className={`field__input field__input--soft ${error ? 'field__input--err' : ''}`} type={showPass ? 'text' : 'password'}
                value={pass} onChange={(e) => {setPass(e.target.value);setError(false);}} />
                <button type="button" className="field__eye"
                onClick={() => setShowPass((s) => !s)}
                aria-label={showPass ? 'Ocultar' : 'Mostrar'}>
                  <Icon name="eye" size={18} />
                </button>
              </div>
            </div>

            <div className="login__row login__row--end">
              <span className="login__link" style={{ fontSize: "13px" }}>{t.login_forgot}</span>
            </div>

            <button className="btn btn--primary btn--lg btn--block login__submit" type="submit"
            disabled={submitting || !!lockedUntil} style={{ fontFamily: "Manrope", fontSize: "15px" }}>
              {submitting ?
              <span className="login__spinner" /> :
              lockedUntil ?
              <>{lockCountdown}s</> :

              <>{t.login_btn} <Icon name="arrowRight" size={16} /></>
              }
            </button>
          </form>
        </div>

        {/* ---- Right: navy crest panel ---- */}
        <div className="login__panel">
          <div className="login__lockup">
            <div className="login__crest-anim">
              <img src="assets/uasd-crest.png" alt="Escudo UASD" />
            </div>
            <div className="login__lockup-rule"></div>
            <div className="login__lockup-name">{t.appName}</div>
            <div className="login__lockup-sub">{t.appSub}</div>
          </div>

          <div className="login__panel-foot">
            <div>{t.login_brand_v}</div>
          </div>
        </div>

      </div>

    </div>);

}

Object.assign(window, { LoginView });
