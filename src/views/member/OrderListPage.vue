<template>
  <div class="container mx-auto max-w-4xl pb-6">
    <!-- 粘性头部：标题 + 筛选栏 -->
    <div class="sticky-header mb-4">
      <div class="px-4 pt-6 pb-2 flex items-center justify-between">
        <h1 class="text-xl font-bold text-[var(--color-text)]">我的订单</h1>
        <span v-if="totalCount > 0" class="text-xs text-[var(--color-text-secondary)]">
          共 {{ totalCount }} 单
        </span>
      </div>

      <!-- 状态筛选栏 — 横向滚动胶囊 -->
      <div class="filter-bar px-4 pb-3">
        <div class="flex gap-2 overflow-x-auto hide-scrollbar">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            class="filter-chip"
            :class="{ 'filter-chip--active': activeStatus === tab.value }"
            @click="handleStatusChange(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="px-4">
      <!-- 加载态 / 错误态 -->
      <StateBlock
        v-if="(orderStore.loadingList && orders.length === 0) || (orderStore.errorList && orders.length === 0)"
        :loading="orderStore.loadingList && orders.length === 0"
        :error="orderStore.errorList && orders.length === 0 ? orderStore.errorList : null"
        loading-text="正在为您查找订单..."
        error-text="订单加载遇到了小问题"
        :show-retry="true"
        @retry="loadOrders()"
      />

      <!-- 空态 -->
      <EmptyState
        v-else-if="orders.length === 0"
        :icon="emptyIcon"
        :title="emptyDescription"
        :description="emptySubtitle"
        action-text="去逛逛菜单"
        @action="router.push('/menu')"
      />

      <!-- 订单列表 -->
      <div v-else class="space-y-3">
        <div
          v-for="order in orders"
          :key="order.orderNo"
          class="order-card glass-card product-card-hover cursor-pointer"
          :class="getStatusGroup(order.status)"
          @click="goToDetail(order.orderNo)"
        >
          <!-- 顶部状态指示条 -->
          <div class="status-bar" :style="{ backgroundColor: getStatusColor(order.status) }" />

          <div class="p-4">
            <!-- 第一层：状态 + 时间 -->
            <div class="flex items-center justify-between mb-2">
              <span
                class="order-status-badge"
                :style="{
                  color: getStatusColor(order.status),
                  borderColor: getStatusColor(order.status),
                  backgroundColor: getStatusColor(order.status) + '18',
                }"
              >
                {{ getStatusLabel(order.status) }}
              </span>
              <span class="text-xs text-[var(--color-text-secondary)]">
                {{ formatTime(order.createdAt) }}
              </span>
            </div>

            <!-- 第二层：商品预览（主体）+ 订单号 -->
            <p class="font-semibold text-lg text-[var(--color-text)] line-clamp-2 mb-1">
              {{ order.itemsPreview }}
            </p>
            <p class="text-xs text-[var(--color-text-secondary)] opacity-75">
              #{{ order.orderNo.slice(-8) }}
            </p>

            <!-- 订单进度条 -->
            <OrderProgress :status="order.status" />

            <!-- 分隔线 -->
            <div class="my-3 border-t border-[var(--color-border)] opacity-40" />

            <!-- 第三层：金额 + 操作 -->
            <div class="flex items-center justify-between">
              <div class="text-sm text-[var(--color-text-secondary)]">
                <span v-if="order.discountAmount > 0" class="line-through mr-1 opacity-60">
                  ¥{{ order.itemsAmount.toFixed(2) }}
                </span>
                <span class="text-lg font-semibold text-[var(--color-primary)]">
                  ¥{{ order.payAmount.toFixed(2) }}
                </span>
              </div>
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
        </div>

        <!-- 分页控件 -->
        <div v-if="totalPages > 1" class="pagination-bar">
          <button
            class="pagination-btn"
            :disabled="currentPage <= 1 || orderStore.loadingList"
            @click="goToPage(currentPage - 1)"
          >
            ‹ 上一页
          </button>
          <span class="pagination-info">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <button
            class="pagination-btn"
            :disabled="currentPage >= totalPages || orderStore.loadingList"
            @click="goToPage(currentPage + 1)"
          >
            下一页 ›
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { getOrderStatusLabel } from '@/types/order'
import OrderActions from '@/components/member/OrderActions.vue'
import OrderProgress from '@/components/member/OrderProgress.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import StateBlock from '@/components/common/StateBlock.vue'
import type { OrderStatus } from '@/types/order'

const router = useRouter()
const orderStore = useOrderStore()

// 状态筛选标签
const statusTabs = [
  { value: 'all', label: '全部' },
  { value: 'PENDING_PAYMENT', label: '待支付' },
  { value: 'PAID_WAITING', label: '已支付' },
  { value: 'IN_PREPARATION', label: '制作中' },
  { value: 'READY_FOR_PICKUP', label: '待取餐' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
  { value: 'REFUNDING', label: '退款中' },
  { value: 'REFUNDED', label: '已退款' },
]

// 状态颜色映射
const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: '#F59E0B',
  PAID_WAITING: '#3B82F6',
  IN_PREPARATION: '#8B5CF6',
  READY_FOR_PICKUP: '#10B981',
  COMPLETED: '#6B7280',
  CANCELLED: '#9CA3AF',
  REFUNDING: '#F97316',
  REFUNDED: '#9CA3AF',
}

