/* finca.jsx — Finca Experimental: control diario de asistencia */

const FARM_EMP_KEY   = 'uasd_farm_employees';
const FARM_DAILY_KEY = 'uasd_farm_daily';

function getFarmEmployees() {
  try { return JSON.parse(localStorage.getItem(FARM_EMP_KEY) || '[]'); } catch { return []; }
}
function saveFarmEmployees(list) { localStorage.setItem(FARM_EMP_KEY, JSON.stringify(list)); }
function getFarmDaily() {
  try { return JSON.parse(localStorage.getItem(FARM_DAILY_KEY) || '{}'); } catch { return {}; }
}
function saveFarmDaily(data) { localStorage.setItem(FARM_DAILY_KEY, JSON.stringify(data)); }

/* ── Color helpers ── */
function hexToRgb(h) {
  return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
}
function lerpColor(c1, c2, t) {
  const [r1,g1,b1] = hexToRgb(c1), [r2,g2,b2] = hexToRgb(c2);
  const r = Math.round(r1+(r2-r1)*t), g = Math.round(g1+(g2-g1)*t), b = Math.round(b1+(b2-b1)*t);
  return `rgb(${r},${g},${b})`;
}

/* ── Sky checkpoints (hour → [top, upper, lower, horizon]) ── */
const SKY_CPS = [
  { h:0,    s:['#01050d','#020912','#05101e','#0e1c30'] }, // medianoche
  { h:4.5,  s:['#01050d','#020912','#05101e','#0e1c30'] }, // pre-amanecer
  { h:5.4,  s:['#0c0628','#341248','#b83818','#f07030'] }, // fulgor pre-alba
  { h:6.2,  s:['#1e0e3c','#7838c0','#f07030','#ffc060'] }, // salida del sol
  { h:7.2,  s:['#7ec8f0','#96d4f5','#b4e2f8','#cceee8'] }, // mañana temprana — cielo claro
  { h:9,    s:['#60bce8','#80caf2','#a2d8f6','#beeae0'] }, // mañana
  { h:12,   s:['#48aee0','#66bcea','#88ccf2','#a8dce8'] }, // mediodía — azul vivo
  { h:15,   s:['#58b8e4','#76c4ee','#98d0f4','#b8e0ea'] }, // tarde
  { h:17,   s:['#78b0d8','#a0c0e0','#f4b848','#fcd880'] }, // tarde-dorada
  { h:18,   s:['#c84820','#e87040','#f8a860','#fcd090'] }, // puesta de sol
  { h:18.8, s:['#500c20','#781830','#982840','#c04858'] }, // crepúsculo
  { h:20.5, s:['#01050d','#020912','#05101e','#0e1c30'] }, // noche
  { h:24,   s:['#01050d','#020912','#05101e','#0e1c30'] }, // medianoche
];

function getSkyGradient(h) {
  let p = SKY_CPS[0], n = SKY_CPS[SKY_CPS.length-1];
  for (let i = 0; i < SKY_CPS.length-1; i++) {
    if (h >= SKY_CPS[i].h && h < SKY_CPS[i+1].h) { p = SKY_CPS[i]; n = SKY_CPS[i+1]; break; }
  }
  const t = (h - p.h) / Math.max(n.h - p.h, 0.001);
  const [c0,c1,c2,c3] = p.s.map((c,i) => lerpColor(c, n.s[i], t));
  return `linear-gradient(180deg,${c0} 0%,${c1} 28%,${c2} 60%,${c3} 80%,#3d6b2d 100%)`;
}

function getSunConfig(h) {
  const RISE = 6, SET = 18;
  const t = (h - RISE) / (SET - RISE); // 0=sunrise, 0.5=noon, 1=sunset
  const visible = t >= 0 && t <= 1;
  const arc = Math.max(0, Math.min(1, t));
  const x = 7 + arc * 86;                           // % left → right
  const y = 84 - 72 * Math.sin(arc * Math.PI);      // % horizon → top → horizon
  const heat = 1 - Math.sin(arc * Math.PI);          // 1 at edges (hot/orange), 0 at noon (gold)
  const color = heat > 0.5
    ? lerpColor('#f09030', '#e05018', (heat-0.5)*2)  // naranja → rojo en horizonte
    : lerpColor('#fff8d0', '#f09030', heat*2);        // blanco-amarillo → naranja
  const glow = heat > 0.6
    ? 'rgba(230,100,30,.7)'
    : heat > 0.2
      ? 'rgba(240,180,40,.55)'
      : 'rgba(255,248,200,.45)';
  return { visible, x, y, color, glow };
}

function getMoonConfig(h) {
  const RISE = 19.5, SET = 5.5;
  // Moon rises in evening, sets in morning
  let t;
  if (h >= RISE) t = (h - RISE) / (24 - RISE + SET);
  else if (h <= SET) t = (h + 24 - RISE) / (24 - RISE + SET);
  else return { visible: false };
  const arc = Math.max(0, Math.min(1, t));
  const x = 90 - arc * 80;
  const y = 80 - 65 * Math.sin(arc * Math.PI);
  const alpha = h < 5.5 || h >= 19.5 ? Math.min(1, Math.sin(arc * Math.PI) * 2.5) : 0;
  return { visible: alpha > 0.05, x, y, alpha };
}

const STARS = [
  {x:10,y:7},{x:24,y:13},{x:38,y:5},{x:52,y:10},{x:65,y:6},{x:78,y:12},{x:89,y:8},
  {x:6,y:21},{x:18,y:27},{x:32,y:19},{x:46,y:25},{x:60,y:17},{x:74,y:23},{x:86,y:20},
  {x:14,y:35},{x:42,y:32},{x:70,y:38},{x:93,y:30}
];

function getStarsAlpha(h) {
  if (h >= 20 || h < 4.5) return 0.9;
  if (h < 5.5) return 0.9 - (h - 4.5) * 0.9;
  if (h > 19) return (h - 19) * 0.9;
  return 0;
}

/* ── Farm workers — illustrated SVG people ── */

/*
 * Slots: actividades intercaladas (cada una aparece exactamente 2 veces),
 * con los 5 primeros slots cubriendo el campo de extremo a extremo.
 * Slot 0: junto a la palma izquierda → regar (le echa agua al coco).
 */
const FARM_SLOTS = [
  { left:'7%',  act:'regar'      }, // 1 — riega la mata de coco (palma izq)
  { left:'25%', act:'arar'       }, // 2 — ara el campo izquierdo
  { left:'40%', act:'machetear'  }, // 3 — corta con machete en el centro
  { left:'54%', act:'cargar'  }, // 4 — acarrea por el camino
  { left:'68%', act:'revisar' }, // 5 — revisa cerca del granero
  { left:'17%', act:'sembrar' }, // 6 — siembra izq (relleno)
  { left:'32%', act:'revisar' }, // 7 — revisa centro-izq (relleno)
  { left:'47%', act:'arar'    }, // 8 — ara centro (relleno)
  { left:'61%', act:'regar'   }, // 9 — riega cultivos del centro-der
  { left:'74%', act:'cargar'  }, // 10 — carga hacia el granero
];

const CLOTH_COLS = ['#3a78c0','#b07830','#288858','#a03838','#7048b0'];
const MAX_FARM_SCENE = FARM_SLOTS.length; /* máximo de trabajadores visibles en la escena */

/* ── SVG figure sub-components (viewBox "0 0 44 56") ── */

/* Sombrero vaquero de paja con bandera RD y escudo UASD */
function StrawHat({ cx, cy }) {
  var straw = '#d2b428';
  var dark  = '#a88c18';
  var yt    = cy - 11;        /* tope de la copa */
  var xL    = cx - 7;
  var xR    = cx + 7;
  var xTL   = cx - 5.5;
  var xTR   = cx + 5.5;
  var pts   = ''+xL+','+cy+' '+xR+','+cy+' '+xTR+','+yt+' '+xTL+','+yt;
  /* "U" de UASD — en la zona verde del escudo (cy-7.5 a cy-4.5) */
  var ut    = cy - 7;
  var ub    = cy - 5.4;
  var uPath = 'M'+(cx-2)+','+ut+
              ' L'+(cx-2)+','+ub+
              ' Q'+cx+','+(ub+1.1)+
              ' '+(cx+2)+','+ub+
              ' L'+(cx+2)+','+ut;
  return (
    <g>
      {/* Ala trasera */}
      <ellipse cx={cx} cy={cy} rx="13" ry="3.2" fill={dark}/>
      {/* Copa trapezoidal (más alta para dar espacio a los logos) */}
      <polygon points={pts} fill={straw}/>
      {/* Textura de paja */}
      <line x1={xTL} y1={cy-5.5} x2={xTR} y2={cy-5.5} stroke={dark} strokeWidth=".9" opacity=".5"/>
      <line x1={xTL} y1={cy-8.5} x2={xTR} y2={cy-8.5} stroke={dark} strokeWidth=".9" opacity=".5"/>
      {/* Hundimiento vaquero en el tope */}
      <ellipse cx={cx} cy={yt} rx="5.5" ry="2.2" fill={dark}/>
      {/* === Escudo UASD (franja superior de la copa) === */}
      {/* Fondo verde con borde blanco */}
      <rect x={cx-3} y={cy-9.5} width="6" height="5" rx="1.2"
        fill="#1a7020" stroke="#fff" strokeWidth=".9"/>
      {/* Franja dorada superior */}
      <rect x={cx-3} y={cy-9.5} width="6" height="2" rx=".8" fill="#d4a020"/>
      {/* Letra U en blanco */}
      <path d={uPath} stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      {/* === Cinta bandera RD (inmediatamente debajo del escudo) === */}
      {/* Mitad azul */}
      <rect x={xL}  y={cy-4.5} width="7" height="3.5" rx=".6" fill="#002d62"/>
      {/* Mitad roja */}
      <rect x={cx}  y={cy-4.5} width="7" height="3.5" rx=".6" fill="#cf102e"/>
      {/* Cruz blanca gruesa */}
      <line x1={xL} y1={cy-2.75} x2={xR}    y2={cy-2.75} stroke="#fff" strokeWidth="1.6"/>
      <line x1={cx} y1={cy-4.5}  x2={cx}     y2={cy-1}    stroke="#fff" strokeWidth="1.6"/>
      {/* Ala delantera */}
      <ellipse cx={cx} cy={cy} rx="13" ry="2.6" fill={straw}/>
      <ellipse cx={cx} cy={cy} rx="13" ry="2.6" fill="none" stroke={dark} strokeWidth=".9"/>
    </g>
  );
}

