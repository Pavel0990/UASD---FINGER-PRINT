/* liceo.jsx — Liceo Experimental: control diario de asistencia */

const LICEO_EMP_KEY   = 'uasd_liceo_employees';
const LICEO_DAILY_KEY = 'uasd_liceo_daily';

function getLiceoEmployees() {
  try { return JSON.parse(localStorage.getItem(LICEO_EMP_KEY) || '[]'); } catch { return []; }
}
function saveLiceoEmployees(list) { localStorage.setItem(LICEO_EMP_KEY, JSON.stringify(list)); }
function getLiceoDaily() {
  try { return JSON.parse(localStorage.getItem(LICEO_DAILY_KEY) || '{}'); } catch { return {}; }
}
function saveLiceoDaily(data) { localStorage.setItem(LICEO_DAILY_KEY, JSON.stringify(data)); }

/* ── Liceo slots (posiciones en el patio) ── */
const LICEO_SLOTS = [
  { left:'6%',  act:'leer'     },
  { left:'20%', act:'caminar'  },
  { left:'33%', act:'escribir' },
  { left:'46%', act:'hablar'   },
  { left:'60%', act:'leer'     },
  { left:'13%', act:'escribir' },
  { left:'27%', act:'hablar'   },
  { left:'40%', act:'leer'     },
  { left:'53%', act:'caminar'  },
  { left:'67%', act:'escribir' },
];

const LICEO_SHIRT_COLS = ['#2050a8','#1a3c80','#2858b0','#1e4490','#24509a'];
const MAX_LICEO_SCENE  = LICEO_SLOTS.length;

/* ── Figured students (viewBox "0 0 44 56") ── */

/* Leer — estudiante con libro abierto */
function FigLeer({ s, c }) {
  var bookAnim = {
    animation: 'w-inspect 3s ease-in-out infinite',
    transformBox: 'fill-box', transformOrigin: '20% 50%'
  };
  return (
    <g>
      {/* Cabeza */}
      <circle cx="20" cy="10" r="6.5" fill={s}/>
      {/* Cabello */}
      <ellipse cx="20" cy="5" rx="6" ry="3" fill="#1a0a08"/>
      {/* Torso */}
      <path d="M20,16 L20,32" stroke={c} strokeWidth="6" strokeLinecap="round"/>
      {/* Libro — sostenido frente al cuerpo */}
      <g style={bookAnim}>
        {/* Brazo izquierdo */}
        <line x1="17" y1="20" x2="8" y2="26" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        {/* Brazo derecho */}
        <line x1="23" y1="20" x2="33" y2="26" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        {/* Libro abierto */}
        <rect x="5" y="22" width="11" height="14" rx="1.5" fill="#fff8e8" stroke="#ccc" strokeWidth="1"/>
        <rect x="16" y="22" width="11" height="14" rx="1.5" fill="#fff8e8" stroke="#ccc" strokeWidth="1"/>
        {/* Lomo del libro */}
        <line x1="16" y1="22" x2="16" y2="36" stroke="#b8a060" strokeWidth="1.8"/>
        {/* Renglones */}
        <line x1="7"  y1="27" x2="14" y2="27" stroke="#ccc" strokeWidth="1"/>
        <line x1="7"  y1="30" x2="14" y2="30" stroke="#ccc" strokeWidth="1"/>
        <line x1="7"  y1="33" x2="14" y2="33" stroke="#ccc" strokeWidth="1"/>
        <line x1="18" y1="27" x2="25" y2="27" stroke="#ccc" strokeWidth="1"/>
        <line x1="18" y1="30" x2="25" y2="30" stroke="#ccc" strokeWidth="1"/>
        <line x1="18" y1="33" x2="25" y2="33" stroke="#ccc" strokeWidth="1"/>
      </g>
      {/* Piernas */}
      <line x1="20" y1="32" x2="14" y2="46" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="20" y1="32" x2="26" y2="46" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      {/* Zapatos */}
      <line x1="14" y1="46" x2="9"  y2="51" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
      <line x1="26" y1="46" x2="31" y2="51" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
    </g>
  );
}

/* Escribir — estudiante con cuaderno */
function FigEscribir({ s, c }) {
  var armAnim = {
    animation: 'w-plant 2.4s ease-in-out infinite',
    transformBox: 'fill-box', transformOrigin: '50% 20%'
  };
  return (
    <g>
      {/* Cabeza inclinada */}
      <circle cx="18" cy="12" r="6.5" fill={s}/>
      {/* Cabello */}
      <ellipse cx="18" cy="7" rx="5.5" ry="3" fill="#1a0a08"/>
      {/* Mochila en la espalda */}
      <rect x="23" y="19" width="7" height="10" rx="2" fill="#e8a030"/>
      <line x1="24" y1="19" x2="24" y2="29" stroke="#c87820" strokeWidth="1"/>
      {/* Torso inclinado */}
      <path d="M18,18 Q16,26 15,32" stroke={c} strokeWidth="6" fill="none" strokeLinecap="round"/>
      {/* Brazo izquierdo sostiene cuaderno */}
      <line x1="16" y1="22" x2="7" y2="28" stroke={s} strokeWidth="4" strokeLinecap="round"/>
      {/* Cuaderno */}
      <rect x="2" y="24" width="9" height="12" rx="1.5" fill="#d0e8ff" stroke="#88aacc" strokeWidth="1"/>
      <line x1="4" y1="28" x2="9" y2="28" stroke="#88aacc" strokeWidth="1"/>
      <line x1="4" y1="31" x2="9" y2="31" stroke="#88aacc" strokeWidth="1"/>
      {/* Brazo derecho + lápiz ANIMADO */}
      <g style={armAnim}>
        <line x1="18" y1="20" x2="27" y2="24" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        {/* Lápiz */}
        <line x1="26" y1="23" x2="24" y2="33" stroke="#f0c040" strokeWidth="3" strokeLinecap="round"/>
        <line x1="24" y1="33" x2="23" y2="36" stroke="#ffe0a0" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
      {/* Piernas */}
      <line x1="15" y1="32" x2="10" y2="46" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="15" y1="32" x2="21" y2="46" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="10" y1="46" x2="6"  y2="51" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
      <line x1="21" y1="46" x2="26" y2="51" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
    </g>
  );
}

/* Caminar — estudiante caminando */
function FigCaminar({ s, c }) {
  var bodyAnim = {
    animation: 'w-carry 1.9s ease-in-out infinite',
    transformBox: 'fill-box', transformOrigin: '50% 60%'
  };
  return (
    <g style={bodyAnim}>
      {/* Mochila */}
      <rect x="23" y="17" width="7" height="10" rx="2" fill="#e83030"/>
      <line x1="24" y1="17" x2="24" y2="27" stroke="#b82020" strokeWidth="1"/>
      {/* Cabeza */}
      <circle cx="20" cy="11" r="6.5" fill={s}/>
      {/* Cabello */}
      <ellipse cx="20" cy="6" rx="6" ry="3" fill="#1a0a08"/>
      {/* Torso */}
      <path d="M20,17 L20,32" stroke={c} strokeWidth="6" strokeLinecap="round"/>
      {/* Brazos alternados */}
      <line x1="18" y1="22" x2="10" y2="30" stroke={s} strokeWidth="4" strokeLinecap="round"/>
      <line x1="22" y1="22" x2="30" y2="28" stroke={s} strokeWidth="4" strokeLinecap="round"/>
      {/* Piernas caminando */}
      <line x1="20" y1="32" x2="13" y2="46" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="20" y1="32" x2="27" y2="44" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="13" y1="46" x2="8"  y2="51" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
      <line x1="27" y1="44" x2="32" y2="50" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
    </g>
  );
}

