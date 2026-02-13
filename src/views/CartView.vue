<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDialog, useMessage } from 'naive-ui'
import EmptyState from '@/components/common/EmptyState.vue'
import StateBlock from '@/components/common/StateBlock.vue'
import { useCartStore, CART_QUANTITY_MIN, CART_QUANTITY_MAX } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
import type { CartItem } from '@/types/cart'
import { getDisplayErrorMessage } from '@/utils/error'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()
const message = useMessage()
const dialog = useDialog()

// 本地输入缓存，避免用户编辑时抖动
const quantityInputs = reactive<Record<number, string>>({})
const updatingId = ref<number | null>(null)
const removingId = ref<number | null>(null)
const clearing = ref(false)

const isInitialLoading = computed(() => cartStore.loading && !cartStore.initialized)
const lastSyncedLabel = computed(() => {
  if (!cartStore.lastSyncedAt) return ''
  return new Date(cartStore.lastSyncedAt).toLocaleTimeString()
})

const optimisticSummary = computed(() => {
  return cartStore.items.reduce(
    (acc, item) => {
      const qty = getDisplayQuantity(item)
      acc.totalQty += qty
      acc.totalAmount += qty * item.unitPrice
      return acc
    },
    { totalQty: 0, totalAmount: 0 }
  )
})

watch(
  () => cartStore.items,
  () => syncQuantityInputs(),
  { deep: true, immediate: true }
)

onMounted(async () => {
  if (!cartStore.initialized) {
    await cartStore.fetchCart()
  }
})

function syncQuantityInputs() {
  const existingKeys = new Set(Object.keys(quantityInputs))
  cartStore.items.forEach((item) => {
    quantityInputs[item.productId] = String(item.quantity)
    existingKeys.delete(String(item.productId))
  })
  existingKeys.forEach((key) => {
    delete quantityInputs[Number(key)]
  })
}

function clampQuantity(quantity: number) {
  return Math.min(CART_QUANTITY_MAX, Math.max(CART_QUANTITY_MIN, quantity))
}

function parseQuantity(value: string): number | null {
  const parsed = Number(value)
  if (!Number.isInteger(parsed)) return null
  if (parsed < CART_QUANTITY_MIN || parsed > CART_QUANTITY_MAX) return null
  return parsed
}

function getDisplayQuantity(item: CartItem) {
  const cached = quantityInputs[item.productId]
  const parsed = cached !== undefined ? parseQuantity(cached) : null
  return parsed ?? item.quantity
}

function getDisplaySubtotal(item: CartItem) {
  return getDisplayQuantity(item) * item.unitPrice
}

async function commitQuantity(item: CartItem, quantity: number) {
  if (updatingId.value === item.productId) return
  updatingId.value = item.productId
  quantityInputs[item.productId] = String(quantity)
  try {
    await cartStore.updateQuantity(item.productId, quantity)
  } catch (err) {
    quantityInputs[item.productId] = String(item.quantity)
    message.warning(getDisplayErrorMessage(err))
  } finally {
    updatingId.value = null
  }
}

async function handleQuantityBlur(productId: number) {
  const item = cartStore.items.find((i) => i.productId === productId)
  if (!item) return

  const parsed = parseQuantity(quantityInputs[productId] ?? '')
  if (parsed === null) {
    quantityInputs[productId] = String(item.quantity)
    message.info(`数量需在 ${CART_QUANTITY_MIN}-${CART_QUANTITY_MAX} 之间哦`)
    return
  }
  if (parsed === item.quantity) return
  await commitQuantity(item, parsed)
}

async function changeQuantity(productId: number, delta: number) {
  const item = cartStore.items.find((i) => i.productId === productId)
  if (!item) return

  const current = getDisplayQuantity(item)
  const target = clampQuantity(current + delta)

  if (target === current) {
    message.info(delta > 0 ? '每件商品最多添加 99 份哦' : '至少保留 1 份吧')
    quantityInputs[productId] = String(item.quantity)
    return
  }

  await commitQuantity(item, target)
}

function confirmRemove(item: CartItem) {
  dialog.warning({
    title: '移除商品',
    content: `确定要把「${item.name}」从购物车移除吗？`,
    positiveText: '确认移除',
    negativeText: '再想想',
    onPositiveClick: async () => {
      removingId.value = item.productId
      try {
        await cartStore.removeItem(item.productId)
        message.success('已从购物车移除')
      } catch (err) {
        message.error(getDisplayErrorMessage(err))
      } finally {
        removingId.value = null
      }
    }
  })
}

function confirmClear() {
  dialog.warning({
    title: '清空购物车',
    content: '确定要清空购物车吗？这一刻的心动都会被清空哦。',
    positiveText: '确认清空',
    negativeText: '再等等',
    onPositiveClick: async () => {
      clearing.value = true
      await cartStore.clearCart()
      clearing.value = false
      message.success('购物车已清空，期待下次相遇')
    }
  })
}

function handleGoShopping() {
  router.push('/menu')
}