/* Arar — golpea la tierra con azadón */
function FigArar({ s, c, t, p, noHat }) {
  var armAnim = {
    animation: 'w-hoe 2.2s linear infinite',
    animationPlayState: 'running',
    transformBox: 'fill-box', transformOrigin: '30% 15%'
  };
  return (
    <g>
      {!noHat && <StrawHat cx={20} cy={6}/>}
      {/* Cabeza */}
      <circle cx="20" cy="13" r="7" fill={s}/>
      {/* Torso inclinado */}
      <path d="M20,20 Q17,28 15,33" stroke={c} strokeWidth="6" fill="none" strokeLinecap="round"/>
      {/* Piernas */}
      <line x1="15" y1="33" x2="10" y2="47" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="15" y1="33" x2="20" y2="47" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      {/* Pies */}
      <line x1="10" y1="47" x2="5"  y2="52" stroke="#4a2e10" strokeWidth="4" strokeLinecap="round"/>
      <line x1="20" y1="47" x2="25" y2="52" stroke="#4a2e10" strokeWidth="4" strokeLinecap="round"/>
      {/* Brazos + azadón ANIMADOS (pivotan desde hombros) */}
      <g style={armAnim}>
        {/* Brazo izquierdo */}
        <line x1="18" y1="22" x2="8"  y2="32" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        {/* Brazo derecho */}
        <line x1="20" y1="21" x2="30" y2="28" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        {/* Mango del azadón */}
        <line x1="8"  y1="32" x2="32" y2="48" stroke="#8b6030" strokeWidth="3" strokeLinecap="round"/>
        {/* Hoja del azadón */}
        <line x1="26" y1="46" x2="38" y2="48" stroke="#787878" strokeWidth="5" strokeLinecap="round"/>
      </g>
    </g>
  );
}

/* Sembrar — se agacha a plantar un brote */
function FigSembrar({ s, c, t, p, noHat }) {
  var armAnim = {
    animation: 'w-plant 2.8s linear infinite',
    animationPlayState: 'running',
    transformBox: 'fill-box', transformOrigin: '50% 5%'
  };
  return (
    <g>
      {!noHat && <StrawHat cx={14} cy={7}/>}
      {/* Cabeza inclinada */}
      <circle cx="14" cy="15" r="6.5" fill={s}/>
      {/* Torso inclinado hacia adelante */}
      <path d="M14,21 Q18,28 22,32" stroke={c} strokeWidth="6" fill="none" strokeLinecap="round"/>
      {/* Piernas dobladas */}
      <line x1="22" y1="32" x2="16" y2="46" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="22" y1="32" x2="28" y2="44" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="16" y1="46" x2="10" y2="51" stroke="#4a2e10" strokeWidth="4" strokeLinecap="round"/>
      <line x1="28" y1="44" x2="32" y2="50" stroke="#4a2e10" strokeWidth="4" strokeLinecap="round"/>
      {/* Brazo + mano bajando a plantar ANIMADOS */}
      <g style={armAnim}>
        <line x1="14" y1="22" x2="7"  y2="34" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        <line x1="7"  y1="34" x2="6"  y2="42" stroke={s} strokeWidth="3.5" strokeLinecap="round"/>
        {/* Brote en la mano */}
        <circle cx="6"  cy="43" r="2.5" fill="#5a9830"/>
        <path d="M6,40 Q9,36 11,38" stroke="#5a9830" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M6,40 Q3,36 2,38"  stroke="#5a9830" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </g>
      {/* Brazo derecho estático apoyado */}
      <line x1="15" y1="23" x2="24" y2="30" stroke={s} strokeWidth="4" strokeLinecap="round"/>
    </g>
  );
}

/* Regar — vierte agua con regadera */
function FigRegar({ s, c, t, p, noHat }) {
  var canAnim = {
    animation: 'w-pour 3.2s linear infinite',
    animationPlayState: 'running',
    transformBox: 'fill-box', transformOrigin: '15% 40%'
  };
  return (
    <g>
      {!noHat && <StrawHat cx={18} cy={6}/>}
      {/* Cabeza */}
      <circle cx="18" cy="13" r="6.5" fill={s}/>
      {/* Torso */}
      <path d="M18,19 L18,34" stroke={c} strokeWidth="6" strokeLinecap="round"/>
      {/* Brazo izquierdo estático */}
      <line x1="17" y1="23" x2="8" y2="30" stroke={s} strokeWidth="4" strokeLinecap="round"/>
      {/* Piernas */}
      <line x1="18" y1="34" x2="12" y2="48" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="18" y1="34" x2="24" y2="48" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="12" y1="48" x2="7"  y2="53" stroke="#4a2e10" strokeWidth="4" strokeLinecap="round"/>
      <line x1="24" y1="48" x2="29" y2="53" stroke="#4a2e10" strokeWidth="4" strokeLinecap="round"/>
      {/* Brazo derecho + regadera ANIMADOS (pivotan juntos) */}
      <g style={canAnim}>
        {/* Brazo */}
        <line x1="19" y1="22" x2="30" y2="26" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        {/* Regadera (cuerpo) */}
        <rect x="28" y="20" width="12" height="9" rx="3" fill={c}/>
        {/* Asa */}
        <path d="M34,20 Q38,17 38,20" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* Pitorro */}
        <line x1="40" y1="25" x2="46" y2="28" stroke={c} strokeWidth="3" strokeLinecap="round"/>
        {/* Gotas de agua */}
        <line x1="44" y1="30" x2="43" y2="36" stroke="#4898d8" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3"/>
        <line x1="47" y1="29" x2="46" y2="35" stroke="#4898d8" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3"/>
        <line x1="50" y1="28" x2="49" y2="34" stroke="#4898d8" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3"/>
      </g>
    </g>
  );
}

/* Revisar — toma nota en clipboard */
function FigRevisar({ s, c, t, p, female, noHat }) {
  var clipAnim = {
    animation: 'w-inspect 2.6s linear infinite',
    animationPlayState: 'running',
    transformBox: 'fill-box', transformOrigin: '20% 30%'
  };
  return (
    <g>
      {female ? (
        <g>
          {/* Masa base del cabello rizado (detrás de la cabeza) */}
          <ellipse cx="20" cy="9" rx="9.5" ry="6.5" fill="#1a1008"/>
          {/* Cabeza */}
          <circle cx="20" cy="13" r="6.5" fill={s}/>
          {/* Rizos en la corona — círculos que crean la textura de rizo */}
          <circle cx="12" cy="11" r="3.8" fill="#1a1008"/>
          <circle cx="16" cy="6"  r="4"   fill="#1a1008"/>
          <circle cx="20" cy="4"  r="4.2" fill="#1a1008"/>
          <circle cx="24" cy="6"  r="4"   fill="#1a1008"/>
          <circle cx="28" cy="11" r="3.8" fill="#1a1008"/>
          {/* Reflejos suaves en los rizos */}
          <circle cx="13" cy="10" r="1.5" fill="#5a3a20" opacity=".45"/>
          <circle cx="17" cy="6"  r="1.8" fill="#5a3a20" opacity=".45"/>
          <circle cx="21" cy="4"  r="1.8" fill="#5a3a20" opacity=".45"/>
          <circle cx="25" cy="6"  r="1.5" fill="#5a3a20" opacity=".45"/>
          {/* Mechones laterales que caen */}
          <path d="M12,14 Q10,19 13,22" stroke="#1a1008" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
          <path d="M28,14 Q30,19 27,22" stroke="#1a1008" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
          {!noHat && <StrawHat cx={20} cy={4}/>}
        </g>
      ) : (
        <g>
          {!noHat && <StrawHat cx={20} cy={6}/>}
          {/* Cabeza */}
          <circle cx="20" cy="13" r="6.5" fill={s}/>
        </g>
      )}
      {/* Torso */}
      <path d="M20,19 L20,34" stroke={c} strokeWidth="6" strokeLinecap="round"/>
      {/* Brazo izquierdo sostiene portapapeles ANIMADO */}
      <g style={clipAnim}>
        <line x1="18" y1="22" x2="8" y2="28" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        {/* Portapapeles */}
        <rect x="1"  y="22" width="9" height="12" rx="1.5" fill="#fffbe8" stroke="#ccc" strokeWidth="1"/>
        <rect x="4"  y="20" width="4" height="3"  rx="1" fill="#aaa"/>
        <line x1="3"  y1="27" x2="8"  y2="27" stroke="#888" strokeWidth="1"/>
        <line x1="3"  y1="29" x2="8"  y2="29" stroke="#888" strokeWidth="1"/>
        <line x1="3"  y1="31" x2="6"  y2="31" stroke="#888" strokeWidth="1"/>
      </g>
      {/* Brazo derecho con lápiz ANIMADO */}
      <g style={clipAnim}>
        <line x1="21" y1="21" x2="30" y2="25" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        <line x1="28" y1="24" x2="26" y2="33" stroke="#f0c040" strokeWidth="3" strokeLinecap="round"/>
        <line x1="26" y1="33" x2="25" y2="36" stroke="#ffe0a0" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
      {/* Piernas */}
      <line x1="20" y1="34" x2="14" y2="48" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="20" y1="34" x2="26" y2="48" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="14" y1="48" x2="9"  y2="53" stroke="#4a2e10" strokeWidth="4" strokeLinecap="round"/>
      <line x1="26" y1="48" x2="31" y2="53" stroke="#4a2e10" strokeWidth="4" strokeLinecap="round"/>
    </g>
  );
}

