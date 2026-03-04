<script setup lang="ts">
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue'

interface Props {
  brandTitle?: string
  brandSubtitle?: string
}

withDefaults(defineProps<Props>(), {
  brandTitle: '朝暮',
  brandSubtitle: 'Dawn & Dusk',
})
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
      <ThemeSwitcher />
    </div>
  </header>
</template>