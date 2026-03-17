<template>
  <div class="coupons-page">
    <div class="max-w-lg mx-auto flex flex-col gap-4 px-4 py-6">

      <!-- 顶部导航栏 -->
      <div class="top-bar">
        <button class="back-btn" @click="$router.back()">
          <n-icon :size="20"><ChevronBackOutline /></n-icon>
          <span>返回</span>
        </button>
        <h1 class="page-title">光阴福袋</h1>
        <div class="back-btn-placeholder" />
      </div>

      <!-- 自定义 Tab 切换 -->
      <div class="tab-bar">
        <button
          class="tab-item"
          :class="{ active: activeStatus === 'unused' }"
          @click="switchTab('unused')"
        >未使用</button>
        <button
          class="tab-item"
          :class="{ active: activeStatus === 'used' }"
          @click="switchTab('used')"
        >已使用</button>
        <button
          class="tab-item"
          :class="{ active: activeStatus === 'expired' }"
          @click="switchTab('expired')"
        >已过期</button>
      </div>

      <!-- 优惠券列表 -->
      <div v-if="loading" class="flex justify-center py-8">
        <n-spin size="medium" />
      </div>

      <EmptyState
        v-else-if="filteredCoupons.length === 0"
        title="暂无优惠券"
        description="去光阴小铺用光阴值兑换优惠券吧！"
        icon="🎫"
        actionText="去兑换"
        @action="router.push('/points')"
      />

      <div v-else class="flex flex-col gap-3">
        <div class="list-meta">
          <span>共 {{ filteredCoupons.length }} 张</span>
          <span>显示 {{ pageStart }} - {{ pageEnd }} 张</span>
        </div>

        <div
          v-for="coupon in coupons"
          :key="coupon.id"
          class="glass-card coupon-card"
          :class="{ 'coupon-card--disabled': coupon.status !== 'unused' }"
        >
          <!-- 左侧金额 -->
          <div class="coupon-card-left">
            <div class="coupon-card-amount">
              <template v-if="coupon.type === 'discount'">
                <span class="value">{{ formatDiscountRate(coupon.discountRate) }}</span>
                <span class="currency">折</span>
              </template>
              <template v-else>
                <span class="currency">￥</span>
                <span class="value">{{ coupon.discountAmount }}</span>
              </template>
            </div>
            <div class="coupon-card-threshold">
              <template v-if="coupon.type === 'discount' && coupon.maxDiscountAmount">
                最多减¥{{ coupon.maxDiscountAmount }}
              </template>
              <template v-else>
                满{{ coupon.thresholdAmount }}元可用
              </template>
            </div>
          </div>
          <!-- 右侧信息 -->
          <div class="coupon-card-right">
            <div class="coupon-card-name">{{ coupon.name }}</div>
            <div class="coupon-card-validity">
              {{ formatDate(coupon.receiveTime) }} - {{ formatDate(coupon.expireTime) }}
            </div>
          </div>
          <!-- 状态标签（已使用/已过期） -->
          <div
            v-if="coupon.status !== 'unused'"
            class="coupon-card-status"
          >
            {{ coupon.status === 'used' ? '已使用' : '已过期' }}
          </div>
        </div>

        <div v-if="totalPages > 1" class="pagination-bar">
          <button
            class="pagination-btn"
            :disabled="currentPageDisplay <= 1"
            @click="goToPage(currentPageDisplay - 1)"
          >
            ‹ 上一页
          </button>
          <span class="pagination-info">
            {{ currentPageDisplay }} / {{ totalPages }}
          </span>
          <button
            class="pagination-btn"
            :disabled="currentPageDisplay >= totalPages"
            @click="goToPage(currentPageDisplay + 1)"
          >
            下一页 ›
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { NIcon, NSpin, useMessage } from 'naive-ui'
import { ChevronBackOutline } from '@vicons/ionicons5'
import { useRouter } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import { getMyCoupons } from '@/api/coupon'
import type { UserCoupon, UserCouponStatus } from '@/types/points'
import { paginateList } from '@/utils/pagination'

const message = useMessage()
const router = useRouter()

const activeStatus = ref<UserCouponStatus>('unused')
const allCoupons = ref<UserCoupon[]>([])
const loading = ref(false)
const currentPage = ref(1)
const PAGE_SIZE = 6

const filteredCoupons = computed(() => (
  allCoupons.value.filter(coupon => coupon.status === activeStatus.value)
))

const pagination = computed(() => (
  paginateList(filteredCoupons.value, currentPage.value, PAGE_SIZE)
))