/* Machetear — corta vegetación con machete */
function FigMachete({ s, c, t, p, noHat }) {
  var armAnim = {
    animation: 'w-machete 2.2s linear infinite',
    animationPlayState: 'running',
    transformBox: 'fill-box', transformOrigin: '4% 88%'
  };
  return (
    <g>
      {!noHat && <StrawHat cx={20} cy={6}/>}
      {/* Cabeza */}
      <circle cx="20" cy="13" r="6.5" fill={s}/>
      {/* Torso ligeramente inclinado */}
      <path d="M20,19 Q19,27 18,34" stroke={c} strokeWidth="6" fill="none" strokeLinecap="round"/>
      {/* Brazo izquierdo — apoyo hacia abajo */}
      <line x1="18" y1="24" x2="10" y2="33" stroke={s} strokeWidth="4" strokeLinecap="round"/>
      {/* Piernas */}
      <line x1="18" y1="34" x2="12" y2="48" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="18" y1="34" x2="24" y2="48" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="12" y1="48" x2="7"  y2="53" stroke="#4a2e10" strokeWidth="4" strokeLinecap="round"/>
      <line x1="24" y1="48" x2="29" y2="53" stroke="#4a2e10" strokeWidth="4" strokeLinecap="round"/>
      {/* Brazo derecho + machete ANIMADOS */}
      <g style={armAnim}>
        {/* Brazo */}
        <line x1="21" y1="20" x2="33" y2="14" stroke={s} strokeWidth="4" strokeLinecap="round"/>
        {/* Mango del machete */}
        <line x1="31" y1="13" x2="38" y2="9" stroke="#7a4a18" strokeWidth="3.5" strokeLinecap="round"/>
        {/* Guarda del mango */}
        <line x1="35" y1="8" x2="35" y2="14" stroke="#888" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Hoja del machete — trapezoidal, más ancha en la punta */}
        <path d="M38,9 L50,1 L53,6 L40,15Z" fill="#d0d0d0"/>
        {/* Filo superior — brillo metálico */}
        <line x1="38" y1="9" x2="52" y2="2" stroke="#f0f0f0" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Lomo de la hoja (borde grueso) */}
        <line x1="40" y1="15" x2="53" y2="6" stroke="#a0a0a0" strokeWidth="1.8" strokeLinecap="round"/>
      </g>
    </g>
  );
}

/* Cargar — lleva racimo de plátanos al hombro */
function FigCargar({ s, c, t, p, noHat }) {
  var bodyAnim = {
    animation: 'w-carry 1.9s ease-in-out infinite',
    animationPlayState: 'running',
    transformBox: 'fill-box', transformOrigin: '50% 60%'
  };
  return (
    <g style={bodyAnim}>
      {/* Racimo de plátanos encima del hombro */}
      <ellipse cx="28" cy="8"  rx="6"  ry="3.5" fill="#e8c830" opacity=".95"/>
      <ellipse cx="22" cy="10" rx="5.5" ry="3"   fill="#d4b828"/>
      <ellipse cx="32" cy="11" rx="5"   ry="2.8"  fill="#f0d038"/>
      <ellipse cx="26" cy="13" rx="5"   ry="2.5"  fill="#c8a820"/>
      <path d="M28,5 Q30,2 32,4" stroke="#5a8820" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {!noHat && <StrawHat cx={18} cy={9}/>}
      {/* Cabeza */}
      <circle cx="18" cy="17" r="6.5" fill={s}/>
      {/* Brazo derecho alzado sosteniendo el racimo */}
      <line x1="20" y1="24" x2="28" y2="13" stroke={s} strokeWidth="4.5" strokeLinecap="round"/>
      {/* Torso */}
      <path d="M18,23 L18,38" stroke={c} strokeWidth="6" strokeLinecap="round"/>
      {/* Brazo izquierdo bajado */}
      <line x1="16" y1="26" x2="8" y2="34" stroke={s} strokeWidth="4" strokeLinecap="round"/>
      {/* Piernas caminando */}
      <line x1="18" y1="38" x2="12" y2="52" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="18" y1="38" x2="24" y2="50" stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="12" y1="52" x2="7"  y2="56" stroke="#4a2e10" strokeWidth="4" strokeLinecap="round"/>
      <line x1="24" y1="50" x2="29" y2="55" stroke="#4a2e10" strokeWidth="4" strokeLinecap="round"/>
    </g>
  );
}

function FarmWorker({ emp, present, onToggle, delay, slotIndex, totalCount, noHat }) {
  const slot      = FARM_SLOTS[slotIndex % FARM_SLOTS.length];
  const isFemale  = emp.gender === 'F';
  const act       = isFemale ? 'revisar' : slot.act;
  const sz        = totalCount > 9 ? 24 : totalCount > 6 ? 28 : totalCount > 4 ? 32 : 36;
  const skin      = '#d4956a';
  const cloth     = CLOTH_COLS[slotIndex % CLOTH_COLS.length];
  const hat       = '#c8a050';
  const firstName = emp.name.split(' ')[0];

  return (
    <div onClick={() => onToggle(emp.id)} title={emp.name}
      role="switch" aria-checked={present} tabIndex={0} aria-label={emp.name}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle(emp.id); } }}
      style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',
        cursor:'pointer',userSelect:'none'}}>
      <svg width={sz} height={Math.round(sz*1.27)} viewBox="0 0 44 56"
        style={{overflow:'visible'}}>
        {act === 'arar'       && <FigArar     s={skin} c={cloth} t={hat} p={present} noHat={noHat}/>}
        {act === 'sembrar'    && <FigSembrar  s={skin} c={cloth} t={hat} p={present} noHat={noHat}/>}
        {act === 'machetear'  && <FigMachete  s={skin} c={cloth} t={hat} p={present} noHat={noHat}/>}
        {act === 'regar'      && <FigRegar    s={skin} c={cloth} t={hat} p={present} noHat={noHat}/>}
        {act === 'revisar'    && <FigRevisar  s={skin} c={cloth} t={hat} p={present} female={isFemale} noHat={noHat}/>}
        {act === 'cargar'     && <FigCargar   s={skin} c={cloth} t={hat} p={present} noHat={noHat}/>}
      </svg>
    </div>
  );
}

