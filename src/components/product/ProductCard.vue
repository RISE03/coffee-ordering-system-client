<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { AddCircleOutline, RemoveCircleOutline } from '@vicons/ionicons5'
import type { Product } from '@/types/product'
import { useAuthStore } from '@/stores/auth'

interface Props {
  product: Product
  theme?: 'dawn' | 'dusk'
  cartQuantity?: number
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'dawn',
  cartQuantity: 0
})

const emit = defineEmits<{
  (e: 'add-to-cart', productId: number): void
  (e: 'remove-from-cart', productId: number): void
  (e: 'view-detail', productId: number): void
}>()

const authStore = useAuthStore()
const isDawn = computed(() => props.theme === 'dawn')

/**
 * 根据等级计算实际价格
 * 公式：priceLevel(L) = P - (P - Pm) * (L / 4)
 * 仅在 0 < memberPrice < price 时生效
 */
const levelPrice = computed(() => {
  const { price, memberPrice } = props.product
  const level = authStore.user?.level
  if (!level || !memberPrice || memberPrice <= 0 || memberPrice >= price) return null
  const discount = (price - memberPrice) * (level / 4)
  return Math.round((price - discount) * 100) / 100
})

// 展示给用户的实际价格（有会员价时用等级价，否则用原价）
const displayPrice = computed(() =>
  `¥${(levelPrice.value ?? props.product.price).toFixed(2)}`
)

// 原价（仅在等级价生效时才展示划线原价）
const originalPrice = computed(() =>
  levelPrice.value !== null ? `¥${props.product.price.toFixed(2)}` : null
)

const isInCart = computed(() => props.cartQuantity > 0)

const isSoldOut = computed(() => props.product.stock === null || (typeof props.product.stock === 'number' && props.product.stock <= 0))
const isLowStock = computed(() => {
  const s = props.product.stock
  return typeof s === 'number' && s > 0 && s <= 5
})

// 标签颜色映射
const tagColorMap: Record<string, string> = {
  '新品': 'bg-emerald-500/90',
  '热卖': 'bg-orange-500/90',
  '限定': 'bg-purple-500/90',
  '季节限定': 'bg-pink-500/90',
  '人气': 'bg-rose-500/90',
  '推荐': 'bg-amber-500/90',
  '招牌': 'bg-sky-500/90'
}

const getTagColor = (tag: string): string => {
  for (const [keyword, color] of Object.entries(tagColorMap)) {
    if (tag.includes(keyword)) return color
  }
  return isDawn.value ? 'bg-amber-500/90' : 'bg-indigo-400/90'
}

const displayTags = computed(() => {
  const tags: string[] = []
  if (props.product.tag) tags.push(props.product.tag)
  if (props.product.tags) tags.push(...props.product.tags.filter(t => t !== props.product.tag))
  return tags.slice(0, 2)
})
</script>

