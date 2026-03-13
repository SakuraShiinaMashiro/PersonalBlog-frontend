<template>
  <div class="anime-container">
    <div class="filter-bar">
      <el-date-picker
        v-model="selectedYear"
        type="year"
        placeholder="选择年份"
        format="YYYY"
        value-format="YYYY"
        @change="fetchList"
      />
      <el-radio-group v-model="selectedSeason" @change="fetchList">
        <el-radio-button :label="1">春</el-radio-button>
        <el-radio-button :label="2">夏</el-radio-button>
        <el-radio-button :label="3">秋</el-radio-button>
        <el-radio-button :label="4">冬</el-radio-button>
      </el-radio-group>
      <el-button type="primary" @click="showSearch = true">添加追番</el-button>
    </div>

    <el-row :gutter="20">
      <el-col
        v-for="item in animeList"
        :key="item.subject.id"
        :xs="24" :sm="12" :md="8" :lg="6"
      >
        <el-card :body-style="{ padding: '0px' }" class="anime-card">
          <img
            :src="item.subject.imageUrl"
            class="image"
            referrerpolicy="no-referrer"
          />
          <div style="padding: 14px">
            <span class="title">{{ item.subject.title }}</span>
            <div class="bottom">
              <el-progress 
                :percentage="calculateProgress(item)" 
                :format="() => `${item.progress.watchedEps.length}/${item.subject.eps}`"
              />
              <el-button link type="primary" @click="openProgress(item)">进度管理</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 进度管理对话框 -->
    <el-dialog v-model="showProgress" :title="currentAnime?.subject.title" width="500px">
      <div class="episode-grid">
        <el-button
          v-for="i in currentAnime?.subject.eps"
          :key="i"
          :type="isWatched(i) ? 'success' : ''"
          @click="toggleEp(i)"
        >
          {{ i }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 搜索导入对话框 -->
    <el-dialog v-model="showSearch" title="搜索番剧" width="600px">
      <el-input v-model="keyword" placeholder="输入关键词" @keyup.enter="onSearch">
        <template #append>
          <el-button @click="onSearch">搜索</el-button>
        </template>
      </el-input>
      <el-table :data="searchResults" style="width: 100%; margin-top: 20px">
        <el-table-column label="封面" width="100">
          <template #default="scope">
            <img :src="scope.row.images?.grid" style="width: 60px" referrerpolicy="no-referrer" />
          </template>
        </el-table-column>
        <el-table-column prop="name_cn" label="名称" />
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="primary" size="small" @click="importAnime(scope.row)">导入</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { animeApi, AnimeListItem } from '@/api/anime'
import { ElMessage } from 'element-plus'

const selectedYear = ref(new Date().getFullYear().toString())
const selectedSeason = ref(Math.floor(new Date().getMonth() / 3) + 1)
const animeList = ref<AnimeListItem[]>([])
const showProgress = ref(false)
const showSearch = ref(false)
const currentAnime = ref<AnimeListItem | null>(null)
const keyword = ref('')
const searchResults = ref<any[]>([])

const fetchList = async () => {
  animeList.value = await animeApi.getList(Number(selectedYear.value), selectedSeason.value)
}

const calculateProgress = (item: AnimeListItem) => {
  if (item.subject.eps === 0) return 0
  return Math.round((item.progress.watchedEps.length / item.subject.eps) * 100)
}

const openProgress = (item: AnimeListItem) => {
  currentAnime.value = item
  showProgress.value = true
}

const isWatched = (index: number) => {
  return currentAnime.value?.progress.watchedEps.includes(index)
}

const toggleEp = async (index: number) => {
  if (!currentAnime.value) return
  await animeApi.toggle(currentAnime.value.subject.id, index)
  // Local toggle for UX
  const eps = currentAnime.value.progress.watchedEps
  const idx = eps.indexOf(index)
  if (idx > -1) eps.splice(idx, 1)
  else eps.push(index)
}

const onSearch = async () => {
  searchResults.value = await animeApi.search(keyword.value)
}

const importAnime = async (row: any) => {
  await animeApi.import({
    bgmId: row.id,
    airYear: Number(selectedYear.value),
    airSeason: selectedSeason.value
  })
  ElMessage.success('导入成功')
  showSearch.value = false
  fetchList()
}

onMounted(fetchList)
</script>

<style scoped lang="scss">
.anime-container {
  padding: 20px;
  .filter-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 20px;
    align-items: center;
  }
  .anime-card {
    margin-bottom: 20px;
    .image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .title {
      font-weight: bold;
      display: block;
      margin-bottom: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .bottom {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  }
  .episode-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 10px;
  }
}
</style>
