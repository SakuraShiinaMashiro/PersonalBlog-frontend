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
    },
    {
      path: '/recent',
      name: 'recentList',
      component: () => import('./views/NoteCategoryListView.vue'),
      props: {
        pageTitle: '文章归档',
        pageSubtitle: '按发布时间查看最近更新的内容',
        loadingText: '正在加载文章...',
        emptyText: '暂无文章',
        errorText: '获取文章失败，请稍后重试'
      }
    },
    {
      path: '/essay',
      name: 'essayList',
      component: () => import('./views/NoteCategoryListView.vue'),
      props: {
        moduleType: 1,
        pageTitle: '生活随笔',
        pageSubtitle: '记录日常片段与小小灵感',
        loadingText: '正在加载生活随笔...',
        emptyText: '暂无生活随笔',
        errorText: '获取生活随笔失败，请稍后重试'
      }
    },
    {
      path: '/study',
      name: 'studyList',
      component: () => import('./views/NoteCategoryListView.vue'),
      props: {
        moduleType: 0,
        pageTitle: '学习记录',
        pageSubtitle: '整理知识脉络与实践笔记',
        loadingText: '正在加载学习记录...',
        emptyText: '暂无学习记录',
        errorText: '获取学习记录失败，请稍后重试'
      }
    },
    {
      path: '/interest',
      name: 'interestList',
      component: () => import('./views/NoteCategoryListView.vue'),
      props: {
        moduleType: 2,
        pageTitle: '兴趣使然',
        pageSubtitle: '收藏热爱与灵光一闪',
        loadingText: '正在加载兴趣内容...',
        emptyText: '暂无兴趣内容',
        errorText: '获取兴趣使然失败，请稍后重试'
      }
    },
    {
      path: '/note/:id',
      name: 'noteDetail',
      component: () => import('./views/NoteDetailView.vue')
    }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
