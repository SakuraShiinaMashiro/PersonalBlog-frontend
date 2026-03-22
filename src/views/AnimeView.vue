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
            <p class="page-sub">已显示 {{ filteredList.length }} / {{ animeList.length }} 部番剧</p>
          </div>
        </div>

        <div class="top-right">
          <div class="filter-field">
            <span class="field-label">播出年份</span>
            <select v-model="selectedAirYear" class="filter-select">
              <option :value="null">全部年份</option>
              <option v-for="year in availableAirYears" :key="year" :value="year">
                {{ year }}年
              </option>
            </select>
          </div>

          <div class="filter-field">
            <span class="field-label">播出季度</span>
            <select v-model="selectedAirSeason" class="filter-select" :disabled="!selectedAirYear">
              <option :value="null">全部季度</option>
              <option v-for="season in availableAirSeasons" :key="season" :value="season">
                {{ getSeasonLabel(season) }}
              </option>
            </select>
          </div>

          <div class="filter-field">
            <span class="field-label">追番起始时间</span>
            <input
              v-model="trackDateStart"
              type="date"
              class="filter-date-input"
              :max="todayDateString"
              @change="handleTrackDateRangeChange"
            />
          </div>

          <div class="filter-field">
            <span class="field-label">追番终止时间</span>
            <input
              v-model="trackDateEnd"
              type="date"
              class="filter-date-input"
              :max="todayDateString"
              @change="handleTrackDateRangeChange"
            />
          </div>

          <button class="reset-btn" @click="resetFilters">重置筛选</button>

          <!-- 添加按钮 -->
          <button @click="openSearchModal" class="add-btn">
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
            <div :class="['status-badge', getStatusBadgeClass(item.progress.status)]">
              {{ getStatusText(item.progress.status) }}
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
              <span>{{ formatAirInfo(item) }}</span>
              <span class="meta-dot">·</span>
              <span>{{ item.subject.eps || '??' }} 话</span>
            </div>
            <div class="card-time">开始追番：{{ formatTrackDate(item.progress.trackDate) }}</div>
            <div class="card-time">最近观看：{{ formatLastWatchAt(item.progress.lastWatchAt) }}</div>
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
        <p class="empty-text">当前筛选条件下暂无追番记录</p>
        <button @click="openSearchModal" class="add-btn">
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
                <p class="modal-sub">{{ currentAnime?.subject.eps }} 集</p>
              </div>
            </div>
            <button @click="showProgress = false" class="modal-close">
              <X :size="18" />
            </button>
          </div>

          <div class="modal-status-row">
            <div
              v-for="status in [0, 1, 2]"
              :key="status"
              :class="['status-chip', currentAnime?.progress.status === status ? getStatusChipActive(status) : 'chip-inactive']"
            >
              {{ getStatusText(status) }}
            </div>
          </div>

          <div class="track-date-row">
            <span class="track-date-label">开始追番时间</span>
            <div class="track-date-action">
              <input
                v-model="editingTrackDate"
                type="date"
                class="track-date-input"
                :max="todayDateString"
                required
              />
              <button class="quick-btn" @click="handleTrackDateUpdate">保存时间</button>
            </div>
          </div>

          <!-- 集数格子 -->
          <div class="ep-grid custom-scrollbar">
            <button
              v-for="i in episodeDisplayList"
              :key="i"
              @click="toggleEp(i)"
              :class="['ep-btn', isWatched(i) ? 'ep-watched' : 'ep-unwatched']"
            >
              {{ i < 10 ? '0' + i : i }}
            </button>
          </div>

          <div class="quick-actions">
            <div class="quick-row">
              <select v-model.number="quickEpisode" class="quick-select">
                <option v-for="ep in quickEpisodeOptions" :key="ep" :value="ep">
                  第{{ ep }}集
                </option>
              </select>
              <button class="quick-btn" @click="handleSeenTo">看到第N集</button>
              <button class="quick-btn quick-delete" :disabled="deletingAnime" @click="openDeleteConfirm">删除追番</button>
            </div>
            <div class="quick-row quick-row-two">
              <button class="quick-btn quick-complete" @click="handleComplete">一键看完</button>
              <button class="quick-btn quick-reset" @click="handleReset">重置进度</button>
            </div>
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

          <div class="import-date-row">
            <span class="import-date-label">开始追番时间</span>
            <input
              v-model="importTrackDate"
              type="date"
              class="import-date-input"
              :max="todayDateString"
              required
              @change="normalizeImportTrackDate"
              @blur="normalizeImportTrackDate"
            />
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
                <p class="search-meta">{{ res.date }}{{ getWeekDay(res.date) }} · {{ res.eps }} 话</p>
              </div>
              <button @click="importAnime(res)" class="import-btn">导入</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>

  <AppNoticeDialog
    v-model="noticeVisible"
    :message="noticeMessage"
  />

  <AppConfirmDialog
    v-model="showDeleteConfirm"
    title="确认删除该追番记录？"
    message="删除后将清空该番剧的追番进度与开始追番时间，此操作不可恢复。"
    confirm-text="确认"
    cancel-text="取消"
    :danger="true"
    :loading="deletingAnime"
    @confirm="handleDeleteAnime"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'

