// src/components/UI.jsx — shared components used across all pages

export function Card({ children, style, className = '' }) {
  return (
    <div className={className} style={{
      background: 'var(--card)', border: '1px solid var(--border2)',
      borderRadius: 'var(--r-lg)', padding: 20, ...style
    }}>
      {children}
    </div>
  )
}

export function Badge({ children, variant = 'neutral' }) {
  const styles = {
    low:      { background: 'var(--green-bg)', color: 'var(--green)' },
    medium:   { background: 'var(--amber-bg)', color: 'var(--amber)' },
    high:     { background: 'var(--red-bg)',   color: 'var(--red)'   },
    approve:  { background: 'var(--green-bg)', color: 'var(--green)' },
    review:   { background: 'var(--amber-bg)', color: 'var(--amber)' },
    reject:   { background: 'var(--red-bg)',   color: 'var(--red)'   },
    neutral:  { background: 'var(--blue-bg)',  color: 'var(--blue)'  },
  }
  return (
    <span style={{
      ...styles[variant],
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 5,
      fontSize: 11, fontWeight: 600,
      fontFamily: 'var(--font-mono)', letterSpacing: '0.03em',
    }}>
      {children}
    </span>
  )
}

export function Btn({ children, onClick, type = 'button', variant = 'primary',
  disabled = false, style = {}, loading = false }) {
  const base = {
    padding: '10px 22px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    display: 'inline-flex', alignItems: 'center', gap: 8,
    transition: 'all 0.2s', opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }
  const variants = {
    primary: { background: 'var(--accent)', color: 'var(--ink)', border: 'none' },
    ghost:   { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border2)' },
    danger:  { background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)' },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{ ...base, ...variants[variant], ...style }}>
      {loading && <span className="spinner" style={{ width: 14, height: 14 }} />}
      {children}
    </button>
  )
}

export function FormGroup({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600,
        color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

export function Alert({ type = 'info', children }) {
  const map = {
    info:    { bg: 'var(--blue-bg)',  color: 'var(--blue)',  icon: 'ℹ' },
    success: { bg: 'var(--green-bg)', color: 'var(--green)', icon: '✓' },
    error:   { bg: 'var(--red-bg)',   color: 'var(--red)',   icon: '✕' },
    warning: { bg: 'var(--amber-bg)', color: 'var(--amber)', icon: '⚠' },
  }
  const s = map[type]
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.color}30`,
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
      color: s.color, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <span style={{ fontWeight: 700, flexShrink: 0 }}>{s.icon}</span>
      <span>{children}</span>
    </div>
  )
}

export function ScoreGauge({ score }) {
  const pct  = ((score - 300) / 600) * 100
  const angle = ((score - 300) / 600) * 180
  const color = score >= 700 ? '#6ee7b7' : score >= 550 ? '#fbbf24' : '#f87171'
  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 200 110" style={{ width: 180, display: 'block', margin: '0 auto' }}>
        <defs>
          <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#f87171" />
            <stop offset="50%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
        </defs>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none"
          stroke="url(#sg)" strokeWidth="12" strokeLinecap="round" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray="251" strokeDashoffset={(251 * (1 - pct / 100)).toFixed(0)} />
        <g transform={`rotate(${angle - 90}, 100, 100)`}>
          <line x1="100" y1="100" x2="100" y2="28"
            stroke={color} strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="100" r="5" fill={color} />
        </g>
        <text x="100" y="90" textAnchor="middle" fontSize="26" fontWeight="700"
          fill={color} fontFamily="DM Mono, monospace">{score}</text>
        <text x="18"  y="112" fontSize="8" fill="#64748b">300</text>
        <text x="88"  y="20"  fontSize="8" fill="#64748b">600</text>
        <text x="172" y="112" fontSize="8" fill="#64748b">900</text>
      </svg>
      <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)',
        letterSpacing: '0.08em', marginTop: 4 }}>CREDIT SCORE</div>
    </div>
  )
}

export function ProbBar({ prob }) {
  const color = prob < 30 ? 'var(--green)' : prob < 65 ? 'var(--amber)' : 'var(--red)'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>
        <span>DEFAULT PROBABILITY</span>
        <span style={{ color, fontWeight: 700 }}>{prob}%</span>
      </div>
      <div style={{ position: 'relative', height: 8, borderRadius: 4,
        background: 'linear-gradient(to right, #6ee7b7, #fbbf24, #f87171)', overflow: 'visible' }}>
        <div style={{
          position: 'absolute', top: -3, left: `${prob}%`,
          width: 14, height: 14, background: 'white',
          border: '2px solid var(--ink)', borderRadius: '50%',
          transform: 'translateX(-50%)', transition: 'left 0.6s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        fontSize: 9, color: 'var(--muted)', marginTop: 3 }}>
        <span>Low</span><span>Med</span><span>High</span>
      </div>
    </div>
  )
}

export function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />
}

export function Tag({ children }) {
  return (
    <span style={{ background: 'var(--ink2)', border: '1px solid var(--border2)',
      borderRadius: 4, padding: '1px 7px', fontSize: 10,
      fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
      {children}
    </span>
  )
}
