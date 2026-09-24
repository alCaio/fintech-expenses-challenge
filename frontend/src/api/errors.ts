import axios from 'axios'
import type { ApiErrorBody } from '../types/api'

const FALLBACK_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.'

const MESSAGES_BY_STATUS: Partial<Record<number, string>> = {
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Registro não encontrado.',
  500: 'Erro interno no servidor. Tente novamente em instantes.',
}

const STATUSES_WITH_SERVER_MESSAGE = new Set([400, 401, 404, 409])

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null && 'message' in value && 'statusCode' in value
}

export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : FALLBACK_MESSAGE
  }

  if (!error.response) {
    return 'Não foi possível conectar ao servidor.'
  }

  const body: unknown = error.response.data
  if (isApiErrorBody(body)) {
    const message = Array.isArray(body.message) ? body.message.join('; ') : body.message
    if (STATUSES_WITH_SERVER_MESSAGE.has(body.statusCode) && message !== 'Unauthorized') {
      return message
    }
    return MESSAGES_BY_STATUS[body.statusCode] ?? message
  }

  return MESSAGES_BY_STATUS[error.response.status] ?? FALLBACK_MESSAGE
}
