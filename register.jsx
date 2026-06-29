/* register.jsx — register new employee + fingerprint capture */

const FINGERS = ['T-I', 'I-I', 'M-I', 'A-I', 'P-I', 'T-D', 'I-D', 'M-D', 'A-D', 'P-D'];

function generateNextCode() {
  const max = EMPLOYEES.reduce((m, e) => {
    const n = parseInt((e.id || '').replace('EMP-', ''), 10) || 0;
    return n > m ? n : m;
  }, 0);
  return 'EMP-' + String(max + 1).padStart(5, '0');
}

const REG_REQUIRED = [
  { key: 'name',     label: 'Nombre' },
  { key: 'cedula',   label: 'Cédula o Pasaporte' },
  { key: 'code',     label: 'Código' },
  { key: 'dept',     label: 'Departamento' },
  { key: 'role',     label: 'Cargo' },
  { key: 'email',    label: 'Correo' },
  { key: 'phone',    label: 'Teléfono' },
  { key: 'dob',      label: 'Fecha de nacimiento' },
  { key: 'schedule',  label: 'Horario' },
  { key: 'workDays',  label: 'Jornada laboral' },
];

function RegisterView({ t, setRoute, setFlash, onRegister }) {
  const FL = t.fingers;
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState(() => ({
    name: '',
    cedula: '',
    code: generateNextCode(),
    dept: '',
    role: '',
    email: '',
    phone: '',
    schedule: '',
    workDays: [],
    dob: '',
    gender: '',
    photo: null,
    status: 'pending',
    inactiveReason: null,
    inactiveComment: '',
  }));
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const allDepts = React.useMemo(() => [...new Set(EMPLOYEES.map(e => e.dept))].sort(), []);
  const allRoles = React.useMemo(() => [...new Set(EMPLOYEES.map(e => e.role))].sort(), []);

  const [regErrors, setRegErrors] = React.useState({});
  const clearError = (key) => setRegErrors(prev => { const n = {...prev}; delete n[key]; return n; });

  const [casoEspecial, setCasoEspecial] = React.useState(false);
  const [captureState, setCaptureState] = React.useState('idle');
  const [activeFinger, setActiveFinger] = React.useState('T-I');
  const [captured, setCaptured] = React.useState({});
  const capturedRef = React.useRef({});
  const [quality, setQuality] = React.useState(0);
  const [wrongDetected, setWrongDetected] = React.useState(null);
  const [readerError, setReaderError]     = React.useState(null);
  const scanTimerRef    = React.useRef(null);
  const captureTimerRef  = React.useRef(null);
  const hidDeviceRef     = React.useRef(null);
  const [hidConnected, setHidConnected] = React.useState(false);
  // Guarda el rawId de la credencial creada para reusar con get() en capturas siguientes
  const credIdRef = React.useRef(sessionStorage.getItem('uasd-cred-id') || null);

  // Mantiene capturedRef sincronizado — evita closures stale en async startCapture
  React.useEffect(() => { capturedRef.current = captured; }, [captured]);

  // Limpia la conexión HID al desmontar
  React.useEffect(() => () => {
    if (hidDeviceRef.current?.opened) hidDeviceRef.current.close();
  }, []);

  const canUseHID = !!navigator.hid;

  const connectHIDReader = async () => {
    if (!canUseHID) {
      alert('WebHID no está disponible. Usa Chrome o Edge y sirve la página en localhost.');
      return;
    }
    try {
      // Muestra el selector de dispositivos HID del SO — usuario elige su lector
      const devices = await navigator.hid.requestDevice({ filters: [] });
      if (!devices.length) return;
      const device = devices[0];
      await device.open();
      hidDeviceRef.current = device;
      setHidConnected(true);

      // Cualquier reporte HID entrante = dedo detectado → dispara captura
      device.addEventListener('inputreport', () => {
        setCaptureState(prev => {
          if (prev === 'idle') { startCapture(); }
          return prev;
        });
      });

      device.addEventListener('close', () => {
        setHidConnected(false);
        hidDeviceRef.current = null;
      });
    } catch (err) {
      if (err.name !== 'NotAllowedError') console.warn('HID error:', err.message);
    }
  };

  const disconnectHIDReader = async () => {
    if (hidDeviceRef.current?.opened) await hidDeviceRef.current.close();
    hidDeviceRef.current = null;
    setHidConnected(false);
  };

  const isSecureCtx = location.protocol === 'https:'
    || location.hostname === 'localhost'
    || location.hostname === '127.0.0.1'
    || location.hostname === '::1';
  const canUseRealReader = hidConnected || !!(window.PublicKeyCredential && isSecureCtx);

  const runSimulation = (finger) => {
    let q = 0;
    scanTimerRef.current = setInterval(() => {
      q += Math.random() * 14 + 6;
      if (q >= 100) {
        q = 96 + Math.random() * 4;
        clearInterval(scanTimerRef.current);
        const others = FINGERS.filter(f => f !== finger);
        if (Math.random() < 0.22 && others.length > 0) {
          const wrong = others[Math.floor(Math.random() * others.length)];
          setQuality(0); setCaptureState('error'); setWrongDetected(wrong);
          captureTimerRef.current = setTimeout(() => {
            setCaptureState('idle'); setWrongDetected(null);
          }, 3000);
          return;
        }
        const finalQ = Math.round(q);
        setQuality(finalQ); setCaptureState('success');
        setCaptured(prev => {
          const updated = { ...prev, [finger]: finalQ };
          captureTimerRef.current = setTimeout(() => {
            setCaptureState('idle');
            const next = FINGERS.find(f => !updated[f]);
            if (next) setActiveFinger(next);
          }, 1400);
          return updated;
        });
      } else { setQuality(q); }
    }, 150);
  };

  // fingerOverride permite encadenar la siguiente captura desde el callback de éxito
  // (antes de que expire la ventana de activación del usuario en el browser)
  const startCapture = async (fingerOverride) => {
    clearInterval(scanTimerRef.current);
    clearTimeout(captureTimerRef.current);
    const finger = fingerOverride || activeFinger;
    // Asegurar que activeFinger refleje el dedo actual (cuando se encadena)
    if (fingerOverride && fingerOverride !== activeFinger) setActiveFinger(fingerOverride);
    setCaptureState('scanning'); setWrongDetected(null); setQuality(0);

    if (canUseRealReader) {
      try {
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);
        let verified = false;

        if (credIdRef.current) {
          // Credencial ya creada → solo verifica con Touch ID (sin diálogo "Guardar contraseña")
          const rawId = Uint8Array.from(atob(credIdRef.current), c => c.charCodeAt(0));
          const assertion = await navigator.credentials.get({ publicKey: {
            challenge,
            allowCredentials: [{ type: 'public-key', id: rawId, transports: ['internal'] }],
            userVerification: 'required',
            timeout: 30000,
          }});
          verified = !!assertion;
        } else {
          // Primera vez: crear credencial (aparece "Add a passkey?" solo esta vez)
          const label = (FL && FL[finger]) || finger;
          const cred = await navigator.credentials.create({ publicKey: {
            challenge,
            rp: { name: 'UASD Fingerprint System' },
            user: {
              id: new TextEncoder().encode(form.cedula || 'uasd-user'),
              name: form.name || 'Usuario',
              displayName: form.name || 'Usuario',
            },
            pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
            authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
            timeout: 30000,
          }});
          if (cred) {
            // Guardar ID para todos los dedos restantes
            const b64 = btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));
            credIdRef.current = b64;
            sessionStorage.setItem('uasd-cred-id', b64);
            verified = true;
          }
        }

        if (verified) {
          const finalQ = 90 + Math.round(Math.random() * 9);
          const newCaptures = { ...capturedRef.current, [finger]: finalQ };
          capturedRef.current = newCaptures;
          setCaptured(newCaptures);
          setQuality(finalQ);
          setCaptureState('success');
          const next = FINGERS.find(f => !newCaptures[f]);
          captureTimerRef.current = setTimeout(() => {
            setCaptureState('idle');
            if (next) setActiveFinger(next);
          }, 900);
          if (next) await startCapture(next);
        }
      } catch (err) {
        console.warn('WebAuthn:', err.name, err.message);
        if (err.name === 'NotAllowedError') {
          setCaptureState('idle');
        } else {
          setReaderError(`${err.name}: ${err.message}`);
          setTimeout(() => setReaderError(null), 5000);
          runSimulation(finger);
        }
      }
    } else {
      runSimulation(finger);
    }
  };

  React.useEffect(() => () => {
    clearInterval(scanTimerRef.current);
    clearTimeout(captureTimerRef.current);
  }, []);

  // Auto-inicia captura al cambiar de dedo
  // Simulación: automático siempre · Modo real: solo encadenado desde éxito anterior
  const autoTriggerRef = React.useRef(null);
  React.useEffect(() => {
    clearTimeout(autoTriggerRef.current);
    if (!canUseRealReader && step === 2 && captureState === 'idle' && !captured[activeFinger]) {
      autoTriggerRef.current = setTimeout(() => startCapture(), 900);
    }
    return () => clearTimeout(autoTriggerRef.current);
  }, [activeFinger, step]);

  const stepDef = [
    { n: 1, label: t.reg_step_1 },
    { n: 2, label: t.reg_step_2 },
    { n: 3, label: t.reg_step_3 },
  ];

  const [animConnector, setAnimConnector] = React.useState(null);
  const prevStepRef = React.useRef(1);


  const goStep = (n) => {
    const prev = prevStepRef.current;
    prevStepRef.current = n;
    if (n > prev) setAnimConnector(prev);
    setStep(n);
    const id = setTimeout(() => setAnimConnector(null), 700);
    return () => clearTimeout(id);
  };

  const goNext = () => goStep(Math.min(3, step + 1));
  const back   = () => goStep(Math.max(1, step - 1));

  const tryNext = () => {
    const errs = {};
    if (!form.photo) errs.photo = true;
    if (!form.name?.trim()) errs.name = true;
    if (!form.cedula?.trim()) errs.cedula = true;
    if (!form.code?.trim()) errs.code = true;
    if (!form.dept?.trim()) errs.dept = true;
    if (!form.role?.trim()) errs.role = true;
    if (!form.email?.trim()) errs.email = true;
    if (!form.phone || form.phone.replace(/\D/g, '').length === 0) errs.phone = true;
    if (!form.dob?.trim()) errs.dob = true;
    if (!form.schedule?.trim()) errs.schedule = true;
    if (!form.workDays || form.workDays.length === 0) errs.workDays = true;
    if (Object.keys(errs).length > 0) { setRegErrors(errs); return; }

    // Duplicados
    const nameLower   = form.name.trim().toLowerCase();
    const cedulaClean = form.cedula.replace(/\D/g, '');
    const emailLower  = form.email.trim().toLowerCase();
    const isDup = EMPLOYEES.some(emp =>
      emp.cedula?.replace(/\D/g, '') === cedulaClean ||
      emp.name?.trim().toLowerCase()  === nameLower  ||
      emp.email?.trim().toLowerCase() === emailLower
    );
    if (isDup) {
      setRegErrors({ _dup: true, cedula: true, name: true, email: true });
      return;
    }

    setRegErrors({});
    goNext();
  };

  const save = () => {
    onRegister?.({ ...form, id: form.code, lastIn: '—' });
    window.auditLog?.add({ name: form.name || 'Nuevo empleado', id: form.cedula || '—' });
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
        {step < 3 && (
          <div className="page__actions">
            <button className="btn btn--ghost btn--ghost-danger" onClick={() => setRoute('dashboard')}>
              <Icon name="x" size={14}/> {t.reg_cancel}
            </button>
          </div>
        )}
      </div>

      <div className="reg-stepper">
        {stepDef.map((s, i) => (
          <React.Fragment key={s.n}>
            <div className={`reg-stepper__item ${step === s.n ? 'reg-stepper__item--active' : ''} ${step > s.n ? 'reg-stepper__item--done' : ''}`}
                 onClick={() => s.n < step && goStep(s.n)}>
              <span className="reg-stepper__num">
                {step > s.n ? <Icon name="check" size={12} stroke={2.4}/> : s.n}
              </span>
              <span className="reg-stepper__label">{s.label}</span>
            </div>
            {i < stepDef.length - 1 && (
              <div className={`reg-stepper__connector${step > s.n ? ' reg-stepper__connector--done' : ''}`}>
                {animConnector === s.n && <span className="reg-stepper__traveler" key={`tv-${step}`} />}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>


      {step === 1 && (
        <Step1 t={t} form={form} update={update} setForm={setForm}
               allDepts={allDepts} allRoles={allRoles}
               errors={regErrors} clearError={clearError}
               next={tryNext} skipToConfirm={() => goStep(3)}/>
      )}
      {step === 2 && (
        <Step2 t={t} FL={FL}
               captureState={captureState}
               activeFinger={activeFinger} setActiveFinger={setActiveFinger}
               captured={captured} quality={quality}
               startCapture={startCapture}
               wrongDetected={wrongDetected}
               next={goNext} back={back} skipToConfirm={() => goStep(3)}
               form={form}
               casoEspecial={casoEspecial} setCasoEspecial={setCasoEspecial}
               realReader={canUseRealReader}
               hidConnected={hidConnected}
               canUseHID={canUseHID}
               connectHID={connectHIDReader}
               disconnectHID={disconnectHIDReader}
               readerError={readerError}/>
      )}
      {step === 3 && <Step3 t={t} FL={FL} form={form} captured={captured} casoEspecial={casoEspecial} back={back} save={save}/>}
    </div>
  );
}

function Step1({ t, form, update, setForm, allDepts, allRoles, errors, clearError, next, skipToConfirm }) {
  return (
    <div className="reg-grid">
      <div className="card">
        <div className="card__head">
          <div className="card__title">{t.reg_step_1}</div>
          <div className="card__subtitle">{t.reg_step1_sub}</div>
        </div>
        <div className="card__body">
          <div className="reg-form-grid">

            {/* Nombre */}
            <div className={`field${errors.name ? ' field--error' : ''}`} style={{gridColumn:'span 2'}}>
              <label className="field__label">{t.reg_fld_name} <span className="field__req">*</span></label>
              <input className="field__input" value={form.name} maxLength={30}
                     onChange={e => { clearError('name'); update('name', e.target.value); }}/>
            </div>

            {/* Género */}
            <div className="field" style={{gridColumn:'span 2'}}>
              <label className="field__label">Género</label>
              <div className="gender-picker">
                {[
                  {val:'M', label:'Masculino', color:'var(--ink-600)'},
                  {val:'F', label:'Femenino',  color:'#9e4d6b'},
                ].map(o => {
                  const on = form.gender === o.val;
                  return (
                    <button key={o.val} type="button"
                      className={`gender-picker__opt${on ? ' gender-picker__opt--on' : ''}`}
                      style={on ? { borderColor: o.color, background: o.color } : {}}
                      onClick={() => update('gender', o.val)}>
                      {o.val === 'M' && <Icon name="userMale" size={13} stroke={1.6}/>}
                      {o.val === 'F' && <Icon name="userFemale" size={13} stroke={1.6}/>}
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cédula o Pasaporte */}
            <div className={`field${errors.cedula ? ' field--error' : ''}`}>
              <label className="field__label">Cédula o Pasaporte <span className="field__req">*</span></label>
              <input className="field__input mono" value={formatCedula(form.cedula)} maxLength={13}
                     placeholder="000-0000000-0"
                     onChange={e => {
                       clearError('cedula');
                       update('cedula', e.target.value.replace(/\D/g, '').slice(0, 11));
                     }}/>
            </div>

            {/* Código — auto-generado, solo lectura */}
            <div className="field">
              <label className="field__label">{t.reg_fld_code}</label>
              <input className="field__input mono" value={form.code} readOnly
                     style={{background:'var(--cream-50)',color:'var(--ink-500)',cursor:'default'}}/>
            </div>

            {/* Departamento — solo via selección o "Agregar" */}
            <div className={`field${errors.dept ? ' field--error' : ''}`}>
              <label className="field__label">{t.reg_fld_dept} <span className="field__req">*</span></label>
              <ComboBoxField value={form.dept} maxLength={50}
                options={allDepts} requireSelection
                onChange={v => { clearError('dept'); update('dept', v); }}/>
            </div>

            {/* Cargo */}
            <div className={`field${errors.role ? ' field--error' : ''}`}>
              <label className="field__label">{t.reg_fld_role} <span className="field__req">*</span></label>
              <ComboBoxField value={form.role} maxLength={30}
                options={allRoles}
                onChange={v => { clearError('role'); update('role', v); }}/>
            </div>

            {/* Correo */}
            <div className={`field${errors.email ? ' field--error' : ''}`}>
              <label className="field__label">{t.reg_fld_email} <span className="field__req">*</span></label>
              <EmailField value={form.email}
                onChange={v => { clearError('email'); update('email', v); }}/>
            </div>

            {/* Teléfono */}
            <div className={`field${errors.phone ? ' field--error' : ''}`}>
              <label className="field__label">{t.reg_fld_phone} <span className="field__req">*</span></label>
              <PhoneField value={form.phone}
                onChange={v => { clearError('phone'); update('phone', v); }}/>
            </div>

            {/* Fecha de nacimiento */}
            <div className={`field${errors.dob ? ' field--error' : ''}`}>
              <label className="field__label">{t.dash_fld_dob || 'Fecha de nacimiento'} <span className="field__req">*</span></label>
              <DatePickerField value={form.dob} minAge={18} maxAge={100}
                onChange={v => { clearError('dob'); update('dob', v); }}/>
            </div>

            {/* Horario */}
            <div className={`field${errors.schedule ? ' field--error' : ''}`}>
              <label className="field__label">{t.reg_fld_schedule} <span className="field__req">*</span></label>
              <TimePickerField value={form.schedule}
                onChange={v => { clearError('schedule'); update('schedule', v); }}/>
            </div>

            {/* Jornada laboral */}
            <div className={`field${errors.workDays ? ' field--error' : ''}`}>
              <label className="field__label">Jornada laboral <span className="field__req">*</span></label>
              <WorkDaysPicker
                value={form.workDays}
                onChange={v => { clearError('workDays'); update('workDays', v); }}/>
              {form.workDays?.length > 0 && (
                <span style={{ fontSize:11, color:'var(--ink-300)', marginTop:4, display:'block' }}>
                  {workDaysLabel(form.workDays)}
                </span>
              )}
            </div>

            {/* Estado */}
            <div className="field" style={{gridColumn:'span 2'}}>
              <label className="field__label">{t.dash_col_status || 'Estado'}</label>
              <StatusPicker
                status={form.status}
                inactiveReason={form.inactiveReason}
                onChange={(status, reason) => setForm(f => ({ ...f, status, inactiveReason: reason }))}
                t={t}/>
            </div>

            {/* Comentario — opcional */}
            <div className="field" style={{gridColumn:'span 2'}}>
              <label className="field__label">{t.dash_col_comment || 'Comentario'}</label>
              <input className="field__input" value={form.inactiveComment || ''}
                     onChange={e => update('inactiveComment', e.target.value)}
                     placeholder="Opcional"/>
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="edit-modal__errors" style={{marginTop: 18}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>
                {errors._dup
                  ? 'Ya existe un empleado registrado con estos parámetros.'
                  : `Completa los campos obligatorios: ${REG_REQUIRED.filter(f => errors[f.key]).map(f => f.label).join(', ')}.`
                }
              </span>
            </div>
          )}

          <div style={{display:'flex',justifyContent:'flex-end',marginTop:24}}>
            <button className="btn btn--primary" onClick={next}>
              {t.reg_next} <Icon name="arrowRight" size={14}/>
            </button>
          </div>
        </div>
      </div>

      {/* Foto — columna derecha */}
      <div className="card">
        <div className="card__head" style={{borderBottom: errors.photo ? '1px solid rgba(193,85,77,0.35)' : undefined}}>
          <div className="card__title">{t.reg_fld_photo} <span className="field__req">*</span></div>
          <div className="card__subtitle" style={{color: errors.photo ? 'var(--danger)' : undefined}}>
            {errors.photo ? 'La foto de perfil es obligatoria' : t.reg_photo_sub}
          </div>
        </div>
        <PhotoCard t={t} form={form} update={(k,v) => { update(k,v); if(k==='photo' && v) clearError('photo'); }}/>
      </div>
    </div>
  );
}

function PhotoCard({ t, form, update }) {
  const fileRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const [lightbox, setLightbox] = React.useState(false);

  React.useEffect(() => {
    if (!lightbox) return;
    const onKey = e => { if (e.key === 'Escape') setLightbox(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox]);

  function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => update('photo', e.target.result);
    reader.readAsDataURL(file);
  }

  function onDrop(e) {
    e.preventDefault(); setDragging(false);
    loadFile(e.dataTransfer.files[0]);
  }

  return (
    <div className="card__body">
      <div className="photo-tip">
        <Icon name="eye" size={12} stroke={1.8}/>
        <span><strong>{t.reg_photo_tip_label}</strong> {t.reg_photo_tip}</span>
      </div>

      <div className={`photo-drop${dragging ? ' photo-drop--drag' : ''}${form.photo ? ' photo-drop--filled' : ''}`}
        onClick={() => { if (!form.photo) fileRef.current.click(); }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}>
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}}
          onChange={e => loadFile(e.target.files[0])}/>
        {form.photo ? (
          <img src={form.photo} alt="Foto de perfil" className="photo-drop__preview"
            onClick={e => { e.stopPropagation(); setLightbox(true); }}/>
        ) : (
          <div className={`photo-drop__avatar${form.gender ? ' photo-drop__avatar--active' : ''}`}>
            <Icon name={form.gender === 'M' ? 'photoMale' : form.gender === 'F' ? 'photoFemale' : 'user'}
              size={48} stroke={1.4}/>
          </div>
        )}
        <div className="photo-drop__label">
          {form.photo ? 'Toca la foto para ampliar' : (form.gender === 'M' ? 'Foto del empleado' : form.gender === 'F' ? 'Foto de la empleada' : 'Foto de perfil')}
        </div>
        <div className="photo-drop__sub">
          {dragging ? 'Suelta la imagen aquí' : form.photo ? 'Usa el botón para cambiarla' : 'Arrastra aquí o haz clic'}
        </div>
      </div>

      {lightbox && (
        <div className="photo-lightbox" onClick={() => setLightbox(false)}>
          <img src={form.photo} alt="Vista previa" className="photo-lightbox__img"
            onClick={e => e.stopPropagation()}/>
          <button className="photo-lightbox__close" onClick={() => setLightbox(false)}>
            <Icon name="x" size={20} stroke={2}/>
          </button>
        </div>
      )}

      <button type="button" className="btn btn--ghost btn--block" style={{marginTop:14}}
        onClick={() => fileRef.current.click()}>
        <Icon name="upload" size={14}/> {t.reg_photo_upload}
      </button>

      {form.photo && (
        <button type="button" className="btn btn--ghost btn--block" style={{marginTop:8,fontSize:11.5}}
          onClick={() => update('photo', null)}>
          <Icon name="trash" size={13}/> Quitar foto
        </button>
      )}
    </div>
  );
}

function HandsMap({ FL, captured, activeFinger, setActiveFinger, captureState, wrongDetected }) {
  const [rot, setRot] = React.useState({ y: 8, x: -10 });
  const [dragging, setDragging] = React.useState(false);
  const [hoveredFinger, setHoveredFinger] = React.useState(null);
  const drag = React.useRef({ on: false, lx: 0, ly: 0 });

  const onPD = (e) => { drag.current = { on:true, lx:e.clientX, ly:e.clientY }; setDragging(true); e.currentTarget.setPointerCapture(e.pointerId); };
  const onPM = (e) => {
    if (!drag.current.on) return;
    const dx = e.clientX - drag.current.lx, dy = e.clientY - drag.current.ly;
    drag.current.lx = e.clientX; drag.current.ly = e.clientY;
    setRot(r => ({ y: r.y + dx * 0.55, x: Math.max(-32, Math.min(26, r.x + dy * 0.35)) }));
  };
  const onPU = () => { drag.current.on = false; setDragging(false); };

  function fill(id) {
    if (wrongDetected === id) return 'var(--danger)';
    if (captured[id])         return 'var(--success)';
    if (id === activeFinger)  return 'var(--ink-600)';
    return 'var(--cream-100)';
  }
  function stroke(id) {
    if (wrongDetected === id) return '#a03030';
    if (captured[id])         return '#2a6a4a';
    if (id === activeFinger)  return 'var(--ink-800)';
    if (id === hoveredFinger) return 'rgba(255,255,255,0.75)';
    return 'var(--ink-200)';
  }
  function sw(id) {
    if (id === hoveredFinger && id !== activeFinger && !captured[id]) return 2;
    return (id === activeFinger || captured[id] || wrongDetected === id) ? 2 : 1.5;
  }

  // cx-based finger data — isRight=true → labeled "Izquierda" → -I fingers
  //                         isRight=false → labeled "Derecha"    → -D fingers
  const RIGHT = [
    { id:'P-I', cx:15, y1:30, y2:88, tw:13, bw:15 },
    { id:'A-I', cx:35, y1:14, y2:88, tw:15, bw:17 },
    { id:'M-I', cx:57, y1:8,  y2:88, tw:16, bw:18 },
    { id:'I-I', cx:79, y1:14, y2:88, tw:15, bw:17 },
  ];
  const LEFT = [
    { id:'I-D', cx:24, y1:14, y2:88, tw:15, bw:17 },
    { id:'M-D', cx:46, y1:8,  y2:88, tw:16, bw:18 },
    { id:'A-D', cx:68, y1:14, y2:88, tw:15, bw:17 },
    { id:'P-D', cx:88, y1:30, y2:88, tw:13, bw:15 },
  ];

  // Segment path: tipRound=true → semicircle tip, false → both ends rounded-rect
  function segPath(cx, ya, yb, wa, wb, tipRound) {
    if (tipRound) {
      const r = wa / 2;
      return `M${cx-wb/2},${yb} L${cx-wa/2},${ya+r} A${r},${r} 0 0,1 ${cx+wa/2},${ya+r} L${cx+wb/2},${yb} Z`;
    }
    const r = 2;
    return `M${cx-wa/2+r},${ya} L${cx+wa/2-r},${ya} Q${cx+wa/2},${ya} ${cx+wa/2},${ya+r} L${cx+wb/2},${yb-r} Q${cx+wb/2},${yb} ${cx+wb/2-r},${yb} L${cx-wb/2+r},${yb} Q${cx-wb/2},${yb} ${cx-wb/2},${yb-r} L${cx-wa/2},${ya+r} Q${cx-wa/2},${ya} ${cx-wa/2+r},${ya} Z`;
  }

  function renderFinger(f) {
    const { id, cx, y1, y2, tw, bw } = f;
    const h = y2 - y1;
    const wAt = t => tw + (bw - tw) * t;
    const gap = 2.5;
    const segs = [
      { ya: y1,                  yb: y1 + h*0.295,        ta: 0,                   tb: 0.295, tip: true  },
      { ya: y1 + h*0.295 + gap,  yb: y1 + h*0.625,        ta: (h*0.295+gap)/h,     tb: 0.625, tip: false },
      { ya: y1 + h*0.625 + gap,  yb: y2,                  ta: (h*0.625+gap)/h,     tb: 1.0,   tip: false },
    ];
    const isActive = id === activeFinger && !captured[id];
    const isWrong  = wrongDetected === id;
    const cky = y1 + h * 0.12;
    return (
      <g key={id}
         className={`fp-finger${isActive?' fp-finger--active':''}${isWrong?' fp-finger--wrong':''}`}
         onClick={() => setActiveFinger(id)}
         onMouseEnter={() => setHoveredFinger(id)}
         onMouseLeave={() => setHoveredFinger(null)}
         style={{cursor:'pointer'}}>
        {segs.map((s, i) => {
          const wa = wAt(s.ta), wb = wAt(s.tb);
          const d = segPath(cx, s.ya, s.yb, wa, wb, s.tip);
          return (
            <g key={i}>
              <path d={d} fill={fill(id)} stroke={stroke(id)} strokeWidth={i===0 ? sw(id) : 0.7}/>
              <path d={d} fill="url(#fp-hi)" stroke="none" pointerEvents="none"/>
              <path d={d} fill="url(#fp-sh)" stroke="none" pointerEvents="none"/>
            </g>
          );
        })}
        <ellipse cx={cx} cy={y1 + h*0.09} rx={wAt(0.02)/2 - 1} ry={h*0.072}
                 fill="rgba(255,255,255,0.55)" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5"/>
        {captureState==='scanning' && isActive && (
          <ellipse className="fp-finger--scan" cx={cx} cy={y1+tw/2+2} rx={tw/2+3} ry={tw/2+2}
                   fill="none" stroke="rgba(48,60,102,0.5)" strokeWidth="1.5"/>
        )}
        {captured[id] && (
          <path d={`M${cx-3.5},${cky} L${cx-0.5},${cky+3} L${cx+4.5},${cky-3}`}
                fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        )}
      </g>
    );
  }

  function renderThumb(id, cx, y1, y2, tw, bw, pivot, angle) {
    const h = y2 - y1;
    const wAt = t => tw + (bw - tw) * t;
    const gap = 2.5;
    const segs = [
      { ya: y1,                  yb: y1 + h*0.46,         ta: 0,                   tb: 0.46, tip: true  },
      { ya: y1 + h*0.46 + gap,   yb: y2,                  ta: (h*0.46+gap)/h,      tb: 1.0,  tip: false },
    ];
    const isActive = id === activeFinger && !captured[id];
    const cky = y1 + h * 0.14;
    return (
      <g key={id} transform={`rotate(${angle},${pivot[0]},${pivot[1]})`}
         className={`fp-finger${isActive?' fp-finger--active':''}${wrongDetected===id?' fp-finger--wrong':''}`}
         onClick={() => setActiveFinger(id)}
         onMouseEnter={() => setHoveredFinger(id)}
         onMouseLeave={() => setHoveredFinger(null)}
         style={{cursor:'pointer'}}>
        {segs.map((s, i) => {
          const wa = wAt(s.ta), wb = wAt(s.tb);
          const d = segPath(cx, s.ya, s.yb, wa, wb, s.tip);
          return (
            <g key={i}>
              <path d={d} fill={fill(id)} stroke={stroke(id)} strokeWidth={i===0 ? sw(id) : 0.7}/>
              <path d={d} fill="url(#fp-hi)" stroke="none" pointerEvents="none"/>
              <path d={d} fill="url(#fp-sh)" stroke="none" pointerEvents="none"/>
            </g>
          );
        })}
        <ellipse cx={cx} cy={y1 + h*0.11} rx={wAt(0.02)/2 - 1} ry={h*0.08}
                 fill="rgba(255,255,255,0.55)" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5"/>
        {captureState==='scanning' && isActive && (
          <ellipse className="fp-finger--scan" cx={cx} cy={y1+tw/2+2} rx={tw/2+3} ry={tw/2+2}
                   fill="none" stroke="rgba(48,60,102,0.5)" strokeWidth="1.5"/>
        )}
        {captured[id] && (
          <path d={`M${cx-3.5},${cky} L${cx-0.5},${cky+3} L${cx+4.5},${cky-3}`}
                fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        )}
      </g>
    );
  }

  function renderHand(isRight) {
    const fingers = isRight ? RIGHT : LEFT;
    // Organic palm with thenar eminence curve
    const palmD = isRight
      ? "M 19,192 C 11,185 7,170 8,152 C 7,133 6,115 8,102 Q 7,92 13,87 L 89,87 Q 96,87 101,93 C 107,101 109,116 107,131 C 105,149 101,169 97,192 Q 58,199 19,192 Z"
      : "M 96,192 C 104,185 108,170 107,152 C 108,133 109,115 107,102 Q 108,92 102,87 L 26,87 Q 19,87 14,93 C 8,101 6,116 8,131 C 10,149 14,169 18,192 Q 57,199 96,192 Z";
    const th = isRight
      ? { id:'T-I', cx:107, y1:120, y2:174, tw:18, bw:22, pivot:[108,149], angle:26 }
      : { id:'T-D', cx:8,   y1:120, y2:174, tw:18, bw:22, pivot:[9,149],   angle:-26 };
    return (
      <div key={isRight?'r':'l'} style={{textAlign:'center', padding:'0 10px'}}
           className={isRight ? 'fp-hand-float' : 'fp-hand-float--delayed'}>
        <svg viewBox="0 0 115 196" style={{width:130,height:'auto',display:'block',margin:'0 auto',overflow:'visible'}}>
          <defs>
            <linearGradient id="fp-hi" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="rgba(255,255,255,0)"/>
              <stop offset="38%"  stopColor="rgba(255,255,255,0.22)"/>
              <stop offset="62%"  stopColor="rgba(255,255,255,0.22)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
            </linearGradient>
            <linearGradient id="fp-sh" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="rgba(0,0,0,0.10)"/>
              <stop offset="26%"  stopColor="rgba(0,0,0,0)"/>
              <stop offset="74%"  stopColor="rgba(0,0,0,0)"/>
              <stop offset="100%" stopColor="rgba(0,0,0,0.10)"/>
            </linearGradient>
          </defs>
          <path d={palmD} fill="var(--cream-100)" stroke="var(--ink-200)" strokeWidth="1.5"/>
          {/* Subtle palm crease lines */}
          <path d={isRight?"M 14,128 Q 55,114 98,126":"M 17,128 Q 58,114 101,126"}
                fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="0.9" strokeLinecap="round"/>
          <path d={isRight?"M 12,148 Q 55,136 100,146":"M 15,148 Q 58,136 103,146"}
                fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.8" strokeLinecap="round"/>
          {isRight ? fingers.map(f => renderFinger(f)) : null}
          {renderThumb(th.id, th.cx, th.y1, th.y2, th.tw, th.bw, th.pivot, th.angle)}
          {!isRight ? fingers.map(f => renderFinger(f)) : null}
        </svg>
        <div style={{fontSize:9,color:'var(--ink-400)',marginTop:5,fontFamily:'var(--font-ui)',letterSpacing:'0.08em',textTransform:'uppercase',fontWeight:500}}>
          {isRight ? 'Izquierda' : 'Derecha'}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display:'flex', gap:20, justifyContent:'center', alignItems:'flex-end',
        transform:`perspective(560px) rotateY(${rot.y}deg) rotateX(${rot.x}deg)`,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect:'none',
      }}
      onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onPointerLeave={onPU}
    >
      {renderHand(true)}
      {renderHand(false)}
    </div>
  );
}


function Step2({ t, FL, captureState, activeFinger, setActiveFinger, captured, quality, startCapture, wrongDetected, next, back, skipToConfirm, form, casoEspecial, setCasoEspecial, realReader, hidConnected, canUseHID, connectHID, disconnectHID, readerError }) {
  const capturedCount = Object.keys(captured).length;
  const canContinue = casoEspecial ? capturedCount >= 1 : capturedCount >= 10;
  const [showIncomplete, setShowIncomplete] = React.useState(false);
  const incompleteTimer = React.useRef(null);

  function tryNext() {
    if (!canContinue) {
      setShowIncomplete(true);
      clearTimeout(incompleteTimer.current);
      incompleteTimer.current = setTimeout(() => setShowIncomplete(false), 3000);
      return;
    }
    next();
  }

  return (
    <div className="reg-grid">
      <div className="card">
        <div className="card__head" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
          <div style={{display:'flex', flexDirection:'column', gap:5}}>
            <div className="card__title">{t.reg_capture_title}</div>
            <div className="card__subtitle">
              {capturedCount >= 10 ? 'Registro completo' : 'Coloca el dedo en el sensor para empezar'}
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:8, alignSelf:'flex-end'}}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:7,
              padding:'5px 12px', borderRadius:20,
              background: (hidConnected || realReader) ? 'rgba(42,106,74,0.09)' : 'rgba(193,85,77,0.07)',
              border: (hidConnected || realReader) ? '1px solid rgba(42,106,74,0.28)' : '1px solid rgba(193,85,77,0.25)',
              fontSize:9, fontFamily:'var(--font-mono)', fontWeight:700,
              letterSpacing:'0.12em', textTransform:'uppercase',
              color: (hidConnected || realReader) ? 'var(--success)' : 'var(--danger)',
            }}>
              <span style={{
                width:6, height:6, borderRadius:'50%', flexShrink:0,
                background: (hidConnected || realReader) ? 'var(--success)' : 'var(--danger)',
                boxShadow: (hidConnected || realReader) ? '0 0 6px var(--success)' : '0 0 5px var(--danger)',
              }}/>
              {hidConnected || realReader ? 'Lector activo' : 'Lector inactivo'}
            </div>
            {canUseHID && !hidConnected && !realReader && (
              <button className="btn btn--ghost" onClick={connectHID}
                style={{fontSize:11, padding:'4px 10px', gap:5}}>
                <Icon name="fingerprint" size={12}/> Conectar lector USB
              </button>
            )}
            {hidConnected && (
              <button className="btn btn--ghost" onClick={disconnectHID}
                style={{fontSize:11, padding:'4px 10px', gap:5, color:'var(--ink-400)'}}>
                <Icon name="x" size={11}/> Desconectar
              </button>
            )}
          </div>
        </div>

        <div className="card__body">
          {/* Panel principal: manos + lector */}
          <div style={{
            background:'var(--paper)',
            border:'1px solid var(--ink-100)',
            borderRadius:'var(--radius-md)',
            marginBottom:16, overflow:'hidden',
          }}>
            <div style={{display:'flex', alignItems:'center', padding:'24px 0 20px'}}>
              {/* Manos */}
              <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'0 24px'}}>
                <HandsMap
                  FL={FL} captured={captured}
                  activeFinger={activeFinger} setActiveFinger={setActiveFinger}
                  captureState={captureState}
                  wrongDetected={wrongDetected}/>
              </div>

              <div style={{width:1, alignSelf:'stretch', background:'var(--ink-100)', flexShrink:0, margin:'8px 0'}}/>

              {/* Escáner */}
              <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 24px', gap:10}}>
                {/* Chip dedo activo */}
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:6,
                  padding:'5px 14px', borderRadius:20,
                  background: wrongDetected ? 'rgba(193,85,77,0.08)'
                             : captured[activeFinger] ? 'rgba(42,106,74,0.08)'
                             : captureState === 'scanning' ? 'rgba(48,60,102,0.07)' : 'var(--cream-50)',
                  border: wrongDetected ? '1px solid rgba(193,85,77,0.30)'
                        : captured[activeFinger] ? '1px solid rgba(42,106,74,0.25)'
                        : captureState === 'scanning' ? '1px solid rgba(48,60,102,0.18)' : '1px solid var(--ink-100)',
                  fontSize:10, fontFamily:'var(--font-ui)', fontWeight:700,
                  color: wrongDetected ? 'var(--danger)'
                       : captured[activeFinger] ? 'var(--success)'
                       : captureState === 'scanning' ? 'var(--ink-700)' : 'var(--ink-600)',
                  letterSpacing:'0.06em', textTransform:'uppercase',
                  transition:'all 0.3s',
                }}>
                  <Icon name="fingerprint" size={11} stroke={2}/>
                  {FL[activeFinger]}
                </div>

                <FingerprintScanner state={captureState === 'idle' && captured[activeFinger] ? 'success' : captureState} size={200} rings={false}/>

                <div style={{
                  fontSize:10, fontFamily:'var(--font-mono)',
                  color: captureState === 'success' ? 'var(--success)'
                       : captureState === 'scanning' ? 'rgba(201,169,97,0.9)'
                       : captured[activeFinger] ? 'var(--success)' : 'var(--ink-400)',
                  letterSpacing:'0.14em', textTransform:'uppercase',
                }}>
                  {captureState === 'scanning' && '⟳ Escaneando…'}
                  {captureState === 'success'  && '✓ Capturado'}
                  {captureState === 'idle' && !captured[activeFinger] && 'Coloca el dedo en el lector'}
                  {captureState === 'idle' &&  captured[activeFinger] && '✓ Huella registrada'}
                </div>
              </div>
            </div>

          </div>

          {/* Barra de calidad */}
          {wrongDetected ? (
            <div style={{
              display:'flex', alignItems:'center', gap:8, padding:'8px 12px',
              background:'rgba(193,85,77,0.07)', border:'1px solid rgba(193,85,77,0.22)',
              borderRadius:'var(--radius-sm)', marginBottom:12,
              fontSize:12, color:'var(--danger)',
            }}>
              <Icon name="x" size={13} stroke={2.5} style={{flexShrink:0}}/>
              <span>Dedo incorrecto — se esperaba <strong>{FL[activeFinger]}</strong></span>
            </div>
          ) : (() => {
            const val = Math.round(captured[activeFinger] || quality);
            const segs = 18;
            const filled = Math.round((val / 100) * segs);
            const color  = val > 80 ? '#2f7a5a' : val > 50 ? '#b8922a' : '#a03030';
            const glow   = val > 80 ? 'rgba(47,122,90,0.55)' : val > 50 ? 'rgba(184,146,42,0.55)' : 'rgba(160,48,48,0.55)';
            const textColor = val > 80 ? 'var(--success)' : val > 50 ? 'var(--gold-500)' : 'var(--danger)';
            return (
              <div style={{marginBottom:14}}>
                <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:5}}>
                  <span style={{fontSize:8, fontFamily:'var(--font-mono)', letterSpacing:'0.18em',
                    textTransform:'uppercase', color:'var(--ink-300)'}}>CALIDAD</span>
                  <div style={{flex:1, height:'1px', background:'var(--ink-100)'}}/>
                  <span style={{fontSize:11, fontFamily:'var(--font-mono)', fontWeight:700,
                    color: textColor, letterSpacing:'0.06em',
                    textShadow: val > 0 ? `0 0 8px ${glow}` : 'none'}}>
                    {val}%
                  </span>
                </div>
                <div style={{
                  display:'flex', gap:3, alignItems:'center',
                  padding:'5px 8px',
                  background:'rgba(0,0,0,0.04)',
                  clipPath:'polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)',
                  position:'relative', overflow:'hidden',
                }}>
                  {Array.from({length: segs}).map((_, i) => (
                    <div key={i} style={{
                      flex:1, height:10,
                      background: i < filled ? color : 'rgba(0,0,0,0.07)',
                      boxShadow: i < filled ? `0 0 6px ${glow}` : 'none',
                      clipPath:'polygon(2px 0%,100% 0%,calc(100% - 2px) 100%,0% 100%)',
                      transition:'background 0.2s, box-shadow 0.2s',
                    }} className={i === filled - 1 && val > 0 ? 'cp-seg--active' : ''}/>
                  ))}
                  {val > 0 && (
                    <div style={{
                      position:'absolute', top:0, bottom:0, width:18,
                      background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)',
                      animation:'cpScan 2.4s linear infinite', pointerEvents:'none',
                    }}/>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Botón de captura protagónico */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginTop:24, marginBottom:16}}>
            {captureState === 'idle' && !captured[activeFinger] && (
              <button className="btn btn--primary" onClick={startCapture}
                style={{padding:'13px 44px', fontSize:14, gap:9}}>
                <Icon name="fingerprint" size={17}/> {t.reg_capture_start}
              </button>
            )}
            {captureState === 'idle' && captured[activeFinger] && (
              <button className="btn btn--ghost" onClick={startCapture}
                style={{padding:'11px 32px', fontSize:13}}>
                <Icon name="refresh" size={14}/> {t.reg_capture_recap}
              </button>
            )}
            {captureState === 'scanning' && (
              <button className="btn btn--ghost" disabled style={{opacity:.45, pointerEvents:'none', padding:'11px 32px', fontSize:13}}>
                <Icon name="fingerprint" size={14}/> Escaneando…
              </button>
            )}
            {/* CS — Caso especial */}
            <button className="btn btn--primary" onClick={() => setCasoEspecial(v => !v)}
              style={{padding:'13px 16px', fontSize:13, position:'relative',
                background: casoEspecial ? 'var(--ink-700)' : undefined}}>
              CE
              {casoEspecial && <span className="live-dot"/>}
            </button>
          </div>


          {readerError && (
            <div style={{
              display:'flex', alignItems:'flex-start', gap:8, padding:'10px 14px',
              marginBottom:10, background:'rgba(193,85,77,0.07)',
              border:'1px solid rgba(193,85,77,0.25)', borderRadius:'var(--radius-sm)',
              fontSize:11, color:'var(--danger)', fontFamily:'var(--font-mono)',
            }}>
              <Icon name="x" size={13} stroke={2.5} style={{flexShrink:0, marginTop:1}}/>
              <div>
                <div style={{fontWeight:700, marginBottom:2}}>Touch ID no disponible — usando simulación</div>
                <div style={{opacity:.7}}>{readerError}</div>
              </div>
            </div>
          )}

          {showIncomplete && (
            <div style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'11px 14px', marginTop:16,
              background:'rgba(193,85,77,0.07)',
              border:'1px solid rgba(193,85,77,0.28)',
              borderRadius:'var(--radius-sm)',
              fontSize:13, color:'var(--danger)', lineHeight:1.5,
            }}>
              <Icon name="x" size={16} stroke={2.5} style={{flexShrink:0}}/>
              <span>{casoEspecial
                ? <>Debes capturar al menos <strong>1 huella</strong> para continuar.</>
                : <>Debes capturar las <strong>10 huellas</strong> antes de continuar. Faltan <strong>{10 - capturedCount}</strong> dedo{10 - capturedCount !== 1 ? 's' : ''}.</>
              }</span>
            </div>
          )}

          <div style={{display:'flex',justifyContent:'space-between',marginTop:32}}>
            <button className="btn btn--ghost" onClick={back}>
              <Icon name="arrowLeft" size={14}/> {t.reg_back}
            </button>
            <button className="btn btn--primary" onClick={tryNext}>
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
            <SummaryRow label={t.dash_fld_dob || 'Fecha de nacimiento'} val={form.dob} mono/>
            <SummaryRow label={t.reg_fld_schedule} val={form.schedule} mono/>
            <SummaryRow label="Jornada laboral" val={workDaysLabel(form.workDays)}/>
          </div>

          <div style={{marginTop:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <span style={{fontSize:10,fontWeight:700,textTransform:'uppercase',
                letterSpacing:'0.1em',color:'var(--ink-400)',fontFamily:'var(--font-ui)'}}>
                Huellas capturadas
              </span>
              <span style={{fontSize:11,fontFamily:'var(--font-mono)',fontWeight:700,color:'var(--ink-700)'}}>
                {capturedCount}/10
              </span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
              {[
                ['T-I','T-D'],['I-I','I-D'],['M-I','M-D'],['A-I','A-D'],['P-I','P-D'],
              ].map(([li, ri]) => (
                [li, ri].map(f => {
                  const q = captured[f];
                  const done = !!q;
                  return (
                    <div key={f} style={{
                      padding:'9px 11px',
                      borderRadius:'var(--radius-sm)',
                      background: done ? 'var(--paper)' : 'var(--cream-50)',
                      border: done ? '1px solid rgba(42,106,74,0.18)' : '1px solid var(--ink-100)',
                      display:'flex', flexDirection:'column', gap:5,
                      transition:'all 0.25s',
                    }}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                        <span style={{fontSize:10,fontFamily:'var(--font-ui)',fontWeight:600,
                          color: done ? 'var(--ink-700)' : 'var(--ink-300)',
                          whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:80}}>
                          {FL[f]}
                        </span>
                        {done && (() => {
                          const glow = q>80?'rgba(47,122,90,0.6)':q>50?'rgba(184,146,42,0.6)':'rgba(160,48,48,0.6)';
                          return (
                            <span style={{fontSize:9,fontFamily:'var(--font-mono)',fontWeight:700,flexShrink:0,
                              color: q>80?'var(--success)':q>50?'var(--gold-500)':'var(--danger)',
                              textShadow:`0 0 6px ${glow}`}}>
                              {q}%
                            </span>
                          );
                        })()}
                        {!done && <span style={{fontSize:9,color:'var(--ink-200)',fontFamily:'var(--font-mono)'}}>—</span>}
                      </div>
                      {/* Cyberpunk bar */}
                      {(() => {
                        const segs = 10;
                        const filled = done ? Math.round((q/100)*segs) : 0;
                        const color  = q>80?'#2f7a5a':q>50?'#b8922a':'#a03030';
                        const glow   = q>80?'rgba(47,122,90,0.5)':q>50?'rgba(184,146,42,0.5)':'rgba(160,48,48,0.5)';
                        return (
                          <div style={{display:'flex',gap:2,padding:'3px 5px',
                            background:'rgba(0,0,0,0.04)',position:'relative',overflow:'hidden',
                            clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)'}}>
                            {Array.from({length:segs}).map((_,i)=>(
                              <div key={i} style={{
                                flex:1,height:6,
                                background: i<filled ? color : 'rgba(0,0,0,0.07)',
                                boxShadow: i<filled ? `0 0 4px ${glow}` : 'none',
                                clipPath:'polygon(1px 0%,100% 0%,calc(100% - 1px) 100%,0% 100%)',
                                transition:'background 0.2s',
                              }} className={i===filled-1&&done?'cp-seg--active':''}/>
                            ))}
                            {done && <div style={{
                              position:'absolute',top:0,bottom:0,width:12,
                              background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)',
                              animation:'cpScan 2.2s linear infinite',pointerEvents:'none',
                            }}/>}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3({ t, FL, form, captured, casoEspecial, back, save }) {
  const getStatusLabel = () => {
    if (form.status === 'ok') return t.dash_status_ok || 'Registrado';
    if (form.status === 'pending') return t.dash_status_pending || 'Pendiente';
    if (form.status === 'custom') {
      try {
        const list = JSON.parse(localStorage.getItem('uasd_custom_statuses') || '[]');
        const cs = list.find(c => c.id === form.inactiveReason);
        if (cs) return cs.label;
      } catch {}
      return 'Estado personalizado';
    }
    if (form.status === 'inactive' && form.inactiveReason === 'retired')   return t.dash_status_retired   || 'Pensionado';
    if (form.status === 'inactive' && form.inactiveReason === 'suspended') return t.dash_status_suspended || 'Suspendido';
    return t.dash_status_inactive_other || 'Licencia laboral';
  };

  return (
    <div className="reg-grid" style={{gridTemplateColumns: '1fr'}}>
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
            <SummaryRow label="Cédula o Pasaporte" val={formatCedula(form.cedula)} mono/>
            <SummaryRow label={t.reg_fld_code} val={form.code} mono/>
            <SummaryRow label={t.reg_fld_email} val={form.email}/>
            <SummaryRow label={t.reg_fld_phone} val={form.phone} mono/>
            <SummaryRow label={t.dash_fld_dob || 'Fecha de nacimiento'} val={form.dob} mono/>
            <SummaryRow label={t.reg_fld_schedule} val={form.schedule} mono/>
            <SummaryRow label="Jornada laboral" val={workDaysLabel(form.workDays)}/>
            <SummaryRow label="Estado" val={getStatusLabel()}/>
            <SummaryRow label={t.reg_prints_registered}
                        val={(() => {
                          const n = Math.min(Object.keys(captured).length, 10);
                          const suffix = casoEspecial ? '(CE)' : n >= 10 ? 'Registro completo' : '';
                          return suffix ? `${n} / 10 · ${suffix}` : `${n} / 10`;
                        })()}
                        mono/>
            {form.inactiveComment?.trim() && (
              <SummaryRow label={t.dash_col_comment || 'Comentario'} val={form.inactiveComment}/>
            )}
          </div>

          <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
            <button className="btn btn--ghost" onClick={back}>
              <Icon name="arrowLeft" size={14}/> {t.reg_back}
            </button>
            <button className="btn btn--lg" onClick={save} style={{
              background:'var(--success)', color:'#fff',
              border:'1px solid rgba(42,106,74,0.4)',
              boxShadow:'0 0 10px rgba(42,106,74,0.25)',
            }}>
              <Icon name="check" size={14}/> {t.reg_save}
            </button>
          </div>
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
