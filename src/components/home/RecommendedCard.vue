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
    class="flex items-center p-3 rounded-xl glass-card hover:bg-[var(--glass-bg-hover)] transition-colors cursor-pointer group"
    @click="emit('view-detail', product.id)"
  >
    <!-- Image -->
    <div class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 relative">
      <img 
        v-if="product.imageUrl" 
        :src="product.imageUrl" 
        :alt="product.name" 
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-100">
        <span>No Img</span>
      </div>
    </div>

    <!-- Info -->
    <div class="ml-3 flex-1 min-w-0">
      <h3 class="text-sm font-medium truncate text-[var(--color-text)]">
        {{ product.name }}
      </h3>
      <p v-if="product.englishName" class="text-xs truncate opacity-70 text-[var(--color-text-secondary)]">
        {{ product.englishName }}
      </p>
      <div class="mt-1 flex items-center justify-between">
        <span class="text-sm font-semibold text-[var(--color-primary-hover)]">
          {{ displayPrice }}
        </span>
      </div>
    </div>

    <!-- Add to Cart Action -->
    <button 
      @click.stop="emit('add-to-cart', product.id)"
      class="ml-2 p-1.5 rounded-full transition-transform active:scale-90 focus:outline-none"
      :class="isDawn ? 'text-amber-600 hover:bg-amber-100/50' : 'text-amber-300 hover:bg-white/10'"
      aria-label="Add to cart"
    >
      <NIcon :component="AddCircleOutline" class="text-2xl" />
    </button>
  </div>
</template>
