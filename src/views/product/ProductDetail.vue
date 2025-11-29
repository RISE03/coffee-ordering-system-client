<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Back Button -->
    <div class="mb-4">
      <n-button text @click="router.back()">
        ← 返回菜单
      </n-button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <n-spin size="large" />
      <p class="mt-4 text-[var(--color-text-secondary)]">正在加载商品信息...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <n-result status="error" title="加载失败" :description="error">
        <template #footer>
          <n-button @click="loadProduct">重试</n-button>
          <n-button @click="router.push('/menu')" class="ml-2">
            返回菜单
          </n-button>
        </template>
      </n-result>
    </div>

    <!-- Product Detail -->
    <div v-else-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Product Image -->
      <div class="aspect-square rounded-2xl overflow-hidden bg-[var(--color-bg-secondary)]">
        <img
          :src="product.image || '/placeholder-product.png'"
          :alt="product.name"
          class="w-full h-full object-cover"
        />
      </div>

      <!-- Product Info -->
      <div class="space-y-6">
        <!-- Name & Price -->
        <div>
          <h1 class="text-2xl font-bold text-[var(--color-text)]">
            {{ product.name }}
          </h1>
          <p class="text-3xl font-bold text-[var(--color-primary)] mt-2">
            ¥{{ product.price.toFixed(2) }}
          </p>
        </div>

        <!-- Description -->
        <div v-if="product.description" class="text-[var(--color-text-secondary)]">
          {{ product.description }}
        </div>

        <!-- Time Period Tags -->
        <div v-if="product.timePeriods?.length" class="flex gap-2 flex-wrap">
          <n-tag
            v-for="period in product.timePeriods"
            :key="period"
            :type="getTimePeriodType(period)"
            size="small"
          >
            {{ getTimePeriodLabel(period) }}
          </n-tag>
        </div>

        <!-- Quantity Selector -->
        <div class="flex items-center gap-4">
          <span class="text-[var(--color-text)]">数量</span>
          <div class="flex items-center gap-2">
            <n-button
              size="small"
              circle
              :disabled="quantity <= 1"
              @click="quantity--"
            >
              <template #icon>
                <span class="text-lg">−</span>
              </template>
            </n-button>

            <n-input-number
              v-model:value="quantity"
              :min="1"
              :max="99"
              :show-button="false"
              size="small"
              class="w-16 text-center"
            />

            <n-button
              size="small"
              circle
              :disabled="quantity >= 99"
              @click="quantity++"
            >
              <template #icon>
                <span class="text-lg">+</span>
              </template>
            </n-button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4 pt-4">
          <n-button
            size="large"
            class="flex-1"
            :loading="addingToCart"
            :disabled="!product.available"
            @click="handleAddToCart"
          >
            加入购物车
          </n-button>
          <n-button
            type="primary"
            size="large"
            class="flex-1"
            :disabled="!product.available"
            @click="handleBuyNow"
          >
            立即购买
          </n-button>
        </div>

        <!-- Unavailable Notice -->
        <div v-if="!product.available" class="text-center text-red-500">
          该商品暂时不可购买
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  useMessage,
  NSpin,
  NResult,
  NButton,
  NTag,
  NInputNumber,
} from 'naive-ui'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
import apiClient from '@/api/client'
import { getDisplayErrorMessage } from '@/utils/error'
import type { CartItem } from '@/types/cart'

// Product interface (simplified for this component)
interface Product {
  id: number
  name: string
  price: number
  image: string
  description?: string
  available: boolean
  timePeriods?: string[]
}

const route = useRoute()
const router = useRouter()
const message = useMessage()
const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const product = ref<Product | null>(null)
const quantity = ref(1)
const addingToCart = ref(false)

// Methods
async function loadProduct() {
  const productId = route.params.id as string
  if (!productId) {
    error.value = '商品ID无效'
    return
  }

  loading.value = true
  error.value = null

  try {
    // 从后端获取商品详情
    const { data } = await apiClient.get<Product>(`/products/${productId}`)
    product.value = data
  } catch (err: any) {
    error.value = getDisplayErrorMessage(err)
  } finally {
    loading.value = false
  }
}

async function handleAddToCart() {
  if (!product.value) return

  addingToCart.value = true
  try {
    const item: CartItem = {
      productId: product.value.id,
      name: product.value.name,
      image: product.value.image,
      unitPrice: product.value.price,
      quantity: quantity.value,
      subtotal: product.value.price * quantity.value
    }
    const success = await cartStore.addItem(item)
    if (success) {
      message.success(`已添加 ${quantity.value} 件「${product.value.name}」到购物车`)
    }
  } catch (err) {
    message.error(getDisplayErrorMessage(err))
  } finally {
    addingToCart.value = false
  }
}

function handleBuyNow() {
  if (!product.value) return

  // 构建一次性结算快照，不触碰购物车
  const item: CartItem = {
    productId: product.value.id,
    name: product.value.name,
    image: product.value.image,
    unitPrice: product.value.price,
    quantity: quantity.value,
    subtotal: product.value.price * quantity.value
  }

  checkoutStore.setBuyNowSnapshot(item, router.currentRoute.value.fullPath)

  // 跳转到结算页并标记来源为 buyNow
  router.push({
    path: '/member/checkout',
    query: {
      source: 'buyNow',
      from: router.currentRoute.value.fullPath
    },
  })
}

function getTimePeriodLabel(period: string): string {
  const labels: Record<string, string> = {
    dawn: '晨曦推荐',
    midday: '午间推荐',
    dusk: '晚霞推荐',
  }
  return labels[period] || period
}

function getTimePeriodType(period: string): 'default' | 'info' | 'success' | 'warning' {
  const types: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
    dawn: 'warning',
    midday: 'info',
    dusk: 'success',
  }
  return types[period] || 'default'
}

// Lifecycle
onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
:deep(.n-input-number) {
  --n-text-color: var(--color-text);
}

:deep(.n-input-number .n-input__input-el) {
  text-align: center;
}
</style>
