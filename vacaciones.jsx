/* vacaciones.jsx — Vacaciones Colectivas */

const VAC_EMP_KEY   = 'uasd_vacaciones_employees';
const VAC_DAILY_KEY = 'uasd_vacaciones_daily';
const MAX_VAC_SCENE = 10;

function getVacEmps() {
  try { return JSON.parse(localStorage.getItem(VAC_EMP_KEY) || '[]'); } catch(e) { return []; }
}
function saveVacEmps(list) { localStorage.setItem(VAC_EMP_KEY, JSON.stringify(list)); }
function getVacDaily() {
  try { return JSON.parse(localStorage.getItem(VAC_DAILY_KEY) || '{}'); } catch(e) { return {}; }
}
function saveVacDaily(data) { localStorage.setItem(VAC_DAILY_KEY, JSON.stringify(data)); }

const VAC_SLOTS = [
  {act:'brindis'}, {act:'baile'}, {act:'descanso'}, {act:'caminar'},
  {act:'brindis'}, {act:'baile'}, {act:'descanso'}, {act:'caminar'},
  {act:'brindis'}, {act:'baile'},
];
const VAC_SHIRT_COLS = ['#c8102e','#1e4d91','#218c4a','#8b1a7e','#b87315'];
const VAC_SKIN = '#d4956a';

/* Stars — pre-seeded so they don't regenerate on re-render */
const VAC_STARS = [];
for (let _vi = 0; _vi < 44; _vi++) {
  VAC_STARS.push({ x: (_vi * 2.27 + 0.8) % 100, y: (_vi * 2.13 + 0.4) % 38 });
}
/* Snowflake seeds */
const VAC_SNOWSEEDS = [];
for (let _vf = 0; _vf < 28; _vf++) {
  VAC_SNOWSEEDS.push({
    x:   (_vf * 3.61 + 0.5) % 100,
    del: (_vf * 0.44)        % 9,
    dur: 7 + (_vf % 4) * 2.1,
    sz:  3 + (_vf % 3) * 2,
    op:  0.45 + (_vf % 3) * 0.22
  });
}

/* ── Santa hat (reusable piece) ── */
function SantaHat({ cx, cy }) {
  return (
    <g>
      <rect x={cx-8} y={cy-1} width={16} height={4} rx={2} fill="white"/>
      <polygon points={cx-8+','+cy+' '+(cx+2)+','+(cy-18)+' '+(cx+8)+','+cy} fill="#CE1126"/>
      <line x1={cx-2} y1={cy} x2={cx+2} y2={cy-18}
        stroke="rgba(0,0,0,.12)" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx={cx+2} cy={cy-19} r={3.5} fill="white"/>
    </g>
  );
}

/* ── Holiday figures (viewBox "0 0 44 57") ── */