// 响应式状态
const activeStatus = ref<string>(orderStore.activeStatusTab || 'all')
const currentPage = ref(1)
const pageSize = ref(10)

// 计算属性
const orders = computed(() => orderStore.listByStatus[activeStatus.value] || [])
const pageInfo = computed(() => orderStore.pageByStatus[activeStatus.value])
const totalPages = computed(() => {
  const info = pageInfo.value
  if (!info || info.total === 0) return 0
  return Math.ceil(info.total / info.size)
})

// 订单总数
const totalCount = computed(() => {
  const info = pageInfo.value
  return info?.total ?? 0
})

// 空态图标
const emptyIcon = computed(() => {
  switch (activeStatus.value) {
    case 'PENDING_PAYMENT': return '💳'
    case 'PAID_WAITING':
    case 'IN_PREPARATION': return '☕'
    case 'READY_FOR_PICKUP': return '🔔'
    case 'COMPLETED': return '✨'
    case 'CANCELLED': return '📭'
    case 'REFUNDING':
    case 'REFUNDED': return '💸'
    default: return '📋'
  }
})

// 空态文案
const emptyDescription = computed(() => {
  switch (activeStatus.value) {
    case 'PENDING_PAYMENT': return '暂无待支付的订单'
    case 'PAID_WAITING':
    case 'IN_PREPARATION': return '暂无制作中的订单'
    case 'READY_FOR_PICKUP': return '暂无待取餐的订单'
    case 'COMPLETED': return '还没有已完成的订单'
    case 'CANCELLED': return '没有已取消的订单'
    case 'REFUNDING': return '暂无退款中的订单'
    case 'REFUNDED': return '没有已退款的订单'
    default: return '这里还是空的'
  }
})

const emptySubtitle = computed(() => {
  if (activeStatus.value === 'all') {
    return '还没有订单记录，去开启第一段美好时光吧'
  }
  return '换个筛选条件看看，或者去点一杯新的'
})

// 获取状态颜色
function getStatusColor(status: OrderStatus): string {
  return STATUS_COLORS[status] || '#6B7280'
}

// 获取状态分组（用于卡片样式）
function getStatusGroup(status: OrderStatus): string {
  switch (status) {
    case 'PENDING_PAYMENT':
    case 'REFUNDING':
      return 'order-card--attention'
    case 'READY_FOR_PICKUP':
      return 'order-card--ready'
    case 'COMPLETED':
    case 'CANCELLED':
    case 'REFUNDED':
      return 'order-card--done'
    default:
      return ''
  }
}

// 方法
async function loadOrders() {
  const statusFilter = activeStatus.value === 'all'
    ? 'all' as const
    : activeStatus.value as OrderStatus
  await orderStore.fetchList({
    status: statusFilter,
    page: currentPage.value,
    size: pageSize.value,
  })
}

function goToPage(page: number) {
  currentPage.value = page
  loadOrders()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleStatusChange(newStatus: string) {
  activeStatus.value = newStatus
  orderStore.setActiveStatusTab(newStatus)
  currentPage.value = 1
  loadOrders()
}

function goToDetail(orderNo: string) {
  router.push(`/member/orders/${orderNo}`)
}

function handleOrderCancelled() {}

function handleOrderPaid() {
  loadOrders()
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours < 1) {
      const minutes = Math.floor(diff / (60 * 1000))
      return minutes < 1 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  }
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hour}:${minute}`
}

function getStatusLabel(status: OrderStatus): string {
  return getOrderStatusLabel(status)
}

// 生命周期
onMounted(() => {
  activeStatus.value = orderStore.activeStatusTab || 'all'
  currentPage.value = 1
  loadOrders()
})
</script>

<style scoped>
/* 粘性头部 */
.sticky-header {
  position: sticky;
  top: -1px;
  z-index: 20;
  background: var(--color-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--glass-border);
  border-radius: 16px;
}

/* 隐藏滚动条 */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* 筛选胶囊 */
.filter-chip {
  flex-shrink: 0;
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
  color: var(--color-text-secondary);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.filter-chip:hover {
  background: var(--glass-bg-hover);
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.filter-chip--active {
  background: var(--color-primary);
  color: var(--color-bg);
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

/* 订单卡片 */
.order-card {
  overflow: hidden;
  padding: 0;
  transition: box-shadow 0.25s ease, opacity 0.25s ease;
}

/* 状态指示条 */
.status-bar {
  height: 3px;
  width: 100%;
}

/* 需要关注的订单（待支付、退款中）— 微弱琥珀光晕 */
.order-card--attention {
  box-shadow: 0 0 12px color-mix(in srgb, #F59E0B 12%, transparent);
}

/* 待取餐 — 绿色光晕 */
.order-card--ready {
  box-shadow: 0 0 12px color-mix(in srgb, #10B981 12%, transparent);
}

/* 已完成/已取消/已退款 — 轻微降低不透明度 */
.order-card--done {
  opacity: 0.85;
}
.order-card--done:hover {
  opacity: 0.95;
}

/* 状态胶囊 */
.order-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.5;
  border: 1px solid;
}

/* 分页控件 */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 0 8px;
}
.pagination-btn {
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}
.pagination-btn:hover:not(:disabled) {
  background: var(--glass-bg-hover);
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pagination-info {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  min-width: 4em;
  text-align: center;
}
</style>
