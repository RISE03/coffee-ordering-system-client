<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon, NBadge, useMessage } from 'naive-ui'
import { CartOutline, CloseOutline } from '@vicons/ionicons5'
import { useCartStore } from '@/stores/cart'
import { guardOrderEntry } from '@/composables/useOrderAvailabilityGuard'

const router = useRouter()
const cartStore = useCartStore()
const message = useMessage()

const isExpanded = ref(false)

const totalQty = computed(() => cartStore.summary.totalQty)
const totalAmount = computed(() => cartStore.summary.totalAmount.toFixed(2))
const cartItems = computed(() => cartStore.items.slice(0, 3)) // 最多显示3个
const hasMoreItems = computed(() => cartStore.items.length > 3)

const toggleExpand = () => {
  // 购物车为空时直接跳转到购物车页面
  if (totalQty.value === 0) {
    router.push('/member/cart')
    return
  }
  isExpanded.value = !isExpanded.value
}

const goToCart = () => {
  isExpanded.value = false
  router.push('/member/cart')
}

const goToCheckout = async () => {
  const canProceed = await guardOrderEntry(message)
  if (!canProceed) {
    return
  }

  isExpanded.value = false
  router.push('/member/checkout')
}
</script>

<template>
  <div class="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3">
    <!-- 展开的迷你购物车 -->
    <Transition name="cart-panel">
      <div
        v-if="isExpanded && totalQty > 0"
        class="glass-card-strong w-72 rounded-2xl overflow-hidden shadow-xl"
      >
        <!-- 头部 -->
        <div class="p-3 border-b border-[var(--glass-border)] flex items-center justify-between">
          <span class="font-bold text-[var(--color-text)]">购物车</span>
          <button
            @click="toggleExpand"
            class="p-1 rounded-full hover:bg-[var(--glass-bg-hover)] transition-colors"
          >
            <NIcon :component="CloseOutline" class="text-lg text-[var(--color-bg)]" />
          </button>
        </div>

        <!-- 商品列表 -->
        <div class="max-h-48 overflow-y-auto">
          <div
            v-for="item in cartItems"
            :key="item.productId"
            class="p-3 flex items-center gap-3 border-b border-[var(--glass-border-subtle)] last:border-b-0"
          >
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.name"
              class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
            <div v-else class="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0"></div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-[var(--color-text)] truncate">{{ item.name }}</p>
              <p class="text-xs text-[var(--color-text-secondary)]">x{{ item.quantity }}</p>
            </div>
            <span class="text-sm font-bold text-[var(--color-primary)]">¥{{ item.subtotal.toFixed(2) }}</span>
          </div>
          <div v-if="hasMoreItems" class="p-2 text-center text-xs text-[var(--color-text-secondary)]">
            还有 {{ cartStore.items.length - 3 }} 件商品...
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="p-3 border-t border-[var(--glass-border)] bg-[var(--glass-bg)]">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-[var(--color-text-secondary)]">共 {{ totalQty }} 件</span>
            <span class="text-lg font-bold text-[var(--color-primary)]">¥{{ totalAmount }}</span>
          </div>
          <div class="flex gap-2">
            <button
              @click="goToCart"
              class="flex-1 py-2 rounded-full glass-button text-sm font-medium"
            >
              查看购物车
            </button>
            <button
              @click="goToCheckout"
              class="flex-1 py-2 rounded-full bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              去结算
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 悬浮球按钮 -->
    <button
      @click="toggleExpand"
      class="relative w-14 h-14 rounded-full bg-[var(--color-primary)] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
      :class="{ 'ring-4 ring-[var(--color-primary)]/30': isExpanded }"
    >
      <NIcon :component="CartOutline" class="text-2xl" />
      <!-- 数量角标 -->
      <NBadge
        v-if="totalQty > 0"
        :value="totalQty"
        :max="99"
        class="absolute -top-1 -right-1"
      />
      <!-- 金额提示 -->
      <div
        v-if="totalQty > 0 && !isExpanded"
        class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-full bg-[var(--color-bg)] text-[var(--color-primary)] text-xs font-bold shadow-md border border-[var(--glass-border)]"
      >
        ¥{{ totalAmount }}
      </div>
    </button>
  </div>
</template>

<style scoped>
/* 面板展开动画 */
.cart-panel-enter-active {
  transition: all 0.3s ease-out;
}
.cart-panel-leave-active {
  transition: all 0.2s ease-in;
}
.cart-panel-enter-from,
.cart-panel-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
