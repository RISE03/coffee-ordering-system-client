<template>
  <div class="points-page">
    <div class="max-w-lg mx-auto flex flex-col gap-4 px-4 py-6">

      <!-- 顶部导航栏 -->
      <div class="top-bar">
        <button class="back-btn" @click="$router.back()">
          <n-icon :size="20"><ChevronBackOutline /></n-icon>
          <span>返回</span>
        </button>
        <h1 class="page-title">光阴小铺</h1>
        <div class="back-btn-placeholder" />
      </div>

      <!-- 光阴值账户概览卡片 -->
      <div class="glass-card overview-card">
        <div class="overview-main">
          <n-icon :size="20" class="overview-icon"><TimeOutline /></n-icon>
          <span class="overview-label">光阴值余额</span>
          <span class="overview-balance">{{ pointsInfo?.balance ?? '--' }}</span>
        </div>
        <div class="overview-footer">
          <div class="overview-stat">
            <span class="overview-stat-label">累计获得</span>
            <span class="overview-stat-value">{{ pointsInfo?.totalEarned ?? '--' }}</span>
          </div>
        </div>
      </div>

      <!-- 自定义 Tab 切换 -->
      <div class="tab-bar">
        <button
          class="tab-item"
          :class="{ active: activeTab === 'shop' }"
          @click="activeTab = 'shop'"
        >积分商城</button>
        <button
          class="tab-item"
          :class="{ active: activeTab === 'history' }"
          @click="activeTab = 'history'"
        >积分记录</button>
      </div>

      <!-- 积分商城 -->
      <template v-if="activeTab === 'shop'">
        <div v-if="templatesLoading" class="flex justify-center py-8">
          <n-spin size="medium" />
        </div>

        <EmptyState
          v-else-if="templates.length === 0"
          title="暂无可兑换的好礼"
          description="店长正在准备新的优惠，敬请期待。"
          icon="🎁"
          :hide-action="true"
        />

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="tpl in templates"
            :key="tpl.id"
            class="glass-card template-card"
          >
            <div class="template-left">
              <div class="template-amount">
                <span class="currency">￥</span>
                <span class="value">{{ tpl.discountAmount }}</span>
              </div>
              <div class="template-threshold">满{{ tpl.thresholdAmount }}元可用</div>
            </div>
            <div class="template-right">
              <div class="template-name">{{ tpl.name }}</div>
              <div class="template-meta">
                <span>需 {{ tpl.requiredPoints }} 光阴值</span>
                <span class="template-dot">·</span>
                <span>有效 {{ tpl.validDays }} 天</span>
              </div>
            </div>
            <button
              class="redeem-btn"
              :disabled="!canRedeem(tpl) || redeemingId === tpl.id"
              @click="handleRedeem(tpl)"
            >
              <n-spin v-if="redeemingId === tpl.id" :size="14" />
              <template v-else>
                {{ canRedeem(tpl) ? '立即兑换' : '光阴值不足' }}
              </template>
            </button>
          </div>
        </div>
      </template>

      <!-- 积分记录 -->
      <template v-if="activeTab === 'history'">
        <div v-if="historyLoading && historyList.length === 0" class="flex justify-center py-8">
          <n-spin size="medium" />
        </div>

        <EmptyState
          v-else-if="historyList.length === 0"
          title="暂无光阴流水"
          description="消费即可积攒光阴值哦。"
          icon="⏳"
          :hide-action="true"
        />

        <div v-else class="flex flex-col gap-2">
          <div
            v-for="item in historyList"
            :key="item.id"
            class="glass-card history-item"
          >
            <div class="history-left">
              <div class="history-desc">{{ item.description }}</div>
              <div class="history-time">{{ formatTime(item.createTime) }}</div>
            </div>
            <div
              class="history-amount"
              :class="item.changeAmount > 0 ? 'positive' : 'negative'"
            >
              {{ item.changeAmount > 0 ? '+' : '' }}{{ item.changeAmount }}
            </div>
          </div>

          <!-- 加载更多 -->
          <div class="flex justify-center py-4">
            <button
              v-if="hasMoreHistory"
              class="load-more-btn"
              :disabled="historyLoading"
              @click="loadMoreHistory"
            >
              <n-spin v-if="historyLoading" :size="14" />
              <span v-else>加载更多</span>
            </button>
            <span v-else class="no-more-text">
              没有更多了
            </span>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NIcon, NSpin, useMessage, useDialog } from 'naive-ui'
import { ChevronBackOutline, TimeOutline } from '@vicons/ionicons5'
import EmptyState from '@/components/common/EmptyState.vue'
import { getMyPoints, type PointsInfo } from '@/api/user'
import { getPointsHistory, getCouponTemplates, redeemCoupon } from '@/api/points'
import type { PointsHistoryItem, CouponTemplate } from '@/types/points'

const message = useMessage()
const dialog = useDialog()

// 光阴值概览
const pointsInfo = ref<PointsInfo | null>(null)

// Tab 状态
const activeTab = ref('shop')

// 积分商城
const templates = ref<CouponTemplate[]>([])
const templatesLoading = ref(false)
const redeemingId = ref<number | null>(null)

