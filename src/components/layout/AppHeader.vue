<template>
  <n-layout-header class="h-16 px-4 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
    <!-- Left: Mobile Menu & Logo -->
    <div class="flex items-center">
      <!-- Mobile Menu Button -->
      <n-button 
        quaternary 
        circle 
        class="md:hidden mr-2" 
        @click="showMobileMenu = true"
      >
        <template #icon>
          <n-icon size="24"><MenuOutline /></n-icon>
        </template>
      </n-button>

      <!-- Logo / Brand -->
      <div class="flex items-center cursor-pointer" @click="$router.push('/')">
        <span class="text-xl font-bold text-primary-600 dark:text-primary-400">Dawn & Dusk</span>
      </div>
    </div>

    <!-- Navigation (Desktop) -->
    <div class="hidden md:flex items-center space-x-6">
      <router-link 
        to="/" 
        class="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors" 
        active-class="text-primary font-medium"
      >
        首页
      </router-link>
      <router-link 
        to="/menu" 
        class="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors" 
        active-class="text-primary font-medium"
      >
        菜单
      </router-link>
      <router-link 
        to="/member/orders" 
        class="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors" 
        active-class="text-primary font-medium"
      >
        我的订单
      </router-link>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center space-x-2 md:space-x-4">
      <!-- Theme Toggle -->
      <n-button quaternary circle size="small" @click="toggleTheme">
        <template #icon>
          <n-icon v-if="themeStore.activeTheme === 'dawn'" size="18">
            <SunnyOutline />
          </n-icon>
          <n-icon v-else size="18">
            <MoonOutline />
          </n-icon>
        </template>
      </n-button>

      <!-- Cart -->
      <n-badge :value="cartStore.summary.totalQty" :max="99">
        <n-button quaternary circle size="small" @click="$router.push('/member/cart')">
          <template #icon>
            <n-icon size="20"><CartOutline /></n-icon>
          </template>
        </n-button>
      </n-badge>

      <!-- User / Login -->
      <div v-if="authStore.isLoggedIn">
        <n-dropdown trigger="hover" :options="userOptions" @select="handleUserSelect">
          <n-button quaternary class="flex items-center">
            <span class="hidden md:inline mr-2">{{ authStore.user?.nickname || authStore.user?.username }}</span>
            <n-avatar round size="small" :src="authStore.user?.avatar" />
          </n-button>
        </n-dropdown>
      </div>
      <div v-else>
        <n-button size="small" type="primary" ghost @click="$router.push('/login')" class="hidden md:flex">
          登录 / 注册
        </n-button>
        <!-- Mobile Login Icon -->
        <n-button quaternary circle size="small" @click="$router.push('/login')" class="md:hidden">
          <template #icon>
            <n-icon size="20"><PersonOutline /></n-icon>
          </template>
        </n-button>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <n-drawer v-model:show="showMobileMenu" :width="240" placement="left">
      <n-drawer-content title="Dawn & Dusk">
        <div class="flex flex-col space-y-4 mt-4">
          <router-link 
            to="/" 
            class="text-lg text-gray-700 dark:text-gray-200 hover:text-primary" 
            active-class="text-primary font-bold"
            @click="showMobileMenu = false"
          >
            首页
          </router-link>
          <router-link 
            to="/menu" 
            class="text-lg text-gray-700 dark:text-gray-200 hover:text-primary" 
            active-class="text-primary font-bold"
            @click="showMobileMenu = false"
          >
            菜单
          </router-link>

          <router-link 
            to="/member/cart" 
            class="text-lg text-gray-700 dark:text-gray-200 hover:text-primary flex items-center justify-between" 
            active-class="text-primary font-bold"
            @click="showMobileMenu = false"
          >
            <span>购物车</span>
            <n-badge :value="cartStore.summary.totalQty" :max="99" v-if="cartStore.summary.totalQty > 0" />
          </router-link>
          <router-link 
            to="/member/orders" 
            class="text-lg text-gray-700 dark:text-gray-200 hover:text-primary" 
            active-class="text-primary font-bold"
            @click="showMobileMenu = false"
          >
            我的订单
          </router-link>
          
          <div class="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
          
          <div v-if="!authStore.isLoggedIn" class="flex flex-col space-y-2">
            <n-button type="primary" block @click="navigateTo('/login')">
              登录
            </n-button>
            <n-button block @click="navigateTo('/register')">
              注册
            </n-button>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
  </n-layout-header>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { 
  NLayoutHeader, 
  NButton, 
  NIcon, 
  NBadge, 
  NAvatar, 
  NDropdown,
  NDrawer,
  NDrawerContent
} from 'naive-ui'
import { 
  SunnyOutline, 
  MoonOutline, 
  CartOutline,
  PersonOutline,
  LogOutOutline,
  MenuOutline
} from '@vicons/ionicons5'
import type { Component } from 'vue'

const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const cartStore = useCartStore()

const showMobileMenu = ref(false)

// 图标渲染辅助函数
const renderIcon = (icon: Component) => {
  return () => h(NIcon, null, { default: () => h(icon) })
}

// 用户下拉菜单选项
const userOptions = computed(() => [
  {
    label: '个人中心',
    key: 'profile',
    icon: renderIcon(PersonOutline)
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: renderIcon(LogOutOutline)
  }
])

// 处理用户下拉菜单选择
const handleUserSelect = (key: string) => {
  if (key === 'profile') {
    router.push('/profile')
  } else if (key === 'logout') {
    authStore.logout()
    router.push('/login')
  }
}

// 切换主题
const toggleTheme = () => {
  const newTheme = themeStore.activeTheme === 'dawn' ? 'dusk' : 'dawn'
  themeStore.setMode(newTheme)
}

// 导航辅助
const navigateTo = (path: string) => {
  router.push(path)
  showMobileMenu.value = false
}
</script>
