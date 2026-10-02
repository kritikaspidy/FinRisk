import { useState } from 'react'
import { predict as predictApi } from '../services/api'
import { Btn, Field, Alert, Verdict, BandBar, pct } from '../components/UI'

const EMPTY = { income: '', debt: '', credit_utilization: '', past_default: '0', employment_years: '', num_loans: '', late_payments: '' }

export default function Apply() {
  const [form, setForm] = useState(EMPTY)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const num = (k, label, hint, props = {}) => (
    <Field label={label} hint={hint}><input type="number" inputMode="decimal" value={form[k]} onChange={set(k)} required {...props} /></Field>
  )
  const dti = form.income && form.debt ? parseFloat(form.debt) / parseFloat(form.income) : null

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      setResult(await predictApi({
        income: parseFloat(form.income), debt: parseFloat(form.debt),
        credit_utilization: parseFloat(form.credit_utilization), past_default: parseInt(form.past_default),
        employment_years: parseFloat(form.employment_years), num_loans: parseInt(form.num_loans),
        late_payments: parseInt(form.late_payments),
      }))
      window.scrollTo(0, 0)
    } catch (err) { setError(err.response?.data?.detail || 'Assessment failed. Check the numbers and try again.') }
    finally { setLoading(false) }
  }

  if (result) return (
    <main className="page">
      <Verdict r={result} />
      <div className="cta-row" style={{ marginTop: 40 }}>
        <Btn className="pri" onClick={() => { setResult(null); setForm(EMPTY) }}>Assess another applicant</Btn>
        <Btn onClick={() => setResult(null)}>Change the numbers</Btn>
      </div>
    </main>
  )
  return (
    <main className="page">
      <h1>Calculate a score.</h1>
      <p className="lead" style={{ marginTop: 16 }}>Fill in the seven details below. Your result is saved to your history.</p>
      <div className="split" style={{ alignItems: 'start' }}>
        <form onSubmit={submit}>
          {error && <Alert>{error}</Alert>}
          <fieldset>
            <legend>Income and debt</legend>
            {num('income', 'Monthly income (₹)', 'Total monthly take-home', { min: 1 })}
            {num('debt', 'Monthly debt and EMIs (₹)', 'All existing loan payments each month', { min: 0 })}
            {dti !== null && isFinite(dti) && <p className="mono" style={{ margin: '-8px 0 22px', color: dti > 0.6 ? 'var(--hi)' : 'var(--lo)' }}>Debt-to-income {pct(dti)}{dti > 0.6 ? ' (above the 60% limit)' : ''}</p>}
          </fieldset>
          <fieldset>
            <legend>Credit behaviour</legend>
            {num('credit_utilization', 'Credit use (%)', 'Share of your credit limit you are using', { min: 0, max: 100, step: '0.1' })}
            {num('num_loans', 'Active loans', null, { min: 0 })}
            {num('late_payments', 'Late payments', null, { min: 0 })}
          </fieldset>
          <fieldset>
            <legend>History</legend>
            <Field label="Past default">
              <select value={form.past_default} onChange={set('past_default')}>
                <option value="0">No prior default</option><option value="1">Prior default on record</option>
              </select>
            </Field>
            {num('employment_years', 'Years employed', null, { min: 0, step: '0.5' })}
          </fieldset>
          <Btn type="submit" className="pri" loading={loading}>{loading ? 'Scoring…' : 'Get my verdict'}</Btn>
        </form>
        <aside className="card aside">
          <h3>What happens next</h3>
          <p style={{ marginBottom: 20 }}>The model estimates your chance of default and the decision follows these bands.</p>
          <BandBar />
          <p style={{ marginTop: 20 }}>You will also see which inputs raised or lowered the result, in percentage points.</p>
        </aside>
      </div>
    </main>
  )
}
