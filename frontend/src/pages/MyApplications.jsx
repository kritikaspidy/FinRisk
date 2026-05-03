import { useState, useEffect } from 'react'
import { getMyApplications } from '../services/api'
import { Card, Badge, ScoreGauge, Alert } from '../components/UI'

const riskVariant = r => ({ Low: 'low', Medium: 'medium', High: 'high' })[r] || 'neutral'
const decVariant  = d => ({ Approve: 'approve', Review: 'review', Reject: 'reject' })[d] || 'neutral'

function AppCard({ app, delay = 0 }) {
  const borderColor = app.decision === 'Approve'
    ? 'rgba(110,231,183,0.2)' : app.decision === 'Reject'
    ? 'rgba(248,113,113,0.2)' : 'rgba(251,191,36,0.2)'

  return (
    <Card style={{ borderColor, animationDelay: `${delay}ms` }} className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>
            APP #{app.id} · {new Date(app.created_at).toLocaleDateString('en-IN')}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <Badge variant={decVariant(app.decision)}>{app.decision}</Badge>
            <Badge variant={riskVariant(app.risk)}>{app.risk} Risk</Badge>
          </div>
        </div>
        <ScoreGauge score={app.credit_score} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { l: 'INCOME', v: `₹${app.income.toLocaleString('en-IN')}` },
          { l: 'MONTHLY DEBT', v: `₹${app.debt.toLocaleString('en-IN')}` },
          { l: 'DTI', v: `${(app.dti * 100).toFixed(1)}%` },
          { l: 'UTILIZATION', v: `${app.credit_utilization}%` },
          { l: 'PAST DEFAULT', v: app.past_default === 1 ? 'Yes' : 'No' },
          { l: 'DEFAULT PROB', v: `${(app.probability_of_default * 100).toFixed(1)}%` },
        ].map(m => (
          <div key={m.l} style={{ background: 'var(--ink2)', borderRadius: 7,
            padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>{m.v}</div>
            <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.05em', marginTop: 2 }}>{m.l}</div>
          </div>
        ))}
      </div>

      {app.reasons?.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em', marginBottom: 8 }}>DECISION FACTORS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {app.reasons.map((r, i) => (
              <div key={i} style={{ fontSize: 12, color: '#94a3b8',
                display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--red)', flexShrink: 0, marginTop: 1 }}>•</span>
                {r}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

export default function MyApplications() {
  const [apps,    setApps]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    getMyApplications()
      .then(setApps)
      .catch(() => setError('Failed to load applications.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ marginBottom: 28 }} className="fade-up">
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: '#e2e8f0', marginBottom: 6 }}>
          My Applications
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          Your complete credit assessment history
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <span className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      )}

      {error && <Alert type="error">{error}</Alert>}

      {!loading && !error && apps.length === 0 && (
        <Card style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: '#e2e8f0', marginBottom: 8 }}>
            No applications yet
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>
            Submit your first loan application to see results here.
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {apps.map((app, i) => <AppCard key={app.id} app={app} delay={i * 60} />)}
      </div>
    </div>
  )
}
