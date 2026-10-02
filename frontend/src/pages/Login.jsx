import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as loginApi } from '../services/api'
import { Btn, Field, Alert } from '../components/UI'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const msg = useLocation().state?.msg
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try { const d = await loginApi(form); login(d.access_token); navigate('/apply') }
    catch (err) { setError(err.response?.data?.detail || 'Login failed. Check your email and password.') }
    finally { setLoading(false) }
  }
  return (
    <main className="page split">
      <section className="poster" style={{ margin: 0 }}>
        <h1>Know where you stand.</h1>
        <p style={{ fontSize: 20, maxWidth: '26em' }}>Log in to run an assessment and see exactly why the model decided what it did.</p>
      </section>
      <form onSubmit={submit} style={{ maxWidth: 460 }}>
        {msg && <Alert ok>{msg}</Alert>}
        {error && <Alert>{error}</Alert>}
        <Field label="Email"><input type="email" value={form.email} onChange={set('email')} autoComplete="email" required /></Field>
        <Field label="Password"><input type="password" value={form.password} onChange={set('password')} autoComplete="current-password" required /></Field>
        <Btn type="submit" className="pri" loading={loading}>Log in</Btn>
        <p className="mut">New here? <Link to="/signup">Create an account</Link></p>
      </form>
    </main>
  )
}
