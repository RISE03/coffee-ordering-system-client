<template>
  <div class="container mx-auto max-w-lg pb-8">

    <!-- 顶部导航 -->
    <div class="px-4 pt-6 pb-2 flex items-center gap-3">
      <button class="back-btn" @click="router.back()">
        <n-icon :size="22"><ArrowBackOutline /></n-icon>
      </button>
      <h1 class="page-title">我的等级</h1>
    </div>

    <div class="px-4 flex flex-col gap-4 mt-2">

      <!-- 1. 当前等级 Hero 卡片 -->
      <div class="hero-card glass-card" :class="`hero--level-${user?.level ?? 1}`">
        <div class="flex flex-col items-center py-8 px-5 relative z-[1]">
          <div class="big-icon-wrap" :class="`level-${user?.level ?? 1}`">
            <n-icon :size="40">
              <component :is="levelIconMap[user?.level ?? 1]" />
            </n-icon>
          </div>
          <span class="level-badge mt-4" :class="`level-${user?.level ?? 1}`">
            Lv.{{ user?.level }} {{ user?.levelName }}
          </span>
          <p class="level-quote mt-2">{{ levelDescMap[user?.level ?? 1] }}</p>
        </div>
      </div>

      <!-- 2. 升级进度卡片 -->
      <div v-if="progress" class="glass-card px-5 py-5">
        <!-- 满级 -->
        <div v-if="progress.isMaxLevel" class="max-level-tip">
          <n-icon :size="20"><StarOutline /></n-icon>
          <span>已达最高等级，感谢您的长久陪伴</span>
        </div>
        <!-- 未满级 -->
        <template v-else>
          <h2 class="section-title mb-4">升级进度</h2>
          <div class="amounts-row">
            <div>
              <p class="amount-value">¥{{ formatAmount(user!.totalConsumeAmount ?? 0) }}</p>
              <p class="amount-label">已累计消费</p>
            </div>
            <div class="text-right">
              <p class="amount-value">¥{{ formatAmount(progress.nextMin) }}</p>
              <p class="amount-label">{{ nextLevelName }}门槛</p>
            </div>
          </div>
          <div class="prog-bar-wrap mt-3">
            <div class="prog-bar">
              <div class="prog-fill" :style="{ width: `${progress.percent}%` }" />
            </div>
            <span class="prog-pct">{{ Math.round(progress.percent) }}%</span>
          </div>
          <p class="prog-tip mt-2">
            再共度
            <span class="prog-tip-amount">¥{{ Math.ceil(progress.remaining).toLocaleString('zh-CN') }}</span>
            ，即可迎来{{ nextLevelName }}
          </p>
        </template>
      </div>

      <!-- 3. 成长之路 -->
      <div class="glass-card overflow-hidden">
        <h2 class="section-title px-5 pt-5 pb-3">成长之路</h2>

        <!-- 加载中 -->
        <div v-if="configsLoading" class="flex justify-center py-6">
          <n-spin size="small" />
        </div>

        <!-- 加载失败 -->
        <p v-else-if="configsError" class="text-xs text-center text-[var(--color-text-secondary)] py-4 pb-5">
          等级配置加载失败，请稍后再试
        </p>

        <!-- 路线图列表 -->
        <div v-else class="roadmap px-5 pb-5">
          <div
            v-for="(lc, idx) in levelConfigs"
            :key="lc.level"
            class="roadmap-item"
            :class="{
              'roadmap-item--achieved': lc.level <= (user?.level ?? 0),
              'roadmap-item--current': lc.level === user?.level,
            }"
          >
            <!-- 时间轴 -->
            <div class="roadmap-axis">
              <div class="roadmap-dot" :class="{ 'roadmap-dot--done': lc.level <= (user?.level ?? 0) }">
                <n-icon v-if="lc.level <= (user?.level ?? 0)" :size="12"><CheckmarkOutline /></n-icon>
              </div>
              <div v-if="idx < levelConfigs.length - 1" class="roadmap-line" />
            </div>
            <!-- 内容 -->
            <div class="roadmap-body" :class="{ 'roadmap-body--last': idx === levelConfigs.length - 1 }">
              <div class="roadmap-row">
                <div class="roadmap-left">
                  <n-icon :size="15" class="roadmap-icon">
                    <component :is="levelIconMap[lc.level]" />
                  </n-icon>
                  <span class="roadmap-name">{{ lc.name }}</span>
                  <span class="roadmap-lv">Lv.{{ lc.level }}</span>
                  <span v-if="lc.level === user?.level" class="roadmap-current-tag">当前</span>
                </div>
                <span class="roadmap-threshold">
                  {{ lc.minAmount === 0 ? '注册即享' : `≥ ¥${formatAmount(lc.minAmount)}` }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type Component } from 'vue'