import { animeApi, AnimeListItem, BangumiSubject } from '@/api/anime'
import { Plus, Search, X } from 'lucide-vue-next'
import AppNoticeDialog from '@/components/AppNoticeDialog.vue'
import AppConfirmDialog from '@/components/AppConfirmDialog.vue'
import { useNotice } from '@/composables/useNotice'

const animeList = ref<AnimeListItem[]>([])
const showProgress = ref(false)
const showSearch = ref(false)
const showDeleteConfirm = ref(false)
const deletingAnime = ref(false)
const currentAnime = ref<AnimeListItem | null>(null)
const keyword = ref('')
const searchResults = ref<BangumiSubject[]>([])
const activeTab = ref(-1) // -1:全部
const selectedAirYear = ref<number | null>(null)
const selectedAirSeason = ref<number | null>(null)
const trackDateStart = ref('')
const trackDateEnd = ref('')
const quickEpisode = ref(1)
const todayDateString = new Date().toISOString().slice(0, 10)
const importTrackDate = ref(todayDateString)
const editingTrackDate = ref('')
const { noticeVisible, noticeMessage, openNotice } = useNotice()

watch(importTrackDate, (newVal) => {
  if (!newVal) {
    importTrackDate.value = todayDateString
  }
})

watch(editingTrackDate, (newVal, oldVal) => {
  if (!newVal && oldVal) {
    editingTrackDate.value = oldVal
  }
})

const statusTabs = [
  { value: -1, label: '全部', dotClass: 'dot-all' },
  { value: 1,  label: '在看', dotClass: 'dot-watching' },
  { value: 0,  label: '想看', dotClass: 'dot-plan' },
  { value: 2,  label: '已看完', dotClass: 'dot-done' }
]

const availableAirYears = computed(() => {
  return Array.from(
    new Set(animeList.value.map(item => item.subject.airYear).filter((year): year is number => !!year))
  ).sort((a, b) => b - a)
})

const availableAirSeasons = computed(() => {
  if (!selectedAirYear.value) return [] as number[]
  return Array.from(
    new Set(
      animeList.value
        .filter(item => item.subject.airYear === selectedAirYear.value)
        .map(item => item.subject.airSeason)
        .filter((season): season is number => !!season)
    )
  ).sort((a, b) => a - b)
})

const baseFilteredList = computed(() => {
  let list = [...animeList.value]

  if (selectedAirYear.value) {
    list = list.filter(i => i.subject.airYear === selectedAirYear.value)
  }

  if (selectedAirSeason.value) {
    list = list.filter(i => i.subject.airSeason === selectedAirSeason.value)
  }

  if (trackDateStart.value) {
    list = list.filter(i => !!i.progress.trackDate && i.progress.trackDate >= trackDateStart.value)
  }

  if (trackDateEnd.value) {
    list = list.filter(i => !!i.progress.trackDate && i.progress.trackDate <= trackDateEnd.value)
  }

  return list
})

const filteredList = computed(() => {
  const list = activeTab.value === -1
    ? baseFilteredList.value
    : baseFilteredList.value.filter(i => i.progress.status === activeTab.value)

  return [...list].sort((a, b) => {
    const aWatch = a.progress.lastWatchAt || ''
    const bWatch = b.progress.lastWatchAt || ''
    if (aWatch !== bWatch) {
      return bWatch.localeCompare(aWatch)
    }

    const aTrack = a.progress.trackDate || ''
    const bTrack = b.progress.trackDate || ''
    if (aTrack !== bTrack) {
      return bTrack.localeCompare(aTrack)
    }

    return b.subject.id - a.subject.id
  })
})