/* ── Avión vinilado con bandera RD ── */
function DomPlane() {
  return (
    <div style={{
      position:'absolute', top:'15%',
      pointerEvents:'none', zIndex:8,
      animation:'planeFly 1800s linear infinite',
      animationDelay:'10s', animationFillMode:'backwards',
    }}>
      <svg width="115" height="40" viewBox="0 0 115 40"
        style={{overflow:'visible', filter:'drop-shadow(0 3px 10px rgba(0,0,0,.45))'}}>
        <defs>
          <clipPath id="dp-fuse">
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
        <g clipPath="url(#dp-fuse)">
          {/* Azul: cuadrante superior-izq y inferior-der */}
          <rect x="0"  y="0"  width="58" height="20" fill="#002D62"/>
          <rect x="58" y="20" width="115" height="40" fill="#002D62"/>
          {/* Rojo: cuadrante superior-der y inferior-izq */}
          <rect x="58" y="0"  width="115" height="20" fill="#CF142B"/>
          <rect x="0"  y="20" width="58"  height="40" fill="#CF142B"/>
          {/* Cruz blanca */}
          <rect x="0"  y="18" width="115" height="4"  fill="white"/>
          <rect x="55" y="0"  width="6"   height="40" fill="white"/>
        </g>

        {/* Contorno del fuselaje */}
        <path d="M8,20 Q18,11 30,11 L88,11 Q103,11 107,20 Q103,29 88,29 L30,29 Q18,29 8,20Z"
          fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1"/>

        {/* Nickname — livery del ala, estilo aerolínea */}
        <text x="53" y="34" textAnchor="middle"
          fontSize="6.5" fontFamily="var(--font-sans)" fontWeight="900"
          fill="rgba(0,0,0,.92)"
          stroke="rgba(255,255,255,.4)" strokeWidth="0.6" paintOrder="stroke fill"
          letterSpacing="0.9"
          transform="rotate(-8,53,34)">@_09pavo</text>

        {/* Ventanillas */}
        {[34,43,52,66,75,84,93].map(x => (
          <circle key={x} cx={x} cy={16} r="2" fill="rgba(190,228,255,.85)"/>
        ))}

        {/* Toque de luz en la nariz */}
        <path d="M98,14 Q107,16 109,20" stroke="rgba(255,255,255,.3)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}



/* ── Animated farm scene ── */
function FarmScene({ workers, dayRecords, onToggle, presentCount, absentCount, totalCount, isES, viewDate }) {
  const [clock, setClock] = React.useState(function() { return new Date(); });
  React.useEffect(function() {
    var intervalId;
    /* Espera al próximo cambio de minuto para alinear el intervalo al reloj */
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

  const isDay   = hours >= 6.5 && hours < 19;
  const isNight = hours >= 19  || hours < 6;

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
      {starAlpha > 0 && STARS.map((s,i) => (
        <div key={i} style={{position:'absolute',left:`${s.x}%`,top:`${s.y}%`,
          width:i%3===0?'2.5px':'1.5px',height:i%3===0?'2.5px':'1.5px',
          borderRadius:'50%',background:'#fff',
          opacity:starAlpha*(0.5+(i%4)*0.14),transition:'opacity 90s linear',
          animation:`sunGlow ${2+i*0.35}s ease-in-out infinite`}}/>
      ))}

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

      {/* Sun — grande y brillante */}
      {sun.visible && (
        <div style={{position:'absolute',left:`${sun.x}%`,top:`${sun.y}%`,
          transform:'translate(-50%,-50%)',transition:'left 90s linear,top 90s linear',
          pointerEvents:'none'}}>
          {/* Halo exterior difuso */}
          <div style={{position:'absolute',top:'50%',left:'50%',
            transform:'translate(-50%,-50%)',
            width:'90px',height:'90px',borderRadius:'50%',
            background:`radial-gradient(circle,${sun.glow} 0%,transparent 70%)`,
            opacity:.55}}/>
          {/* Halo medio */}
          <div style={{position:'absolute',top:'50%',left:'50%',
            transform:'translate(-50%,-50%)',
            width:'58px',height:'58px',borderRadius:'50%',
            background:`radial-gradient(circle,${sun.glow.replace(/[\d.]+\)$/,'0.7)')} 0%,transparent 70%)`,
            opacity:.7}}/>
          {/* Disco solar */}
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

      {/* Avión vinilado — bandera RD */}
      <DomPlane/>

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

      {/* Palma izquierda */}
      <svg style={{position:'absolute',bottom:'113px',left:'6%',width:'60px',height:'110px',overflow:'visible'}}
        viewBox="0 0 60 110">
        {/* Tronco */}
        <path d="M30,110 Q28,85 32,60 Q29,40 30,10" stroke="#8b6340" strokeWidth="5" fill="none" strokeLinecap="round"/>
        {/* Hojas */}
        <path d="M30,12 Q10,-8 -8,2" stroke="#4a9830" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M30,12 Q50,-6 64,6" stroke="#5aaa38" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M30,14 Q14,4 4,18" stroke="#42882a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M30,14 Q46,5 56,20" stroke="#4a9028" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M30,16 Q18,20 14,34" stroke="#3a7820" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M30,16 Q42,22 46,36" stroke="#429020" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Cocos — racimo bajo las hojas */}
        {/* Coco 1 — izquierda */}
        <g transform="translate(23,21) scale(0.65)">
          <path d="M0,-7 C6,-6 8,1 7,6 C6,10 3,12 0,12 C-3,12 -6,10 -7,6 C-8,1 -6,-6 0,-7Z" fill="#3d7018"/>
          <path d="M0,-7 C6,-6 8,1 7,6 C6,10 3,12 0,12 C-3,12 -6,10 -7,6 C-8,1 -6,-6 0,-7Z" fill="none" stroke="#2a5010" strokeWidth="1.2"/>
          <path d="M-3,-4 C-1,-6 2,-6 4,-4" stroke="#5a9828" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
          <path d="M-5,2 C-4,0 -2,-1 0,-1" stroke="#4a8820" strokeWidth="1" fill="none" strokeLinecap="round"/>
          <ellipse cx="1" cy="7" rx="3.5" ry="2" fill="rgba(0,0,0,.18)"/>
          <circle cx="0" cy="-7" r="1.2" fill="#5a3a10"/>
        </g>
        {/* Coco 2 — derecha */}
        <g transform="translate(33,19) scale(0.65)">
          <path d="M0,-7 C6,-6 8,1 7,6 C6,10 3,12 0,12 C-3,12 -6,10 -7,6 C-8,1 -6,-6 0,-7Z" fill="#4a8020"/>
          <path d="M0,-7 C6,-6 8,1 7,6 C6,10 3,12 0,12 C-3,12 -6,10 -7,6 C-8,1 -6,-6 0,-7Z" fill="none" stroke="#2a5010" strokeWidth="1.2"/>
          <path d="M-3,-4 C-1,-6 2,-6 4,-4" stroke="#6aaa30" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
          <path d="M-5,2 C-4,0 -2,-1 0,-1" stroke="#5a9820" strokeWidth="1" fill="none" strokeLinecap="round"/>
          <ellipse cx="1" cy="7" rx="3.5" ry="2" fill="rgba(0,0,0,.18)"/>
          <circle cx="0" cy="-7" r="1.2" fill="#5a3a10"/>
        </g>
        {/* Coco 3 — centro abajo */}
        <g transform="translate(28,27) scale(0.65)">
          <path d="M0,-6 C5,-5 7,1 6,5 C5,9 3,11 0,11 C-3,11 -5,9 -6,5 C-7,1 -5,-5 0,-6Z" fill="#558a25"/>
          <path d="M0,-6 C5,-5 7,1 6,5 C5,9 3,11 0,11 C-3,11 -5,9 -6,5 C-7,1 -5,-5 0,-6Z" fill="none" stroke="#2a5010" strokeWidth="1.2"/>
          <path d="M-2,-3 C-1,-5 2,-5 3,-3" stroke="#70b835" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
          <ellipse cx="0" cy="6" rx="3" ry="1.8" fill="rgba(0,0,0,.18)"/>
          <circle cx="0" cy="-6" r="1.1" fill="#5a3a10"/>
        </g>
        {/* Coco 4 — extra izq arriba */}
        <g transform="translate(18,24) scale(0.65)">
          <path d="M0,-5.5 C4.5,-4.5 6,1 5.5,4.5 C5,8 2.5,10 0,10 C-2.5,10 -5,8 -5.5,4.5 C-6,1 -4.5,-4.5 0,-5.5Z" fill="#3a6815"/>
          <path d="M0,-5.5 C4.5,-4.5 6,1 5.5,4.5 C5,8 2.5,10 0,10 C-2.5,10 -5,8 -5.5,4.5 C-6,1 -4.5,-4.5 0,-5.5Z" fill="none" stroke="#2a5010" strokeWidth="1.1"/>
          <path d="M-2,-3 C0,-5 2.5,-4 3,-2" stroke="#528a22" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <ellipse cx="0" cy="6" rx="2.8" ry="1.6" fill="rgba(0,0,0,.18)"/>
          <circle cx="0" cy="-5.5" r="1" fill="#5a3a10"/>
        </g>
      </svg>

      {/* Palma derecha (pequeña, detrás del granero) */}
      <svg style={{position:'absolute',bottom:'113px',right:'18%',width:'44px',height:'80px',overflow:'visible'}}
        viewBox="0 0 44 80">
        <path d="M22,80 Q20,60 24,42 Q21,26 22,8" stroke="#7a5530" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M22,10 Q8,-5 -4,4" stroke="#4a9830" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M22,10 Q36,-4 46,5" stroke="#5aaa38" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M22,12 Q10,6 4,18" stroke="#42882a" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M22,12 Q34,7 40,20" stroke="#4a9028" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Cocos — racimo pequeño palma derecha */}
        {/* Coco A — izquierda */}
        <g transform="translate(17,17) scale(0.65)">
          <path d="M0,-6 C5,-5 7,1 6,5 C5,8 3,10 0,10 C-3,10 -5,8 -6,5 C-7,1 -5,-5 0,-6Z" fill="#3d7018"/>
          <path d="M0,-6 C5,-5 7,1 6,5 C5,8 3,10 0,10 C-3,10 -5,8 -6,5 C-7,1 -5,-5 0,-6Z" fill="none" stroke="#2a5010" strokeWidth="1.1"/>
          <path d="M-2.5,-3 C-1,-5 2,-5 3.5,-3" stroke="#5a9828" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <ellipse cx="0" cy="6" rx="3" ry="1.6" fill="rgba(0,0,0,.18)"/>
          <circle cx="0" cy="-6" r="1" fill="#5a3a10"/>
        </g>
        {/* Coco B — derecha */}
        <g transform="translate(25,15) scale(0.65)">
          <path d="M0,-6 C5,-5 7,1 6,5 C5,8 3,10 0,10 C-3,10 -5,8 -6,5 C-7,1 -5,-5 0,-6Z" fill="#4a8020"/>
          <path d="M0,-6 C5,-5 7,1 6,5 C5,8 3,10 0,10 C-3,10 -5,8 -6,5 C-7,1 -5,-5 0,-6Z" fill="none" stroke="#2a5010" strokeWidth="1.1"/>
          <path d="M-2.5,-3 C-1,-5 2,-5 3.5,-3" stroke="#6aaa30" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <ellipse cx="0" cy="6" rx="3" ry="1.6" fill="rgba(0,0,0,.18)"/>
          <circle cx="0" cy="-6" r="1" fill="#5a3a10"/>
        </g>
        {/* Coco C — centro abajo */}
        <g transform="translate(21,21) scale(0.65)">
          <path d="M0,-5.5 C4,-4.5 5.5,1 5,4.5 C4.5,7.5 2.5,9 0,9 C-2.5,9 -4.5,7.5 -5,4.5 C-5.5,1 -4,-4.5 0,-5.5Z" fill="#558a25"/>
          <path d="M0,-5.5 C4,-4.5 5.5,1 5,4.5 C4.5,7.5 2.5,9 0,9 C-2.5,9 -4.5,7.5 -5,4.5 C-5.5,1 -4,-4.5 0,-5.5Z" fill="none" stroke="#2a5010" strokeWidth="1.1"/>
          <path d="M-2,-3 C-1,-4.5 1.5,-4.5 3,-3" stroke="#70b835" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <ellipse cx="0" cy="5.5" rx="2.6" ry="1.5" fill="rgba(0,0,0,.18)"/>
          <circle cx="0" cy="-5.5" r="1" fill="#5a3a10"/>
        </g>
      </svg>

      {/* Granero (casita) */}
      <svg style={{position:'absolute',bottom:'113px',right:'5%',width:'88px',height:'90px',overflow:'visible'}}
        viewBox="0 0 88 90">
        {/* Techo */}
        <polygon points="0,38 44,0 88,38" fill="#8b3a22"/>
        <polygon points="4,38 44,4 84,38" fill="#a84830"/>
        {/* Frente */}
        <rect x="6" y="38" width="76" height="52" fill="#c45c3a"/>
        {/* Sombra lateral */}
        <rect x="6" y="38" width="12" height="52" fill="rgba(0,0,0,.15)"/>
        {/* Puerta */}
        <rect x="30" y="58" width="28" height="32" rx="3" fill="#6a2815"/>
        <rect x="43" y="58" width="2" height="32" fill="rgba(0,0,0,.2)"/>
        {/* Ventanas */}
        <rect x="10" y="46" width="14" height="12" rx="2" fill="#d4a870"/>
        <line x1="17" y1="46" x2="17" y2="58" stroke="rgba(0,0,0,.25)" strokeWidth="1"/>
        <line x1="10" y1="52" x2="24" y2="52" stroke="rgba(0,0,0,.25)" strokeWidth="1"/>
        <rect x="64" y="46" width="14" height="12" rx="2" fill="#d4a870"/>
        <line x1="71" y1="46" x2="71" y2="58" stroke="rgba(0,0,0,.25)" strokeWidth="1"/>
        <line x1="64" y1="52" x2="78" y2="52" stroke="rgba(0,0,0,.25)" strokeWidth="1"/>

      </svg>

{/* Cultivos — grama central */}
      <div style={{position:'absolute',bottom:'115px',left:'18%',right:'28%',height:'52px',
        display:'flex',alignItems:'flex-end',gap:'4px',overflow:'hidden',pointerEvents:'none'}}>
        {Array.from({length:28}).map((_,i) => (
          <div key={i} style={{
            flexShrink:0,
            width:'5px',height:`${16+(i%5)*7}px`,
            background:`rgba(58,140,40,${0.6+(i%3)*.2})`,
            borderRadius:'3px 3px 0 0',transformOrigin:'bottom center',
            animation:`cropSway ${1.3+(i%5)*.38}s ease-in-out infinite`,
            animationDelay:`${(i%7)*.17}s`}}/>
        ))}
      </div>

      {/* Suelo / campo */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'116px',
        background:'linear-gradient(180deg,#3a6a28 0%,#2a5018 40%,#1e3c12 75%,#162e0e 100%)'}}/>

      {/* Camino de tierra */}
      <div style={{position:'absolute',bottom:0,left:'44%',right:'30%',height:'90px',
        background:'linear-gradient(180deg,rgba(140,110,60,.35) 0%,rgba(160,120,65,.55) 100%)',
        clipPath:'polygon(30% 0%,70% 0%,100% 100%,0% 100%)'}}/>

      {/* Cerca con puerta abierta — bajada al nivel del campo */}
      <svg style={{position:'absolute',bottom:'65px',left:0,width:'100%',height:'42px',
        overflow:'visible',pointerEvents:'none',zIndex:4}}
        viewBox="0 0 800 42" preserveAspectRatio="none">

        {/* Rieles izquierdos (hasta la puerta) */}
        <line x1="0"   y1="13" x2="397" y2="13" stroke="#8b6e44" strokeWidth="2.8" opacity=".88" vectorEffect="non-scaling-stroke"/>
        <line x1="0"   y1="27" x2="397" y2="27" stroke="#8b6e44" strokeWidth="2.2" opacity=".78" vectorEffect="non-scaling-stroke"/>
        {/* Rieles derechos (desde la puerta) */}
        <line x1="517" y1="13" x2="800" y2="13" stroke="#8b6e44" strokeWidth="2.8" opacity=".88" vectorEffect="non-scaling-stroke"/>
        <line x1="517" y1="27" x2="800" y2="27" stroke="#8b6e44" strokeWidth="2.2" opacity=".78" vectorEffect="non-scaling-stroke"/>

        {/* Posts normales — saltamos la zona de la puerta (x 332–524) */}
        {Array.from({length:17}).map((_,i) => {
          var x = i*50+4;
          if (x >= 332 && x <= 524) return null;
          return <rect key={i} x={x} y="5" width="7" height="34" rx="2" fill="#7a5c34" opacity=".9"/>;
        })}

        {/* ── Puerta de establo ── */}

        {/* Poste izquierdo (bisagra) */}
        <rect x="389" y="-4" width="11" height="50" rx="2" fill="#7a5c34" opacity=".95"/>
        <rect x="390" y="-4" width="3"  height="50" rx="1" fill="#b09060" opacity=".28"/>

        {/* Poste derecho (latch) */}
        <rect x="513" y="-4" width="11" height="50" rx="2" fill="#7a5c34" opacity=".95"/>
        <rect x="514" y="-4" width="3"  height="50" rx="1" fill="#b09060" opacity=".28"/>

        {(function() {
          var gateOpen = !(isNight || totalCount === 0);
          var ease = 'transform .75s cubic-bezier(0.4,0,0.2,1), opacity .55s ease';
          return (
            <g>
              {/* Panel CERRADO — pivota desde la bisagra izquierda al abrir */}
              <g style={{
                transform: gateOpen
                  ? 'perspective(300px) rotateY(88deg)'
                  : 'perspective(300px) rotateY(0deg)',
                transformBox: 'fill-box',
                transformOrigin: 'left center',
                transition: ease,
                opacity: gateOpen ? 0 : 1
              }}>
                <rect x="400" y="-4" width="113" height="50" fill="#8b6e44"/>
                <rect x="400" y="-4" width="9"   height="50" fill="#5a4020" opacity=".3"/>
                <line x1="400" y1="9"  x2="513" y2="9"  stroke="#6a5030" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>
                <line x1="400" y1="18" x2="513" y2="18" stroke="#6a5030" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>
                <line x1="400" y1="27" x2="513" y2="27" stroke="#6a5030" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>
                <line x1="400" y1="36" x2="513" y2="36" stroke="#6a5030" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>
                <line x1="402" y1="46" x2="511" y2="2" stroke="#5a4020" strokeWidth="3" strokeLinecap="round" opacity=".82" vectorEffect="non-scaling-stroke"/>
                <rect x="396" y="4"  width="10" height="6" rx="1.5" fill="#888" opacity=".9"/>
                <rect x="396" y="31" width="10" height="6" rx="1.5" fill="#888" opacity=".9"/>
                <circle cx="401" cy="7"  r="2" fill="#555" opacity=".75"/>
                <circle cx="401" cy="34" r="2" fill="#555" opacity=".75"/>
                <rect x="448" y="14" width="14" height="12" rx="2.5" fill="#b8982a"/>
                <path d="M451,14 Q451,8 455,8 Q459,8 459,14" fill="none" stroke="#b8982a" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="455" cy="20" r="2.5" fill="#7a6010"/>
                <rect x="454" y="20" width="2" height="4" rx="1" fill="#7a6010"/>
              </g>
              {/* Panel ABIERTO — doblado contra el poste, entra desde la bisagra */}
              <g style={{
                transform: gateOpen
                  ? 'perspective(300px) rotateY(0deg)'
                  : 'perspective(300px) rotateY(-88deg)',
                transformBox: 'fill-box',
                transformOrigin: 'right center',
                transition: ease,
                opacity: gateOpen ? 1 : 0
              }}>
                <line x1="332" y1="13" x2="389" y2="13" stroke="#8b6e44" strokeWidth="2.8" opacity=".88" vectorEffect="non-scaling-stroke"/>
                <line x1="332" y1="27" x2="389" y2="27" stroke="#8b6e44" strokeWidth="2.2" opacity=".78" vectorEffect="non-scaling-stroke"/>
                <rect x="354" y="5" width="7" height="34" rx="2" fill="#7a5c34" opacity=".9"/>
                <rect x="354" y="5" width="2" height="34" rx="1" fill="#b09060" opacity=".22"/>
                <rect x="385" y="7"  width="10" height="5" rx="1.5" fill="#888" opacity=".9"/>
                <rect x="385" y="29" width="10" height="5" rx="1.5" fill="#888" opacity=".9"/>
                <circle cx="390" cy="9.5"  r="1.8" fill="#555" opacity=".75"/>
                <circle cx="390" cy="31.5" r="1.8" fill="#555" opacity=".75"/>
              </g>
            </g>
          );
        })()}
      </svg>

      {/* Tractor de frente diagonal — mismo estilo que el granero */}
      <svg style={{position:'absolute',bottom:'0',right:'2%',
        width:'88px',height:'78px',
        pointerEvents:'none',zIndex:5,overflow:'visible',
        transform:'perspective(320px) rotateY(-28deg)',
        transformOrigin:'50% 50%'}}
        viewBox="0 0 88 78">

        {/* ── Rueda trasera IZQUIERDA (grande) ── */}
        <circle cx="14" cy="61" r="14" fill="#181818"/>
        <circle cx="14" cy="61" r="11" fill="#282828"/>
        <circle cx="14" cy="61" r="4"  fill="#555"/>
        <line x1="14" y1="47" x2="14" y2="75" stroke="#3a3a3a" strokeWidth="2"/>
        <line x1="0"  y1="61" x2="28" y2="61" stroke="#3a3a3a" strokeWidth="2"/>
        <line x1="4"  y1="51" x2="24" y2="71" stroke="#3a3a3a" strokeWidth="2"/>
        <line x1="24" y1="51" x2="4"  y2="71" stroke="#3a3a3a" strokeWidth="2"/>

        {/* ── Rueda trasera DERECHA (grande) ── */}
        <circle cx="74" cy="61" r="14" fill="#181818"/>
        <circle cx="74" cy="61" r="11" fill="#282828"/>
        <circle cx="74" cy="61" r="4"  fill="#555"/>
        <line x1="74" y1="47" x2="74" y2="75" stroke="#3a3a3a" strokeWidth="2"/>
        <line x1="60" y1="61" x2="88" y2="61" stroke="#3a3a3a" strokeWidth="2"/>
        <line x1="64" y1="51" x2="84" y2="71" stroke="#3a3a3a" strokeWidth="2"/>
        <line x1="84" y1="51" x2="64" y2="71" stroke="#3a3a3a" strokeWidth="2"/>

        {/* ── Guardabarros sobre ruedas traseras ── */}
        <path d="M2,47 Q4,30 14,28 Q27,28 28,46Z" fill="#c83028"/>
        <path d="M60,46 Q61,28 74,28 Q86,28 86,47Z" fill="#c83028"/>

        {/* ── Tope del capó — perspectiva diagonal (como el techo del granero) ── */}
        <path d="M22,30 L66,30 L62,22 L26,22Z" fill="#d83a30"/>

        {/* ── Cara frontal del capó / grille ── */}
        <rect x="22" y="30" width="44" height="18" rx="1.5" fill="#b82820"/>
        <line x1="23" y1="35" x2="65" y2="35" stroke="#8a1a10" strokeWidth="1.5"/>
        <line x1="23" y1="40" x2="65" y2="40" stroke="#8a1a10" strokeWidth="1.5"/>
        <line x1="23" y1="45" x2="65" y2="45" stroke="#8a1a10" strokeWidth="1.5"/>

        {/* Faros */}
        <circle cx="29" cy="46" r="4.5" fill="#ffe870" opacity=".92"/>
        <circle cx="29" cy="46" r="2.8" fill="#fff"    opacity=".75"/>
        <circle cx="59" cy="46" r="4.5" fill="#ffe870" opacity=".92"/>
        <circle cx="59" cy="46" r="2.8" fill="#fff"    opacity=".75"/>

        {/* ── Sombra lateral derecha del capó (da el efecto diagonal) ── */}
        <rect x="60" y="22" width="8" height="26" rx="1" fill="rgba(0,0,0,.24)"/>

        {/* ── Tope de la cabina — perspectiva diagonal ── */}
        <path d="M22,8 L66,8 L62,2 L26,2Z" fill="#c83028"/>

        {/* ── Cara frontal de la cabina ── */}
        <rect x="22" y="8"  width="44" height="24" rx="2" fill="#aa2418"/>
        {/* Ventana bipartita */}
        <rect x="24" y="10" width="40" height="16" rx="1.5" fill="#78c8ea" opacity=".9"/>
        <line x1="44" y1="10" x2="44" y2="26" stroke="#8a1a10" strokeWidth="1.5"/>
        <line x1="24" y1="18" x2="64" y2="18" stroke="#8a1a10" strokeWidth="1"/>

        {/* ── Sombra lateral derecha de la cabina ── */}
        <rect x="60" y="2"  width="8" height="30" rx="1" fill="rgba(0,0,0,.24)"/>

        {/* ── ROPS barra de seguridad ── */}
        <rect x="20" y="2"  width="42" height="8"  rx="2" fill="#881a10"/>
        <rect x="20" y="2"  width="3"  height="12" rx="1" fill="#7a1808"/>
        <rect x="59" y="2"  width="3"  height="12" rx="1" fill="#7a1808"/>

        {/* ── Escape vertical (derecha, sale del tope de la cabina) ── */}
        <rect x="60" y="-9" width="5" height="22" rx="2.5" fill="#484848"/>
        <ellipse cx="62.5" cy="-10" rx="4" ry="2.2" fill="#383838"/>
        <circle cx="62"  cy="-13" r="3"   fill="#ddd" opacity=".28"/>
        <circle cx="65"  cy="-16" r="2"   fill="#ddd" opacity=".16"/>

        {/* ── Ruedas delanteras pequeñas ── */}
        <circle cx="33" cy="66" r="9.5" fill="#181818"/>
        <circle cx="33" cy="66" r="7.5" fill="#282828"/>
        <circle cx="33" cy="66" r="3"   fill="#555"/>
        <circle cx="55" cy="66" r="9.5" fill="#181818"/>
        <circle cx="55" cy="66" r="7.5" fill="#282828"/>
        <circle cx="55" cy="66" r="3"   fill="#555"/>
      </svg>

      {/* Trabajadores — cada uno en su zona de la escena */}
      {totalCount > 0 && (
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,pointerEvents:'none',zIndex:3}}>
          {workers.map((emp,i) => {
            if (!dayRecords[emp.id]) return null;
            var slot = FARM_SLOTS[i % FARM_SLOTS.length];
            return (
              <div key={emp.id} style={{position:'absolute',left:slot.left,bottom:'113px',
                transform:'translateX(-50%)',display:'flex',flexDirection:'column',
                alignItems:'center',pointerEvents:'auto'}}>
                <div style={{
                  animation:'fighter-in .35s cubic-bezier(0.17,0.67,0.35,1) both',
                  animationDelay: (i * 0.07) + 's'}}>
                  <FarmWorker emp={emp} present={true}
                    onToggle={onToggle} delay={i} slotIndex={i} totalCount={totalCount}
                    noHat={isNight}/>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Farm date navigator with calendar popup ── */
function FarmDateNav({ viewDate, setViewDate, navDate, fmtDate, isES, daily, rosterOpen }) {
  const [open,     setOpen]     = React.useState(false);
  const [picked,   setPicked]   = React.useState(false);
  const [calReady, setCalReady] = React.useState(false);
  const [calPos,   setCalPos]   = React.useState({ top: 0, centerX: 0 });
  const navRef  = React.useRef(null); /* fila completa ‹ fecha › — ancla para centrar */
  const trigRef = React.useRef(null); /* solo el pill — para outside-click */
  const calRef  = React.useRef(null); /* popup */
  const today = new Date().toLocaleDateString('en-CA');

  const parseISO = (iso) => {
    var p = iso.split('-').map(Number);
    return { y: p[0], m: p[1]-1, d: p[2] };
  };
  var sel = parseISO(viewDate);
  var now = parseISO(today);

  const [month, setMonth] = React.useState(sel.m);
  const [year,  setYear]  = React.useState(sel.y);

  React.useEffect(function() {
    var p = parseISO(viewDate);
    setMonth(p.m); setYear(p.y);
  }, [viewDate]);

  /* Centra el popup bajo la fila ‹ fecha ›. */
  const computePos = function() {
    var trig = trigRef.current;
    if (!trig) return;
    var tr    = trig.getBoundingClientRect();
    var panel = trig.closest('.act-panel');
    var rawX;
    if (panel) {
      var pr = panel.getBoundingClientRect();
      rawX = pr.left + pr.width / 2;
    } else {
      rawX = tr.left + tr.width / 2;
    }
    var calW    = 284;
    var half    = calW / 2;
    var centerX = Math.max(half + 8, Math.min(rawX, window.innerWidth - half - 8));
    setCalPos({ top: tr.bottom + 8, centerX: centerX });
  };

  /* Calcula posición en useEffect — getBoundingClientRect corre DESPUÉS del
     commit de React, no durante el click, evitando el reflow síncrono que
     causaba el salto de 1px en la escena de la finca */
  React.useEffect(function() {
    if (open) {
      computePos();
      setCalReady(true);
    } else {
      setCalReady(false);
    }
  }, [open]);


  /* Reposiciona el calendario siguiendo la transición del panel */
  var trackTransition = React.useCallback(function(duration) {
    var start = Date.now();
    var tick = function() {
      computePos();
      if (Date.now() - start < duration) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  React.useEffect(function() {
    if (!open) return;
    trackTransition(420); /* roster: .38s */
  }, [rosterOpen]);

  React.useEffect(function() {
    if (!open) return;
    var panel = document.querySelector('.admin-panel');
    if (!panel) return;
    var mo = new MutationObserver(function() { trackTransition(480); }); /* sidebar: .44s */
    mo.observe(panel, { attributes: true, attributeFilter: ['class'] });
    return function() { mo.disconnect(); };
  }, [open]);


  /* Cierra con clic fuera o Escape */
  React.useEffect(function() {
    if (!open) return;
    var onMouse = function(e) {
      if (trigRef.current && !trigRef.current.contains(e.target) &&
          calRef.current  && !calRef.current.contains(e.target))
        setOpen(false);
    };
    var onKey = function(e) { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown',   onKey);
    return function() {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('keydown',   onKey);
    };
  }, [open]);

  React.useEffect(function() {
    if (!open) return;
    var onResize = function() { computePos(); };
    window.addEventListener('resize', onResize);
    return function() { window.removeEventListener('resize', onResize); };
  }, [open]);

  var DOW = ['L','M','X','J','V','S','D'];
  var firstDow    = (new Date(year, month, 1).getDay() + 6) % 7;
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var prevMo   = function() { month === 0  ? (setMonth(11), setYear(function(y){ return y-1; })) : setMonth(function(m){ return m-1; }); };
  var nextMo   = function() { month === 11 ? (setMonth(0),  setYear(function(y){ return y+1; })) : setMonth(function(m){ return m+1; }); };
  var prevYear = function() { setYear(function(y){ return y-1; }); };
  var nextYear = function() { setYear(function(y){ return y+1; }); };

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
    /* onMouseDown:preventDefault en el contenedor raíz evita que cualquier
       botón interior reciba focus y dispare scroll de página */
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
            border:'1.5px solid '+(open ? '#4a6fa5' : 'var(--ink-200,#ddd)'),
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
        /* Siempre montado: la capa compositor existe antes de que open sea true,
           así no hay recomposición de capas cuando se abre el calendario → sin salto. */
        <div onMouseDown={function(e){ if (open) e.preventDefault(); }}
          style={{position:'fixed',top:calPos.top,left:calPos.centerX,
                  transform:'translateX(-50%)',zIndex:9999,
                  pointerEvents: (open && calReady) ? 'auto' : 'none',
                  visibility: (open && calReady) ? 'visible' : 'hidden'}}>
          <div ref={calRef} className="dp-cal"
            style={{boxShadow:'0 16px 48px rgba(0,0,0,.18)',
              animation:(open && calReady)?'dp-open-vac 0.25s cubic-bezier(0.16,1,0.3,1) both':'none'}}>
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

/* Devuelve un draft {empId: true} con los empleados cuyo horario cubre el momento actual */
function getScheduledPresence(farmEmpObjects) {
  var now      = new Date();
  var todayDay = now.getDay();
  var nowMin   = now.getHours() * 60 + now.getMinutes();
  var result   = {};
  farmEmpObjects.forEach(function(emp) {
    if (!emp || !emp.schedule || !emp.workDays) return;
    if (emp.workDays.indexOf(todayDay) === -1) return;
    var sep = emp.schedule.indexOf('—');
    if (sep === -1) sep = emp.schedule.indexOf('–');
    if (sep === -1) return;
    var startStr = emp.schedule.substring(0, sep).trim();
    var endStr   = emp.schedule.substring(sep + 1).trim();
    var sM = /(\d+):(\d+)\s*(AM|PM)/i.exec(startStr);
    var eM = /(\d+):(\d+)\s*(AM|PM)/i.exec(endStr);
    if (!sM || !eM) return;
    var sH = parseInt(sM[1]) % 12;
    if (sM[3].toUpperCase() === 'PM') sH += 12;
    var eH = parseInt(eM[1]) % 12;
    if (eM[3].toUpperCase() === 'PM') eH += 12;
    var startMin = sH * 60 + parseInt(sM[2]);
    var endMin   = eH * 60 + parseInt(eM[2]);
    if (nowMin >= startMin && nowMin <= endMin) result[emp.id] = true;
  });
  return result;
}

/* ── Main view ── */
function FarmView({ t, lang, setRoute }) {
  const today = new Date().toLocaleDateString('en-CA');
  const isES  = lang === 'es';

  /* Bloquea el scroll de la página mientras FarmView está montado.
     Hay que bloquearlo en <html> (documentElement) porque ahí vive
     el "root scroller" en la mayoría de browsers — body.overflow
     solo no es suficiente. */
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

  const [farmEmps,    setFarmEmps]    = React.useState(getFarmEmployees);
  const [daily,       setDaily]       = React.useState(getFarmDaily);
  const [viewDate,    setViewDate]    = React.useState(today);
  const [searchQ,     setSearchQ]     = React.useState(false);
  const [searchVal,   setSearchVal]   = React.useState('');
  const [rosterOpen,  setRosterOpen]  = React.useState(true);
  const [flash,     setFlash]     = React.useState(null);
  const [draft,     setDraft]     = React.useState(function() {
    var saved = getFarmDaily()[today];
    if (saved) return saved;
    var empIds = getFarmEmployees();
    var objs   = empIds.map(function(id) { return EMPLOYEES.find(function(e) { return e.id === id; }); }).filter(Boolean);
    return getScheduledPresence(objs);
  });
  const [isDirty, setIsDirty] = React.useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = React.useState(false);

  const flashTimerRef = React.useRef(null);

  /* Cuando cambia la fecha sincroniza el draft; también cuando daily cambia
     (p.ej. después de removeFromFarm) para no guardar empleados fantasma */
  React.useEffect(function() {
    var saved = daily[viewDate];
    if (saved) {
      setDraft(saved);
    } else if (viewDate === today) {
      setDraft(getScheduledPresence(farmEmployeeObjects));
    } else {
      setDraft({});
    }
    setIsDirty(false);
    setConfirmOverwrite(false);
  }, [viewDate, daily]);

  /* Limpia el timer de flash al desmontar */
  React.useEffect(function() {
    return function() { if (flashTimerRef.current) clearTimeout(flashTimerRef.current); };
  }, []);

  const canManage = typeof userHasPermission === 'function' && userHasPermission('farm');

  /* useMemo evita O(n×m) en cada render */
  const farmEmployeeObjects = React.useMemo(function() {
    return farmEmps.map(function(id) { return EMPLOYEES.find(function(e) { return e.id === id; }); }).filter(Boolean);
  }, [farmEmps]);

  const presentCount = React.useMemo(function() {
    return farmEmployeeObjects.filter(function(e) { return !!draft[e.id]; }).length;
  }, [farmEmployeeObjects, draft]);

  const absentCount  = farmEmployeeObjects.length - presentCount;
  const totalCount   = farmEmployeeObjects.length;
  const sceneWorkers = farmEmployeeObjects.slice(0, MAX_FARM_SCENE);
  const isToday      = viewDate === today;
  const isAlreadySaved = !!(daily[viewDate] && Object.keys(daily[viewDate]).length);

  const showFlash = function(msg) {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setFlash(msg);
    flashTimerRef.current = setTimeout(function() { setFlash(null); }, 2000);
  };

  const togglePresent = (empId) => {
    var next = Object.assign({}, draft);
    if (next[empId]) delete next[empId];
    else next[empId] = true;
    setDraft(next);
    setIsDirty(true);
  };

  const markAllPresent = () => {
    var next = {};
    farmEmployeeObjects.forEach(function(e) { next[e.id] = true; });
    setDraft(next);
    setIsDirty(true);
  };

  const clearAll = () => {
    setDraft({});
    setIsDirty(true);
  };

  const saveAttendance = function() {
    /* 1 — Guardar en farmDaily filtrando solo empleados activos (evita IDs fantasma) */
    var filteredDraft = {};
    farmEmployeeObjects.forEach(function(e) { if (draft[e.id]) filteredDraft[e.id] = true; });
    var records = Object.assign({}, daily);
    if (!Object.keys(filteredDraft).length) delete records[viewDate];
    else records[viewDate] = filteredDraft;
    setDaily(records);
    saveFarmDaily(records);

    /* 2 — Puente: sincronizar con historial de asistencia/ausencias del dashboard */
    var att = {};
    var abs = {};
    try { att = JSON.parse(localStorage.getItem('uasd_daily_attendance') || '{}'); } catch(ex) {}
    try { abs = JSON.parse(localStorage.getItem('uasd_absences')          || '{}'); } catch(ex) {}

    var baseTs = Date.now();
    farmEmployeeObjects.forEach(function(emp, idx) {
      var attKey   = emp.id + ':' + viewDate;
      var presente = !!filteredDraft[emp.id];

      if (presente) {
        /* Quitar ausencia de finca si existía */
        if (abs[emp.id]) {
          abs[emp.id] = abs[emp.id].filter(function(a) {
            return !(a.date === viewDate && a.source === 'finca');
          });
          if (!abs[emp.id].length) delete abs[emp.id];
        }
        /* Añadir presencia solo si no hay registro manual previo */
        if (!att[attKey] || att[attKey].source === 'finca') {
          var hora = viewDate === today
            ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
            : '—';
          att[attKey] = { empId: emp.id, date: viewDate, time: hora, late: false, source: 'finca' };
        }
      } else {
        /* Quitar presencia de finca si existía */
        if (att[attKey] && att[attKey].source === 'finca') delete att[attKey];
        /* Añadir ausencia solo si no hay ausencia de finca ya registrada para ese día y no es feriado */
        var absArr   = abs[emp.id] || [];
        var yaExiste = absArr.some(function(a) { return a.date === viewDate && a.source === 'finca'; });
        if (!yaExiste && !isHoliday(viewDate)) {
          abs[emp.id] = absArr.concat([{
            id: baseTs * 100 + idx,   /* garantiza unicidad aunque varios idx coincidan en ms */
            date: viewDate,
            justified: false,
            justifyNote: '',
            source: 'finca'
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

  const cancelAttendance = () => {
    setDraft(daily[viewDate] || {});
    setIsDirty(false);
    setConfirmOverwrite(false);
  };

  const addToFarm = (empId) => {
    if (farmEmps.includes(empId)) return;
    const list = [...farmEmps, empId];
    setFarmEmps(list);
    saveFarmEmployees(list);
    setSearchVal('');
  };

  const removeFromFarm = function(empId) {
    var list = farmEmps.filter(function(id) { return id !== empId; });
    setFarmEmps(list);
    saveFarmEmployees(list);
    var records = Object.assign({}, daily);
    Object.keys(records).forEach(function(date) {
      if (records[date] && records[date][empId]) {
        records[date] = Object.assign({}, records[date]);
        delete records[date][empId];
        if (!Object.keys(records[date]).length) delete records[date];
      }
    });
    setDaily(records);
    saveFarmDaily(records);
    setDraft(function(prev) {
      var next = Object.assign({}, prev);
      delete next[empId];
      return next;
    });
  };

  const navDate = (offset) => {
    if (offset > 0 && viewDate >= today) return;
    const [y, m, day] = viewDate.split('-').map(Number);
    const d = new Date(y, m - 1, day);   /* hora local, evita desfase UTC */
    d.setDate(d.getDate() + offset);
    const next = d.toLocaleDateString('en-CA');
    if (next > today) return;
    setViewDate(next);
  };

  const fmtDate = (iso) => {
    const [y,m,d] = iso.split('-').map(Number);
    const date     = new Date(y, m-1, d);
    const dayName  = (DAYS_ES   || [])[date.getDay()] || '';
    const monthName= (MONTHS_ES || [])[m-1]           || '';
    return isES
      ? `${dayName}, ${d} de ${monthName} ${y}`
      : date.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  };

  const availableEmps = React.useMemo(function() {
    return EMPLOYEES.filter(function(e) { return !farmEmps.includes(e.id) && e.status !== 'inactive'; });
  }, [farmEmps]);

  const filteredAvailable = React.useMemo(function() {
    if (!searchVal) return availableEmps;
    var q = searchVal.toLowerCase();
    return availableEmps.filter(function(e) {
      return e.name.toLowerCase().includes(q) ||
             e.id.toLowerCase().includes(q)   ||
             e.cedula.includes(searchVal);
    });
  }, [availableEmps, searchVal]);

  return (
    <div className="page" style={{animation:'body-in .28s cubic-bezier(0.33,1,0.68,1) both'}}>

      <div className="page__head">
        <div>
          <div className="page__title">{t.farm_title}</div>
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
              {isES?'Trabajadores':'Farm workers'}
              <span style={{fontWeight:400,color:'var(--ink-300)',marginLeft:'6px',fontSize:'12px',textTransform:'none',letterSpacing:0}}>
                ({totalCount})
              </span>
            </span>
            {/* Fila 2: botones de acción */}
            <div style={{display:'flex',alignItems:'center',gap:'10px',width:'100%'}}>
              {canManage && (
                <button
                  className={`kpi__pill kpi__pill--btn${searchQ?' kpi__pill--btn--close':''}`}
                  style={{padding:'7px 13px',fontSize:'12px',gap:'6px',flex:1,justifyContent:'center'}}
                  onClick={() => { setSearchQ(p=>!p); setSearchVal(''); }}>
                  <Icon name={searchQ?'x':'userPlus'} size={14}/>
                  {searchQ?(isES?'Cerrar':'Close'):(isES?'Agregar':'Add')}
                </button>
              )}
              {totalCount>0 && (
                <button
                  style={{padding:'7px 13px',fontSize:'12px',gap:'6px',
                    flex:1,justifyContent:'center'}}
                  className={presentCount===totalCount ? 'kpi__pill kpi__pill--btn kpi__pill--btn--close' : 'kpi__pill kpi__pill--up'}
                  onClick={presentCount===totalCount ? clearAll : markAllPresent}>
                  <Icon name={presentCount===totalCount ? 'x' : 'check'} size={14} stroke={presentCount===totalCount ? 1.6 : 2.4}/>
                  {presentCount===totalCount ? (isES?'Ausentes':'Absent') : t.farm_all_present}
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
                <input value={searchVal} onChange={e=>setSearchVal(e.target.value)}
                  placeholder={isES?'Buscar empleado…':'Search employee…'}
                  autoFocus style={{background:'var(--paper)'}}/>
                {searchVal && (
                  <button className="toolbar__search-clear" onClick={()=>setSearchVal('')} aria-label="Limpiar">
                    <Icon name="x" size={13} stroke={2.4}/>
                  </button>
                )}
              </div>
              <div style={{background:'var(--paper)',border:'1px solid var(--ink-100)',
                borderRadius:'10px',maxHeight:'200px',overflowY:'auto',boxShadow:'var(--shadow-md)'}}>
                {filteredAvailable.length===0 ? (
                  <div style={{padding:'12px',fontSize:'13px',color:'var(--ink-300)',textAlign:'center'}}>
                    {isES?'Sin resultados':'No results'}
                  </div>
                ) : filteredAvailable.map(e=>(
                  <button key={e.id} onClick={()=>addToFarm(e.id)}
                    style={{display:'block',width:'100%',textAlign:'left',padding:'10px 14px',
                      fontSize:'13px',border:'none',background:'transparent',outline:'none',
                      cursor:'pointer',transition:'background .1s'}}
                    onMouseEnter={ev=>ev.currentTarget.style.background='var(--cream-50)'}
                    onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}>
                    <div style={{fontWeight:600}}>{e.name}</div>
                    <div style={{fontSize:'11px',color:'var(--ink-300)'}}><span className="mono">{e.id}</span> · {e.dept}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          </div>{/* fin wrapper fit-content */}

          {totalCount === 0 && (
            <div className="audit-empty" style={{animation:'body-in .2s ease both'}}>
              <Icon name="idCard" size={24} stroke={1.2}/>
              <div className="audit-empty__title">{t.farm_no_employees}</div>
              <div className="audit-empty__sub">{canManage?t.farm_no_emps_manage:t.farm_no_emps_admin}</div>
            </div>
          )}

          {totalCount > 0 && (
            <div style={{display:'flex',flexDirection:'column'}}>
              {farmEmployeeObjects.map((emp,idx) => {
                const present = !!draft[emp.id];
                const offScene = idx >= MAX_FARM_SCENE;
                return (
                  <div key={emp.id} style={{animation:'roster-in .32s cubic-bezier(0.22,1,0.36,1) both',
                    animationDelay: (idx * 0.04) + 's'}}>
                  <div className="audit-entry role-assignee-row"
                    style={{alignItems:'center',padding:'14px 0',
                      borderTop: idx === 0 || idx === MAX_FARM_SCENE ? 'none' : '1px solid var(--ink-100)',
                      opacity: offScene ? 0.7 : 1}}>
                    <span className="mono" style={{width:'22px',flexShrink:0,fontSize:'12px',fontWeight:600,
                      color:'var(--ink-300)',textAlign:'right',marginRight:'2px'}}>
                      {String(idx + 1).padStart(2,'0')}
                    </span>
                    <div style={{width:'38px',height:'38px',borderRadius:'50%',flexShrink:0,
                      display:'grid',placeItems:'center',fontSize:'13px',fontWeight:700,
                      background:'var(--ink-200)',color:'var(--ink-600)'}}>
                      {emp.name.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase()}
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
                    <div onClick={()=>togglePresent(emp.id)}
                      role="switch" aria-checked={present} tabIndex={0}
                      aria-label={`${emp.name} — ${present?(isES?'presente':'present'):(isES?'ausente':'absent')}`}
                      onKeyDown={(e)=>{ if (e.key===' '||e.key==='Enter') { e.preventDefault(); togglePresent(emp.id); } }}
                      title={present?(isES?'Marcar ausente':'Mark absent'):(isES?'Marcar presente':'Mark present')}
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
                          onClick={()=>removeFromFarm(emp.id)}
                          title={isES?'Quitar de la finca':'Remove from farm'}
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

        {/* RIGHT — Scene + controls */}

        <div className="act-panel" style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',overflow:'clip',position:'relative'}}
          onDoubleClick={function(){ setRosterOpen(function(o){ return !o; }); }}>

          {!isToday && (
            <div style={{position:'absolute',top:'10px',right:'14px',zIndex:10,
              width:'34px',height:'34px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {/* Ondas expansivas */}
              <div style={{position:'absolute',width:'34px',height:'34px',borderRadius:'50%',
                background:'var(--ink-700)',
                animation:'rippleWave 5s ease-out infinite'}}/>
              <div style={{position:'absolute',width:'34px',height:'34px',borderRadius:'50%',
                background:'var(--ink-700)',
                animation:'rippleWave 5s ease-out infinite',animationDelay:'1.67s'}}/>
              <div style={{position:'absolute',width:'34px',height:'34px',borderRadius:'50%',
                background:'var(--ink-700)',
                animation:'rippleWave 5s ease-out infinite',animationDelay:'3.33s'}}/>
              {/* Botón central */}
              <button type="button" onClick={() => setViewDate(today)}
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

          {/* Date navigator centered */}
          <div className="audit-toolbar" style={{padding:'14px 24px',justifyContent:'center',borderBottom:'1px solid var(--ink-100)',flexShrink:0}}
            onDoubleClick={function(e){ e.stopPropagation(); }}>
            <FarmDateNav
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
              ].map(function(item){
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
            {/* Contenedor escena */}
            <div style={{position:'relative'}}>
              <FarmScene
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
        <div className="edit-overlay" onClick={function(){setConfirmOverwrite(false);}}>
          <div className="del-confirm" onClick={function(e){e.stopPropagation();}}>
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
              <button className="btn btn--ghost" onClick={function(){setConfirmOverwrite(false);}}>
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

Object.assign(window, { FarmView });
