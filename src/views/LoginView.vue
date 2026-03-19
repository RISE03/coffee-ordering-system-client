<template>
  <div class="login-page relative min-h-screen flex items-center justify-center overflow-hidden">
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

    <!-- 登录表单容器 -->
    <div class="login-container relative z-10 w-full max-w-md mx-4">
      <!-- 标题区域 -->
      <div class="text-center mb-8 login-header">
        <h1 class="text-3xl font-bold mb-2 login-title">
          欢迎回来
        </h1>
        <p class="login-subtitle">
          登录朝暮咖啡，开启美好时光
        </p>
      </div>

      <!-- 玻璃态登录卡片 -->
      <StateBlock
        :loading="loading"
        :error="error"
        loading-text="正在登录中..."
        error-text="登录遇到了一点问题"
        @retry="handleRetry"
      >
        <div class="login-card glass-form p-8">
          <n-form
            ref="formRef"
            :model="formValue"
            :rules="rules"
            size="large"
            @submit.prevent="handleLogin"
          >
            <n-form-item path="username" label="用户名">
              <n-input
                v-model:value="formValue.username"
                placeholder="请输入用户名"
                @keydown.enter.prevent
              />
            </n-form-item>

            <n-form-item path="password" label="密码">
              <n-input
                v-model:value="formValue.password"
                type="password"
                show-password-on="click"
                placeholder="请输入密码"
                @keydown.enter.prevent="handleLogin"
              />
            </n-form-item>

            <div class="mt-6 flex justify-center">
              <n-button
                class="login-button px-12"
                type="primary"
                attr-type="submit"
                :loading="loading"
                @click="handleLogin"
              >
                登录
              </n-button>
            </div>

            <div class="mt-6 text-center text-sm login-footer-text">
              还没有账号？
              <router-link to="/register" class="login-link">
                立即注册
              </router-link>
            </div>
          </n-form>
        </div>
      </StateBlock>

      <!-- 底部装饰文字 -->
      <p class="text-center mt-6 text-sm login-brand-text">
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
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import StateBlock from '@/components/common/StateBlock.vue'
import ShapeBackground from '@/components/login/ShapeBackground.vue'
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue'
import { useRequestState } from '@/composables/useRequestState'
import { authApi } from '@/api/auth'
import { LOGIN_USERNAME_RULES, LOGIN_PASSWORD_RULES } from '@/types/user'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
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
  password: ''
})

// 表单验证规则
const rules: FormRules = {
  username: LOGIN_USERNAME_RULES,
  password: LOGIN_PASSWORD_RULES
}

// 使用 useRequestState 管理请求状态
const { loading, error, run, reset } = useRequestState()

const handleLogin = (e?: Event) => {
  e?.preventDefault()
  
  formRef.value?.validate((errors) => {
    if (!errors) {
      submitLogin()
    }
  })
}

const handleRetry = () => {
  // 失败态下表单会被卸载，先恢复到表单视图，保留用户已填写内容
  reset()
}

const submitLogin = () => {
  run(async () => {
    const data = await authApi.login({
      username: formValue.username,
      password: formValue.password
    })

    if (data) {
      authStore.setLoginState(data)
      message.success('登录成功')

      // 跳转回之前的页面或个人中心
      const redirect = route.query.redirect as string
      router.push(redirect || '/profile')
    }
  })
}
</script>

<style scoped>
/* 登录页面容器 */
.login-page {
  background: transparent;
}

/* 登录容器入场动画 */
.login-container {
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
.login-title {
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: rgba(255, 255, 255, 0.6);
}

/* 标题样式 - 浅色主题（朝暮 Dawn） */
:root[data-theme="dawn"] .login-title {
  background: linear-gradient(135deg, #5D4037 0%, #8B5A2B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

:root[data-theme="dawn"] .login-subtitle {
  color: rgba(93, 64, 55, 0.7);
}

/* 登录卡片样式增强 */
.login-card {
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
.login-footer-text {
  color: rgba(255, 255, 255, 0.5);
}

.login-link {
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.2s ease;
}

.login-link:hover {
  color: #fff;
  text-decoration: underline;
}

:root[data-theme="dawn"] .login-footer-text {
  color: rgba(93, 64, 55, 0.6);
}

:root[data-theme="dawn"] .login-link {
  color: var(--color-primary);
}

:root[data-theme="dawn"] .login-link:hover {
  color: var(--color-primary-hover);
}

/* 品牌文字 */
.login-brand-text {
  color: rgba(255, 255, 255, 0.3);
  animation: fade-up 0.8s ease-out 0.6s both;
}

:root[data-theme="dawn"] .login-brand-text {
  color: rgba(93, 64, 55, 0.4);
}

/* 登录按钮样式增强 - 白色毛玻璃 + 上浮阴影 */
.login-button {
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

.login-button:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.login-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* Dusk 模式按钮样式 */
:root[data-theme="dusk"] .login-button {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #ECF0F1 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

:root[data-theme="dusk"] .login-button:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

:root[data-theme="dusk"] .login-button:active {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>
