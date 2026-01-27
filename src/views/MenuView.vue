<template>
  <div class="container mx-auto px-4 py-6 max-w-7xl">
    <!-- Page Header - Glassmorphism Style -->
    <div class="glass-card p-6 mb-6 text-center md:text-left">
      <h1 class="text-2xl font-bold text-[var(--color-text)] mb-2">全日菜单</h1>
      <p class="text-[var(--color-text-secondary)] text-sm mb-4">探索我们为您精心准备的美味。</p>
      <div class="flex flex-wrap gap-3 justify-center md:justify-start">
        <button
          class="glass-button text-sm font-medium text-[var(--color-primary)]"
          @click="$router.push('/member/cart')"
        >
          前往购物车
        </button>
        <button
          class="glass-button text-sm font-medium text-[var(--color-text-secondary)]"
          @click="$router.push('/member/checkout')"
        >
          去结算
        </button>
        <button
          class="glass-button text-sm font-medium text-[var(--color-text-secondary)]"
          @click="$router.push('/member/orders')"
        >
          我的订单
        </button>
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
                ? 'bg-[var(--color-primary)] text-white font-medium shadow-sm'
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
      <main class="flex-1">
        <!-- Products Loading State -->
        <div v-if="productStore.isLoadingProducts" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div v-for="i in 6" :key="i" class="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
            <n-skeleton class="aspect-square w-full" :sharp="false" />
            <div class="p-3 flex-1 flex flex-col space-y-2">
              <n-skeleton text width="80%" />
              <n-skeleton text width="40%" size="small" />
              <div class="flex justify-between items-center mt-2">
                <n-skeleton text width="30%" />
                <n-skeleton circle width="32px" height="32px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="productStore.products.length === 0" class="text-center py-12">
           <div class="glass-card inline-block px-8 py-4 rounded-xl">
             <p class="text-[var(--color-text-secondary)]">暂无商品</p>
           </div>
        </div>

        <!-- Product Grid -->
        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <ProductCard
            v-for="product in productStore.products"
            :key="product.id"
            :product="product"
            :theme="themeStore.activeTheme"
            @add-to-cart="handleAddToCart"
            @view-detail="(id) => router.push(`/product/${id}`)"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useThemeStore } from '@/stores/theme'
import { useCartStore } from '@/stores/cart'
import { useMessage, NSkeleton } from 'naive-ui'
import ProductCard from '@/components/product/ProductCard.vue'

const router = useRouter()
const productStore = useProductStore()
const themeStore = useThemeStore()
const cartStore = useCartStore()
const message = useMessage()

const handleCategorySelect = async (categoryId: number) => {
  await productStore.fetchProductsByCategory(categoryId)
}

const handleAddToCart = async (productId: number) => {
  try {
    await cartStore.addItem({
      productId: productId,
      quantity: 1
    })
    message.success('已加入购物车')
  } catch (error) {
    message.error('添加失败，请重试')
  }
}

onMounted(async () => {
  // Initialize categories if not already loaded
  if (productStore.categories.length === 0) {
    await productStore.fetchCategories()
  }
  
  // If we have a selected category, refresh its products, otherwise fetch the first category's products
  if (productStore.selectedCategoryId) {
    await productStore.fetchProductsByCategory(productStore.selectedCategoryId)
  } else if (productStore.categories.length > 0) {
     await productStore.fetchProductsByCategory(productStore.categories[0].id)
  }
})
</script>
