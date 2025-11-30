<script setup lang="ts">
import { computed } from 'vue'
import { NIcon, NAvatar } from 'naive-ui'
import { SunnyOutline, MoonOutline, HourglassOutline, PersonCircleOutline } from '@vicons/ionicons5'

interface Props {
  brandTitle?: string
  brandSubtitle?: string
  points?: number
  avatarUrl?: string
  theme?: 'dawn' | 'dusk'
  isGuest?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  brandTitle: '朝暮',
  brandSubtitle: 'Dawn & Dusk',
  points: 0,
  theme: 'dawn',
  isGuest: false
})

const emit = defineEmits<{
  (e: 'toggleTheme'): void
  (e: 'clickProfile'): void
  (e: 'login'): void
}>()

const isDawn = computed(() => props.theme === 'dawn')
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 px-4 py-3 glass-nav transition-all duration-500 ease-in-out">
    <div class="flex items-center justify-between max-w-7xl mx-auto">
      <!-- Brand -->
      <div class="flex items-center gap-3">
        <img :src="'/images/logo/logo.png'" alt="Logo" class="h-10 w-auto object-contain" />
        <div class="flex flex-col">
          <h1 class="text-lg font-serif font-bold tracking-wide text-[var(--color-primary-hover)] leading-tight">
            {{ brandTitle }}
          </h1>
          <span class="text-[0.6rem] uppercase tracking-widest opacity-80 font-sans text-[var(--color-text-secondary)] leading-none">
            {{ brandSubtitle }}
          </span>
        </div>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-3">
        <!-- Points (Member only) -->
        <div 
          v-if="!isGuest"
          class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium glass-light transition-colors text-[var(--color-accent)]"
        >
          <NIcon :component="HourglassOutline" class="text-sm" />
          <span>{{ points }}</span>
        </div>

        <!-- Theme Toggle -->
        <button 
          @click="emit('toggleTheme')"
          class="flex items-center justify-center w-11 h-11 rounded-full glass-button hover:scale-105 active:scale-95 focus:outline-none"
          aria-label="Toggle Theme"
        >
          <NIcon :component="isDawn ? SunnyOutline : MoonOutline" class="text-lg text-[var(--color-primary)]" />
        </button>

        <!-- Avatar / Profile -->
        <div 
          class="cursor-pointer transition-transform active:scale-95 p-1.5"
          @click="isGuest ? emit('login') : emit('clickProfile')"
        >
          <NAvatar 
            v-if="!isGuest && avatarUrl" 
            round 
            :size="32" 
            :src="avatarUrl" 
            class="border border-[var(--color-border)]"
          />
          <NIcon 
            v-else 
            :component="PersonCircleOutline" 
            class="text-3xl opacity-80 hover:opacity-100 transition-opacity text-[var(--color-text-secondary)]"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Scoped styles if needed to override or augment global utilities */
</style>