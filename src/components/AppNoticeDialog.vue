<template>
  <Transition name="notice-fade">
    <div v-if="modelValue" class="notice-mask">
      <div class="notice-card">
        <h3 class="notice-title">{{ title }}</h3>
        <p class="notice-message">{{ message }}</p>
        <button class="notice-confirm" @click="handleConfirm">{{ confirmText }}</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  message: string
  title?: string
  confirmText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '提示',
  confirmText: '确认'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const handleConfirm = () => {
  emit('update:modelValue', false)
  emit('confirm')
}
</script>

<style scoped>
.notice-mask {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(30, 50, 52, 0.42);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.notice-card {
  width: 100%;
  max-width: 360px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(22, 45, 47, 0.2);
  padding: 24px 20px 18px;
  text-align: center;
}

.notice-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #2e4a4e;
}

.notice-message {
  margin: 12px 0 18px;
  font-size: 14px;
  line-height: 1.55;
  color: #486d72;
  white-space: pre-wrap;
}

.notice-confirm {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #35bfab, #26a69a);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.notice-confirm:hover {
  opacity: 0.92;
}

.notice-confirm:active {
  transform: scale(0.98);
}

.notice-fade-enter-active,
.notice-fade-leave-active {
  transition: opacity 0.2s ease;
}

.notice-fade-enter-active .notice-card,
.notice-fade-leave-active .notice-card {
  transition: transform 0.2s ease;
}

.notice-fade-enter-from,
.notice-fade-leave-to {
  opacity: 0;
}

.notice-fade-enter-from .notice-card,
.notice-fade-leave-to .notice-card {
  transform: translateY(8px) scale(0.98);
}
</style>