const getCountByStatus = (status: number) => {
  if (status === -1) return baseFilteredList.value.length
  return baseFilteredList.value.filter(i => i.progress.status === status).length
}

const fetchList = async () => {
  try {
    animeList.value = await animeApi.getList()
  } catch (e) {
    console.error('获取列表失败', e)
  }
}

const handleTrackDateRangeChange = () => {
  if (trackDateStart.value && trackDateEnd.value && trackDateStart.value > trackDateEnd.value) {
    trackDateEnd.value = trackDateStart.value
    openNotice('开始日期不能晚于结束日期，已自动调整结束日期')
  }
}

const resetFilters = () => {
  selectedAirYear.value = null
  selectedAirSeason.value = null
  trackDateStart.value = ''
  trackDateEnd.value = ''
}

watch(selectedAirYear, () => {
  if (!selectedAirYear.value) {
    selectedAirSeason.value = null
    return
  }
  if (selectedAirSeason.value && !availableAirSeasons.value.includes(selectedAirSeason.value)) {
    selectedAirSeason.value = null
  }
})

watch(showProgress, (visible) => {
  if (!visible) {
    showDeleteConfirm.value = false
  }
})

const calculateProgress = (item: AnimeListItem) => {
  if (!item.subject.eps || item.subject.eps === 0) return 0
  return Math.min(100, Math.round((item.progress.watchedEps.length / item.subject.eps) * 100))
}

const openProgress = (item: AnimeListItem) => {
  currentAnime.value = item
  quickEpisode.value = item.subject.eps > 0 ? 1 : 0
  editingTrackDate.value = item.progress.trackDate || ''
  showProgress.value = true
}

const openSearchModal = () => {
  importTrackDate.value = todayDateString
  showSearch.value = true
}

const normalizeImportTrackDate = () => {
  if (!importTrackDate.value) {
    importTrackDate.value = todayDateString
  }
}

const quickEpisodeOptions = computed(() => {
  const total = currentAnime.value?.subject.eps ?? 0
  if (total <= 0) return [] as number[]
  return Array.from({ length: total }, (_, i) => i + 1)
})

const episodeDisplayList = computed(() => {
  const total = currentAnime.value?.subject.eps ?? 0
  if (total <= 0) return [] as number[]
  return Array.from({ length: total }, (_, i) => total - i)
})

const isWatched = (index: number) => currentAnime.value?.progress.watchedEps.includes(index) ?? false

