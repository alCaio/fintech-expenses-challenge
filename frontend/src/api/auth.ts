import type { ApiResponse } from '../types/api'
import type { AuthResponse, LoginInput, RegisterInput, User } from '../types/domain'
import { api } from './client'

export const authApi = {
  async login(input: LoginInput): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', input)
    return data.data
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', input)
    return data.data
  },

  async me(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/users/me')
    return data.data
  },
}
