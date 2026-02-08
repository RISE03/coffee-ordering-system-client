<script setup lang="ts">
interface Props {
  count?: number
}

withDefaults(defineProps<Props>(), {
  count: 6
})
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <div
      v-for="i in count"
      :key="i"
      class="glass-card rounded-2xl overflow-hidden flex flex-col h-full animate-pulse"
    >
      <!-- 图片骨架 -->
      <div class="aspect-square w-full bg-gradient-to-br from-[var(--glass-bg)] to-[var(--glass-bg-hover)] relative overflow-hidden">
        <div class="absolute inset-0 skeleton-shimmer"></div>
      </div>

      <!-- 内容骨架 -->
      <div class="p-3 flex-1 flex flex-col space-y-2">
        <!-- 标题 -->
        <div class="h-5 rounded-md bg-[var(--glass-bg-hover)] w-3/4 skeleton-shimmer"></div>
        <!-- 英文名 -->
        <div class="h-3 rounded-md bg-[var(--glass-bg-hover)] w-1/2 skeleton-shimmer"></div>
        <!-- 描述 -->
        <div class="space-y-1.5 flex-1">
          <div class="h-3 rounded-md bg-[var(--glass-bg-hover)] w-full skeleton-shimmer"></div>
          <div class="h-3 rounded-md bg-[var(--glass-bg-hover)] w-2/3 skeleton-shimmer"></div>
        </div>
        <!-- 价格和按钮 -->
        <div class="flex justify-between items-center mt-2 pt-2">
          <div class="h-6 rounded-md bg-[var(--glass-bg-hover)] w-16 skeleton-shimmer"></div>
          <div class="w-8 h-8 rounded-full bg-[var(--glass-bg-hover)] skeleton-shimmer"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-shimmer {
  position: relative;
  overflow: hidden;
}

.skeleton-shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 暗色主题下的闪烁效果 */
:root[data-theme="dusk"] .skeleton-shimmer::after {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.08) 50%,
    transparent 100%
  );
}
</style>