import { NIcon, NSpin } from 'naive-ui'
import {
  ArrowBackOutline,
  PartlySunnyOutline,
  SunnyOutline,
  SparklesOutline,
  StarOutline,
  CheckmarkOutline,
} from '@vicons/ionicons5'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getLevelConfigs } from '@/api/user'
import { MEMBER_LEVEL_NAMES, type LevelConfig, type MemberLevel } from '@/types/user'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

// 等级图标映射
const levelIconMap: Record<number, Component> = {
  1: PartlySunnyOutline,
  2: SunnyOutline,
  3: SparklesOutline,
  4: StarOutline,
}

// 等级品牌描述（来自 UI 设计方案）
const levelDescMap: Record<number, string> = {
  1: '初次相遇，如晨光微露',
  2: '逐渐熟悉，热情如日当空',
  3: '长久陪伴，如晚霞般绚烂',
  4: '成为知音，如星光般恒久',
}

// 等级配置
const levelConfigs = ref<LevelConfig[]>([])
const configsLoading = ref(true)
const configsError = ref(false)

onMounted(async () => {
  try {
    levelConfigs.value = await getLevelConfigs()
  } catch {
    configsError.value = true
  } finally {
    configsLoading.value = false
  }
})

// 升级进度
const progress = computed(() => {
  const u = user.value
  if (!u) return null
  if (u.level === 4) return { isMaxLevel: true as const }
  if (u.nextLevelMinAmount == null) return null

  const total = u.totalConsumeAmount ?? 0
  const min = u.currentLevelMinAmount ?? 0
  const max = u.nextLevelMinAmount
  const range = max - min
  if (range <= 0) return null

  const percent = Math.min(100, Math.max(0, ((total - min) / range) * 100))
  return {
    isMaxLevel: false as const,
    percent,
    remaining: Math.max(0, max - total),
    nextMin: max,
  }
})

const nextLevelName = computed(() => {
  const level = user.value?.level
  if (!level || level >= 4) return ''
  return MEMBER_LEVEL_NAMES[(level + 1) as MemberLevel]
})

// 金额格式化：整数 + 千分符
function formatAmount(amount: number): string {
  return Number(amount).toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}
</script>

<style scoped>
/* 页面标题遮罩胶囊 */
.page-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-blur-sm);
  -webkit-backdrop-filter: var(--glass-blur-sm);
  padding: 5px 14px;
  border-radius: 999px;
}

/* 返回按钮 */
.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--color-text);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  flex-shrink: 0;
  transition: background 0.15s;
}
.back-btn:hover { background: var(--glass-bg-hover); }

