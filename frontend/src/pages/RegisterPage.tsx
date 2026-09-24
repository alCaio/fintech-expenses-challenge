import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { getErrorMessage } from '../api/errors'
import { useAuth } from '../auth/useAuth'
import { AuthCard } from '../components/layout/AuthCard'
import { FormField } from '../components/ui/FormField'
import type { RegisterInput } from '../types/domain'

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>()

  const onSubmit = async (input: RegisterInput) => {
    try {
      await registerUser(input)
      toast.success('Conta criada com sucesso')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <AuthCard
      title="Criar conta"
      subtitle="Leva menos de um minuto."
      footer={
        <>
          Já tem conta? <Link to="/login">Entrar</Link>
        </>
      }
    >
      <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Nome" htmlFor="name" error={errors.name?.message}>
          <input
            id="name"
            autoComplete="name"
            {...register('name', {
              required: 'Informe o nome',
              maxLength: { value: 100, message: 'Máximo de 100 caracteres' },
            })}
          />
        </FormField>
        <FormField label="E-mail" htmlFor="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email', {
              required: 'Informe o e-mail',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'E-mail inválido' },
            })}
          />
        </FormField>
        <FormField label="Senha" htmlFor="password" error={errors.password?.message}>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password', {
              required: 'Informe a senha',
              minLength: { value: 8, message: 'Mínimo de 8 caracteres' },
              pattern: {
                value: /(?=.*[a-zA-Z])(?=.*\d)/,
                message: 'Use ao menos uma letra e um número',
              },
            })}
          />
        </FormField>
        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? 'Criando...' : 'Criar conta'}
        </button>
      </form>
    </AuthCard>
  )
}
