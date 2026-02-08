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
import { useCartStore } from '@/stores/cart'
import { useThemeStore } from '@/stores/theme'

const authStore = useAuthStore(pinia)
const cartStore = useCartStore(pinia)

// 初始化主题 (确保尽早应用)
const themeStore = useThemeStore(pinia)
themeStore.applyTheme()

async function bootstrap() {
  await authStore.checkAuth()

  if (authStore.isLoggedIn && authStore.user?.id) {
    cartStore.bindUser(authStore.user.id)
    await cartStore.fetchCart()
  } else {
    cartStore.bindUser(null)
  }

  app.mount('#app')
}

bootstrap().catch((error) => {
  console.error('应用初始化失败:', error)
  cartStore.bindUser(null)
  app.mount('#app')
})
