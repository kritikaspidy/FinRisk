import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyApplications } from '../services/api'
import { Alert, Pill, decColor, pct, inr } from '../components/UI'

export default function MyApplications() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { getMyApplications().then(setApps).catch(() => setError('Could not load your history. Refresh to try again.')).finally(() => setLoading(false)) }, [])

  return (
    <main className="page">
      <h1>Your history.</h1>
      <p className="mut" style={{ fontSize: 20 }}>Every assessment you have run, newest first.</p>
      {error && <Alert>{error}</Alert>}
      {loading && <p className="mut">Loading…</p>}
      {!loading && !error && apps.length === 0 && (
        <div style={{ marginTop: 32 }}><p style={{ fontSize: 28, fontWeight: 800 }}>Nothing here yet.</p><Link className="btn pri" to="/apply">Run your first assessment</Link></div>
      )}
      <div style={{ marginTop: 24 }}>
        {apps.map(a => (
          <article className="row" key={a.id}>
            <div><b>APP-{a.id}</b><div className="mono mut" style={{ fontSize: 13 }}>{new Date(a.created_at).toLocaleDateString('en-IN')}</div></div>
            <span className="stat" style={{ fontSize: 40, color: decColor(a.decision) }}>{pct(a.probability_of_default)}</span>
            <span><Pill decision={a.decision} /></span>
            <span className="mono">{inr(a.income)} income<br />DTI {pct(a.dti)}</span>
            <span className="mut">{a.reasons?.length ? a.reasons.join(' · ') : 'No rule flags'}</span>
          </article>
        ))}
      </div>
    </main>
  )
}
