# Plan: Rediseño KPIs de Asistencia Diaria — 2x2 con semáforo

## Estado: APROBADO - Pendiente de implementación

## Archivos a modificar
1. `styles.css` — Líneas ~1459-1638: Nuevas clases CSS
2. `dashboard.jsx` — Líneas 2881-2995: Array KPIs + JSX render

## Cambios CSS (`styles.css`, insertar después de línea 1638)

### 1. Grid variant `.kpi-grid--dash`
```css
.kpi-grid--dash {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
}
.kpi-grid--dash .kpi:first-child {
  grid-column: 1;
  grid-row: 1 / 3;
}
.kpi-grid--dash .kpi:nth-child(2) {
  grid-column: 2;
  grid-row: 1;
}
.kpi-grid--dash .kpi:nth-child(3) {
  grid-column: 2;
  grid-row: 2;
}
```

### 2. Color semántico por tipo
```css
.kpi--hero {
  background: linear-gradient(145deg, #f0faf5 0%, #e4f3eb 100%);
  border-color: rgba(79, 157, 122, 0.18);
}
.kpi--hero .kpi__icon { background: var(--success); color: #fff; }
.kpi--hero .kpi__value { color: #2f7a5a; font-size: 44px; }
.kpi--hero .kpi__label { color: #3d7a5e; }
.kpi--hero .kpi__bar { background: rgba(79,157,122,0.12); }
.kpi--hero .kpi__bar-fill { background: var(--success); }
.kpi--hero .kpi__top { align-items: center; }

.kpi--neutral .kpi__icon { background: var(--ink-200); color: var(--ink-700); }

.kpi--warn-tinted {
  background: linear-gradient(145deg, #fefbf0 0%, #fdf5e0 100%);
  border-color: rgba(201, 169, 97, 0.22);
}
.kpi--warn-tinted .kpi__icon { background: var(--gold-500); color: #fff; }
.kpi--warn-tinted .kpi__value { color: var(--gold-600); }

.kpi--danger-tinted {
  background: linear-gradient(145deg, #fef5f4 0%, #fde9e7 100%);
  border-color: rgba(193, 85, 77, 0.18);
}
.kpi--danger-tinted .kpi__icon { background: var(--danger); color: #fff; }
.kpi--danger-tinted .kpi__value { color: var(--danger); }
```

### 3. Tamaños hero vs secundarias
```css
.kpi-grid--dash .kpi:not(:first-child) {
  min-height: 140px;
  padding: 18px;
}
.kpi-grid--dash .kpi:not(:first-child) .kpi__value {
  font-size: 30px;
}
.kpi-grid--dash .kpi:first-child {
  min-height: 170px;
}
```

### 4. Mini barra de progreso
```css
.kpi__bar {
  width: 100%;
  height: 6px;
  background: rgba(0,0,0,0.06);
  border-radius: 3px;
  margin-top: 14px;
  overflow: hidden;
}
.kpi__bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### 5. Live dot badge
```css
.kpi__live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 8px var(--success);
  animation: pulse 2s ease-in-out infinite;
  display: inline-block;
  margin-left: 8px;
  vertical-align: middle;
  flex-shrink: 0;
}
```

## Cambios JSX (`dashboard.jsx`)

### 1. Reestructurar array kpis (línea 2881)
```jsx
const totalEmp = employees.length;
const pctActive = totalEmp > 0 ? Math.round((activeCount / totalEmp) * 100) : 0;

const kpis = [
  {
    label: t.dash_kpi_active,
    value: activeCount,
    icon: 'usersActive',
    live: true,
    hero: true,
    bar: { pct: pctActive },
    route: 'dashboard',
  },
  {
    label: t.dash_kpi_total,
    value: totalEmp,
    icon: 'usersTotal',
    neutral: true,
  },
  {
    label: t.dash_kpi_late,
    value: lateToday,
    icon: 'clock',
    warn: lateToday > 0,
  },
  {
    label: t.dash_kpi_pending,
    value: pendingCount,
    icon: 'doorOpen',
    danger: pendingCount > 0,
  },
];
```

### 2. Actualizar JSX render (línea 2970)
```jsx
<div className="kpi-grid kpi-grid--dash">
  {kpis.map((k, i) => (
    <div
      className={`kpi ${k.hero ? 'kpi--hero' : ''} ${k.neutral ? 'kpi--neutral' : ''} ${k.warn ? 'kpi--warn-tinted' : ''} ${k.danger ? 'kpi--danger-tinted' : ''} ${k.route ? 'kpi--clickable' : ''}`}
      key={i}
      onClick={k.route ? () => setRoute(k.route) : undefined}
    >
      <div className="kpi__top">
        <div className="kpi__icon">
          <Icon name={k.icon} size={26}/>
          {k.live && <span className="kpi__live-dot"></span>}
        </div>
      </div>
      <div className="kpi__foot">
        <div className="kpi__label">{k.label}</div>
        <div className="kpi__value">
          <FlipCounter value={typeof k.value === 'number' ? k.value.toLocaleString() : k.value} />
        </div>
        {k.bar && (
          <div className="kpi__bar">
            <div className="kpi__bar-fill" style={{ width: `${k.bar.pct}%` }}></div>
          </div>
        )}
      </div>
    </div>
  ))}
</div>
```

## Responsive
- Desktop (>1024px): `2fr 1fr` — Hero izq, 2 sec der
- Tablet (≤1024px): Override a `repeat(2, 1fr)` parejo
- Phone (≤560px): `1fr 1fr` gap 12px
- Small (≤480px): `1fr` columna única
