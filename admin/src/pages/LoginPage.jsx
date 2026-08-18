import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Button, Input, Card } from '../components/ui'
import { brand } from '../lib/utils'
import { useAuthStore } from '../store'
import { authApi, getErrorMessage } from '../lib/services'

export default function LoginPage() {
  const admin = useAuthStore((s) => s.admin)
  const loginLocal = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: 'owner@sqperfumes.com', password: '' },
  })

  if (admin) return <Navigate to="/" replace />

  const onSubmit = async (data) => {
    try {
      const { data: res } = await authApi.login(data)
      loginLocal({
        email: res.data.admin.email,
        name: res.data.admin.name,
        role: res.data.admin.role,
        id: res.data.admin.id,
      })
      toast.success('Welcome back')
      navigate('/')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Login failed'))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={brand.logo} alt={brand.name} className="h-16 w-16 rounded object-cover" />
          <h1 className="mt-4 font-display text-2xl text-white">{brand.name}</h1>
          <p className="mt-1 text-sm text-sidebar-muted">Admin Console</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Input
              label="Password"
              type="password"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required', minLength: 4 })}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
            <p className="text-center text-xs text-muted">
              Uses the live API. Seed owner via <code>npm run seed:admin</code> on the server.
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}
