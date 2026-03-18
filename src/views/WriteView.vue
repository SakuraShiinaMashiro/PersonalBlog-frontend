<template>
  <div class="write-wrapper">
    <!-- 背景渐变（与首页一致） -->
    <div class="bg-gradient"></div>

    <div class="write-container">

      <!-- ========== 顶部栏 ========== -->
      <div class="top-bar card">
        <div class="top-left">
          <button @click="$router.push('/')" class="back-btn">
            <ArrowLeft :size="18" /> 返回
          </button>
          <input
            v-model="articleForm.title"
            type="text"
            class="title-input"
            placeholder="输入文章标题..."
          />
        </div>

        <div class="top-right">
          <button @click="handlePublish(0)" class="draft-btn">保存草稿</button>
          <button @click="handlePublish(1)" class="publish-btn">
            <Send :size="16" /> 发布
          </button>
        </div>
      </div>

      <div class="editor-layout">
        <!-- ========== 左侧或上方：元数据配置 ========== -->
        <div class="meta-card card">
          <div class="meta-section">
            <h3 class="meta-title">分类</h3>
            <div class="type-radios">
              <label class="radio-label">
                <input type="radio" v-model="articleForm.moduleType" :value="0" />
                <span>学习记录</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="articleForm.moduleType" :value="1" />
                <span>生活随笔</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="articleForm.moduleType" :value="2" />
                <span>兴趣使然</span>
              </label>
            </div>
          </div>

          <div class="meta-section">
            <h3 class="meta-title">标签</h3>
            <div class="tags-container">
              <div v-for="(tag, index) in articleForm.tags" :key="index" class="tag-chip">
                {{ tag }}
                <X :size="12" class="tag-close" @click="removeTag(index)" />
              </div>
              <input
                v-model="newTag"
                type="text"
                class="tag-input"
                placeholder="输入标签后回车"
                @keyup.enter="addTag"
              />
            </div>
          </div>
          
          <div class="meta-section">
            <h3 class="meta-title">封面图片</h3>
            <input
              v-model="articleForm.coverUrl"
              type="text"
              class="cover-input"
              placeholder="输入图片URL (可选)"
            />
            <div v-if="articleForm.coverUrl" class="cover-preview">
              <img :src="articleForm.coverUrl" alt="Cover" />
            </div>
          </div>
        </div>

        <!-- ========== 主体：Markdown 编辑器 ========== -->
        <div class="editor-card card">
          <MdEditor
            v-model="articleForm.content"
            class="md-editor"
            :toolbars="toolbars"
            @onSave="handlePublish(0)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { MdEditor, type ToolbarNames } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { ArrowLeft, Send, X } from 'lucide-vue-next'
import { contentApi, ContentSaveParams } from '@/api/content'

const router = useRouter()

const articleForm = reactive<ContentSaveParams>({
  title: '',
  content: '',
  moduleType: 0,
  status: 1,
  coverUrl: '',
  tags: []
})

const newTag = ref('')

const toolbars: ToolbarNames[] = [
  'bold', 'underline', 'italic', '-', 'strikeThrough', 'title', 'sub', 'sup', 'quote', 'unorderedList', 'orderedList', 'task', '-', 'codeRow', 'code', 'link', 'image', 'table', 'mermaid', 'katex', '-', 'revoke', 'next', 'save', '=', 'pageFullscreen', 'fullscreen', 'preview', 'htmlPreview', 'catalog'
]

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !articleForm.tags!.includes(tag)) {
    articleForm.tags!.push(tag)
  }
  newTag.value = ''
}

const removeTag = (index: number) => {
  articleForm.tags!.splice(index, 1)
}

const handlePublish = async (status: number) => {
  if (!articleForm.title.trim()) {
    alert('请输入标题')
    return
  }
  if (!articleForm.content.trim()) {
    alert('请输入正文')
    return
  }
  articleForm.status = status
  try {
    await contentApi.save(articleForm)
    alert(status === 1 ? '发布成功' : '草稿保存成功')
    router.push('/') // MVP版先跳回首页
  } catch (e) {
    console.error('发布失败', e)
    alert('操作失败，请重试')
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');

.write-wrapper {
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

.write-container {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100vh;
}

/* 卡片基础样式 */
.card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
}

/* 顶部栏 */
.top-bar {
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
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

.title-input {
  flex: 1;
  max-width: 600px;
  background: transparent;
  border: none;
  font-size: 24px;
  font-weight: 700;
  color: #1e3a3c;
  outline: none;
}
.title-input::placeholder {
  color: #a4c2c4;
}

.top-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.draft-btn {
  background: rgba(53, 191, 171, 0.1);
  color: #35bfab;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.draft-btn:hover { background: rgba(53, 191, 171, 0.2); }

.publish-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #35bfab, #26a69a);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(53, 191, 171, 0.35);
  transition: all 0.2s;
}
.publish-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(53, 191, 171, 0.45);
}

/* 布局区 */
.editor-layout {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

/* ==== 右/左侧元数据区 ==== */
.meta-card {
  width: 280px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  flex-shrink: 0;
}

.meta-title {
  font-size: 14px;
  font-weight: 700;
  color: #2e4a4e;
  margin: 0 0 12px;
}

/* Radio Group */
.type-radios {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #5a8c8f;
  cursor: pointer;
}
.radio-label input[type="radio"] {
  accent-color: #35bfab;
  width: 16px;
  height: 16px;
}

/* 标签容器 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background: rgba(255, 255, 255, 0.4);
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(53, 191, 171, 0.15);
}

.tag-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(53, 191, 171, 0.15);
  color: #35bfab;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}
.tag-close {
  cursor: pointer;
  opacity: 0.6;
}
.tag-close:hover { opacity: 1; }

.tag-input {
  flex: 1;
  min-width: 80px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 13px;
  color: #2e4a4e;
  padding: 4px 2px;
}
.tag-input::placeholder { color: #a4c2c4; }

/* 封面图片 */
.cover-input {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(53, 191, 171, 0.2);
  background: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  color: #2e4a4e;
  outline: none;
}
.cover-preview {
  margin-top: 10px;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(53, 191, 171, 0.2);
}
.cover-preview img {
  width: 100%;
  height: auto;
  display: block;
}

/* ==== 编辑器主体 ==== */
.editor-card {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.md-editor {
  flex: 1;
  height: 100% !important;
  background: transparent;
  --md-bk-color: transparent;
  --md-color: #2e4a4e;
  --md-border-color: rgba(53, 191, 171, 0.15);
}

/* 响应式调整 */
@media (max-width: 900px) {
  .editor-layout {
    flex-direction: column;
  }
  .meta-card {
    width: 100%;
  }
}
</style>
