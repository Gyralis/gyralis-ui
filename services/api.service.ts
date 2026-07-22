export interface ApiErrorResponse {
  success: false
  error: string
}

export class ApiRequestError extends Error {
  status: number
  payload: unknown

  constructor(status: number, payload: unknown) {
    super(`API request failed with status ${status}`)
    this.name = "ApiRequestError"
    this.status = status
    this.payload = payload
  }
}

export async function fetchApi<T>(
  endpoint: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, init)
  const payload = (await response.json().catch(() => null)) as T

  if (!response.ok) {
    throw new ApiRequestError(response.status, payload)
  }

  return payload
}
