<template>
  <div class="container mx-auto px-4 py-6">
    <div class="max-w-lg mx-auto flex flex-col gap-4">

      <!-- 1. 头像 Hero 卡片 -->
      <div class="hero-card glass-card" :class="{ 'hero-card--dusk': themeStore.isDusk }">
        <div class="flex flex-col items-center pt-8 pb-5 px-5 relative z-[1]">
          <n-avatar
            round
            :size="80"
            :src="authStore.user?.avatar"
            class="profile-avatar"
          />
          <h1 class="text-xl font-bold text-[var(--color-text)] mt-3 truncate max-w-[80%] text-center">
            {{ authStore.user?.nickname || authStore.user?.username }}
          </h1>
          <span
            class="level-badge mt-2"
            :class="`level-${authStore.user?.level ?? 1}`"
          >
            Lv.{{ authStore.user?.level }} {{ authStore.user?.levelName || '会员' }}
          </span>
          <span class="text-xs text-[var(--color-text-secondary)] mt-1.5">
            ID: {{ authStore.user?.id }}
          </span>
        </div>
      </div>

      <!-- 2. 数据统计条 -->
      <!-- 2. 数据统计条 —— 主次突出型 -->
      <div class="glass-card points-card">
        <div class="points-main">
          <n-icon :size="18" class="points-main-icon"><TimeOutline /></n-icon>
          <span class="points-main-label">光阴值</span>
          <span class="points-main-value">{{ pointsInfo?.balance ?? '--' }}</span>
          <span class="points-main-sub">可用余额</span>
        </div>
        <div class="points-footer">
          <span class="points-footer-text">累计获得</span>
          <span class="points-footer-value">{{ pointsInfo?.totalEarned ?? '--' }}</span>
        </div>
      </div>

      <!-- 3. 功能菜单列表 -->
      <div class="glass-card overflow-hidden">
        <!-- 我的足迹 -->
        <div class="menu-group-title">我的足迹</div>
        <div class="menu-item" @click="$router.push('/member/orders')">
          <n-icon :size="20" class="menu-icon"><ReceiptOutline /></n-icon>
          <span class="menu-text">时光账单</span>
          <n-icon :size="18" class="menu-arrow"><ChevronForwardOutline /></n-icon>
        </div>

        <!-- 分隔线 -->
        <div class="menu-divider" />

        <!-- 专属好礼 -->
        <div class="menu-group-title">专属好礼</div>
        <div class="menu-item" @click="handleComingSoon">
          <n-icon :size="20" class="menu-icon"><TimeOutline /></n-icon>
          <span class="menu-text">光阴小铺</span>
          <span class="coming-soon-tag">即将开放</span>
        </div>
        <div class="menu-item" @click="handleComingSoon">
          <n-icon :size="20" class="menu-icon"><TicketOutline /></n-icon>
          <span class="menu-text">晨暮福袋</span>
          <span class="coming-soon-tag">即将开放</span>
        </div>
      </div>

      <!-- 4. 退出登录按钮 -->
      <button class="logout-button" @click="handleLogout">
        <n-icon :size="18" class="mr-1.5"><LogOutOutline /></n-icon>
        退出登录
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NAvatar, NIcon, useMessage, useDialog } from 'naive-ui'
import {
  ReceiptOutline,
  TimeOutline,
  TicketOutline,
  ChevronForwardOutline,
  LogOutOutline,
} from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useRouter } from 'vue-router'
import { getMyPoints, type PointsInfo } from '@/api/user'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const pointsInfo = ref<PointsInfo | null>(null)

onMounted(async () => {
  try {
    pointsInfo.value = await getMyPoints()
  } catch (e) {
    console.error('获取积分信息失败', e)
  }
})

function handleComingSoon() {
  message.info('该功能即将开放，敬请期待')
}

function handleLogout() {
  dialog.warning({
    title: '确认退出',
    content: '确定要退出登录吗？',
    positiveText: '退出',
    negativeText: '取消',
    onPositiveClick: async () => {
      await authStore.logout()
      message.success('已退出登录')
      router.push('/login')
    },
  })
}
</script>

<style scoped>
/* Hero 卡片 —— 顶部柔光晕效果 */
.hero-card {
  position: relative;
  overflow: hidden;
}

.hero-card::before {
  content: '';
  position: absolute;
  top: -40%;
  left: 50%;
  translate: -50% 0;
  width: 120%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, #F5B041 28%, transparent) 0%,
    color-mix(in srgb, #E09D2B 12%, transparent) 40%,
    transparent 70%
  );
  pointer-events: none;
}

.hero-card--dusk::before {
  background: radial-gradient(
    circle,
    color-mix(in srgb, #FAD7A0 22%, transparent) 0%,
    color-mix(in srgb, #E8C78B 10%, transparent) 40%,
    transparent 70%
  );
}

/* 头像样式 —— 用 box-shadow 做柔和光晕，不需要外层包裹 */
.profile-avatar {
  border: 3px solid var(--color-bg) !important;
  box-shadow: 0 0 0 3px var(--color-primary),
              0 0 16px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

/* 等级徽章基础样式 */
.level-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
}

/* Lv.1 晨曦 - 柔橙渐变 */
.level-1 {
  background: linear-gradient(135deg, #FFB347, #FF8C42);
}

/* Lv.2 烈阳 - 明黄橙渐变 */
.level-2 {
  background: linear-gradient(135deg, #FFC107, #FF9800);
}

/* Lv.3 晚霞 - 粉紫渐变 */
.level-3 {
  background: linear-gradient(135deg, #E991C8, #9B59B6);
}

/* Lv.4 繁星 - 深蓝金渐变 */
.level-4 {
  background: linear-gradient(135deg, #2C3E50, #D4AC0D);
  color: #FAD7A0;
}

/* 统计卡片 —— 主次突出型 */
.points-card {
  padding: 0;
  overflow: hidden;
}

.points-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 20px 16px;
  gap: 2px;
}

.points-main-icon {
  color: var(--color-primary);
  margin-bottom: 2px;
}

.points-main-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.points-main-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.points-main-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
  opacity: 0.7;
}

.points-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-top: 1px solid var(--glass-border-subtle);
  background: color-mix(in srgb, var(--color-primary) 4%, transparent);
}

.points-footer-text {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.points-footer-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

/* 菜单组标题 */
.menu-group-title {
  padding: 12px 20px 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.5px;
}

/* 菜单项 */
.menu-item {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.menu-item:hover {
  background: var(--glass-bg-hover);
}

.menu-item:active {
  background: var(--glass-bg-strong);
}

.menu-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.menu-text {
  flex: 1;
  margin-left: 12px;
  font-size: 15px;
  color: var(--color-text);
}

.menu-arrow {
  color: var(--color-text-secondary);
  opacity: 0.5;
  flex-shrink: 0;
}

/* "即将开放"标签 */
.coming-soon-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-text-secondary) 12%, transparent);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

/* 菜单分隔线 */
.menu-divider {
  height: 1px;
  margin: 4px 20px;
  background: var(--glass-border-subtle);
}

/* 退出登录按钮 */
.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 500;
  color: #E74C3C;
  background: color-mix(in srgb, #E74C3C 8%, var(--glass-bg));
  border: 1px solid color-mix(in srgb, #E74C3C 20%, transparent);
  backdrop-filter: var(--glass-blur-sm);
  -webkit-backdrop-filter: var(--glass-blur-sm);
  transition: background 0.2s ease, transform 0.1s ease;
}

.logout-button:hover {
  background: color-mix(in srgb, #E74C3C 16%, var(--glass-bg));
}

.logout-button:active {
  transform: scale(0.98);
}
</style>
