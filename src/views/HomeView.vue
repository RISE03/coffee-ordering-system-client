<template>
  <div class="relative min-h-screen w-full overflow-x-hidden transition-colors duration-500">
    <!-- Background Layer -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <div
        class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
        :class="{ 'opacity-100': themeStore.isDawn, 'opacity-0': !themeStore.isDawn }"
        style="background-image: url('/images/backgrounds/dawn-bg.webp')"
      ></div>
      <div
        class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
        :class="{ 'opacity-100': themeStore.isDusk, 'opacity-0': !themeStore.isDusk }"
        style="background-image: url('/images/backgrounds/dusk-bg.webp')"
      ></div>
      <!-- Fallback background color -->
      <div class="absolute inset-0 bg-[#FCF9F2] dark:bg-[#1A2530] -z-10"></div>
    </div>

    <!-- Content Layer -->
    <div class="relative z-10 flex flex-col min-h-screen pb-[80px] md:pb-0">
      <HomeHeader 
        :brand-title="'朝暮'"
        :brand-subtitle="'Dawn & Dusk'"
        :points="points"
        :avatar-url="authStore.user?.avatar"
        :theme="themeStore.activeTheme"
        :is-guest="!authStore.isLoggedIn"
        @toggle-theme="themeStore.toggleTheme()"
        @click-profile="router.push('/profile')"
        @login="router.push('/login')"
      />

      <main class="flex-1 container mx-auto px-4 py-6 space-y-8 max-w-7xl pt-20">
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
                 class="px-4 py-2 bg-[var(--color-primary)] text-white rounded-full text-sm"
               >
                 重试
               </button>
             </div>
          </div>

          <!-- Product Grid -->
          <div v-else-if="productStore.isLoadingProducts" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="i in 4" :key="i" class="h-64 rounded-2xl bg-white/10 animate-pulse backdrop-blur-md"></div>
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
      
      <!-- Mobile Bottom Nav -->
      <BottomNav 
        class="md:hidden" 
        active-key="home"
        :theme="themeStore.activeTheme"
        @navigate="handleBottomNav"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useMessage } from 'naive-ui'
import { getMyPoints } from '@/api/user'
import type { TimeSlotCode } from '@/types/product'
import HomeHeader from '@/components/layout/HomeHeader.vue'
import HeroBanner from '@/components/home/HeroBanner.vue'
import CategoryTabs from '@/components/home/CategoryTabs.vue'
import ProductCard from '@/components/product/ProductCard.vue'
import BottomNav from '@/components/layout/BottomNav.vue'

const router = useRouter()
const themeStore = useThemeStore()
const productStore = useProductStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const message = useMessage()

const points = ref(0)

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

const handleBottomNav = (key: string) => {
  switch (key) {
    case 'home':
      // already here
      break
    case 'menu':
      router.push('/menu')
      break
    case 'orders':
      router.push('/member/orders')
      break
    case 'profile':
      router.push('/profile')
      break
  }
}

// Watch for theme changes to seamlessly update recommendations
watch(() => themeStore.activeTheme, async () => {
  const slotCode = getSlotCodeForTheme()
  await productStore.fetchRecommendedProducts(slotCode)
})

onMounted(async () => {
  const slotCode = getSlotCodeForTheme()
  // Pass the calculated slot code to initialization
  productStore.initializeHomeData(slotCode)
  
  if (authStore.isLoggedIn) {
    try {
      const data = await getMyPoints()
      points.value = data.balance
    } catch (e) {
      console.error('Failed to fetch points', e)
    }
  }
})
</script>

<style scoped>
/* Ensure the background layers cover the entire scrollable area or viewport */
/* The fixed positioning in template handles the background image */
</style>