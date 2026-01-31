<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '@/types/product'
import type { TimeFlowColors } from '@/types/timeflow'

interface Props {
  /** 商品信息 */
  product: Product
  /** 时段配色 */
  slotColors: TimeFlowColors
  /** 卡片尺寸 */
  size?: 'large' | 'small'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'small'
})

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'add-to-cart', productId: number): void
}>()

const formattedPrice = computed(() => {
  return `¥${props.product.price.toFixed(2)}`
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
    class="timeflow-glass-card rounded-2xl overflow-hidden cursor-pointer group h-full"
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
          backgroundColor: slotColors.primary,
          color: slotColors.text
        }"
      >
        {{ product.tag }}
      </div>
    </div>

    <!-- 商品信息 -->
    <div :class="[size === 'large' ? 'p-5' : 'p-4']">
      <!-- 商品名称 -->
      <h3
        class="font-medium mb-1 line-clamp-1"
        :class="[size === 'large' ? 'text-xl' : 'text-base']"
        :style="{ color: slotColors.text }"
      >
        {{ product.name }}
      </h3>

      <!-- 英文名称 -->
      <p
        v-if="product.englishName"
        class="opacity-60 mb-2 line-clamp-1"
        :class="[size === 'large' ? 'text-sm' : 'text-xs']"
        :style="{ color: slotColors.textSecondary }"
      >
        {{ product.englishName }}
      </p>

      <!-- 商品描述（仅大卡片显示） -->
      <p
        v-if="size === 'large' && product.description"
        class="text-sm opacity-70 mb-3 line-clamp-2"
        :style="{ color: slotColors.textSecondary }"
      >
        {{ product.description }}
      </p>

      <!-- 价格和操作 -->
      <div class="flex items-center justify-between mt-3">
        <span
          class="font-bold"
          :class="[size === 'large' ? 'text-2xl' : 'text-lg']"
          :style="{ color: slotColors.primary }"
        >
          {{ formattedPrice }}
        </span>

        <!-- 加入购物车按钮 -->
        <button
          class="rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          :class="[size === 'large' ? 'w-12 h-12' : 'w-9 h-9']"
          :style="{
            backgroundColor: slotColors.primary,
            color: slotColors.text
          }"
          title="加入购物车"
          @click="handleAddToCart"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="[size === 'large' ? 'w-6 h-6' : 'w-5 h-5']"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
