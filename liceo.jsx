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
  { act:'leer',          actF:'mLeer'     },
  { act:'escribir',      actF:'mEscribir' },
  { act:'hablar',        actF:'mHablar'   },
  { act:'caminar',       actF:'mCaminar'  },
  { act:'traje',         actF:'mLeer'     },
  { act:'trajesombrero', actF:'mHablar'   },
  { act:'leer',          actF:'mEscribir' },
  { act:'escribir',      actF:'mCaminar'  },
  { act:'trajesombrero', actF:'mLeer'     },
  { act:'caminar',       actF:'mEscribir' },
];

const LICEO_SHIRT_COLS = ['#2050a8','#1a3c80','#2858b0','#1e4490','#24509a'];
const LICEO_BLOUSE_COLS = ['#8a2060','#205880','#386830','#7a3020','#405090'];
const MAX_LICEO_SCENE  = LICEO_SLOTS.length;

/* ── Figured students (viewBox "0 0 44 56") ── */

/* Leer — estudiante con libro abierto */
function FigLeer({ s, c }) {
  var docAnim = {
    animation: 'w-inspect 3s ease-in-out infinite',
    transformBox: 'fill-box', transformOrigin: '20% 50%'
  };
  return (
    <g>
      <circle cx="20" cy="10" r="6.5" fill={s}/>
      <ellipse cx="20" cy="5" rx="6" ry="3" fill="#1a0a08"/>
      {/* Corbata */}
      <path d="M20,16 L19,20 L20,23 L21,20 Z" fill="#b02020"/>
      <path d="M19.5,16 L20.5,16 L21,18 L19,18 Z" fill="#c03030"/>
      {/* Torso */}
      <path d="M20,16 L20,32" stroke={c} strokeWidth="6" strokeLinecap="round"/>
      {/* Informe/carpeta sostenido frente al cuerpo */}
      <g style={docAnim}>
        <line x1="17" y1="20" x2="8"  y2="26" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        <line x1="23" y1="20" x2="33" y2="26" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        {/* Carpeta izq (tapa) */}
        <rect x="5"  y="22" width="11" height="14" rx="1" fill="#3a5a80" stroke="#2a4060" strokeWidth=".8"/>
        {/* Páginas der */}
        <rect x="16" y="22" width="11" height="14" rx="1" fill="#f4f4f4" stroke="#ccc" strokeWidth=".8"/>
        <line x1="18" y1="27" x2="25" y2="27" stroke="#bbb" strokeWidth=".9"/>
        <line x1="18" y1="30" x2="25" y2="30" stroke="#bbb" strokeWidth=".9"/>
        <line x1="18" y1="33" x2="23" y2="33" stroke="#bbb" strokeWidth=".9"/>
      </g>
      <line x1="20" y1="32" x2="14" y2="46" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="20" y1="32" x2="26" y2="46" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="14" y1="46" x2="9"  y2="51" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
      <line x1="26" y1="46" x2="31" y2="51" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
    </g>
  );
}

/* Escribir — empleado con portapapeles */
function FigEscribir({ s, c }) {
  var armAnim = {
    animation: 'w-plant 2.4s ease-in-out infinite',
    transformBox: 'fill-box', transformOrigin: '50% 20%'
  };
  return (
    <g>
      <circle cx="18" cy="12" r="6.5" fill={s}/>
      <ellipse cx="18" cy="7" rx="5.5" ry="3" fill="#1a0a08"/>
      {/* Corbata */}
      <path d="M18,19 L17,23 L18,26 L19,23 Z" fill="#204090"/>
      <path d="M17.5,19 L18.5,19 L19,21 L17,21 Z" fill="#2858b0"/>
      {/* Torso inclinado */}
      <path d="M18,18 Q16,26 15,32" stroke={c} strokeWidth="6" fill="none" strokeLinecap="round"/>
      {/* Brazo izq sostiene portapapeles */}
      <line x1="16" y1="22" x2="7" y2="28" stroke={s} strokeWidth="4" strokeLinecap="round"/>
      {/* Portapapeles */}
      <rect x="2" y="23" width="9" height="13" rx="1" fill="#e8e8e8" stroke="#aaa" strokeWidth=".8"/>
      <rect x="4.5" y="21.5" width="4" height="2.5" rx="1" fill="#777"/>
      <line x1="3.5" y1="28" x2="10" y2="28" stroke="#bbb" strokeWidth=".8"/>
      <line x1="3.5" y1="31" x2="10" y2="31" stroke="#bbb" strokeWidth=".8"/>
      <line x1="3.5" y1="34" x2="7.5" y2="34" stroke="#bbb" strokeWidth=".8"/>
      {/* Brazo der + bolígrafo ANIMADO */}
      <g style={armAnim}>
        <line x1="18" y1="20" x2="27" y2="24" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        <line x1="26" y1="23" x2="24" y2="33" stroke="#1a2a60" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="24" y1="33" x2="23.5" y2="35.5" stroke="#c0c0c0" strokeWidth="2" strokeLinecap="round"/>
      </g>
      <line x1="15" y1="32" x2="10" y2="46" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="15" y1="32" x2="21" y2="46" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="10" y1="46" x2="6"  y2="51" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
      <line x1="21" y1="46" x2="26" y2="51" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
    </g>
  );
}

/* Caminar — empleado con maletín */
function FigCaminar({ s, c }) {
  var bodyAnim = {
    animation: 'w-carry 1.9s ease-in-out infinite',
    transformBox: 'fill-box', transformOrigin: '50% 60%'
  };
  return (
    <g style={bodyAnim}>
      <circle cx="20" cy="11" r="6.5" fill={s}/>
      <ellipse cx="20" cy="6" rx="6" ry="3" fill="#1a0a08"/>
      {/* Corbata */}
      <path d="M20,17 L19,21 L20,24 L21,21 Z" fill="#802080"/>
      <path d="M19.5,17 L20.5,17 L21,19 L19,19 Z" fill="#9030a0"/>
      {/* Torso */}
      <path d="M20,17 L20,32" stroke={c} strokeWidth="6" strokeLinecap="round"/>
      {/* Brazo izq libre */}
      <line x1="18" y1="22" x2="10" y2="30" stroke={s} strokeWidth="4" strokeLinecap="round"/>
      {/* Brazo der con maletín */}
      <line x1="22" y1="22" x2="30" y2="28" stroke={s} strokeWidth="4" strokeLinecap="round"/>
      {/* Maletín */}
      <rect x="28" y="28" width="10" height="8" rx="1.5" fill="#5a3a18" stroke="#3a2410" strokeWidth=".8"/>
      <rect x="30.5" y="26.5" width="5" height="2.5" rx="1" fill="none" stroke="#3a2410" strokeWidth="1"/>
      <line x1="28" y1="32" x2="38" y2="32" stroke="#3a2410" strokeWidth=".6"/>
      {/* Piernas */}
      <line x1="20" y1="32" x2="13" y2="46" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="20" y1="32" x2="27" y2="44" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="13" y1="46" x2="8"  y2="51" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
      <line x1="27" y1="44" x2="32" y2="50" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
    </g>
  );
}

