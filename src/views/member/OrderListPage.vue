<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-2xl font-bold mb-6 text-[var(--color-text)]">我的订单</h1>

    <!-- Status Filter Tabs -->
    <div class="mb-6 overflow-x-auto">
      <n-tabs v-model:value="activeStatus" type="line" @update:value="handleStatusChange">
        <n-tab name="all">全部</n-tab>
        <n-tab name="PENDING_PAYMENT">待支付</n-tab>
        <n-tab name="PAID_WAITING">已支付</n-tab>
        <n-tab name="IN_PREPARATION">制作中</n-tab>
        <n-tab name="READY_FOR_PICKUP">待取餐</n-tab>
        <n-tab name="COMPLETED">已完成</n-tab>
        <n-tab name="CANCELLED">已取消</n-tab>
        <n-tab name="REFUNDING">退款中</n-tab>
        <n-tab name="REFUNDED">已退款</n-tab>
      </n-tabs>
    </div>

    <!-- Loading State -->
    <div v-if="orderStore.loadingList && orders.length === 0" class="text-center py-12">
      <n-spin size="large" />
      <p class="mt-4 text-[var(--color-text-secondary)]">正在为您查找订单...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="orderStore.errorList && orders.length === 0" class="text-center py-12">
      <n-result status="error" title="订单加载遇到了小问题" :description="orderStore.errorList">
        <template #footer>
          <n-button @click="() => loadOrders()">重新加载</n-button>
        </template>
      </n-result>
    </div>

    <!-- Empty State -->
    <div v-else-if="orders.length === 0" class="text-center py-12">
      <n-empty :description="emptyDescription">
        <template #extra>
          <p class="text-[var(--color-text-secondary)] mb-4">
            {{ emptySubtitle }}
          </p>
          <n-button type="primary" @click="router.push('/menu')">
            去逛逛菜单
          </n-button>
        </template>
      </n-empty>
    </div>

    <!-- Order List -->
    <div v-else class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.orderNo"
        class="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4 cursor-pointer hover:border-[var(--color-primary)] transition-colors"
        @click="goToDetail(order.orderNo)"
      >
        <!-- Order Header -->
        <div class="flex justify-between items-start mb-3">
          <div>
            <span class="text-sm text-[var(--color-text-secondary)]">
              订单号：{{ order.orderNo }}
            </span>
            <span class="mx-2 text-[var(--color-border)]">|</span>
            <span class="text-sm text-[var(--color-text-secondary)]">
              {{ formatTime(order.createdAt) }}
            </span>
          </div>
          <n-tag :type="getStatusType(order.status)" size="small" :bordered="false">
            {{ getStatusLabel(order.status) }}
          </n-tag>
        </div>

        <!-- Order Items Preview -->
        <div class="mb-3">
          <p class="text-[var(--color-text)] text-sm line-clamp-2">{{ order.itemsPreview }}</p>
        </div>

        <!-- Order Footer -->
        <div class="flex justify-between items-center mt-4">
          <div class="text-[var(--color-text-secondary)] text-sm">
            <span v-if="order.discountAmount > 0" class="line-through mr-2 opacity-75">
              ¥{{ order.itemsAmount.toFixed(2) }}
            </span>
            <span>实付 </span>
            <span class="text-lg font-semibold text-[var(--color-primary)]">
              ¥{{ order.payAmount.toFixed(2) }}
            </span>
          </div>

          <!-- Actions -->
          <div @click.stop>
            <OrderActions
              :order-no="order.orderNo"
              :status="order.status"
              :show-view-detail="true"
              context="list"
              @cancelled="handleOrderCancelled"
              @paid="handleOrderPaid"
            />
          </div>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="hasMore" class="text-center py-6">
        <n-button
          :loading="orderStore.loadingList"
          :disabled="orderStore.loadingList"
          ghost
          @click="loadMore"
        >
          加载更多
        </n-button>
      </div>
      <div v-else-if="orders.length > 0" class="text-center py-6 text-[var(--color-text-secondary)] text-sm">
        已经到底啦
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NSpin,
  NResult,
  NButton,
  NEmpty,
  NTabs,
  NTab,
  NTag,
} from 'naive-ui'
import { useOrderStore } from '@/stores/order'
import { getOrderStatusLabel, ORDER_STATUS_MAP } from '@/types/order'
import OrderActions from '@/components/member/OrderActions.vue'
import type { OrderStatus } from '@/types/order'

