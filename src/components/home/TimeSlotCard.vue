<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '@/types/product'
import type { TimeFlowColors } from '@/types/timeflow'
import { useThemeStore } from '@/stores/theme'

interface Props {
  /** 商品信息 */
  product: Product
  /** 时段配色 */
  slotColors: TimeFlowColors
  /** 卡片尺寸 */
  size?: 'large' | 'small'
  /** 是否营业中 */
  isOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'small',
  isOpen: true
})

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'add-to-cart', productId: number): void
}>()

// 主题状态
const themeStore = useThemeStore()

const formattedPrice = computed(() => {
  return `¥${props.product.price.toFixed(2)}`
})

// 价格颜色：统一使用 accent（对比度更好）
const priceColor = computed(() => {
  return props.slotColors.accent
})

const productImage = computed(() => {
  return props.product.imageUrl || '/images/placeholder-product.png'
})

function handleCardClick() {
  emit('click')
}

function handleAddToCart(event: Event) {
  event.stopPropagation()
  emit('add-to-cart', props.product.id)
}
</script>

<template>
  <div
    class="product-card timeflow-glass-card rounded-2xl overflow-hidden cursor-pointer group h-full flex flex-col"
    :class="[size === 'large' ? 'card-large' : 'card-small']"
    @click="handleCardClick"
  >
    <!-- 商品图片 -->
    <div
      class="relative overflow-hidden"
      :class="[size === 'large' ? 'aspect-[3/4]' : 'aspect-[4/3]']"
    >
      <img
        :src="productImage"
        :alt="product.name"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <!-- 商品标签 -->
      <div
        v-if="product.tag"
        class="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium"
        :style="{
          backgroundColor: slotColors.tagBg || slotColors.primary,
          color: slotColors.tagText || slotColors.text
        }"
      >
        {{ product.tag }}
      </div>
    </div>

    <!-- 商品信息 -->
    <div
      class="card-info-section flex flex-col flex-1 justify-center"
      :class="[size === 'large' ? 'p-5' : 'p-4']"
      :style="{ backgroundColor: slotColors.glassBg }"
    >
      <!-- 商品名称 -->
      <h3
        class="font-bold line-clamp-1"
        :class="[size === 'large' ? 'text-xl mb-1' : 'text-base mb-1']"
        :style="{ color: slotColors.text }"
      >
        {{ product.name }}
      </h3>

      <!-- 商品描述 -->
      <p
        v-if="product.description"
        class="line-clamp-2"
        :class="[size === 'large' ? 'text-sm mb-2' : 'text-xs mb-2']"
        :style="{ color: slotColors.textSecondary }"
      >
        {{ product.description }}
      </p>

      <!-- 价格和操作 -->
      <div class="flex items-center justify-between">
        <span
          class="font-bold"
          :class="[size === 'large' ? 'text-2xl' : 'text-lg']"
          :style="{ color: priceColor }"
        >
          {{ formattedPrice }}
        </span>

        <!-- 加入购物车按钮 / 已打烊按钮 -->
        <button
          v-if="isOpen"
          class="rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          :class="[size === 'large' ? 'w-12 h-12' : 'w-9 h-9']"
          :style="{
            backgroundColor: slotColors.tagBg || slotColors.primary,
            color: slotColors.tagText || slotColors.text
          }"
          title="加入购物车"
          @click="handleAddToCart"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="[size === 'large' ? 'w-6 h-6' : 'w-5 h-5', 'flex-shrink-0']"
          >
            <line x1="12" y1="4" x2="12" y2="20" />
            <line x1="4" y1="12" x2="20" y2="12" />
          </svg>
        </button>

        <!-- 已打烊状态按钮 -->
        <button
          v-else
          class="closed-button rounded-full flex items-center justify-center cursor-not-allowed"
          :class="[size === 'large' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs']"
          disabled
        >
          已打烊
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.card-info-section {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.closed-button {
  background-color: rgba(128, 128, 128, 0.3);
  color: rgba(150, 150, 150, 0.9);
  border: 1px solid rgba(128, 128, 128, 0.4);
}
</style>
