<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header / User Info -->
      <div class="bg-white dark:bg-gray-800 rounded-brand shadow-sm p-6 mb-6 flex items-center space-x-6">
        <n-avatar 
          round 
          :size="80" 
          :src="authStore.user?.avatar"
          class="border-4 border-primary-100 dark:border-primary-900"
        />
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {{ authStore.user?.nickname || authStore.user?.username }}
          </h1>
          <div class="flex items-center space-x-2 text-sm">
            <span class="px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium">
              {{ authStore.user?.levelName || '会员' }}
            </span>
            <span class="text-gray-500">ID: {{ authStore.user?.id }}</span>
          </div>
        </div>
        <div>
          <n-button @click="handleLogout">退出登录</n-button>
        </div>
      </div>

      <!-- Dashboard Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Orders Stub -->
        <div class="bg-white dark:bg-gray-800 rounded-brand shadow-sm p-6">
          <h3 class="text-lg font-bold mb-4 flex items-center">
            <n-icon class="mr-2 text-primary"><ReceiptOutline /></n-icon>
            我的订单
          </h3>
          <p class="text-gray-500 text-sm mb-4">查看历史订单记录</p>
          <n-button block dashed disabled>功能开发中</n-button>
        </div>

        <!-- Points Stub -->
        <div class="bg-white dark:bg-gray-800 rounded-brand shadow-sm p-6">
          <h3 class="text-lg font-bold mb-4 flex items-center">
            <n-icon class="mr-2 text-yellow-500"><TimeOutline /></n-icon>
            光阴值 (积分)
          </h3>
          <p class="text-gray-500 text-sm mb-4">当前可用: 0</p>
          <n-button block dashed disabled>积分商城 (即将开放)</n-button>
        </div>

        <!-- Coupons Stub -->
        <div class="bg-white dark:bg-gray-800 rounded-brand shadow-sm p-6">
          <h3 class="text-lg font-bold mb-4 flex items-center">
            <n-icon class="mr-2 text-red-500"><TicketOutline /></n-icon>
            优惠券
          </h3>
          <p class="text-gray-500 text-sm mb-4">暂无可用优惠券</p>
          <n-button block dashed disabled>查看全部</n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NAvatar, NIcon, useMessage } from 'naive-ui'
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
