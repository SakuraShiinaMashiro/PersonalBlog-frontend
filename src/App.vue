<template>
  <div class="app-wrapper">
    <main class="main-content">
      <router-view />
    </main>
    <AppLoginDialog :show="authStore.showLoginDialog" @close="authStore.showLoginDialog = false" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLoginDialog from '@/components/AppLoginDialog.vue'

const authStore = useAuthStore()
const router = useRouter()

const handleOAuthMessage = async (event: MessageEvent) => {
  if (event.origin !== window.location.origin) return
  if (!event.data || event.data.type !== 'oauth-success') return

  const accessToken = localStorage.getItem('access_token')
  const refreshToken = localStorage.getItem('refresh_token')
  if (accessToken && refreshToken) {
    authStore.setTokens(accessToken, refreshToken)
  }
  authStore.setOAuthProvider(localStorage.getItem('oauth_provider'))
  authStore.showLoginDialog = false
  await authStore.fetchUser()

  const redirectPath = typeof event.data.redirectPath === 'string'
    ? event.data.redirectPath
    : '/'
  router.push(redirectPath)
}

onMounted(() => {
  if (authStore.accessToken) {
    authStore.fetchUser()
  }
  window.addEventListener('message', handleOAuthMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleOAuthMessage)
})
</script>

<style>
body {
  margin: 0;
  background: #f5f5f5;
  color: #333;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(53, 191, 171, 0.3);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(53, 191, 171, 0.5);
}
</style>
