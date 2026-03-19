<template>
  <nav class="navbar-wrapper">
    <div class="navbar-container">
      <!-- Logo / Brand -->
      <router-link to="/" class="nav-logo">
        <span class="logo-icon">🌿</span>
        <span class="logo-text">Personal Blog</span>
      </router-link>

      <!-- Nav Links -->
      <div class="nav-links">
        <router-link to="/" class="nav-item" active-class="active">
          <Home :size="18" />
          <span>首页</span>
        </router-link>
        
        <router-link to="/anime" class="nav-item" active-class="active">
          <Film :size="18" />
          <span>追番</span>
        </router-link>

        <router-link to="/write" class="nav-item" active-class="active">
          <PenLine :size="18" />
          <span>创作</span>
        </router-link>
      </div>

      <!-- Right Side (Optional: Search/Profile) -->
      <div class="nav-right">
        <div class="status-dot"></div>
        <span class="status-text">V1.0 MVP</span>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Home, Film, PenLine } from 'lucide-vue-next'
</script>

<style scoped>
.navbar-wrapper {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.03);
}

.navbar-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  transition: opacity 0.2s;
}
.nav-logo:hover {
  opacity: 0.8;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #2e4a4e;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 12px;
  color: #5a8c8f;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(53, 191, 171, 0.08);
  color: #35bfab;
}

.nav-item.active {
  background: rgba(53, 191, 171, 0.12);
  color: #35bfab;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(53, 191, 171, 0.2);
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #35bfab;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-text {
  font-size: 12px;
  font-weight: 700;
  color: #2e4a4e;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

@media (max-width: 640px) {
  .logo-text { display: none; }
  .nav-item span { display: none; }
  .nav-right { display: none; }
}
</style>