const coupons = computed(() => pagination.value.list)
const totalPages = computed(() => pagination.value.totalPages)
const currentPageDisplay = computed(() => pagination.value.page)
const pageStart = computed(() => pagination.value.start)
const pageEnd = computed(() => pagination.value.end)

onMounted(() => {
  loadCoupons()
})

watch(totalPages, (nextTotalPages) => {
  if (nextTotalPages === 0) {
    currentPage.value = 1
    return
  }

  if (currentPage.value > nextTotalPages) {
    currentPage.value = nextTotalPages
  }
})

function switchTab(status: UserCouponStatus) {
  if (activeStatus.value === status) return
  activeStatus.value = status
  currentPage.value = 1
  scrollToTop()
}

function goToPage(page: number) {
  if (totalPages.value === 0) return

  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
  scrollToTop()
}

async function loadCoupons() {
  loading.value = true
  try {
    allCoupons.value = await getMyCoupons()
    currentPage.value = 1
  } catch {
    message.error('获取优惠券失败')
  } finally {
    loading.value = false
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function formatDate(timeStr: string): string {
  const d = new Date(timeStr)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

function formatDiscountRate(rate: number | null | undefined): string {
  if (!rate) return '-'
  const val = rate * 10
  return val % 1 === 0 ? String(val) : val.toFixed(1)
}
</script>

<style scoped>
.coupons-page {
  min-height: 100vh;
}

/* 顶部导航栏 —— 磨砂胶囊条 */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur-md);
  -webkit-backdrop-filter: var(--glass-blur-md);
  border: 1px solid var(--glass-border-subtle);
  border-radius: 999px;
  padding: 6px 8px;
  box-shadow: var(--glass-shadow);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 14px;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  box-shadow: none;
}
.back-btn:hover {
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-text) 8%, transparent);
}

.back-btn-placeholder {
  width: 62px;
}

.page-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: 0.5px;
}

/* 自定义 Tab 切换栏 */
.tab-bar {
  display: flex;
  gap: 8px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur-sm);
  -webkit-backdrop-filter: var(--glass-blur-sm);
  border: 1px solid var(--glass-border-subtle);
  border-radius: 12px;
  padding: 4px;
}

.tab-item {
  flex: 1;
  padding: 8px 0;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  box-shadow: none;
  transition: all 0.25s ease;
}

.tab-item.active {
  color: var(--color-bg);
  background: var(--color-primary);
  font-weight: 600;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

.tab-item:not(.active):hover {
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-text) 6%, transparent);
}

.list-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 2px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* 优惠券卡片 */
.coupon-card {
  display: flex;
  align-items: center;
  padding: 14px;
  gap: 0;
  position: relative;
  overflow: hidden;
}
.coupon-card:hover {
  transform: none;
}

.coupon-card--disabled {
  opacity: 0.55;
}

.coupon-card-left {
  flex-shrink: 0;
  width: 80px;
  text-align: center;
  padding-right: 14px;
  border-right: 1px dashed var(--glass-border-subtle);
}

.coupon-card-amount {
  color: var(--color-primary);
  font-weight: bold;
}
.coupon-card-amount .currency {
  font-size: 14px;
}
.coupon-card-amount .value {
  font-size: 26px;
}
/* 折扣券：折扣率字号适配 */
.coupon-card-amount .value:has(+ .currency) {
  font-size: 28px;
}

.coupon-card--disabled .coupon-card-amount {
  color: var(--color-text-secondary);
}

.coupon-card-threshold {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.coupon-card-right {
  flex: 1;
  padding-left: 14px;
  min-width: 0;
}

.coupon-card-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.coupon-card-validity {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.coupon-card-status {
  position: absolute;
  top: 8px;
  right: -20px;
  padding: 2px 28px;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: color-mix(in srgb, var(--color-text-secondary) 12%, transparent);
  transform: rotate(35deg);
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 0 2px;
}

.pagination-btn {
  padding: 8px 18px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border-subtle);
  backdrop-filter: var(--glass-blur-sm);
  -webkit-backdrop-filter: var(--glass-blur-sm);
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  color: var(--color-bg);
  background: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 28%, transparent);
}

.pagination-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pagination-info {
  min-width: 72px;
  padding: 8px 14px;
  border-radius: 9999px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border-subtle);
  backdrop-filter: var(--glass-blur-sm);
  -webkit-backdrop-filter: var(--glass-blur-sm);
}
</style>
