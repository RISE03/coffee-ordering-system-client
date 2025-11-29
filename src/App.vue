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

// Initialize theme store to apply theme on startup
const themeStore = useThemeStore()

const theme = computed(() => themeStore.activeTheme === 'dusk' ? darkTheme : null)
</script>

<template>
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
