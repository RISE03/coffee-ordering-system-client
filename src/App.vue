<script setup lang="ts">
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  NLoadingBarProvider,
  zhCN,
  dateZhCN,
  darkTheme,
} from 'naive-ui'
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useRoute } from 'vue-router'
import { useOrderNotification } from '@/composables/useOrderNotification'

// Initialize theme store to apply theme on startup
const themeStore = useThemeStore()
const route = useRoute()

const theme = computed(() => themeStore.activeTheme === 'dusk' ? darkTheme : null)

// 根据路由元信息决定是否隐藏全局背景
const hideGlobalBg = computed(() => route.meta.hideGlobalBg === true)

// 全局挂载订单通知监听（SSE 事件）
useOrderNotification()
</script>

<template>
  <div v-if="!hideGlobalBg" class="homepage-bg"></div>
  <div v-if="!hideGlobalBg" class="homepage-bg-overlay"></div>
  <NConfigProvider :locale="zhCN" :date-locale="dateZhCN" :theme="theme">
    <NLoadingBarProvider>
      <NMessageProvider>
        <NDialogProvider>
          <NNotificationProvider>
            <RouterView />
          </NNotificationProvider>
        </NDialogProvider>
      </NMessageProvider>
    </NLoadingBarProvider>
  </NConfigProvider>
</template>

<style scoped>
</style>