/* Hablar — estudiante conversando */
function FigHablar({ s, c, female }) {
  var nod = {
    animation: 'w-inspect 2.8s ease-in-out infinite',
    transformBox: 'fill-box', transformOrigin: '50% 10%'
  };
  return (
    <g>
      {female ? (
        <g>
          <ellipse cx="20" cy="7" rx="8" ry="5" fill="#1a0a08"/>
          <circle cx="20" cy="11" r="6.5" fill={s}/>
          <circle cx="13" cy="9"  r="3.5" fill="#1a0a08"/>
          <circle cx="27" cy="9"  r="3.5" fill="#1a0a08"/>
          <path d="M13,13 Q11,17 13,20" stroke="#1a0a08" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M27,13 Q29,17 27,20" stroke="#1a0a08" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        </g>
      ) : (
        <g>
          <circle cx="20" cy="11" r="6.5" fill={s}/>
          <ellipse cx="20" cy="6" rx="6" ry="3" fill="#1a0a08"/>
        </g>
      )}
      {/* Torso */}
      <path d="M20,17 L20,33" stroke={c} strokeWidth="6" strokeLinecap="round"/>
      {/* Brazos con gesto de hablar ANIMADO */}
      <g style={nod}>
        <line x1="17" y1="21" x2="8"  y2="27" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        <line x1="23" y1="21" x2="32" y2="27" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        {/* Mano abierta */}
        <circle cx="7"  cy="28" r="2.5" fill={s}/>
        <circle cx="33" cy="28" r="2.5" fill={s}/>
      </g>
      {/* Piernas */}
      <line x1="20" y1="33" x2="14" y2="47" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="20" y1="33" x2="26" y2="47" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="14" y1="47" x2="9"  y2="52" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
      <line x1="26" y1="47" x2="31" y2="52" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
    </g>
  );
}

function LiceoStudent({ emp, onToggle, slotIndex, totalCount }) {
  var slot     = LICEO_SLOTS[slotIndex % LICEO_SLOTS.length];
  var isFemale = emp.gender === 'F';
  var act      = isFemale ? 'hablar' : slot.act;
  var sz       = totalCount > 9 ? 24 : totalCount > 6 ? 28 : totalCount > 4 ? 32 : 36;
  var skin     = '#d4956a';
  var shirt    = LICEO_SHIRT_COLS[slotIndex % LICEO_SHIRT_COLS.length];

  return (
    <div onClick={function() { onToggle(emp.id); }} title={emp.name}
      style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',
        cursor:'pointer',userSelect:'none'}}>
      <svg width={sz} height={Math.round(sz*1.27)} viewBox="0 0 44 56" style={{overflow:'visible'}}>
        {act === 'leer'     && <FigLeer     s={skin} c={shirt}/>}
        {act === 'escribir' && <FigEscribir s={skin} c={shirt}/>}
        {act === 'caminar'  && <FigCaminar  s={skin} c={shirt}/>}
        {act === 'hablar'   && <FigHablar   s={skin} c={shirt} female={isFemale}/>}
      </svg>
    </div>
  );
}

/* ── Edificio del Liceo ── */
function LiceoBuilding() {
  return (
    <svg style={{position:'absolute',bottom:'113px',right:'3%',width:'116px',height:'110px',overflow:'visible'}}
      viewBox="0 0 116 110">
      {/* Asta bandera */}
      <line x1="10" y1="10" x2="10" y2="110" stroke="#888" strokeWidth="2.5"/>
      {/* Bandera RD */}
      <g>
        <rect x="10" y="10" width="26" height="16" fill="#002D62"/>
        <rect x="23" y="10" width="13" height="16" fill="#CF142B"/>
        <rect x="10" y="18" width="26" height="8"  fill="#002D62"/>
        <rect x="23" y="18" width="13" height="8"  fill="#CF142B"/>
        {/* Cruz blanca */}
        <rect x="10" y="16" width="26" height="2.5" fill="#fff"/>
        <rect x="21" y="10" width="2.5" height="16" fill="#fff"/>
      </g>
      {/* ── Edificio principal ── */}
      {/* Cornisa / techo plano */}
      <rect x="32" y="0" width="84" height="8" rx="1" fill="#1a3060"/>
      {/* Pared principal */}
      <rect x="32" y="8" width="84" height="102" fill="#dce8f5"/>
      {/* Sombra lateral izquierda */}
      <rect x="32" y="8" width="10" height="102" fill="rgba(0,0,0,.08)"/>
      {/* Franja institucional horizontal */}
      <rect x="32" y="8" width="84" height="12" fill="#1e4080"/>
      {/* Texto LICEO EXPERIMENTAL */}
      <text x="74" y="17.5" textAnchor="middle"
        fontSize="5.5" fontFamily="var(--font-sans)" fontWeight="800"
        fill="#fff" letterSpacing="0.6">LICEO EXPERIMENTAL</text>
      {/* Fila superior de ventanas */}
      {[39,57,75,93].map(function(x) {
        return (
          <g key={x}>
            <rect x={x} y="26" width="12" height="16" rx="2" fill="#b8d8f0"/>
            <line x1={x+6} y1="26" x2={x+6} y2="42" stroke="rgba(0,0,0,.15)" strokeWidth="1"/>
            <line x1={x}   y1="34" x2={x+12} y2="34" stroke="rgba(0,0,0,.15)" strokeWidth="1"/>
            {/* Marco de ventana */}
            <rect x={x} y="26" width="12" height="16" rx="2" fill="none" stroke="#8ab0cc" strokeWidth="1"/>
          </g>
        );
      })}
      {/* Fila inferior de ventanas (saltamos la puerta central) */}
      {[39,57,93].map(function(x) {
        return (
          <g key={x}>
            <rect x={x} y="52" width="12" height="16" rx="2" fill="#b8d8f0"/>
            <line x1={x+6} y1="52" x2={x+6} y2="68" stroke="rgba(0,0,0,.15)" strokeWidth="1"/>
            <line x1={x}   y1="60" x2={x+12} y2="60" stroke="rgba(0,0,0,.15)" strokeWidth="1"/>
            <rect x={x} y="52" width="12" height="16" rx="2" fill="none" stroke="#8ab0cc" strokeWidth="1"/>
          </g>
        );
      })}
      {/* Puerta principal */}
      <rect x="69" y="74" width="18" height="36" rx="2" fill="#1a3060"/>
      {/* Arco de la puerta */}
      <path d="M69,76 Q78,66 87,76" fill="#162850"/>
      {/* Pomo */}
      <circle cx="85" cy="92" r="1.5" fill="#d4a020"/>
      {/* Escalones */}
      <rect x="65" y="108" width="26" height="3" rx="1" fill="#bac8d8"/>
      <rect x="62" y="110" width="32" height="2" rx="1" fill="#aab8c8"/>
    </svg>
  );
}

