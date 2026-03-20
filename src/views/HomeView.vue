<template>
  <div class="home-wrapper">
    <!-- 动态背景渐变 -->
    <div class="bg-gradient"></div>

    <!-- 主容器：三栏 Bento Grid -->
    <div class="bento-container">

      <!-- ==================== 左列 ==================== -->
      <div class="col-left">
        <!-- 用户信息卡 -->
        <div class="card user-card">
          <div class="user-header">
            <div class="user-avatar">
              <span>C</span>
            </div>
            <div class="user-info">
              <span class="user-name">Challenge</span>
              <span class="user-badge">开发中</span>
            </div>
          </div>
          <div class="nav-section-title">GENERAL</div>
          <nav class="nav-menu">
            <router-link to="/study" class="nav-item">
              <BookOpen :size="15" />
              <span>学习记录</span>
            </router-link>
            <router-link to="/essay" class="nav-item">
              <PenLine :size="15" />
              <span>生活随笔</span>
            </router-link>
            <router-link to="/interest" class="nav-item">
              <Sparkles :size="15" />
              <span>兴趣使然</span>
            </router-link>
            <router-link to="/anime" class="nav-item">
              <Tv :size="15" />
              <span>追番管理</span>
            </router-link>
            <a href="javascript:void(0)" @click="showAboutModal = true" class="nav-item">
              <Info :size="15" />
              <span>关于网站</span>
            </a>
            <router-link to="/recent" class="nav-item">
              <BookOpen :size="15" />
              <span>文章归档</span>
            </router-link>
          </nav>
        </div>

        <!-- 最新文章卡 -->
        <div class="card latest-card">
          <div class="latest-title">最新文章</div>
          <div v-if="latestNotes.length === 0" class="latest-empty">
            暂无文章
          </div>
          <router-link v-for="note in latestNotes" :key="note.id" :to="`/note/${note.id}`" class="latest-item">
            <template v-if="note.cover">
              <img :src="note.cover" alt="cover" class="latest-cover" />
            </template>
            <template v-else>
              <div class="latest-cover placeholder-cover">{{ note.title.charAt(0) }}</div>
            </template>
            <div class="latest-info">
              <div class="latest-name">{{ note.title }}</div>
              <div class="latest-meta">{{ note.tag }}</div>
              <div class="latest-date">{{ note.date }}</div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- ==================== 中列 ==================== -->
      <div class="col-mid">
        <!-- Banner 图片 -->
        <div class="card banner-card">
          <div class="banner-inner">
            <div class="banner-emoji-row">
              <span>🐱</span><span>🌻</span><span>🎴</span><span>🐟</span>
            </div>
            <div class="banner-sub">我的数字花园</div>
          </div>
        </div>

        <!-- 问候卡 -->
        <div class="card greet-card">
          <div class="greet-avatar">🐱</div>
          <div class="greet-text">{{ greetingText }}</div>
          <div class="greet-name">I'm <span class="greet-highlight">Challenge</span>, Nice to<br/>meet you!</div>
        </div>



        <!-- 随机推荐卡 -->
        <div class="card recommend-card">
          <div class="recommend-label">随机推荐</div>
          <div v-for="item in mockRecommend" :key="item.id" class="recommend-item">
            <img :src="item.cover" alt="cover" class="recommend-cover" />
            <div class="recommend-info">
              <div class="recommend-name">{{ item.title }}</div>
              <div class="recommend-desc">{{ item.desc }}</div>
              <div class="recommend-stats">Views: {{ item.views }} &nbsp; Marks: {{ item.marks }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== 右列 ==================== -->
      <div class="col-right">
        <!-- 写笔记按钮 -->
        <div class="card write-card">
          <router-link to="/write" class="write-btn">
            <Edit3 :size="18" />
            <span>写文章</span>
          </router-link>
          <div class="write-socials">
            <a href="https://github.com" target="_blank" class="social-icon" title="Github"><Github :size="16" /></a>
            <a href="https://bilibili.com" target="_blank" class="social-icon" title="Bilibili"><Youtube :size="16" /></a>
            <a href="mailto:czf@example.com" class="social-icon" title="Mail"><Mail :size="16" /></a>
          </div>
        </div>

        <!-- 数字时钟 -->
        <div class="card clock-card">
          <div class="digital-clock">{{ currentTime }}</div>
        </div>

        <!-- 日历 -->
        <div class="card calendar-card">
          <div class="calendar-header">{{ calendarTitle }}</div>
          <div class="weekdays">
            <span v-for="d in ['一','二','三','四','五','六','日']" :key="d">{{ d }}</span>
          </div>
          <div class="calendar-grid">
            <div
              v-for="(day, i) in calendarDays"
              :key="i"
              :class="['cal-day', day.isEmpty ? 'empty' : '', day.isToday ? 'today' : '']"
            >
              {{ day.isEmpty ? '' : day.day }}
            </div>
          </div>
        </div>

        <!-- 追番统计 -->
        <div class="card anime-widget-card">
          <div class="widget-label">追番进度</div>
          <div class="anime-stats">
            <div class="anime-stat-item">
              <span class="stat-num">{{ animeStats.watching }}</span>
              <span class="stat-desc">在追</span>
            </div>
            <div class="anime-stat-divider"></div>
            <div class="anime-stat-item">
              <span class="stat-num">{{ animeStats.completed }}</span>
              <span class="stat-desc">已完结</span>
            </div>
            <div class="anime-stat-divider"></div>
            <div class="anime-stat-item">
              <span class="stat-num">{{ animeStats.totalEps }}</span>
              <span class="stat-desc">集已看</span>
            </div>
          </div>
          <router-link to="/anime" class="anime-widget-link">查看详情 →</router-link>
        </div>

        <!-- 点赞计数 -->
        <div class="card likes-card">
          <Heart :size="24" class="heart-icon" />
          <span class="likes-num">{{ 13041 }}</span>
        </div>
      </div>

    </div>

    <!-- 关于网站 弹窗 -->
    <div class="modal-overlay" v-if="showAboutModal" @click.self="showAboutModal = false">
      <div class="modal-card card">
        <h3 class="modal-title">关于网站</h3>
        <div class="modal-content">
          <p>这是一个基于 Vue 3 + Tailwind CSS 和 Spring Boot 开发的个人数字花园。</p>
          <p>在这里，我会记录学习笔记、生活随笔，以及展示我的兴趣爱好体验。</p>
          <p>持续开发中，敬请期待更多功能！</p>
        </div>
        <button class="modal-close-btn" @click="showAboutModal = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  BookOpen, PenLine, Sparkles, Tv, Info,
  Edit3, Grid, Github, Youtube, Mail, Heart
} from 'lucide-vue-next'
import { noteApi } from '@/api/note'
import { animeApi } from '@/api/anime'

