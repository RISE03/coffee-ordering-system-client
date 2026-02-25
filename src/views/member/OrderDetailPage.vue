<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Back Button -->
    <div class="mb-4">
      <n-button text @click="goBack" class="back-button">
        ← 返回列表
      </n-button>
    </div>

    <!-- Loading State -->
    <div v-if="orderStore.loadingDetail && !order" class="text-center py-12">
      <n-spin size="large" />
      <p class="mt-4 text-[var(--color-text-secondary)]">正在为您查找订单详情...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="orderStore.errorDetail && !order" class="text-center py-12">
      <n-result status="error" title="订单加载遇到了小问题" :description="orderStore.errorDetail">
        <template #footer>
          <n-button @click="loadOrder">重新加载</n-button>
          <n-button @click="router.push('/member/orders')" class="ml-2">
            返回订单列表
          </n-button>
        </template>
      </n-result>
    </div>

    <!-- Order Detail -->
    <div v-else-if="order" class="space-y-6 pb-10">
      <!-- Order Header -->
      <div class="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h1 class="text-xl font-bold text-[var(--color-text)]">
              订单详情
            </h1>
            <p class="text-sm text-[var(--color-text-secondary)] mt-1">
              订单号：{{ order.orderNo }}
            </p>
          </div>
          <span
            class="order-status-badge"
            :style="{
              color: getStatusColor(order.status),
              borderColor: getStatusColor(order.status),
              backgroundColor: getStatusColor(order.status) + '18',
            }"
          >
            {{ order.status === 'READY_FOR_PICKUP' && order.pickupInfo.type === 'DELIVERY' ? '待配送' : getOrderStatusLabel(order.status) }}
          </span>
        </div>

        <!-- Actions Section -->
        <div class="mt-4 pt-4 border-t border-[var(--color-border)]">
          <!-- 退款拒绝原因提示 -->
          <div v-if="refundRejectReason" class="refund-reject-alert mb-4">
            <div class="refund-reject-title">退款申请未通过</div>
            <div class="refund-reject-reason">{{ refundRejectReason }}</div>
          </div>
          <OrderActions
            :order-no="order.orderNo"
            :status="order.status"
            :complete-time="getCompleteTime(order.timeline)"
            context="detail"
            @cancelled="handleCancelled"
            @paid="handlePaid"
            @refunded="handleRefunded"
            @refund-cancelled="handleRefundCancelled"
          />
        </div>
      </div>

      <!-- Order Progress -->
      <div class="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-6">
        <h3 class="font-medium text-[var(--color-text)] mb-2">订单状态</h3>
        <OrderProgress :status="order.status" :timeline="order.timeline" :pickup-type="order.pickupInfo.type === 'DELIVERY' ? 1 : 0" />
      </div>

      <!-- Pickup Info -->
      <div class="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-6">
        <h3 class="font-medium text-[var(--color-text)] mb-4">
          {{ order.pickupInfo.type === 'SELF_PICKUP' ? '取餐信息' : '配送信息' }}
        </h3>
        <div class="space-y-3 text-[var(--color-text-secondary)]">
          <div class="flex">
            <span class="w-20 flex-shrink-0">联系人：</span>
            <span class="text-[var(--color-text)]">{{ order.pickupInfo.name }}</span>
          </div>
          <div class="flex">
            <span class="w-20 flex-shrink-0">手机号：</span>
            <span class="text-[var(--color-text)]">{{ order.pickupInfo.phone }}</span>
          </div>
          <div v-if="order.pickupInfo.pickupCode" class="flex items-center">
            <span class="w-20 flex-shrink-0">取餐码：</span>
            <span class="text-2xl font-bold text-[var(--color-primary)]">
              {{ order.pickupInfo.pickupCode }}
            </span>
          </div>
          <div v-if="order.pickupInfo.address" class="flex">
            <span class="w-20 flex-shrink-0">地址：</span>
            <span class="text-[var(--color-text)]">{{ order.pickupInfo.address }}</span>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-6">
        <h3 class="font-medium text-[var(--color-text)] mb-4">商品清单</h3>
        <div class="space-y-4">
          <div
            v-for="(item, index) in order.items"
            :key="index"
            class="flex items-center gap-4"
          >
            <div class="w-16 h-16 rounded-lg overflow-hidden bg-[var(--color-bg)] flex-shrink-0 border border-[var(--color-border)]">
              <img
                :src="item.image || '/placeholder-product.png'"
                :alt="item.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start">
                <span class="text-[var(--color-text)] font-medium truncate">{{ item.name }}</span>
                <span class="text-[var(--color-text-secondary)] ml-2">x{{ item.quantity }}</span>
              </div>
              <div class="flex justify-between mt-1">
                <span class="text-sm text-[var(--color-text-secondary)]">
                  ¥{{ item.unitPrice.toFixed(2) }}
                </span>
                <span class="text-[var(--color-primary)] font-medium">
                  ¥{{ item.subtotal.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Coupon Info -->
      <div v-if="order.coupon" class="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-6 flex justify-between items-center">
        <h3 class="font-medium text-[var(--color-text)]">优惠券</h3>
        <div class="text-right">
          <div class="text-[var(--color-text-secondary)] text-sm">{{ order.coupon.name }}</div>
          <div class="text-[var(--color-primary)] font-medium">
            -¥{{ order.coupon.discountAmount.toFixed(2) }}
          </div>
        </div>
      </div>

      <!-- Price Breakdown -->
      <div class="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-6">
        <h3 class="font-medium text-[var(--color-text)] mb-4">订单金额</h3>
        <div class="space-y-2">
          <div class="flex justify-between text-[var(--color-text-secondary)]">
            <span>商品金额</span>
            <span>¥{{ order.priceBreakdown.itemsAmount.toFixed(2) }}</span>
          </div>
          <div
            v-if="order.priceBreakdown.discountAmount > 0"
            class="flex justify-between text-[var(--color-primary)]"
          >
            <span>优惠券抵扣</span>
            <span>-¥{{ order.priceBreakdown.discountAmount.toFixed(2) }}</span>
          </div>
          <div class="border-t border-[var(--color-border)] my-3"></div>
          <div class="flex justify-between items-center">
            <span class="text-[var(--color-text)] font-medium">
              {{ isPaid ? '实付金额' : '应付金额' }}
            </span>
            <span class="text-xl font-bold text-[var(--color-primary)]">
              ¥{{ order.priceBreakdown.payAmount.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Points Info - 光阴值 -->
      <div v-if="order.pointsEarned || order.pointsEstimate" class="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-lg">✦</span>
          <span v-if="order.pointsEarned" class="text-[var(--color-text)]">
            本单已为您带来 <strong class="text-[var(--color-primary)]">+{{ order.pointsEarned }}</strong> 光阴值
          </span>
          <span v-else-if="order.pointsEstimate" class="text-[var(--color-text-secondary)]">
            完成订单后，预计为您带来 <strong class="text-[var(--color-primary)]">+{{ order.pointsEstimate }}</strong> 光阴值
          </span>
        </div>
      </div>

      <!-- Remark -->
      <div v-if="order.remark" class="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-6">
        <h3 class="font-medium text-[var(--color-text)] mb-2">备注</h3>
        <p class="text-[var(--color-text-secondary)]">{{ order.remark }}</p>
      </div>

      <!-- Order Time Footer -->
      <div class="order-footer-time">
        下单时间：{{ formatFullTime(order.createdAt) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NSpin,
  NResult,
  NButton,
} from 'naive-ui'
import { useOrderStore } from '@/stores/order'
import { getOrderStatusLabel } from '@/types/order'
import OrderActions from '@/components/member/OrderActions.vue'
import OrderProgress from '@/components/member/OrderProgress.vue'
import type { OrderDetailResponse, OrderStatus } from '@/types/order'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

// State
const order = ref<OrderDetailResponse | null>(null)

// Computed
const isPaid = computed(() => {
  if (!order.value) return false
  return ['PAID_WAITING', 'IN_PREPARATION', 'READY_FOR_PICKUP', 'COMPLETED', 'REFUNDING', 'REFUNDED'].includes(order.value.status)
})

// 退款拒绝原因（优先取接口返回的，SSE 缓存作为补充）
const refundRejectReason = computed(() => {
  if (!order.value) return ''
  return order.value.refundRejectReason || orderStore.refundRejectReasons[order.value.orderNo] || ''
})

// Methods
async function loadOrder() {
  const orderNo = route.params.orderNo as string
  if (!orderNo) {
    orderStore.errorDetail = '订单号无效'
    return
  }

  try {
    const data = await orderStore.fetchDetail(orderNo, true) // 强制刷新获取最新数据
    order.value = data
  } catch (err) {
    // Error already handled by store
  }
}

function handleCancelled() {
  // 重新加载订单详情以获取最新状态
  loadOrder()
}

function handlePaid() {
  // 支付后重新加载
  loadOrder()
}

function handleRefunded() {
  // 退款申请成功后重新加载订单详情
  loadOrder()
}

function handleRefundCancelled() {
  // 撤销退款后重新加载订单详情
  loadOrder()
}

function goBack() {
  // 返回订单列表
  router.push('/member/orders')
}

// 从 timeline 中提取完成时间
function getCompleteTime(timeline: OrderDetailResponse['timeline']): string | undefined {
  const completeEvent = timeline.find(e => e.status === 'COMPLETED')
  return completeEvent?.time
}

function formatFullTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    const second = date.getSeconds().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  } catch (e) {
    return dateStr
  }
}

function getStatusColor(status: OrderStatus): string {
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
  return STATUS_COLORS[status] || '#6B7280'
}

// 监听路由参数变化

// 监听 store 中详情缓存的更新（SSE 推送后 store 会刷新详情）
watch(
  () => {
    const orderNo = route.params.orderNo as string
    return orderNo ? orderStore.detailMap[orderNo] : undefined
  },
  (newDetail) => {
    if (newDetail && order.value && newDetail.orderNo === order.value.orderNo) {
      order.value = newDetail
    }
  }
)

// 监听路由参数变化，支持在详情页之间直接切换
watch(
  () => route.params.orderNo,
  (newOrderNo) => {
    if (newOrderNo) {
      loadOrder()
    }
  }
)

// Lifecycle
onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
.back-button {
  padding: 6px 16px;
  border-radius: 9999px;
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}
.back-button:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.order-footer-time {
  text-align: center;
  font-size: 0.875rem;
  padding: 12px 20px;
  margin: 0 auto;
  width: fit-content;
  border-radius: 9999px;
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  color: var(--color-text-secondary);
}

.order-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.5;
  border: 1px solid;
}

.refund-reject-alert {
  padding: 12px 16px;
  border-radius: 8px;
  background: color-mix(in srgb, #F97316 8%, transparent);
  border: 1px solid color-mix(in srgb, #F97316 25%, transparent);
}

.refund-reject-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #F97316;
  margin-bottom: 4px;
}

.refund-reject-reason {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}
</style>
