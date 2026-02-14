<template>
  <div class="container mx-auto px-4 py-6 max-w-7xl">
    <!-- Page Header - Glassmorphism Style -->
    <div class="glass-card p-6 mb-6 relative z-30">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="text-center md:text-left">
          <h1 class="text-2xl font-bold text-[var(--color-text)] mb-2">全日菜单</h1>
          <p class="text-[var(--color-text-secondary)] text-sm">探索我们为您精心准备的美味。</p>
        </div>
        <!-- 搜索栏 -->
        <div class="w-full md:w-80 relative z-40">
          <SearchBar
            v-model="searchKeyword"
            placeholder="搜索商品名称..."
            @search="handleSearch"
            @clear="handleClearSearch"
          />
        </div>
      </div>
    </div>

    <div class="flex flex-col md:flex-row gap-6">
      <!-- Sidebar / Filters - Glassmorphism Style -->
      <aside class="w-full md:w-56 flex-shrink-0">
        <div class="glass-card sticky top-24 p-4">
          <h2 class="font-bold text-lg mb-4 text-[var(--color-text)]">分类</h2>

          <!-- Category Loading State -->
          <div v-if="productStore.isLoadingCategories" class="space-y-2">
            <n-skeleton text v-for="i in 5" :key="i" class="h-8 rounded" />
          </div>

          <!-- Category List -->
          <div v-else class="space-y-2">
            <div
              v-for="category in productStore.categories"
              :key="category.id"
              class="px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-2"
              :class="productStore.selectedCategoryId === category.id
                ? 'bg-[var(--color-primary)] text-[var(--color-bg)] font-medium shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--glass-bg-hover)]'"
              @click="handleCategorySelect(category.id)"
            >
              <img
                v-if="category.icon"
                :src="category.icon"
                class="w-5 h-5 object-contain opacity-80"
                :class="productStore.selectedCategoryId === category.id ? 'brightness-200' : ''"
              />
              <span>{{ category.name }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Product Grid - Glassmorphism Cards -->
      <main class="flex-1 relative z-0">
        <div
          class="product-content"
          :class="{ 'product-content--hidden': !contentVisible }"
        >
          <!-- Products Loading State -->
          <ProductSkeleton v-if="productStore.isLoadingProducts || isSearchingProducts" :count="8" />

          <!-- Empty State -->
          <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
            <div class="glass-card inline-block px-8 py-6 rounded-xl">
              <div class="text-4xl mb-3">{{ searchKeyword ? '🔍' : '☕' }}</div>
              <p class="text-[var(--color-text)] font-medium mb-1">
                {{ searchKeyword ? '未找到相关商品' : '暂无商品' }}
              </p>
              <p class="text-[var(--color-text-secondary)] text-sm">
                {{ searchKeyword ? '试试其他关键词吧' : '敬请期待更多美味' }}
              </p>
              <button
                v-if="searchKeyword"
                @click="handleClearSearch"
                class="mt-4 px-4 py-2 rounded-full glass-button text-sm text-[var(--color-primary)]"
              >
                清除搜索
              </button>
            </div>
          </div>

          <!-- Product Grid -->
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <ProductCard
              v-for="product in filteredProducts"
              :key="product.id"
              :product="product"
              :theme="themeStore.activeTheme"
              :cart-quantity="getCartQuantity(product.id)"
              @add-to-cart="handleAddToCart"
              @remove-from-cart="handleRemoveFromCart"
              @view-detail="handleViewDetail"
            />
          </div>
        </div>
      </main>
    </div>

    <!-- 购物车悬浮球 -->
    <CartFloatingBall v-if="authStore.isLoggedIn" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useThemeStore } from '@/stores/theme'
import { useCartStore, CART_QUANTITY_MIN } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useMessage, NSkeleton } from 'naive-ui'
import { getProducts } from '@/api/products'
import type { Product } from '@/types/product'
import ProductCard from '@/components/product/ProductCard.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import ProductSkeleton from '@/components/common/ProductSkeleton.vue'
import CartFloatingBall from '@/components/common/CartFloatingBall.vue'

const router = useRouter()
const productStore = useProductStore()
const themeStore = useThemeStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const message = useMessage()

// 搜索关键词
const searchKeyword = ref('')
const searchResults = ref<Product[]>([])
const isSearchingProducts = ref(false)

const SEARCH_DEBOUNCE_MS = 250
const SEARCH_RESULT_SIZE = 100
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
let searchRequestId = 0

// 切换分类过渡动画控制（初始隐藏，数据加载后淡入）
const contentVisible = ref(false)

// 过滤后的商品列表
const filteredProducts = computed(() => {
  if (!searchKeyword.value.trim()) {
    return productStore.products
  }
  return searchResults.value
})

