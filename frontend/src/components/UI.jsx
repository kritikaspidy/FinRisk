export const decColor = d => d === 'Approve' ? 'var(--lo)' : d === 'Review' ? 'var(--hi2)' : 'var(--hi)'
export const pct = p => (p * 100).toFixed(1) + '%'
export const inr = n => '₹' + Number(n).toLocaleString('en-IN')
export const verdictLine = r => {
  const p = r.probability_of_default
  if (r.reasons?.length && r.decision === 'Reject' && p < 0.7) return `Rejected by rule: ${r.reasons.join(', ').toLowerCase()}.`
  return r.decision === 'Approve' ? 'Below the 30% line. Safe to approve.'
    : r.decision === 'Review' ? 'Between 30% and 70%. A person should review this.'
    : 'Above the 70% line. Reject.'
}

export function Btn({ children, loading, className = '', ...p }) {
  return <button className={'btn ' + className} disabled={loading || p.disabled} {...p}>{loading ? 'Working…' : children}</button>
}

export function Field({ label, hint, children }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}

export function Alert({ ok, children }) {
  return <div className={'alert' + (ok ? ' ok' : '')} role={ok ? 'status' : 'alert'}>{children}</div>
}

export function Pill({ decision }) {
  return <span className="pill" style={{ background: decColor(decision) }}>{decision}</span>
}

// Balance scale: factors that raise risk stack on the right, factors that lower it on the left.
export function Scale({ contributions }) {
  const cs = (contributions || []).filter(c => Math.abs(c.impact) >= 0.5)
  if (!cs.length) return null
  const up = cs.filter(c => c.impact > 0), dn = cs.filter(c => c.impact <= 0)
  const net = up.reduce((s, c) => s + c.impact, 0) + dn.reduce((s, c) => s + c.impact, 0)
  const ang = Math.max(-9, Math.min(9, net / 4))
  const stack = (list, x, fills) => {
    let y = 220
    return list.map((c, i) => {
      const h = Math.max(28, Math.min(100, Math.abs(c.impact) * 6)); y -= h
      return <g key={c.key}>
        <rect x={x} y={y} width="260" height={h - 3} rx="6" fill={fills[Math.min(i, 2)]} />
        <text x={x + 12} y={y + h / 2 + 3} fill="#111110" fontSize="15">{c.label}</text>
        <text x={x + 248} y={y + h / 2 + 3} fill="#111110" fontSize="14" textAnchor="end" fontFamily="JetBrains Mono">{c.impact > 0 ? '+' : '−'}{Math.abs(c.impact).toFixed(1)}</text>
      </g>
    })
  }
  return (
    <svg viewBox="0 0 700 360" width="100%" role="img" aria-label="Balance scale of what raises and lowers this applicant's default risk, in percentage points">
      <g className="beam" style={{ transformOrigin: '350px 224px', transform: `rotate(${ang}deg)` }}>
        <rect x="20" y="220" width="660" height="14" rx="7" fill="var(--fg)" />
        {stack(up, 400, ['#FF5B1F', '#FF7A45', '#FFA070'])}
        {stack(dn, 40, ['#9CC9FF', '#C4E0FF', '#C4E0FF'])}
      </g>
      <path d="M350 234 L312 340 H388 Z" fill="var(--fg)" /><circle cx="350" cy="224" r="12" fill="var(--hi)" />
    </svg>
  )
}

export function BandBar({ p }) {
  const at = p == null ? null : Math.min(100, Math.max(0, p * 100))
  return (
    <div>
      <div className="band" role="img" aria-label={at == null ? 'Approve below 30%, review 30 to 70%, reject above 70%' : `Default probability ${at.toFixed(1)}%`}>
        <i style={{ width: '30%', background: 'var(--lo)' }} /><i style={{ width: '40%', background: 'var(--hi2)' }} /><i style={{ width: '30%', background: 'var(--hi)' }} />
        {at != null && <b style={{ left: at + '%' }} />}
      </div>
      <div className="band-l"><span>Approve under 30%</span><span>Review 30–70%</span><span>Reject over 70%</span></div>
    </div>
  )
}

export function Footer() {
  return <footer className="foot"><div><span>© FinRisk</span><span>Illustrative model trained on synthetic data. Not a lending decision or financial advice.</span></div></footer>
}

export function Verdict({ r }) {
  const top = (r.contributions || []).filter(c => c.impact > 0.5)[0]
  const p = (r.probability_of_default * 100).toFixed(1).split('.')
  return (
    <div>
      <div className="verdict">
        <div>
          <div className="mut" style={{ fontSize: 22 }}>chance of default</div>
          <div className="big" style={{ color: decColor(r.decision) }}>{p[0]}<small>.{p[1]}%</small></div>
          <p style={{ fontSize: 'clamp(24px,3vw,34px)', fontWeight: 800, lineHeight: 1.1, maxWidth: '15em' }}>{verdictLine(r)}</p>
          <Pill decision={r.decision} />{' '}<span className="mono mut">score {r.credit_score}/100 · DTI {pct(r.dti)}</span>
          <div style={{ marginTop: 28, maxWidth: 520 }}><BandBar p={r.probability_of_default} /></div>
          {r.contributions?.length > 0 && <p className="mut" style={{ maxWidth: 520 }}>{top ? `Biggest driver: ${top.label.toLowerCase()}, adding ${top.impact.toFixed(1)} points compared with a typical applicant.` : 'No single factor pushes this applicant above a typical risk level.'}</p>}
        </div>
        {r.contributions?.length > 0 && <div>
          <div className="mut">What tipped the scale, in percentage points</div>
          <Scale contributions={r.contributions} />
        </div>}
      </div>
    </div>
  )
}
