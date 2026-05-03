import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup as signupApi } from '../services/api'
import { Card, Btn, FormGroup, Alert } from '../components/UI'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ name: '', email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await signupApi(form)
      navigate('/login', { state: { msg: 'Account created! Please log in.' } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Try again.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20,
      background: 'radial-gradient(ellipse at 50% 0%, rgba(110,231,183,0.06) 0%, transparent 60%)' }}>

      <div style={{ width: '100%', maxWidth: 400 }} className="fade-up">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32,
            color: '#e2e8f0', marginBottom: 8 }}>Create account</div>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>
            Get your credit risk assessment in minutes
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            {error && <div style={{ marginBottom: 16 }}><Alert type="error">{error}</Alert></div>}

            <FormGroup label="Full Name">
              <input value={form.name} onChange={set('name')}
                placeholder="Kritika Garg" required minLength={2} />
            </FormGroup>

            <FormGroup label="Email">
              <input type="email" value={form.email} onChange={set('email')}
                placeholder="you@example.com" required />
            </FormGroup>

            <FormGroup label="Password" hint="Minimum 6 characters">
              <input type="password" value={form.password} onChange={set('password')}
                placeholder="••••••••" required minLength={6} />
            </FormGroup>

            <Btn type="submit" loading={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              Create Account
            </Btn>
          </form>
        </Card>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