/* Hablar — empleado conversando */
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
      {/* Corbata */}
      <path d="M20,17 L19,21 L20,24 L21,21 Z" fill="#1a6a30"/>
      <path d="M19.5,17 L20.5,17 L21,19 L19,19 Z" fill="#2a8040"/>
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

/* Traje — empleado de pie con traje y corbata */
function FigTraje({ s, c }) {
  return (
    <g>
      <circle cx="20" cy="10" r="6.5" fill={s}/>
      <ellipse cx="20" cy="5" rx="5.5" ry="3" fill="#1a0a08"/>
      {/* Solapa chaqueta */}
      <path d="M14,17 L20,22 L26,17 L24,17 L20,19.5 L16,17Z" fill="#12182e"/>
      {/* Corbata */}
      <path d="M20,17 L19,21 L20,24.5 L21,21 Z" fill="#b02020"/>
      <path d="M19.5,17 L20.5,17 L21,19 L19,19 Z" fill="#c83030"/>
      {/* Torso traje */}
      <path d="M20,17 L20,33" stroke="#12182e" strokeWidth="7" strokeLinecap="round"/>
      {/* Brazos */}
      <line x1="16" y1="20" x2="10" y2="30" stroke="#12182e" strokeWidth="4" strokeLinecap="round"/>
      <line x1="24" y1="20" x2="30" y2="30" stroke="#12182e" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="9.5"  cy="31" r="2.2" fill={s}/>
      <circle cx="30.5" cy="31" r="2.2" fill={s}/>
      {/* Pantalón */}
      <line x1="20" y1="33" x2="14" y2="47" stroke="#0e1420" strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="20" y1="33" x2="26" y2="47" stroke="#0e1420" strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="14" y1="47" x2="9"  y2="52" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
      <line x1="26" y1="47" x2="31" y2="52" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
    </g>
  );
}

