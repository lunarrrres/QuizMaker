import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${JSON.parse(token)}`
  }
  return config
})

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = sessionStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${JSON.parse(refreshToken)}`,
              },
            }
          )
          
          const { accessToken, refreshToken: newRefreshToken } = response.data
          sessionStorage.setItem('accessToken', JSON.stringify(accessToken))
          sessionStorage.setItem('refreshToken', JSON.stringify(newRefreshToken))
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          sessionStorage.removeItem('accessToken')
          sessionStorage.removeItem('refreshToken')
          sessionStorage.removeItem('user')
          window.location.href = '/login'
        }
      } else {
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
