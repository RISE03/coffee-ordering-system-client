<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6 text-dawn-text dark:text-dusk-text text-center transition-colors duration-300">
      登录 / 注册
    </h1>
    
    <div class="max-w-md mx-auto">
      <StateBlock 
        :loading="loading" 
        :error="error" 
        loading-text="正在登录中..."
        error-text="登录遇到了一点问题"
        @retry="handleLogin"
      >
        <div class="bg-dawn-bg-secondary dark:bg-dusk-bg-secondary p-8 rounded-brand shadow-dawn dark:shadow-dusk transition-all duration-300">
          <p class="text-dawn-text-secondary dark:text-dusk-text-secondary text-center mb-6">
            欢迎回到朝暮咖啡
          </p>
          
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
            
            <div class="mt-2">
              <n-button 
                class="w-full" 
                type="primary" 
                attr-type="submit"
                :loading="loading"
                @click="handleLogin"
              >
                登录
              </n-button>
            </div>
            
            <div class="mt-4 text-center text-sm text-gray-500">
              还没有账号？
              <router-link to="/register" class="text-primary hover:underline">
                立即注册
              </router-link>
            </div>
          </n-form>
        </div>
      </StateBlock>
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
  useMessage, 
  type FormInst,
  type FormRules
} from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import StateBlock from '@/components/common/StateBlock.vue'
import { useRequestState } from '@/composables/useRequestState'
import { authApi } from '@/api/auth'
import { USERNAME_RULES, PASSWORD_RULES } from '@/types/user'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const message = useMessage()

// 表单引用
const formRef = ref<FormInst | null>(null)

// 表单数据
const formValue = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const rules: FormRules = {
  username: USERNAME_RULES,
  password: PASSWORD_RULES
}

// 使用 useRequestState 管理请求状态
const { loading, error, run } = useRequestState()

const handleLogin = (e?: Event) => {
  e?.preventDefault()
  
  formRef.value?.validate((errors) => {
    if (!errors) {
      submitLogin()
    }
  })
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