const getNowLocalDateTime = () => {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const y = now.getFullYear()
  const m = pad(now.getMonth() + 1)
  const d = pad(now.getDate())
  const hh = pad(now.getHours())
  const mm = pad(now.getMinutes())
  const ss = pad(now.getSeconds())
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}`
}

const calculateStatusByProgress = (watchedCount: number, totalEpisodes: number) => {
  if (watchedCount <= 0) return 0
  if (totalEpisodes > 0 && watchedCount >= totalEpisodes) return 2
  return 1
}

const toggleEp = async (index: number) => {
  if (!currentAnime.value) return
  const animeId = currentAnime.value.subject.id
  const totalEpisodes = currentAnime.value.subject.eps || 0
  if (index < 1 || (totalEpisodes > 0 && index > totalEpisodes)) return

  const eps = currentAnime.value.progress.watchedEps
  const prevEps = [...eps]
  const prevStatus = currentAnime.value.progress.status
  const prevLastWatchAt = currentAnime.value.progress.lastWatchAt
  const wasWatched = eps.includes(index)
  if (wasWatched) {
    eps.splice(eps.indexOf(index), 1)
  } else {
    eps.push(index)
  }

  const deduped = Array.from(new Set(eps)).sort((a, b) => a - b)
  currentAnime.value.progress.watchedEps = deduped
  currentAnime.value.progress.status = calculateStatusByProgress(deduped.length, totalEpisodes)
  currentAnime.value.progress.lastWatchAt = getNowLocalDateTime()

  animeApi.toggle(animeId, index).catch(() => {
    if (!currentAnime.value) return
    currentAnime.value.progress.watchedEps = prevEps
    currentAnime.value.progress.status = prevStatus
    currentAnime.value.progress.lastWatchAt = prevLastWatchAt
  })
}

const onSearch = async () => {
  if (!keyword.value) return
  try {
    searchResults.value = await animeApi.search(keyword.value)
  } catch (e) {
    console.error('搜索失败', e)
  }
}

const importAnime = async (row: BangumiSubject) => {
  try {
    const result = await animeApi.import({
      bgmId: row.id,
      trackDate: importTrackDate.value
    })
    openNotice(result.action === 'UPDATED' ? '已存在，已刷新番剧信息' : '导入成功')
    showSearch.value = false
    await fetchList()
  } catch (e) {
    openNotice('导入失败，请重试')
    console.error('导入失败', e)
  }
}

const handleTrackDateUpdate = async () => {
  if (!currentAnime.value || !editingTrackDate.value) {
    openNotice('请选择开始追番时间')
    return
  }

  const animeId = currentAnime.value.subject.id
  const prevTrackDate = currentAnime.value.progress.trackDate
  currentAnime.value.progress.trackDate = editingTrackDate.value

  try {
    await animeApi.updateTrackDate(animeId, editingTrackDate.value)
    openNotice('追番时间已更新')
  } catch (e) {
    if (currentAnime.value) {
      currentAnime.value.progress.trackDate = prevTrackDate
      editingTrackDate.value = prevTrackDate || ''
    }
    openNotice('追番时间更新失败，请重试')
    console.error('更新追番时间失败', e)
  }
}

const openDeleteConfirm = () => {
  if (!currentAnime.value) return
  showDeleteConfirm.value = true
}

const handleDeleteAnime = async () => {
  if (!currentAnime.value) return
  const animeId = currentAnime.value.subject.id
  deletingAnime.value = true

  try {
    await animeApi.deleteAnime(animeId)
    animeList.value = animeList.value.filter(item => item.subject.id !== animeId)
    showDeleteConfirm.value = false
    showProgress.value = false
    currentAnime.value = null
    openNotice('删除成功')
  } catch (e) {
    showDeleteConfirm.value = false
    openNotice('删除失败，请重试')
    console.error('删除追番失败', e)
  } finally {
    deletingAnime.value = false
  }
}

const buildRangeEpisodes = (n: number) => {
  if (n <= 0) return [] as number[]
  return Array.from({ length: n }, (_, i) => i + 1)
}

const applyLocalProgress = (watchedEps: number[]) => {
  if (!currentAnime.value) return
  const totalEpisodes = currentAnime.value.subject.eps || 0
  const deduped = Array.from(new Set(watchedEps)).sort((a, b) => a - b)
  currentAnime.value.progress.watchedEps = deduped
  currentAnime.value.progress.status = calculateStatusByProgress(deduped.length, totalEpisodes)
}

const handleSeenTo = async () => {
  if (!currentAnime.value) return
  const animeId = currentAnime.value.subject.id
  const totalEpisodes = currentAnime.value.subject.eps || 0
  if (totalEpisodes <= 0 || quickEpisode.value < 1) return

  const targetEpisode = Math.min(quickEpisode.value, totalEpisodes)
  const prevEps = [...currentAnime.value.progress.watchedEps]
  const prevStatus = currentAnime.value.progress.status
  const prevLastWatchAt = currentAnime.value.progress.lastWatchAt
  applyLocalProgress(buildRangeEpisodes(targetEpisode))
  currentAnime.value.progress.lastWatchAt = getNowLocalDateTime()

  try {
    await animeApi.seenTo(animeId, targetEpisode)
  } catch (e) {
    if (currentAnime.value) {
      currentAnime.value.progress.watchedEps = prevEps
      currentAnime.value.progress.status = prevStatus
      currentAnime.value.progress.lastWatchAt = prevLastWatchAt
    }
    openNotice('操作失败，请重试')
    console.error('快捷更新到第N集失败', e)
  }
}

const handleComplete = async () => {
  if (!currentAnime.value) return
  const animeId = currentAnime.value.subject.id
  const totalEpisodes = currentAnime.value.subject.eps || 0
  if (totalEpisodes <= 0) return

  const prevEps = [...currentAnime.value.progress.watchedEps]
  const prevStatus = currentAnime.value.progress.status
  const prevLastWatchAt = currentAnime.value.progress.lastWatchAt
  applyLocalProgress(buildRangeEpisodes(totalEpisodes))
  currentAnime.value.progress.lastWatchAt = getNowLocalDateTime()

  try {
    await animeApi.complete(animeId)
  } catch (e) {
    if (currentAnime.value) {
      currentAnime.value.progress.watchedEps = prevEps
      currentAnime.value.progress.status = prevStatus
      currentAnime.value.progress.lastWatchAt = prevLastWatchAt
    }
    openNotice('操作失败，请重试')
    console.error('一键看完失败', e)
  }
}

const handleReset = async () => {
  if (!currentAnime.value) return
  const animeId = currentAnime.value.subject.id

  const prevEps = [...currentAnime.value.progress.watchedEps]
  const prevStatus = currentAnime.value.progress.status
  const prevLastWatchAt = currentAnime.value.progress.lastWatchAt
  applyLocalProgress([])
  currentAnime.value.progress.lastWatchAt = getNowLocalDateTime()

  try {
    await animeApi.reset(animeId)
  } catch (e) {
    if (currentAnime.value) {
      currentAnime.value.progress.watchedEps = prevEps
      currentAnime.value.progress.status = prevStatus
      currentAnime.value.progress.lastWatchAt = prevLastWatchAt
    }
    openNotice('操作失败，请重试')
    console.error('重置进度失败', e)
  }
}

const getStatusText = (status: number) => ['想看', '在看', '已看完'][status] || '未知'

const getStatusBadgeClass = (status: number) => {
  return ['badge-plan', 'badge-watching', 'badge-done'][status] || 'badge-plan'
}

const getStatusChipActive = (status: number) => {
  return ['chip-plan', 'chip-watching', 'chip-done'][status] || 'chip-plan'
}

const getWeekDay = (dateStr?: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  return ' 星期' + ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
}

const formatAirInfo = (item: AnimeListItem) => {
  if (item.subject.airDate) {
    return item.subject.airDate + getWeekDay(item.subject.airDate)
  }
  return `${item.subject.airYear}年 ${getSeasonName(item.subject.airSeason)}季`
}

const formatTrackDate = (trackDate?: string) => trackDate || '--'

const formatLastWatchAt = (lastWatchAt?: string) => {
  if (!lastWatchAt) return '--'
  return lastWatchAt.replace('T', ' ').slice(0, 16)
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
  color: #1a2b2d;
  margin: 0;
}

.page-sub {
  font-size: 12px;
  color: #374151;
  margin: 2px 0 0;
}

.top-right {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: stretch;
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  color: #5f7f83;
  line-height: 1;
  text-align: center;
}

.filter-select,
.filter-date-input {
  height: 34px;
  padding: 0 10px;
  border: 1px solid rgba(53, 191, 171, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  color: #1a2b2d;
  outline: none;
  transition: border-color 0.15s, background-color 0.15s;
}

.filter-select {
  min-width: 106px;
}

.filter-date-input {
  min-width: 146px;
}

.filter-select:focus,
.filter-date-input:focus {
  border-color: #35bfab;
}

.filter-select:disabled {
  background: rgba(255, 255, 255, 0.35);
  color: #8fadb2;
  cursor: not-allowed;
}

.reset-btn {
  height: 34px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(53, 191, 171, 0.28);
  background: rgba(255, 255, 255, 0.62);
  color: #2f4e50;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  align-self: flex-end;
}

.reset-btn:hover {
  border-color: rgba(53, 191, 171, 0.55);
  color: #1a2b2d;
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
  align-self: flex-end;
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
  color: #1a2b2d;
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
  top: 10px;
  left: 10px;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  color: white;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.badge-plan { background: rgba(56, 73, 76, 0.82); }
.badge-watching { background: rgba(43, 168, 153, 0.92); }
.badge-done { background: rgba(67, 160, 71, 0.92); }

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
  color: #1a2b2d;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-meta {
  font-size: 11px;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}
.meta-dot { color: #718096; }

.card-time {
  font-size: 11px;
  color: #2d3748;
  margin-bottom: 4px;
}

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
.empty-text { color: #374151; font-size: 14px; margin: 0; }

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
  color: #1a2b2d;
  margin: 0;
}

.modal-sub {
  font-size: 12px;
  color: #374151;
  margin: 3px 0 0;
}

.modal-close {
  color: #374151;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  flex-shrink: 0;
  transition: background 0.15s;
}
.modal-close:hover { background: rgba(53,191,171,0.1); color: #35bfab; }

.modal-status-row {
  display: flex;
  gap: 10px;
  padding: 14px 20px;
}

.track-date-row {
  padding: 0 20px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.track-date-label {
  font-size: 12px;
  color: #1a2b2d;
  font-weight: 600;
}

.track-date-action {
  display: flex;
  align-items: center;
  gap: 8px;
}

.track-date-input {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(53, 191, 171, 0.25);
  background: rgba(255, 255, 255, 0.65);
  color: #1a2b2d;
  font-size: 12px;
  outline: none;
}

.track-date-input::-webkit-clear-button,
.track-date-input::-webkit-datetime-edit-clear-button,
.import-date-input::-webkit-clear-button,
.import-date-input::-webkit-datetime-edit-clear-button {
  display: none !important;
  -webkit-appearance: none;
}

.status-chip {
  flex: 1;
  padding: 9px 0;
  border-radius: 14px;
  border: none;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.chip-inactive {
  background: rgba(255, 255, 255, 0.45);
  color: #374151;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.chip-plan {
  background: linear-gradient(135deg, #90a4ae, #78909c);
  color: white;
  box-shadow: 0 4px 12px rgba(120, 144, 156, 0.35);
}

.chip-watching {
  background: linear-gradient(135deg, #35bfab, #4fc3f7);
  color: white;
  box-shadow: 0 4px 12px rgba(53, 191, 171, 0.35);
}

.chip-done {
  background: linear-gradient(135deg, #66bb6a, #43a047);
  color: white;
  box-shadow: 0 4px 12px rgba(67, 160, 71, 0.35);
}

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
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.ep-watched {
  background: linear-gradient(135deg, #35bfab, #4fc3f7);
  color: white;
  box-shadow: 0 4px 12px rgba(53, 191, 171, 0.35);
}
.ep-unwatched {
  background: rgba(255, 255, 255, 0.45);
  border-color: rgba(255, 255, 255, 0.5);
  color: #374151;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.ep-unwatched:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(53, 191, 171, 0.3);
  color: #35bfab;
  transform: translateY(-1px);
}

.quick-actions {
  padding: 0 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-row {
  display: flex;
  gap: 10px;
}

.quick-row-two .quick-btn {
  flex: 1;
}

.quick-select {
  min-width: 110px;
  padding: 9px 10px;
  border-radius: 12px;
  border: 1px solid rgba(53, 191, 171, 0.25);
  background: rgba(255, 255, 255, 0.65);
  color: #1a2b2d;
  font-size: 13px;
  font-weight: 600;
  outline: none;
}

.quick-btn {
  padding: 9px 14px;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  color: #ffffff;
  background: linear-gradient(135deg, #35bfab, #26a69a);
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.quick-btn:hover {
  opacity: 0.92;
}

.quick-btn:active {
  transform: scale(0.98);
}

.quick-btn:disabled {
  opacity: 0.72;
  cursor: not-allowed;
  transform: none;
}

.quick-complete {
  background: linear-gradient(135deg, #5bbd6a, #43a047);
}

.quick-reset {
  background: linear-gradient(135deg, #90a4ae, #78909c);
}

.quick-delete {
  background: linear-gradient(135deg, #ef5350, #e53935);
  box-shadow: 0 4px 14px rgba(229, 57, 53, 0.28);
  margin-left: auto;
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
  color: #374151;
}
.search-input {
  flex: 1;
  padding: 9px 12px 9px 36px;
  border: 1px solid rgba(53,191,171,0.25);
  border-radius: 14px;
  background: rgba(255,255,255,0.6);
  font-size: 13px;
  color: #1a2b2d;
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

.import-date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 20px 12px;
}

.import-date-label {
  font-size: 12px;
  color: #1a2b2d;
  font-weight: 600;
}

.import-date-input {
  width: 170px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(53, 191, 171, 0.25);
  background: rgba(255, 255, 255, 0.65);
  color: #1a2b2d;
  font-size: 12px;
  outline: none;
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 20px 20px;
}

.empty-search {
  padding: 36px 0;
  text-align: center;
  color: #374151;
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
  color: #1a2b2d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.search-meta { font-size: 11px; color: #374151; margin-top: 2px; }

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
