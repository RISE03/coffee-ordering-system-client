<template>
  <!-- Content for HomeView -->
  <main class="container mx-auto px-4 py-6 space-y-8 max-w-7xl">
    <!-- Hero Section -->
    <HeroBanner 
      :recommended-products="productStore.recommendedProducts"
      :loading="productStore.isLoadingRecommended"
      :slot-title="productStore.timeSlotName"
      :theme="themeStore.activeTheme"
      @add-to-cart="handleAddToCart"
    />

    <!-- Main Content Area -->
    <div class="space-y-6">
      <!-- Category Tabs -->
      <CategoryTabs 
        :categories="productStore.categories"
        :selected-category-id="productStore.selectedCategoryId"
        :theme="themeStore.activeTheme"
        @select="handleCategorySelect"
      />

      <!-- Error State -->
      <div v-if="productStore.hasError" class="text-center py-12">
         <div class="glass-card inline-block px-8 py-6 rounded-xl">
           <p class="text-red-500 mb-4">加载失败</p>
           <button 
             @click="productStore.initializeHomeData()" 
             class="px-4 py-2 bg-[var(--color-primary)] text-white rounded-full text-sm active:scale-95 transition-transform"
           >
             重试
           </button>
         </div>
      </div>

      <!-- Product Grid -->
      <div v-else-if="productStore.isLoadingProducts" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="i in 4" :key="i" class="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
              <NSkeleton class="aspect-square w-full" :sharp="false" />
              <div class="p-3 flex-1 flex flex-col space-y-2">
                <NSkeleton text width="80%" />
                <NSkeleton text width="40%" size="small" />
                <div class="flex justify-between items-center mt-2">
                  <NSkeleton text width="30%" />
                  <NSkeleton circle width="32px" height="32px" />
                </div>
              </div>
            </div>
          </div>

      <div v-else-if="productStore.products.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <ProductCard
          v-for="product in productStore.products"
          :key="product.id"
          :product="product"
          :theme="themeStore.activeTheme"
          @add-to-cart="handleAddToCart"
          @view-detail="(id) => router.push(`/product/${id}`)"
        />
      </div>

      <div v-else class="text-center py-12">
         <div class="glass-card inline-block px-8 py-4 rounded-xl">
           <p class="text-gray-500 dark:text-gray-400">暂无商品</p>
         </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useMessage, NSkeleton } from 'naive-ui'
import type { TimeSlotCode } from '@/types/product'
import HeroBanner from '@/components/home/HeroBanner.vue'
import CategoryTabs from '@/components/home/CategoryTabs.vue'
import ProductCard from '@/components/product/ProductCard.vue'

const router = useRouter()
const themeStore = useThemeStore()
const productStore = useProductStore()
const cartStore = useCartStore()
const message = useMessage()

// Helper to determine if we need to force a specific time slot based on theme/time mismatch
const getSlotCodeForTheme = (): TimeSlotCode | undefined => {
  const hour = new Date().getHours()
  const isDayTime = hour >= 6 && hour < 18
  
  // If Visual Theme is Dawn but it's Night time -> Force 'dawn' content
  if (themeStore.activeTheme === 'dawn' && !isDayTime) {
    return 'dawn'
  } 
  // If Visual Theme is Dusk but it's Day time -> Force 'dusk' content
  else if (themeStore.activeTheme === 'dusk' && isDayTime) {
    return 'dusk'
  }
  
  // Otherwise (Auto mode, or Manual matching real time) -> Let backend decide
  return undefined
}

const handleCategorySelect = async (id: number | null) => {
  if (id === null) {
     // If 'All' is selected, default to the first category for now as store expects a categoryId
     if (productStore.categories.length > 0) {
         const firstCategory = productStore.categories[0]
         if (firstCategory) {
             await productStore.fetchProductsByCategory(firstCategory.id)
         }
     }
  } else {
    await productStore.fetchProductsByCategory(id)
  }
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
  const slotCode = getSlotCodeForTheme()
  // Pass the calculated slot code to initialization
  productStore.initializeHomeData(slotCode)
})
</script>

<style scoped>
/* Scoped styles if needed to override or augment global utilities */
</style>
