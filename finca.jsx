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

/* ── Worker — círculo con iniciales, tamaño dinámico por cantidad ── */
const W_TIERS = [
  { circle:38, initFs:12, nameFs:9.5, nameW:52, pin:true,  gap:'clamp(8px,2.4vw,28px)' }, // 1–4
  { circle:32, initFs:10, nameFs:8.5, nameW:44, pin:true,  gap:'clamp(5px,1.6vw,18px)' }, // 5–7
  { circle:26, initFs: 8, nameFs:7.5, nameW:36, pin:false, gap:'clamp(3px,1.0vw,12px)' }, // 8–12
  { circle:20, initFs: 6, nameFs:6.5, nameW:26, pin:false, gap:'clamp(2px,0.6vw, 7px)' }, // 13+
];
function getWTier(n) { return n<=4?0:n<=7?1:n<=12?2:3; }

function FarmWorker({ emp, present, onToggle, delay, tier }) {
  const s = W_TIERS[tier] || W_TIERS[0];
  const initials = emp.name.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase();
  const firstName = emp.name.split(' ')[0];
  return (
    <div onClick={() => onToggle(emp.id)} title={emp.name}
      style={{display:'flex',flexDirection:'column',alignItems:'center',gap:s.pin?'4px':'3px',
        cursor:'pointer',userSelect:'none',
        opacity: present ? 1 : 0.32,
        filter: present ? 'none' : 'grayscale(.85)',
        transition:'opacity .3s, filter .3s',
        animation:`farmBob ${1.9+delay*0.3}s ease-in-out infinite`,
        animationDelay:`${delay*0.22}s`}}>
      <div style={{
        width:s.circle+'px', height:s.circle+'px', borderRadius:'50%', flexShrink:0,
        background: present ? '#2d5a27' : 'var(--ink-600)',
        display:'grid', placeItems:'center',
        fontSize:s.initFs+'px', fontWeight:700, color:'#fff',
        boxShadow: present
          ? `0 ${tier<2?4:2}px ${tier<2?14:8}px rgba(45,90,39,.55),0 0 0 ${tier<2?2:1}px rgba(255,255,255,.22)`
          : `0 2px 8px rgba(0,0,0,.38)`,
        transition:'background .3s, box-shadow .3s'}}>
        {initials}
      </div>
      {s.pin && (
        <div style={{width:'3px',height:'10px',borderRadius:'2px',
          background: present ? '#2d5a27' : 'var(--ink-500)',
          opacity: present ? 0.75 : 0.4, transition:'background .3s'}}/>
      )}
      <span style={{
        fontSize:s.nameFs+'px', fontWeight:700, textAlign:'center',
        maxWidth:s.nameW+'px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        fontFamily:'var(--font-sans)', letterSpacing:'.01em',
        color: present ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.32)',
        transition:'color .3s'}}>
        {firstName}
      </span>
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
  const [clock, setClock] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const hours     = clock.getHours() + clock.getMinutes() / 60;
  const skyGrad   = getSkyGradient(hours);
  const sun       = getSunConfig(hours);
  const moon      = getMoonConfig(hours);
  const starAlpha = getStarsAlpha(hours);

  const isDay = hours >= 6.5 && hours < 19;
  const tier  = getWTier(totalCount);
  const wsz   = W_TIERS[tier];

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
        <ellipse cx="24" cy="22" rx="4.5" ry="5.5" fill="#5a8c28"/>
        <ellipse cx="24" cy="22" rx="4.5" ry="5.5" fill="none" stroke="#3d6018" strokeWidth=".8"/>
        <ellipse cx="32" cy="20" rx="4.5" ry="5.5" fill="#4e7e22"/>
        <ellipse cx="32" cy="20" rx="4.5" ry="5.5" fill="none" stroke="#3d6018" strokeWidth=".8"/>
        <ellipse cx="28" cy="26" rx="4" ry="5" fill="#638c2a"/>
        <ellipse cx="28" cy="26" rx="4" ry="5" fill="none" stroke="#3d6018" strokeWidth=".8"/>
        {/* Sombra/detalle de cada coco */}
        <ellipse cx="24" cy="24" rx="2" ry="1.5" fill="rgba(0,0,0,.15)"/>
        <ellipse cx="32" cy="22" rx="2" ry="1.5" fill="rgba(0,0,0,.15)"/>
        <ellipse cx="28" cy="28" rx="1.8" ry="1.4" fill="rgba(0,0,0,.15)"/>
      </svg>

      {/* Palma derecha (pequeña, detrás del granero) */}
      <svg style={{position:'absolute',bottom:'113px',right:'18%',width:'44px',height:'80px',overflow:'visible'}}
        viewBox="0 0 44 80">
        <path d="M22,80 Q20,60 24,42 Q21,26 22,8" stroke="#7a5530" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M22,10 Q8,-5 -4,4" stroke="#4a9830" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M22,10 Q36,-4 46,5" stroke="#5aaa38" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M22,12 Q10,6 4,18" stroke="#42882a" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M22,12 Q34,7 40,20" stroke="#4a9028" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Cocos — racimo pequeño */}
        <ellipse cx="18" cy="17" rx="3.5" ry="4.2" fill="#5a8c28"/>
        <ellipse cx="18" cy="17" rx="3.5" ry="4.2" fill="none" stroke="#3d6018" strokeWidth=".7"/>
        <ellipse cx="25" cy="16" rx="3.5" ry="4.2" fill="#4e7e22"/>
        <ellipse cx="25" cy="16" rx="3.5" ry="4.2" fill="none" stroke="#3d6018" strokeWidth=".7"/>
        <ellipse cx="21" cy="21" rx="3.2" ry="3.8" fill="#638c2a"/>
        <ellipse cx="21" cy="21" rx="3.2" ry="3.8" fill="none" stroke="#3d6018" strokeWidth=".7"/>
        {/* Sombra */}
        <ellipse cx="18" cy="18.5" rx="1.6" ry="1.2" fill="rgba(0,0,0,.15)"/>
        <ellipse cx="25" cy="17.5" rx="1.6" ry="1.2" fill="rgba(0,0,0,.15)"/>
        <ellipse cx="21" cy="22.5" rx="1.4" ry="1.1" fill="rgba(0,0,0,.15)"/>
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

      {/* Cultivos — área central */}
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

      {/* Cerca — posts y rieles */}
      <svg style={{position:'absolute',bottom:'85px',left:0,width:'100%',height:'32px',pointerEvents:'none'}}
        viewBox="0 0 800 32" preserveAspectRatio="none">
        {/* Rieles horizontales */}
        <line x1="0" y1="10" x2="800" y2="10" stroke="#8b6e44" strokeWidth="2.5" opacity=".85"/>
        <line x1="0" y1="22" x2="800" y2="22" stroke="#8b6e44" strokeWidth="2" opacity=".75"/>
        {/* Posts verticales */}
        {Array.from({length:17}).map((_,i)=>(
          <rect key={i} x={i*50+4} y="4" width="6" height="28" rx="2" fill="#7a5c34" opacity=".9"/>
        ))}
      </svg>

      {/* Tierra oscura al frente */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'30px',
        background:'linear-gradient(180deg,#3a2a14 0%,#28200e 100%)',opacity:.7}}/>



      {/* Trabajadores */}
      {totalCount === 0 ? (
        <div style={{position:'absolute',bottom:'42px',left:0,right:0,textAlign:'center',
          fontFamily:'var(--font-sans)',fontSize:'12px',fontWeight:600,
          color:'rgba(255,255,255,.45)',textShadow:'0 1px 3px rgba(0,0,0,.7)'}}>
          {isES?'Sin trabajadores asignados':'No workers assigned'}
        </div>
      ) : (
        <div style={{position:'absolute',bottom:'34px',left:'10%',right:'20%',
          display:'flex',justifyContent:'center',alignItems:'flex-end',
          gap:wsz.gap, flexWrap:'wrap'}}>
          {workers.map((emp,i) => (
            <FarmWorker key={emp.id} emp={emp} present={!!dayRecords[emp.id]}
              onToggle={onToggle} delay={i} tier={tier}/>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Farm date navigator with calendar popup ── */
function FarmDateNav({ viewDate, setViewDate, navDate, fmtDate, isES, daily }) {
  const [open, setOpen] = React.useState(false);
  const [calPos, setCalPos] = React.useState({ top:0, left:0 });
  const trigRef = React.useRef(null);
  const calRef  = React.useRef(null);
  const today = new Date().toLocaleDateString('en-CA');

  const parseISO = (iso) => {
    const parts = iso.split('-').map(Number);
    return { y: parts[0], m: parts[1]-1, d: parts[2] };
  };
  const sel = parseISO(viewDate);
  const now  = parseISO(today);

  const [month, setMonth] = React.useState(sel.m);
  const [year,  setYear]  = React.useState(sel.y);

  React.useEffect(() => {
    const p = parseISO(viewDate);
    setMonth(p.m);
    setYear(p.y);
  }, [viewDate]);

  /* position calendar below trigger, centered on viewport width */
  React.useEffect(() => {
    if (!open || !trigRef.current) return;
    const r = trigRef.current.getBoundingClientRect();
    const calW = 284;
    const left = r.left + r.width / 2 - calW / 2 + 2;
    setCalPos({ top: r.bottom + 8, left: Math.max(8, left) });
  }, [open]);

  /* close on outside click or Escape */
  React.useEffect(() => {
    if (!open) return;
    const onMouse = (e) => {
      if (trigRef.current && !trigRef.current.contains(e.target) &&
          calRef.current  && !calRef.current.contains(e.target))
        setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const DOW = ['L','M','X','J','V','S','D'];
  const firstDow    = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMo   = () => month === 0  ? (setMonth(11), setYear(function(y){ return y-1; })) : setMonth(function(m){ return m-1; });
  const nextMo   = () => month === 11 ? (setMonth(0),  setYear(function(y){ return y+1; })) : setMonth(function(m){ return m+1; });
  const prevYear = () => setYear(function(y){ return y-1; });
  const nextYear = () => setYear(function(y){ return y+1; });

  const hasRecords = (d) => {
    const iso = year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const rec = daily && daily[iso];
    return rec && Object.keys(rec).length > 0;
  };

  const pick = (d) => {
    const iso = year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    setViewDate(iso);
    setOpen(false);
  };

  const isToday = viewDate === today;

  return (
    <div style={{display:'flex',alignItems:'center',gap:'10px',justifyContent:'center',position:'relative'}}>
      <button className="dp-cal__arrow" onClick={()=>navDate(-1)}>‹</button>

      <div ref={trigRef} style={{display:'flex',alignItems:'center',gap:'2px'}}>
        <button type="button" onClick={() => setOpen(function(o){ return !o; })}
          style={{display:'flex',alignItems:'center',gap:'7px',
            background: open ? 'var(--ink-100)' : 'transparent',
            border:'1.5px solid '+(open ? 'var(--accent)' : 'var(--ink-200,#ddd)'),
            borderRadius:'8px', padding:'6px 14px',
            cursor:'pointer', transition:'background .15s, border-color .15s',
            fontFamily:'var(--font-sans)', fontWeight:700, fontSize:'14px',
            color:'var(--ink-800)', whiteSpace:'nowrap', lineHeight:1.2}}>
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

      <button className="dp-cal__arrow" onClick={()=>navDate(1)}
        disabled={isToday}
        style={isToday ? {opacity:.28,cursor:'not-allowed'} : {}}>›</button>

      {open && ReactDOM.createPortal(
        <div ref={calRef} className="dp-cal"
          style={{position:'fixed', top:calPos.top, left:calPos.left,
            zIndex:9999, boxShadow:'0 16px 48px rgba(0,0,0,.22)',
            animation:'body-in .15s cubic-bezier(0.33,1,0.68,1) both'}}>
          <div className="dp-cal__nav">
            <button type="button" className="dp-cal__arrow" onClick={prevYear} title="Año anterior">«</button>
            <button type="button" className="dp-cal__arrow" onClick={prevMo}   title="Mes anterior">‹</button>
            <span className="dp-cal__month">{(MONTHS_ES||[])[month]} {year}</span>
            <button type="button" className="dp-cal__arrow" onClick={nextMo}   title="Mes siguiente">›</button>
            <button type="button" className="dp-cal__arrow" onClick={nextYear} title="Año siguiente">»</button>
          </div>
          <div className="dp-cal__grid">
            {DOW.map(function(d){ return <span key={d} className="dp-cal__dow">{d}</span>; })}
            {Array.from({length:firstDow}).map(function(_,i){ return <span key={'b'+i}/>; })}
            {Array.from({length:daysInMonth}, function(_,i){
              const d = i+1;
              const isoDay = year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
              const isFuture = isoDay > today;
              const isSel = sel.d===d && sel.m===month && sel.y===year;
              const isNow = now.d===d && now.m===month && now.y===year;
              const hasRec = hasRecords(d);
              return (
                <button type="button" key={d}
                  disabled={isFuture}
                  className={'dp-cal__day'+(isSel?' dp-cal__day--sel':'')+(isNow&&!isSel?' dp-cal__day--today':'')+(isFuture?' dp-cal__day--disabled':'')}
                  onClick={() => pick(d)}
                  style={isFuture ? {opacity:.28,cursor:'not-allowed'} : isSel ? {} : hasRec ? {
                    background:'#d4edda',
                    color:'#1a5c1a',
                    fontWeight:700,
                    borderRadius:'6px',
                    border:'1.5px solid #7ec89a',
                    position:'relative'
                  } : {}}>
                  {d}
                  {hasRec && !isSel && !isFuture && (
                    <span style={{
                      position:'absolute', bottom:'1px', left:'50%',
                      transform:'translateX(-50%)',
                      width:'5px', height:'5px', borderRadius:'50%',
                      background:'#2d8a2d', display:'block',
                      boxShadow:'0 0 0 1px #fff'
                    }}/>
                  )}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── Main view ── */
function FarmView({ t, lang, setRoute }) {
  const today = new Date().toLocaleDateString('en-CA');
  const isES  = lang === 'es';

  const [farmEmps,  setFarmEmps]  = React.useState(getFarmEmployees);
  const [daily,     setDaily]     = React.useState(getFarmDaily);
  const [viewDate,  setViewDate]  = React.useState(today);
  const [searchQ,   setSearchQ]   = React.useState(false);
  const [searchVal, setSearchVal] = React.useState('');
  const [flash,     setFlash]     = React.useState(null);

  const canManage = typeof userHasPermission === 'function' && userHasPermission('farm');

  const dayRecords          = daily[viewDate] || {};
  const farmEmployeeObjects = farmEmps.map(id => EMPLOYEES.find(e => e.id === id)).filter(Boolean);
  const presentCount        = farmEmployeeObjects.filter(e => dayRecords[e.id]).length;
  const absentCount         = farmEmployeeObjects.length - presentCount;
  const totalCount          = farmEmployeeObjects.length;

  const isToday             = viewDate === today;

  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(null), 2000); };

  const togglePresent = (empId) => {
    const records = { ...daily };
    if (!records[viewDate]) records[viewDate] = {};
    records[viewDate] = { ...records[viewDate] };
    if (records[viewDate][empId]) {
      delete records[viewDate][empId];
      if (!Object.keys(records[viewDate]).length) delete records[viewDate];
    } else {
      records[viewDate][empId] = true;
    }
    setDaily(records);
    saveFarmDaily(records);
  };

  const markAllPresent = () => {
    const records = { ...daily, [viewDate]: {} };
    farmEmployeeObjects.forEach(e => { records[viewDate][e.id] = true; });
    setDaily(records);
    saveFarmDaily(records);
  };

  const clearAll = () => {
    const records = { ...daily };
    delete records[viewDate];
    setDaily(records);
    saveFarmDaily(records);
  };

  const addToFarm = (empId) => {
    if (farmEmps.includes(empId)) return;
    const list = [...farmEmps, empId];
    setFarmEmps(list);
    saveFarmEmployees(list);
    setSearchVal('');
    showFlash(isES ? 'Empleado agregado a la finca' : 'Employee added to farm');
  };

  const removeFromFarm = (empId) => {
    const list = farmEmps.filter(id => id !== empId);
    setFarmEmps(list);
    saveFarmEmployees(list);
    const records = { ...daily };
    Object.keys(records).forEach(date => {
      if (records[date] && records[date][empId]) {
        records[date] = { ...records[date] };
        delete records[date][empId];
        if (!Object.keys(records[date]).length) delete records[date];
      }
    });
    setDaily(records);
    saveFarmDaily(records);
    showFlash(isES ? 'Empleado removido de la finca' : 'Employee removed from farm');
  };

  const navDate = (offset) => {
    if (offset > 0 && viewDate >= today) return;
    const d = new Date(viewDate);
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

  const availableEmps     = EMPLOYEES.filter(e => !farmEmps.includes(e.id) && e.status !== 'inactive');
  const filteredAvailable = searchVal
    ? availableEmps.filter(e =>
        e.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        e.id.toLowerCase().includes(searchVal.toLowerCase()) ||
        e.cedula.includes(searchVal))
    : availableEmps;

  return (
    <div className="page" style={{animation:'body-in .28s cubic-bezier(0.33,1,0.68,1) both'}}>

      <div className="page__head">
        <div>
          <div className="page__title">{t.farm_title}</div>
        </div>
      </div>

      {flash && (
        <div className="flash" style={{position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',zIndex:1000}}>
          {flash}
        </div>
      )}

      <div className="activity-map" style={{gridTemplateColumns:'420px minmax(0,1fr)',gap:'16px'}}>

        {/* LEFT — Roster */}
        <div className="activity-map__left" style={{gap:0}}>
          {/* Wrapper fit-content: la búsqueda hereda el ancho de la fila de botones */}
          <div style={{display:'inline-flex',flexDirection:'column',gap:'10px',
            width:'fit-content',maxWidth:'100%',paddingBottom:'14px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <span className="activity-map__label" style={{margin:0}}>
                {isES?'Trabajadores':'Farm workers'}
                <span style={{fontWeight:400,color:'var(--ink-300)',marginLeft:'6px',fontSize:'12px',textTransform:'none',letterSpacing:0}}>
                  ({totalCount})
                </span>
              </span>
              {canManage && (
                <button
                  className={`kpi__pill kpi__pill--btn${searchQ?' kpi__pill--btn--close':''}`}
                  style={{padding:'7px 13px',fontSize:'12px',gap:'6px',minWidth:'130px',justifyContent:'center'}}
                  onClick={() => { setSearchQ(p=>!p); setSearchVal(''); }}>
                  <Icon name={searchQ?'x':'userPlus'} size={14}/>
                  {searchQ?(isES?'Cerrar':'Close'):(isES?'Agregar':'Add')}
                </button>
              )}
              {totalCount>0 && (
                <button
                  style={{padding:'7px 13px',fontSize:'12px',gap:'6px',minWidth:'130px',justifyContent:'center'}}
                  className={presentCount===totalCount ? 'kpi__pill kpi__pill--btn' : 'kpi__pill kpi__pill--up'}
                  onClick={presentCount===totalCount ? clearAll : markAllPresent}>
                  <Icon name={presentCount===totalCount ? 'x' : 'check'} size={14}/>
                  {presentCount===totalCount ? (isES?'Limpiar':'Clear') : t.farm_all_present}
                </button>
              )}
            </div>

          {searchQ && (
            <div style={{width:'100%'}}>
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
                {searchVal && (
                  <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,right:0,background:'var(--paper)',
                    border:'1px solid var(--ink-100)',borderRadius:'10px',zIndex:10,
                    maxHeight:'200px',overflowY:'auto',boxShadow:'var(--shadow-md)'}}>
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
                )}
              </div>
            </div>
          )}
          </div>{/* fin wrapper fit-content */}

          {totalCount===0 ? (
            <div className="audit-empty">
              <Icon name="users" size={24} stroke={1.2}/>
              <div className="audit-empty__title">{t.farm_no_employees}</div>
              <div className="audit-empty__sub">{canManage?t.farm_no_emps_manage:t.farm_no_emps_admin}</div>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column'}}>
              {farmEmployeeObjects.map((emp,idx) => {
                const present = !!dayRecords[emp.id];
                return (
                  <div key={emp.id} className="audit-entry role-assignee-row"
                    style={{alignItems:'center',padding:'14px 0',
                      borderTop: idx > 0 ? '1px solid var(--ink-100)' : 'none'}}>
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
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — Scene + controls */}

        <div className="act-panel" style={{display:'flex',flexDirection:'column',minWidth:0,overflow:'hidden',position:'relative'}}>

          {!isToday && (
            <div style={{position:'absolute',top:'10px',right:'14px',zIndex:10,
              width:'34px',height:'34px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {/* Ondas expansivas */}
              <div style={{position:'absolute',width:'34px',height:'34px',borderRadius:'50%',
                background:'var(--ink-800)',opacity:.35,
                animation:'rippleWave 1.8s ease-out infinite'}}/>
              <div style={{position:'absolute',width:'34px',height:'34px',borderRadius:'50%',
                background:'var(--ink-800)',opacity:.25,
                animation:'rippleWave 1.8s ease-out infinite',animationDelay:'.6s'}}/>
              <div style={{position:'absolute',width:'34px',height:'34px',borderRadius:'50%',
                background:'var(--ink-800)',opacity:.15,
                animation:'rippleWave 1.8s ease-out infinite',animationDelay:'1.2s'}}/>
              {/* Botón central */}
              <button type="button" onClick={() => setViewDate(today)}
                title={isES ? 'Volver a hoy' : 'Back to today'}
                style={{position:'relative',width:'34px',height:'34px',borderRadius:'50%',
                  background:'var(--ink-800)',color:'var(--cream-100)',border:'none',cursor:'pointer',
                  fontFamily:'var(--font-sans)',fontSize:'9px',fontWeight:800,
                  letterSpacing:'.05em',textTransform:'uppercase',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  boxShadow:'0 2px 10px rgba(22,27,51,.45)'}}>
                {isES ? 'Hoy' : 'Now'}
              </button>
            </div>
          )}

          {/* Date navigator centered */}
          <div className="audit-toolbar" style={{padding:'14px 24px',justifyContent:'center',borderBottom:'1px solid var(--ink-100)'}}>
            <FarmDateNav
              viewDate={viewDate}
              setViewDate={setViewDate}
              navDate={navDate}
              fmtDate={fmtDate}
              isES={isES}
              daily={daily}
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
                    background:item.bg,borderRadius:'999px',padding:'5px 12px 5px 8px'}}>
                    <div style={{width:'8px',height:'8px',borderRadius:'50%',background:item.dot,flexShrink:0}}/>
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
                workers={farmEmployeeObjects}
                dayRecords={dayRecords}
                onToggle={togglePresent}
                presentCount={presentCount}
                absentCount={absentCount}
                totalCount={totalCount}
                isES={isES}
                viewDate={viewDate}
              />
            </div>
            {totalCount>0 && (
              <p style={{margin:'10px 0 0',fontSize:'11.5px',color:'var(--ink-300)',
                fontFamily:'var(--font-sans)',textAlign:'center'}}>
                {isES
                  ? 'Haz clic en el trabajador para registrar su asistencia'
                  : 'Click a worker to toggle attendance'}
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

Object.assign(window, { FarmView });
