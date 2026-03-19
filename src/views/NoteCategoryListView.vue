<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, CalendarDays } from 'lucide-vue-next'
import { noteApi, type NoteListItem } from '@/api/note'

interface NoteCategoryListProps {
  moduleType?: number
  pageTitle: string
  pageSubtitle: string
  loadingText: string
  emptyText: string
  errorText: string
}

const props = defineProps<NoteCategoryListProps>()

const loading = ref(true)
const requestErrorText = ref('')
const notes = ref<NoteListItem[]>([])

const sortedNotes = computed(() => {
  return [...notes.value].sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
})

const formatDate = (dateTime: string) => dateTime.split('T')[0].replace(/-/g, '/')

const fetchNotes = async () => {
  loading.value = true
  requestErrorText.value = ''
  try {
    const params: { pageNum: number; pageSize: number; status: number; moduleType?: number } = {
      pageNum: 1,
      pageSize: 100,
      status: 1
    }
    if (props.moduleType !== undefined) {
      params.moduleType = props.moduleType
    }

    const res = await noteApi.getList(params)
    notes.value = res.list
  } catch (error) {
    console.error('获取分类笔记失败', error)
    requestErrorText.value = props.errorText
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchNotes()
})
</script>

<template>
  <div class="note-category-wrapper">
    <div class="bg-gradient"></div>

    <div class="note-category-container">
      <div class="top-bar card">
        <router-link to="/" class="back-btn">
          <ArrowLeft :size="18" /> 返回首页
        </router-link>
        <div class="title-block">
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageSubtitle }}</p>
        </div>
      </div>

      <div v-if="loading" class="card state-card">{{ loadingText }}</div>
      <div v-else-if="requestErrorText" class="card state-card">{{ requestErrorText }}</div>
      <div v-else-if="sortedNotes.length === 0" class="card state-card">{{ emptyText }}</div>

      <div v-else class="note-grid">
        <router-link
          v-for="note in sortedNotes"
          :key="note.id"
          :to="`/note/${note.id}`"
          class="note-card card"
        >
          <div class="cover-wrap">
            <img v-if="note.coverUrl" :src="note.coverUrl" alt="cover" class="note-cover" />
            <div v-else class="placeholder-cover">{{ note.title.charAt(0) }}</div>
          </div>
          <div class="note-content">
            <h3 class="note-title">{{ note.title }}</h3>
            <div class="note-date">
              <CalendarDays :size="14" />
              <span>{{ formatDate(note.createTime) }}</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');

.note-category-wrapper {
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

.note-category-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 24px 36px;
}

.card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 20px;
  margin-bottom: 18px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 12px;
  text-decoration: none;
  color: #5a8c8f;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(53, 191, 171, 0.2);
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.back-btn:hover {
  color: #2f7f79;
  background: rgba(255, 255, 255, 0.85);
}

.title-block h1 {
  margin: 0;
  font-size: 26px;
  color: #204346;
}

.title-block p {
  margin: 6px 0 0;
  font-size: 13px;
  color: #6f9ca1;
}

.state-card {
  padding: 30px;
  text-align: center;
  color: #5a8c8f;
  font-size: 15px;
}

.note-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.note-card {
  overflow: hidden;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.note-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.12);
}

.cover-wrap {
  height: 168px;
}

.note-cover,
.placeholder-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #68c6b6, #2fae9c);
}

.note-content {
  padding: 14px 14px 16px;
}

.note-title {
  margin: 0;
  color: #27474a;
  font-size: 16px;
  line-height: 1.4;
  min-height: 44px;
}

.note-date {
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #6d9aa0;
  font-size: 12px;
}

@media (max-width: 1024px) {
  .note-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .note-category-container {
    padding: 18px 14px 24px;
  }

  .top-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .note-grid {
    grid-template-columns: 1fr;
  }
}
</style>
