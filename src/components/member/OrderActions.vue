<template>
  <div class="order-actions flex gap-2 flex-wrap items-center">
    <!-- Status explanation for non-actionable states -->
    <span v-if="statusHint" class="text-xs text-[var(--color-text-secondary)]">
      {{ statusHint }}
    </span>

    <!-- Cancel button for pending payment orders -->
    <n-button
      v-if="canCancel"
      type="error"
      ghost
      size="small"
      :loading="cancelling"
      :disabled="cancelling"
      @click="handleCancel"
    >
      取消订单
    </n-button>

    <!-- Pay button for pending payment orders -->
    <n-button
      v-if="canPay"
      type="primary"
      size="small"
      :loading="paying"
      :disabled="paying"
      @click="handlePay"
    >
      去支付
    </n-button>

    <!-- View detail button (only in list context) -->
    <n-button
      v-if="showViewDetail"
      size="small"
      @click="handleViewDetail"
    >
      查看详情
    </n-button>

    <!-- Back to list button (only in detail context) -->
    <n-button
      v-if="context === 'detail'"
      size="small"
      @click="handleBackToList"
    >
      返回订单列表
    </n-button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDialog, useMessage, NButton } from 'naive-ui'
import { useOrderStore } from '@/stores/order'
import { getDisplayErrorMessage } from '@/utils/error'
import type { OrderStatus } from '@/types/order'

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
}

const props = withDefaults(defineProps<Props>(), {
  showViewDetail: false,
  context: 'list',
})

// Emits
const emit = defineEmits<{
  (e: 'cancelled'): void
  (e: 'paid'): void
}>()

// Composables
const router = useRouter()
const dialog = useDialog()
const message = useMessage()
const orderStore = useOrderStore()

// State
const cancelling = ref(false)
const paying = ref(false)

// Computed - 状态判断
const canCancel = computed(() => props.status === 'PENDING_PAYMENT')
const canPay = computed(() => props.status === 'PENDING_PAYMENT')

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
  paying.value = true
  try {
    // 导航到结算页面进行支付
    // 使用 orderNo 参数让结算页知道这是继续支付已有订单
    await router.push({
      path: '/member/checkout',
      query: { orderNo: props.orderNo }
    })
    emit('paid')
  } finally {
    // 重置状态，延迟以避免按钮闪烁
    setTimeout(() => {
      paying.value = false
    }, 500)
  }
}

function handleViewDetail() {
  router.push(`/member/orders/${props.orderNo}`)
}

function handleBackToList() {
  router.push('/member/orders')
}
</script>