/* ── Bus escolar ── */
function SchoolBus() {
  return (
    <svg style={{position:'absolute',bottom:'113px',left:'3%',
      width:'96px',height:'58px',overflow:'visible',
      filter:'drop-shadow(0 4px 8px rgba(0,0,0,.3))'}}
      viewBox="0 0 96 58">
      {/* Cuerpo principal */}
      <rect x="4" y="8" width="84" height="38" rx="4" fill="#f5c518"/>
      {/* Frente redondeado */}
      <rect x="4" y="8" width="12" height="38" rx="4" fill="#e8b210"/>
      {/* Techo */}
      <rect x="4" y="4" width="84" height="8" rx="3" fill="#e0aa08"/>
      {/* Techo barra de seguridad */}
      <rect x="8" y="2" width="76" height="4" rx="2" fill="#c89808"/>
      {/* Franjas negras */}
      <rect x="4" y="26" width="84" height="3" fill="#1a1a1a" opacity=".18"/>
      {/* Ventanas */}
      {[20,36,52,68].map(function(x) {
        return (
          <rect key={x} x={x} y="12" width="14" height="12" rx="2" fill="#78c8ea" opacity=".9"/>
        );
      })}
      {/* Ventana del conductor */}
      <rect x="8" y="12" width="8" height="10" rx="2" fill="#78c8ea" opacity=".85"/>
      {/* Texto UASD */}
      <text x="52" y="37" textAnchor="middle"
        fontSize="6" fontFamily="var(--font-sans)" fontWeight="900"
        fill="#1a3060" letterSpacing="1">UASD</text>
      {/* Puerta */}
      <rect x="82" y="18" width="5" height="20" rx="1" fill="#c89808"/>
      <line x1="82" y1="28" x2="87" y2="28" stroke="#a07808" strokeWidth="1"/>
      {/* Faros delanteros */}
      <rect x="4" y="14" width="5" height="6" rx="1.5" fill="#ffe870"/>
      <rect x="4" y="30" width="5" height="4" rx="1" fill="#ff4444" opacity=".8"/>
      {/* Ruedas */}
      <circle cx="22" cy="48" r="10" fill="#181818"/>
      <circle cx="22" cy="48" r="7"  fill="#282828"/>
      <circle cx="22" cy="48" r="3"  fill="#555"/>
      <circle cx="72" cy="48" r="10" fill="#181818"/>
      <circle cx="72" cy="48" r="7"  fill="#282828"/>
      <circle cx="72" cy="48" r="3"  fill="#555"/>
      {/* Llantas detalles */}
      <line x1="22" y1="38" x2="22" y2="58" stroke="#3a3a3a" strokeWidth="1.5"/>
      <line x1="12" y1="48" x2="32" y2="48" stroke="#3a3a3a" strokeWidth="1.5"/>
      <line x1="72" y1="38" x2="72" y2="58" stroke="#3a3a3a" strokeWidth="1.5"/>
      <line x1="62" y1="48" x2="82" y2="48" stroke="#3a3a3a" strokeWidth="1.5"/>
    </svg>
  );
}

/* ── Árbol (reemplaza la palma) ── */
function SchoolTree({ style }) {
  return (
    <svg style={style} viewBox="0 0 50 90">
      {/* Tronco */}
      <rect x="21" y="60" width="8" height="30" rx="3" fill="#7a5530"/>
      {/* Copa exterior */}
      <ellipse cx="25" cy="40" rx="22" ry="28" fill="#2a7028"/>
      {/* Copa media */}
      <ellipse cx="25" cy="36" rx="18" ry="24" fill="#338530"/>
      {/* Copa interior */}
      <ellipse cx="25" cy="32" rx="13" ry="18" fill="#3d9838"/>
      {/* Brillo */}
      <ellipse cx="20" cy="24" rx="7" ry="8" fill="rgba(255,255,255,.08)"/>
    </svg>
  );
}

