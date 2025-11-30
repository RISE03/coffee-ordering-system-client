<template>
  <div class="shape-background absolute inset-0 overflow-hidden">
    <!-- 背景渐变 -->
    <div class="absolute inset-0 bg-gradient" />

    <!-- 浮动咖啡点心图标 -->
    <CoffeeIcon
      icon="coffee"
      :delay="0.3"
      :size="100"
      :rotate="-12"
      class="top-[12%] left-[8%] opacity-70"
    />

    <CoffeeIcon
      icon="donut"
      :delay="0.5"
      :size="80"
      :rotate="15"
      class="top-[65%] right-[10%] opacity-60"
    />

    <CoffeeIcon
      icon="cupcake"
      :delay="0.4"
      :size="70"
      :rotate="-8"
      class="top-[35%] left-[5%] opacity-50"
    />

    <CoffeeIcon
      icon="cookie"
      :delay="0.6"
      :size="60"
      :rotate="20"
      class="top-[20%] right-[15%] opacity-50"
    />

    <CoffeeIcon
      icon="croissant"
      :delay="0.7"
      :size="75"
      :rotate="-15"
      class="bottom-[25%] left-[15%] opacity-55"
    />

    <CoffeeIcon
      icon="cake"
      :delay="0.8"
      :size="65"
      :rotate="10"
      class="bottom-[40%] right-[8%] opacity-45"
    />

    <!-- 额外的小图标装饰 -->
    <CoffeeIcon
      icon="coffee"
      :delay="0.9"
      :size="50"
      :rotate="25"
      class="top-[50%] right-[25%] opacity-35"
    />

    <CoffeeIcon
      icon="donut"
      :delay="1.0"
      :size="45"
      :rotate="-25"
      class="bottom-[15%] right-[30%] opacity-40"
    />

    <!-- 背景叠加层（增强对比度） -->
    <div class="absolute inset-0 bg-overlay" />
  </div>
</template>

<script setup lang="ts">
import CoffeeIcon from './CoffeeIcon.vue'
</script>

<style scoped>
.shape-background {
  z-index: 0;
  pointer-events: none;
}

/* 让图标可以接收鼠标事件 */
.shape-background :deep(.coffee-icon) {
  pointer-events: auto;
  cursor: pointer;
}

/* 深色主题背景渐变 */
.bg-gradient {
  background: linear-gradient(
    135deg,
    #030712 0%,
    #0a0f1a 25%,
    #111827 50%,
    #0a0f1a 75%,
    #030712 100%
  );
}

/* 深色主题叠加层 */
.bg-overlay {
  background: radial-gradient(
    ellipse at 50% 50%,
    transparent 0%,
    rgba(3, 7, 18, 0.4) 100%
  );
}

/* 浅色主题（朝暮 Dawn）背景渐变 */
:root[data-theme="dawn"] .bg-gradient {
  background: linear-gradient(
    135deg,
    #FCF9F2 0%,
    #F7F3E8 25%,
    #F5E6D3 50%,
    #F7F3E8 75%,
    #FCF9F2 100%
  );
}

/* 浅色主题叠加层 */
:root[data-theme="dawn"] .bg-overlay {
  background: radial-gradient(
    ellipse at 50% 50%,
    transparent 0%,
    rgba(252, 249, 242, 0.3) 100%
  );
}
</style>
