<template>
  <div class="callback-container">
    <div class="callback-card card">
      <div v-if="state === 'loading'" class="loading-state">
        <div class="spinner"></div>
        <p>正在同步登录状态...</p>
      </div>
      <div v-else-if="state === 'error'" class="error-state">
        <div class="error-icon">❌</div>
        <p>{{ errorMessage }}</p>
        <button @click="goHome" class="back-btn">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const state = ref<'loading' | 'error'>('loading')
const errorMessage = ref('')

const goHome = () => router.push('/')

onMounted(async () => {
  const provider = route.params.provider as string
  const code = route.query.code as string
  const oauthState = route.query.state as string

  if (!code) {
    state.value = 'error'
    errorMessage.value = '未获得授权码'
    return
  }

  try {
    const res = await authApi.oauthCallback(provider, code, oauthState) as any
    authStore.setTokens(res.token, res.refreshToken)
    await authStore.fetchUser()
    
    // 获取保存的重定向路径
    const redirectPath = localStorage.getItem('oauth_redirect_path') || '/'
    localStorage.removeItem('oauth_redirect_path')
    
    router.push(redirectPath)
  } catch (err: any) {
    state.value = 'error'
    errorMessage.value = err.message || '登录失败，请重试'
  }
})
</script>

<style scoped>
.callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.callback-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  text-align: center;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #35bfab;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
}

.back-btn {
  margin-top: 10px;
  padding: 10px 24px;
  background: #35bfab;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style>
