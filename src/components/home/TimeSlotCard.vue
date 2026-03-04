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
  /** 是否营业中 */
  isOpen?: boolean
  /** 购物车中的数量 */
  cartQuantity?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 'small',
  isOpen: true,
  cartQuantity: 0
})

const isInCart = computed(() => props.cartQuantity > 0)

const isSoldOut = computed(() => props.product.stock === null || (typeof props.product.stock === 'number' && props.product.stock <= 0))
const isLowStock = computed(() => {
  const s = props.product.stock
  return typeof s === 'number' && s > 0 && s <= 5
})

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'add-to-cart', productId: number): void
}>()

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

      <!-- 售罄遮罩 -->
      <div v-if="isSoldOut" class="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
        <span class="text-white font-bold tracking-widest bg-black/50 px-4 py-1.5 rounded-full"
          :class="[size === 'large' ? 'text-lg' : 'text-sm']"
        >售罄</span>
      </div>

      <!-- 已加购数量角标 -->
      <Transition name="cart-badge">
        <div
          v-if="isInCart"
          class="absolute bottom-2 right-2 z-10 flex items-center justify-center rounded-full font-bold shadow-lg cart-badge"
          :class="[size === 'large' ? 'w-8 h-8 text-sm' : 'w-6 h-6 text-xs']"
          :style="{
            backgroundColor: slotColors.tagBg || slotColors.primary,
            color: slotColors.tagText || slotColors.text
          }"
        >
          {{ cartQuantity }}
        </div>
      </Transition>
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
        <div>
          <span
            class="font-bold"
            :class="[size === 'large' ? 'text-2xl' : 'text-lg']"
            :style="{ color: priceColor }"
          >
            {{ formattedPrice }}
          </span>
          <p
            v-if="!isOpen && !isSoldOut"
            class="text-[11px] font-medium"
            :style="{ color: slotColors.textSecondary }"
          >
            打烊可先加购
          </p>
          <p v-if="isLowStock" class="text-xs text-orange-500 font-semibold low-stock-pulse">仅剩 {{ product.stock }} 件</p>
        </div>

        <!-- 加入购物车按钮 / 售罄 -->
        <button
          v-if="isSoldOut"
          class="closed-button rounded-full flex items-center justify-center cursor-not-allowed"
          :class="[size === 'large' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs']"
          disabled
        >
          售罄
        </button>
        <button
          v-else
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

/* 购物车角标 */
.cart-badge {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.cart-badge-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cart-badge-leave-active {
  transition: all 0.2s ease-in;
}

.cart-badge-enter-from {
  opacity: 0;
  transform: scale(0);
}

.cart-badge-leave-to {
  opacity: 0;
  transform: scale(0);
}

/* 低库存脉冲动画 */
.low-stock-pulse {
  animation: stock-pulse 2s ease-in-out infinite;
}

@keyframes stock-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
