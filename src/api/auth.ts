import request from '../utils/request'

export interface OwnerLoginDTO {
  username: string
  password: string
}

export const authApi = {
  verifyOwnerKey: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<{ unlock: boolean }>('/auth/owner/key-verify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  ownerLogin: (data: OwnerLoginDTO) => {
    return request.post<{ token: string; refreshToken: string }>('/auth/owner/login', data)
  },
  logout: (refreshToken: string) => {
    return request.post('/auth/logout', { refreshToken })
  },
  oauthCallback: (provider: string, code: string, state?: string) => {
    return request.get<{ token: string; refreshToken: string }>(`/auth/oauth/${provider}/callback`, {
      params: { code, state }
    })
  },
  getOAuthUrl: (provider: string) => `/api/auth/oauth/${provider}/authorize`
}
