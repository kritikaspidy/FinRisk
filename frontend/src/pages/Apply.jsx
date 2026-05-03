import { useState } from 'react'
import { predict as predictApi } from '../services/api'
import { Card, Btn, FormGroup, Alert, Badge, ScoreGauge, ProbBar, Divider } from '../components/UI'

const riskVariant   = r => ({ Low: 'low', Medium: 'medium', High: 'high' })[r] || 'neutral'
const decVariant    = d => ({ Approve: 'approve', Review: 'review', Reject: 'reject' })[d] || 'neutral'

function ResultPanel({ result }) {
  const r = result
  return (
    <div className="fade-up">
      {/* Decision header */}
      <Card style={{ marginBottom: 14, borderColor: r.decision === 'Approve' ? 'rgba(110,231,183,0.25)' : r.decision === 'Reject' ? 'rgba(248,113,113,0.25)' : 'rgba(251,191,36,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
              ASSESSMENT RESULT
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: '#e2e8f0' }}>
              Loan {r.decision === 'Approve' ? 'Approved' : r.decision === 'Reject' ? 'Rejected' : 'Under Review'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Badge variant={riskVariant(r.risk)}>{r.risk} Risk</Badge>
            <Badge variant={decVariant(r.decision)}>{r.decision}</Badge>
          </div>
        </div>

        <ScoreGauge score={r.credit_score} />

        <div style={{ marginTop: 16 }}>
          <ProbBar prob={parseFloat((r.probability_of_default * 100).toFixed(1))} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
          {[
            { l: 'DTI RATIO', v: `${(r.dti * 100).toFixed(1)}%` },
            { l: 'DEFAULT PROB', v: `${(r.probability_of_default * 100).toFixed(1)}%` },
          ].map(m => (
            <div key={m.l} style={{ background: 'var(--ink2)', borderRadius: 8,
              padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600 }}>{m.v}</div>
              <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.06em', marginTop: 2 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Reasons */}
      {r.reasons?.length > 0 && (
        <Card>
          <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em', marginBottom: 12 }}>DECISION FACTORS</div>
          {r.reasons.map((reason, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0',
              borderBottom: i < r.reasons.length - 1 ? '1px solid var(--border)' : 'none',
              alignItems: 'flex-start' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                background: 'var(--red-bg)', color: 'var(--red)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700 }}>
                !
              </div>
              <span style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>{reason}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

export default function Apply() {
  const [form, setForm] = useState({
    income: '',
    debt: '',
    credit_utilization: '',
    past_default: '0',
    employment_years: '',
    num_loans: '',
    late_payments: ''
  })
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setLoading(true); setResult(null)
    try {
      const payload = {
        income:             parseFloat(form.income),
        debt:               parseFloat(form.debt),
        credit_utilization: parseFloat(form.credit_utilization),
        past_default:       parseInt(form.past_default),
      
        employment_years:   parseFloat(form.employment_years),
        num_loans:          parseInt(form.num_loans),
        late_payments:      parseInt(form.late_payments),
      }
      const data = await predictApi(payload)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Assessment failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ marginBottom: 28 }} className="fade-up">
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: '#e2e8f0', marginBottom: 6 }}>
          Credit Assessment
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          Enter your financial details to receive an instant ML-powered credit risk evaluation.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 20 }}>
        {/* FORM */}
        <Card className="fade-up">
          <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em', marginBottom: 16 }}>FINANCIAL INFORMATION</div>

          <form onSubmit={handleSubmit}>
            {error && <div style={{ marginBottom: 16 }}><Alert type="error">{error}</Alert></div>}

            <FormGroup label="Monthly Income (₹)" hint="Your total monthly take-home income">
              <input type="number" value={form.income} onChange={set('income')}
                placeholder="Enter your monthly income" min="1" required />
            </FormGroup>

            <FormGroup label="Monthly Debt / EMIs (₹)" hint="Total existing loan EMIs per month">
              <input type="number" value={form.debt} onChange={set('debt')}
                placeholder="Enter your monthly debt/EMIs" min="0" required />
            </FormGroup>

            <FormGroup label="Credit Utilization (%)" hint="What % of your credit limit are you using?">
              <input type="number" value={form.credit_utilization} onChange={set('credit_utilization')}
                placeholder="Enter your credit utilization" min="0" max="100" step="0.1" required />
            </FormGroup>

            <FormGroup label="Past Default">
              <select value={form.past_default} onChange={set('past_default')}>
                <option value="0">No — I have no prior defaults</option>
                <option value="1">Yes — I have a prior default on record</option>
              </select>
            </FormGroup>

            <FormGroup label="Employment Years">
  <input type="number" value={form.employment_years || ''} onChange={set('employment_years')} min="0" required />
</FormGroup>

<FormGroup label="Number of Loans">
  <input type="number" value={form.num_loans || ''} onChange={set('num_loans')} min="0" required />
</FormGroup>

<FormGroup label="Late Payments">
  <input type="number" value={form.late_payments || ''} onChange={set('late_payments')} min="0" required />
</FormGroup>

            {/* Live DTI preview */}
            {form.income && form.debt && (
              <div style={{ background: 'var(--ink2)', borderRadius: 8, padding: '10px 14px',
                marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Debt-to-Income Ratio</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
                  color: (parseFloat(form.debt) / parseFloat(form.income)) > 0.6 ? 'var(--red)' : 'var(--green)' }}>
                  {((parseFloat(form.debt) / parseFloat(form.income)) * 100).toFixed(1)}%
                </span>
              </div>
            )}

            <Btn type="submit" loading={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? 'Analyzing...' : 'Run Credit Assessment →'}
            </Btn>
          </form>
        </Card>

        {/* RESULT */}
        {result && <ResultPanel result={result} />}
      </div>
    </div>
  )
}
