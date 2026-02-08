<template>
  <div class="detail-page container mx-auto px-4 py-8 max-w-4xl">
    <!-- 返回按钮 -->
    <div class="mb-4">
      <n-button
        text
        class="back-btn"
        @click="router.back()"
      >
        ← 返回菜单
      </n-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="glass-card-strong text-center py-12 px-6">
      <n-spin size="large" />
      <p class="mt-4 text-[var(--color-text-secondary)]">正在加载商品信息...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="glass-card-strong text-center py-12 px-6">
      <n-result status="error" title="加载失败" :description="error">
        <template #footer>
          <n-button @click="loadProduct">重试</n-button>
          <n-button @click="router.push('/menu')" class="ml-2">
            返回菜单
          </n-button>
        </template>
      </n-result>
    </div>

    <!-- 商品详情 -->
    <div v-else-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- 商品图片 -->
      <div class="product-image-wrapper">
        <img
          :src="getProductImage(product)"
          :alt="product.name"
          class="w-full h-full object-cover"
        />
      </div>

      <!-- 商品信息 -->
      <div class="glass-card-strong product-info-card">
        <!-- 名称 & 价格 -->
        <div>
          <h1 class="text-2xl font-bold text-[var(--color-text)]">
            {{ product.name }}
          </h1>
          <p class="text-3xl font-bold text-[var(--color-primary)] mt-2">
            ¥{{ product.price.toFixed(2) }}
          </p>
        </div>

        <!-- 描述 -->
        <div v-if="product.description" class="product-description">
          {{ product.description }}
        </div>

        <!-- 时间段标签 -->
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

        <!-- 分隔线 -->
        <div class="divider"></div>

        <!-- 数量选择器 -->
        <div class="flex items-center gap-4">
          <span class="text-[var(--color-text)] font-medium">数量</span>
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

        <!-- 操作按钮 -->
        <div class="flex gap-4 pt-2">
          <n-button
            size="large"
            class="flex-1"
            :loading="addingToCart"
            :disabled="!isProductAvailable(product)"
            @click="handleAddToCart"
          >
            加入购物车
          </n-button>
          <n-button
            type="primary"
            size="large"
            class="flex-1"
            :disabled="!isProductAvailable(product)"
            @click="handleBuyNow"
          >
            立即购买
          </n-button>
        </div>

        <!-- 不可购买提示 -->
        <div v-if="!isProductAvailable(product)" class="text-center text-red-500">
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
  imageUrl?: string
  image?: string
  status?: number
  available?: boolean
  description?: string
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

function getProductImage(item: Product): string {
  return item.imageUrl || item.image || '/placeholder-product.png'
}

function isProductAvailable(item: Product | null): boolean {
  if (!item) {
    return false
  }
  if (typeof item.available === 'boolean') {
    return item.available
  }
  if (typeof item.status === 'number') {
    return item.status === 1
  }
  return true
}

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
    const { data } = await apiClient.get<Product>(`/products/${productId}`, {
      // 详情接口异常不应触发全局登出，交由页面自身兜底展示
      skipAuthRedirect: true
    } as any)
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
      image: getProductImage(product.value),
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
    image: getProductImage(product.value),
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
/* 页面整体：垂直居中（减去顶部导航和底部导航的空间） */
.detail-page {
  min-height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
/* 返回按钮：加玻璃背景胶囊 */
.back-btn {
  padding: 0.4rem 1rem;
  border-radius: 999px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur-sm);
  -webkit-backdrop-filter: var(--glass-blur-sm);
  border: 1px solid var(--glass-border-subtle);
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.back-btn:hover {
  background: var(--glass-bg-hover);
  box-shadow: var(--glass-shadow);
}

/* 商品图片：圆角 + 阴影增强视觉重量 */
.product-image-wrapper {
  aspect-ratio: 1;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--glass-shadow-hover);
}

/* 信息卡片：撑满高度，内容垂直居中 */
.product-info-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.25rem;
  padding: 1.75rem;
}

/* 商品描述文字 */
.product-description {
  color: var(--color-text-secondary);
  line-height: 1.7;
}

/* 分隔线 */
.divider {
  height: 1px;
  background: var(--glass-border-subtle);
}

:deep(.n-input-number) {
  --n-text-color: var(--color-text);
}

:deep(.n-input-number .n-input__input-el) {
  text-align: center;
}
</style>
