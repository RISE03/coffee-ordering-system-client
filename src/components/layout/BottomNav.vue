<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { HomeOutline, RestaurantOutline, ReceiptOutline, PersonOutline } from '@vicons/ionicons5'

interface Props {
  activeKey?: string
  theme?: 'dawn' | 'dusk'
}

withDefaults(defineProps<Props>(), {
  activeKey: 'home',
  theme: 'dawn'
})

const emit = defineEmits<{
  (e: 'update:activeKey', key: string): void
  (e: 'navigate', key: string): void
}>()

const navItems = [
  { key: 'home', label: '首页', icon: HomeOutline },
  { key: 'menu', label: '点餐', icon: RestaurantOutline },
  { key: 'orders', label: '订单', icon: ReceiptOutline },
  { key: 'profile', label: '我的', icon: PersonOutline }
]

const handleNav = (key: string) => {
  emit('update:activeKey', key)
  emit('navigate', key)
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 glass-nav-bottom pb-safe transition-all duration-500 md:hidden">
    <div class="flex justify-around items-center h-16">
      <button
        v-for="item in navItems"
        :key="item.key"
        @click="handleNav(item.key)"
        class="flex-1 flex flex-col items-center justify-center h-full relative group focus:outline-none active:scale-95 transition-transform"
      >
        <!-- Active Indicator (Top Line) -->
        <div 
          class="absolute top-0 w-8 h-0.5 rounded-b-full transition-all duration-300"
          :class="activeKey === item.key ? 'bg-[var(--color-primary)] opacity-100' : 'bg-transparent opacity-0'"
        ></div>
        
        <!-- Icon -->
        <div 
          class="text-2xl mb-0.5 transition-all duration-300"
          :class="activeKey === item.key ? 'text-[var(--color-primary)] -translate-y-0.5' : 'text-[var(--color-text-secondary)] opacity-60 group-hover:opacity-80'"
        >
          <NIcon :component="item.icon" />
        </div>
        
        <!-- Label -->
        <span 
          class="text-[10px] transition-colors duration-300 font-medium"
          :class="activeKey === item.key ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-text-secondary)] opacity-60'"
        >
          {{ item.label }}
        </span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
