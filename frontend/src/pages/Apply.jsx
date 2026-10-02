import { useState } from 'react'
import { predict as predictApi } from '../services/api'
import { Btn, Field, Alert, Verdict, pct } from '../components/UI'

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
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32 }}>
        <Btn className="pri" onClick={() => { setResult(null); setForm(EMPTY) }}>Assess another applicant</Btn>
        <Btn onClick={() => setResult(null)}>Change the numbers</Btn>
      </div>
    </main>
  )
  return (
    <main className="page">
      <h1>Tell us about the applicant.</h1>
      <p className="mut" style={{ fontSize: 20, maxWidth: '30em' }}>Seven numbers. You get a verdict and the reasons behind it.</p>
      <form onSubmit={submit} style={{ maxWidth: 640, marginTop: 32 }}>
        {error && <Alert>{error}</Alert>}
        {num('income', 'Monthly income (₹)', 'Total monthly take-home', { min: 1 })}
        {num('debt', 'Monthly debt and EMIs (₹)', 'All existing loan payments each month', { min: 0 })}
        {dti !== null && isFinite(dti) && <p className="mono" style={{ margin: '-8px 0 22px', color: dti > 0.6 ? 'var(--hi)' : 'var(--lo)' }}>Debt-to-income {pct(dti)}{dti > 0.6 ? ' (above the 60% limit)' : ''}</p>}
        {num('credit_utilization', 'Credit use (%)', 'Share of your credit limit you are using', { min: 0, max: 100, step: '0.1' })}
        <Field label="Past default">
          <select value={form.past_default} onChange={set('past_default')}>
            <option value="0">No prior default</option><option value="1">Prior default on record</option>
          </select>
        </Field>
        {num('employment_years', 'Years employed', null, { min: 0, step: '0.5' })}
        {num('num_loans', 'Active loans', null, { min: 0 })}
        {num('late_payments', 'Late payments', null, { min: 0 })}
        <Btn type="submit" className="pri" loading={loading}>{loading ? 'Scoring…' : 'Get my verdict'}</Btn>
      </form>
    </main>
  )
}
