<template>
  <div class="forgot-password-page relative min-h-screen flex items-center justify-center overflow-hidden">
    <ShapeBackground />

    <div class="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between">
      <button
        @click="handleBack"
        class="flex items-center justify-center w-11 h-11 rounded-full glass-button hover:scale-105 active:scale-95 focus:outline-none"
        aria-label="返回登录"
      >
        <NIcon :component="ArrowBackOutline" class="text-lg text-[var(--color-primary)]" />
      </button>

      <ThemeSwitcher />
    </div>

    <div class="forgot-password-container relative z-10 w-full max-w-md mx-4">
      <div class="text-center mb-8 forgot-password-header">
        <h1 class="text-3xl font-bold mb-2 forgot-password-title">
          找回密码
        </h1>
        <p class="forgot-password-subtitle">
          输入用户名与验证码，重新设置新的登录密码
        </p>
      </div>

      <div class="forgot-password-card glass-form p-8">
        <n-form
          ref="formRef"
          :model="formValue"
          :rules="rules"
          size="large"
          @submit.prevent="handleResetPassword"
        >
          <n-form-item path="username" label="用户名">
            <n-input
              v-model:value="formValue.username"
              placeholder="请输入用户名"
              @keydown.enter.prevent
            />
          </n-form-item>

          <n-form-item path="verifyCode" label="验证码">
            <div class="w-full">
              <div class="flex gap-3">
                <n-input
                  v-model:value="formValue.verifyCode"
                  class="flex-1"
                  placeholder="请输入验证码"
                  @keydown.enter.prevent
                />
                <n-button
                  class="code-button"
                  attr-type="button"
                  secondary
                  :disabled="codeButtonDisabled"
                  :loading="sendingCode"
                  @click="handleSendCode"
                >
                  {{ codeButtonText }}
                </n-button>
              </div>
              <p v-if="visibleDemoCode" class="mt-2 code-tip">
                演示环境验证码：<span class="code-value">{{ demoCode }}</span>
                <span class="code-meta">（{{ countdown }} 秒内有效）</span>
              </p>
              <p v-else class="mt-2 code-help">
                点击“获取验证码”后，演示环境会直接展示验证码，后续可替换为短信或邮箱发送。
              </p>
            </div>
          </n-form-item>

          <n-form-item path="newPassword" label="新密码">
            <n-input
              v-model:value="formValue.newPassword"
              type="password"
              show-password-on="click"
              placeholder="请输入新密码（6-32位）"
              @keydown.enter.prevent
            />
          </n-form-item>

          <n-form-item path="confirmPassword" label="确认新密码">
            <n-input
              v-model:value="formValue.confirmPassword"
              type="password"
              show-password-on="click"
              placeholder="请再次输入新密码"
              @keydown.enter.prevent="handleResetPassword"
            />
          </n-form-item>

          <div class="mt-6 flex justify-center">
            <n-button
              class="forgot-password-button px-12"
              type="primary"
              attr-type="submit"
              :loading="resettingPassword"
              @click="handleResetPassword"
            >
              重置密码
            </n-button>
          </div>

          <div class="mt-6 text-center text-sm forgot-password-footer-text">
            想起密码了？
            <router-link to="/login" class="forgot-password-link">
              返回登录
            </router-link>
          </div>
        </n-form>
      </div>

      <p class="text-center mt-6 text-sm forgot-password-brand-text">
        朝暮咖啡 · 时光与咖啡的邂逅
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  NIcon,
  useMessage,
  type FormInst,
  type FormRules
} from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { useRouter } from 'vue-router'
import ShapeBackground from '@/components/login/ShapeBackground.vue'
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue'
import { authApi } from '@/api/auth'
import { LOGIN_USERNAME_RULES, REGISTER_PASSWORD_RULES } from '@/types/user'

const router = useRouter()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const sendingCode = ref(false)
const resettingPassword = ref(false)
const demoCode = ref('')
const countdown = ref(0)
const issuedUsername = ref('')

let countdownTimer: ReturnType<typeof window.setInterval> | null = null

const formValue = reactive({
  username: '',
  verifyCode: '',
  newPassword: '',
  confirmPassword: ''
})

const rules: FormRules = {
  username: LOGIN_USERNAME_RULES,
  verifyCode: [
    {
      required: true,
      message: '请输入验证码',
      trigger: ['input', 'blur']
    }
  ],
  newPassword: REGISTER_PASSWORD_RULES,
  confirmPassword: [
    {
      required: true,
      message: '请再次输入新密码',
      trigger: ['input', 'blur']
    },
    {
      validator: (_rule, value) => value === formValue.newPassword,
      message: '两次输入的密码不一致',
      trigger: ['input', 'blur']
    }
  ]
}

