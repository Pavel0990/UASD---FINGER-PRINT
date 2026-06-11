/* register.jsx — register new employee + fingerprint capture */

const FINGERS = ['T-D', 'I-D', 'M-D', 'A-D', 'P-D', 'T-I', 'I-I', 'M-I', 'A-I', 'P-I'];

function RegisterView({ t, setRoute, setFlash }) {
  const FL = t.fingers;
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState({
    name: 'Sofía Hernández Marte',
    cedula: '402-1102934-7',
    code: 'EMP-00521',
    dept: 'Facultad de Ciencias',
    role: 'Analista de Datos',
    email: 'shernandez@uasd.edu.do',
    phone: '+1 809 555 0445',
    schedule: '8:00 a.m. — 4:00 p.m.',
  });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const [captureState, setCaptureState] = React.useState('idle'); // idle scanning success
  const [activeFinger, setActiveFinger] = React.useState('I-D');
  const [captured, setCaptured] = React.useState({});
  const [quality, setQuality] = React.useState(0);
  const scanTimerRef = React.useRef(null);
  const captureTimerRef = React.useRef(null);

  const startCapture = () => {
    clearInterval(scanTimerRef.current);
    setCaptureState('scanning');
    setQuality(0);
    let q = 0;
    scanTimerRef.current = setInterval(() => {
      q += Math.random() * 14 + 6;
      if (q >= 100) {
        q = 96 + Math.random() * 4;
        clearInterval(scanTimerRef.current);
        setQuality(q);
        setCaptureState('success');
        setCaptured(prev => ({ ...prev, [activeFinger]: Math.round(q) }));
        captureTimerRef.current = setTimeout(() => setCaptureState('idle'), 1400);
      } else {
        setQuality(q);
      }
    }, 150);
  };

  React.useEffect(() => () => {
    clearInterval(scanTimerRef.current);
    clearTimeout(captureTimerRef.current);
  }, []);

  const stepDef = [
    { n: 1, label: t.reg_step_1 },
    { n: 2, label: t.reg_step_2 },
    { n: 3, label: t.reg_step_3 },
  ];

  const next = () => setStep(s => Math.min(3, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));
  const save = () => {
    setFlash(t.reg_saved);
    setTimeout(() => setRoute('dashboard'), 800);
  };

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="page__title">{t.reg_title}</div>
          <div className="page__subtitle">{t.reg_sub}</div>
        </div>
        <div className="page__actions">
          <button className="btn btn--ghost" onClick={() => setRoute('dashboard')}>
            <Icon name="x" size={14}/> {t.reg_cancel}
          </button>
        </div>
      </div>

      <div className="reg-stepper">
        {stepDef.map(s => (
          <div key={s.n}
               className={`reg-stepper__item ${step === s.n ? 'reg-stepper__item--active' : ''} ${step > s.n ? 'reg-stepper__item--done' : ''}`}
               onClick={() => s.n < step && setStep(s.n)}>
            <span className="reg-stepper__num">
              {step > s.n ? <Icon name="check" size={11} stroke={2.4}/> : s.n}
            </span>
            {s.label}
          </div>
        ))}
      </div>

      {step === 1 && <Step1 t={t} form={form} update={update} next={next}/>}
      {step === 2 && (
        <Step2 t={t} FL={FL}
               captureState={captureState}
               activeFinger={activeFinger} setActiveFinger={setActiveFinger}
               captured={captured} quality={quality}
               startCapture={startCapture}
               next={next} back={back}
               form={form}/>
      )}
      {step === 3 && <Step3 t={t} FL={FL} form={form} captured={captured} back={back} save={save}/>}
    </div>
  );
}