const showDevAlert = () => {
  alert('该板块正在开发中，敬请期待！')
}

const showAboutModal = ref(false)

// ======= 时钟 =======
const currentTime = ref('')
const updateTime = () => {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${h}:${m}:${s}`
}
let timeInterval: ReturnType<typeof setInterval>

// ======= 问候语 =======
const greetingText = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return 'Good Night'
  if (h < 12) return 'Good Morning'
  if (h < 18) return 'Good Afternoon'
  return 'Good Evening'
})

// ======= 日历 =======
const calendarTitle = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const weekday = weekdays[now.getDay()]
  return `${y}/${m}/${now.getDate()} 周${weekday}`
})

const calendarDays = computed(() => {
  const days: { day: number; isEmpty: boolean; isToday: boolean }[] = []
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  // 中国习惯：周一为第一列
  let firstDay = new Date(year, month, 1).getDay()
  firstDay = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  for (let i = 0; i < firstDay; i++) {
    days.push({ day: 0, isEmpty: true, isToday: false })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isEmpty: false, isToday: i === today.getDate() })
  }
  return days
})

// ======= 数据加载 =======
const animeStats = ref({
  watching: 0,
  completed: 0,
  totalEps: 0
})

const latestNotes = ref<any[]>([])

const fetchLatestNotes = async () => {
  try {
    const res = await noteApi.getList({ pageNum: 1, pageSize: 3 })
    const types = ['学习记录', '生活随笔', '兴趣使然']
    latestNotes.value = res.list.map(item => ({
      id: item.id,
      title: item.title,
      tag: types[item.moduleType] || '笔记',
      date: item.createTime.split('T')[0].replace(/-/g, '/'),
      cover: item.coverUrl
    }))
  } catch (e) {
    console.error('获取最新文章失败', e)
  }
}

const fetchAnimeStats = async () => {
  try {
    // 假设不传年份和季度可以获取到全部番剧
    const list = await animeApi.getList()
    let w = 0, c = 0, eps = 0
    list.forEach(item => {
      if (item.subject.status === 1) w++
      if (item.subject.status === 2) c++
      eps += item.progress.watchedEps.length
    })
    animeStats.value.watching = w
    animeStats.value.completed = c
    animeStats.value.totalEps = eps
  } catch (e) {
    console.error('获取追番统计失败', e)
  }
}

const mockRecommend = ref([
  {
    id: 1,
    title: 'Reading Notes',
    desc: '黑色神话。',
    views: 20524,
    marks: 327,
    cover: 'https://picsum.photos/seed/rec1/48/48'
  }
])

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  fetchLatestNotes()
  fetchAnimeStats()
})

onUnmounted(() => {
  clearInterval(timeInterval)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Noto+Sans+SC:wght@400;500;700&display=swap');

/* ====== 背景 ====== */
.home-wrapper {
  min-height: 100vh;
  position: relative;
  font-family: 'Noto Sans SC', sans-serif;
  overflow: auto;
}

.bg-gradient {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at 20% 50%, #c8e6c4 0%, #dff0d8 30%, #e8f5e9 55%, #b2dfdb 80%, #a5d6a7 100%);
  z-index: 0;
}

/* ====== Bento 容器 ====== */
.bento-container {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px;
  display: grid;
  grid-template-columns: 240px 1fr 280px;
  gap: 16px;
  align-items: start;
}

/* ====== 通用卡片 ====== */
.card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
  transition: box-shadow 0.2s;
}
.card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* ====== 左列 ====== */
.col-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 用户卡 */
.user-card {
  padding: 20px 16px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4db6ac, #26a69a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.user-name {
  font-weight: 700;
  color: #2e4a4e;
  font-size: 15px;
}

.user-badge {
  display: inline-block;
  margin-left: 6px;
  font-size: 11px;
  background: rgba(53, 191, 171, 0.18);
  color: #35bfab;
  border-radius: 20px;
  padding: 1px 8px;
}

.nav-section-title {
  font-size: 10px;
  letter-spacing: 1.5px;
  color: #8fadb2;
  font-weight: 600;
  margin-bottom: 8px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 12px;
  color: #4a7a82;
  text-decoration: none;
  font-size: 13.5px;
  transition: background 0.15s, color 0.15s;
}

.nav-item:hover, .nav-item.router-link-exact-active {
  background: rgba(53, 191, 171, 0.15);
  color: #2a7a74;
  font-weight: 500;
}

/* 最新文章卡 */
.latest-card {
  padding: 16px;
}

.latest-title {
  font-size: 12px;
  color: #8fadb2;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.latest-item {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  text-decoration: none;
  border-radius: 12px;
  padding: 8px;
  margin-left: -8px;
  margin-right: -8px;
  transition: background 0.2s;
  cursor: pointer;
}

.latest-item:hover {
  background: rgba(255, 255, 255, 0.4);
}

.latest-item:last-child {
  margin-bottom: 0;
}

.latest-cover {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.placeholder-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #a5d6a7, #4db6ac);
  color: white;
  font-size: 20px;
  font-weight: 700;
}

.latest-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}

.latest-name {
  font-size: 13px;
  font-weight: 600;
  color: #2e4a4e;
  line-height: 1.3;
}

.latest-meta {
  font-size: 11px;
  color: #35bfab;
}

.latest-date {
  font-size: 11px;
  color: #9bb5b9;
}

/* ====== 中列 ====== */
.col-mid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Banner */
.banner-card {
  padding: 24px;
  background: linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(200,240,220,0.6) 100%);
  text-align: center;
  min-height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-inner {}

.banner-emoji-row {
  font-size: 36px;
  letter-spacing: 12px;
  margin-bottom: 8px;
}

.banner-sub {
  font-size: 13px;
  color: #5a8c8f;
  font-weight: 500;
}

/* 问候卡 */
.greet-card {
  padding: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
}

.greet-avatar {
  font-size: 52px;
  line-height: 1;
  filter: drop-shadow(0 4px 12px rgba(53, 191, 171, 0.25));
}

.greet-text {
  font-size: 15px;
  color: #5a8c8f;
  font-weight: 500;
}

.greet-name {
  font-size: 18px;
  font-weight: 700;
  color: #2e4a4e;
  line-height: 1.5;
}

.greet-highlight {
  color: #35bfab;
  font-style: italic;
  font-size: 22px;
}

/* 社交链接已合并到写文章卡片 */
.write-socials {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #5a8c8f;
  background: rgba(53, 191, 171, 0.08);
  transition: all 0.2s;
  text-decoration: none;
}

.social-icon:hover {
  background: rgba(53, 191, 171, 0.15);
  color: #35bfab;
  transform: translateY(-1px);
}

/* 随机推荐 */
.recommend-card {
  padding: 16px;
}

.recommend-label {
  font-size: 12px;
  color: #8fadb2;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.recommend-item {
  display: flex;
  gap: 12px;
  align-items: center;
}

.recommend-cover {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
}

.recommend-name {
  font-size: 14px;
  font-weight: 600;
  color: #2e4a4e;
}

.recommend-desc {
  font-size: 12px;
  color: #7aabb0;
  margin: 2px 0;
}

.recommend-stats {
  font-size: 11px;
  color: #9bb5b9;
}

/* ====== 右列 ====== */
.col-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 写文章 */
.write-card {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.write-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #35bfab, #26a69a);
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  transition: opacity 0.15s, transform 0.15s;
  box-shadow: 0 4px 14px rgba(53, 191, 171, 0.35);
  flex-shrink: 0;
}

.write-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.icon-btn {
  background: transparent;
  border: none;
  color: #8fadb2;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.15s;
}

.icon-btn:hover {
  background: rgba(53, 191, 171, 0.1);
}

/* 数字时钟 */
.clock-card {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(44, 62, 64, 0.88);
  border-radius: 20px;
}

.digital-clock {
  font-family: 'Share Tech Mono', monospace;
  font-size: 40px;
  color: #a8f0e0;
  letter-spacing: 4px;
  text-shadow: 0 0 20px rgba(53, 191, 171, 0.6);
}

/* 日历 */
.calendar-card {
  padding: 16px;
}

.calendar-header {
  font-size: 12px;
  color: #5a8c8f;
  font-weight: 600;
  margin-bottom: 12px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 4px;
}

.weekdays span {
  font-size: 11px;
  color: #9bb5b9;
  padding: 4px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-day {
  text-align: center;
  font-size: 12px;
  color: #4a7a82;
  padding: 5px 2px;
  border-radius: 8px;
  transition: background 0.1s;
}

.cal-day:not(.empty):hover {
  background: rgba(53, 191, 171, 0.12);
}

.cal-day.today {
  background: #35bfab;
  color: white;
  font-weight: 700;
  border-radius: 50%;
}

.cal-day.empty {
  pointer-events: none;
}

/* 追番统计 */
.anime-widget-card {
  padding: 16px;
}

.widget-label {
  font-size: 12px;
  color: #8fadb2;
  font-weight: 600;
  margin-bottom: 12px;
}

.anime-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 12px;
}

.anime-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-num {
  font-size: 22px;
  font-weight: 700;
  color: #35bfab;
}

.stat-desc {
  font-size: 11px;
  color: #9bb5b9;
}

.anime-stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(53, 191, 171, 0.2);
}

.anime-widget-link {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #35bfab;
  text-decoration: none;
  font-weight: 500;
}

.anime-widget-link:hover {
  color: #26a69a;
}

/* 点赞卡 */
.likes-card {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.heart-icon {
  color: #f48fb1;
  filter: drop-shadow(0 0 6px rgba(244, 143, 177, 0.5));
}

.likes-num {
  font-size: 22px;
  font-weight: 700;
  color: #2e4a4e;
}

/* ====== 弹窗 ====== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: rgba(255, 255, 255, 0.88); /* Increase opacity for better contrast */
  border: 1px solid rgba(255, 255, 255, 0.9);
}

@keyframes modal-pop {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e3a3c;
  text-align: center;
}

.modal-content {
  font-size: 14px;
  line-height: 1.6;
  color: #2e4a4e; /* Darker text */
  font-weight: 500;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
}

.modal-close-btn {
  background: linear-gradient(135deg, #35bfab, #26a69a);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.modal-close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(53, 191, 171, 0.3);
}

/* ====== 响应式 ====== */
@media (max-width: 1024px) {
  .bento-container {
    grid-template-columns: 200px 1fr 240px;
  }
}

@media (max-width: 768px) {
  .bento-container {
    grid-template-columns: 1fr;
  }
  .digital-clock {
    font-size: 38px;
  }
}
</style>