// 积分记录
const historyList = ref<PointsHistoryItem[]>([])
const historyLoading = ref(false)
const historyPage = ref(1)
const historyTotal = ref(0)
const PAGE_SIZE = 20

const hasMoreHistory = ref(true)

onMounted(async () => {
  // 并行加载积分信息和商城模板
  await Promise.all([
    loadPointsInfo(),
    loadTemplates(),
    loadHistory(),
  ])
})

async function loadPointsInfo() {
  try {
    pointsInfo.value = await getMyPoints()
  } catch {
    console.error('获取积分信息失败')
  }
}

async function loadTemplates() {
  templatesLoading.value = true
  try {
    templates.value = await getCouponTemplates()
  } catch {
    message.error('获取优惠券模板失败')
  } finally {
    templatesLoading.value = false
  }
}

async function loadHistory() {
  historyLoading.value = true
  try {
    const res = await getPointsHistory({ page: historyPage.value, size: PAGE_SIZE })
    historyList.value = res.list
    historyTotal.value = res.page.total
    hasMoreHistory.value = historyList.value.length < historyTotal.value
  } catch {
    message.error('获取积分记录失败')
  } finally {
    historyLoading.value = false
  }
}

async function loadMoreHistory() {
  historyPage.value++
  historyLoading.value = true
  try {
    const res = await getPointsHistory({ page: historyPage.value, size: PAGE_SIZE })
    historyList.value.push(...res.list)
    historyTotal.value = res.page.total
    hasMoreHistory.value = historyList.value.length < historyTotal.value
  } catch {
    historyPage.value--
    message.error('加载更多记录失败')
  } finally {
    historyLoading.value = false
  }
}

function canRedeem(tpl: CouponTemplate): boolean {
  if (!pointsInfo.value) return false
  return pointsInfo.value.balance >= tpl.requiredPoints
}

function handleRedeem(tpl: CouponTemplate) {
  dialog.warning({
    title: '确认兑换',
    content: `确定花费 ${tpl.requiredPoints} 光阴值兑换「${tpl.name}」吗？`,
    positiveText: '确认兑换',
    negativeText: '再想想',
    onPositiveClick: async () => {
      redeemingId.value = tpl.id
      try {
        const res = await redeemCoupon(tpl.id)
        message.success(`兑换成功！获得「${res.coupon?.name ?? tpl.name}」`)
        // 刷新积分余额
        await loadPointsInfo()
      } catch {
        message.error('兑换失败，请稍后重试')
      } finally {
        redeemingId.value = null
      }
    },
  })
}

function formatTime(timeStr: string): string {
  const d = new Date(timeStr)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<style scoped>
.points-page {
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
  width: 62px; /* 平衡返回按钮宽度 */
}

.page-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: 0.5px;
}

/* 概览卡片 */
.overview-card {
  padding: 0;
  overflow: hidden;
}

.overview-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 20px 16px;
  gap: 2px;
}

.overview-icon {
  color: var(--color-primary);
  margin-bottom: 2px;
}

.overview-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.overview-balance {
  font-size: 36px;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.overview-footer {
  display: flex;
  align-items: center;
  border-top: 1px solid var(--glass-border-subtle);
  background: color-mix(in srgb, var(--color-primary) 4%, transparent);
}

.overview-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 2px;
}

.overview-stat-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.overview-stat-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.overview-divider {
  width: 1px;
  height: 24px;
  background: var(--glass-border-subtle);
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

/* 优惠券模板卡片 */
.template-card {
  display: flex;
  align-items: center;
  padding: 14px;
  gap: 12px;
}
.template-card:hover {
  transform: none;
}

.template-left {
  flex-shrink: 0;
  width: 80px;
  text-align: center;
  padding-right: 12px;
  border-right: 1px dashed var(--glass-border-subtle);
}

.template-amount {
  color: var(--color-primary);
  font-weight: bold;
}
.template-amount .currency {
  font-size: 14px;
}
.template-amount .value {
  font-size: 26px;
}

.template-threshold {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.template-right {
  flex: 1;
  min-width: 0;
}

.template-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.template-dot {
  margin: 0 4px;
}

/* 兑换按钮 */
.redeem-btn {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-bg);
  background: var(--color-primary);
  border: none;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 30%, transparent);
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.redeem-btn:hover:not(:disabled) {
  filter: brightness(1.08);
}
.redeem-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

/* 积分记录项 */
.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
}
.history-item:hover {
  transform: none;
}

.history-left {
  flex: 1;
  min-width: 0;
}

.history-desc {
  font-size: 14px;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.history-amount {
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 700;
  margin-left: 12px;
}
.history-amount.positive {
  color: #27AE60;
}
.history-amount.negative {
  color: #E74C3C;
}

/* 加载更多 */
.load-more-btn {
  padding: 8px 24px;
  border-radius: 999px;
  font-size: 13px;
  color: var(--color-text-secondary);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border-subtle);
  box-shadow: none;
  display: flex;
  align-items: center;
  gap: 6px;
}
.load-more-btn:hover:not(:disabled) {
  background: var(--glass-bg-hover);
  color: var(--color-text);
}

.no-more-text {
  font-size: 12px;
  color: var(--color-text-secondary);
  opacity: 0.6;
}
</style>
