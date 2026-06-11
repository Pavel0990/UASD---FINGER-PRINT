/* fingerprint.jsx — Reusable fingerprint scanner SVG + scanner widget */

/* Hand-drawn fingerprint as concentric loops (original, simplified) */
const FingerprintSVG = () =>
<svg viewBox="30 28 140 192" preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%" }}>
    {/* Outer rings */}
    <path d="M 30 130 Q 30 50 100 30 Q 170 50 170 130" />
    <path d="M 42 145 Q 42 65 100 48 Q 158 65 158 145" />
    <path d="M 55 158 Q 55 80 100 65 Q 145 80 145 158" />
    <path d="M 68 168 Q 68 95 100 82 Q 132 95 132 168" />
    <path d="M 80 175 Q 80 110 100 100 Q 120 110 120 175" />

    {/* Inner loop swirl */}
    <path d="M 92 175 Q 92 130 100 122 Q 110 130 110 175" />
    <path d="M 100 175 Q 100 145 100 145" />

    {/* Lower curls — bottom strokes that follow finger shape */}
    <path d="M 30 130 Q 38 175 60 200" />
    <path d="M 42 145 Q 50 180 70 205" />
    <path d="M 55 158 Q 62 188 80 210" />
    <path d="M 68 168 Q 73 192 90 215" />
    <path d="M 80 175 Q 84 198 100 218" />

    <path d="M 170 130 Q 162 175 140 200" />
    <path d="M 158 145 Q 150 180 130 205" />
    <path d="M 145 158 Q 138 188 120 210" />
    <path d="M 132 168 Q 127 192 110 215" />
    <path d="M 120 175 Q 116 198 100 218" />

    {/* Minutiae detail dots */}
    <circle cx="100" cy="80" r="1.4" />
    <circle cx="76" cy="120" r="1.4" />
    <circle cx="124" cy="120" r="1.4" />
    <circle cx="100" cy="160" r="1.4" />
  </svg>;


/* Scanner widget — used in kiosk + registration capture */
function FingerprintScanner({ state = 'idle' /* idle | scanning | success | error */, size = 280 }) {
  return (
    <div className={`scanner scanner--${state}`} style={{ width: size, height: size * 1.14 }}>
      <div className="scanner__ring scanner__ring--3"></div>
      <div className="scanner__ring scanner__ring--2"></div>
      <div className="scanner__ring"></div>
      <div className="scanner__plate"></div>
      <div className="scanner__scanline"></div>
      <div className="scanner__fp">
        <FingerprintSVG />
      </div>
      <div className="scanner__overlay">
        {state === 'success' &&
        <div className="scanner__status-icon">
            <Icon name="check" size={44} stroke={2} />
          </div>
        }
        {state === 'error' &&
        <div className="scanner__status-icon">
            <Icon name="x" size={44} stroke={2} />
          </div>
        }
      </div>
    </div>);

}

Object.assign(window, { FingerprintSVG, FingerprintScanner });