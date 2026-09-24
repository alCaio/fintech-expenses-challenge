import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { getErrorMessage } from '../api/errors'
import { useAuth } from '../auth/useAuth'
import { AuthCard } from '../components/layout/AuthCard'
import { FormField } from '../components/ui/FormField'
import type { LoginInput } from '../types/domain'

export function LoginPage() {
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>()

  const onSubmit = async (input: LoginInput) => {
    try {
      await login(input)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <AuthCard
      title="Entrar"
      subtitle="Acompanhe suas movimentações financeiras."
      footer={
        <>
          Não tem conta? <Link to="/register">Cadastre-se</Link>
        </>
      }
    >
      <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="E-mail" htmlFor="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email', { required: 'Informe o e-mail' })}
          />
        </FormField>
        <FormField label="Senha" htmlFor="password" error={errors.password?.message}>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password', { required: 'Informe a senha' })}
          />
        </FormField>
        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </AuthCard>
  )
}