/* Hero 卡片背景晕染 */
.hero-card { position: relative; overflow: hidden; }
.hero-card::before {
  content: '';
  position: absolute;
  top: -40%; left: 50%;
  translate: -50% 0;
  width: 130%; aspect-ratio: 1;
  border-radius: 50%;
  pointer-events: none;
}
.hero--level-1::before { background: radial-gradient(circle, color-mix(in srgb,#FFB347 28%,transparent) 0%, transparent 70%); }
.hero--level-2::before { background: radial-gradient(circle, color-mix(in srgb,#FFC107 28%,transparent) 0%, transparent 70%); }
.hero--level-3::before { background: radial-gradient(circle, color-mix(in srgb,#E991C8 28%,transparent) 0%, transparent 70%); }
.hero--level-4::before { background: radial-gradient(circle, color-mix(in srgb,#D4AC0D 28%,transparent) 0%, transparent 70%); }

/* 大图标圆形底座 */
.big-icon-wrap {
  display: flex; align-items: center; justify-content: center;
  width: 80px; height: 80px;
  border-radius: 50%;
  color: #fff;
}
.big-icon-wrap.level-1 { background: linear-gradient(135deg,#FFB347,#FF8C42); }
.big-icon-wrap.level-2 { background: linear-gradient(135deg,#FFC107,#FF9800); }
.big-icon-wrap.level-3 { background: linear-gradient(135deg,#E991C8,#9B59B6); }
.big-icon-wrap.level-4 { background: linear-gradient(135deg,#2C3E50,#D4AC0D); }

/* 等级徽章（与 ProfileView 保持一致） */
.level-badge {
  display: inline-flex; align-items: center;
  padding: 4px 18px;
  border-radius: 999px;
  font-size: 13px; font-weight: 600;
  color: #fff; letter-spacing: 0.5px;
}
.level-1 { background: linear-gradient(135deg,#FFB347,#FF8C42); }
.level-2 { background: linear-gradient(135deg,#FFC107,#FF9800); }
.level-3 { background: linear-gradient(135deg,#E991C8,#9B59B6); }
.level-4 { background: linear-gradient(135deg,#2C3E50,#D4AC0D); color: #FAD7A0; }

/* 等级品牌语 */
.level-quote {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-style: italic;
}

/* 区块标题 */
.section-title {
  font-size: 14px; font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.5px;
}

/* 满级提示 */
.max-level-tip {
  display: flex; align-items: center; justify-content: center;
  gap: 8px;
  font-size: 14px; font-weight: 500;
  color: var(--color-text-secondary);
  padding: 8px 0;
}

/* 进度数值行 */
.amounts-row {
  display: flex; justify-content: space-between;
}
.amount-value {
  font-size: 20px; font-weight: 800;
  color: var(--color-primary);
  line-height: 1.2;
}
.amount-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

/* 进度条 */
.prog-bar-wrap {
  display: flex; align-items: center; gap: 10px;
}
.prog-bar {
  flex: 1; height: 6px; border-radius: 999px;
  background: color-mix(in srgb,var(--color-primary) 18%,transparent);
  overflow: hidden;
}
.prog-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, var(--color-primary), color-mix(in srgb,var(--color-primary) 65%,#fff));
  transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
}
.prog-pct {
  font-size: 12px; font-weight: 700;
  color: var(--color-primary);
  white-space: nowrap;
}
.prog-tip {
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: center;
  margin: 0;
}
.prog-tip-amount {
  font-weight: 700;
  color: var(--color-primary);
}

/* 成长路线图 */
.roadmap { display: flex; flex-direction: column; }
.roadmap-item {
  display: flex; gap: 12px;
}

/* 时间轴 */
.roadmap-axis {
  display: flex; flex-direction: column; align-items: center;
  flex-shrink: 0;
  width: 20px;
}
.roadmap-dot {
  width: 20px; height: 20px;
  border-radius: 50%;
  border: 2px solid var(--glass-border);
  background: var(--glass-bg);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  transition: all 0.2s;
}
.roadmap-dot--done {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-bg);
}
.roadmap-line {
  width: 2px; flex: 1;
  min-height: 16px;
  background: var(--glass-border);
  margin: 2px 0;
}

/* 路线图内容 */
.roadmap-body {
  flex: 1;
  padding-bottom: 20px;
}
.roadmap-body--last { padding-bottom: 0; }

.roadmap-row {
  display: flex; align-items: center; justify-content: space-between;
  min-height: 20px;
}
.roadmap-left {
  display: flex; align-items: center; gap: 6px;
}
.roadmap-icon { color: var(--color-primary); }
.roadmap-name {
  font-size: 15px; font-weight: 500;
  color: var(--color-text);
}
.roadmap-lv {
  font-size: 11px;
  color: var(--color-text-secondary);
}
.roadmap-current-tag {
  font-size: 10px; font-weight: 600;
  color: var(--color-primary);
  background: color-mix(in srgb,var(--color-primary) 12%,transparent);
  padding: 1px 7px; border-radius: 999px;
}
.roadmap-threshold {
  font-size: 13px; font-weight: 500;
  color: var(--color-text-secondary);
}

/* 未达到的等级置灰 */
.roadmap-item:not(.roadmap-item--achieved) .roadmap-name,
.roadmap-item:not(.roadmap-item--achieved) .roadmap-icon {
  opacity: 0.45;
}

/* 当前等级高亮名称 */
.roadmap-item--current .roadmap-name {
  color: var(--color-primary);
  font-weight: 700;
}
</style>
