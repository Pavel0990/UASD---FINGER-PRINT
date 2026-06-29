/* login.jsx — institutional login (floating card + crest panel) */

function LoginView({ t, lang, setLang, setRoute }) {
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (submitting) return;
    setError(false);
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const creds = typeof getCredentials === 'function' ? getCredentials() : {};
      const found = Object.entries(creds).find(([, c]) => c.email.toLowerCase() === email.trim().toLowerCase());
      if (found && found[1].password === pass) {
        if (typeof setCurrentUserId === 'function') setCurrentUserId(found[0]);
        setRoute('dashboard');
      } else {
        // fallback for demo: hardcoded admin
        if (email.trim().toLowerCase() === 'ggomez@uasd.edu.do' && pass === 'Uasd2026') {
          if (typeof setCurrentUserId === 'function') setCurrentUserId('EMP-00601');
          setRoute('dashboard');
        } else {
          setError(true);
        }
      }
    }, 700);
  };

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

            {error &&
            <div className="login__error" role="alert">
              <div className="login__error-icon"><Icon name="x" size={16} stroke={2.6} /></div>
              <div>
                <div className="login__error-title">{t.login_err_title}</div>
                <div className="login__error-sub">{t.login_err_sub}</div>
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
              <a className="login__link" style={{ fontSize: "13px" }}>{t.login_forgot}</a>
            </div>

            <button className="btn btn--primary btn--lg btn--block login__submit" type="submit"
            disabled={submitting} style={{ fontFamily: "Manrope", fontSize: "15px" }}>
              {submitting ?
              <span className="login__spinner" /> :

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
