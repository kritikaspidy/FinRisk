import { useState, useEffect, useMemo } from 'react'
import { getAllApplications, overrideDecision } from '../services/api'
import { Btn, Alert, Pill, decColor, pct, inr } from '../components/UI'

const dotColor = p => p < 0.1 ? '#9CC9FF' : p < 0.3 ? '#F2F0EB' : p < 0.7 ? '#FF7A45' : '#FF5B1F'

export default function Admin() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [risk, setRisk] = useState('')
  const [dec, setDec] = useState('')
  const [busy, setBusy] = useState(null)
  const [msg, setMsg] = useState('')

  const load = () => getAllApplications().then(setApps).catch(() => setError('Could not load applications. Refresh to try again.')).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const sorted = useMemo(() => [...apps].sort((a, b) => a.probability_of_default - b.probability_of_default), [apps])
  const rows = apps.filter(a => (!risk || a.risk === risk) && (!dec || a.decision === dec))
  const flagged = apps.filter(a => a.decision !== 'Approve').length
  const headline = !apps.length ? 'No applications yet.' : !flagged ? 'Nothing needs a second look.' : `1 in ${Math.round(apps.length / flagged)} applications needs a second look.`

  const override = async (id, d) => {
    setBusy(id)
    try { await overrideDecision(id, d); setMsg(`APP-${id} is now ${d}.`); await load() }
    catch { setMsg('Override failed. Try again.') }
    finally { setBusy(null); setTimeout(() => setMsg(''), 4000) }
  }

  return (
    <main className="page">
      <section className="poster">
        <h1>{loading ? 'Loading the book…' : headline}</h1>
        {!!apps.length && <p style={{ fontSize: 20, maxWidth: '34em' }}>{flagged} of {apps.length} applications are under review or rejected. The darkest dots carry the highest risk.</p>}
      </section>
      {error && <Alert>{error}</Alert>}
      {msg && <Alert ok>{msg}</Alert>}
      {!!sorted.length && (
        <section className="dots">
          <svg viewBox={`0 0 1200 ${Math.ceil(Math.min(sorted.length, 800) / 40) * 30}`} width="100%" role="group" aria-label="Each dot is one application, from lowest to highest default risk">
            {sorted.slice(0, 800).map((a, i) => (
              <a key={a.id} href={`#app-${a.id}`} aria-label={`APP-${a.id}, ${a.decision}, ${pct(a.probability_of_default)}`}>
                <circle cx={14 + (i % 40) * 30} cy={14 + Math.floor(i / 40) * 30} r="10" fill={dotColor(a.probability_of_default)} />
              </a>
            ))}
          </svg>
          <p style={{ margin: '12px 0 0', color: '#B9B6AE' }}>Each dot is one application, lowest risk first. Select a dot to jump to its row.</p>
        </section>
      )}
      <div className="filters">
        <select aria-label="Filter by risk" value={risk} onChange={e => setRisk(e.target.value)}><option value="">All risk levels</option><option>Low</option><option>Medium</option><option>High</option></select>
        <select aria-label="Filter by decision" value={dec} onChange={e => setDec(e.target.value)}><option value="">All decisions</option><option>Approve</option><option>Review</option><option>Reject</option></select>
        {(risk || dec) && <Btn className="sm" onClick={() => { setRisk(''); setDec('') }}>Clear filters</Btn>}
        <span className="mut" style={{ alignSelf: 'center', marginLeft: 'auto' }}>{rows.length} of {apps.length}</span>
      </div>
      {!loading && !rows.length && !!apps.length && <p className="mut">No applications match these filters. Clear them to see everything.</p>}
      {rows.map(a => (
        <article className="row" id={`app-${a.id}`} key={a.id}>
          <div><b>APP-{a.id}</b><div className="mono mut" style={{ fontSize: 13 }}>{new Date(a.created_at).toLocaleDateString('en-IN')}</div></div>
          <span className="stat" style={{ fontSize: 40, color: decColor(a.decision) }}>{pct(a.probability_of_default)}</span>
          <span><Pill decision={a.decision} /><div className="mono mut" style={{ fontSize: 13 }}>score {a.credit_score}/100</div></span>
          <span className="mono">{inr(a.income)} income<br />DTI {pct(a.dti)} · use {a.credit_utilization}%</span>
          <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn className="sm" disabled={busy === a.id} onClick={() => override(a.id, 'Approve')}>Approve</Btn>
            <Btn className="sm" disabled={busy === a.id} onClick={() => override(a.id, 'Reject')}>Reject</Btn>
          </span>
        </article>
      ))}
    </main>
  )
}