const visibleDemoCode = computed(() => {
  return Boolean(demoCode.value) && countdown.value > 0 && issuedUsername.value === formValue.username
})

const codeButtonDisabled = computed(() => {
  return sendingCode.value || !formValue.username.trim() || (
    countdown.value > 0 && issuedUsername.value === formValue.username
  )
})

const codeButtonText = computed(() => {
  if (sendingCode.value) {
    return '发送中...'
  }
  if (countdown.value > 0 && issuedUsername.value === formValue.username) {
    return `${countdown.value}s 后重发`
  }
  return '获取验证码'
})

const handleBack = () => {
  router.push('/login')
}

const clearCountdown = () => {
  if (countdownTimer !== null) {
    window.clearInterval(countdownTimer)
    countdownTimer = null
  }
}

const startCountdown = (seconds: number) => {
  clearCountdown()
  countdown.value = seconds
  countdownTimer = window.setInterval(() => {
    if (countdown.value <= 1) {
      countdown.value = 0
      clearCountdown()
      return
    }
    countdown.value -= 1
  }, 1000)
}

const handleSendCode = async () => {
  if (!formValue.username.trim()) {
    message.warning('请先输入用户名')
    return
  }

  sendingCode.value = true
  try {
    const result = await authApi.requestPasswordResetCode({
      username: formValue.username.trim()
    })

    demoCode.value = result.verifyCode
    issuedUsername.value = formValue.username.trim()
    formValue.verifyCode = ''
    startCountdown(result.expireSeconds || 300)
    message.success(`演示验证码：${result.verifyCode}`)
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || '验证码获取失败，请稍后重试'
    message.error(msg)
  } finally {
    sendingCode.value = false
  }
}

const handleResetPassword = async (e?: Event) => {
  e?.preventDefault()

  formRef.value?.validate(async (errors) => {
    if (errors) {
      return
    }

    resettingPassword.value = true
    try {
      await authApi.resetPassword({
        username: formValue.username.trim(),
        verifyCode: formValue.verifyCode.trim(),
        newPassword: formValue.newPassword
      })

      message.success('密码已重置，请使用新密码登录')
      router.push({
        path: '/login',
        query: { username: formValue.username.trim() }
      })
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || '密码重置失败，请检查验证码后重试'
      message.error(msg)
    } finally {
      resettingPassword.value = false
    }
  })
}

onBeforeUnmount(() => {
  clearCountdown()
})
</script>

<style scoped>
.forgot-password-page {
  background: transparent;
}

.forgot-password-container {
  animation: fade-up 0.8s ease-out 0.2s both;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.forgot-password-title {
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.forgot-password-subtitle {
  color: rgba(255, 255, 255, 0.6);
}

:root[data-theme="dawn"] .forgot-password-title {
  background: linear-gradient(135deg, #5D4037 0%, #8B5A2B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

:root[data-theme="dawn"] .forgot-password-subtitle {
  color: rgba(93, 64, 55, 0.7);
}

.forgot-password-card {
  animation: card-entrance 0.6s ease-out 0.4s both;
}

@keyframes card-entrance {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.glass-form {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

:root[data-theme="dawn"] .glass-form {
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    0 8px 32px rgba(93, 64, 55, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.code-button {
  min-width: 112px;
}

.code-tip,
.code-help {
  font-size: 12px;
  line-height: 1.6;
}

.code-tip {
  color: var(--color-primary);
}

.code-value {
  display: inline-block;
  margin: 0 4px;
  font-weight: 700;
  letter-spacing: 1px;
}

.code-meta,
.code-help {
  color: var(--color-text-secondary);
}

.forgot-password-footer-text {
  color: rgba(255, 255, 255, 0.5);
}

.forgot-password-link {
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.2s ease;
}

.forgot-password-link:hover {
  color: #fff;
  text-decoration: underline;
}

:root[data-theme="dawn"] .forgot-password-footer-text {
  color: rgba(93, 64, 55, 0.6);
}

:root[data-theme="dawn"] .forgot-password-link {
  color: var(--color-primary);
}

:root[data-theme="dawn"] .forgot-password-link:hover {
  color: var(--color-primary-hover);
}

.forgot-password-brand-text {
  color: rgba(255, 255, 255, 0.3);
  animation: fade-up 0.8s ease-out 0.6s both;
}

:root[data-theme="dawn"] .forgot-password-brand-text {
  color: rgba(93, 64, 55, 0.4);
}

.forgot-password-button {
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: #5D4037 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.forgot-password-button:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.forgot-password-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

:root[data-theme="dusk"] .forgot-password-button {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #ECF0F1 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

:root[data-theme="dusk"] .forgot-password-button:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

:root[data-theme="dusk"] .forgot-password-button:active {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>
