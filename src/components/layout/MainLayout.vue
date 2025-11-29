<template>
  <n-layout class="min-h-screen flex flex-col">
    <app-header v-if="route.name !== 'home'" />
    
    <n-layout-content class="flex-1 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div class="w-full min-h-[calc(100vh-64px-80px)]">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </n-layout-content>

    <app-footer v-if="route.name !== 'home'" />
  </n-layout>
</template>

<script setup lang="ts">
import { NLayout, NLayoutContent } from 'naive-ui'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import { useThemeStore } from '@/stores/theme'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 确保主题初始化
const themeStore = useThemeStore()
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
