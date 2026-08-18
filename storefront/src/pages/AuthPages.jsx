import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CheckCircle2 } from 'lucide-react'
import PageHero from '../components/ui/PageHero'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuthStore } from '../store'
import { customerAuthApi, getErrorMessage } from '../lib/services'

function readCustomer(payload) {
  return payload?.data?.customer || payload?.data?.user || payload?.customer || null
}

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.includes('@') || password.length < 4) {
      toast.error('Enter a valid email and password (min 4 characters)')
      return
    }
    setLoading(true)
    try {
      const { data } = await customerAuthApi.login({ email, password })
      const customer = readCustomer(data)
      if (!customer?.email) {
        toast.error('Sign in succeeded but the account could not be loaded')
        return
      }
      login({
        email: customer.email,
        name: customer.name,
        id: customer.id || customer._id,
      })
      toast.success('Signed in')
      navigate('/account')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to view orders and manage your profile."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-gold hover:text-gold-bright">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        New here?{' '}
        <Link to="/register" className="text-gold hover:text-gold-bright">
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}

export function RegisterPage() {
  const registerUser = useAuthStore((s) => s.register)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.includes('@') || password.length < 6) {
      toast.error('Please complete all fields (password min 6 characters)')
      return
    }
    setLoading(true)
    try {
      const { data } = await customerAuthApi.register({ name, email, password })
      const customer = readCustomer(data)
      if (!customer?.email) {
        toast.error('Account was created but could not be loaded. Please sign in.')
        return
      }
      registerUser({
        name: customer.name,
        email: customer.email,
        id: customer.id || customer._id,
      })
      setCreated({
        name: customer.name || name.trim(),
        email: customer.email,
      })
    } catch (error) {
      toast.error(getErrorMessage(error, 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  if (created) {
    return (
      <AuthShell
        title="Account created"
        description="You are signed in and ready to shop SQ Perfumes."
      >
        <div className="text-center">
          <CheckCircle2 className="mx-auto text-gold" size={42} strokeWidth={1.4} />
          <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-gold">Welcome</p>
          <h2 className="mt-2 font-display text-2xl text-ivory">Account successfully created</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Hello{created.name ? `, ${created.name}` : ''}. Your SQ Perfumes account is ready.
            Signed-in orders will appear in your profile.
          </p>
          <p className="mt-4 truncate text-sm text-ivory">{created.email}</p>
          <div className="mt-6 flex flex-col gap-3">
            <Button to="/account" className="w-full">
              Go to my account
            </Button>
            <Button to="/shop" variant="secondary" className="w-full">
              Shop the collection
            </Button>
          </div>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create account" description="Register to track your SQ Perfumes orders.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating…' : 'Register'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-gold hover:text-gold-bright">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.includes('@')) {
      toast.error('Enter a valid email')
      return
    }
    setLoading(true)
    try {
      await customerAuthApi.forgotPassword(email)
      setSent(true)
      toast.success('If that email exists, a reset link will be sent.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not send reset link'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Forgot password"
      description="Enter your email and we will send a password reset link if an account exists."
    >
      {sent ? (
        <div className="border border-border bg-ink/40 p-4 text-sm text-muted">
          If an account exists for <span className="text-ivory">{email}</span>, a reset link will be
          sent. Check your inbox and spam folder.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-muted">
        <Link to="/login" className="text-gold hover:text-gold-bright">
          Back to login
        </Link>
      </p>
    </AuthShell>
  )
}

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (!token) {
      toast.error('This reset link is invalid')
      return
    }
    setLoading(true)
    try {
      await customerAuthApi.resetPassword({ token, password })
      toast.success('Password updated. Sign in with your new password.')
      navigate('/login')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not reset password'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Reset password" description="Choose a new password for your account.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="password"
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          id="confirm"
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthShell>
  )
}

function AuthShell({ title, description, children }) {
  return (
    <>
      <PageHero
        eyebrow="Account"
        title={title}
        description={description}
        crumbs={<Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: title }]} />}
      />
      <div className="container-site section-pad py-10 md:py-14">
        <div className="mx-auto max-w-md border border-border bg-charcoal p-6">{children}</div>
      </div>
    </>
  )
}