function FigBrindis({ s, c }) {
  return (
    <g>
      <SantaHat cx={20} cy={8}/>
      <circle cx={20} cy={12} r={6.5} fill={s}/>
      <path d="M20,18 L20,34" stroke={c} strokeWidth="6" strokeLinecap="round"/>
      <line x1={17} y1={22} x2={10} y2={29} stroke={s} strokeWidth="4" strokeLinecap="round"/>
      <g style={{animation:'w-inspect 2.5s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'50% 80%'}}>
        <line x1={23} y1={22} x2={33} y2={15} stroke={s} strokeWidth="4" strokeLinecap="round"/>
        <path d="M31,9 L29,16 L37,16 L35,9 Z" fill="#f0c040" stroke="#c09020" strokeWidth=".8"/>
        <ellipse cx={33} cy={9} rx={3.5} ry={1.5} fill="#f0a020" opacity=".85"/>
        <path d="M32,7 Q33,4 32,2" stroke="rgba(255,255,255,.5)" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M34,7 Q35,4 34,2" stroke="rgba(255,255,255,.5)" strokeWidth="1" fill="none" strokeLinecap="round"/>
      </g>
      <line x1={20} y1={34} x2={14} y2={48} stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1={20} y1={34} x2={26} y2={48} stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1={14} y1={48} x2={9}  y2={53} stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
      <line x1={26} y1={48} x2={31} y2={53} stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
    </g>
  );
}

function FigBaile({ s, c }) {
  return (
    <g style={{animation:'w-carry 1.6s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'50% 55%'}}>
      <SantaHat cx={20} cy={8}/>
      <circle cx={20} cy={12} r={6.5} fill={s}/>
      <path d="M20,18 L20,34" stroke={c} strokeWidth="6" strokeLinecap="round"/>
      <line x1={17} y1={22} x2={5}  y2={16} stroke={s} strokeWidth="4" strokeLinecap="round"/>
      <line x1={23} y1={22} x2={35} y2={16} stroke={s} strokeWidth="4" strokeLinecap="round"/>
      <circle cx={4}  cy={15} r={2.5} fill={s}/>
      <circle cx={36} cy={15} r={2.5} fill={s}/>
      <line x1={20} y1={34} x2={12} y2={45} stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1={20} y1={34} x2={29} y2={43} stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1={12} y1={45} x2={7}  y2={49} stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
      <line x1={29} y1={43} x2={35} y2={47} stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
    </g>
  );
}

function FigDescanso({ s, c }) {
  return (
    <g>
      <SantaHat cx={20} cy={14}/>
      <circle cx={20} cy={18} r={6.5} fill={s}/>
      <path d="M20,24 L20,37" stroke={c} strokeWidth="6" strokeLinecap="round"/>
      <line x1={17} y1={28} x2={9}  y2={34} stroke={s} strokeWidth="4" strokeLinecap="round"/>
      <line x1={23} y1={28} x2={31} y2={32} stroke={s} strokeWidth="4" strokeLinecap="round"/>
      <circle cx={8}  cy={35} r={2.5} fill={s}/>
      <circle cx={32} cy={33} r={2.5} fill={s}/>
      <line x1={20} y1={37} x2={10} y2={46} stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1={20} y1={37} x2={31} y2={44} stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1={10} y1={46} x2={19} y2={50} stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
      <line x1={31} y1={44} x2={22} y2={48} stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
    </g>
  );
}

function FigCaminar({ s, c }) {
  return (
    <g style={{animation:'w-carry 1.9s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'50% 60%'}}>
      <SantaHat cx={20} cy={8}/>
      <circle cx={20} cy={12} r={6.5} fill={s}/>
      <path d="M20,18 L20,34" stroke={c} strokeWidth="6" strokeLinecap="round"/>
      <line x1={17} y1={23} x2={9}  y2={30} stroke={s} strokeWidth="4" strokeLinecap="round"/>
      <line x1={23} y1={23} x2={31} y2={29} stroke={s} strokeWidth="4" strokeLinecap="round"/>
      {/* Gift bag */}
      <rect x={29} y={29} width={11} height={10} rx={2} fill="#CE1126" stroke="#8a0a1e" strokeWidth=".8"/>
      <rect x={29} y={27} width={11} height={3}  rx={1} fill="#f5c518"/>
      <line x1={34.5} y1={27} x2={34.5} y2={39} stroke="#f5c518" strokeWidth="1.5"/>
      <path d="M31,27 Q34,23 37,27" fill="none" stroke="#f5c518" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1={20} y1={34} x2={14} y2={47} stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1={20} y1={34} x2={27} y2={45} stroke={c} strokeWidth="4.5" strokeLinecap="round"/>
      <line x1={14} y1={47} x2={9}  y2={52} stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
      <line x1={27} y1={45} x2={32} y2={50} stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
    </g>
  );
}

/* ── Holiday worker in scene ── */
function VacWorker({ emp, onToggle, slotIndex, totalCount }) {
  const act  = VAC_SLOTS[slotIndex % VAC_SLOTS.length].act;
  const sz   = totalCount > 8 ? 28 : totalCount > 5 ? 34 : 40;
  const skin = VAC_SKIN;
  const shrt = VAC_SHIRT_COLS[slotIndex % VAC_SHIRT_COLS.length];
  return (
    <div onClick={function() { onToggle(emp.id); }} title={emp.name}
      style={{display:'flex',flexDirection:'column',alignItems:'center',cursor:'pointer',userSelect:'none'}}>
      <svg width={sz} height={Math.round(sz*1.3)} viewBox="0 0 44 57" style={{overflow:'visible'}}>
        {act === 'brindis'  && <FigBrindis  s={skin} c={shrt}/>}
        {act === 'baile'    && <FigBaile    s={skin} c={shrt}/>}
        {act === 'descanso' && <FigDescanso s={skin} c={shrt}/>}
        {act === 'caminar'  && <FigCaminar  s={skin} c={shrt}/>}
      </svg>
    </div>
  );
}

/* ── Snowflakes ── */
function SnowParticles() {
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:5}}>
      {VAC_SNOWSEEDS.map(function(s, i) {
        return (
          <div key={i} style={{
            position:'absolute', left:s.x+'%', top:'-8px',
            width:s.sz+'px', height:s.sz+'px',
            borderRadius:'50%', background:'white', opacity:s.op,
            animation:'snowFall '+s.dur+'s linear infinite',
            animationDelay:s.del+'s'
          }}/>
        );
      })}
    </div>
  );
}

/* ── Christmas tree (left side of scene) ── */
function VacTree() {
  const OC = ['#CE1126','#3b82f6','#f5c518','#2d9b2d','#8b2be2','#ff8c00'];
  const lights = [
    {cx:32,cy:155},{cx:52,cy:160},{cx:72,cy:163},{cx:90,cy:159},{cx:110,cy:153},
    {cx:26,cy:138},{cx:46,cy:144},{cx:66,cy:147},{cx:86,cy:142},{cx:106,cy:136},
    {cx:30,cy:117},{cx:50,cy:122},{cx:70,cy:125},{cx:90,cy:120},{cx:108,cy:114},
    {cx:36,cy:101},{cx:55,cy:106},{cx:74,cy:108},{cx:92,cy:104},
    {cx:42,cy:84}, {cx:60,cy:88}, {cx:78,cy:87}, {cx:94,cy:82},
    {cx:47,cy:68}, {cx:65,cy:72}, {cx:80,cy:70},
    {cx:52,cy:52}, {cx:68,cy:56}, {cx:82,cy:52},
    {cx:59,cy:36}, {cx:72,cy:40},
  ];
  const orns = [
    {cx:42,cy:152,r:6.5,c:'#CE1126'},{cx:94,cy:152,r:6.5,c:'#3b82f6'},
    {cx:70,cy:158,r:7,c:'#f5c518'},
    {cx:34,cy:128,r:5.5,c:'#2d9b2d'},{cx:104,cy:124,r:5.5,c:'#8b2be2'},
    {cx:70,cy:124,r:6,c:'#CE1126'},{cx:92,cy:115,r:5,c:'#ff8c00'},
    {cx:56,cy:95,r:5,c:'#3b82f6'},{cx:86,cy:90,r:5,c:'#f5c518'},
    {cx:64,cy:76,r:5,c:'#2d9b2d'},{cx:55,cy:58,r:4.5,c:'#CE1126'},{cx:82,cy:55,r:4.5,c:'#8b2be2'},
  ];
  return (
    <svg style={{position:'absolute',bottom:'0',left:'0',width:'142px',height:'215px',overflow:'visible',
      filter:'drop-shadow(0 14px 34px rgba(0,0,0,.42))'}}
      viewBox="0 0 142 215">
      {/* Trunk */}
      <rect x="60" y="170" width="22" height="45" rx="5" fill="#4a2808"/>
      <rect x="64" y="170" width="9"  height="45" rx="3" fill="#5e3410"/>
      <rect x="46" y="200" width="50" height="8"  rx="3" fill="#32160a"/>
      <path d="M46,200 Q71,193 96,200" fill="white" opacity=".5"/>
      {/* Tree tiers */}
      <polygon points="71,100 10,170 132,170" fill="#195c18"/>
      <polygon points="71,100 10,170 34,170"  fill="rgba(0,0,0,.18)"/>
      <polygon points="71,70 18,124 124,124"   fill="#1e6e1c"/>
      <polygon points="71,70 18,124 38,124"    fill="rgba(0,0,0,.15)"/>
      <polygon points="71,44 26,90 116,90"     fill="#228a20"/>
      <polygon points="71,44 26,90 44,90"      fill="rgba(0,0,0,.12)"/>
      <polygon points="71,18 34,64 108,64"     fill="#28a026"/>
      <polygon points="71,18 34,64 50,64"      fill="rgba(0,0,0,.10)"/>
      {/* Snow on tier edges */}
      <path d="M10,170 Q30,157 56,162 Q71,164 86,162 Q112,157 132,170"
        fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity=".70"/>
      <path d="M18,124 Q38,112 56,116 Q71,118 86,116 Q104,112 124,124"
        fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" opacity=".65"/>
      <path d="M26,90 Q44,79 58,83 Q71,85 84,83 Q98,79 116,90"
        fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" opacity=".60"/>
      <path d="M34,64 Q50,54 62,58 Q71,60 80,58 Q92,54 108,64"
        fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity=".55"/>
      {/* Lights */}
      {lights.map(function(p, i) {
        const col = OC[i % OC.length];
        return (
          <circle key={i} cx={p.cx} cy={p.cy} r={3.5} fill={col}
            style={{animation:'sunGlow '+(1.3+i*0.16)+'s ease-in-out infinite',
              animationDelay:(i*0.11)+'s', filter:'drop-shadow(0 0 4px '+col+')'}}/>
        );
      })}
      {/* Ornaments */}
      {orns.map(function(b, i) {
        const col = b.c || OC[i % OC.length];
        const r   = b.r || 5;
        return (
          <g key={i}>
            <circle cx={b.cx} cy={b.cy} r={r} fill={col} stroke="rgba(0,0,0,.22)" strokeWidth=".8"/>
            <circle cx={b.cx-r*.28} cy={b.cy-r*.28} r={r*.3} fill="rgba(255,255,255,.45)"/>
            <line x1={b.cx} y1={b.cy-r} x2={b.cx} y2={b.cy-r-3.5} stroke="#4a2808" strokeWidth="1.2"/>
          </g>
        );
      })}
      {/* Star */}
      <g style={{filter:'drop-shadow(0 0 10px #ffd700)'}}>
        <polygon
          points="71,2 73.5,9.5 81.5,9.5 75.2,14.5 77.8,22 71,17.5 64.2,22 66.8,14.5 60.5,9.5 68.5,9.5"
          fill="#ffd700" stroke="#b89000" strokeWidth=".8"/>
        <circle cx="71" cy="12" r="3.5" fill="#ffffa0" opacity=".9"
          style={{animation:'sunGlow 1.5s ease-in-out infinite'}}/>
      </g>
      {/* Gifts */}
      <rect x="8"  y="155" width="28" height="20" rx="2" fill="#CE1126" stroke="#8a0a0a" strokeWidth=".8"/>
      <rect x="8"  y="155" width="28" height="7"  rx="1" fill="#f5c518"/>
      <line x1="22" y1="155" x2="22" y2="175" stroke="#f5c518" strokeWidth="2"/>
      <path d="M18,155 Q22,149 26,155" fill="#f5c518" stroke="#c09000" strokeWidth=".8"/>
      <circle cx="22" cy="155" r="2" fill="#c09000"/>
      <rect x="96" y="158" width="24" height="17" rx="2" fill="#1e4d91" stroke="#0d2a5e" strokeWidth=".8"/>
      <line x1="108" y1="158" x2="108" y2="175" stroke="white" strokeWidth="1.8"/>
      <line x1="96"  y1="167" x2="120" y2="167" stroke="white" strokeWidth="1.8"/>
      <path d="M105,158 Q108,152 111,158" fill="white" stroke="#ccc" strokeWidth=".6"/>
      <circle cx="108" cy="158" r="1.8" fill="#ccc"/>
      <rect x="50" y="161" width="22" height="15" rx="2" fill="#c8a020" stroke="#8a6a0a" strokeWidth=".8"/>
      <line x1="61" y1="161" x2="61" y2="176" stroke="#CE1126" strokeWidth="1.8"/>
      <line x1="50" y1="168" x2="72" y2="168" stroke="#CE1126" strokeWidth="1.8"/>
    </svg>
  );
}

/* ── Snowman ── */
function VacSnowman() {
  return (
    <svg style={{position:'absolute',bottom:'115px',left:'33%',width:'64px',height:'84px',overflow:'visible',
      filter:'drop-shadow(0 5px 12px rgba(0,0,0,.28))'}}
      viewBox="0 0 64 84">
      <ellipse cx="32" cy="83" rx="18" ry="3.5" fill="rgba(0,0,0,.14)"/>
      <circle cx="32" cy="67" r="18"   fill="white" stroke="#d0d8e8" strokeWidth=".8"/>
      <circle cx="32" cy="43" r="12.5" fill="white" stroke="#d0d8e8" strokeWidth=".8"/>
      <circle cx="32" cy="24" r="9.5"  fill="white" stroke="#d0d8e8" strokeWidth=".8"/>
      <circle cx="28"   cy="21" r="1.7" fill="#2a2a2a"/>
      <circle cx="35.5" cy="21" r="1.7" fill="#2a2a2a"/>
      <polygon points="32,23.5 39.5,26 32,27.2" fill="#e8600a"/>
      {[28,30.5,33,35.5,38].map(function(x, i) {
        return <circle key={i} cx={x} cy={28+Math.abs(i-2)*0.7} r={1.4} fill="#2a2a2a"/>;
      })}
      {[38,44,50].map(function(y) {
        return <circle key={y} cx="32" cy={y} r="2" fill="#2a2a2a"/>;
      })}
      <line x1="20" y1="43" x2="4"  y2="33" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="44" y1="43" x2="60" y2="33" stroke="#3a2008" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="5"  y1="35" x2="0"  y2="28" stroke="#3a2008" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="59" y1="35" x2="64" y2="28" stroke="#3a2008" strokeWidth="1.6" strokeLinecap="round"/>
      {/* Scarf — Dominican flag colors */}
      <path d="M22,33 Q32,38 42,33 Q45,36 42,38 Q32,43 22,38 Q19,36 22,33 Z" fill="#002D62"/>
      <path d="M24,36 Q32,40 40,36 Q42,38 40,39 Q32,43 24,39 Q22,38 24,36 Z" fill="#CE1126"/>
      <path d="M27,38 Q32,41 37,38 Q38,39.5 37,40 Q32,42 27,40 Q26,39.5 27,38 Z" fill="white"/>
      <rect x="24" y="12" width="16" height="3"  rx="1.5" fill="#1a1a1a"/>
      <rect x="26" y="1"  width="12" height="12" rx="1"   fill="#222"/>
      <rect x="25" y="9"  width="14" height="2.5"         fill="#CE1126"/>
    </svg>
  );
}

/* ── Dominican flag pole (standalone) ── */
function VacFlagPole() {
  return (
    <svg style={{position:'absolute',bottom:'115px',left:'50%',transform:'translateX(-50%)',
      width:'80px',height:'92px',overflow:'visible',
      filter:'drop-shadow(0 4px 10px rgba(0,0,0,.32))'}}
      viewBox="-10 0 80 92">
      <defs>
        <linearGradient id="vacPoleLG" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"   stopColor="#3a5060"/>
          <stop offset="28%"  stopColor="#b8ccd6"/>
          <stop offset="52%"  stopColor="#9ab0bc"/>
          <stop offset="100%" stopColor="#2a3c48"/>
        </linearGradient>
      </defs>
      {/* Flag always up during vacation */}
      <g style={{animation:'flag-breeze 3.5s ease-in-out infinite',
        transformBox:'fill-box',transformOrigin:'right center'}}>
        <rect x="-52" y="2"  width="58" height="36" fill="#002D62"/>
        <rect x="-23" y="2"  width="29" height="18" fill="#CE1126"/>
        <rect x="-52" y="20" width="29" height="18" fill="#CE1126"/>
        <rect x="-52" y="16" width="58" height="7"  fill="#fff"/>
        <rect x="-26" y="2"  width="6"  height="36" fill="#fff"/>
      </g>
      <rect x="14"  y="0" width="6"   height="92" rx="3"    fill="rgba(0,0,0,.20)"/>
      <rect x="8"   y="0" width="9"   height="92" rx="4.5"  fill="url(#vacPoleLG)"/>
      <rect x="9.5" y="0" width="2.5" height="92" rx="1.25" fill="rgba(255,255,255,.20)"/>
      <rect x="4"   y="86" width="20" height="6"  rx="3"    fill="#7a9098"/>
      <circle cx="12"   cy="0"  r="7"   fill="#9a7010"/>
      <circle cx="12"   cy="-2" r="6"   fill="#c8a030"/>
      <circle cx="11.5" cy="-3" r="3.5" fill="#ecc840" opacity=".85"/>
    </svg>
  );
}

/* ── Holiday cottage (right side of scene) ── */
function HolidayCottage() {
  const LC = ['#FF3333','#33EE33','#4466FF','#FFEE33','#FF44FF','#33FFEE'];
  return (
    <svg style={{position:'absolute',bottom:'0',right:'0',width:'214px',height:'196px',overflow:'visible',
      filter:'drop-shadow(0 12px 30px rgba(0,0,0,.44))'}}
      viewBox="0 0 214 196">
      <rect x="20" y="184" width="174" height="12" rx="1" fill="#b0a898"/>
      {/* Walls */}
      <rect x="24" y="92"  width="166" height="92" fill="#ede6d5"/>
      <rect x="24" y="92"  width="14"  height="92" fill="rgba(0,0,0,.09)"/>
      <rect x="176" y="92" width="14"  height="92" fill="rgba(0,0,0,.07)"/>
      {/* Door */}
      <rect x="90" y="132" width="34" height="52" rx="2" fill="#4a2808"/>
      <path d="M90,148 Q107,124 124,148" fill="#4a2808"/>
      <path d="M92,148 Q107,128 122,148" fill="#7abacc" opacity=".45"/>
      <rect x="92"  y="152" width="13" height="18" rx="1.5" fill="rgba(0,0,0,.14)"/>
      <rect x="107" y="152" width="13" height="18" rx="1.5" fill="rgba(0,0,0,.14)"/>
      <circle cx="121" cy="163" r="2.5" fill="#d4a820"/>
      {/* Wreath on door */}
      <circle cx="107" cy="137" r="8.5" fill="none" stroke="#1a7a1a" strokeWidth="4.5"/>
      <circle cx="107" cy="137" r="8.5" fill="none" stroke="#28a028" strokeWidth="3" strokeDasharray="3,2"/>
      <path d="M104,130 Q107,127 110,130" fill="#CE1126"/>
      <path d="M104,130 Q101,126 103,123" fill="#CE1126"/>
      <path d="M110,130 Q113,126 111,123" fill="#CE1126"/>
      {[[101,134],[105,137],[110,136],[113,133],[107,130]].map(function(p, i) {
        return <circle key={i} cx={p[0]} cy={p[1]} r={1.8} fill="#ff2020"/>;
      })}
      <rect x="88" y="182" width="38" height="4" rx="1" fill="#b0a898"/>
      {/* Windows */}
      {[32, 136].map(function(x) {
        return (
          <g key={x}>
            <rect x={x}   y="100" width="34" height="30" rx="2.5" fill="#ede6d5"/>
            <rect x={x+2} y="102" width="30" height="26" rx="1.5" fill="#ffd060" opacity=".8"/>
            <line x1={x+17} y1="102" x2={x+17} y2="128" stroke="#c8b898" strokeWidth="1.5"/>
            <line x1={x}    y1="115" x2={x+34} y2="115" stroke="#c8b898" strokeWidth="1.5"/>
            <rect x={x-1} y="130" width="36" height="3.5" rx="1" fill="#d0c8b8"/>
            <rect x={x+15} y="107" width="4" height="9" rx="1.5" fill="#f8f0e0"/>
            <ellipse cx={x+17} cy={107} rx={2.5} ry={3.5} fill="#ffa820"
              style={{animation:'sunGlow 1.8s ease-in-out infinite',
                animationDelay: x === 32 ? '0s' : '.4s'}}/>
          </g>
        );
      })}
      {/* Roof */}
      <polygon points="14,94 107,16 200,94"   fill="#3a1a0a"/>
      <polygon points="18,94 107,20 196,94 194,94 107,24 20,94" fill="#4a2212"/>
      <polygon points="14,94 107,16 62,54"    fill="rgba(0,0,0,.14)"/>
      {/* Snow on roof */}
      <path d="M14,94 Q38,82 68,87 Q88,80 107,78 Q126,80 146,87 Q176,82 200,94 L200,97 Q176,85 146,90 Q126,83 107,81 Q88,83 68,90 Q38,85 14,97 Z" fill="white"/>
      {[18,38,58,78,98,118,138,158,178,196].map(function(x, i) {
        return <ellipse key={i} cx={x} cy={95} rx={5} ry={7} fill="white" opacity=".65"/>;
      })}
      {/* Chimney */}
      <rect x="144" y="20" width="24" height="56" fill="#7a3828"/>
      <rect x="141" y="20" width="30" height="7"  rx="1" fill="#5a2818"/>
      {[28,36,44,52].map(function(y) {
        return <line key={y} x1="144" y1={y} x2="168" y2={y} stroke="rgba(0,0,0,.13)" strokeWidth=".8"/>;
      })}
      <rect x="139" y="18" width="32" height="5" rx="2.5" fill="white"/>
      {/* Smoke */}
      <circle cx="156" cy="10" r="6.5" fill="#d0d0d0" opacity=".7"
        style={{animation:'sunGlow 3s ease-in-out infinite'}}/>
      <circle cx="150" cy="2"  r="5"   fill="#c0c0c0" opacity=".6"
        style={{animation:'sunGlow 3s ease-in-out infinite',animationDelay:'.6s'}}/>
      <circle cx="158" cy="-5" r="3.8" fill="#b8b8b8" opacity=".5"
        style={{animation:'sunGlow 3s ease-in-out infinite',animationDelay:'1.2s'}}/>
      {/* Christmas lights on eaves */}
      {[18,35,52,70,87,104,120,136,153,170,186,198].map(function(x, i) {
        const col = LC[i % LC.length];
        return (
          <g key={x}>
            <line x1={x} y1="94" x2={x+5} y2="103" stroke="#1a1a1a" strokeWidth=".8"/>
            <ellipse cx={x+4.5} cy={105} rx={4.5} ry={5.5} fill={col}
              style={{animation:'sunGlow '+(1.5+i*0.18)+'s ease-in-out infinite',
                animationDelay:(i*0.14)+'s',
                filter:'drop-shadow(0 0 5px '+col+')'}}/>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Santa's sleigh flying across sky ── */
function SantaSleigh() {
  return (
    <div style={{position:'absolute',top:'5%',pointerEvents:'none',zIndex:8,
      animation:'planeFly 900s linear infinite',animationDelay:'-140s'}}>
      <svg width="224" height="65" viewBox="0 0 224 65" style={{overflow:'visible'}}>
        {/* Reindeer × 4 */}
        {[0,42,84,126].map(function(ox, ri) {
          return (
            <g key={ri} style={{animation:'w-carry '+(1.38+ri*0.12)+'s ease-in-out infinite',
              transformBox:'fill-box',transformOrigin:'50% 60%'}}>
              <ellipse cx={ox+10} cy={30} rx={10} ry={5.5} fill="#4a2008"/>
              <circle  cx={ox+19} cy={24} r={4.5} fill="#4a2008"/>
              <line x1={ox+18} y1={20} x2={ox+15} y2={11} stroke="#3a1808" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1={ox+15} y1={11} x2={ox+12} y2={7}  stroke="#3a1808" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1={ox+15} y1={11} x2={ox+18} y2={7}  stroke="#3a1808" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1={ox+20} y1={20} x2={ox+23} y2={11} stroke="#3a1808" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1={ox+23} y1={11} x2={ox+20} y2={7}  stroke="#3a1808" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1={ox+23} y1={11} x2={ox+26} y2={7}  stroke="#3a1808" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1={ox+5}  y1={35} x2={ox+3}  y2={44} stroke="#3a1808" strokeWidth="2" strokeLinecap="round"/>
              <line x1={ox+10} y1={35} x2={ox+9}  y2={44} stroke="#3a1808" strokeWidth="2" strokeLinecap="round"/>
              <line x1={ox+14} y1={35} x2={ox+15} y2={44} stroke="#3a1808" strokeWidth="2" strokeLinecap="round"/>
              <line x1={ox+19} y1={35} x2={ox+20} y2={44} stroke="#3a1808" strokeWidth="2" strokeLinecap="round"/>
              {ri === 3 && (
                <circle cx={ox+23} cy={24} r={2.5} fill="#ff2020"
                  style={{animation:'sunGlow 1.2s ease-in-out infinite'}}/>
              )}
            </g>
          );
        })}
        {/* Reins */}
        <path d="M22,27 Q64,20 105,22 Q148,20 168,24"
          fill="none" stroke="#7a5018" strokeWidth="1.2" strokeDasharray="3,1.5"/>
        {/* Sleigh body */}
        <path d="M162,10 Q175,5 184,14 L181,40 L162,42 Z" fill="#CE1126" stroke="#8a0a0a" strokeWidth="1"/>
        <rect x="158" y="22" width="40" height="16" rx="3" fill="#CE1126" stroke="#8a0a0a" strokeWidth="1"/>
        <path d="M156,38 Q165,48 206,46 Q213,44 215,38"
          fill="none" stroke="#d4c020" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Gift sack */}
        <ellipse cx="166" cy="24" rx="12" ry="15" fill="#CE1126"/>
        <ellipse cx="166" cy="10" rx="8"  ry="5"  fill="#a80820"/>
        <ellipse cx="166" cy="12" rx="7"  ry="2.5" fill="#a80820"/>
        <path d="M159,10 Q166,4 173,10" fill="none" stroke="#f5c518" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Santa */}
        <circle cx="194" cy="20" r="6.5" fill="#f4c89a"/>
        <ellipse cx="194" cy="31" rx="8" ry="9" fill="#CE1126"/>
        <path d="M188,22 Q194,33 200,22" fill="white" opacity=".95"/>
        <path d="M188,17 L193,7 L200,17" fill="#CE1126"/>
        <rect x="186" y="16" width="16" height="3" rx="1.5" fill="white"/>
        <circle cx="193" cy="6" r="2.5" fill="white"/>
        <g style={{animation:'w-inspect 2s ease-in-out infinite',transformBox:'fill-box',transformOrigin:'50% 30%'}}>
          <line x1="189" y1="29" x2="179" y2="23" stroke="#CE1126" strokeWidth="3.5" strokeLinecap="round"/>
          <circle cx="178" cy="22" r="3" fill="#f4c89a"/>
        </g>
        {/* Magic sparkles trail */}
        {[[-8,23],[-18,14],[-28,24],[-15,35]].map(function(p, i) {
          return (
            <circle key={i} cx={p[0]} cy={p[1]} r={1.8} fill="#ffd700" opacity=".65"
              style={{animation:'sunGlow '+(1.2+i*0.3)+'s ease-in-out infinite',
                animationDelay:(i*0.18)+'s'}}/>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Animated holiday scene ── */
function VacScene({ workers, dayRecords, onToggle, totalCount }) {
  const [clock, setClock] = React.useState(function() { return new Date(); });
  React.useEffect(function() {
    const id = setInterval(function() { setClock(new Date()); }, 1000);
    return function() { clearInterval(id); };
  }, []);

  const hours   = clock.getHours() + clock.getMinutes() / 60;
  const isNight = hours >= 20 || hours < 6;
  const skyGrad = isNight
    ? 'linear-gradient(180deg,#01030f 0%,#04091a 55%,#091028 100%)'
    : (hours >= 18
      ? 'linear-gradient(180deg,#060e2a 0%,#111c44 55%,#1c2858 100%)'
      : 'linear-gradient(180deg,#0d1538 0%,#1a2860 55%,#243278 100%)');

  return (
    <div style={{position:'relative',width:'100%',maxWidth:'960px',
      marginLeft:'auto',marginRight:'auto',height:'340px',
      borderRadius:'var(--radius-lg)',overflow:'hidden',
      boxShadow:'var(--shadow-md)',border:'1px solid var(--ink-100)'}}>

      {/* Sky */}
      <div style={{position:'absolute',inset:0,background:skyGrad,transition:'background 90s linear'}}/>

      {/* Stars — always visible for Christmas atmosphere */}
      {VAC_STARS.map(function(s, i) {
        return (
          <div key={i} style={{
            position:'absolute', left:s.x+'%', top:s.y+'%',
            width: i%3===0 ? '2.5px' : '1.5px',
            height: i%3===0 ? '2.5px' : '1.5px',
            borderRadius:'50%', background:'#fff',
            opacity:(isNight?0.92:0.52)*(0.4+(i%4)*0.15),
            transition:'opacity 90s linear',
            animation:'sunGlow '+(2+i*0.35)+'s ease-in-out infinite'}}/>
        );
      })}

      {/* Crescent moon */}
      <div style={{position:'absolute',right:'13%',top:'7%',
        opacity:isNight?0.95:0.52,transition:'opacity 90s linear'}}>
        <div style={{position:'relative',width:'34px',height:'34px'}}>
          <div style={{width:'34px',height:'34px',borderRadius:'50%',background:'#f2eacc',
            boxShadow:'0 0 16px rgba(242,234,204,.5),0 0 32px rgba(242,234,204,.2)'}}/>
          <div style={{position:'absolute',top:'-2px',left:'10px',width:'34px',height:'34px',
            borderRadius:'50%',background:isNight?'#01030f':'#060e2a'}}/>
        </div>
      </div>

      {/* Snow clouds */}
      <div style={{position:'absolute',top:'18px',left:'8%',
        animation:'cloudDrift 16s ease-in-out infinite',opacity:.52}}>
        <div style={{position:'relative',width:'92px',height:'38px'}}>
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:'22px',
            background:'rgba(208,218,242,.72)',borderRadius:'28px'}}/>
          <div style={{position:'absolute',bottom:'13px',left:'16px',width:'38px',height:'32px',
            background:'rgba(208,218,242,.72)',borderRadius:'50%'}}/>
          <div style={{position:'absolute',bottom:'11px',left:'40px',width:'28px',height:'26px',
            background:'rgba(208,218,242,.72)',borderRadius:'50%'}}/>
        </div>
      </div>
      <div style={{position:'absolute',top:'32px',left:'42%',
        animation:'cloudDriftSlow 20s ease-in-out infinite',animationDelay:'-9s',opacity:.42}}>
        <div style={{position:'relative',width:'68px',height:'28px'}}>
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:'16px',
            background:'rgba(208,218,242,.68)',borderRadius:'20px'}}/>
          <div style={{position:'absolute',bottom:'9px',left:'12px',width:'28px',height:'24px',
            background:'rgba(208,218,242,.68)',borderRadius:'50%'}}/>
        </div>
      </div>

      {/* Santa's sleigh */}
      <SantaSleigh/>

      {/* Background snow hills */}
      <svg style={{position:'absolute',bottom:'115px',left:0,width:'100%',height:'90px'}}
        viewBox="0 0 800 90" preserveAspectRatio="none">
        <path d="M0,90 Q180,10 360,50 Q540,90 720,18 Q760,6 800,34 L800,90Z"
          fill="rgba(120,148,196,.35)"/>
        <path d="M0,90 Q160,36 340,64 Q500,90 660,40 Q730,22 800,56 L800,90Z"
          fill="rgba(150,172,218,.52)"/>
        <path d="M0,62 Q40,38 80,52 Q60,32 40,46 Q20,30 0,40Z"   fill="rgba(235,244,255,.42)"/>
        <path d="M168,42 Q208,12 248,36 Q228,18 208,30 Q190,12 168,28Z" fill="rgba(235,244,255,.38)"/>
        <path d="M655,28 Q700,6 742,20 Q722,5 702,16 Q684,4 660,17Z"  fill="rgba(235,244,255,.38)"/>
      </svg>

      {/* Snow ground */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'116px',
        background:'linear-gradient(180deg,#c6d8ee 0%,#b6c8de 35%,#a6b8ce 65%,#96a8be 100%)'}}/>
      {/* Sidewalk */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'38px',
        background:'linear-gradient(180deg,#b4c6da 0%,#a4b6ca 60%,#94a6ba 100%)'}}/>
      {/* Snow texture at ground edge */}
      <svg style={{position:'absolute',bottom:'38px',left:0,width:'100%',height:'18px',pointerEvents:'none'}}
        viewBox="0 0 800 18" preserveAspectRatio="none">
        <path d="M0,18 Q50,6 100,13 Q150,6 200,12 Q250,5 300,12 Q350,6 400,12 Q450,5 500,12 Q550,6 600,12 Q650,5 700,12 Q750,6 800,11 L800,18Z"
          fill="#c6d8ee"/>
      </svg>
      {/* Center snow path */}
      <svg style={{position:'absolute',bottom:'38px',left:0,width:'100%',height:'78px',overflow:'visible',pointerEvents:'none'}}
        viewBox="0 0 800 78" preserveAspectRatio="none">
        <path d="M340,78 L420,78 L460,0 L300,0 Z" fill="#a4b6ca" opacity=".5"/>
        {[14,28,42,56].map(function(y) {
          return <line key={y} x1="305" y1={y} x2="455" y2={y} stroke="rgba(255,255,255,.10)" strokeWidth="1.5"/>;
        })}
      </svg>

      {/* Scene elements */}
      <VacTree/>
      <VacSnowman/>
      <VacFlagPole/>
      <HolidayCottage/>

      {/* Snowflakes */}
      <SnowParticles/>

      {/* Workers — two rows in the center field */}
      {totalCount > 0 && (function() {
        const front = [], back = [];
        workers.forEach(function(emp, i) {
          if (!dayRecords[emp.id]) return;
          (i < 5 ? front : back).push({ emp: emp, i: i });
        });
        const rowStyle = function(bottom, z) {
          return {
            position:'absolute', left:'150px', right:'220px', bottom:bottom,
            display:'flex', justifyContent:'space-evenly', alignItems:'flex-end',
            pointerEvents:'none', zIndex:z
          };
        };
        return (
          <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,pointerEvents:'none',zIndex:6}}>
            {front.length > 0 && (
              <div style={rowStyle('58px', 6)}>
                {front.map(function(e) {
                  return (
                    <div key={e.emp.id} style={{pointerEvents:'auto',
                      animation:'fighter-in .35s cubic-bezier(0.17,0.67,0.35,1) both',
                      animationDelay:(e.i*0.07)+'s'}}>
                      <VacWorker emp={e.emp} onToggle={onToggle} slotIndex={e.i} totalCount={totalCount}/>
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
                      <VacWorker emp={e.emp} onToggle={onToggle} slotIndex={e.i} totalCount={totalCount}/>
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

/* ── VacDateNav — mirrors LiceoDateNav ── */
function VacDateNav({ viewDate, setViewDate, navDate, fmtDate, isES, daily, rosterOpen }) {
  const [open,     setOpen]     = React.useState(false);
  const [picked,   setPicked]   = React.useState(false);
  const [calReady, setCalReady] = React.useState(false);
  const [calPos,   setCalPos]   = React.useState({ top: 0, centerX: 0 });
  const navRef  = React.useRef(null);
  const trigRef = React.useRef(null);
  const calRef  = React.useRef(null);
  const today   = new Date().toLocaleDateString('en-CA');

  const parseISO = function(iso) {
    const p = iso.split('-').map(Number);
    return { y: p[0], m: p[1]-1, d: p[2] };
  };

  const computePos = function() {
    if (!trigRef.current || !navRef.current) return;
    const tr   = trigRef.current.getBoundingClientRect();
    const wr   = navRef.current.getBoundingClientRect();
    const calW = calRef.current ? calRef.current.offsetWidth : 260;
    const raw  = tr.left + tr.width / 2;
    const clamped = Math.max(calW/2+8, Math.min(window.innerWidth - calW/2 - 8, raw));
    setCalPos({ top: wr.bottom + 6, centerX: clamped });
  };

  React.useEffect(function() {
    if (open) { computePos(); setCalReady(true); }
    else { setCalReady(false); }
  }, [open]);

  const trackTransition = React.useCallback(function(duration) {
    const start = Date.now();
    const tick  = function() {
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
    const onOut = function(e) {
      if (trigRef.current && trigRef.current.contains(e.target)) return;
      if (calRef.current  && calRef.current.contains(e.target))  return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onOut);
    return function() { document.removeEventListener('mousedown', onOut); };
  }, [open]);

  const sel = parseISO(viewDate);
  const now = parseISO(today);
  const [month, setMonth] = React.useState(sel.m);
  const [year,  setYear]  = React.useState(sel.y);

  React.useEffect(function() {
    const p = parseISO(viewDate);
    setMonth(p.m); setYear(p.y);
  }, [viewDate]);

  const MONTHS_CAL  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DOW         = isES ? ['D','L','M','X','J','V','S'] : ['S','M','T','W','T','F','S'];
  const firstDow    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  const prevMo   = function() { month === 0  ? (setMonth(11), setYear(function(y) { return y-1; })) : setMonth(function(m) { return m-1; }); };
  const nextMo   = function() { month === 11 ? (setMonth(0),  setYear(function(y) { return y+1; })) : setMonth(function(m) { return m+1; }); };
  const prevYear = function() { setYear(function(y) { return y-1; }); };
  const nextYear = function() { setYear(function(y) { return y+1; }); };

  const hasRecords = function(d) {
    const iso = year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const rec = daily && daily[iso];
    return rec && Object.keys(rec).length > 0;
  };

  const pick = function(d) {
    const iso = year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    setViewDate(iso);
    setPicked(true);
    setOpen(false);
  };

  return (
    <div ref={navRef}
      onMouseDown={function(e) { e.preventDefault(); }}
      style={{display:'flex',alignItems:'center',gap:'10px',justifyContent:'center',width:'100%'}}>

      <button className="dp-cal__arrow" tabIndex={-1} onClick={function() { navDate(-1); }}>‹</button>

      <div ref={trigRef}>
        <button type="button" tabIndex={-1}
          onMouseDown={function(e) { e.preventDefault(); }}
          onClick={function() { setOpen(function(o) { if (!o) setPicked(false); return !o; }); }}
          className="farm-date-pill"
          style={{display:'flex',alignItems:'center',gap:'7px',
            background: open ? 'var(--ink-100)' : 'transparent',
            border:'1.5px solid '+(open ? 'var(--accent)' : 'var(--ink-200,#ddd)'),
            borderRadius:'8px',padding:'6px 14px',cursor:'pointer',
            transition:'background .15s,border-color .2s',
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

      <button className="dp-cal__arrow" tabIndex={-1} onClick={function() { navDate(1); }}>›</button>

      {ReactDOM.createPortal(
        <div onMouseDown={function(e) { if (open) e.preventDefault(); }}
          style={{position:'fixed',top:calPos.top,left:calPos.centerX,
            transform:'translateX(-50%)',zIndex:9999,
            pointerEvents:(open && calReady) ? 'auto' : 'none',
            visibility:(open && calReady) ? 'visible' : 'hidden'}}>
          <div ref={calRef} className="dp-cal"
            style={{boxShadow:'0 16px 48px rgba(0,0,0,.18)',animation:'none'}}>
            <div className="dp-cal__nav">
              <button tabIndex={-1} type="button" className="dp-cal__arrow" onClick={prevYear}>«</button>
              <button tabIndex={-1} type="button" className="dp-cal__arrow" onClick={prevMo}>‹</button>
              <span className="dp-cal__month">{MONTHS_CAL[month]} {year}</span>
              <button tabIndex={-1} type="button" className="dp-cal__arrow" onClick={nextMo}>›</button>
              <button tabIndex={-1} type="button" className="dp-cal__arrow" onClick={nextYear}>»</button>
            </div>
            <div className="dp-cal__grid">
              {DOW.map(function(d) { return <span key={d} className="dp-cal__dow">{d}</span>; })}
              {Array.from({length:firstDow}).map(function(_, i) { return <span key={'b'+i}/>; })}
              {Array.from({length:daysInMonth}, function(_, i) {
                const d      = i + 1;
                const isSel  = sel.d === d && sel.m === month && sel.y === year;
                const isNow  = now.d === d && now.m === month && now.y === year;
                const hasRec = hasRecords(d);
                return (
                  <button tabIndex={-1} type="button" key={d}
                    className={'dp-cal__day'+(isSel?' dp-cal__day--sel':'')+(isNow&&!picked?' dp-cal__day--today':'')}
                    onClick={function() { pick(d); }}
                    style={isSel ? {} : hasRec ? {
                      background:'#d4edda',color:'#1a5c1a',fontWeight:700,
                      borderRadius:'6px',border:'1.5px solid #7ec89a',position:'relative'
                    } : {}}>
                    {d}
                    {hasRec && !isSel && (
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

/* ── Scheduled presence (mirrors getLiceoScheduledPresence) ── */
function getVacScheduledPresence(empObjects) {
  const now      = new Date();
  const todayDay = now.getDay();
  const nowMin   = now.getHours() * 60 + now.getMinutes();
  const result   = {};
  empObjects.forEach(function(emp) {
    if (!emp || !emp.schedule) return;
    const dayEntry = emp.schedule[todayDay];
    if (!dayEntry) return;
    const parseT = function(t) {
      if (!t) return null;
      const parts = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!parts) return null;
      let h = parseInt(parts[1]), m = parseInt(parts[2]);
      if (parts[3].toUpperCase() === 'PM' && h !== 12) h += 12;
      if (parts[3].toUpperCase() === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };
    const start = parseT(dayEntry.start);
    const end   = parseT(dayEntry.end);
    if (start === null || end === null) return;
    if (nowMin >= start && nowMin <= end) result[emp.id] = true;
  });
  return result;
}

/* ── VacacionesView — main component ── */
function VacacionesView({ t, lang, setRoute }) {
  const today = new Date().toLocaleDateString('en-CA');
  const isES  = lang === 'es';

  /* Lock scroll while mounted */
  React.useEffect(function() {
    const html  = document.documentElement;
    const body  = document.body;
    const prevH = html.style.overflow;
    const prevB = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return function() {
      html.style.overflow = prevH;
      body.style.overflow = prevB;
    };
  }, []);

  const [vacEmps,          setVacEmps]          = React.useState(getVacEmps);
  const [daily,            setDaily]            = React.useState(getVacDaily);
  const [viewDate,         setViewDate]         = React.useState(today);
  const [searchQ,          setSearchQ]          = React.useState(false);
  const [searchVal,        setSearchVal]        = React.useState('');
  const [rosterOpen,       setRosterOpen]       = React.useState(true);
  const [flash,            setFlash]            = React.useState(null);
  const [isDirty,          setIsDirty]          = React.useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = React.useState(false);

  const vacEmpObjects = React.useMemo(function() {
    return vacEmps
      .map(function(id) { return EMPLOYEES.find(function(e) { return e.id === id; }); })
      .filter(Boolean);
  }, [vacEmps]);

  const [draft, setDraft] = React.useState(function() {
    const saved = getVacDaily()[today];
    if (saved) return saved;
    const objs = getVacEmps()
      .map(function(id) { return EMPLOYEES.find(function(e) { return e.id === id; }); })
      .filter(Boolean);
    return getVacScheduledPresence(objs);
  });

  const flashTimerRef = React.useRef(null);

  React.useEffect(function() {
    const saved = daily[viewDate];
    if (saved) {
      setDraft(saved);
    } else if (viewDate === today) {
      setDraft(getVacScheduledPresence(vacEmpObjects));
    } else {
      setDraft({});
    }
    setIsDirty(false);
    setConfirmOverwrite(false);
  }, [viewDate, daily]);

  React.useEffect(function() {
    return function() { if (flashTimerRef.current) clearTimeout(flashTimerRef.current); };
  }, []);

  const canManage = typeof userHasPermission === 'function'
    ? (userHasPermission('vacaciones') || userHasPermission('admin'))
    : true;

  const presentCount = React.useMemo(function() {
    return vacEmpObjects.filter(function(e) { return !!draft[e.id]; }).length;
  }, [vacEmpObjects, draft]);

  const absentCount    = vacEmpObjects.length - presentCount;
  const totalCount     = vacEmpObjects.length;
  const sceneWorkers   = vacEmpObjects.slice(0, MAX_VAC_SCENE);
  const isToday        = viewDate === today;
  const isAlreadySaved = !!(daily[viewDate] && Object.keys(daily[viewDate]).length);

  const showFlash = function(msg) {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setFlash(msg);
    flashTimerRef.current = setTimeout(function() { setFlash(null); }, 2000);
  };

  const togglePresent = function(empId) {
    const next = Object.assign({}, draft);
    if (next[empId]) delete next[empId];
    else next[empId] = true;
    setDraft(next);
    setIsDirty(true);
  };

  const markAllPresent = function() {
    const next = {};
    vacEmpObjects.forEach(function(e) { next[e.id] = true; });
    setDraft(next);
    setIsDirty(true);
  };

  const clearAll = function() { setDraft({}); setIsDirty(true); };

  const saveAttendance = function() {
    const filtered = {};
    vacEmpObjects.forEach(function(e) { if (draft[e.id]) filtered[e.id] = true; });
    const records = Object.assign({}, daily);
    if (!Object.keys(filtered).length) delete records[viewDate];
    else records[viewDate] = filtered;
    setDaily(records);
    saveVacDaily(records);

    /* Bridge: sync with dashboard attendance store */
    let att = {}, abs = {};
    try { att = JSON.parse(localStorage.getItem('uasd_daily_attendance') || '{}'); } catch(ex) {}
    try { abs = JSON.parse(localStorage.getItem('uasd_absences')          || '{}'); } catch(ex) {}

    const baseTs = Date.now();
    vacEmpObjects.forEach(function(emp, idx) {
      const attKey   = emp.id + ':' + viewDate;
      const presente = !!filtered[emp.id];
      if (presente) {
        if (abs[emp.id]) {
          abs[emp.id] = abs[emp.id].filter(function(a) {
            return !(a.date === viewDate && a.source === 'vacaciones');
          });
          if (!abs[emp.id].length) delete abs[emp.id];
        }
        if (!att[attKey] || att[attKey].source === 'vacaciones') {
          const hora = viewDate === today
            ? new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })
            : '—';
          att[attKey] = { empId: emp.id, date: viewDate, time: hora, late: false, source: 'vacaciones' };
        }
      } else {
        if (att[attKey] && att[attKey].source === 'vacaciones') delete att[attKey];
        const absArr   = abs[emp.id] || [];
        const yaExiste = absArr.some(function(a) { return a.date === viewDate && a.source === 'vacaciones'; });
        if (!yaExiste && typeof isHoliday === 'function' && !isHoliday(viewDate)) {
          abs[emp.id] = absArr.concat([{
            id: baseTs * 100 + idx, date: viewDate,
            justified: false, justifyNote: '', source: 'vacaciones'
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

  const addToVac = function(empId) {
    if (vacEmps.includes(empId)) return;
    const list = vacEmps.concat([empId]);
    setVacEmps(list);
    saveVacEmps(list);
    setSearchVal('');
  };

  const removeFromVac = function(empId) {
    const list = vacEmps.filter(function(id) { return id !== empId; });
    setVacEmps(list);
    saveVacEmps(list);
    const records = Object.assign({}, daily);
    Object.keys(records).forEach(function(date) {
      if (records[date] && records[date][empId]) {
        records[date] = Object.assign({}, records[date]);
        delete records[date][empId];
        if (!Object.keys(records[date]).length) delete records[date];
      }
    });
    setDaily(records);
    saveVacDaily(records);
    setDraft(function(prev) {
      const next = Object.assign({}, prev);
      delete next[empId];
      return next;
    });
  };

  const navDate = function(offset) {
    const parts = viewDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1]-1, parts[2]);
    d.setDate(d.getDate() + offset);
    setViewDate(d.toLocaleDateString('en-CA'));
  };

  const fmtDate = function(iso) {
    const parts     = iso.split('-').map(Number);
    const date      = new Date(parts[0], parts[1]-1, parts[2]);
    const dayName   = (DAYS_ES   || [])[date.getDay()] || '';
    const monthName = (MONTHS_ES || [])[parts[1]-1]    || '';
    return isES
      ? (dayName + ', ' + parts[2] + ' de ' + monthName + ' ' + parts[0])
      : date.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  };

  const availableEmps = React.useMemo(function() {
    return EMPLOYEES.filter(function(e) { return !vacEmps.includes(e.id) && e.status !== 'inactive'; });
  }, [vacEmps]);

  const filteredAvailable = React.useMemo(function() {
    if (!searchVal) return availableEmps;
    const q = searchVal.toLowerCase();
    return availableEmps.filter(function(e) {
      return e.name.toLowerCase().includes(q) ||
             e.id.toLowerCase().includes(q)   ||
             (e.cedula || '').includes(searchVal);
    });
  }, [availableEmps, searchVal]);

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <div className="page__title">{isES ? 'Vacaciones Colectivas' : 'Collective Vacation'}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginLeft:'auto'}}>
          <VacDateNav
            viewDate={viewDate} setViewDate={setViewDate}
            navDate={navDate} fmtDate={fmtDate}
            isES={isES} daily={daily} rosterOpen={true}/>
          {!isToday && (
            <button type="button" onClick={function() { setViewDate(today); }}
              className="btn btn--ghost"
              style={{fontSize:'11px',padding:'5px 12px',whiteSpace:'nowrap'}}>
              {isES ? '↩ Hoy' : '↩ Today'}
            </button>
          )}
        </div>
      </div>

      <div style={{display:'flex',gap:'16px',alignItems:'flex-start'}}>

        {/* Roster (full width) */}
        <div style={{flex:1,minWidth:0,overflow:'hidden'}}>
        <div className="activity-map__left" style={{gap:0, width:'100%'}}>

          <div style={{display:'flex',flexDirection:'column',gap:'10px',width:'100%',paddingBottom:'14px'}}>
            <span className="activity-map__label" style={{margin:0}}>
              {isES ? 'Personal' : 'Staff'}
              <span style={{fontWeight:400,color:'var(--ink-300)',marginLeft:'6px',fontSize:'12px',
                textTransform:'none',letterSpacing:0}}>
                ({totalCount})
              </span>
            </span>
            <div style={{display:'flex',alignItems:'center',gap:'10px',width:'100%'}}>
              {canManage && (
                <button
                  className={'kpi__pill kpi__pill--btn'+(searchQ ? ' kpi__pill--btn--close' : '')}
                  style={{padding:'7px 13px',fontSize:'12px',gap:'6px',justifyContent:'center'}}
                  onClick={function() { setSearchQ(function(p) { return !p; }); setSearchVal(''); }}>
                  <Icon name={searchQ ? 'x' : 'userPlus'} size={14}/>
                  {searchQ ? (isES ? 'Cerrar' : 'Close') : (isES ? 'Agregar' : 'Add')}
                </button>
              )}
              {totalCount > 0 && (
                <button
                  style={presentCount === totalCount
                    ? {padding:'7px 13px',fontSize:'12px',gap:'6px',justifyContent:'center',
                       color:'var(--danger)',borderColor:'rgba(193,85,77,0.4)',
                       background:'rgba(193,85,77,0.06)'}
                    : {padding:'7px 13px',fontSize:'12px',gap:'6px',justifyContent:'center'}}
                  className={presentCount === totalCount
                    ? 'kpi__pill kpi__pill--btn kpi__pill--btn--close'
                    : 'kpi__pill kpi__pill--up'}
                  onClick={presentCount === totalCount ? clearAll : markAllPresent}>
                  <Icon name={presentCount === totalCount ? 'x' : 'check'} size={14}
                    stroke={presentCount === totalCount ? 1.6 : 2.4}/>
                  {presentCount === totalCount
                    ? (isES ? 'Limpiar' : 'Clear')
                    : (isES ? 'Confirmar todos' : 'Confirm all')}
                </button>
              )}
            </div>

            <div style={{maxHeight: searchQ ? '300px' : '0', overflow:'hidden',
              transition:'max-height .42s cubic-bezier(0.22,1,0.36,1)'}}>
              <div style={{opacity: searchQ ? 1 : 0,
                transform: searchQ ? 'translateY(0)' : 'translateY(-10px)',
                transition:'opacity .32s ease, transform .4s cubic-bezier(0.22,1,0.36,1)',
                paddingTop:'4px', width:'100%', display:'flex', flexDirection:'column', gap:'6px'}}>
                <div className="toolbar__search" style={{width:'100%'}}>
                  <span className="toolbar__search-icon"><Icon name="search" size={15}/></span>
                  <input value={searchVal} onChange={function(e) { setSearchVal(e.target.value); }}
                    placeholder={isES ? 'Buscar empleado…' : 'Search employee…'}
                    autoFocus style={{background:'var(--paper)'}}/>
                  {searchVal && (
                    <button className="toolbar__search-clear"
                      onClick={function() { setSearchVal(''); }} aria-label="Limpiar">
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
                      <button key={e.id} onClick={function() { addToVac(e.id); }}
                        style={{display:'block',width:'100%',textAlign:'left',padding:'10px 14px',
                          fontSize:'13px',border:'none',background:'transparent',outline:'none',
                          cursor:'pointer',transition:'background .1s'}}
                        onMouseEnter={function(ev) { ev.currentTarget.style.background = 'var(--cream-50)'; }}
                        onMouseLeave={function(ev) { ev.currentTarget.style.background = 'transparent'; }}>
                        <div style={{fontWeight:600}}>{e.name}</div>
                        <div style={{fontSize:'11px',color:'var(--ink-300)'}}>
                          <span className="mono">{e.id}</span> · {e.dept}
                        </div>
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
              <div className="audit-empty__title">
                {isES ? 'Sin personal asignado' : 'No staff assigned'}
              </div>
              <div className="audit-empty__sub">
                {canManage
                  ? (isES
                    ? 'Usa «Agregar» para asignar personal a vacaciones.'
                    : 'Use «Add» to assign staff to vacation.')
                  : (isES
                    ? 'Contacta a un administrador para ser asignado.'
                    : 'Contact an administrator to be assigned.')}
              </div>
            </div>
          )}

          {totalCount > 0 && (
            <div style={{display:'flex',flexDirection:'column'}}>
              {vacEmpObjects.map(function(emp, idx) {
                const present  = !!draft[emp.id];
                const offScene = idx >= MAX_VAC_SCENE;
                return (
                  <div key={emp.id} style={{animation:'roster-in .32s cubic-bezier(0.22,1,0.36,1) both',
                    animationDelay:(idx * 0.04)+'s'}}>
                  <div className="audit-entry role-assignee-row"
                    style={{alignItems:'center',padding:'14px 0',
                      borderTop: idx === 0 || idx === MAX_VAC_SCENE ? 'none' : '1px solid var(--ink-100)',
                      opacity: offScene ? 0.7 : 1}}>
                    <div style={{width:'38px',height:'38px',borderRadius:'50%',flexShrink:0,
                      display:'grid',placeItems:'center',fontSize:'13px',fontWeight:700,
                      background:'var(--ink-200)',color:'var(--ink-600)'}}>
                      {emp.name.split(' ').slice(0,2).map(function(p) { return p[0]; }).join('').toUpperCase()}
                    </div>
                    <div className="audit-entry__body">
                      <div className="audit-entry__row" style={{marginBottom:'3px'}}>
                        <span style={{fontWeight:600,fontSize:'14px'}}>{emp.name}</span>
                      </div>
                      <div className="audit-entry__row" style={{marginBottom:0,gap:'5px'}}>
                        <span className="az__dept">{emp.dept}</span>
                        <span className="az__last" style={{fontSize:'11px'}}>
                          · <span className="mono">{emp.id}</span>
                        </span>
                      </div>
                    </div>
                    <div onClick={function() { togglePresent(emp.id); }}
                      title={present
                        ? (isES ? 'Marcar ausente' : 'Mark absent')
                        : (isES ? 'Marcar presente' : 'Mark present')}
                      style={{width:'36px',height:'20px',borderRadius:'10px',flexShrink:0,
                        background: present ? '#2d5a27' : 'var(--ink-200)',
                        position:'relative',cursor:'pointer',
                        transition:'background .2s ease',
                        boxShadow: present
                          ? 'inset 0 1px 3px rgba(0,0,0,.2)'
                          : 'inset 0 1px 3px rgba(0,0,0,.1)'}}>
                      <div style={{position:'absolute',top:'2px',
                        left: present ? '18px' : '2px',
                        width:'16px',height:'16px',borderRadius:'50%',background:'#fff',
                        boxShadow:'0 1px 3px rgba(0,0,0,.25)',transition:'left .18s ease'}}/>
                    </div>
                    {canManage && (
                      <div className="role-assignee-actions" style={{display:'flex',flexShrink:0}}>
                        <button className="table__action-btn table__action-btn--del"
                          onClick={function() { removeFromVac(emp.id); }}
                          title={isES ? 'Quitar de vacaciones' : 'Remove from vacation'}
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
                  onClick={function() { isAlreadySaved ? setConfirmOverwrite(true) : saveAttendance(); }}
                  style={{padding:'7px 14px',fontSize:'12px'}}>
                  {isES ? 'Guardar' : 'Save'}
                </button>
              </div>
            </div>
          )}

          {flash && (
            <div style={{alignSelf:'center',marginTop:'10px',display:'flex',alignItems:'center',gap:'7px',
              whiteSpace:'nowrap',pointerEvents:'none',
              background:'var(--ink-800)',color:'var(--cream-100)',
              padding:'10px 18px',borderRadius:'999px',
              fontFamily:'var(--font-sans)',fontSize:'12px',fontWeight:600,letterSpacing:'.04em',
              animation:'flashFincaLife 2s ease both'}}>
              <Icon name="check" size={13} stroke={3.2}/>
              {flash}
            </div>
          )}

        </div>{/* /activity-map__left */}
        </div>{/* /roster wrapper */}

      </div>

      {/* Overwrite confirm modal */}
      {confirmOverwrite && (
        <div className="edit-overlay" onClick={function() { setConfirmOverwrite(false); }}>
          <div className="del-confirm" onClick={function(e) { e.stopPropagation(); }}>
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
                  : 'This day already has saved attendance. Confirming will replace it.'}
              </div>
              <div className="del-confirm__id mono">{fmtDate(viewDate)}</div>
            </div>
            <div className="del-confirm__foot">
              <button className="btn btn--ghost" onClick={function() { setConfirmOverwrite(false); }}>
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

Object.assign(window, { VacacionesView });
