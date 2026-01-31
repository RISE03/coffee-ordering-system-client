<script setup lang="ts">
import { computed } from 'vue'
import { NSkeleton } from 'naive-ui'
import type { Product } from '@/types/product'
import type { TimeFlowColors } from '@/types/timeflow'
import TimeSlotCard from './TimeSlotCard.vue'

interface Props {
  /** 商品列表 */
  products: Product[]
  /** 时段配色 */
  slotColors: TimeFlowColors
  /** 是否正在加载 */
  loading?: boolean
  /** 错误信息 */
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null
})

const emit = defineEmits<{
  (e: 'add-to-cart', productId: number): void
  (e: 'view-detail', productId: number): void
  (e: 'retry'): void
}>()

// 取前 3 个商品
const displayProducts = computed(() => {
  return props.products.slice(0, 3)
})

// 主推商品（第 1 个）
const featuredProduct = computed(() => {
  return displayProducts.value[0] || null
})

// 辅助推荐商品（第 2、3 个）
const secondaryProducts = computed(() => {
  return displayProducts.value.slice(1, 3)
})
</script>

<template>
  <div class="bento-product-grid">
    <!-- 加载状态 -->
    <template v-if="loading">
      <!-- 大卡片骨架屏 -->
      <div class="bento-item bento-item-large">
        <div class="timeflow-glass-card rounded-2xl overflow-hidden p-4 h-full">
          <NSkeleton class="w-full h-3/5 rounded-xl" :sharp="false" />
          <div class="mt-4 space-y-3">
            <NSkeleton text width="70%" />
            <NSkeleton text width="40%" size="small" />
          </div>
        </div>
      </div>

      <!-- 小卡片骨架屏 -->
      <div
        v-for="i in 2"
        :key="`skeleton-${i}`"
        class="bento-item bento-item-small"
      >
        <div class="timeflow-glass-card rounded-2xl overflow-hidden p-3 h-full">
          <NSkeleton class="w-full h-2/3 rounded-xl" :sharp="false" />
          <div class="mt-2 space-y-2">
            <NSkeleton text width="80%" size="small" />
            <NSkeleton text width="50%" size="small" />
          </div>
        </div>
      </div>
    </template>

    <!-- 错误状态 -->
    <template v-else-if="error">
      <div class="bento-error">
        <div class="timeflow-glass-card inline-block px-8 py-6 rounded-xl text-center">
          <p class="mb-4 opacity-80" :style="{ color: slotColors.text }">
            加载失败：{{ error }}
          </p>
          <button
            class="timeflow-button text-sm"
            :style="{
              backgroundColor: slotColors.primary,
              color: slotColors.text
            }"
            @click="emit('retry')"
          >
            重试
          </button>
        </div>
      </div>
    </template>

    <!-- 空状态 -->
    <template v-else-if="displayProducts.length === 0">
      <div class="bento-empty">
        <div class="timeflow-glass-card inline-block px-8 py-4 rounded-xl">
          <p class="opacity-60" :style="{ color: slotColors.textSecondary }">
            暂无推荐商品
          </p>
        </div>
      </div>
    </template>

    <!-- 商品展示 -->
    <template v-else>
      <!-- 主推商品（大卡片） -->
      <div v-if="featuredProduct" class="bento-item bento-item-large">
        <TimeSlotCard
          :product="featuredProduct"
          :slot-colors="slotColors"
          size="large"
          @click="emit('view-detail', featuredProduct.id)"
          @add-to-cart="emit('add-to-cart', featuredProduct.id)"
        />
      </div>

      <!-- 辅助推荐商品（小卡片） -->
      <div
        v-for="product in secondaryProducts"
        :key="product.id"
        class="bento-item bento-item-small"
      >
        <TimeSlotCard
          :product="product"
          :slot-colors="slotColors"
          size="small"
          @click="emit('view-detail', product.id)"
          @add-to-cart="emit('add-to-cart', product.id)"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.bento-product-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.bento-item-large {
  grid-column: 1;
  grid-row: 1 / 3;
  min-height: 400px;
}

.bento-item-small {
  grid-column: 2;
  min-height: 190px;
}

/* 错误和空状态 */
.bento-error,
.bento-empty {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* 响应式 */
@media (max-width: 768px) {
  .bento-product-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    gap: 1rem;
  }

  .bento-item-large,
  .bento-item-small {
    grid-column: 1;
    grid-row: auto;
    min-height: 300px;
  }
}
</style>
