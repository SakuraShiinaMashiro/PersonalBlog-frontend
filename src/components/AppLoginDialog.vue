<template>
  <Transition name="fade">
    <div v-if="show" class="login-overlay" @click.self="close">
      <div class="login-card-wrapper">
        <!-- Avatar Floating -->
        <div class="avatar-box">
          <img :src="ownerProfile?.avatarUrl || '/default-avatar.png'" alt="Avatar" class="avatar-img" />
        </div>

        <div class="login-card glass-card">
          <h2 class="login-title">登录到 {{ ownerProfile?.username || 'Personal Blog' }}</h2>

          <!-- Step 1: Initial Entry -->
          <div v-if="step === 1" class="step-content">
            <div class="oauth-group">
              <button @click="handleOAuth('github')" class="oauth-btn" title="GitHub">
                <img src="@/assets/icons/oauth/github.ico" alt="GitHub" />
              </button>
              <button @click="handleOAuth('google')" class="oauth-btn" title="Google">
                <img src="@/assets/icons/oauth/google.ico" alt="Google" />
              </button>
              <button @click="handleOAuth('sina')" class="oauth-btn" title="Sina">
                <img src="@/assets/icons/oauth/weibo.ico" alt="Sina" />
              </button>
            </div>
            
            <div class="divider"><span>或者</span></div>

            <label class="key-import-btn">
              <Key :size="18" />
              <span>导入密钥解锁博主登录</span>
              <input type="file" class="hidden" @change="onKeyFileChange" accept=".key,.txt" />
            </label>
          </div>

          <!-- Step 2: Owner Credentials -->
          <div v-else-if="step === 2" class="step-content">
            <div class="form-group">
              <div class="input-wrap">
                <User :size="16" class="input-icon" />
                <input v-model="loginForm.username" type="text" placeholder="博主账号" class="login-input" />
              </div>
              <div class="input-wrap">
                <Lock :size="16" class="input-icon" />
                <input v-model="loginForm.password" type="password" placeholder="密码" class="login-input" @keyup.enter="handleOwnerLogin" />
              </div>
              <button :disabled="loading" @click="handleOwnerLogin" class="submit-btn">
                {{ loading ? '验证中...' : '继续' }}
              </button>
              <button @click="step = 1" class="back-link">返回上一步</button>
            </div>
          </div>

          <!-- Step 3: Email Verification -->
          <div v-else-if="step === 3" class="step-content">
            <p class="email-hint">
              {{ sendingCode ? '验证码发送中，请稍候...' : (codeSent ? '验证码已发送，若未收到可稍后重试' : '请发送验证码至博主邮箱') }}
            </p>
            <div class="form-group">
              <div class="input-wrap">
                <Mail :size="16" class="input-icon" />
                <input v-model="ownerEmail" type="text" class="login-input" disabled />
              </div>
              <div class="input-wrap">
                <Lock :size="16" class="input-icon" />
                <input v-model="verifyForm.code" type="text" placeholder="6位验证码" class="login-input code-input" maxlength="6" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code" @input="handleCodeInput" />
                <button :disabled="countdown > 0 || sendingCode" @click="sendEmailCode" class="resend-btn">
                  {{ countdown > 0 ? `${countdown}s` : (codeSent ? '重新获取' : '发送验证码') }}
                </button>
              </div>
              <button :disabled="loading" @click="handleVerifyCode" class="submit-btn">
                {{ loading ? '登录中...' : '确认登录' }}
              </button>
              <button @click="step = 2" class="back-link">修改账号信息</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
  <AppNoticeDialog v-model="noticeVisible" :message="noticeMessage" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Key, User, Lock, Mail } from 'lucide-vue-next'
import { authApi } from '@/api/auth'
import { siteApi, type OwnerProfile } from '@/api/site'
import { useAuthStore } from '@/stores/auth'
import { useNotice } from '@/composables/useNotice'
import AppNoticeDialog from './AppNoticeDialog.vue'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const authStore = useAuthStore()
const { noticeVisible, noticeMessage, openNotice } = useNotice()

const step = ref(1)
const loading = ref(false)
const countdown = ref(0)
const ownerProfile = ref<OwnerProfile | null>(null)
const ownerEmail = ref('')
const codeSent = ref(false)
const sendingCode = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const verifyForm = reactive({
  code: ''
})