/* ── Animated liceo scene ── */
function LiceoScene({ workers, dayRecords, onToggle, presentCount, absentCount, totalCount, isES, viewDate }) {
  const [clock, setClock] = React.useState(function() { return new Date(); });
  React.useEffect(function() {
    var intervalId;
    var now   = new Date();
    var delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    var timeoutId = setTimeout(function() {
      setClock(new Date());
      intervalId = setInterval(function() { setClock(new Date()); }, 60000);
    }, delay);
    return function() { clearTimeout(timeoutId); clearInterval(intervalId); };
  }, []);

  const hours     = clock.getHours() + clock.getMinutes() / 60;
  const skyGrad   = getSkyGradient(hours);
  const sun       = getSunConfig(hours);
  const moon      = getMoonConfig(hours);
  const starAlpha = getStarsAlpha(hours);
  const isDay     = hours >= 6.5 && hours < 19;
  const isNight   = hours >= 19  || hours < 6;

  return (
    <div style={{position:'relative',width:'100%',
      height:'340px',
      borderRadius:'var(--radius-lg)',
      overflow:'hidden',
      boxShadow:'var(--shadow-md)',
      border:'1px solid var(--ink-100)'}}>

      {/* Sky */}
      <div style={{position:'absolute',inset:0,background:skyGrad,transition:'background 90s linear'}}/>

      {/* Stars */}
      {starAlpha > 0 && STARS.map(function(s,i) {
        return (
          <div key={i} style={{position:'absolute',left:`${s.x}%`,top:`${s.y}%`,
            width:i%3===0?'2.5px':'1.5px',height:i%3===0?'2.5px':'1.5px',
            borderRadius:'50%',background:'#fff',
            opacity:starAlpha*(0.5+(i%4)*0.14),transition:'opacity 90s linear',
            animation:`sunGlow ${2+i*0.35}s ease-in-out infinite`}}/>
        );
      })}

      {/* Moon */}
      {moon.visible && (
        <div style={{position:'absolute',left:`${moon.x}%`,top:`${moon.y}%`,
          transform:'translate(-50%,-50%)',opacity:moon.alpha,transition:'opacity 90s linear'}}>
          <div style={{position:'relative',width:'30px',height:'30px'}}>
            <div style={{width:'30px',height:'30px',borderRadius:'50%',background:'#f2eacc',
              boxShadow:'0 0 14px rgba(242,234,204,.5),0 0 28px rgba(242,234,204,.22)'}}/>
            <div style={{position:'absolute',top:'-2px',left:'9px',width:'30px',height:'30px',
              borderRadius:'50%',background:'#020912'}}/>
          </div>
        </div>
      )}

      {/* Sun */}
      {sun.visible && (
        <div style={{position:'absolute',left:`${sun.x}%`,top:`${sun.y}%`,
          transform:'translate(-50%,-50%)',transition:'left 90s linear,top 90s linear',
          pointerEvents:'none'}}>
          <div style={{position:'absolute',top:'50%',left:'50%',
            transform:'translate(-50%,-50%)',
            width:'90px',height:'90px',borderRadius:'50%',
            background:`radial-gradient(circle,${sun.glow} 0%,transparent 70%)`,
            opacity:.55}}/>
          <div style={{position:'absolute',top:'50%',left:'50%',
            transform:'translate(-50%,-50%)',
            width:'58px',height:'58px',borderRadius:'50%',
            background:`radial-gradient(circle,${sun.glow.replace(/[\d.]+\)$/,'0.7)')} 0%,transparent 70%)`,
            opacity:.7}}/>
          <div style={{position:'relative',width:'46px',height:'46px',borderRadius:'50%',
            background:`radial-gradient(circle,#ffffff 0%,${sun.color} 40%,${lerpColor(sun.color,'#c05010',0.45)} 100%)`,
            boxShadow:`0 0 22px 8px ${sun.glow},0 0 48px 18px ${sun.glow.replace(/[\d.]+\)$/,'0.28)')}`,
            animation:'sunGlow 4s ease-in-out infinite'}}/>
        </div>
      )}

      {/* Pájaro */}
      <div style={{position:'absolute',top:'28px',left:0,width:'100%',
        animation:'birdFly 22s linear infinite',animationDelay:'-9s',pointerEvents:'none'}}>
        <svg width="18" height="8" viewBox="0 0 18 8" fill="none">
          <path d="M0 4 Q4.5 0 9 4 Q13.5 0 18 4" stroke="rgba(255,255,255,.35)" strokeWidth="1.3" fill="none"/>
        </svg>
      </div>

      {/* Nube 1 */}
      <div style={{position:'absolute',top:'22px',left:'18%',
        animation:'cloudDrift 12s ease-in-out infinite',
        opacity:isDay?.85:.15,transition:'opacity 90s'}}>
        <div style={{position:'relative',width:'80px',height:'34px'}}>
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:'22px',background:'rgba(255,255,255,.92)',borderRadius:'24px'}}/>
          <div style={{position:'absolute',bottom:'13px',left:'14px',width:'34px',height:'30px',background:'rgba(255,255,255,.92)',borderRadius:'50%'}}/>
          <div style={{position:'absolute',bottom:'11px',left:'34px',width:'26px',height:'24px',background:'rgba(255,255,255,.92)',borderRadius:'50%'}}/>
        </div>
      </div>

      {/* Nube 2 */}
      <div style={{position:'absolute',top:'40px',left:'48%',
        animation:'cloudDriftSlow 16s ease-in-out infinite',animationDelay:'-7s',
        opacity:isDay?.65:.1,transition:'opacity 90s'}}>
        <div style={{position:'relative',width:'58px',height:'24px'}}>
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:'16px',background:'rgba(255,255,255,.9)',borderRadius:'20px'}}/>
          <div style={{position:'absolute',bottom:'9px',left:'12px',width:'26px',height:'22px',background:'rgba(255,255,255,.9)',borderRadius:'50%'}}/>
        </div>
      </div>

      {/* Colinas de fondo */}
      <svg style={{position:'absolute',bottom:'115px',left:0,width:'100%',height:'90px'}}
        viewBox="0 0 800 90" preserveAspectRatio="none">
        <path d="M0,90 Q180,8 360,48 Q540,88 720,20 Q760,6 800,32 L800,90Z" fill="rgba(42,80,28,.55)"/>
        <path d="M0,90 Q160,34 340,62 Q500,88 660,40 Q730,24 800,55 L800,90Z" fill="rgba(32,65,20,.78)"/>
      </svg>

      {/* Árboles */}
      <SchoolTree style={{position:'absolute',bottom:'113px',left:'4%',width:'54px',height:'96px',overflow:'visible'}}/>
      <SchoolTree style={{position:'absolute',bottom:'113px',left:'19%',width:'42px',height:'76px',overflow:'visible',opacity:.85}}/>
      <SchoolTree style={{position:'absolute',bottom:'113px',right:'22%',width:'40px',height:'72px',overflow:'visible',opacity:.9}}/>

      {/* Bus escolar */}
      <SchoolBus/>

      {/* Edificio del liceo */}
      <LiceoBuilding/>

      {/* Patio — verja/cerca del liceo */}
      <svg style={{position:'absolute',bottom:'65px',left:0,width:'100%',height:'42px',
        overflow:'visible',pointerEvents:'none',zIndex:4}}
        viewBox="0 0 800 42" preserveAspectRatio="none">
        {/* Rieles */}
        <line x1="0"   y1="10" x2="800" y2="10" stroke="#5a7090" strokeWidth="2.2" opacity=".7"/>
        <line x1="0"   y1="20" x2="800" y2="20" stroke="#5a7090" strokeWidth="1.6" opacity=".55"/>
        {/* Postes de verja */}
        {Array.from({length:22}).map(function(_,i) {
          var x = i*38+4;
          return <rect key={i} x={x} y="3" width="5" height="34" rx="2" fill="#4a6080" opacity=".8"/>;
        })}
        {/* Portón central — abierto de día, cerrado de noche */}
        {(isNight || totalCount === 0) ? (
          <g>
            <rect x="358" y="-4" width="84" height="50" fill="#3a5070" opacity=".9"/>
            <line x1="358" y1="8"  x2="442" y2="8"  stroke="#2a4060" strokeWidth="2"/>
            <line x1="358" y1="18" x2="442" y2="18" stroke="#2a4060" strokeWidth="2"/>
            <line x1="358" y1="28" x2="442" y2="28" stroke="#2a4060" strokeWidth="2"/>
            <line x1="358" y1="38" x2="442" y2="38" stroke="#2a4060" strokeWidth="2"/>
            <circle cx="400" cy="22" r="4" fill="#d4a020"/>
          </g>
        ) : (
          <g>
            <line x1="310" y1="10" x2="358" y2="10" stroke="#5a7090" strokeWidth="2.2" opacity=".7"/>
            <line x1="310" y1="20" x2="358" y2="20" stroke="#5a7090" strokeWidth="1.6" opacity=".55"/>
            {Array.from({length:2}).map(function(_,i) {
              return <rect key={i} x={310+i*24} y="3" width="5" height="34" rx="2" fill="#4a6080" opacity=".8"/>;
            })}
          </g>
        )}
      </svg>

      {/* Suelo — patio de asfalto/cemento */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'116px',
        background:'linear-gradient(180deg,#8a9aaa 0%,#6a7a8a 40%,#5a6878 75%,#4a5868 100%)'}}/>

      {/* Líneas del patio (canchas) */}
      <svg style={{position:'absolute',bottom:0,left:0,width:'100%',height:'66px',
        overflow:'visible',pointerEvents:'none',opacity:.15}}
        viewBox="0 0 800 66" preserveAspectRatio="none">
        <rect x="200" y="5" width="200" height="55" fill="none" stroke="#fff" strokeWidth="2"/>
        <line x1="300" y1="5" x2="300" y2="60" stroke="#fff" strokeWidth="2"/>
        <circle cx="300" cy="32" r="20" fill="none" stroke="#fff" strokeWidth="2"/>
      </svg>

      {/* Estudiantes — cada uno en su zona */}
      {totalCount === 0 ? (
        <div style={{position:'absolute',bottom:'42px',left:0,right:0,textAlign:'center',
          fontFamily:'var(--font-sans)',fontSize:'12px',fontWeight:600,
          color:'rgba(255,255,255,.45)',textShadow:'0 1px 3px rgba(0,0,0,.7)'}}>
          {isES ? 'Sin estudiantes asignados' : 'No students assigned'}
        </div>
      ) : (
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,pointerEvents:'none',zIndex:3}}>
          {workers.map(function(emp, i) {
            if (!dayRecords[emp.id]) return null;
            var slot = LICEO_SLOTS[i % LICEO_SLOTS.length];
            return (
              <div key={emp.id} style={{position:'absolute',left:slot.left,bottom:'115px',
                transform:'translateX(-50%)',display:'flex',flexDirection:'column',
                alignItems:'center',pointerEvents:'auto'}}>
                <div style={{
                  animation:'fighter-in .35s cubic-bezier(0.17,0.67,0.35,1) both',
                  animationDelay:(i*0.07)+'s'}}>
                  <LiceoStudent emp={emp} onToggle={onToggle} slotIndex={i} totalCount={totalCount}/>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Liceo date navigator ── */
function LiceoDateNav({ viewDate, setViewDate, navDate, fmtDate, isES, daily, rosterOpen }) {
  const [open,     setOpen]     = React.useState(false);
  const [calReady, setCalReady] = React.useState(false);
  const [calPos,   setCalPos]   = React.useState({ top: 0, centerX: 0 });
  const navRef  = React.useRef(null);
  const trigRef = React.useRef(null);
  const calRef  = React.useRef(null);
  const today   = new Date().toLocaleDateString('en-CA');

  const parseISO = function(iso) {
    var p = iso.split('-').map(Number);
    return { y: p[0], m: p[1]-1, d: p[2] };
  };

  const computePos = function() {
    if (!trigRef.current || !navRef.current) return;
    var tr = trigRef.current.getBoundingClientRect();
    var wr = navRef.current.getBoundingClientRect();
    var calW = calRef.current ? calRef.current.offsetWidth : 260;
    var raw  = tr.left + tr.width/2;
    var clamped = Math.max(calW/2+8, Math.min(window.innerWidth - calW/2 - 8, raw));
    setCalPos({ top: wr.bottom + 6, centerX: clamped });
  };

  React.useEffect(function() {
    if (open) {
      computePos();
      setCalReady(true);
    } else {
      setCalReady(false);
    }
  }, [open]);

  var trackTransition = React.useCallback(function(duration) {
    var start = Date.now();
    var tick  = function() {
      computePos();
      if (Date.now() - start < duration) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  React.useEffect(function() {
    if (!open) return;
    trackTransition(420);
  }, [rosterOpen]);

  React.useEffect(function() {
    if (!open) return;
    var onOut = function(e) {
      if (trigRef.current && trigRef.current.contains(e.target)) return;
      if (calRef.current  && calRef.current.contains(e.target))  return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onOut);
    return function() { document.removeEventListener('mousedown', onOut); };
  }, [open]);

  var sel = parseISO(viewDate);
  var now = parseISO(today);
  const [month, setMonth] = React.useState(sel.m);
  const [year,  setYear]  = React.useState(sel.y);

  React.useEffect(function() {
    var p = parseISO(viewDate);
    setMonth(p.m); setYear(p.y);
  }, [viewDate]);

  var MONTHS_ES  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  var DOW        = isES ? ['D','L','M','X','J','V','S'] : ['S','M','T','W','T','F','S'];
  var firstDow   = new Date(year, month, 1).getDay();
  var daysInMonth= new Date(year, month+1, 0).getDate();

  var prevMo    = function() { month === 0  ? (setMonth(11), setYear(function(y){ return y-1; })) : setMonth(function(m){ return m-1; }); };
  var nextMo    = function() { month === 11 ? (setMonth(0),  setYear(function(y){ return y+1; })) : setMonth(function(m){ return m+1; }); };
  var prevYear  = function() { setYear(function(y){ return y-1; }); };
  var nextYear  = function() { setYear(function(y){ return y+1; }); };

  var hasRecords = function(d) {
    var iso = year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    var rec = daily && daily[iso];
    return rec && Object.keys(rec).length > 0;
  };

  var pick = function(d) {
    var iso = year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    setViewDate(iso);
    setOpen(false);
  };

  var isToday = viewDate === today;

  return (
    <div ref={navRef}
      onMouseDown={function(e){ e.preventDefault(); }}
      style={{display:'flex',alignItems:'center',gap:'10px',
              justifyContent:'center',width:'100%'}}>

      <button className="dp-cal__arrow" tabIndex={-1} onClick={function(){ navDate(-1); }}>‹</button>

      <div ref={trigRef}>
        <button type="button" tabIndex={-1}
          onMouseDown={function(e){ e.preventDefault(); }}
          onClick={function(){ setOpen(function(o){ return !o; }); }}
          className="farm-date-pill"
          style={{display:'flex',alignItems:'center',gap:'7px',
            background: open ? 'var(--ink-100)' : 'transparent',
            border:'1.5px solid '+(open ? 'var(--accent)' : 'var(--ink-200,#ddd)'),
            borderRadius:'8px',padding:'6px 14px',cursor:'pointer',
            transition:'background .15s,border-color .2s,box-shadow .2s',
            fontFamily:'var(--font-sans)',fontWeight:700,fontSize:'14px',
            color:'var(--ink-800)',whiteSpace:'nowrap',lineHeight:1.2,
            height:'32px',boxSizing:'border-box'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" style={{opacity:.55,flexShrink:0}}>
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
          </svg>
          {fmtDate(viewDate)}
        </button>
      </div>

      <button className="dp-cal__arrow" tabIndex={-1}
        onClick={function(){ navDate(1); }}
        disabled={isToday}
        style={isToday ? {opacity:.28,cursor:'not-allowed'} : {}}>›</button>

      {ReactDOM.createPortal(
        <div onMouseDown={function(e){ if (open) e.preventDefault(); }}
          style={{position:'fixed',top:calPos.top,left:calPos.centerX,
                  transform:'translateX(-50%)',zIndex:9999,
                  pointerEvents:(open && calReady) ? 'auto' : 'none',
                  visibility:(open && calReady) ? 'visible' : 'hidden'}}>
          <div ref={calRef} className="dp-cal"
            style={{boxShadow:'0 16px 48px rgba(0,0,0,.18)',animation:'none'}}>
            <div className="dp-cal__nav">
              <button tabIndex={-1} type="button" className="dp-cal__arrow" onClick={prevYear}>«</button>
              <button tabIndex={-1} type="button" className="dp-cal__arrow" onClick={prevMo}>‹</button>
              <span className="dp-cal__month">{(MONTHS_ES||[])[month]} {year}</span>
              <button tabIndex={-1} type="button" className="dp-cal__arrow" onClick={nextMo}>›</button>
              <button tabIndex={-1} type="button" className="dp-cal__arrow" onClick={nextYear}>»</button>
            </div>
            <div className="dp-cal__grid">
              {DOW.map(function(d){ return <span key={d} className="dp-cal__dow">{d}</span>; })}
              {Array.from({length:firstDow}).map(function(_,i){ return <span key={'b'+i}/>; })}
              {Array.from({length:daysInMonth}, function(_,i){
                var d = i+1;
                var isoDay = year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
                var isFuture = isoDay > today;
                var isSel = sel.d===d && sel.m===month && sel.y===year;
                var isNow = now.d===d && now.m===month && now.y===year;
                var hasRec = hasRecords(d);
                return (
                  <button tabIndex={-1} type="button" key={d}
                    disabled={isFuture}
                    className={'dp-cal__day'+(isSel?' dp-cal__day--sel':'')+(isNow&&!isSel?' dp-cal__day--today':'')+(isFuture?' dp-cal__day--disabled':'')}
                    onClick={function(){ pick(d); }}
                    style={isFuture?{opacity:.28,cursor:'not-allowed'}:isSel?{}:hasRec?{
                      background:'#d4edda',color:'#1a5c1a',fontWeight:700,
                      borderRadius:'6px',border:'1.5px solid #7ec89a',position:'relative'
                    }:{}}>
                    {d}
                    {hasRec && !isSel && !isFuture && (
                      <span style={{position:'absolute',bottom:'1px',left:'50%',
                        transform:'translateX(-50%)',width:'5px',height:'5px',
                        borderRadius:'50%',background:'#2d8a2d',display:'block',
                        boxShadow:'0 0 0 1px #fff'}}/>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* Devuelve draft {empId: true} con empleados cuyo horario cubre el momento actual */
function getLiceoScheduledPresence(liceoEmpObjects) {
  var now      = new Date();
  var todayDay = now.getDay();
  var nowMin   = now.getHours() * 60 + now.getMinutes();
  var result   = {};
  liceoEmpObjects.forEach(function(emp) {
    if (!emp || !emp.schedule) return;
    var dayEntry = emp.schedule[todayDay];
    if (!dayEntry) return;
    var parseT = function(t) {
      if (!t) return null;
      var parts = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!parts) return null;
      var h = parseInt(parts[1]), m = parseInt(parts[2]);
      if (parts[3].toUpperCase() === 'PM' && h !== 12) h += 12;
      if (parts[3].toUpperCase() === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };
    var start = parseT(dayEntry.start);
    var end   = parseT(dayEntry.end);
    if (start === null || end === null) return;
    if (nowMin >= start && nowMin <= end) result[emp.id] = true;
  });
  return result;
}

/* ── LiceoView — main component ── */
function LiceoView({ t, lang, setRoute }) {
  const today = new Date().toLocaleDateString('en-CA');
  const isES  = lang === 'es';

  /* Bloquea el scroll de la página mientras LiceoView está montado */
  React.useEffect(function() {
    var html  = document.documentElement;
    var body  = document.body;
    var prevH = html.style.overflow;
    var prevB = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return function() {
      html.style.overflow = prevH;
      body.style.overflow = prevB;
    };
  }, []);

  const [liceoEmps,        setLiceoEmps]        = React.useState(getLiceoEmployees);
  const [daily,            setDaily]            = React.useState(getLiceoDaily);
  const [viewDate,         setViewDate]         = React.useState(today);
  const [searchQ,          setSearchQ]          = React.useState(false);
  const [searchVal,        setSearchVal]        = React.useState('');
  const [rosterOpen,       setRosterOpen]       = React.useState(true);
  const [flash,            setFlash]            = React.useState(null);
  const [draft,            setDraft]            = React.useState(function() {
    var saved = getLiceoDaily()[today];
    if (saved) return saved;
    var objs = getLiceoEmployees().map(function(id) { return EMPLOYEES.find(function(e) { return e.id === id; }); }).filter(Boolean);
    return getLiceoScheduledPresence(objs);
  });
  const [isDirty,          setIsDirty]          = React.useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = React.useState(false);

  const flashTimerRef = React.useRef(null);

  React.useEffect(function() {
    var saved = daily[viewDate];
    if (saved) {
      setDraft(saved);
    } else if (viewDate === today) {
      setDraft(getLiceoScheduledPresence(liceoEmployeeObjects));
    } else {
      setDraft({});
    }
    setIsDirty(false);
    setConfirmOverwrite(false);
  }, [viewDate, daily]);

  React.useEffect(function() {
    return function() { if (flashTimerRef.current) clearTimeout(flashTimerRef.current); };
  }, []);

  const canManage = typeof userHasPermission === 'function' && userHasPermission('liceo');

  const liceoEmployeeObjects = React.useMemo(function() {
    return liceoEmps.map(function(id) { return EMPLOYEES.find(function(e) { return e.id === id; }); }).filter(Boolean);
  }, [liceoEmps]);

  const presentCount = React.useMemo(function() {
    return liceoEmployeeObjects.filter(function(e) { return !!draft[e.id]; }).length;
  }, [liceoEmployeeObjects, draft]);

  const absentCount    = liceoEmployeeObjects.length - presentCount;
  const totalCount     = liceoEmployeeObjects.length;
  const sceneWorkers   = liceoEmployeeObjects.slice(0, MAX_LICEO_SCENE);
  const isToday        = viewDate === today;
  const isAlreadySaved = !!(daily[viewDate] && Object.keys(daily[viewDate]).length);

  const showFlash = function(msg) {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setFlash(msg);
    flashTimerRef.current = setTimeout(function() { setFlash(null); }, 2000);
  };

  const togglePresent = function(empId) {
    var next = Object.assign({}, draft);
    if (next[empId]) delete next[empId];
    else next[empId] = true;
    setDraft(next);
    setIsDirty(true);
  };

  const markAllPresent = function() {
    var next = {};
    liceoEmployeeObjects.forEach(function(e) { next[e.id] = true; });
    setDraft(next);
    setIsDirty(true);
  };

  const clearAll = function() {
    setDraft({});
    setIsDirty(true);
  };

  const saveAttendance = function() {
    var filteredDraft = {};
    liceoEmployeeObjects.forEach(function(e) { if (draft[e.id]) filteredDraft[e.id] = true; });
    var records = Object.assign({}, daily);
    if (!Object.keys(filteredDraft).length) delete records[viewDate];
    else records[viewDate] = filteredDraft;
    setDaily(records);
    saveLiceoDaily(records);

    /* Puente automático: sincronizar con asistencia/ausencias del dashboard */
    var att = {};
    var abs = {};
    try { att = JSON.parse(localStorage.getItem('uasd_daily_attendance') || '{}'); } catch(ex) {}
    try { abs = JSON.parse(localStorage.getItem('uasd_absences')          || '{}'); } catch(ex) {}

    var baseTs = Date.now();
    liceoEmployeeObjects.forEach(function(emp, idx) {
      var attKey   = emp.id + ':' + viewDate;
      var presente = !!filteredDraft[emp.id];
      if (presente) {
        if (abs[emp.id]) {
          abs[emp.id] = abs[emp.id].filter(function(a) {
            return !(a.date === viewDate && a.source === 'liceo');
          });
          if (!abs[emp.id].length) delete abs[emp.id];
        }
        if (!att[attKey] || att[attKey].source === 'liceo') {
          var hora = viewDate === today
            ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
            : '—';
          att[attKey] = { empId: emp.id, date: viewDate, time: hora, late: false, source: 'liceo' };
        }
      } else {
        if (att[attKey] && att[attKey].source === 'liceo') delete att[attKey];
        var absArr   = abs[emp.id] || [];
        var yaExiste = absArr.some(function(a) { return a.date === viewDate && a.source === 'liceo'; });
        if (!yaExiste) {
          abs[emp.id] = absArr.concat([{
            id: baseTs * 100 + idx,
            date: viewDate,
            justified: false,
            justifyNote: '',
            source: 'liceo'
          }]);
        }
      }
    });

    localStorage.setItem('uasd_daily_attendance', JSON.stringify(att));
    localStorage.setItem('uasd_absences',          JSON.stringify(abs));

    setIsDirty(false);
    setConfirmOverwrite(false);
    showFlash(isES ? 'Asistencia guardada' : 'Attendance saved');
  };

  const cancelAttendance = function() {
    setDraft(daily[viewDate] || {});
    setIsDirty(false);
    setConfirmOverwrite(false);
  };

  const addToLiceo = function(empId) {
    if (liceoEmps.includes(empId)) return;
    var list = liceoEmps.concat([empId]);
    setLiceoEmps(list);
    saveLiceoEmployees(list);
    setSearchVal('');
  };

  const removeFromLiceo = function(empId) {
    var list = liceoEmps.filter(function(id) { return id !== empId; });
    setLiceoEmps(list);
    saveLiceoEmployees(list);
    var records = Object.assign({}, daily);
    Object.keys(records).forEach(function(date) {
      if (records[date] && records[date][empId]) {
        records[date] = Object.assign({}, records[date]);
        delete records[date][empId];
        if (!Object.keys(records[date]).length) delete records[date];
      }
    });
    setDaily(records);
    saveLiceoDaily(records);
    setDraft(function(prev) {
      var next = Object.assign({}, prev);
      delete next[empId];
      return next;
    });
  };

  const navDate = function(offset) {
    if (offset > 0 && viewDate >= today) return;
    var parts = viewDate.split('-').map(Number);
    var d = new Date(parts[0], parts[1]-1, parts[2]);
    d.setDate(d.getDate() + offset);
    var next = d.toLocaleDateString('en-CA');
    if (next > today) return;
    setViewDate(next);
  };

  const fmtDate = function(iso) {
    var parts    = iso.split('-').map(Number);
    var date     = new Date(parts[0], parts[1]-1, parts[2]);
    var dayName  = (DAYS_ES   || [])[date.getDay()] || '';
    var monthName= (MONTHS_ES || [])[parts[1]-1]    || '';
    return isES
      ? (dayName + ', ' + parts[2] + ' de ' + monthName + ' ' + parts[0])
      : date.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  };

  const availableEmps = React.useMemo(function() {
    return EMPLOYEES.filter(function(e) { return !liceoEmps.includes(e.id) && e.status !== 'inactive'; });
  }, [liceoEmps]);

  const filteredAvailable = React.useMemo(function() {
    if (!searchVal) return availableEmps;
    var q = searchVal.toLowerCase();
    return availableEmps.filter(function(e) {
      return e.name.toLowerCase().includes(q) ||
             e.id.toLowerCase().includes(q)   ||
             (e.cedula || '').includes(searchVal);
    });
  }, [availableEmps, searchVal]);

  return (
    <div className="page" style={{animation:'body-in .28s cubic-bezier(0.33,1,0.68,1) both'}}>

      <div className="page__head">
        <div>
          <div className="page__title">{isES ? 'Liceo Experimental' : 'Experimental High School'}</div>
        </div>
      </div>

      <div style={{display:'flex',gap:'16px',alignItems:'flex-start'}}>

        {/* LEFT — Roster (collapsible) */}
        <div style={{
          flexShrink:0,
          width: rosterOpen ? '420px' : '0',
          minWidth: rosterOpen ? '420px' : '0',
          overflow:'hidden',
          transition:'width .38s cubic-bezier(0.4,0,0.2,1), min-width .38s cubic-bezier(0.4,0,0.2,1)'}}>
        <div className="activity-map__left" style={{gap:0, width:'420px'}}>
          <div style={{display:'flex',flexDirection:'column',gap:'10px',
            width:'100%',paddingBottom:'14px'}}>
            {/* Fila 1: etiqueta */}
            <span className="activity-map__label" style={{margin:0}}>
              {isES ? 'Personal asignado' : 'Assigned staff'}
              <span style={{fontWeight:400,color:'var(--ink-300)',marginLeft:'6px',fontSize:'12px',textTransform:'none',letterSpacing:0}}>
                ({totalCount})
              </span>
            </span>
            {/* Fila 2: botones de acción */}
            <div style={{display:'flex',alignItems:'center',gap:'10px',width:'100%'}}>
              {canManage && (
                <button
                  className={'kpi__pill kpi__pill--btn' + (searchQ ? ' kpi__pill--btn--close' : '')}
                  style={{padding:'7px 13px',fontSize:'12px',gap:'6px',flex:1,justifyContent:'center'}}
                  onClick={function() { setSearchQ(function(p){ return !p; }); setSearchVal(''); }}>
                  <Icon name={searchQ ? 'x' : 'userPlus'} size={14}/>
                  {searchQ ? (isES ? 'Cerrar' : 'Close') : (isES ? 'Agregar' : 'Add')}
                </button>
              )}
              {totalCount > 0 && (
                <button
                  style={{padding:'7px 13px',fontSize:'12px',gap:'6px',
                    flex:1,justifyContent:'center'}}
                  className={presentCount === totalCount ? 'kpi__pill kpi__pill--btn kpi__pill--btn--close' : 'kpi__pill kpi__pill--up'}
                  onClick={presentCount === totalCount ? clearAll : markAllPresent}>
                  <Icon name={presentCount === totalCount ? 'x' : 'check'} size={14} stroke={presentCount === totalCount ? 1.6 : 2.4}/>
                  {presentCount === totalCount ? (isES ? 'Ausentes' : 'Absent') : (isES ? 'Todos presentes' : 'All present')}
                </button>
              )}
            </div>

            {searchQ && (
              <div style={{width:'100%'}}>
                <div className="toolbar__search" style={{width:'100%'}}>
                  <span className="toolbar__search-icon"><Icon name="search" size={15}/></span>
                  <input value={searchVal} onChange={function(e){ setSearchVal(e.target.value); }}
                    placeholder={isES ? 'Buscar empleado…' : 'Search employee…'}
                    autoFocus style={{background:'var(--paper)'}}/>
                  {searchVal && (
                    <button className="toolbar__search-clear" onClick={function(){ setSearchVal(''); }} aria-label="Limpiar">
                      <Icon name="x" size={13} stroke={2.4}/>
                    </button>
                  )}
                  {searchVal && (
                    <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,right:0,background:'var(--paper)',
                      border:'1px solid var(--ink-100)',borderRadius:'10px',zIndex:10,
                      maxHeight:'200px',overflowY:'auto',boxShadow:'var(--shadow-md)'}}>
                      {filteredAvailable.length === 0 ? (
                        <div style={{padding:'12px',fontSize:'13px',color:'var(--ink-300)',textAlign:'center'}}>
                          {isES ? 'Sin resultados' : 'No results'}
                        </div>
                      ) : filteredAvailable.map(function(e) {
                        return (
                          <button key={e.id} onClick={function(){ addToLiceo(e.id); }}
                            style={{display:'block',width:'100%',textAlign:'left',padding:'10px 14px',
                              fontSize:'13px',border:'none',background:'transparent',outline:'none',
                              cursor:'pointer',transition:'background .1s'}}
                            onMouseEnter={function(ev){ ev.currentTarget.style.background='var(--cream-50)'; }}
                            onMouseLeave={function(ev){ ev.currentTarget.style.background='transparent'; }}>
                            <div style={{fontWeight:600}}>{e.name}</div>
                            <div style={{fontSize:'11px',color:'var(--ink-300)'}}><span className="mono">{e.id}</span> · {e.dept}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {totalCount === 0 ? (
            <div className="audit-empty">
              <Icon name="users" size={24} stroke={1.2}/>
              <div className="audit-empty__title">{isES ? 'Sin personal asignado' : 'No staff assigned'}</div>
              <div className="audit-empty__sub">
                {canManage
                  ? (isES ? 'Usa «Agregar» para asignar personal al liceo.' : 'Use «Add» to assign staff to the school.')
                  : (isES ? 'Contacta a un administrador para ser asignado.' : 'Contact an administrator to be assigned.')}
              </div>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column'}}>
              {liceoEmployeeObjects.map(function(emp, idx) {
                var present  = !!draft[emp.id];
                var offScene = idx >= MAX_LICEO_SCENE;
                return (
                  <div key={emp.id}>
                  {offScene && idx === MAX_LICEO_SCENE && (
                    <div style={{display:'flex',alignItems:'center',gap:'8px',
                      padding:'10px 0 6px',opacity:.6}}>
                      <div style={{flex:1,height:'1px',background:'var(--ink-200)'}}/>
                      <span style={{fontSize:'10px',fontWeight:600,fontFamily:'var(--font-sans)',
                        color:'var(--ink-400)',textTransform:'uppercase',letterSpacing:'.06em',
                        whiteSpace:'nowrap'}}>
                        {isES ? 'Solo en lista · no aparece en escena' : 'List only · not shown in scene'}
                      </span>
                      <div style={{flex:1,height:'1px',background:'var(--ink-200)'}}/>
                    </div>
                  )}
                  <div className="audit-entry role-assignee-row"
                    style={{alignItems:'center',padding:'14px 0',
                      borderTop: idx === 0 || idx === MAX_LICEO_SCENE ? 'none' : '1px solid var(--ink-100)',
                      opacity: offScene ? 0.7 : 1}}>
                    <div style={{width:'38px',height:'38px',borderRadius:'50%',flexShrink:0,
                      display:'grid',placeItems:'center',fontSize:'13px',fontWeight:700,
                      background:'var(--ink-200)',color:'var(--ink-600)'}}>
                      {emp.name.split(' ').slice(0,2).map(function(p){ return p[0]; }).join('').toUpperCase()}
                    </div>
                    <div className="audit-entry__body">
                      <div className="audit-entry__row" style={{marginBottom:'3px'}}>
                        <span style={{fontWeight:600,fontSize:'14px'}}>{emp.name}</span>
                      </div>
                      <div className="audit-entry__row" style={{marginBottom:0,gap:'5px'}}>
                        <span className="az__dept">{emp.dept}</span>
                        <span className="az__last" style={{fontSize:'11px'}}>· <span className="mono">{emp.id}</span></span>
                      </div>
                    </div>
                    {/* Toggle — siempre visible */}
                    <div onClick={function(){ togglePresent(emp.id); }}
                      title={present ? (isES ? 'Marcar ausente' : 'Mark absent') : (isES ? 'Marcar presente' : 'Mark present')}
                      style={{
                        width:'36px',height:'20px',borderRadius:'10px',flexShrink:0,
                        background: present ? '#2d5a27' : 'var(--ink-200)',
                        position:'relative',cursor:'pointer',
                        transition:'background .2s ease',
                        boxShadow: present ? 'inset 0 1px 3px rgba(0,0,0,.2)' : 'inset 0 1px 3px rgba(0,0,0,.1)'}}>
                      <div style={{
                        position:'absolute',top:'2px',
                        left: present ? '18px' : '2px',
                        width:'16px',height:'16px',borderRadius:'50%',
                        background:'#fff',
                        boxShadow:'0 1px 3px rgba(0,0,0,.25)',
                        transition:'left .18s ease'}}/>
                    </div>
                    {/* Quitar — visible al hover */}
                    {canManage && (
                      <div className="role-assignee-actions" style={{display:'flex',flexShrink:0}}>
                        <button className="table__action-btn table__action-btn--del"
                          onClick={function(){ removeFromLiceo(emp.id); }}
                          title={isES ? 'Quitar del liceo' : 'Remove from school'}
                          style={{width:'28px',height:'28px'}}>
                          <Icon name="trash" size={13}/>
                        </button>
                      </div>
                    )}
                  </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cancelar / Guardar */}
          {isDirty && canManage && (
            <div style={{display:'flex',flexDirection:'column',gap:'8px',
              paddingTop:'14px',borderTop:'1px solid var(--ink-100)',marginTop:'6px',
              animation:'body-in .18s cubic-bezier(0.33,1,0.68,1) both'}}>
              <div style={{display:'flex',justifyContent:'flex-end',gap:'8px'}}>
                <button className="btn btn--ghost" onClick={cancelAttendance}
                  style={{padding:'7px 14px',fontSize:'12px'}}>
                  {isES ? 'Cancelar' : 'Cancel'}
                </button>
                <button className="btn btn--primary"
                  onClick={function(){ isAlreadySaved ? setConfirmOverwrite(true) : saveAttendance(); }}
                  style={{padding:'7px 14px',fontSize:'12px'}}>
                  {isES ? 'Guardar' : 'Save'}
                </button>
              </div>
            </div>
          )}

          {/* Flash asistencia */}
          {flash && (
            <div style={{alignSelf:'center',marginTop:'10px',display:'flex',alignItems:'center',gap:'7px',
              whiteSpace:'nowrap',pointerEvents:'none',
              background:'var(--ink-800)',color:'var(--cream-100)',
              padding:'10px 18px',borderRadius:'999px',
              fontFamily:'var(--font-sans)',fontSize:'12px',fontWeight:600,letterSpacing:'0.04em',
              animation:'flashFincaLife 2s ease both'}}>
              <Icon name="check" size={13} stroke={3.2}/>
              {flash}
            </div>
          )}

        </div>{/* /activity-map__left */}
        </div>{/* /roster collapse wrapper */}

        {/* RIGHT — Escena + controles */}
        <div className="act-panel" style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',overflow:'clip',position:'relative'}}
          onDoubleClick={function(){ setRosterOpen(function(o){ return !o; }); }}>

          {!isToday && (
            <div style={{position:'absolute',top:'10px',right:'14px',zIndex:10,
              width:'34px',height:'34px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{position:'absolute',width:'34px',height:'34px',borderRadius:'50%',
                background:'var(--ink-700)',
                animation:'rippleWave 5s ease-out infinite'}}/>
              <div style={{position:'absolute',width:'34px',height:'34px',borderRadius:'50%',
                background:'var(--ink-700)',
                animation:'rippleWave 5s ease-out infinite',animationDelay:'1.67s'}}/>
              <div style={{position:'absolute',width:'34px',height:'34px',borderRadius:'50%',
                background:'var(--ink-700)',
                animation:'rippleWave 5s ease-out infinite',animationDelay:'3.33s'}}/>
              <button type="button" onClick={function(){ setViewDate(today); }}
                title={isES ? 'Volver a hoy' : 'Back to today'}
                style={{position:'relative',width:'34px',height:'34px',borderRadius:'50%',
                  background:'var(--ink-800)',color:'var(--cream-100)',border:'none',cursor:'pointer',
                  fontFamily:'var(--font-sans)',fontSize:'9px',fontWeight:800,
                  letterSpacing:'.03em',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  boxShadow:'0 2px 10px rgba(22,27,51,.45)'}}>
                {isES ? 'Hoy' : 'Now'}
              </button>
            </div>
          )}

          {/* Date navigator centrado */}
          <div className="audit-toolbar" style={{padding:'14px 24px',justifyContent:'center',borderBottom:'1px solid var(--ink-100)',flexShrink:0}}
            onDoubleClick={function(e){ e.stopPropagation(); }}>
            <LiceoDateNav
              viewDate={viewDate}
              setViewDate={setViewDate}
              navDate={navDate}
              fmtDate={fmtDate}
              isES={isES}
              daily={daily}
              rosterOpen={rosterOpen}
            />
          </div>

          <div style={{padding:'20px 24px',flex:1}}>
            <div style={{display:'flex',gap:'8px',justifyContent:'center',marginBottom:'14px',flexWrap:'wrap'}}>
              {[
                {val:presentCount, label:isES?'Presentes':'Present', bg:'#eaf5ea', color:'#1e5c1e', dot:'#2d8a2d'},
                {val:absentCount,  label:isES?'Ausentes':'Absent',   bg:'#fdecea', color:'#8b1a1a', dot:'#c0392b'},
                {val:totalCount,   label:isES?'Total':'Total',       bg:'var(--ink-100)', color:'var(--ink-700)', dot:'var(--ink-400)'},
              ].map(function(item) {
                return (
                  <div key={item.label} style={{display:'flex',alignItems:'center',gap:'7px',
                    background:item.bg,borderRadius:'999px',padding:'5px 12px'}}>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:'14px',fontWeight:800,color:item.color,lineHeight:1}}>{item.val}</span>
                    <span style={{fontFamily:'var(--font-sans)',fontSize:'10px',fontWeight:600,
                      color:item.color,opacity:.7,letterSpacing:'.04em',textTransform:'uppercase'}}>{item.label}</span>
                  </div>
                );
              })}
            </div>
            {/* Escena */}
            <div style={{position:'relative'}}>
              <LiceoScene
                workers={sceneWorkers}
                dayRecords={draft}
                onToggle={togglePresent}
                presentCount={presentCount}
                absentCount={absentCount}
                totalCount={sceneWorkers.length}
                isES={isES}
                viewDate={viewDate}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal sobreescribir registro ya guardado */}
      {confirmOverwrite && (
        <div className="edit-overlay" onClick={function(){ setConfirmOverwrite(false); }}>
          <div className="del-confirm" onClick={function(e){ e.stopPropagation(); }}>
            <div className="del-confirm__hero">
              <div className="del-confirm__icon">
                <Icon name="edit" size={40} stroke={1.6}/>
              </div>
              <div className="del-confirm__title">
                {isES ? '¿Sobreescribir registro?' : 'Overwrite record?'}
              </div>
              <div className="del-confirm__sub">
                {isES
                  ? 'Este día ya fue registrado. Al confirmar se sobreescribirá.'
                  : 'This day already has saved attendance. Confirming will replace the existing record.'}
              </div>
              <div className="del-confirm__id mono">{fmtDate(viewDate)}</div>
            </div>
            <div className="del-confirm__foot">
              <button className="btn btn--ghost" onClick={function(){ setConfirmOverwrite(false); }}>
                {isES ? 'Cancelar' : 'Cancel'}
              </button>
              <button className="btn btn--danger" onClick={saveAttendance}>
                <Icon name="edit" size={14}/> {isES ? 'Sobreescribir' : 'Overwrite'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

Object.assign(window, { LiceoView });
