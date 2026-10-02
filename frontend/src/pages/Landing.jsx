import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Scale, BandBar, Pill } from '../components/UI'

const SAMPLE = [
  { key: 'debt', label: 'Monthly debt', impact: 9.2 },
  { key: 'util', label: 'Credit use', impact: 6.1 },
  { key: 'late', label: 'Late payments', impact: 4.4 },
  { key: 'emp', label: 'Years employed', impact: -3.0 },
  { key: 'inc', label: 'Monthly income', impact: -2.2 },
]
const INPUTS = ['Monthly income', 'Monthly debt and EMIs', 'Credit use', 'Past default', 'Years employed', 'Active loans', 'Late payments']

export default function Landing() {
  const { token } = useAuth()
  if (token) return <Navigate to="/home" replace />
  return (
    <main className="page">
      <section className="poster" style={{ marginBottom: 0 }}>
        <div className="hero">
          <div>
            <h1>Credit risk, explained.</h1>
            <p style={{ fontSize: 'clamp(18px,2vw,22px)', maxWidth: '28em', margin: '20px 0 0' }}>
              FinRisk estimates an applicant's chance of default in seconds, then shows exactly which factors pushed the result up or down.
            </p>
            <div className="cta-row">
              <Link to="/signup" className="btn pri" style={{ background: 'var(--ink)', borderColor: 'var(--ink)', color: '#F2F0EB' }}>Create free account</Link>
              <Link to="/login" className="btn">Log in</Link>
            </div>
          </div>
          <div className="hero-card" aria-label="Example verdict">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={{ color: '#B9B6AE' }}>Example applicant</span><Pill decision="Review" />
            </div>
            <div className="big" style={{ color: 'var(--hi2)', margin: '16px 0' }}>34<small>.1%</small></div>
            <Scale contributions={SAMPLE} />
          </div>
        </div>
      </section>

      <section className="sec" id="how">
        <h2>From seven numbers to a clear verdict.</h2>
        <p className="lead">No spreadsheets and no jargon. You enter the details, the model does the scoring, and you see the reasoning.</p>
        <div className="grid3">
          <div className="card"><span className="step-n">Step 1</span><h3>Enter the details</h3><p>Income, debt, credit use and a few history questions. A live debt-to-income check warns you early.</p></div>
          <div className="card"><span className="step-n">Step 2</span><h3>The model scores it</h3><p>A calibrated logistic regression turns those numbers into a probability of default.</p></div>
          <div className="card"><span className="step-n">Step 3</span><h3>See why</h3><p>A balance scale weighs what raised and lowered the risk, in percentage points, so the result is never a black box.</p></div>
        </div>
      </section>

      <section className="sec" id="verdict">
        <div className="split" style={{ alignItems: 'center' }}>
          <div>
            <h2>Three outcomes, one clear rule.</h2>
            <p className="lead" style={{ marginBottom: 24 }}>The probability decides the outcome, and two safeguards can override it.</p>
            <BandBar p={0.341} />
          </div>
          <div className="card">
            <h3>Safeguards that always apply</h3>
            <p style={{ marginBottom: 12 }}>Whatever the probability says, an application is rejected if:</p>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}><li>debt-to-income is above 60%</li><li>there is a prior default on record</li></ul>
          </div>
        </div>
      </section>

      <section className="sec" id="inputs">
        <h2>What it checks.</h2>
        <p className="lead">Seven inputs. Nothing hidden.</p>
        <ul className="chips">{INPUTS.map(i => <li key={i}>{i}</li>)}</ul>
      </section>

      <section className="sec">
        <div className="grid4">
          <div className="card"><h3>Explainable</h3><p>Every verdict lists what drove it.</p></div>
          <div className="card"><h3>Instant</h3><p>Results appear as soon as you submit.</p></div>
          <div className="card"><h3>Your history</h3><p>Every assessment is saved to your account.</p></div>
          <div className="card"><h3>Human review</h3><p>Admins can review and override any decision.</p></div>
        </div>
      </section>

      <section className="sec">
        <div className="poster" style={{ marginBottom: 0, textAlign: 'center' }}>
          <h1 style={{ margin: '0 auto', fontSize: 'clamp(36px,5vw,64px)' }}>See the score before it matters.</h1>
          <div className="cta-row" style={{ justifyContent: 'center' }}>
            <Link to="/signup" className="btn pri" style={{ background: 'var(--ink)', borderColor: 'var(--ink)', color: '#F2F0EB' }}>Create free account</Link>
            <Link to="/login" className="btn">Log in</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
