import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup as signupApi } from '../services/api'
import { Btn, Field, Alert } from '../components/UI'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await signupApi(form); navigate('/login', { state: { msg: 'Account created. Log in to continue.' } }) }
    catch (err) { setError(err.response?.data?.detail || 'Sign up failed. Try again.') }
    finally { setLoading(false) }
  }
  return (
    <main className="page split">
      <section className="poster" style={{ margin: 0 }}>
        <h1>A verdict in a minute.</h1>
        <p style={{ fontSize: 20, maxWidth: '26em' }}>Seven numbers in, one clear answer out, with the reasons weighed in front of you.</p>
      </section>
      <form onSubmit={submit} style={{ maxWidth: 460 }}>
        {error && <Alert>{error}</Alert>}
        <Field label="Full name"><input value={form.name} onChange={set('name')} autoComplete="name" required minLength={2} /></Field>
        <Field label="Email"><input type="email" value={form.email} onChange={set('email')} autoComplete="email" required /></Field>
        <Field label="Password" hint="At least 6 characters"><input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" required minLength={6} /></Field>
        <Btn type="submit" className="pri" loading={loading}>Create account</Btn>
        <p className="mut">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </main>
  )
}
