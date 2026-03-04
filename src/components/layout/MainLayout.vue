<template>
  <div class="relative h-screen w-full overflow-hidden transition-colors duration-500">
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
      class="h-screen flex flex-col bg-transparent relative z-10"
      :style="{ '--n-color': 'transparent', '--n-text-color': 'var(--color-text)' }"
      :native-scrollbar="false"
    >
      <!-- Global Header -->
      <HomeHeader />

      <!-- Content Area -->
      <n-layout-content
        class="flex-1 bg-transparent pt-20 pb-24"
        :style="{ '--n-color': 'transparent' }"
      >
        <div class="w-full mx-auto">
          <router-view v-slot="{ Component, route }">
            <!-- 简化：去掉过渡，直接渲染，避免视觉干扰 -->
            <component :is="Component" :key="route.fullPath" />
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
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NLayout, NLayoutContent } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import HomeHeader from './HomeHeader.vue'
import BottomNav from './BottomNav.vue'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

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

onMounted(() => {
  themeStore.applyTheme()
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