function Step1({ t, form, update, next }) {
  return (
    <div className="reg-grid">
      <div className="card">
        <div className="card__head">
          <div className="card__title">{t.reg_step_1}</div>
          <div className="card__subtitle">{t.reg_step1_sub}</div>
        </div>
        <div className="card__body">
          <div className="reg-form-grid">
            <div className="field" style={{gridColumn:'span 2'}}>
              <label className="field__label">{t.reg_fld_name}</label>
              <input className="field__input" value={form.name}
                     onChange={e => update('name', e.target.value)}/>
            </div>
            <div className="field">
              <label className="field__label">{t.reg_fld_cedula}</label>
              <input className="field__input mono" value={form.cedula}
                     onChange={e => update('cedula', e.target.value)}/>
            </div>
            <div className="field">
              <label className="field__label">{t.reg_fld_code}</label>
              <input className="field__input mono" value={form.code}
                     onChange={e => update('code', e.target.value)}/>
            </div>
            <div className="field">
              <label className="field__label">{t.reg_fld_dept}</label>
              <select className="field__select" value={form.dept}
                      onChange={e => update('dept', e.target.value)}>
                <option>Facultad de Ciencias</option>
                <option>Facultad de Ingeniería</option>
                <option>Facultad de Humanidades</option>
                <option>Recursos Humanos</option>
                <option>Tesorería</option>
                <option>Rectoría</option>
                <option>Biblioteca Central</option>
                <option>Sistemas e Informática</option>
              </select>
            </div>
            <div className="field">
              <label className="field__label">{t.reg_fld_role}</label>
              <input className="field__input" value={form.role}
                     onChange={e => update('role', e.target.value)}/>
            </div>
            <div className="field">
              <label className="field__label">{t.reg_fld_email}</label>
              <input className="field__input" value={form.email}
                     onChange={e => update('email', e.target.value)}/>
            </div>
            <div className="field">
              <label className="field__label">{t.reg_fld_phone}</label>
              <input className="field__input mono" value={form.phone}
                     onChange={e => update('phone', e.target.value)}/>
            </div>
            <div className="field" style={{gridColumn:'span 2'}}>
              <label className="field__label">{t.reg_fld_schedule}</label>
              <input className="field__input mono" value={form.schedule}
                     onChange={e => update('schedule', e.target.value)}/>
              <span className="field__hint">{t.reg_schedule_hint}</span>
            </div>
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',marginTop:24,gap:10}}>
            <button className="btn btn--primary" onClick={next}>
              {t.reg_next} <Icon name="arrowRight" size={14}/>
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__head">
          <div className="card__title">{t.reg_fld_photo}</div>
          <div className="card__subtitle">{t.reg_photo_sub}</div>
        </div>
        <div className="card__body">
          <div style={{
            width:'100%', aspectRatio:'1/1',
            border:'1px dashed var(--ink-200)',
            borderRadius:'var(--radius-md)',
            display:'grid', placeItems:'center',
            color:'var(--ink-300)',
            background:`repeating-linear-gradient(45deg, var(--cream-50) 0 8px, transparent 8px 16px)`,
          }}>
            <div style={{textAlign:'center',padding:20}}>
              <div style={{
                width:64,height:64,borderRadius:'50%',
                background:'var(--cream-100)',
                display:'grid',placeItems:'center',
                margin:'0 auto 12px',
                color:'var(--ink-400)',
              }}>
                <Icon name="user" size={26}/>
              </div>
              <div style={{
                fontFamily:'var(--font-mono)',
                fontSize:10,letterSpacing:'0.1em',
                textTransform:'uppercase',
                color:'var(--ink-400)',
              }}>
                [ {t.reg_photo_ph} ]
              </div>
            </div>
          </div>

          <button className="btn btn--ghost btn--block" style={{marginTop:14}}>
            <Icon name="upload" size={14}/> {t.reg_photo_upload}
          </button>

          <div style={{
            marginTop:18, padding:14,
            background:'var(--cream-50)',
            borderRadius:'var(--radius-sm)',
            fontSize:11, color:'var(--ink-500)',
            lineHeight:1.6,
          }}>
            <strong style={{color:'var(--ink-700)'}}>{t.reg_photo_tip_label}</strong> {t.reg_photo_tip}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step2({ t, FL, captureState, activeFinger, setActiveFinger, captured, quality, startCapture, next, back, form }) {
  const capturedCount = Object.keys(captured).length;
  const canContinue = capturedCount >= 2;

  return (
    <div className="reg-grid">
      <div className="card">
        <div className="card__head">
          <div className="card__title">{t.reg_capture_title}</div>
          <div className="card__subtitle">
            {t.reg_cap_sub} · {capturedCount}/10 {t.reg_cap_count}
          </div>
        </div>
        <div className="card__body">
          <div style={{marginBottom:24}}>
            <label className="field__label" style={{display:'block',marginBottom:10}}>
              {t.reg_capture_finger}: <span style={{color:'var(--ink-700)',fontWeight:600,textTransform:'none',letterSpacing:0}}>
                {FL[activeFinger]}
              </span>
            </label>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {FINGERS.map(f => (
                <button key={f}
                  className="capture__finger"
                  style={{
                    border:'1px solid var(--ink-200)',
                    color: captured[f] ? 'var(--cream-100)' : (f === activeFinger ? 'var(--ink-900)' : 'var(--ink-500)'),
                    background: captured[f] ? 'var(--success)'
                              : (f === activeFinger ? 'var(--gold-500)' : 'var(--paper)'),
                    borderColor: captured[f] ? 'var(--success)'
                              : (f === activeFinger ? 'var(--gold-500)' : 'var(--ink-200)'),
                    boxShadow: f === activeFinger && !captured[f] ? '0 0 0 4px rgba(201,169,97,0.18)' : 'none',
                  }}
                  onClick={() => setActiveFinger(f)}>
                  {f}
                </button>
              ))}
            </div>
            <div style={{marginTop:10,fontSize:11,fontFamily:'var(--font-mono)',color:'var(--ink-400)',letterSpacing:'0.04em'}}>
              {t.reg_cap_legend}
            </div>
          </div>

          <div style={{
            display:'flex',gap:24,
            padding:24,
            background:'var(--cream-50)',
            borderRadius:'var(--radius-md)',
            alignItems:'center',
          }}>
            <div style={{flex:'0 0 auto'}}>
              <FingerprintScanner state={captureState === 'idle' && captured[activeFinger] ? 'success' : captureState} size={180}/>
            </div>
            <div style={{flex:1}}>
              <div style={{
                fontFamily:'var(--font-mono)',
                fontSize:11, letterSpacing:'0.2em',
                textTransform:'uppercase',
                color: captureState === 'success' ? 'var(--success)' : 'var(--ink-500)',
                marginBottom:10,
              }}>
                {captureState === 'idle' && !captured[activeFinger] && '→ ' + t.reg_capture_instr}
                {captureState === 'scanning' && '⟳ ' + t.kiosk_scanning}
                {(captureState === 'success' || captured[activeFinger]) && '✓ ' + t.reg_capture_done}
              </div>
              <div style={{fontSize:14,color:'var(--ink-700)',marginBottom:14,lineHeight:1.5}}>
                {captureState === 'success' || captured[activeFinger]
                  ? t.reg_cap_done_msg.split('{f}').join(FL[activeFinger].toLowerCase())
                  : t.reg_cap_instr_msg.split('{f}').join(FL[activeFinger].toLowerCase())}
              </div>

              <div style={{
                display:'flex',alignItems:'center',gap:14,marginBottom:18,
                fontFamily:'var(--font-mono)',fontSize:11,
                color:'var(--ink-500)',letterSpacing:'0.04em',
              }}>
                <span style={{textTransform:'uppercase'}}>{t.reg_quality_lbl}</span>
                <div style={{flex:1, height:6, background:'var(--ink-100)', borderRadius:3, overflow:'hidden'}}>
                  <div style={{
                    height:'100%',
                    width:`${captured[activeFinger] || quality}%`,
                    background: (captured[activeFinger] || quality) > 80 ? 'var(--success)'
                              : (captured[activeFinger] || quality) > 50 ? 'var(--gold-500)'
                              : 'var(--ink-400)',
                    transition:'all 0.2s ease',
                  }}/>
                </div>
                <span style={{minWidth:36,textAlign:'right',color:'var(--ink-700)',fontWeight:600}}>
                  {Math.round(captured[activeFinger] || quality)}%
                </span>
              </div>

              {captureState === 'idle' && !captured[activeFinger] && (
                <button className="btn btn--primary" onClick={startCapture}>
                  <Icon name="fingerprint" size={14}/> {t.reg_capture_start}
                </button>
              )}
              {captureState === 'idle' && captured[activeFinger] && (
                <button className="btn btn--ghost" onClick={startCapture}>
                  <Icon name="refresh" size={14}/> {t.reg_capture_recap}
                </button>
              )}
            </div>
          </div>

          <div style={{display:'flex',justifyContent:'space-between',marginTop:24}}>
            <button className="btn btn--ghost" onClick={back}>
              <Icon name="arrowLeft" size={14}/> {t.reg_back}
            </button>
            <button className="btn btn--primary"
                    onClick={next} disabled={!canContinue}
                    style={{opacity: canContinue ? 1 : 0.4, pointerEvents: canContinue ? 'auto' : 'none'}}>
              {t.reg_next} <Icon name="arrowRight" size={14}/>
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__head">
          <div className="card__title">{t.reg_summary}</div>
          <div className="card__subtitle">{t.reg_summary_sub}</div>
        </div>
        <div className="card__body">
          <div style={{display:'flex',alignItems:'center',gap:14,paddingBottom:18,borderBottom:'1px solid var(--ink-100)'}}>
            <div style={{
              width:56,height:56,borderRadius:'50%',
              background:'var(--ink-800)',color:'var(--cream-100)',
              display:'grid',placeItems:'center',
              fontWeight:700,fontSize:18,
            }}>{initials(form.name)}</div>
            <div>
              <div style={{fontWeight:600,fontSize:14,color:'var(--ink-800)'}}>{form.name}</div>
              <div style={{fontSize:12,color:'var(--ink-500)',marginTop:2}}>{form.role}</div>
              <div className="mono" style={{fontSize:11,color:'var(--ink-400)',marginTop:2}}>{form.code}</div>
            </div>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:14,paddingTop:18}}>
            <SummaryRow label={t.reg_fld_dept} val={form.dept}/>
            <SummaryRow label={t.reg_fld_email} val={form.email}/>
            <SummaryRow label={t.reg_fld_schedule} val={form.schedule} mono/>
          </div>

          <div style={{
            marginTop:20,
            padding:14,
            background:'var(--cream-50)',
            borderRadius:'var(--radius-sm)',
            fontSize:12,
            color:'var(--ink-500)',
            lineHeight:1.6,
          }}>
            <div style={{fontWeight:600,color:'var(--ink-700)',marginBottom:6}}>
              {t.reg_prints_captured}: {capturedCount}/10
            </div>
            {capturedCount > 0
              ? Object.entries(captured).map(([f, q]) => (
                  <div key={f} className="hstack" style={{justifyContent:'space-between',marginTop:4}}>
                    <span>{FL[f]}</span>
                    <span className="mono" style={{color:'var(--success)'}}>✓ {q}%</span>
                  </div>
                ))
              : <span>{t.reg_prints_none}</span>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3({ t, FL, form, captured, back, save }) {
  return (
    <div className="reg-grid" style={{gridTemplateColumns: '1fr 380px'}}>
      <div className="card">
        <div className="card__head">
          <div className="card__title">{t.reg_confirm_title}</div>
          <div className="card__subtitle">{t.reg_confirm_sub}</div>
        </div>
        <div className="card__body">
          <div style={{display:'flex',alignItems:'center',gap:18,padding:'8px 0 24px',borderBottom:'1px solid var(--ink-100)'}}>
            <div style={{
              width:72,height:72,borderRadius:'50%',
              background:'var(--ink-800)',color:'var(--gold-500)',
              display:'grid',placeItems:'center',
              fontWeight:700,fontSize:22,
              border:'1px solid var(--gold-500)',
            }}>{initials(form.name)}</div>
            <div>
              <div style={{fontSize:20,fontWeight:700,color:'var(--ink-800)',letterSpacing:'-0.02em'}}>
                {form.name}
              </div>
              <div style={{fontSize:13,color:'var(--ink-500)',marginTop:4}}>
                {form.role} · {form.dept}
              </div>
            </div>
          </div>

          <div className="reg-form-grid" style={{padding:'24px 0',gap:'18px 24px'}}>
            <SummaryRow label={t.reg_fld_cedula} val={form.cedula} mono/>
            <SummaryRow label={t.reg_fld_code} val={form.code} mono/>
            <SummaryRow label={t.reg_fld_email} val={form.email}/>
            <SummaryRow label={t.reg_fld_phone} val={form.phone} mono/>
            <SummaryRow label={t.reg_fld_schedule} val={form.schedule} mono/>
            <SummaryRow label={t.reg_prints_registered}
                        val={`${Object.keys(captured).length} ${Object.keys(captured).length !== 1 ? t.reg_fingers_unit_pl : t.reg_fingers_unit}`}/>
          </div>

          <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
            <button className="btn btn--ghost" onClick={back}>
              <Icon name="arrowLeft" size={14}/> {t.reg_back}
            </button>
            <button className="btn btn--gold btn--lg" onClick={save}>
              <Icon name="check" size={14}/> {t.reg_save}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__head">
          <div className="card__title">{t.reg_prints_captured}</div>
        </div>
        <div className="card__body">
          {Object.keys(captured).length === 0 ? (
            <div style={{textAlign:'center',padding:'24px 0',color:'var(--ink-400)',fontSize:13}}>
              {t.reg_prints_none_title}
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {Object.entries(captured).map(([f, q]) => (
                <div key={f} style={{
                  display:'flex',alignItems:'center',gap:12,
                  padding:'10px 12px',
                  background:'var(--cream-50)',
                  borderRadius:'var(--radius-sm)',
                  border:'1px solid var(--ink-100)',
                }}>
                  <div style={{
                    width:32,height:32,borderRadius:'50%',
                    background:'var(--success)',color:'var(--cream-100)',
                    display:'grid',placeItems:'center',
                  }}>
                    <Icon name="check" size={16} stroke={2.4}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--ink-800)'}}>
                      {FL[f]}
                    </div>
                    <div style={{fontSize:11,color:'var(--ink-400)',fontFamily:'var(--font-mono)'}}>
                      Calidad {q}% · Vector ISO 19794-2
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, val, mono }) {
  return (
    <div>
      <div style={{
        fontSize:10,fontWeight:600,
        color:'var(--ink-400)',letterSpacing:'0.1em',
        textTransform:'uppercase',marginBottom:5,
      }}>{label}</div>
      <div className={mono ? 'mono' : ''} style={{fontSize:14,color:'var(--ink-800)',fontWeight:500}}>
        {val}
      </div>
    </div>
  );
}

Object.assign(window, { RegisterView });
