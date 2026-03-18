import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/HomeView.vue')
    },
    {
      path: '/anime',
      name: 'anime',
      component: () => import('./views/AnimeView.vue')
    },
    {
      path: '/write',
      name: 'write',
      component: () => import('./views/WriteView.vue')
    }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
