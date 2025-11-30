<template>
  <div class="container mx-auto px-4 py-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header / User Info - Glassmorphism Style -->
      <div class="glass-card p-6 mb-4 flex items-center gap-4">
        <n-avatar
          round
          :size="72"
          :src="authStore.user?.avatar"
          class="border-2 border-[var(--color-primary)] border-opacity-30 flex-shrink-0"
        />
        <div class="flex-1 min-w-0">
          <h1 class="text-xl font-bold text-[var(--color-text)] mb-1 truncate">
            {{ authStore.user?.nickname || authStore.user?.username }}
          </h1>
          <div class="flex items-center gap-2 text-sm flex-wrap">
            <span class="px-2 py-0.5 rounded-full bg-[var(--color-primary)] bg-opacity-20 text-[var(--color-primary)] font-medium text-xs">
              {{ authStore.user?.levelName || '会员' }}
            </span>
            <span class="text-[var(--color-text-secondary)] text-xs">ID: {{ authStore.user?.id }}</span>
          </div>
        </div>
        <button class="glass-button text-sm text-[var(--color-text-secondary)]" @click="handleLogout">
          退出登录
        </button>
      </div>

      <!-- Dashboard Grid - Glassmorphism Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Orders Card -->
        <div class="glass-card product-card-hover p-5">
          <h3 class="text-base font-bold mb-3 flex items-center text-[var(--color-text)]">
            <n-icon class="mr-2 text-[var(--color-primary)]"><ReceiptOutline /></n-icon>
            我的订单
          </h3>
          <p class="text-[var(--color-text-secondary)] text-sm mb-4">查看历史订单记录</p>
          <button
            class="w-full glass-button text-sm text-[var(--color-primary)]"
            @click="$router.push('/member/orders')"
          >
            查看订单
          </button>
        </div>

        <!-- Points Card -->
        <div class="glass-card product-card-hover p-5">
          <h3 class="text-base font-bold mb-3 flex items-center text-[var(--color-text)]">
            <n-icon class="mr-2 text-[var(--color-primary)]"><TimeOutline /></n-icon>
            光阴值 (积分)
          </h3>
          <p class="text-[var(--color-text-secondary)] text-sm mb-4">当前可用: 0</p>
          <button class="w-full glass-button text-sm text-[var(--color-text-secondary)] opacity-60" disabled>
            积分商城 (即将开放)
          </button>
        </div>

        <!-- Coupons Card -->
        <div class="glass-card product-card-hover p-5">
          <h3 class="text-base font-bold mb-3 flex items-center text-[var(--color-text)]">
            <n-icon class="mr-2 text-[var(--color-primary)]"><TicketOutline /></n-icon>
            优惠券
          </h3>
          <p class="text-[var(--color-text-secondary)] text-sm mb-4">暂无可用优惠券</p>
          <button class="w-full glass-button text-sm text-[var(--color-text-secondary)] opacity-60" disabled>
            查看全部
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NAvatar, NIcon, useMessage } from 'naive-ui'
import { ReceiptOutline, TimeOutline, TicketOutline } from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const message = useMessage()

const handleLogout = async () => {
  await authStore.logout()
  message.success('已退出登录')
  router.push('/login')
}
</script>
