<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Page Header - Glassmorphism Style -->
    <div class="glass-card p-6 mb-6 text-center md:text-left">
      <h1 class="text-2xl font-bold text-[var(--color-text)] mb-2">全日菜单</h1>
      <p class="text-[var(--color-text-secondary)] text-sm mb-4">探索我们为您精心准备的美味。</p>
      <div class="flex flex-wrap gap-3 justify-center md:justify-start">
        <button
          class="glass-button text-sm font-medium text-[var(--color-primary)]"
          @click="$router.push('/member/cart')"
        >
          前往购物车
        </button>
        <button
          class="glass-button text-sm font-medium text-[var(--color-text-secondary)]"
          @click="$router.push('/member/checkout')"
        >
          去结算
        </button>
        <button
          class="glass-button text-sm font-medium text-[var(--color-text-secondary)]"
          @click="$router.push('/member/orders')"
        >
          我的订单
        </button>
      </div>
    </div>

    <div class="flex flex-col md:flex-row gap-6">
      <!-- Sidebar / Filters - Glassmorphism Style -->
      <aside class="w-full md:w-56 flex-shrink-0">
        <div class="glass-card sticky top-24 p-4">
          <h2 class="font-bold text-lg mb-4 text-[var(--color-text)]">分类</h2>
          <div class="space-y-2">
            <div
              v-for="category in categories"
              :key="category"
              class="px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 text-[var(--color-text-secondary)]"
              :class="selectedCategory === category
                ? 'bg-[var(--color-primary)] text-[var(--color-bg)] font-medium shadow-sm'
                : 'hover:bg-[var(--glass-bg-hover)]'"
              @click="selectedCategory = category"
            >
              {{ category }}
            </div>
          </div>
        </div>
      </aside>

      <!-- Product Grid - Glassmorphism Cards -->
      <main class="flex-1">
        <!-- Info Message - Glassmorphism Style -->
        <div class="glass-light mb-6 p-4 flex items-center text-sm text-[var(--color-text-secondary)]">
          <span class="mr-2 text-[var(--color-primary)]">ℹ️</span>
          <span>当前展示为菜单页面骨架，真实商品数据将在后续里程碑中接入。</span>
        </div>

        <!-- Product Grid with Glass Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div
            v-for="n in 6"
            :key="n"
            class="glass-card product-card-hover p-0 overflow-hidden"
          >
            <!-- Product Image Placeholder -->
            <div class="aspect-square bg-[var(--glass-bg-hover)] flex items-center justify-center">
              <span class="text-[var(--color-text-secondary)] text-sm opacity-50">商品图片</span>
            </div>
            <!-- Product Info -->
            <div class="p-3 space-y-2">
              <div class="h-4 bg-[var(--glass-bg-hover)] rounded w-3/4 animate-pulse"></div>
              <div class="h-3 bg-[var(--glass-bg-hover)] rounded w-1/2 animate-pulse"></div>
              <div class="flex justify-between items-center pt-2">
                <div class="h-5 bg-[var(--color-primary)] bg-opacity-20 rounded w-1/4 animate-pulse"></div>
                <div class="w-8 h-8 rounded-full bg-[var(--color-primary)] bg-opacity-20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const categories = ['全部商品', '晨曦咖啡', '午后茗茶', '微醺特调', '精致甜点']
const selectedCategory = ref('全部商品')
</script>
