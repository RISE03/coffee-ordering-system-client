<template>
  <div class="min-h-[calc(100vh-64px)] flex flex-col">
    <!-- Hero Section -->
    <section class="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <div class="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        <!-- Brand Title -->
        <h1 class="text-5xl md:text-7xl font-serif font-bold text-gray-900 dark:text-white tracking-wide">
          <span class="block mb-2 text-primary-600 dark:text-primary-400">Dawn & Dusk</span>
          <span class="text-3xl md:text-4xl font-normal opacity-80">朝 · 暮</span>
        </h1>
        
        <!-- Slogan -->
        <p class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
          <span v-if="themeStore.activeTheme === 'dawn'">
            清晨的第一缕阳光，唤醒城市的味蕾。<br>
            Dawn brings the light, and coffee brings the life.
          </span>
          <span v-else>
            夜幕降临时的微醺，安抚疲惫的灵魂。<br>
            Dusk brings the peace, and tea brings the comfort.
          </span>
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <n-button type="primary" size="large" class="px-8 py-6 text-lg" @click="$router.push('/menu')">
            浏览菜单
          </n-button>
          <n-button
            size="large"
            ghost
            class="px-8 py-6 text-lg"
            @click="$router.push('/member/cart')"
          >
            {{ authStore.isLoggedIn ? '查看购物车' : '去购物车（登录后返回）' }}
          </n-button>
          <n-button
            v-if="authStore.isLoggedIn"
            size="large"
            tertiary
            class="px-8 py-6 text-lg"
            @click="$router.push('/member/orders')"
          >
            我的订单
          </n-button>
        </div>
      </div>
    </section>

    <!-- Info Section (Placeholder) -->
    <section class="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
      <div class="container mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
        <div class="p-6 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div class="text-4xl mb-4">☕</div>
          <h3 class="text-xl font-bold mb-2 dark:text-white">精品咖啡</h3>
          <p class="text-gray-500 dark:text-gray-300">严选阿拉比卡豆，大师级烘焙。</p>
        </div>
        <div class="p-6 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div class="text-4xl mb-4">🍵</div>
          <h3 class="text-xl font-bold mb-2 dark:text-white">原叶茗茶</h3>
          <p class="text-gray-500 dark:text-gray-300">来自高山的纯净，一口回甘。</p>
        </div>
        <div class="p-6 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div class="text-4xl mb-4">🍰</div>
          <h3 class="text-xl font-bold mb-2 dark:text-white">精致甜点</h3>
          <p class="text-gray-500 dark:text-gray-300">每日现做，甜蜜你的时光。</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { NButton } from 'naive-ui'

const themeStore = useThemeStore()
const authStore = useAuthStore()
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
