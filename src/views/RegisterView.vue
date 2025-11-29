<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6 text-dawn-text dark:text-dusk-text text-center transition-colors duration-300">
      注册新账号
    </h1>
    
    <div class="max-w-md mx-auto">
      <StateBlock 
        :loading="loading" 
        :error="error" 
        loading-text="正在注册中..."
        error-text="注册失败"
        @retry="handleRegister"
      >
        <div class="bg-dawn-bg-secondary dark:bg-dusk-bg-secondary p-8 rounded-brand shadow-dawn dark:shadow-dusk transition-all duration-300">
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
                placeholder="请输入用户名 (3-20位字母数字下划线)"
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
            
            <div class="mt-2">
              <n-button 
                class="w-full" 
                type="primary" 
                attr-type="submit"
                :loading="loading"
                @click="handleRegister"
              >
                注册
              </n-button>
            </div>
            
            <div class="mt-4 text-center text-sm text-gray-500">
              已有账号？
              <router-link to="/login" class="text-primary hover:underline">
                立即登录
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
import { useRouter } from 'vue-router'
import StateBlock from '@/components/common/StateBlock.vue'
import { useRequestState } from '@/composables/useRequestState'
import { authApi } from '@/api/auth'
import { USERNAME_RULES, PASSWORD_RULES } from '@/types/user'

const router = useRouter()
const message = useMessage()

const formRef = ref<FormInst | null>(null)

const formValue = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const rules: FormRules = {
  username: USERNAME_RULES,
  password: PASSWORD_RULES,
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

const { loading, error, run } = useRequestState()

const handleRegister = (e?: Event) => {
  e?.preventDefault()
  
  formRef.value?.validate((errors) => {
    if (!errors) {
      submitRegister()
    }
  })
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
