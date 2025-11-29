<script setup lang="ts">
import RecommendedCard from './RecommendedCard.vue'
import type { Product } from '@/types/product'
import { NSkeleton } from 'naive-ui'

interface Props {
  slotTitle?: string
  slogan?: string
  recommendedProducts?: Product[]
  theme?: 'dawn' | 'dusk'
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  slotTitle: '朝·醒神推荐',
  slogan: '把时间，浪费在美好的朝暮里',
  recommendedProducts: () => [],
  theme: 'dawn',
  loading: false
})

const emit = defineEmits<{
  (e: 'add-to-cart', productId: number): void
  (e: 'view-detail', productId: number): void
}>()
</script>

<template>
  <div class="w-full px-4 py-2">
    <div class="glass-card-strong p-5 rounded-2xl flex flex-col md:flex-row gap-6 transition-all duration-500 overflow-hidden relative">
      <!-- Decorative Glow -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none rounded-2xl">
         <div class="absolute -top-10 -left-10 w-40 h-40 bg-[var(--color-primary)] opacity-20 blur-[50px] rounded-full"></div>
      </div>

      <!-- Left Section: Title & Slogan -->
      <div class="flex flex-col justify-center md:w-1/3 relative z-10">
        <div v-if="loading" class="space-y-3">
          <NSkeleton text width="120px" height="28px" round />
          <NSkeleton text width="180px" height="20px" round />
        </div>
        <template v-else>
          <h2 class="text-2xl font-serif font-bold tracking-wide mb-2 text-[var(--color-text)] transition-colors duration-300">
            {{ slotTitle }}
          </h2>
          <p class="text-sm opacity-80 leading-relaxed font-light text-[var(--color-text-secondary)] transition-colors duration-300">
            {{ slogan }}
          </p>
        </template>
      </div>

      <!-- Right Section: Recommendations List -->
      <div class="flex-1 flex flex-col gap-3 relative z-10">
        <div v-if="loading">
          <div v-for="n in 3" :key="n" class="flex items-center p-3 rounded-xl bg-[var(--glass-bg)] mb-3 last:mb-0">
             <NSkeleton width="64px" height="64px" class="rounded-lg flex-shrink-0" />
             <div class="ml-3 flex-1 space-y-2">
               <NSkeleton text width="60%" />
               <NSkeleton text width="40%" />
             </div>
          </div>
        </div>
        
        <template v-else>
          <div v-if="recommendedProducts.length === 0" class="text-center py-8 opacity-60 text-sm text-[var(--color-text-secondary)]">
            暂无推荐商品
          </div>
          
          <RecommendedCard
            v-for="product in recommendedProducts.slice(0, 3)"
            :key="product.id"
            :product="product"
            :theme="theme"
            @add-to-cart="emit('add-to-cart', $event)"
            @view-detail="emit('view-detail', $event)"
          />
        </template>
      </div>
    </div>
  </div>
</template>
