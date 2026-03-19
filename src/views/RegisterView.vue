<template>
  <div class="register-page relative min-h-screen flex items-center justify-center overflow-hidden">
    <!-- 浮动几何形状背景 -->
    <ShapeBackground />

    <!-- 顶部导航按钮 -->
    <div class="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between">
      <!-- 返回按钮 -->
      <button
        @click="handleBack"
        class="flex items-center justify-center w-11 h-11 rounded-full glass-button hover:scale-105 active:scale-95 focus:outline-none"
        aria-label="返回"
      >
        <NIcon :component="ArrowBackOutline" class="text-lg text-[var(--color-primary)]" />
      </button>

      <!-- 主题切换按钮 -->
      <ThemeSwitcher />
    </div>

    <!-- 注册表单容器 -->
    <div class="register-container relative z-10 w-full max-w-md mx-4">
      <!-- 标题区域 -->
      <div class="text-center mb-8 register-header">
        <h1 class="text-3xl font-bold mb-2 register-title">
          加入朝暮
        </h1>
        <p class="register-subtitle">
          注册账号，开启专属咖啡时光
        </p>
      </div>

      <!-- 玻璃态注册卡片 -->
      <StateBlock
        :loading="loading"
        :error="error"
        loading-text="正在注册中..."
        error-text="注册遇到了一点问题"
        @retry="handleRetry"
      >
        <div class="register-card glass-form p-8">
          <n-form
            ref="formRef"
            :model="formValue"
            :rules="rules"
            size="large"
            @submit.prevent="handleRegister"
          >
            <n-form-item path="username" label="用户名">
              <n-input
                v-model:value="formValue.username"
                placeholder="请输入用户名 (4-20位字母数字下划线)"
                @keydown.enter.prevent
              />
            </n-form-item>

            <n-form-item path="password" label="密码">
              <n-input
                v-model:value="formValue.password"
                type="password"
                show-password-on="click"
                placeholder="请输入密码 (至少6位)"
                @keydown.enter.prevent
              />
            </n-form-item>

            <n-form-item path="confirmPassword" label="确认密码">
              <n-input
                v-model:value="formValue.confirmPassword"
                type="password"
                show-password-on="click"
                placeholder="请再次输入密码"
                @keydown.enter.prevent="handleRegister"
              />
            </n-form-item>

            <div class="mt-6 flex justify-center">
              <n-button
                class="register-button px-12"
                type="primary"
                attr-type="submit"
                :loading="loading"
                @click="handleRegister"
              >
                注册
              </n-button>
            </div>

            <div class="mt-6 text-center text-sm register-footer-text">
              已有账号？
              <router-link to="/login" class="register-link">
                立即登录
              </router-link>
            </div>
          </n-form>
        </div>
      </StateBlock>

      <!-- 底部装饰文字 -->
      <p class="text-center mt-6 text-sm register-brand-text">
        朝暮咖啡 · 时光与咖啡的邂逅
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
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
import StateBlock from '@/components/common/StateBlock.vue'
import ShapeBackground from '@/components/login/ShapeBackground.vue'
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue'
import { useRequestState } from '@/composables/useRequestState'
import { authApi } from '@/api/auth'
import { REGISTER_USERNAME_RULES, REGISTER_PASSWORD_RULES } from '@/types/user'

const router = useRouter()
const message = useMessage()

// 返回首页
const handleBack = () => {
  router.push('/')
}

// 表单引用
const formRef = ref<FormInst | null>(null)

// 表单数据
const formValue = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// 表单验证规则
const rules: FormRules = {
  username: REGISTER_USERNAME_RULES,
  password: REGISTER_PASSWORD_RULES,
  confirmPassword: [
    {
      required: true,
      message: '请再次输入密码',
      trigger: ['input', 'blur']
    },
    {
      validator: (_rule, value) => {
        return value === formValue.password
      },
      message: '两次输入的密码不一致',
      trigger: ['input', 'blur']
    }
  ]
}

// 使用 useRequestState 管理请求状态
const { loading, error, run, reset } = useRequestState()

const handleRegister = (e?: Event) => {
  e?.preventDefault()

  formRef.value?.validate((errors) => {
    if (!errors) {
      submitRegister()
    }
  })
}

const handleRetry = () => {
  // 失败态下表单会被卸载，先恢复到表单视图，保留用户已填写内容
  reset()
}

const submitRegister = () => {
  run(async () => {
    await authApi.register({
      username: formValue.username,
      password: formValue.password,
      confirmPassword: formValue.confirmPassword
    })

    message.success('注册成功，请登录')
    router.push('/login')
  })
}
</script>

<style scoped>
/* 注册页面容器 */
.register-page {
  background: transparent;
}

/* 注册容器入场动画 */
.register-container {
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

/* 标题样式 - 深色主题（默认） */
.register-title {
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.register-subtitle {
  color: rgba(255, 255, 255, 0.6);
}

/* 标题样式 - 浅色主题（朝暮 Dawn） */
:root[data-theme="dawn"] .register-title {
  background: linear-gradient(135deg, #5D4037 0%, #8B5A2B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

:root[data-theme="dawn"] .register-subtitle {
  color: rgba(93, 64, 55, 0.7);
}

/* 注册卡片样式增强 */
.register-card {
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

/* 毛玻璃表单样式 */
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

/* 底部文字样式 */
.register-footer-text {
  color: rgba(255, 255, 255, 0.5);
}

.register-link {
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.2s ease;
}

.register-link:hover {
  color: #fff;
  text-decoration: underline;
}

:root[data-theme="dawn"] .register-footer-text {
  color: rgba(93, 64, 55, 0.6);
}

:root[data-theme="dawn"] .register-link {
  color: var(--color-primary);
}

:root[data-theme="dawn"] .register-link:hover {
  color: var(--color-primary-hover);
}

/* 品牌文字 */
.register-brand-text {
  color: rgba(255, 255, 255, 0.3);
  animation: fade-up 0.8s ease-out 0.6s both;
}

:root[data-theme="dawn"] .register-brand-text {
  color: rgba(93, 64, 55, 0.4);
}

/* 注册按钮样式增强 - 白色毛玻璃 + 上浮阴影 */
.register-button {
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

.register-button:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.register-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* Dusk 模式按钮样式 */
:root[data-theme="dusk"] .register-button {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #ECF0F1 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

:root[data-theme="dusk"] .register-button:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

:root[data-theme="dusk"] .register-button:active {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>
