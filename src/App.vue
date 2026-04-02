<template>
  <div class="app-wrapper">
    <main class="main-content">
      <router-view />
    </main>
    <AppLoginDialog :show="authStore.showLoginDialog" @close="authStore.showLoginDialog = false" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppLoginDialog from '@/components/AppLoginDialog.vue'

const authStore = useAuthStore()

onMounted(() => {
  if (authStore.accessToken) {
    authStore.fetchUser()
  }
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
