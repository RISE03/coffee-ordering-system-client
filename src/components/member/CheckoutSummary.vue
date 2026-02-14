<template>
  <div class="checkout-summary bg-[var(--color-bg-secondary)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
    <div class="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 class="font-serif font-semibold text-lg text-[var(--color-text)]">价格拆分</h3>
        <p class="text-xs text-[var(--color-text-secondary)] mt-1 transition-colors duration-300">
          {{ lastUpdatedText }}
        </p>
      </div>
    </div>

    <div class="space-y-3 mb-6">
      <div class="flex justify-between text-[var(--color-text-secondary)] text-sm">
        <span>商品总额</span>
        <span class="font-medium">￥{{ itemsAmount.toFixed(2) }}</span>
      </div>

      <div class="flex justify-between items-center text-sm transition-colors duration-300" 
           :class="discountAmount > 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'">
        <span>优惠抵扣</span>
        <span class="font-medium">{{ discountAmount > 0 ? '-' : '' }}￥{{ discountAmount.toFixed(2) }}</span>
      </div>
    </div>

    <div class="border-t border-dashed border-[var(--color-border)] my-5"></div>

    <div class="flex justify-between items-end mb-6">
      <span class="text-[var(--color-text)] font-medium mb-1">实付金额</span>
      <span class="text-3xl font-serif font-bold text-[var(--color-primary)] leading-none">
        <span class="text-lg align-top mr-0.5">￥</span>{{ payAmount.toFixed(2) }}
      </span>
    </div>

    <div v-if="pointsEstimate > 0" class="mb-6 relative overflow-hidden rounded-xl bg-[var(--color-bg)] border border-[var(--color-primary)] p-3 flex items-center gap-3 shadow-sm">
      <div class="bg-[var(--color-primary)] rounded-full w-8 h-8 flex items-center justify-center text-[var(--color-bg)] shadow-sm flex-shrink-0">
        <NIcon size="16"><SparklesOutline /></NIcon>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs text-[var(--color-text-secondary)]">本次消费预计获得</p>
        <p class="text-sm font-bold text-[var(--color-primary)]">+{{ pointsEstimate }} 光阴值</p>
      </div>
    </div>

    <n-button
      type="primary"
      size="large"
      block
      round
      class="h-12 text-base font-medium shadow-lg shadow-orange-200/50 dark:shadow-none"
      :loading="paying"
      :disabled="disabled || paying || previewing"
      @click="handlePay"
    >
      <template #icon>
        <NIcon><CardOutline /></NIcon>
      </template>
      <template v-if="previewing">正在核算...</template>
      <template v-else>{{ paying ? '提交中...' : '提交订单' }}</template>
    </n-button>

    <p class="text-center text-xs text-[var(--color-text-secondary)] mt-4">
      点击提交即表示同意
      <a href="#" class="text-[var(--color-primary)] hover:underline">服务条款</a>
    </p>

    <p v-if="previewError" class="text-xs text-red-500 mt-2 text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
      {{ previewError }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { SparklesOutline, CardOutline } from '@vicons/ionicons5'

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
  if (props.previewing) return '正在核算...'
  if (!props.lastUpdated) return '尚未确认'
  const d = new Date(props.lastUpdated)
  return `更新于 ${d.toLocaleTimeString()}`
})

function handlePay() {
  if (!props.paying && !props.disabled && !props.previewing) {
    emit('pay')
  }
}
</script>

<style scoped>
/* 样式主要依赖 Tailwind */
</style>