onMounted(async () => {
  try {
    ownerProfile.value = await siteApi.getOwnerProfile() as any
  } catch (e) {
    console.error('Failed to load owner profile', e)
  }
})

const close = () => {
  if (loading.value) return
  emit('close')
  // Reset after transition
  setTimeout(() => {
    step.value = 1
    loginForm.username = ''
    loginForm.password = ''
    verifyForm.code = ''
    ownerEmail.value = ''
    codeSent.value = false
  }, 300)
}

const handleOAuth = (provider: string) => {
  // 保存当前路径以便回调后跳转回去
  const redirectPath = window.location.pathname + window.location.search
  localStorage.setItem('oauth_redirect_path', redirectPath)
  window.location.href = authApi.getOAuthUrl(provider)
}

const onKeyFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    try {
      loading.value = true
      const res = await authApi.verifyOwnerKey(target.files[0]) as any
      if (res.unlock) {
        step.value = 2
      }
    } catch (err: any) {
      openNotice(err.message || '密钥验证失败')
    } finally {
      loading.value = false
    }
  }
}

const handleOwnerLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    openNotice('请填写完整信息')
    return
  }
  loading.value = true
  try {
    const res = await authApi.ownerLogin(loginForm) as any
    if (res.needEmailVerify) {
      step.value = 3
      ownerEmail.value = res.email || ''
      verifyForm.code = ''
      codeSent.value = false
      countdown.value = 0
    }
  } catch (err: any) {
    openNotice(err.message || '登录验证失败')
  } finally {
    loading.value = false
  }
}

const handleVerifyCode = async () => {
  const normalizedCode = verifyForm.code.trim()
  if (!normalizedCode) {
    openNotice('请输入验证码')
    return
  }
  if (!ownerEmail.value) {
    openNotice('博主邮箱缺失，请重新登录')
    return
  }
  loading.value = true
  try {
    const res = await authApi.verifyEmailCode({ email: ownerEmail.value, code: normalizedCode }) as any
    authStore.setTokens(res.token, res.refreshToken)
    await authStore.fetchUser()
    openNotice('登录成功')
    loading.value = false
    close()
  } catch (err: any) {
    openNotice(err.message || '验证码错误')
  } finally {
    loading.value = false
  }
}

const sendEmailCode = async () => {
  try {
    if (!ownerEmail.value) {
      openNotice('博主邮箱缺失，请重新登录')
      return
    }
    sendingCode.value = true
    await authApi.sendEmailCode(ownerEmail.value)
    openNotice(codeSent.value ? '验证码已重发' : '验证码已发送')
    codeSent.value = true
    startCountdown()
  } catch (err: any) {
    openNotice(err.message || '发送失败')
  } finally {
    sendingCode.value = false
  }
}

const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
}

const handleCodeInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  verifyForm.code = target.value.replace(/\D/g, '')
}
</script>

<style scoped>
.login-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(6px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card-wrapper {
  position: relative;
  width: 100%;
  max-width: 440px;
  padding-top: 45px;
}

.avatar-box {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 90px;
  height: 90px;
  background: white;
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 10;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 28px;
  padding: 60px 32px 32px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.login-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e3a3c;
  margin-bottom: 28px;
}

.step-content {
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.oauth-group {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.oauth-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  border: 1px solid rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.oauth-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.oauth-btn img { width: 22px; height: 22px; }

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
  color: #94a3b8;
  font-size: 13px;
}
.divider::before, .divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(0,0,0,0.06);
}

.key-import-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(53, 191, 171, 0.1);
  color: #35bfab;
  padding: 12px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.key-import-btn:hover { background: rgba(53, 191, 171, 0.15); }

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
}

.login-input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.login-input:focus { border-color: #35bfab; }

.code-input {
  padding-right: 70px;
}

.submit-btn {
  background: #35bfab;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.back-link {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 8px;
}

.email-hint {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 16px;
}


.resend-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #94a3b8;
  font-weight: 700;
  font-size: 12px;
  padding: 0;
  cursor: pointer;
  transition: opacity 0.2s;
}
.resend-btn:hover {
  color: #35bfab;
}
.resend-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hidden { display: none; }

/* Transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
