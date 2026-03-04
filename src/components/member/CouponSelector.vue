<template>
  <div class="coupon-selector">
    <div v-if="selectedCouponId" class="flex justify-end mb-3">
      <n-button
        text
        type="error"
        size="small"
        @click="handleClear"
      >
        不使用优惠券
      </n-button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-6 text-[var(--color-text-secondary)]">
      <n-spin size="small" />
      <span class="ml-2 text-sm">正在获取可用优惠券...</span>
    </div>

    <div
      v-else-if="usableCoupons.length === 0 && unusableCoupons.length === 0"
      class="text-center py-4 text-[var(--color-text-secondary)]"
    >
      暂无可用优惠券
    </div>

    <div v-else class="space-y-3 mb-4">
      <p class="text-xs text-[var(--color-text-secondary)]" v-if="usableCoupons.length > 0">
        可用优惠券（{{ usableCoupons.length }}）
      </p>
      <div v-if="usableCoupons.length > 0" class="space-y-3">
        <div
          v-for="coupon in usableCoupons"
          :key="coupon.id"
          class="coupon-card usable"
          :class="{ selected: selectedCouponId === coupon.id }"
          @click="handleSelect(coupon.id)"
        >
          <div class="coupon-left">
            <div class="coupon-amount">
              <template v-if="coupon.type === 'discount'">
                <span class="value">{{ formatDiscountRate(coupon.discountRate) }}</span>
                <span class="currency">折</span>
              </template>
              <template v-else>
                <span class="currency">￥</span>
                <span class="value">{{ coupon.discountAmount }}</span>
              </template>
            </div>
            <div class="coupon-threshold">
              <template v-if="coupon.type === 'discount' && coupon.maxDiscountAmount">
                最多减¥{{ coupon.maxDiscountAmount }}
              </template>
              <template v-else>
                满{{ coupon.threshold }}元可用
              </template>
            </div>
          </div>
          <div class="coupon-right">
            <div class="coupon-name">{{ coupon.name }}</div>
            <div class="coupon-validity">
              {{ formatValidity(coupon.validFrom, coupon.validTo) }}
            </div>
          </div>
          <div class="coupon-check">
            <n-icon v-if="selectedCouponId === coupon.id" size="20">
              <CheckCircle />
            </n-icon>
            <n-icon v-else size="20" class="opacity-30">
              <Circle />
            </n-icon>
          </div>
        </div>
      </div>

      <div v-if="unusableCoupons.length > 0">
        <n-collapse>
          <n-collapse-item
            :title="`不可用优惠券 (${unusableCoupons.length})`"
            name="unusable"
          >
            <div class="space-y-3">
              <div
                v-for="coupon in unusableCoupons"
                :key="coupon.id"
                class="coupon-card unusable"
              >
                <div class="coupon-left">
                  <div class="coupon-amount">
                    <template v-if="coupon.type === 'discount'">
                      <span class="value">{{ formatDiscountRate(coupon.discountRate) }}</span>
                      <span class="currency">折</span>
                    </template>
                    <template v-else>
                      <span class="currency">￥</span>
                      <span class="value">{{ coupon.discountAmount }}</span>
                    </template>
                  </div>
                  <div class="coupon-threshold">
                    <template v-if="coupon.type === 'discount' && coupon.maxDiscountAmount">
                      最多减¥{{ coupon.maxDiscountAmount }}
                    </template>
                    <template v-else>
                      满{{ coupon.threshold }}元可用
                    </template>
                  </div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-name">{{ coupon.name }}</div>
                  <div class="coupon-validity">
                    {{ formatValidity(coupon.validFrom, coupon.validTo) }}
                  </div>
                  <div class="coupon-reason">
                    {{ coupon.reason || '不满足使用条件' }}
                  </div>
                </div>
              </div>
            </div>
          </n-collapse-item>
        </n-collapse>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { NButton, NCollapse, NCollapseItem, NIcon, NSpin } from 'naive-ui'
import type { CouponInfo } from '@/types/cart'

// 简易图标
const CheckCircle = {
  render() {
    return h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor' }, [
      h('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' })
    ])
  }
}

const Circle = {
  render() {
    return h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2'
      },
      [h('circle', { cx: '12', cy: '12', r: '10' })]
    )
  }
}

interface Props {
  coupons?: CouponInfo[]
  usable?: CouponInfo[]
  unusable?: CouponInfo[]
  selectedCouponId?: number | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  coupons: () => [],
  usable: () => [],
  unusable: () => [],
  selectedCouponId: null,
  loading: false
})

const emit = defineEmits<{
  (e: 'update:selectedCouponId', value: number | null): void
  (e: 'change', coupon: CouponInfo | null): void
}>()

const usableCoupons = computed(() => {
  if (props.usable.length > 0) return props.usable
  return props.coupons.filter((c) => c.usable)
})

const unusableCoupons = computed(() => {
  if (props.unusable.length > 0) return props.unusable
  return props.coupons.filter((c) => !c.usable)
})

function handleSelect(couponId: number) {
  const newValue = props.selectedCouponId === couponId ? null : couponId
  emit('update:selectedCouponId', newValue)

  const coupon = newValue ? usableCoupons.value.find((c) => c.id === newValue) || null : null
  emit('change', coupon)
}

function handleClear() {
  emit('update:selectedCouponId', null)
  emit('change', null)
}

function formatValidity(from: string, to: string): string {
  const fromDate = new Date(from)
  const toDate = new Date(to)

  const formatDate = (d: Date) => {
    const month = d.getMonth() + 1
    const day = d.getDate()
    return `${month}.${day}`
  }

  return `${formatDate(fromDate)} - ${formatDate(toDate)}`
}

function formatDiscountRate(rate: number | null | undefined): string {
  if (!rate) return '-'
  const val = rate * 10
  return val % 1 === 0 ? String(val) : val.toFixed(1)
}
</script>

<style scoped>
.coupon-card {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.coupon-card.usable:hover {
  border-color: var(--color-primary);
}

.coupon-card.selected {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb, 245, 176, 65), 0.1);
}

.coupon-card.unusable {
  opacity: 0.6;
  cursor: not-allowed;
}

.coupon-left {
  flex-shrink: 0;
  width: 80px;
  text-align: center;
  padding-right: 12px;
  border-right: 1px dashed var(--color-border);
}

.coupon-amount {
  color: var(--color-primary);
  font-weight: bold;
}

.coupon-amount .currency {
  font-size: 14px;
}

.coupon-amount .value {
  font-size: 24px;
}

.coupon-threshold {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.coupon-right {
  flex: 1;
  padding-left: 12px;
  min-width: 0;
}

.coupon-name {
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.coupon-validity {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.coupon-reason {
  font-size: 12px;
  color: #e74c3c;
  margin-top: 4px;
}

.coupon-check {
  flex-shrink: 0;
  margin-left: 12px;
  color: var(--color-primary);
}

:deep(.n-collapse-item__header-main) {
  color: var(--color-text-secondary);
  font-size: 14px;
}
</style>
