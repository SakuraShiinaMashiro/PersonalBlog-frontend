<template>
  <Transition name="confirm-fade">
    <div v-if="modelValue" class="confirm-mask" @click="handleCancel">
      <div class="confirm-card" @click.stop>
        <h3 class="confirm-title">{{ title }}</h3>
        <p class="confirm-message">{{ message }}</p>
        <div class="confirm-actions">
          <button
            :class="['confirm-btn', danger ? 'danger-btn' : 'normal-btn']"
            :disabled="loading"
            @click="handleConfirm"
          >
            {{ loading ? '处理中...' : confirmText }}
          </button>
          <button class="confirm-btn cancel-btn" :disabled="loading" @click="handleCancel">
            {{ cancelText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '确认',
  cancelText: '取消',
  danger: false,
  loading: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const handleConfirm = () => {
  if (props.loading) return
  emit('confirm')
}

const handleCancel = () => {
  if (props.loading) return
  emit('update:modelValue', false)
  emit('cancel')
}
</script>

<style scoped>
.confirm-mask {
  position: fixed;
  inset: 0;
  z-index: 130;
  background: rgba(30, 50, 52, 0.42);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.confirm-card {
  width: 100%;
  max-width: 380px;
  background: rgba(255, 255, 255, 0.74);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(22, 45, 47, 0.2);
  padding: 24px 20px 18px;
  text-align: center;
}

.confirm-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #2e4a4e;
}

.confirm-message {
  margin: 12px 0 18px;
  font-size: 14px;
  line-height: 1.55;
  color: #486d72;
  white-space: pre-wrap;
}

.confirm-actions {
  display: flex;
  gap: 10px;
}

.confirm-btn {
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.confirm-btn:hover {
  opacity: 0.92;
}

.confirm-btn:active {
  transform: scale(0.98);
}

.confirm-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.cancel-btn {
  background: linear-gradient(135deg, #90a4ae, #78909c);
}

.normal-btn {
  background: linear-gradient(135deg, #35bfab, #26a69a);
}

.danger-btn {
  background: linear-gradient(135deg, #ef5350, #e53935);
  box-shadow: 0 4px 14px rgba(229, 57, 53, 0.28);
}

.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-fade-enter-active .confirm-card,
.confirm-fade-leave-active .confirm-card {
  transition: transform 0.2s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}

.confirm-fade-enter-from .confirm-card,
.confirm-fade-leave-to .confirm-card {
  transform: translateY(8px) scale(0.98);
}
</style>
