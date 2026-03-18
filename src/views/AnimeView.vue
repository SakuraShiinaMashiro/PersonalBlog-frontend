<template>
  <div class="anime-wrapper">
    <!-- 背景渐变（与首页一致） -->
    <div class="bg-gradient"></div>

    <div class="anime-container">

      <!-- ========== 顶部栏 ========== -->
      <div class="top-bar card">
        <div class="top-left">
          <div class="page-icon">🎬</div>
          <div>
            <h1 class="page-title">追番管理</h1>
            <p class="page-sub">{{ animeList.length }} 部番剧 · {{ currentSeasonLabel }}</p>
          </div>
        </div>

        <div class="top-right">
          <!-- 年份 -->
          <input
            v-model="selectedYear"
            type="number"
            class="year-input"
            @change="fetchList()"
            placeholder="年份"
          />
          <!-- 季度 -->
          <div class="season-tabs">
            <button
              v-for="s in [1, 2, 3, 4]"
              :key="s"
              @click="selectedSeason = s; fetchList()"
              :class="['season-btn', selectedSeason === s ? 'active' : '']"
            >
              {{ getSeasonLabel(s) }}
            </button>
          </div>
          <!-- 添加按钮 -->
          <button @click="showSearch = true" class="add-btn">
            <Plus :size="16" />
            添加追番
          </button>
        </div>
      </div>

      <!-- ========== 状态过滤 Tabs ========== -->
      <div class="filter-bar">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="['filter-tab', activeTab === tab.value ? 'active' : '']"
        >
          <span :class="['tab-dot', tab.dotClass]"></span>
          {{ tab.label }}
          <span class="tab-count">{{ getCountByStatus(tab.value) }}</span>
        </button>
      </div>

      <!-- ========== 番剧网格 ========== -->
      <div v-if="filteredList.length > 0" class="anime-grid">
        <div
          v-for="item in filteredList"
          :key="item.subject.id"
          class="anime-card card"
          @click="openProgress(item)"
        >
          <!-- 封面 -->
          <div class="card-cover-wrap">
            <img
              :src="item.subject.imageUrl"
              referrerpolicy="no-referrer"
              class="card-cover"
              alt="cover"
            />
            <div :class="['status-badge', getStatusBadgeClass(item.subject.status)]">
              {{ getStatusText(item.subject.status) }}
            </div>
            <!-- 进度环覆盖 -->
            <div class="progress-overlay">
              <svg class="progress-ring" viewBox="0 0 36 36">
                <circle class="ring-bg" cx="18" cy="18" r="15" />
                <circle
                  class="ring-fill"
                  cx="18" cy="18" r="15"
                  :stroke-dasharray="`${calculateProgress(item)} 100`"
                />
              </svg>
              <span class="ring-text">{{ calculateProgress(item) }}%</span>
            </div>
          </div>

          <!-- 信息 -->
          <div class="card-body">
            <h3 class="card-title" :title="item.subject.title">{{ item.subject.title }}</h3>
            <div class="card-meta">
              <span>{{ item.subject.airYear }}年 {{ getSeasonName(item.subject.airSeason) }}季</span>
              <span class="meta-dot">·</span>
              <span>{{ item.subject.eps || '??' }} 话</span>
            </div>
            <!-- 进度条 -->
            <div class="progress-bar-wrap">
              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  :style="{ width: calculateProgress(item) + '%' }"
                ></div>
              </div>
              <span class="progress-text">
                {{ item.progress.watchedEps.length }}/{{ item.subject.eps }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state card">
        <div class="empty-icon">🎌</div>
        <p class="empty-text">这个季度还没有番剧，快去添加吧！</p>
        <button @click="showSearch = true" class="add-btn">
          <Plus :size="16" /> 添加追番
        </button>
      </div>

    </div>

    <!-- ========== 进度管理 Modal ========== -->
    <Transition name="modal">
      <div v-if="showProgress" class="modal-mask" @click.self="showProgress = false">
        <div class="modal-box card">
          <!-- Header -->
          <div class="modal-header">
            <div class="modal-title-wrap">
              <img
                :src="currentAnime?.subject.imageUrl"
                referrerpolicy="no-referrer"
                class="modal-thumb"
              />
              <div>
                <h3 class="modal-title">{{ currentAnime?.subject.title }}</h3>
                <p class="modal-sub">{{ currentAnime?.subject.eps }} 集 · {{ getStatusText(currentAnime?.subject.status ?? 0) }}</p>
              </div>
            </div>
            <button @click="showProgress = false" class="modal-close">
              <X :size="18" />
            </button>
          </div>

          <!-- 状态切换 -->
          <div class="modal-status-row">
            <button
              v-for="status in [0, 1, 2]"
              :key="status"
              @click="handleStatusChange(status)"
              :class="['status-chip', currentAnimeStatus === status ? getStatusChipActive(status) : 'chip-inactive']"
            >
              {{ getStatusText(status) }}
            </button>
          </div>

          <!-- 集数格子 -->
          <div class="ep-grid custom-scrollbar">
            <button
              v-for="i in currentAnime?.subject.eps"
              :key="i"
              @click="toggleEp(i)"
              :class="['ep-btn', isWatched(i) ? 'ep-watched' : 'ep-unwatched']"
            >
              {{ i < 10 ? '0' + i : i }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ========== 搜索导入 Modal ========== -->
    <Transition name="modal">
      <div v-if="showSearch" class="modal-mask" @click.self="showSearch = false">
        <div class="modal-box card search-modal">
          <div class="modal-header">
            <h3 class="modal-title">搜索新番</h3>
            <button @click="showSearch = false" class="modal-close"><X :size="18" /></button>
          </div>

          <div class="search-bar">
            <Search class="search-icon" :size="16" />
            <input
              v-model="keyword"
              type="text"
              class="search-input"
              placeholder="输入番剧名称..."
              @keyup.enter="onSearch"
            />
            <button @click="onSearch" class="search-btn">搜索</button>
          </div>

          <div class="search-results custom-scrollbar">
            <div v-if="searchResults.length === 0" class="empty-search">
              <Search :size="40" stroke-width="1" />
              <p>搜索你想追的番剧</p>
            </div>
            <div
              v-for="res in searchResults"
              :key="res.id"
              class="search-item"
            >
              <img :src="res.images?.grid" referrerpolicy="no-referrer" class="search-cover" />
              <div class="search-info">
                <h4 class="search-name">{{ res.name_cn || res.name }}</h4>
                <p class="search-meta">{{ res.date }} · {{ res.eps }} 话</p>
              </div>
              <button @click="importAnime(res)" class="import-btn">导入</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { animeApi, AnimeListItem, BangumiSubject } from '@/api/anime'
import { Plus, Search, X } from 'lucide-vue-next'

const selectedYear = ref(new Date().getFullYear().toString())
const selectedSeason = ref(Math.floor(new Date().getMonth() / 3) + 1)
const animeList = ref<AnimeListItem[]>([])
const showProgress = ref(false)
const showSearch = ref(false)
const currentAnime = ref<AnimeListItem | null>(null)
const keyword = ref('')
const searchResults = ref<BangumiSubject[]>([])
const activeTab = ref(-1) // -1:全部

const statusTabs = [
  { value: -1, label: '全部', dotClass: 'dot-all' },
  { value: 1,  label: '在看', dotClass: 'dot-watching' },
  { value: 0,  label: '想看', dotClass: 'dot-plan' },
  { value: 2,  label: '已完结', dotClass: 'dot-done' }
]

const filteredList = computed(() => {
  if (activeTab.value === -1) return animeList.value
  return animeList.value.filter(i => i.subject.status === activeTab.value)
})

const getCountByStatus = (status: number) => {
  if (status === -1) return animeList.value.length
  return animeList.value.filter(i => i.subject.status === status).length
}

const currentSeasonLabel = computed(() => {
  return `${selectedYear.value}年 ${getSeasonLabel(selectedSeason.value)}`
})

const fetchList = async () => {
  try {
    animeList.value = await animeApi.getList(Number(selectedYear.value), selectedSeason.value)
  } catch (e) {
    console.error('获取列表失败', e)
  }
}

const calculateProgress = (item: AnimeListItem) => {
  if (!item.subject.eps || item.subject.eps === 0) return 0
  return Math.min(100, Math.round((item.progress.watchedEps.length / item.subject.eps) * 100))
}

const openProgress = (item: AnimeListItem) => {
  currentAnime.value = item
  showProgress.value = true
}

const currentAnimeStatus = computed({
  get: () => currentAnime.value?.subject.status ?? 0,
  set: (val) => { if (currentAnime.value) currentAnime.value.subject.status = val }
})

const isWatched = (index: number) => currentAnime.value?.progress.watchedEps.includes(index) ?? false

const toggleEp = async (index: number) => {
  if (!currentAnime.value) return
  const animeId = currentAnime.value.subject.id
  const eps = currentAnime.value.progress.watchedEps
  const wasWatched = eps.includes(index)
  if (wasWatched) {
    eps.splice(eps.indexOf(index), 1)
  } else {
    eps.push(index)
  }
  animeApi.toggle(animeId, index).catch(() => {
    if (wasWatched) eps.push(index)
    else { const i = eps.indexOf(index); if (i > -1) eps.splice(i, 1) }
  })
}

const handleStatusChange = async (status: number) => {
  if (!currentAnime.value) return
  currentAnime.value.subject.status = status
  try {
    await animeApi.updateStatus(currentAnime.value.subject.id, status)
  } catch (e) {
    console.error('状态更新失败', e)
  }
}

const onSearch = async () => {
  if (!keyword.value) return
  try {
    searchResults.value = await animeApi.search(keyword.value)
  } catch (e) {
    console.error('搜索失败', e)
  }
}

const importAnime = async (row: any) => {
  try {
    await animeApi.import({ bgmId: row.id, airYear: Number(selectedYear.value), airSeason: selectedSeason.value })
    showSearch.value = false
    fetchList()
  } catch (e) {
    console.error('导入失败', e)
  }
}

const getStatusText = (status: number) => ['想看', '在看', '已完结'][status] || '未知'

const getStatusBadgeClass = (status: number) => {
  return ['badge-plan', 'badge-watching', 'badge-done'][status] || 'badge-plan'
}

const getStatusChipActive = (status: number) => {
  return ['chip-plan', 'chip-watching', 'chip-done'][status] || 'chip-plan'
}

const getSeasonLabel = (s: number) => ['1月 冬', '4月 春', '7月 夏', '10月 秋'][s - 1] || ''
const getSeasonName = (s: number) => ['冬', '春', '夏', '秋'][s - 1] || ''

onMounted(fetchList)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');

/* ===== 背景 ===== */
.anime-wrapper {
  min-height: 100vh;
  position: relative;
  font-family: 'Noto Sans SC', sans-serif;
}

.bg-gradient {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at 20% 50%, #c8e6c4 0%, #dff0d8 30%, #e8f5e9 55%, #b2dfdb 80%, #a5d6a7 100%);
  z-index: 0;
}

/* ===== 容器 ===== */
.anime-container {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== 通用卡片 ===== */
.card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
}

/* ===== 顶部栏 ===== */
.top-bar {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.page-icon {
  font-size: 32px;
  line-height: 1;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #2e4a4e;
  margin: 0;
}

.page-sub {
  font-size: 12px;
  color: #8fadb2;
  margin: 2px 0 0;
}

.top-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.year-input {
  width: 80px;
  padding: 7px 10px;
  border: 1px solid rgba(53, 191, 171, 0.3);
  border-radius: 12px;
  background: rgba(255,255,255,0.6);
  font-size: 13px;
  color: #2e4a4e;
  outline: none;
  transition: border-color 0.15s;
}
.year-input:focus {
  border-color: #35bfab;
}

.season-tabs {
  display: flex;
  background: rgba(255,255,255,0.5);
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 14px;
  padding: 3px;
  gap: 2px;
}

.season-btn {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #6a9ca0;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}
.season-btn.active {
  background: white;
  color: #35bfab;
  font-weight: 700;
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: linear-gradient(135deg, #35bfab, #26a69a);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(53, 191, 171, 0.35);
  transition: opacity 0.15s, transform 0.15s;
}
.add-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* ===== 过滤 Tabs ===== */
.filter-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 20px;
  font-size: 13px;
  color: #5a8c8f;
  cursor: pointer;
  font-weight: 500;
  backdrop-filter: blur(8px);
  transition: background 0.15s, color 0.15s, box-shadow 0.15s;
}
.filter-tab.active {
  background: rgba(255,255,255,0.85);
  color: #2e4a4e;
  font-weight: 700;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.tab-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-all { background: #35bfab; }
.dot-watching { background: #4fc3f7; }
.dot-plan { background: #b0bec5; }
.dot-done { background: #81c784; }

.tab-count {
  background: rgba(53, 191, 171, 0.12);
  color: #35bfab;
  border-radius: 20px;
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 700;
}

/* ===== 番剧网格 ===== */
.anime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.anime-card {
  cursor: pointer;
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
}
.anime-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 36px rgba(0,0,0,0.13);
}

/* 封面 */
.card-cover-wrap {
  position: relative;
  width: 100%;
  padding-top: 138%; /* 2:2.8 比例 */
  overflow: hidden;
}
.card-cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.anime-card:hover .card-cover {
  transform: scale(1.05);
}

/* 状态标签 */
.status-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  color: white;
  letter-spacing: 0.5px;
}
.badge-plan { background: rgba(80, 90, 100, 0.8); }
.badge-watching { background: rgba(53, 191, 171, 0.9); }
.badge-done { background: rgba(76, 175, 80, 0.9); }

/* 进度圆环 */
.progress-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.progress-ring {
  position: absolute;
  inset: 0;
  transform: rotate(-90deg);
}
.ring-bg {
  fill: none;
  stroke: rgba(255,255,255,0.25);
  stroke-width: 3;
}
.ring-fill {
  fill: none;
  stroke: #35bfab;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dashoffset: 0;
  transition: stroke-dasharray 0.4s;
}
.ring-text {
  position: relative;
  font-size: 8px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

/* 卡片信息区 */
.card-body {
  padding: 10px 12px 12px;
}
.card-title {
  font-size: 13px;
  font-weight: 700;
  color: #2e4a4e;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-meta {
  font-size: 11px;
  color: #8fadb2;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}
.meta-dot { color: #c0d8db; }

.progress-bar-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}
.progress-bar-bg {
  flex: 1;
  height: 4px;
  background: rgba(53, 191, 171, 0.15);
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #35bfab, #4fc3f7);
  border-radius: 4px;
  transition: width 0.5s;
}
.progress-text {
  font-size: 10px;
  font-weight: 700;
  color: #35bfab;
  white-space: nowrap;
}

/* 空状态 */
.empty-state {
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}
.empty-icon { font-size: 48px; }
.empty-text { color: #8fadb2; font-size: 14px; margin: 0; }

/* ===== Modal ===== */
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(30, 50, 52, 0.4);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-box {
  width: 100%;
  max-width: 460px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-modal {
  max-width: 560px;
}

.modal-header {
  padding: 18px 20px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(53, 191, 171, 0.12);
  gap: 12px;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-thumb {
  width: 44px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.modal-title {
  font-size: 15px;
  font-weight: 700;
  color: #2e4a4e;
  margin: 0;
}

.modal-sub {
  font-size: 12px;
  color: #8fadb2;
  margin: 3px 0 0;
}

.modal-close {
  color: #8fadb2;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  flex-shrink: 0;
  transition: background 0.15s;
}
.modal-close:hover { background: rgba(53,191,171,0.1); color: #35bfab; }

/* 状态切换 chips */
.modal-status-row {
  display: flex;
  gap: 8px;
  padding: 14px 20px;
}

.status-chip {
  flex: 1;
  padding: 7px 0;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}
.chip-inactive {
  background: rgba(255,255,255,0.4);
  color: #8fadb2;
}
.chip-inactive:hover {
  background: rgba(255,255,255,0.7);
  color: #5a8c8f;
}
.chip-plan { background: rgba(176,190,197,0.25); color: #607d8b; border: 1.5px solid #b0bec5; }
.chip-watching { background: rgba(53,191,171,0.15); color: #35bfab; border: 1.5px solid #35bfab; }
.chip-done { background: rgba(76,175,80,0.12); color: #43a047; border: 1.5px solid #81c784; }

/* 集数格子 */
.ep-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 0 20px 20px;
  max-height: 300px;
  overflow-y: auto;
}

.ep-btn {
  height: 38px;
  border: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.ep-watched {
  background: linear-gradient(135deg, #35bfab, #4fc3f7);
  color: white;
  box-shadow: 0 2px 8px rgba(53,191,171,0.35);
}
.ep-unwatched {
  background: rgba(255,255,255,0.5);
  color: #8fadb2;
}
.ep-unwatched:hover {
  background: rgba(53,191,171,0.12);
  color: #35bfab;
}

/* 搜索区 */
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  position: relative;
}
.search-icon {
  position: absolute;
  left: 32px;
  color: #8fadb2;
}
.search-input {
  flex: 1;
  padding: 9px 12px 9px 36px;
  border: 1px solid rgba(53,191,171,0.25);
  border-radius: 14px;
  background: rgba(255,255,255,0.6);
  font-size: 13px;
  color: #2e4a4e;
  outline: none;
  transition: border-color 0.15s;
}
.search-input:focus { border-color: #35bfab; }
.search-btn {
  padding: 9px 20px;
  background: linear-gradient(135deg, #35bfab, #26a69a);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}
.search-btn:hover { opacity: 0.9; }

.search-results {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 20px 20px;
}

.empty-search {
  padding: 36px 0;
  text-align: center;
  color: #8fadb2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 14px;
  transition: background 0.15s;
  margin-bottom: 4px;
}
.search-item:hover { background: rgba(53,191,171,0.08); }

.search-cover {
  width: 40px;
  height: 54px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}
.search-info { flex: 1; min-width: 0; }
.search-name {
  font-size: 13px;
  font-weight: 600;
  color: #2e4a4e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.search-meta { font-size: 11px; color: #8fadb2; margin-top: 2px; }

.import-btn {
  padding: 6px 16px;
  background: linear-gradient(135deg, #35bfab, #26a69a);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(53,191,171,0.35);
  transition: opacity 0.15s, transform 0.15s;
  flex-shrink: 0;
}
.import-btn:hover { opacity: 0.88; transform: translateY(-1px); }

/* ===== 自定义滚动条 ===== */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(53,191,171,0.3);
  border-radius: 10px;
}

/* ===== Modal 动画 ===== */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal-box, .modal-leave-active .modal-box {
  transition: transform 0.2s;
}
.modal-enter-from .modal-box, .modal-leave-to .modal-box {
  transform: scale(0.96) translateY(8px);
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .top-bar { flex-direction: column; align-items: flex-start; }
  .top-right { width: 100%; }
  .anime-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
}
</style>
