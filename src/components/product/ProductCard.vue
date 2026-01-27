<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { AddCircleOutline } from '@vicons/ionicons5'
import type { Product } from '@/types/product'

interface Props {
  product: Product
  theme?: 'dawn' | 'dusk'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'dawn'
})

const emit = defineEmits<{
  (e: 'add-to-cart', productId: number): void
  (e: 'view-detail', productId: number): void
}>()

const isDawn = computed(() => props.theme === 'dawn')

const displayPrice = computed(() => `¥${props.product.price.toFixed(2)}`)
</script>

<template>
  <div 
    class="glass-card rounded-2xl overflow-hidden flex flex-col h-full cursor-pointer product-card-hover group relative"
    @click="emit('view-detail', product.id)"
  >
    <!-- Badge (Optional) -->
    <div 
      v-if="product.tag" 
      class="absolute top-2 right-2 z-10 px-2 py-0.5 text-[10px] font-bold rounded-md backdrop-blur-md shadow-sm tracking-wider"
      :class="isDawn ? 'bg-amber-500/90 text-white' : 'bg-indigo-400/90 text-white'"
    >
      {{ product.tag }}
    </div>

    <!-- Image -->
    <div class="aspect-square w-full bg-gray-200 overflow-hidden relative">
      <img 
        v-if="product.imageUrl" 
        :src="product.imageUrl" 
        :alt="product.name" 
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
        <span class="text-sm">暂无图片</span>
      </div>
      
      <!-- Quick Action Overlay (Desktop) -->
      <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hidden md:flex">
        <button 
          @click.stop="emit('add-to-cart', product.id)"
          class="bg-white text-[var(--color-primary)] p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-amber-50 active:scale-90"
        >
          <NIcon :component="AddCircleOutline" class="text-2xl" />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="p-3 flex-1 flex flex-col">
      <div class="flex-1">
        <h3 class="font-bold text-base text-[var(--color-text)] line-clamp-1">
          {{ product.name }}
        </h3>
        <p v-if="product.englishName" class="text-xs text-[var(--color-text-secondary)] truncate mt-0.5 mb-2 opacity-80 font-sans">
          {{ product.englishName }}
        </p>
      </div>
      
      <div class="mt-2 flex items-center justify-between">
        <span class="text-lg font-bold text-[var(--color-primary)] font-sans">
          {{ displayPrice }}
        </span>
        
        <!-- Mobile Add Button -->
        <button 
          @click.stop="emit('add-to-cart', product.id)"
          class="md:hidden p-2 -mr-1 rounded-full glass-button active:scale-95 border-none bg-transparent shadow-none hover:bg-[var(--glass-bg-hover)]"
        >
          <NIcon :component="AddCircleOutline" class="text-3xl text-[var(--color-primary)]" />
        </button>
      </div>
    </div>
  </div>
</template>