function goCheckout() {
  if (cartStore.isEmpty) {
    message.info('购物车还是空的，先去挑选一些好物吧')
    return
  }
  checkoutStore.reset()
  checkoutStore.setSource('cart')
  checkoutStore.setCartSnapshot(cartStore.items)
  checkoutStore.regenerateIdempotencyKey()

  router.push({
    name: 'checkout',
    query: {
      source: 'cart',
      from: route.fullPath || '/cart'
    }
  })
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 lg:py-8 max-w-5xl">
    <div class="page-header glass-card mb-6">
      <div>
        <h1 class="text-2xl font-serif font-bold" style="color: var(--color-text)">购物车</h1>
        <p class="text-sm mt-1" style="color: var(--color-text-secondary)">挑选好物，开启美好时光。</p>
      </div>
      <div v-if="lastSyncedLabel" class="text-xs" style="color: var(--color-text-secondary)">
        上次同步：{{ lastSyncedLabel }}
      </div>
    </div>

    <StateBlock
      v-if="isInitialLoading"
      :loading="true"
      loading-text="正在为您准备购物车..."
    />

    <StateBlock
      v-else-if="cartStore.error && cartStore.isEmpty"
      :error="cartStore.error"
      error-text="购物车加载遇到了小问题"
      @retry="cartStore.fetchCart"
    />

    <EmptyState
      v-else-if="cartStore.isEmpty"
      icon="🛒"
      title="购物车还在打盹"
      description="去看看今日的手冲和小食，为这一刻添点温暖。"
      action-text="去逛逛菜单"
      @action="handleGoShopping"
    />

    <div v-else class="space-y-4">
      <div
        v-for="item in cartStore.items"
        :key="item.productId"
        class="cart-item"
      >
        <div class="flex gap-4">
          <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
            <img
              :src="item.image || '/placeholder-product.png'"
              :alt="item.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-medium text-[var(--color-text)] truncate">{{ item.name }}</p>
                <p class="text-sm text-[var(--color-text-secondary)] mt-1">
                  ￥{{ item.unitPrice.toFixed(2) }} / 件
                </p>
              </div>
              <button
                class="text-sm text-red-500 hover:text-red-600"
                :disabled="removingId === item.productId || updatingId === item.productId"
                @click="confirmRemove(item)"
              >
                删除
              </button>
            </div>

            <div class="flex items-center justify-between mt-4 gap-3">
              <div class="quantity">
                <button
                  class="qty-btn"
                  :disabled="updatingId === item.productId || getDisplayQuantity(item) <= CART_QUANTITY_MIN"
                  @click="changeQuantity(item.productId, -1)"
                >
                  -
                </button>
                <input
                  :disabled="updatingId === item.productId"
                  v-model="quantityInputs[item.productId]"
                  class="qty-input"
                  type="number"
                  inputmode="numeric"
                  min="1"
                  max="99"
                  @blur="handleQuantityBlur(item.productId)"
                />
                <button
                  class="qty-btn"
                  :disabled="updatingId === item.productId || getDisplayQuantity(item) >= CART_QUANTITY_MAX"
                  @click="changeQuantity(item.productId, 1)"
                >
                  +
                </button>
              </div>

              <div class="text-right">
                <p class="text-xs text-[var(--color-text-secondary)]">小计</p>
                <p class="text-lg font-semibold text-[var(--color-primary)]">
                  ￥{{ getDisplaySubtotal(item).toFixed(2) }}
                </p>
                <p v-if="updatingId === item.productId" class="text-xs text-[var(--color-text-secondary)]">
                  同步中...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="summary">
        <div>
          <p class="text-sm text-[var(--color-text-secondary)]">合计</p>
          <p class="text-2xl font-bold text-[var(--color-primary)]">
            ￥{{ optimisticSummary.totalAmount.toFixed(2) }}
          </p>
          <p class="text-xs text-[var(--color-text-secondary)]">
            共 {{ optimisticSummary.totalQty }} 件
          </p>
        </div>
        <div class="actions">
          <button class="btn ghost" :disabled="clearing" @click="confirmClear">
            清空
          </button>
          <button
            class="btn primary"
            :disabled="updatingId !== null || removingId !== null || clearing"
            @click="goCheckout"
          >
            去结算
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
}

.cart-item {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-btn {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.375rem;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  transition: all 0.2s ease;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-input {
  width: 4rem;
  text-align: center;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  background: var(--color-bg);
  color: var(--color-text);
}

.summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1rem;
  position: sticky;
  bottom: 1rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
  width: 100%;
}

.btn.ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.btn.ghost:hover {
  background: var(--glass-bg);
  color: var(--color-text);
}

.btn.primary {
  background: var(--color-primary);
  color: var(--color-bg);
  border-color: transparent;
}

.btn.primary:hover {
  background: var(--color-primary-hover);
}

.btn.primary:disabled,
.btn.ghost:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (min-width: 640px) {
  .summary {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .actions {
    width: auto;
  }
  .btn {
    width: auto;
  }
}
</style>
