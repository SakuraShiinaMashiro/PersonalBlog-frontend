<template>
  <div class="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- 头部过滤器 -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b-2 border-gray-200 gap-4">
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <div class="w-1.5 h-8 bg-blue-500 rounded-full"></div>
            <h2 class="text-2xl font-bold text-gray-800 tracking-tight">新番时间表</h2>
          </div>
          
          <div class="flex flex-wrap items-center gap-3">
            <!-- 年份选择 -->
            <input 
              v-model="selectedYear" 
              type="number" 
              class="w-24 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              @change="fetchList()"
              placeholder="年份"
            />
            
            <!-- 季度选择 -->
            <div class="flex p-1 bg-gray-200 rounded-lg">
              <button 
                v-for="s in [1, 2, 3, 4]" 
                :key="s"
                @click="selectedSeason = s; fetchList()"
                :class="[
                  'px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
                  selectedSeason === s 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                ]"
              >
                {{ getSeasonLabel(s) }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="flex items-center">
          <button 
            @click="showSearch = true"
            class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow-md transition-colors duration-200 gap-2"
          >
            <Plus :size="18" />
            添加追番
          </button>
        </div>
      </div>

      <!-- 番剧网格 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="item in animeList"
          :key="item.subject.id"
          @click="openProgress(item)"
          class="flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer h-40 group"
        >
          <div class="relative w-28 flex-shrink-0">
            <img 
              :src="item.subject.imageUrl" 
              referrerpolicy="no-referrer" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div 
              :class="[
                'absolute top-0 left-0 px-2 py-0.5 text-[10px] font-bold text-white rounded-br-lg uppercase tracking-wider',
                getStatusBg(item.subject.status)
              ]"
            >
              {{ getStatusText(item.subject.status) }}
            </div>
          </div>
          
          <div class="flex-1 p-4 flex flex-col justify-between min-w-0">
            <div>
              <h3 class="text-base font-bold text-gray-800 truncate mb-1" :title="item.subject.title">
                {{ item.subject.title }}
              </h3>
              <div class="space-y-0.5">
                <p class="text-xs text-gray-500">
                  <span class="text-gray-400">放送:</span> {{ item.subject.airYear }}年{{ getSeasonName(item.subject.airSeason) }}
                </p>
                <p class="text-xs text-gray-500">
                  <span class="text-gray-400">集数:</span> {{ item.subject.eps || '??' }} 话
                </p>
              </div>
            </div>
            
            <div class="mt-2">
              <div class="flex justify-between items-center mb-1">
                <span class="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">Progress</span>
                <span class="text-[10px] font-bold text-blue-600">
                  {{ item.progress.watchedEps.length }}/{{ item.subject.eps }}
                </span>
              </div>
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                  :style="{ width: calculateProgress(item) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 进度管理对话框 (Tailwind 实现 Modal) -->
      <div v-if="showProgress" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 class="text-lg font-bold text-gray-800 truncate pr-4">{{ currentAnime?.subject.title }}</h3>
            <button @click="showProgress = false" class="text-gray-400 hover:text-gray-600">
              <X :size="20" />
            </button>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-5 gap-2 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              <button
                v-for="i in currentAnime?.subject.eps"
                :key="i"
                @click="toggleEp(i)"
                :class="[
                  'h-10 text-xs font-bold rounded-lg transition-all duration-200',
                  isWatched(i) 
                    ? 'bg-green-500 text-white shadow-sm ring-2 ring-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                {{ i < 10 ? '0' + i : i }}
              </button>
            </div>
            
            <div class="flex justify-center pt-4 border-t border-gray-100">
              <div class="flex p-1 bg-gray-100 rounded-lg">
                <button 
                  v-for="status in [0, 1, 2]" 
                  :key="status"
                  @click="handleStatusChange(status)"
                  :class="[
                    'px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200',
                    currentAnimeStatus === status 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  ]"
                >
                  {{ getStatusText(status) }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索导入对话框 -->
      <div v-if="showSearch" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 class="text-lg font-bold text-gray-800">搜索新番</h3>
            <button @click="showSearch = false" class="text-gray-400 hover:text-gray-600">
              <X :size="20" />
            </button>
          </div>
          
          <div class="p-6">
            <div class="flex gap-2 mb-6">
              <div class="relative flex-1">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
                <input 
                  v-model="keyword" 
                  type="text" 
                  class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                  placeholder="输入番剧名称..."
                  @keyup.enter="onSearch"
                />
              </div>
              <button 
                @click="onSearch"
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
              >
                搜索
              </button>
            </div>
            
            <div class="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div v-if="searchResults.length === 0" class="py-12 text-center text-gray-400">
                <div class="mb-2 flex justify-center"><Search :size="48" stroke-width="1" /></div>
                <p>暂无搜索结果</p>
              </div>
              
              <div v-for="res in searchResults" :key="res.id" class="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors mb-2">
                <img :src="res.images?.grid" referrerpolicy="no-referrer" class="w-12 h-16 object-cover rounded-lg shadow-sm" />
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-bold text-gray-800 truncate">{{ res.name_cn || res.name }}</h4>
                  <p class="text-xs text-gray-400 mt-1">{{ res.date }} / {{ res.eps }}话</p>
                </div>
                <button 
                  @click="importAnime(res)"
                  class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg transition-colors"
                >
                  导入
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

const fetchList = async () => {
  try {
    animeList.value = await animeApi.getList(
      Number(selectedYear.value),
      selectedSeason.value
    )
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

const isWatched = (index: number) => {
  return currentAnime.value?.progress.watchedEps.includes(index) ?? false
}

const toggleEp = async (index: number) => {
  if (!currentAnime.value) return
  
  const animeId = currentAnime.value.subject.id
  const eps = currentAnime.value.progress.watchedEps
  const wasWatched = eps.includes(index)
  
  // 立即更新 UI（手动触发响应式）
  if (wasWatched) {
    const i = eps.indexOf(index)
    eps.splice(i, 1)
  } else {
    eps.push(index)
  }
  
  // 不等待 API 响应
  animeApi.toggle(animeId, index).catch(() => {
    // 失败回滚
    if (wasWatched) {
      eps.push(index)
    } else {
      const i = eps.indexOf(index)
      if (i > -1) eps.splice(i, 1)
    }
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

const importAnime = async (row: any) => {
  try {
    await animeApi.import({
      bgmId: row.id,
      airYear: Number(selectedYear.value),
      airSeason: selectedSeason.value
    })
    showSearch.value = false
    fetchList()
  } catch (e) {
    console.error('导入失败', e)
  }
}

const getStatusText = (status: number) => {
  const texts = ['想看', '在看', '已完结']
  return texts[status] || '未知'
}

const getStatusBg = (status: number) => {
  const bgs = ['bg-gray-500', 'bg-blue-500', 'bg-emerald-500']
  return bgs[status] || 'bg-gray-400'
}

const getSeasonLabel = (s: number) => {
  return ['1月 冬', '4月 春', '7月 夏', '10月 秋'][s - 1]
}

const getSeasonName = (s: number) => {
  return ['冬', '春', '夏', '秋'][s - 1] || ''
}

onMounted(fetchList)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
