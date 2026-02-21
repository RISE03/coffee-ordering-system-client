<template>
  <div class="order-actions flex gap-2 flex-wrap items-center">
    <!-- Status explanation for non-actionable states -->
    <span v-if="statusHint" class="text-xs text-[var(--color-text-secondary)]">
      {{ statusHint }}
    </span>

    <!-- Cancel button for pending payment orders -->
    <button
      v-if="canCancel"
      class="action-btn cancel-btn"
      :disabled="cancelling"
      @click="handleCancel"
    >
      {{ cancelling ? '取消中...' : '取消订单' }}
    </button>

    <!-- Pay button for pending payment orders -->
    <button
      v-if="canPay"
      class="action-btn pay-btn"
      :disabled="paying"
      @click="handlePay"
    >
      {{ paying ? '支付中...' : '去支付' }}
    </button>

    <!-- Refund/After-sale button -->
    <button
      v-if="canRefund || canAfterSale"
      class="action-btn refund-btn"
      @click="showRefundDialog = true"
    >
      {{ refundButtonText }}
    </button>

    <!-- View detail button (only in list context) -->
    <button
      v-if="showViewDetail"
      class="view-detail-btn"
      @click="handleViewDetail"
    >
      查看详情 →
    </button>

    <!-- Refund dialog -->
    <RefundDialog
      v-model="showRefundDialog"
      :order-no="orderNo"
      :status="status"
      @success="handleRefunded"
    />

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDialog, useMessage } from 'naive-ui'
import { useOrderStore } from '@/stores/order'
import { useCheckoutStore } from '@/stores/checkout'
import { getDisplayErrorMessage } from '@/utils/error'
import type { OrderStatus } from '@/types/order'
import RefundDialog from './RefundDialog.vue'

// Props
interface Props {
  /** 订单号 */
  orderNo: string
  /** 订单状态 */
  status: OrderStatus
  /** 是否显示查看详情按钮 */
  showViewDetail?: boolean
  /** 上下文：列表页或详情页 */
  context?: 'list' | 'detail'
  /** 订单完成时间（用于判断售后时限） */
  completeTime?: string
}

const props = withDefaults(defineProps<Props>(), {
  showViewDetail: false,
  context: 'list',
})

// Emits
const emit = defineEmits<{
  (e: 'cancelled'): void
  (e: 'paid'): void
  (e: 'refunded'): void
}>()

// Composables
const router = useRouter()
const dialog = useDialog()
const message = useMessage()
const orderStore = useOrderStore()
const checkoutStore = useCheckoutStore()

// State
const cancelling = ref(false)
const paying = ref(false)
const showRefundDialog = ref(false)

// Computed - 状态判断
const canCancel = computed(() => props.status === 'PENDING_PAYMENT')
const canPay = computed(() => props.status === 'PENDING_PAYMENT')

// 判断是否可以申请退款（PAID_WAITING）
const canRefund = computed(() => props.status === 'PAID_WAITING')

// 判断是否可以申请售后（COMPLETED + 2小时内）
const canAfterSale = computed(() => {
  if (props.status !== 'COMPLETED') return false
  if (!props.completeTime) return false

  const completeDate = new Date(props.completeTime)
  const now = new Date()
  const diffHours = (now.getTime() - completeDate.getTime()) / (1000 * 60 * 60)

  return diffHours <= 2
})

// 退款/售后按钮文案
const refundButtonText = computed(() => {
  if (canRefund.value) return '申请退款'
  if (canAfterSale.value) return '申请售后'
  return ''
})

/**
 * 根据订单状态返回提示文案 - 品牌语气
 */
const statusHint = computed((): string => {
  // 待支付状态不需要提示
  if (props.status === 'PENDING_PAYMENT') {
    return ''
  }

  switch (props.status) {
    case 'PAID_WAITING':
      return '订单已支付，店铺正在确认中'
    case 'IN_PREPARATION':
      return '订单正在用心制作中'
    case 'READY_FOR_PICKUP':
      return '订单已备好，请尽快取餐享用'
    case 'COMPLETED':
      return '订单已完成，感谢您的光临'
    case 'CANCELLED':
      return '订单已取消'
    case 'REFUNDING':
      return '退款正在处理中，请耐心等待'
    case 'REFUNDED':
      return '退款已完成，款项将原路返回'
    default:
      return ''
  }
})

// Methods
function handleCancel() {
  dialog.warning({
    title: '取消订单',
    content: '确定要取消这个订单吗？取消后将无法恢复，已锁定的优惠券会被释放。',
    positiveText: '确认取消',
    negativeText: '再想想',
    onPositiveClick: async () => {
      cancelling.value = true
      try {
        await orderStore.doCancelOrder(props.orderNo)
        message.success('订单已取消，期待下次相遇')
        emit('cancelled')
      } catch (error) {
        message.error(getDisplayErrorMessage(error))
      } finally {
        cancelling.value = false
      }
    },
  })
}

async function handlePay() {
  dialog.warning({
    title: '确认支付',
    content: `确定要支付订单 ${props.orderNo} 吗？`,
    positiveText: '确认支付',
    negativeText: '再想想',
    onPositiveClick: async () => {
      paying.value = true
      try {
        checkoutStore.regenerateIdempotencyKey()
        await checkoutStore.pay({ orderNo: props.orderNo })
        message.success('支付成功')
        emit('paid')
      } catch (error) {
        message.error(getDisplayErrorMessage(error))
      } finally {
        paying.value = false
      }
    },
  })
}

function handleViewDetail() {
  router.push(`/member/orders/${props.orderNo}`)
}

function handleRefunded() {
  emit('refunded')
}

</script>

<style scoped>
.action-btn {
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
}
.action-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.cancel-btn {
  color: var(--color-text-secondary);
  background: color-mix(in srgb, var(--color-text-secondary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-text-secondary) 20%, transparent);
}
.cancel-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-text-secondary) 16%, transparent);
  border-color: var(--color-text-secondary);
}

.pay-btn {
  color: var(--color-bg);
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 30%, transparent);
}
.pay-btn:hover:not(:disabled) {
  filter: brightness(1.08);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 40%, transparent);
}

.refund-btn {
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
}
.refund-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-primary) 20%, transparent);
  border-color: var(--color-primary);
}

.view-detail-btn {
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 25%, transparent);
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
}
.view-detail-btn:hover {
  background: color-mix(in srgb, var(--color-primary) 20%, transparent);
  border-color: var(--color-primary);
}
</style>