<template>
  <div
    class="glass-card rounded-2xl overflow-hidden flex flex-col h-full cursor-pointer product-card-hover group relative"
    @click="emit('view-detail', product.id)"
  >
    <!-- 标签列表 -->
    <div v-if="displayTags.length > 0" class="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
      <span
        v-for="tag in displayTags"
        :key="tag"
        class="px-2 py-0.5 text-[10px] font-bold rounded-md backdrop-blur-md shadow-sm tracking-wider text-white"
        :class="getTagColor(tag)"
      >
        {{ tag }}
      </span>
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

      <!-- 售罄遮罩 -->
      <div v-if="isSoldOut" class="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
        <span class="text-white text-lg font-bold tracking-widest bg-black/50 px-4 py-1.5 rounded-full">售罄</span>
      </div>

      <!-- Quick Action Overlay (Desktop) -->
      <div v-if="!isSoldOut" class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hidden md:flex">
        <button
          v-if="!isInCart"
          @click.stop="emit('add-to-cart', product.id)"
          class="bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white active:scale-90"
        >
          <NIcon :component="AddCircleOutline" class="text-2xl text-[#5D4037]" />
        </button>
        <div
          v-else
          class="bg-white/95 backdrop-blur-sm rounded-full shadow-xl flex items-center gap-1 px-3 py-1.5 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
        >
          <button
            @click.stop="emit('remove-from-cart', product.id)"
            class="p-1.5 rounded-full hover:bg-black/5 active:scale-90 transition-all"
          >
            <NIcon :component="RemoveCircleOutline" class="text-xl text-[#5D4037]" />
          </button>
          <span class="w-6 text-center font-bold text-[#5D4037]">{{ cartQuantity }}</span>
          <button
            @click.stop="emit('add-to-cart', product.id)"
            class="p-1.5 rounded-full hover:bg-black/5 active:scale-90 transition-all"
          >
            <NIcon :component="AddCircleOutline" class="text-xl text-[#5D4037]" />
          </button>
        </div>
      </div>

      <!-- 已加购数量角标 (Desktop) -->
      <div
        v-if="isInCart"
        class="absolute bottom-2 right-2 z-10 hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-primary)] text-[var(--color-bg)] text-xs font-bold shadow-md"
      >
        {{ cartQuantity }}
      </div>
    </div>

    <!-- Content -->
    <div class="p-3 flex-1 flex flex-col">
      <div class="flex-1">
        <h3 class="font-bold text-base text-[var(--color-text)] line-clamp-1">
          {{ product.name }}
        </h3>
        <p v-if="product.englishName" class="text-xs text-[var(--color-text-secondary)] truncate mt-0.5 opacity-80 font-sans">
          {{ product.englishName }}
        </p>
        <!-- 商品简介 -->
        <p v-if="product.description" class="text-xs text-[var(--color-text-secondary)] line-clamp-2 mt-1 opacity-70 leading-relaxed">
          {{ product.description }}
        </p>
      </div>

      <div class="mt-2 flex items-center justify-between">
        <div>
          <div class="flex items-baseline gap-1.5">
            <span class="text-lg font-bold text-[var(--color-primary)] font-sans">
              {{ displayPrice }}
            </span>
            <span v-if="originalPrice" class="text-xs text-[var(--color-text-secondary)] line-through opacity-60 font-sans">
              {{ originalPrice }}
            </span>
          </div>
          <p v-if="isSoldOut" class="text-[10px] text-red-500 font-medium">已售罄</p>
          <p v-else-if="isLowStock" class="text-xs text-orange-500 font-semibold low-stock-pulse">仅剩 {{ product.stock }} 件</p>
        </div>

        <!-- Mobile Add Button -->
        <template v-if="!isSoldOut">
          <button
            v-if="!isInCart"
            @click.stop="emit('add-to-cart', product.id)"
            class="md:hidden p-2 -mr-1 rounded-full glass-button active:scale-95 border-none bg-transparent shadow-none hover:bg-[var(--glass-bg-hover)]"
          >
            <NIcon :component="AddCircleOutline" class="text-3xl text-[var(--color-primary)]" />
          </button>
          <!-- Mobile: 已加购显示数量调整器 -->
          <div
            v-else
            class="md:hidden flex items-center gap-0.5 -mr-1"
          >
            <button
              @click.stop="emit('remove-from-cart', product.id)"
              class="p-1 rounded-full active:scale-90 transition-all"
            >
              <NIcon :component="RemoveCircleOutline" class="text-2xl text-[var(--color-primary)]" />
            </button>
            <span class="w-5 text-center font-bold text-sm text-[var(--color-text)]">{{ cartQuantity }}</span>
            <button
              @click.stop="emit('add-to-cart', product.id)"
              class="p-1 rounded-full active:scale-90 transition-all"
            >
              <NIcon :component="AddCircleOutline" class="text-2xl text-[var(--color-primary)]" />
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 低库存脉冲动画 */
.low-stock-pulse {
  animation: stock-pulse 2s ease-in-out infinite;
}

@keyframes stock-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
