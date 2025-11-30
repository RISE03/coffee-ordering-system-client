<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { 
  HomeOutline, Home,
  RestaurantOutline, Restaurant,
  ReceiptOutline, Receipt,
  PersonOutline, Person
} from '@vicons/ionicons5'

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
  { key: 'home', label: '首页', icon: HomeOutline, activeIcon: Home },
  { key: 'menu', label: '点餐', icon: RestaurantOutline, activeIcon: Restaurant },
  { key: 'orders', label: '订单', icon: ReceiptOutline, activeIcon: Receipt },
  { key: 'profile', label: '我的', icon: PersonOutline, activeIcon: Person }
]

const handleNav = (key: string) => {
  emit('update:activeKey', key)
  emit('navigate', key)
}
</script>

<template>
  <nav class="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none pb-safe">
    <!-- Main Navigation Capsule (Dynamic Expansion) -->
    <div 
      class="pointer-events-auto flex justify-around items-center mx-4 rounded-full backdrop-blur-xl border transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:shadow-2xl group/nav"
      :class="[
        theme === 'dusk' 
          ? 'bg-black/60 border-white/10 shadow-black/40' 
          : 'bg-gradient-to-b from-[rgba(255,255,255,0.85)] to-[rgba(255,255,255,0.45)] border-white/60 shadow-stone-400/20',
        /* Dynamic Dimensions: Compact (Idle) -> Expanded (Hover) */
        'h-16 w-[280px] hover:h-24 hover:w-[420px] md:hover:w-[500px] px-4'
      ]"
    >
      <button
        v-for="item in navItems"
        :key="item.key"
        @click="handleNav(item.key)"
        class="group/item flex-1 flex flex-col items-center justify-center h-full relative focus:outline-none bg-transparent hover:bg-transparent transition-all duration-300"
        style="background-color: transparent !important;" 
      >
        <!-- Icon Wrapper -->
        <div 
          class="transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] group-hover/nav:-translate-y-3 group-hover/item:scale-125"
          :class="[
            activeKey === item.key 
              ? (theme === 'dusk' ? 'text-white' : 'text-[#1a1a1a]') 
              : (theme === 'dusk' ? 'text-gray-500' : 'text-[#666666]'),
          ]"
        >
          <NIcon size="28" :component="activeKey === item.key ? item.activeIcon : item.icon" />
        </div>
        
        <!-- Label (Revealed on Container Hover) -->
        <span 
          class="absolute bottom-4 text-[11px] font-bold tracking-wide transition-all duration-500 ease-out pointer-events-none
                 opacity-0 scale-75 translate-y-4 group-hover/nav:opacity-100 group-hover/nav:scale-100 group-hover/nav:translate-y-0"
           :class="theme === 'dusk' ? 'text-white' : 'text-[#1a1a1a]'"
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
