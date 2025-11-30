<template>
  <div class="relative min-h-screen w-full overflow-x-hidden transition-colors duration-500">
    <!-- Global Background Layer -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <div
        class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
        :class="{ 'opacity-100': themeStore.isDawn, 'opacity-0': !themeStore.isDawn }"
        style="background-image: url('/images/backgrounds/dawn-bg.webp')"
      ></div>
      <div
        class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
        :class="{ 'opacity-100': themeStore.isDusk, 'opacity-0': !themeStore.isDusk }"
        style="background-image: url('/images/backgrounds/dusk-bg.webp')"
      ></div>
      <!-- Fallback background color -->
      <div class="absolute inset-0 bg-[#FCF9F2] dark:bg-[#1A2530] -z-10 transition-colors duration-1000"></div>
    </div>

    <n-layout
      class="min-h-screen flex flex-col bg-transparent relative z-10"
      :style="{ '--n-color': 'transparent', '--n-text-color': 'var(--color-text)' }"
    >
      <!-- Global Header -->
      <HomeHeader 
        :brand-title="'朝暮'"
        :brand-subtitle="'Dawn & Dusk'"
        :points="points"
        :avatar-url="authStore.user?.avatar"
        :theme="themeStore.activeTheme"
        :is-guest="!authStore.isLoggedIn"
        @toggle-theme="themeStore.toggleTheme()"
        @click-profile="router.push('/profile')"
        @login="router.push('/login')"
      />
      
      <!-- Content Area -->
      <n-layout-content
        class="flex-1 bg-transparent pt-20 pb-24"
        :style="{ '--n-color': 'transparent' }"
      >
        <div class="w-full mx-auto">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </n-layout-content>

      <!-- Global Bottom Navigation -->
      <BottomNav 
        :active-key="activeNavKey"
        :theme="themeStore.activeTheme"
        @navigate="handleBottomNav"
      />
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NLayout, NLayoutContent } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { getMyPoints } from '@/api/user'
import HomeHeader from './HomeHeader.vue'
import BottomNav from './BottomNav.vue'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const authStore = useAuthStore()

const points = ref(0)

// Determine active nav key based on current route
const activeNavKey = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path.startsWith('/menu')) return 'menu'
  if (path.startsWith('/member/orders')) return 'orders'
  if (path.startsWith('/profile')) return 'profile'
  return ''
})

const handleBottomNav = (key: string) => {
  switch (key) {
    case 'home':
      router.push('/')
      break
    case 'menu':
      router.push('/menu')
      break
    case 'orders':
      router.push('/member/orders')
      break
    case 'profile':
      router.push('/profile')
      break
  }
}

const fetchPoints = async () => {
  if (authStore.isLoggedIn) {
    try {
      const data = await getMyPoints()
      points.value = data.balance
    } catch (e) {
      console.error('Failed to fetch points', e)
    }
  } else {
    points.value = 0
  }
}

// Watch for auth changes to re-fetch points
watch(() => authStore.isLoggedIn, () => {
  fetchPoints()
})

onMounted(() => {
  themeStore.applyTheme()
  fetchPoints()
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
