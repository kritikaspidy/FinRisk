import { useState, useEffect } from 'react'
import { getAllApplications, overrideDecision } from '../services/api'
import { Card, Badge, Btn, Alert } from '../components/UI'

const riskVariant = r => ({ Low: 'low', Medium: 'medium', High: 'high' })[r] || 'neutral'
const decVariant  = d => ({ Approve: 'approve', Review: 'review', Reject: 'reject' })[d] || 'neutral'

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: 'var(--card2)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '16px 20px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 600,
        color: color || '#e2e8f0' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4,
        textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}

export default function Admin() {
  const [apps,       setApps]       = useState([])
  const [filtered,   setFiltered]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [decFilter,  setDecFilter]  = useState('')
  const [overriding, setOverriding] = useState(null)
  const [msg,        setMsg]        = useState('')

  const load = () => {
    setLoading(true)
    getAllApplications()
      .then(data => { setApps(data); setFiltered(data) })
      .catch(() => setError('Failed to load applications.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  useEffect(() => {
    let result = apps
    if (riskFilter) result = result.filter(a => a.risk === riskFilter)
    if (decFilter)  result = result.filter(a => a.decision === decFilter)
    setFiltered(result)
  }, [riskFilter, decFilter, apps])

  const handleOverride = async (id, decision) => {
    setOverriding(id)
    try {
      await overrideDecision(id, decision)
      setMsg(`Application #${id} decision updated to ${decision}`)
      load()
    } catch { setMsg('Override failed.') }
    finally { setOverriding(null); setTimeout(() => setMsg(''), 4000) }
  }

  const total    = apps.length
  const approved = apps.filter(a => a.decision === 'Approve').length
  const rejected = apps.filter(a => a.decision === 'Reject').length
  const highRisk = apps.filter(a => a.risk === 'High').length
  const avgScore = total ? Math.round(apps.reduce((s, a) => s + a.credit_score, 0) / total) : 0

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ marginBottom: 28 }} className="fade-up">
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: '#e2e8f0', marginBottom: 6 }}>
          Admin Dashboard
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          All loan applications — filter, review, and override decisions
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}
        className="fade-up">
        <StatCard label="Total" value={total} />
        <StatCard label="Approved" value={approved} color="var(--green)" />
        <StatCard label="Rejected" value={rejected} color="var(--red)" />
        <StatCard label="High Risk" value={highRisk} color="var(--amber)" />
        <StatCard label="Avg Score" value={avgScore || '--'} color="var(--blue)" />
      </div>

      {msg && <div style={{ marginBottom: 16 }}><Alert type="success">{msg}</Alert></div>}
      {error && <div style={{ marginBottom: 16 }}><Alert type="error">{error}</Alert></div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}
          style={{ width: 'auto', padding: '7px 12px' }}>
          <option value="">All Risk Levels</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <select value={decFilter} onChange={e => setDecFilter(e.target.value)}
          style={{ width: 'auto', padding: '7px 12px' }}>
          <option value="">All Decisions</option>
          <option value="Approve">Approve</option>
          <option value="Review">Review</option>
          <option value="Reject">Reject</option>
        </select>
        <button onClick={() => { setRiskFilter(''); setDecFilter('') }}
          style={{ background: 'transparent', border: '1px solid var(--border2)',
            borderRadius: 8, padding: '7px 14px', fontSize: 12,
            color: 'var(--muted)', cursor: 'pointer' }}>
          Clear Filters
        </button>
        <span style={{ alignSelf: 'center', fontSize: 12, color: 'var(--muted)', marginLeft: 'auto' }}>
          {filtered.length} of {total} applications
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <span className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      ) : filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ color: 'var(--muted)' }}>No applications match the current filters.</div>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Date', 'Income', 'Debt', 'Util%', 'DTI', 'Score', 'Risk', 'Decision', 'Override'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left',
                    fontSize: 10, fontWeight: 600, color: 'var(--muted)',
                    fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
                    background: 'var(--card2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((app, i) => (
                <tr key={app.id} style={{
                  borderBottom: '1px solid var(--border)',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  transition: 'background 0.15s',
                }}>
                  <td style={{ padding: '11px 14px', fontFamily: 'var(--font-mono)',
                    fontSize: 12, color: 'var(--muted)' }}>#{app.id}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12 }}>
                    {new Date(app.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                    ₹{app.income.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                    ₹{app.debt.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                    {app.credit_utilization}%
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                    {(app.dti * 100).toFixed(1)}%
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: 'var(--font-mono)',
                    fontSize: 13, fontWeight: 600 }}>{app.credit_score}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <Badge variant={riskVariant(app.risk)}>{app.risk}</Badge>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <Badge variant={decVariant(app.decision)}>{app.decision}</Badge>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <Btn variant="ghost" onClick={() => handleOverride(app.id, 'Approve')}
                        disabled={overriding === app.id}
                        style={{ padding: '4px 8px', fontSize: 11, color: 'var(--green)',
                          borderColor: 'rgba(110,231,183,0.2)' }}>✓</Btn>
                      <Btn variant="ghost" onClick={() => handleOverride(app.id, 'Reject')}
                        disabled={overriding === app.id}
                        style={{ padding: '4px 8px', fontSize: 11, color: 'var(--red)',
                          borderColor: 'rgba(248,113,113,0.2)' }}>✕</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
