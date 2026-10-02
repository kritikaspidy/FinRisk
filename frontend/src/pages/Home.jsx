import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyApplications } from '../services/api'
import { BandBar, Pill, decColor, pct, verdictLine } from '../components/UI'

export default function Home() {
  const { isAdmin } = useAuth()
  const [apps, setApps] = useState(null)
  useEffect(() => { getMyApplications().then(setApps).catch(() => setApps([])) }, [])
  const last = apps?.[0]

  return (
    <main className="page">
      <h1>Welcome back.</h1>
      <p className="lead" style={{ marginTop: 16 }}>Run a new assessment, or pick up where you left off.</p>
      <div className="split" style={{ alignItems: 'stretch' }}>
        <section className="poster" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 32 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 'clamp(32px,4vw,52px)', lineHeight: 1, letterSpacing: '-.02em' }}>Calculate a new score.</h2>
            <p style={{ fontSize: 18, maxWidth: '24em' }}>Seven numbers in, a verdict and its reasons out. It takes about a minute.</p>
          </div>
          <div><Link to="/apply" className="btn pri" style={{ background: 'var(--ink)', borderColor: 'var(--ink)', color: '#F2F0EB' }}>Start assessment</Link></div>
        </section>

        <section className="card">
          <h3>Latest result</h3>
          {apps === null && <p>Loading…</p>}
          {apps && !last && <p>You haven't run an assessment yet. Your results will appear here.</p>}
          {last && <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap', margin: '8px 0' }}>
              <span className="stat" style={{ fontSize: 'clamp(56px,7vw,88px)', color: decColor(last.decision) }}>{pct(last.probability_of_default)}</span>
              <Pill decision={last.decision} />
            </div>
            <p style={{ color: 'var(--fg)', marginBottom: 20 }}>{verdictLine(last)}</p>
            <BandBar p={last.probability_of_default} />
            <p className="mono" style={{ marginTop: 20, fontSize: 13 }}>APP-{last.id} · {new Date(last.created_at).toLocaleDateString('en-IN')} · <Link to="/my-applications">View all {apps.length}</Link></p>
          </>}
        </section>
      </div>

      <section className="sec">
        <h2>How to read a verdict.</h2>
        <div className="card"><BandBar /><p style={{ marginTop: 20 }}>The probability sets the outcome. A debt-to-income ratio above 60% or a prior default always results in a rejection, whatever the probability says.</p></div>
      </section>

      {isAdmin && <section className="sec"><div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}><div><h3>Review queue</h3><p>See every application, filter by risk and override decisions.</p></div><Link to="/admin" className="btn">Open review queue</Link></div></section>}
    </main>
  )
}