/* Traje + sombrero negro + maletín */
function FigTrajeSombrero({ s, c }) {
  var bodyAnim = { animation:'w-carry 1.9s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'50% 60%' };
  return (
    <g style={bodyAnim}>
      {/* Sombrero negro (fedora) */}
      <rect x="12" y="3"   width="16" height="6.5" rx="1.5" fill="#111111"/>
      <rect x="9"  y="8.5" width="22" height="3"   rx="1.5" fill="#1a1a1a"/>
      <rect x="12" y="6.5" width="16" height="1.8" fill="#2a2a2a"/>
      {/* Cabeza */}
      <circle cx="20" cy="13" r="6.5" fill={s}/>
      <ellipse cx="20" cy="8.5" rx="5.5" ry="3" fill="#1a0a08"/>
      {/* Solapa */}
      <path d="M14,20 L20,25 L26,20 L24,20 L20,22 L16,20Z" fill="#12182e"/>
      {/* Corbata */}
      <path d="M20,20 L19,24 L20,27 L21,24 Z" fill="#204090"/>
      <path d="M19.5,20 L20.5,20 L21,22 L19,22 Z" fill="#2858b0"/>
      {/* Torso */}
      <path d="M20,20 L20,34" stroke="#12182e" strokeWidth="7" strokeLinecap="round"/>
      {/* Brazo izq */}
      <line x1="16" y1="23" x2="10" y2="31" stroke="#12182e" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="9.5" cy="32" r="2.2" fill={s}/>
      {/* Brazo der + maletín */}
      <line x1="24" y1="23" x2="30" y2="29" stroke="#12182e" strokeWidth="4" strokeLinecap="round"/>
      <rect x="28" y="29" width="10" height="8" rx="1.5" fill="#2a1a08" stroke="#110a00" strokeWidth=".8"/>
      <rect x="30.5" y="27.5" width="5" height="2.5" rx="1" fill="none" stroke="#110a00" strokeWidth="1"/>
      <line x1="28" y1="33" x2="38" y2="33" stroke="#110a00" strokeWidth=".6"/>
      {/* Pantalón */}
      <line x1="20" y1="34" x2="13" y2="47" stroke="#0e1420" strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="20" y1="34" x2="27" y2="45" stroke="#0e1420" strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="13" y1="47" x2="8"  y2="52" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
      <line x1="27" y1="45" x2="32" y2="50" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
    </g>
  );
}

/* ── Figuras femeninas de oficina ── */
function _FemHead({ s }) {
  return (
    <g>
      <ellipse cx="20" cy="6.5" rx="8" ry="5" fill="#1a0a08"/>
      <circle  cx="20" cy="11"  r="6.5"        fill={s}/>
      <path d="M12,13 Q9,18 11,23"  stroke="#1a0a08" strokeWidth="3.8" fill="none" strokeLinecap="round"/>
      <path d="M28,13 Q31,18 29,23" stroke="#1a0a08" strokeWidth="3.8" fill="none" strokeLinecap="round"/>
    </g>
  );
}
function _FemSkirt({ c }) {
  return (
    <g>
      <path d="M16,33 L12,48 L28,48 L24,33Z" fill={c} opacity=".85"/>
      <line x1="13" y1="48" x2="10" y2="54" stroke="#1a1a1a" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="27" y1="48" x2="30" y2="54" stroke="#1a1a1a" strokeWidth="3.5" strokeLinecap="round"/>
    </g>
  );
}

/* Mujer — leyendo informe */
function FigMujerLeer({ s, c }) {
  var docAnim = { animation:'w-inspect 3s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'20% 50%' };
  return (
    <g>
      <_FemHead s={s}/>
      <circle cx="20" cy="19" r="1.3" fill="#c8902a" opacity=".9"/>
      <path d="M20,17 L20,33" stroke={c} strokeWidth="6" strokeLinecap="round"/>
      <g style={docAnim}>
        <line x1="17" y1="21" x2="8"  y2="27" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        <line x1="23" y1="21" x2="33" y2="27" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        <rect x="5"  y="23" width="11" height="13" rx="1" fill="#8a3060" stroke="#6a2050" strokeWidth=".8"/>
        <rect x="16" y="23" width="11" height="13" rx="1" fill="#f4f4f4" stroke="#ccc" strokeWidth=".8"/>
        <line x1="18" y1="28" x2="25" y2="28" stroke="#bbb" strokeWidth=".9"/>
        <line x1="18" y1="31" x2="25" y2="31" stroke="#bbb" strokeWidth=".9"/>
        <line x1="18" y1="34" x2="23" y2="34" stroke="#bbb" strokeWidth=".9"/>
      </g>
      <_FemSkirt c={c}/>
    </g>
  );
}

/* Mujer — escribiendo en portapapeles */
function FigMujerEscribir({ s, c }) {
  var armAnim = { animation:'w-plant 2.4s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'50% 20%' };
  return (
    <g>
      <_FemHead s={s}/>
      <circle cx="18" cy="19" r="1.3" fill="#c8902a" opacity=".9"/>
      <path d="M18,17 Q16,25 15,33" stroke={c} strokeWidth="6" fill="none" strokeLinecap="round"/>
      <line x1="16" y1="22" x2="7"  y2="28" stroke={s} strokeWidth="4" strokeLinecap="round"/>
      <rect x="2" y="24" width="9" height="13" rx="1" fill="#e8e8e8" stroke="#aaa" strokeWidth=".8"/>
      <rect x="4.5" y="22.5" width="4" height="2.5" rx="1" fill="#888"/>
      <line x1="3.5" y1="29" x2="10" y2="29" stroke="#bbb" strokeWidth=".8"/>
      <line x1="3.5" y1="32" x2="10" y2="32" stroke="#bbb" strokeWidth=".8"/>
      <g style={armAnim}>
        <line x1="18" y1="21" x2="27" y2="25" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        <line x1="26" y1="24" x2="24" y2="34" stroke="#1a2a60" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="24" y1="34" x2="23.5" y2="36.5" stroke="#c0c0c0" strokeWidth="2" strokeLinecap="round"/>
      </g>
      <_FemSkirt c={c}/>
    </g>
  );
}

/* Mujer — caminando con bolso */
function FigMujerCaminar({ s, c }) {
  var bodyAnim = { animation:'w-carry 1.9s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'50% 60%' };
  return (
    <g style={bodyAnim}>
      <_FemHead s={s}/>
      <circle cx="20" cy="19" r="1.3" fill="#c8902a" opacity=".9"/>
      <path d="M20,17 L20,33" stroke={c} strokeWidth="6" strokeLinecap="round"/>
      <line x1="17" y1="22" x2="10" y2="30" stroke={s} strokeWidth="4" strokeLinecap="round"/>
      {/* Bolso de mano */}
      <line x1="23" y1="22" x2="30" y2="27" stroke={s} strokeWidth="4" strokeLinecap="round"/>
      <rect x="28" y="27" width="8" height="7" rx="2" fill="#7a3020" stroke="#5a2010" strokeWidth=".8"/>
      <path d="M30,27 Q32,24 34,27" fill="none" stroke="#5a2010" strokeWidth="1.2"/>
      <_FemSkirt c={c}/>
    </g>
  );
}

/* Mujer — conversando */
function FigMujerHablar({ s, c }) {
  var nod = { animation:'w-inspect 2.8s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'50% 10%' };
  return (
    <g>
      <_FemHead s={s}/>
      <circle cx="20" cy="19" r="1.3" fill="#c8902a" opacity=".9"/>
      <path d="M20,17 L20,33" stroke={c} strokeWidth="6" strokeLinecap="round"/>
      <g style={nod}>
        <line x1="17" y1="21" x2="9"  y2="27" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        <line x1="23" y1="21" x2="31" y2="27" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        <circle cx="8"  cy="28" r="2.5" fill={s}/>
        <circle cx="32" cy="28" r="2.5" fill={s}/>
      </g>
      <_FemSkirt c={c}/>
    </g>
  );
}

function LiceoStudent({ emp, onToggle, slotIndex, totalCount }) {
  var slot     = LICEO_SLOTS[slotIndex % LICEO_SLOTS.length];
  var isFemale = emp.gender === 'F';
  var act      = isFemale ? slot.actF : slot.act;
  var sz = totalCount > 9 ? 28 : totalCount > 6 ? 34 : totalCount > 4 ? 39 : 44;
  var skin     = '#d4956a';
  var shirt    = isFemale
    ? LICEO_BLOUSE_COLS[slotIndex % LICEO_BLOUSE_COLS.length]
    : LICEO_SHIRT_COLS[slotIndex  % LICEO_SHIRT_COLS.length];

  return (
    <div onClick={function() { onToggle(emp.id); }} title={emp.name}
      style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',
        cursor:'pointer',userSelect:'none'}}>
      <svg width={sz} height={Math.round(sz*1.27)} viewBox="0 0 44 56" style={{overflow:'visible'}}>
        {act === 'leer'          && <FigLeer          s={skin} c={shirt}/>}
        {act === 'escribir'      && <FigEscribir      s={skin} c={shirt}/>}
        {act === 'caminar'       && <FigCaminar       s={skin} c={shirt}/>}
        {act === 'hablar'        && <FigHablar        s={skin} c={shirt}/>}
        {act === 'traje'         && <FigTraje         s={skin} c={shirt}/>}
        {act === 'trajesombrero' && <FigTrajeSombrero s={skin} c={shirt}/>}
        {act === 'mLeer'         && <FigMujerLeer     s={skin} c={shirt}/>}
        {act === 'mEscribir'     && <FigMujerEscribir s={skin} c={shirt}/>}
        {act === 'mCaminar'      && <FigMujerCaminar  s={skin} c={shirt}/>}
        {act === 'mHablar'       && <FigMujerHablar   s={skin} c={shirt}/>}
      </svg>
    </div>
  );
}

/* ── Edificio del Liceo ── */
function LiceoBuilding({ flagUp, clock }) {
  var _h   = clock ? clock.getHours() % 12 : 0;
  var _m   = clock ? clock.getMinutes()     : 0;
  var _s   = clock ? clock.getSeconds()     : 0;
  var hourDeg   = _h * 30 + _m * 0.5;
  var minuteDeg = _m * 6;
  var secondDeg = _s * 6;
  return (
    <svg style={{position:'absolute',bottom:'113px',right:'0%',width:'248px',height:'192px',overflow:'visible',
      filter:'drop-shadow(0 12px 32px rgba(0,0,0,.45))'}}
      viewBox="0 0 248 192">

      {/* ── DEFS: gradiente tubo ── */}
      <defs>
        <linearGradient id="liceoPoleLG" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor="#3a5060"/>
          <stop offset="28%"  stopColor="#b8ccd6"/>
          <stop offset="52%"  stopColor="#9ab0bc"/>
          <stop offset="100%" stopColor="#2a3c48"/>
        </linearGradient>
      </defs>

      {/* ── BANDERA RD — hacia la izquierda, animación brisa ── */}
      {/* extremo libre=izq (x=-52), enganche=der (x=6), alto y=16..52 */}
      <g style={{opacity: flagUp ? 1 : 0, transition:'opacity 90s linear'}}>
        <g style={{animation:'flag-breeze 3.5s ease-in-out infinite',
                   transformBox:'fill-box', transformOrigin:'right center'}}>
          <rect x="-52" y="16" width="58" height="36" fill="#002D62"/>
          <rect x="-23" y="16" width="29" height="18" fill="#CE1126"/>
          <rect x="-52" y="34" width="29" height="18" fill="#CE1126"/>
          <rect x="-52" y="31" width="58" height="6"  fill="#fff"/>
          <rect x="-26" y="16" width="6"  height="36" fill="#fff"/>
        </g>
      </g>

      {/* ── ASTA (tubo metálico) — siempre visible ── */}
      <rect x="14" y="16" width="5"   height="176" rx="2.5" fill="rgba(0,0,0,.22)"/>
      <rect x="6"  y="12" width="9"   height="180" rx="4.5" fill="url(#liceoPoleLG)"/>
      <rect x="8.5" y="12" width="2.5" height="180" rx="1.25" fill="rgba(255,255,255,.20)"/>
      <rect x="2"  y="188" width="19" height="6"   rx="3"   fill="#7a9098"/>
      <rect x="0"  y="193" width="23" height="4"   rx="2"   fill="#5a7080"/>
      <circle cx="10.5" cy="14" r="7"   fill="#9a7010"/>
      <circle cx="10.5" cy="12" r="6"   fill="#c8a030"/>
      <circle cx="10"   cy="10" r="3.5" fill="#ecc840" opacity=".85"/>
      {/* Cuerda */}
      <line x1="6" y1="16" x2="6" y2="52" stroke="#d4aa40" strokeWidth="1.2" opacity=".55"/>

      {/* ── FUNDACIÓN ── */}
      <rect x="24" y="178" width="224" height="14" rx="1" fill="#c8c0b0"/>
      <rect x="24" y="178" width="224" height="5"  rx="1" fill="#d8d0c0"/>

      {/* ══ ALA IZQUIERDA ══ */}
      <rect x="24"  y="54" width="72" height="124" fill="#c0572e"/>
      <rect x="24"  y="54" width="9"  height="124" fill="rgba(0,0,0,.14)"/>
      <rect x="92"  y="54" width="5"  height="124" fill="rgba(255,255,255,.08)"/>
      <rect x="24"  y="48" width="72" height="8"   rx="1" fill="#f4ede0"/>
      <rect x="24"  y="44" width="72" height="6"   rx="1" fill="#282a38"/>
      {/* Ventanas superiores ala izq */}
      {[33,57].map(function(x) { return (
        <g key={'liu'+x}>
          <rect x={x}   y="64" width="22" height="32" rx="2.5" fill="#f4ede0"/>
          <path d={'M'+x+','+77+' Q'+(x+11)+','+63+' '+(x+22)+','+77} fill="#f4ede0"/>
          <rect x={x+2} y="69" width="18" height="24" rx="1.5" fill="#90cce8"/>
          <path d={'M'+(x+2)+','+69+' Q'+(x+11)+','+57+' '+(x+20)+','+69} fill="#90cce8"/>
          <line x1={x+11} y1="69" x2={x+11} y2="93" stroke="#f4ede0" strokeWidth="1.8"/>
          <rect x={x-1} y="96"  width="24" height="3.5" rx="1" fill="#d8d0c4"/>
        </g>
      ); })}
      {/* Ventanas inferiores ala izq */}
      {[33,57].map(function(x) { return (
        <g key={'lil'+x}>
          <rect x={x}   y="116" width="22" height="28" rx="2"   fill="#f4ede0"/>
          <rect x={x+2} y="118" width="18" height="24" rx="1.5" fill="#90cce8"/>
          <line x1={x+11} y1="118" x2={x+11} y2="142" stroke="#f4ede0" strokeWidth="1.8"/>
          <line x1={x}    y1="130" x2={x+22} y2="130" stroke="#f4ede0" strokeWidth="1.8"/>
          <rect x={x-1}  y="144" width="24" height="3.5" rx="1" fill="#d8d0c4"/>
        </g>
      ); })}

      {/* ══ ALA DERECHA ══ ═*/}
      <rect x="152" y="54" width="72" height="124" fill="#c0572e"/>
      <rect x="215" y="54" width="9"  height="124" fill="rgba(0,0,0,.14)"/>
      <rect x="148" y="54" width="5"  height="124" fill="rgba(255,255,255,.08)"/>
      <rect x="152" y="48" width="72" height="8"   rx="1" fill="#f4ede0"/>
      <rect x="152" y="44" width="72" height="6"   rx="1" fill="#282a38"/>
      {/* Ventanas superiores ala der */}
      {[159,183].map(function(x) { return (
        <g key={'riu'+x}>
          <rect x={x}   y="64" width="22" height="32" rx="2.5" fill="#f4ede0"/>
          <path d={'M'+x+','+77+' Q'+(x+11)+','+63+' '+(x+22)+','+77} fill="#f4ede0"/>
          <rect x={x+2} y="69" width="18" height="24" rx="1.5" fill="#90cce8"/>
          <path d={'M'+(x+2)+','+69+' Q'+(x+11)+','+57+' '+(x+20)+','+69} fill="#90cce8"/>
          <line x1={x+11} y1="69" x2={x+11} y2="93" stroke="#f4ede0" strokeWidth="1.8"/>
          <rect x={x-1}  y="96" width="24" height="3.5" rx="1" fill="#d8d0c4"/>
        </g>
      ); })}
      {/* Ventanas inferiores ala der */}
      {[159,183].map(function(x) { return (
        <g key={'ril'+x}>
          <rect x={x}   y="116" width="22" height="28" rx="2"   fill="#f4ede0"/>
          <rect x={x+2} y="118" width="18" height="24" rx="1.5" fill="#90cce8"/>
          <line x1={x+11} y1="118" x2={x+11} y2="142" stroke="#f4ede0" strokeWidth="1.8"/>
          <line x1={x}    y1="130" x2={x+22} y2="130" stroke="#f4ede0" strokeWidth="1.8"/>
          <rect x={x-1}  y="144" width="24" height="3.5" rx="1" fill="#d8d0c4"/>
        </g>
      ); })}

      {/* ══ BLOQUE CENTRAL ══ */}
      <rect x="88" y="46" width="72" height="132" fill="#c0572e"/>
      {/* Cornisa central */}
      <rect x="84" y="42" width="80" height="8" rx="1" fill="#f4ede0"/>
      {/* Franja náutica (entablatura) */}
      <rect x="84" y="42" width="80" height="18" fill="#1a2e5a"/>
      <text x="124" y="53.5" textAnchor="middle"
        fontSize="6" fontFamily="'Cinzel', serif" fontWeight="900"
        fill="#ffffff" stroke="#0d1a36" strokeWidth="1" paintOrder="stroke fill"
        style={{filter:'drop-shadow(0 0 2px rgba(0,0,0,.9))'}}>LICEO EXPERIMENTAL</text>

      {/* ══ PEDIMENTO ══ */}
      <polygon points="84,42 164,42 124,8" fill="#f4ede0"/>
      <polygon points="84,42 164,42 124,8" fill="none" stroke="#d8d0c4" strokeWidth="1.8"/>
      <polygon points="88,40 160,40 124,14" fill="none" stroke="#c8c0b4" strokeWidth=".8" opacity=".5"/>
      {/* Reloj en el tímpano */}
      <circle cx="124" cy="28" r="9"   fill="#1a2e5a" stroke="#f4ede0" strokeWidth="2"/>
      <circle cx="124" cy="28" r="6.5" fill="#f8f4ee"/>
      {/* Manecilla horas */}
      <line x1="124" y1="28" x2="124" y2="24"
        stroke="#1a2e5a" strokeWidth="1.6" strokeLinecap="round"
        transform={'rotate('+hourDeg+',124,28)'}/>
      {/* Manecilla minutos */}
      <line x1="124" y1="28" x2="124" y2="22.5"
        stroke="#1a2e5a" strokeWidth="1.2" strokeLinecap="round"
        transform={'rotate('+minuteDeg+',124,28)'}/>
      {/* Manecilla segundos */}
      <line x1="124" y1="30" x2="124" y2="21.5"
        stroke="#e03020" strokeWidth=".8" strokeLinecap="round"
        transform={'rotate('+secondDeg+',124,28)'}/>
      {/* Centro */}
      <circle cx="124" cy="28" r=".9"  fill="#1a2e5a"/>

      {/* ══ COLUMNAS DÓRICAS (4) ══ */}
      {[96,108,131,144].map(function(x) { return (
        <g key={'col'+x}>
          <rect x={x-4} y="56"  width="10" height="5"   rx="1" fill="#f4ede0"/>
          <rect x={x-3} y="61"  width="8"  height="102" rx="4" fill="#f8f4ee"/>
          <rect x={x-1} y="61"  width="3"  height="102" rx="2" fill="rgba(255,255,255,.45)"/>
          <rect x={x-4} y="163" width="10" height="5"   rx="1" fill="#f4ede0"/>
          <rect x={x-5} y="168" width="12" height="4"   rx="1" fill="#e4ddd4"/>
        </g>
      ); })}

      {/* ══ VENTANAS CENTRALES (2 arqueadas, piso superior) ══ */}
      {[93,136].map(function(x) { return (
        <g key={'cw'+x}>
          <rect x={x}   y="62" width="20" height="34" rx="2.5" fill="#f4ede0"/>
          <path d={'M'+x+','+75+' Q'+(x+10)+','+61+' '+(x+20)+','+75} fill="#f4ede0"/>
          <rect x={x+2} y="68" width="16" height="25" rx="1.5" fill="#90cce8"/>
          <path d={'M'+(x+2)+','+68+' Q'+(x+10)+','+55+' '+(x+18)+','+68} fill="#90cce8"/>
          <rect x={x-1} y="96" width="22" height="3.5" rx="1" fill="#d8d0c4"/>
        </g>
      ); })}

      {/* ══ PUERTA PRINCIPAL ══ */}
      <rect x="113" y="130" width="22" height="48" rx="2.5" fill="#1a2e5a"/>
      <path d="M113,144 Q124,122 135,144" fill="#1a2e5a"/>
      {/* Vidrio del arco */}
      <path d="M115,144 Q124,126 133,144" fill="#90cce8" opacity=".7"/>
      {/* Paneles */}
      <rect x="115" y="147" width="8"  height="16" rx="1.5" fill="rgba(255,255,255,.1)"/>
      <rect x="125" y="147" width="8"  height="16" rx="1.5" fill="rgba(255,255,255,.1)"/>
      {/* Manijas */}
      <circle cx="122" cy="162" r="2" fill="#c9a840"/>
      <circle cx="126" cy="162" r="2" fill="#c9a840"/>
      {/* Umbral */}
      <rect x="112" y="178" width="24" height="3" rx="1" fill="#b0a898"/>
      {/* Placa del letrero */}
      <rect x="104" y="160" width="40" height="11" rx="2" fill="#1a2e5a"/>
      <text x="124" y="168" textAnchor="middle"
        fontSize="4.2" fontFamily="'Cinzel', serif" fontWeight="900"
        fill="#ffffff" stroke="#0d1a36" strokeWidth="1" paintOrder="stroke fill"
        style={{filter:'drop-shadow(0 0 2px rgba(0,0,0,.9))'}}>UASD · EST. 1538</text>

      {/* ══ ESCALONES AMPLIA ══ */}
      <rect x="104" y="172" width="40" height="4"  rx="1" fill="#d0c8b8"/>
      <rect x="100" y="176" width="48" height="4"  rx="1" fill="#c8c0b0"/>
      <rect x="96"  y="180" width="56" height="4"  rx="1" fill="#c0b8a8"/>
      <rect x="92"  y="184" width="64" height="4"  rx="1" fill="#b8b0a0"/>
      <rect x="88"  y="188" width="72" height="4"  rx="1" fill="#b0a898"/>

      {/* ══ TEXTURA DE LADRILLO (líneas de mortero) ══ */}
      {[68,84,100,116,132,148,164].map(function(y) { return (
        <g key={'bx'+y}>
          <line x1="24"  y1={y} x2="92"  y2={y} stroke="#a04020" strokeWidth=".6" opacity=".22"/>
          <line x1="152" y1={y} x2="224" y2={y} stroke="#a04020" strokeWidth=".6" opacity=".22"/>
          <line x1="88"  y1={y} x2="160" y2={y} stroke="#a04020" strokeWidth=".6" opacity=".16"/>
        </g>
      ); })}
    </svg>
  );
}

/* ── Bus escolar Sims 4 style ── */
function SchoolBus() {
  return (
    <svg style={{position:'absolute',bottom:'113px',left:'2%',
      width:'104px',height:'62px',overflow:'visible',
      filter:'drop-shadow(0 6px 14px rgba(0,0,0,.38))'}}
      viewBox="0 0 104 62">
      {/* Sombra del bus */}
      <ellipse cx="52" cy="62" rx="46" ry="4" fill="rgba(0,0,0,.2)"/>
      {/* Techo */}
      <rect x="6" y="4"  width="90" height="10" rx="4" fill="#e8b208"/>
      {/* Barra de emergencia en techo */}
      <rect x="10" y="2" width="82" height="4"  rx="2" fill="#d4a206"/>
      {/* Cuerpo principal */}
      <rect x="6" y="10" width="90" height="38" rx="3" fill="#f5c518"/>
      {/* Frente redondeado */}
      <path d="M6,10 Q6,48 10,48 L6,48 Z" fill="#e0aa08"/>
      <rect x="6" y="10" width="10" height="38" rx="3" fill="#e8b208"/>
      {/* Tira negra lateral */}
      <rect x="6" y="28" width="90" height="4" fill="#1a1820" opacity=".22"/>
      {/* Ventanas con marco blanco */}
      {[22,38,54,70].map(function(x) { return (
        <g key={x}>
          <rect x={x-1} y="12" width="16" height="13" rx="2.5" fill="#f8f8f8"/>
          <rect x={x}   y="13" width="14" height="11" rx="2"   fill="#70c0e8"/>
        </g>
      ); })}
      {/* Ventana conductor */}
      <rect x="9"  y="12" width="9" height="11" rx="2" fill="#70c0e8"/>
      {/* Franja UASD */}
      <rect x="16" y="34" width="72" height="12" rx="0" fill="#1a2e5a"/>
      <text x="52" y="43" textAnchor="middle"
        fontSize="7" fontFamily="var(--font-sans)" fontWeight="900"
        fill="#ffffff" stroke="#0d1a36" strokeWidth="1" paintOrder="stroke fill"
        style={{filter:'drop-shadow(0 0 2px rgba(0,0,0,.9))'}}>UASD</text>
      {/* Puerta lateral */}
      <rect x="89" y="18" width="6" height="22" rx="1" fill="#d4a006"/>
      <line x1="92" y1="18" x2="92" y2="40" stroke="#b88c04" strokeWidth="1.2"/>
      <circle cx="90" cy="29" r="1.5" fill="#f8f4ee"/>
      {/* Faro delantero */}
      <rect x="6"  y="16" width="5" height="7"  rx="1.5" fill="#fff8c0"/>
      <rect x="6"  y="34" width="5" height="5"  rx="1"   fill="#ff5044" opacity=".9"/>
      {/* Parachoques */}
      <rect x="4"  y="42" width="12" height="6" rx="2" fill="#c8c0b0"/>
      <rect x="88" y="42" width="12" height="6" rx="2" fill="#c8c0b0"/>
      {/* Ruedas */}
      <circle cx="24" cy="50" r="10"  fill="#1a1820"/>
      <circle cx="24" cy="50" r="7.5" fill="#282630"/>
      <circle cx="24" cy="50" r="4"   fill="#3a3848"/>
      <circle cx="24" cy="50" r="1.5" fill="#888"/>
      <circle cx="78" cy="50" r="10"  fill="#1a1820"/>
      <circle cx="78" cy="50" r="7.5" fill="#282630"/>
      <circle cx="78" cy="50" r="4"   fill="#3a3848"/>
      <circle cx="78" cy="50" r="1.5" fill="#888"/>
      {/* Detalles ruedas */}
      {[0,60,120,180,240,300].map(function(deg) {
        var rad = deg * Math.PI / 180;
        var r = 6;
        return (
          <line key={deg}
            x1={24 + r*0.4*Math.cos(rad)} y1={50 + r*0.4*Math.sin(rad)}
            x2={24 + r*Math.cos(rad)}      y2={50 + r*Math.sin(rad)}
            stroke="#555" strokeWidth="1.2"/>
        );
      })}
      {[0,60,120,180,240,300].map(function(deg) {
        var rad = deg * Math.PI / 180;
        var r = 6;
        return (
          <line key={deg}
            x1={78 + r*0.4*Math.cos(rad)} y1={50 + r*0.4*Math.sin(rad)}
            x2={78 + r*Math.cos(rad)}      y2={50 + r*Math.sin(rad)}
            stroke="#555" strokeWidth="1.2"/>
        );
      })}
    </svg>
  );
}

/* ── Árbol Sims 4 style — roble americano ── */
function SchoolTree({ style }) {
  return (
    <svg style={style} viewBox="0 0 60 100">
      {/* Sombra en suelo */}
      <ellipse cx="30" cy="97" rx="14" ry="4" fill="rgba(0,0,0,.18)"/>
      {/* Tronco */}
      <rect x="25" y="68" width="10" height="32" rx="5" fill="#6b4726"/>
      <rect x="27" y="68" width="4"  height="32" rx="3" fill="#7d5530"/>
      {/* Copa base (sombra) */}
      <ellipse cx="30" cy="46" rx="26" ry="32" fill="#1d6820"/>
      {/* Copa exterior */}
      <ellipse cx="30" cy="42" rx="25" ry="30" fill="#2a8228"/>
      {/* Copa media */}
      <ellipse cx="30" cy="38" rx="21" ry="26" fill="#349e30"/>
      {/* Lóbulos del roble */}
      <circle cx="12" cy="42" r="12" fill="#2e9028"/>
      <circle cx="48" cy="42" r="12" fill="#2e9028"/>
      <circle cx="20" cy="22" r="13" fill="#34a830"/>
      <circle cx="40" cy="22" r="13" fill="#34a830"/>
      <circle cx="30" cy="16" r="14" fill="#3ab834"/>
      {/* Copa interior clara */}
      <ellipse cx="30" cy="32" rx="14" ry="18" fill="#3ec838"/>
      {/* Brillo superior */}
      <ellipse cx="24" cy="20" rx="8"  ry="10" fill="rgba(255,255,255,.12)"/>
    </svg>
  );
}

/* ── Avión vinilado — bandera RD ── */
function DomPlane() {
  return (
    <div style={{
      position:'absolute', top:'4%',
      pointerEvents:'none', zIndex:8,
      animation:'planeFly 1800s linear infinite',
      animationDelay:'10s', animationFillMode:'backwards',
    }}>
      <svg width="115" height="40" viewBox="0 0 115 40"
        style={{overflow:'visible', filter:'drop-shadow(0 3px 10px rgba(0,0,0,.45))'}}>
        <defs>
          <clipPath id="dp-fuse-liceo">
            <path d="M8,20 Q18,11 30,11 L88,11 Q103,11 107,20 Q103,29 88,29 L30,29 Q18,29 8,20Z"/>
          </clipPath>
        </defs>
        {/* Estelas de condensación */}
        <line x1="-55" y1="18" x2="8" y2="17" stroke="rgba(255,255,255,.55)" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="-50" y1="23" x2="8" y2="22" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Estabilizador vertical (cola) */}
        <path d="M15,11 L24,1 L28,11Z" fill="#d8d8d8"/>
        {/* Estabilizadores horizontales */}
        <path d="M12,20 L26,14 L28,20Z" fill="#d8d8d8"/>
        <path d="M12,20 L26,26 L28,20Z" fill="#d8d8d8"/>
        {/* Ala principal */}
        <path d="M38,27 L22,40 L72,40 L76,27Z" fill="#c4c4c4"/>
        {/* Motor */}
        <ellipse cx="42" cy="40" rx="13" ry="4.5" fill="#aaaaaa"/>
        {/* Fuselaje — bandera dominicana en vinilo */}
        <g clipPath="url(#dp-fuse-liceo)">
          <rect x="0"  y="0"  width="58" height="20" fill="#002D62"/>
          <rect x="58" y="20" width="115" height="40" fill="#002D62"/>
          <rect x="58" y="0"  width="115" height="20" fill="#CF142B"/>
          <rect x="0"  y="20" width="58"  height="40" fill="#CF142B"/>
          <rect x="0"  y="18" width="115" height="4"  fill="white"/>
          <rect x="55" y="0"  width="6"   height="40" fill="white"/>
        </g>
        {/* Contorno del fuselaje */}
        <path d="M8,20 Q18,11 30,11 L88,11 Q103,11 107,20 Q103,29 88,29 L30,29 Q18,29 8,20Z"
          fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1"/>
        {/* Nickname — livery del ala */}
        <text x="53" y="34" textAnchor="middle"
          fontSize="6.5" fontFamily="var(--font-sans)" fontWeight="900"
          fill="rgba(0,0,0,.92)"
          stroke="rgba(255,255,255,.4)" strokeWidth="0.6" paintOrder="stroke fill"
          letterSpacing="0.9"
          transform="rotate(-8,53,34)">@_09pavo</text>
        {/* Ventanillas */}
        {[34,43,52,66,75,84,93].map(function(x) {
          return <circle key={x} cx={x} cy={16} r="2" fill="rgba(190,228,255,.85)"/>;
        })}
        {/* Toque de luz en la nariz */}
        <path d="M98,14 Q107,16 109,20" stroke="rgba(255,255,255,.3)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

/* ── Animated liceo scene ── */
function LiceoScene({ workers, dayRecords, onToggle, presentCount, absentCount, totalCount, isES, viewDate }) {
  const [clock,      setClock]      = React.useState(function() { return new Date(); });
  React.useEffect(function() {
    var intervalId = setInterval(function() { setClock(new Date()); }, 1000);
    return function() { clearInterval(intervalId); };
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
      maxWidth:'960px',
      marginLeft:'auto',marginRight:'auto',
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
        <path d="M0,90 Q180,8 360,48 Q540,88 720,20 Q760,6 800,32 L800,90Z" fill="rgba(30,80,18,.5)"/>
        <path d="M0,90 Q160,34 340,62 Q500,88 660,40 Q730,24 800,55 L800,90Z" fill="rgba(22,65,12,.72)"/>
      </svg>

      {/* ── SUELO — césped americano + acera ── */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'116px',
        background:'linear-gradient(180deg,#3a9830 0%,#2e7c26 35%,#226018 65%,#1a4c12 100%)'}}/>

      {/* Acera de concreto (franja baja) */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'38px',
        background:'linear-gradient(180deg,#c8c4b8 0%,#b8b4a8 60%,#a8a498 100%)'}}/>

      {/* Camino central de entrada (path paved walkway) */}
      <svg style={{position:'absolute',bottom:'38px',left:0,width:'100%',height:'78px',
        overflow:'visible',pointerEvents:'none'}}
        viewBox="0 0 800 78" preserveAspectRatio="none">
        {/* Camino hacia la entrada del edificio */}
        <path d="M340,78 L420,78 L460,0 L300,0 Z" fill="#c8c2b2" opacity=".7"/>
        <path d="M350,78 L410,78 L450,0 L310,0 Z" fill="#d0ccc0" opacity=".5"/>
        {/* Líneas de losas */}
        {[14,28,42,56].map(function(y) { return (
          <line key={y} x1="305" y1={y} x2="455" y2={y} stroke="rgba(0,0,0,.08)" strokeWidth="1.5"/>
        ); })}
      </svg>



      {/* Árboles Sims 4 */}
      <SchoolTree style={{position:'absolute',bottom:'113px',left:'2%',width:'58px',height:'104px',overflow:'visible'}}/>
      <SchoolTree style={{position:'absolute',bottom:'113px',left:'17%',width:'46px',height:'82px',overflow:'visible',opacity:.9}}/>
      <SchoolTree style={{position:'absolute',bottom:'113px',right:'28%',width:'44px',height:'78px',overflow:'visible',opacity:.9}}/>
      <SchoolTree style={{position:'absolute',bottom:'113px',right:'25%',width:'34px',height:'60px',overflow:'visible',opacity:.7}}/>

      {/* Bus escolar */}
      <SchoolBus/>

      {/* Avión vinilado */}
      <DomPlane/>

      {/* Edificio del liceo */}
      <LiceoBuilding flagUp={hours >= 7 && hours < 19} clock={clock}/>

      {/* Empleados — dos filas flex centradas en el espacio frente al edificio */}
      {totalCount > 0 && (function() {
        var front = [], back = [];
        workers.forEach(function(emp, i) {
          if (!dayRecords[emp.id]) return;
          (i < 5 ? front : back).push({ emp: emp, i: i });
        });
        var rowStyle = function(bottom, z) {
          return {
            position:'absolute', left:'248px', right:0, bottom:bottom,
            display:'flex', justifyContent:'space-evenly', alignItems:'flex-end',
            pointerEvents:'none', zIndex:z
          };
        };
        return (
          <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,pointerEvents:'none',zIndex:3}}>
            {front.length > 0 && (
              <div style={rowStyle('58px', 6)}>
                {front.map(function(e) {
                  return (
                    <div key={e.emp.id} style={{pointerEvents:'auto',
                      animation:'fighter-in .35s cubic-bezier(0.17,0.67,0.35,1) both',
                      animationDelay:(e.i*0.07)+'s'}}>
                      <LiceoStudent emp={e.emp} onToggle={onToggle} slotIndex={e.i} totalCount={totalCount}/>
                    </div>
                  );
                })}
              </div>
            )}
            {back.length > 0 && (
              <div style={rowStyle('92px', 4)}>
                {back.map(function(e) {
                  return (
                    <div key={e.emp.id} style={{pointerEvents:'auto',
                      animation:'fighter-in .35s cubic-bezier(0.17,0.67,0.35,1) both',
                      animationDelay:(e.i*0.07)+'s'}}>
                      <LiceoStudent emp={e.emp} onToggle={onToggle} slotIndex={e.i} totalCount={totalCount}/>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

/* ── Liceo date navigator ── */
function LiceoDateNav({ viewDate, setViewDate, navDate, fmtDate, isES, daily, rosterOpen }) {
  const [open,     setOpen]     = React.useState(false);
  const [picked,   setPicked]   = React.useState(false);
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
    setPicked(true);
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
          onClick={function(){ setOpen(function(o){ if (!o) setPicked(false); return !o; }); }}
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
                    className={'dp-cal__day'+(isSel?' dp-cal__day--sel':'')+(isNow&&!picked?' dp-cal__day--today':'')+(isFuture?' dp-cal__day--disabled':'')}
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
              {isES ? 'Personal' : 'Staff'}
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

            <div style={{
              maxHeight: searchQ ? '300px' : '0',
              overflow: 'hidden',
              transition: 'max-height .42s cubic-bezier(0.22,1,0.36,1)'}}>
              <div style={{
                opacity: searchQ ? 1 : 0,
                transform: searchQ ? 'translateY(0)' : 'translateY(-10px)',
                transition: 'opacity .32s ease, transform .4s cubic-bezier(0.22,1,0.36,1)',
                paddingTop:'4px',
                width:'100%',display:'flex',flexDirection:'column',gap:'6px'}}>
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
                </div>
                <div style={{background:'var(--paper)',border:'1px solid var(--ink-100)',
                  borderRadius:'10px',maxHeight:'200px',overflowY:'auto',boxShadow:'var(--shadow-md)'}}>
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
              </div>
            </div>
          </div>

          {totalCount === 0 && (
            <div className="audit-empty" style={{animation:'body-in .2s ease both'}}>
              <Icon name="idCard" size={24} stroke={1.2}/>
              <div className="audit-empty__title">{isES ? 'Sin personal asignado' : 'No staff assigned'}</div>
              <div className="audit-empty__sub">
                {canManage
                  ? (isES ? 'Usa «Agregar» para asignar personal al liceo.' : 'Use «Add» to assign staff to the school.')
                  : (isES ? 'Contacta a un administrador para ser asignado.' : 'Contact an administrator to be assigned.')}
              </div>
            </div>
          )}

          {totalCount > 0 && (
            <div style={{display:'flex',flexDirection:'column'}}>
              {liceoEmployeeObjects.map(function(emp, idx) {
                var present    = !!draft[emp.id];
                var offScene   = idx >= MAX_LICEO_SCENE;
                return (
                  <div key={emp.id} style={{animation:'roster-in .32s cubic-bezier(0.22,1,0.36,1) both',
                    animationDelay: (idx * 0.04) + 's'}}>
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
