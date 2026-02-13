<template>
  <!-- 时间流动主题首页 - 单屏切换式 -->
  <div class="timeflow-home">
    <div class="timeflow-container">
      <!-- 动态时间展示区 -->
      <DynamicTimeHeader />

      <!-- 横向时间轴导航 -->
      <HorizontalTimeline
        :slots="timeflowStore.slots"
        :active-slot="timeflowStore.activeSlot"
        :current-slot="timeflowStore.currentSlot"
        @navigate="handleNavigate"
      />

      <!-- 当前时段内容（带过渡动画） -->
      <Transition name="slide-fade" mode="out-in">
        <div :key="timeflowStore.activeSlot" class="timeflow-content">
          <!-- 时段头部 -->
          <div
            class="timeflow-section-header text-center mb-8"
            :style="{
              backgroundColor: currentDisplaySlotConfig?.colors.glassBg,
              borderColor: currentDisplaySlotConfig?.colors.accent
            }"
          >
            <h2
              class="text-3xl md:text-4xl font-serif font-bold mb-2"
              :style="{ color: currentDisplaySlotConfig?.colors.text }"
            >
              {{ currentDisplaySlotConfig?.name }}
            </h2>
            <p
              class="text-base md:text-lg"
              :style="{ color: currentDisplaySlotConfig?.colors.textSecondary }"
            >
              {{ currentDisplaySlotConfig?.description }}
            </p>

            <!-- 时段专属优惠横幅 -->
            <div
              v-if="currentDisplaySlotConfig?.promotion"
              class="mt-4 inline-flex items-center gap-3 px-5 py-3 rounded-full promotion-banner"
              :style="{
                backgroundColor: currentDisplaySlotConfig.colors.primary + '20',
                borderColor: currentDisplaySlotConfig.colors.accent
              }"
            >
              <span
                v-if="currentDisplaySlotConfig.promotion.tag"
                class="px-2 py-0.5 rounded text-xs font-bold"
                :style="{
                  backgroundColor: currentDisplaySlotConfig.colors.tagBg || currentDisplaySlotConfig.colors.primary,
                  color: currentDisplaySlotConfig.colors.tagText || currentDisplaySlotConfig.colors.text
                }"
              >
                {{ currentDisplaySlotConfig.promotion.tag }}
              </span>
              <span
                class="font-medium"
                :style="{ color: currentDisplaySlotConfig.colors.text }"
              >
                {{ currentDisplaySlotConfig.promotion.title }}
              </span>
            </div>
          </div>

          <!-- Bento Grid 商品布局 -->
          <BentoProductGrid
            v-if="currentDisplaySlotConfig"
            :products="timeflowStore.productsBySlot[timeflowStore.activeSlot]"
            :slot-colors="currentDisplaySlotConfig.colors"
            :loading="timeflowStore.isSlotLoading(timeflowStore.activeSlot)"
            :error="timeflowStore.getSlotError(timeflowStore.activeSlot)"
            :is-open="timeflowStore.isOpen"
            :cart-quantities="cartQuantities"
            @add-to-cart="handleAddToCart"
            @view-detail="handleViewDetail"
            @retry="handleRetry"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTimeFlowStore } from '@/stores/timeflow'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useMessage } from 'naive-ui'
import { TIME_FLOW_SLOTS } from '@/constants/timeflow'
import type { TimeFlowSlot } from '@/types/timeflow'
import DynamicTimeHeader from '@/components/home/DynamicTimeHeader.vue'
import HorizontalTimeline from '@/components/home/HorizontalTimeline.vue'
import BentoProductGrid from '@/components/home/BentoProductGrid.vue'

const router = useRouter()
const timeflowStore = useTimeFlowStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const message = useMessage()

// 获取当前显示时段的配置
const currentDisplaySlotConfig = computed(() => {
  return TIME_FLOW_SLOTS.find(s => s.code === timeflowStore.activeSlot)
})

// 购物车数量映射 { productId: quantity }
const cartQuantities = computed(() => {
  const map: Record<number, number> = {}
  for (const item of cartStore.items) {
    map[item.productId] = item.quantity
  }
  return map
})

/**
 * 处理导航点击
 */
function handleNavigate(slotCode: TimeFlowSlot) {
  // 不再需要滚动，直接切换
  timeflowStore.setActiveSlot(slotCode)
  timeflowStore.loadSlotProducts(slotCode)
  timeflowStore.preloadAdjacentSlots(slotCode)
}

/**
 * 处理加入购物车
 */
async function handleAddToCart(productId: number) {
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

/**
 * 处理查看商品详情
 */
function handleViewDetail(productId: number) {
  router.push({
    path: `/product/${productId}`,
    query: { from: 'home' }
  })
}

/**
 * 处理重试加载
 */
function handleRetry() {
  timeflowStore.retrySlotProducts(timeflowStore.activeSlot)
}

onMounted(async () => {
  // 初始化时间流数据
  await timeflowStore.initialize()
  // 不再需要滚动到当前时段
})
</script>

<style scoped>
.timeflow-home {
  padding: 0 1rem;
}

.timeflow-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 时段头部区域 */
.timeflow-section-header {
  padding: 2rem 2.5rem;
  border-radius: 1.5rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

/* 优惠横幅样式 */
.promotion-banner {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid;
}
</style>
