import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// Request interceptor
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor
request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 200) {
      return res.data
    } else {
      return Promise.reject(new Error(res.message || 'Error'))
    }
  },
  async error => {
    const originalRequest = error.config
    // Handle 401 Unauthorized (Token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken })
          if (res.data.code === 200) {
            const { token, refreshToken: newRefreshToken } = res.data.data
            localStorage.setItem('access_token', token)
            localStorage.setItem('refresh_token', newRefreshToken)
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return request(originalRequest)
          }
        } catch (refreshError) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/' // Simple redirect or state clear
        }
      }
    }
    return Promise.reject(error)
  }
)

export default request