const resetSearchState = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = null
  }
  searchRequestId += 1
  isSearchingProducts.value = false
  searchResults.value = []
}

const executeGlobalSearch = async (
  keyword: string,
  showErrorMessage = false
) => {
  const normalizedKeyword = keyword.trim()
  if (!normalizedKeyword) {
    resetSearchState()
    return
  }

  const requestId = ++searchRequestId
  isSearchingProducts.value = true

  try {
    const data = await getProducts({
      keyword: normalizedKeyword,
      size: SEARCH_RESULT_SIZE,
    })

    // 只接收最后一次请求结果，避免旧请求覆盖新输入
    if (requestId !== searchRequestId) {
      return
    }

    searchResults.value = data.list
  } catch (error) {
    if (requestId !== searchRequestId) {
      return
    }

    console.error('搜索商品失败:', error)
    searchResults.value = []
    if (showErrorMessage) {
      message.error('搜索失败，请稍后重试')
    }
  } finally {
    if (requestId === searchRequestId) {
      isSearchingProducts.value = false
    }
  }
}

watch(searchKeyword, (value) => {
  const keyword = value.trim()

  if (!keyword) {
    resetSearchState()
    return
  }

  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  isSearchingProducts.value = true
  searchDebounceTimer = setTimeout(() => {
    void executeGlobalSearch(keyword)
  }, SEARCH_DEBOUNCE_MS)
})

// 获取商品在购物车中的数量
const getCartQuantity = (productId: number): number => {
  const item = cartStore.items.find(item => item.productId === productId)
  return item?.quantity ?? 0
}

const handleCategorySelect = async (categoryId: number) => {
  if (productStore.selectedCategoryId === categoryId) return
  resetSearchState()
  searchKeyword.value = '' // 切换分类时清空搜索
  // 淡出当前内容
  contentVisible.value = false
  await new Promise(resolve => setTimeout(resolve, 300))
  // 加载新数据
  await productStore.fetchProductsByCategory(categoryId)
  // 淡入新内容
  contentVisible.value = true
}

const handleSearch = (keywordFromEvent?: string) => {
  const keyword = (keywordFromEvent ?? searchKeyword.value).trim()
  if (!keyword) {
    resetSearchState()
    return
  }

  // 历史记录点击时，优先使用事件传入关键词，避免读取到旧值
  if (searchKeyword.value !== keyword) {
    searchKeyword.value = keyword
  }

  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = null
  }

  void executeGlobalSearch(keyword, true)
}

const handleViewDetail = (productId: number) => {
  router.push({
    path: `/product/${productId}`,
    query: { from: 'menu' }
  })
}

const handleClearSearch = () => {
  searchKeyword.value = ''
  resetSearchState()
}

const handleAddToCart = async (productId: number) => {
  // 检查登录状态
  if (!authStore.isLoggedIn) {
    message.warning('请先登录后再添加购物车')
    router.push('/login')
    return
  }

  try {
    await cartStore.addItem({
      productId: productId,
      quantity: 1
    })
    message.success('已加入购物车')
  } catch {
    message.error('添加失败，请重试')
  }
}

const handleRemoveFromCart = async (productId: number) => {
  // 检查登录状态
  if (!authStore.isLoggedIn) {
    message.warning('请先登录后再操作')
    router.push('/login')
    return
  }

  try {
    const currentQty = getCartQuantity(productId)
    if (currentQty <= CART_QUANTITY_MIN) {
      // 数量为 1 时，移除商品
      await cartStore.removeItem(productId)
      message.success('已从购物车移除')
    } else {
      // 数量大于 1 时，减少数量
      await cartStore.updateQuantity(productId, currentQty - 1)
    }
  } catch {
    message.error('操作失败，请重试')
  }
}

onMounted(async () => {
  // 若分类未加载，则先拉取分类
  if (productStore.categories.length === 0) {
    await productStore.fetchCategories()
  }

  // 取当前选中分类；若未选中则回退到第一个分类（Store 内也会默认选中第一个）
  const categoryId =
    productStore.selectedCategoryId ?? productStore.categories[0]?.id

  if (typeof categoryId === 'number') {
    await productStore.fetchProductsByCategory(categoryId)
  }

  // 数据就绪后触发入场动画
  contentVisible.value = true

  // 已登录用户拉取购物车数据
  if (authStore.isLoggedIn && !cartStore.initialized) {
    await cartStore.fetchCart()
  }
})

onBeforeUnmount(() => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
})
</script>

<style scoped>
.product-content {
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: 1;
}

.product-content--hidden {
  opacity: 0;
  transform: translateY(30px);
}
</style>
