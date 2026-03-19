<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { noteApi, type NoteDetail } from '@/api/note'
import { ArrowLeft, Clock, Eye, Tags } from 'lucide-vue-next'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

const note = ref<NoteDetail | null>(null)
const loading = ref(true)

const fetchDetail = async () => {
  try {
    note.value = await noteApi.getDetail(id)
  } catch (error) {
    console.error('Failed to load note detail', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<template>
  <div class="detail-wrapper">
    <div class="bg-gradient"></div>
    <div class="detail-container">
      <div class="top-bar">
        <button @click="router.back()" class="back-btn">
          <ArrowLeft :size="18" /> 返回
        </button>
      </div>
      
      <div class="content-card card" v-if="loading">
        <div class="loading">正在加载...</div>
      </div>
      <div class="content-card card" v-else-if="note">
        <h1 class="note-title">{{ note.title }}</h1>
        <div class="note-meta">
          <span class="meta-item"><Clock :size="14" /> {{ note.createTime?.replace('T', ' ') }}</span>
          <span class="meta-item"><Eye :size="14" /> {{ note.views }} 阅读</span>
          <span class="meta-item" v-if="note.tags?.length">
            <Tags :size="14" />
            <span v-for="tag in note.tags" :key="tag" class="tag-chip">{{ tag }}</span>
          </span>
        </div>
        
        <div v-if="note.coverUrl" class="cover-wrapper">
          <img :src="note.coverUrl" alt="cover" class="note-cover" />
        </div>
        
        <div class="editor-content">
          <MdPreview :modelValue="note.content" />
        </div>
      </div>
      <div class="content-card card" v-else>
        <div class="loading">文章不存在或已删除</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');

.detail-wrapper {
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

.detail-container {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
}

.top-bar {
  display: flex;
  align-items: center;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(53, 191, 171, 0.2);
  color: #5a8c8f;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  color: #35bfab;
}

.content-card {
  padding: 40px;
}

.note-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e3a3c;
  margin: 0 0 16px;
  line-height: 1.4;
}

.note-meta {
  display: flex;
  gap: 20px;
  color: #7aabb0;
  font-size: 13px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-chip {
  background: rgba(53, 191, 171, 0.15);
  color: #35bfab;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 12px;
  margin-right: 6px;
}

.cover-wrapper {
  margin-bottom: 30px;
  border-radius: 12px;
  overflow: hidden;
}

.note-cover {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  display: block;
}

.editor-content {
  color: #2e4a4e;
  line-height: 1.8;
  padding: 10px 20px;
}

/* 强制覆盖 md-editor-v3 的内置样式，使其完美融入玻璃拟态卡片 */
.editor-content :deep(.md-editor) {
  --md-bk-color: transparent !important;
  background-color: transparent !important;
  border: none !important;
}

.editor-content :deep(.md-editor-preview-wrapper) {
  padding: 0 !important;
}

.editor-content :deep(.md-editor-preview) {
  color: #2e4a4e !important;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #5a8c8f;
  font-size: 16px;
}

@media (max-width: 768px) {
  .content-card {
    padding: 24px;
  }
  .note-title {
    font-size: 24px;
  }
}
</style>