const router = useRouter()
const orderStore = useOrderStore()

// State - 使用 store 的 activeStatusTab 保持状态
const activeStatus = ref<string>(orderStore.activeStatusTab || 'all')
const currentPage = ref(1)
const pageSize = ref(10)

// Computed
const orders = computed(() => orderStore.listByStatus[activeStatus.value] || [])
const pageInfo = computed(() => orderStore.pageByStatus[activeStatus.value])
const hasMore = computed(() => {
  const info = pageInfo.value
  if (!info) return false
  return orders.value.length < info.total
})

// 空态文案 - 品牌语气
const emptyDescription = computed(() => {
  switch (activeStatus.value) {
    case 'PENDING_PAYMENT':
      return '暂无待支付的订单'
    case 'PAID_WAITING':
    case 'IN_PREPARATION':
      return '暂无制作中的订单'
    case 'READY_FOR_PICKUP':
      return '暂无待取餐的订单'
    case 'COMPLETED':
      return '还没有已完成的订单'
    case 'CANCELLED':
      return '没有已取消的订单'
    case 'REFUNDING':
      return '暂无退款中的订单'
    case 'REFUNDED':
      return '没有已退款的订单'
    default:
      return '这里还是空的'
  }
})

const emptySubtitle = computed(() => {
  if (activeStatus.value === 'all') {
    return '还没有订单记录，去开启第一段美好时光吧'
  }
  return '换个筛选条件看看，或者去点一杯新的'
})

// Methods
async function loadOrders(reset = true) {
  if (reset) {
    currentPage.value = 1
  }

  const statusFilter = activeStatus.value === 'all'
    ? 'all' as const
    : activeStatus.value as OrderStatus

  await orderStore.fetchList({
    status: statusFilter,
    page: currentPage.value,
    size: pageSize.value,
    append: !reset,
  })
}

function loadMore() {
  currentPage.value++
  loadOrders(false)
}

function handleStatusChange(newStatus: string) {
  activeStatus.value = newStatus
  orderStore.setActiveStatusTab(newStatus)

  // 如果该状态没有缓存，则加载
  if (!orderStore.listByStatus[newStatus]) {
    currentPage.value = 1
    loadOrders(true)
  } else {
    // 恢复该状态的页码
    const page = orderStore.pageByStatus[newStatus]
    if (page) {
      currentPage.value = page.page
    }
  }
}

function goToDetail(orderNo: string) {
  router.push(`/member/orders/${orderNo}`)
}

function handleOrderCancelled() {
  // Store 已自动更新状态，这里可以做额外提示
}

function handleOrderPaid() {
  // 支付成功后刷新列表以获取最新状态
  loadOrders(true)
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // Within 24 hours, show relative time
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours < 1) {
      const minutes = Math.floor(diff / (60 * 1000))
      return minutes < 1 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  }

  // Otherwise show date
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hour}:${minute}`
}

function getStatusLabel(status: OrderStatus): string {
  return getOrderStatusLabel(status)
}

function getStatusType(status: OrderStatus): 'default' | 'info' | 'success' | 'warning' | 'error' {
  const colorMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    warning: 'warning',
    info: 'info',
    success: 'success',
    default: 'default',
    error: 'error',
  }
  const color = ORDER_STATUS_MAP[status]?.color || 'default'
  return colorMap[color] || 'default'
}

// Lifecycle
onMounted(() => {
  // 恢复上次的 tab 状态
  activeStatus.value = orderStore.activeStatusTab || 'all'

  // 如果当前 tab 没有数据，则加载
  if (!orderStore.listByStatus[activeStatus.value]) {
    loadOrders()
  }
})
</script>

<style scoped>
:deep(.n-tabs .n-tabs-tab) {
  color: var(--color-text-secondary);
}
:deep(.n-tabs .n-tabs-tab--active) {
  color: var(--color-primary);
}
</style>