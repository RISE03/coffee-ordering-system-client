<template>
  <div class="container mx-auto px-4 py-8 min-h-screen">
    <!-- Page Header -->
    <div class="mb-8 text-center md:text-left">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">全日菜单</h1>
      <p class="text-gray-500 dark:text-gray-400">探索我们为您精心准备的美味。</p>
      <div class="flex flex-wrap gap-3 mt-4">
        <n-button type="primary" ghost @click="$router.push('/member/cart')">
          前往购物车
        </n-button>
        <n-button tertiary @click="$router.push('/member/checkout')">
          去结算
        </n-button>
        <n-button quaternary @click="$router.push('/member/orders')">
          我的订单
        </n-button>
      </div>
    </div>

    <div class="flex flex-col md:flex-row gap-8">
      <!-- Sidebar / Filters (Placeholder) -->
      <aside class="w-full md:w-64 flex-shrink-0">
        <div class="sticky top-20 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 class="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">分类</h2>
          <div class="space-y-2">
            <div 
              v-for="category in ['全部商品', '晨曦咖啡', '午后茗茶', '微醺特调', '精致甜点']" 
              :key="category"
              class="px-3 py-2 rounded cursor-pointer hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              :class="{ 'bg-primary-50 text-primary-600 font-medium dark:bg-gray-700 dark:text-primary-400': category === '全部商品' }"
            >
              {{ category }}
            </div>
          </div>
        </div>
      </aside>

      <!-- Product Grid (Placeholder) -->
      <main class="flex-1">
        <!-- Empty State / Placeholder Message -->
        <div class="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded flex items-center">
          <span class="mr-2">ℹ️</span>
          <span>当前展示为菜单页面骨架，真实商品数据将在后续里程碑中接入。</span>
        </div>

        <!-- Skeleton Grid -->
        <n-grid x-gap="24" y-gap="24" cols="1 s:2 m:3" responsive="screen">
          <n-grid-item v-for="n in 6" :key="n">
            <n-card class="h-full hover:-translate-y-1 transition-transform duration-300">
              <template #cover>
                <div class="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center text-gray-400">
                  Product Image
                </div>
              </template>
              <div class="space-y-3">
                <n-skeleton text width="60%" />
                <n-skeleton text width="90%" :repeat="2" />
                <div class="flex justify-between items-center mt-4">
                  <n-skeleton text width="30%" />
                  <n-skeleton circle size="medium" />
                </div>
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NGrid, NGridItem, NCard, NSkeleton, NButton } from 'naive-ui'
</script>
