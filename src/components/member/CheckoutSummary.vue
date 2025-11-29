<template>
  <div class="checkout-summary card">
    <div class="flex items-start justify-between gap-3 mb-3">
      <div>
        <h3 class="font-medium text-[var(--color-text)]">价格拆分</h3>
        <p class="text-xs text-[var(--color-text-secondary)] mt-1">
          {{ lastUpdatedText }}
        </p>
      </div>
      <button class="refresh-link" @click="handleRefresh">
        刷新预览
      </button>
    </div>

    <div class="space-y-2 mb-4">
      <div class="flex justify-between text-[var(--color-text-secondary)]">
        <span>商品金额</span>
        <span>￥{{ itemsAmount.toFixed(2) }}</span>
      </div>

      <div class="flex justify-between" :class="discountAmount > 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'">
        <span>优惠抵扣</span>
        <span>{{ discountAmount > 0 ? '-' : '' }}￥{{ discountAmount.toFixed(2) }}</span>
      </div>
    </div>

    <div class="border-t border-[var(--color-border)] my-4"></div>

    <div class="flex justify-between items-center mb-2">
      <span class="text-[var(--color-text)]">应付金额</span>
      <span class="text-2xl font-bold text-[var(--color-primary)]">
        ￥{{ payAmount.toFixed(2) }}
      </span>
    </div>

    <div v-if="pointsEstimate > 0" class="points-message mb-4">
      <span class="icon">✦</span>
      <span>完成订单后，预计为您带来 <strong>+{{ pointsEstimate }}</strong> 光阴值</span>
    </div>

    <n-button
      type="primary"
      size="large"
      block
      :loading="paying"
      :disabled="disabled || paying || previewing"
      @click="handlePay"
    >
      <template v-if="previewing">确认价格中...</template>
      <template v-else>{{ paying ? '支付处理中...' : '立即支付' }}</template>
    </n-button>

    <p class="text-center text-xs text-[var(--color-text-secondary)] mt-3">
      点击支付即表示同意
      <a href="#" class="text-[var(--color-primary)]">服务条款</a>
    </p>

    <p v-if="previewError" class="text-xs text-red-500 mt-2">
      {{ previewError }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NButton } from 'naive-ui'

interface Props {
  itemsAmount: number
  discountAmount?: number
  payAmount: number
  pointsEstimate?: number
  paying?: boolean
  previewing?: boolean
  disabled?: boolean
  lastUpdated?: string
  previewError?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  discountAmount: 0,
  pointsEstimate: 0,
  paying: false,
  previewing: false,
  disabled: false,
  lastUpdated: '',
  previewError: null
})

const emit = defineEmits<{
  (e: 'pay'): void
  (e: 'refresh'): void
}>()

const lastUpdatedText = computed(() => {
  if (props.previewing) return '正在确认最新价格...'
  if (!props.lastUpdated) return '尚未确认价格'
  const d = new Date(props.lastUpdated)
  return `价格确认时间：${d.toLocaleTimeString()}`
})

function handlePay() {
  if (!props.paying && !props.disabled && !props.previewing) {
    emit('pay')
  }
}

function handleRefresh() {
  emit('refresh')
}
</script>

<style scoped>
.card {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.refresh-link {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.refresh-link:hover {
  color: var(--color-primary);
}

.points-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb, 245, 176, 65), 0.1),
    rgba(var(--color-primary-rgb, 245, 176, 65), 0.05)
  );
  border-radius: 8px;
  font-size: 14px;
  color: var(--color-text);
}

.points-message .icon {
  font-size: 18px;
}
</style>
