import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'

export interface UserInfo {
  id: number
  role: 'OWNER' | 'VISITOR' | 'ANONYMOUS'
  username: string
  avatarUrl: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)
  const accessToken = ref(localStorage.getItem('access_token'))
  const refreshToken = ref(localStorage.getItem('refresh_token'))
  const oauthProvider = ref(localStorage.getItem('oauth_provider'))

  const isLoggedIn = computed(() => !!accessToken.value)
  const isOwner = computed(() => user.value?.role === 'OWNER')

  const setTokens = (access: string, refresh: string) => {
    accessToken.value = access
    refreshToken.value = refresh
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  }

  const clearAuth = () => {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    oauthProvider.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('oauth_provider')
  }

  const setOAuthProvider = (provider: string | null) => {
    oauthProvider.value = provider
    if (provider) {
      localStorage.setItem('oauth_provider', provider)
    } else {
      localStorage.removeItem('oauth_provider')
    }
  }

  const showLoginDialog = ref(false)

  const fetchUser = async () => {
    if (!accessToken.value) return
    try {
      const res = await request.get<UserInfo>('/user/me')
      user.value = res as any // Request util returns data directly
    } catch (error) {
      clearAuth()
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    oauthProvider,
    isLoggedIn,
    isOwner,
    showLoginDialog,
    setTokens,
    setOAuthProvider,
    clearAuth,
    fetchUser
  }
})
