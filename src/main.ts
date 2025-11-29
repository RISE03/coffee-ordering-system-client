import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 创建 Pinia 实例并挂载
const pinia = createPinia()
app.use(pinia)
app.use(router)

// 初始化认证状态
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const authStore = useAuthStore(pinia)
authStore.checkAuth()

// 初始化主题 (确保尽早应用)
const themeStore = useThemeStore(pinia)
themeStore.applyTheme()


app.mount('#app')
