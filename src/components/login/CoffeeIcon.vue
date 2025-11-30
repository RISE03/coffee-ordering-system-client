<template>
  <div
    class="coffee-icon absolute"
    :class="className"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${delay}s`,
      '--rotate': `${rotate}deg`,
    }"
  >
    <div class="icon-inner w-full h-full flex items-center justify-center">
      <!-- 咖啡杯 -->
      <svg v-if="icon === 'coffee'" viewBox="0 0 24 24" fill="currentColor" class="icon-svg">
        <path d="M2 21V19H20V21H2ZM20 8V5H22V8C22 9.1 21.55 10.1 20.83 10.83C20.1 11.55 19.1 12 18 12H17.82C17.4 14.84 14.96 17 12 17H6C3.24 17 1 14.76 1 12V8H20ZM18 10C18.55 10 19 9.55 19 9V7H17V10H18ZM3 10V12C3 13.66 4.34 15 6 15H12C13.66 15 15 13.66 15 12V10H3Z"/>
      </svg>

      <!-- 甜甜圈 -->
      <svg v-else-if="icon === 'donut'" viewBox="0 0 24 24" fill="currentColor" class="icon-svg">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="4"/>
        <circle cx="12" cy="12" r="4" fill="currentColor"/>
        <circle cx="8" cy="8" r="1.5" class="sprinkle"/>
        <circle cx="16" cy="9" r="1.5" class="sprinkle"/>
        <circle cx="15" cy="15" r="1.5" class="sprinkle"/>
        <circle cx="9" cy="16" r="1.5" class="sprinkle"/>
      </svg>

      <!-- 杯子蛋糕 -->
      <svg v-else-if="icon === 'cupcake'" viewBox="0 0 24 24" fill="currentColor" class="icon-svg">
        <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 7.5 7.8 8.4 8.3 9.1C6.4 9.5 5 11.1 5 13C5 13.3 5 13.7 5.1 14H18.9C19 13.7 19 13.3 19 13C19 11.1 17.6 9.5 15.7 9.1C16.2 8.4 16.5 7.5 16.5 6.5C16.5 4 14.5 2 12 2Z"/>
        <path d="M6 15L7 22H17L18 15H6Z"/>
      </svg>

      <!-- 饼干 -->
      <svg v-else-if="icon === 'cookie'" viewBox="0 0 24 24" fill="currentColor" class="icon-svg">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="8" cy="9" r="1.5" class="chip"/>
        <circle cx="14" cy="8" r="1.5" class="chip"/>
        <circle cx="10" cy="14" r="1.5" class="chip"/>
        <circle cx="15" cy="13" r="1.5" class="chip"/>
        <circle cx="12" cy="17" r="1.5" class="chip"/>
      </svg>

      <!-- 牛角包 -->
      <svg v-else-if="icon === 'croissant'" viewBox="0 0 24 24" fill="currentColor" class="icon-svg">
        <path d="M22 12C22 12 21 11 19 11C17 11 15 12 12 12C9 12 7 11 5 11C3 11 2 12 2 12C2 12 3 17 5 19C7 21 9 21 12 21C15 21 17 21 19 19C21 17 22 12 22 12Z"/>
        <path d="M12 3C10 3 8 4 7 6C6 8 6 10 7 11C8 10.5 10 10 12 10C14 10 16 10.5 17 11C18 10 18 8 17 6C16 4 14 3 12 3Z" opacity="0.7"/>
      </svg>

      <!-- 蛋糕片 -->
      <svg v-else-if="icon === 'cake'" viewBox="0 0 24 24" fill="currentColor" class="icon-svg">
        <path d="M12 6C13.1 6 14 5.1 14 4C14 3.6 13.9 3.2 13.7 2.9L12 0L10.3 2.9C10.1 3.2 10 3.6 10 4C10 5.1 10.9 6 12 6Z"/>
        <path d="M18 9H6C4.3 9 3 10.3 3 12V21C3 21.6 3.4 22 4 22H20C20.6 22 21 21.6 21 21V12C21 10.3 19.7 9 18 9Z"/>
        <path d="M3 14H21V16H3V14Z" opacity="0.5"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: 'coffee' | 'donut' | 'cupcake' | 'cookie' | 'croissant' | 'cake'
  delay?: number
  size?: number
  rotate?: number
  className?: string
}

withDefaults(defineProps<Props>(), {
  delay: 0,
  size: 60,
  rotate: 0,
  className: '',
})
</script>

<style scoped>
.coffee-icon {
  animation: icon-entrance 1.2s ease-out forwards, icon-float 12s ease-in-out infinite;
  animation-delay: var(--delay, 0s), calc(var(--delay, 0s) + 1.2s);
  opacity: 0;
  transform: translateY(-150px) rotate(var(--rotate, 0deg));
  will-change: transform, opacity;
}

@keyframes icon-entrance {
  0% {
    opacity: 0;
    transform: translateY(-150px) rotate(var(--rotate, 0deg));
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(var(--rotate, 0deg));
  }
}

@keyframes icon-float {
  0%, 100% {
    transform: translateY(0) rotate(var(--rotate, 0deg));
  }
  50% {
    transform: translateY(15px) rotate(var(--rotate, 0deg));
  }
}

.icon-inner {
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  border-radius: 50%;
  background: linear-gradient(135deg,
    rgba(139, 92, 246, 0.2) 0%,
    rgba(99, 102, 241, 0.15) 50%,
    rgba(139, 92, 246, 0.1) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 0 32px rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

/* 悬停效果：放大 + 发光 + 轻微旋转 */
.coffee-icon:hover .icon-inner {
  transform: scale(1.15) rotate(8deg);
  box-shadow:
    0 12px 40px rgba(139, 92, 246, 0.3),
    0 0 20px rgba(139, 92, 246, 0.2),
    inset 0 0 32px rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.icon-svg {
  width: 50%;
  height: 50%;
  color: rgba(255, 255, 255, 0.6);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.sprinkle {
  fill: rgba(251, 191, 36, 0.8);
}

.chip {
  fill: rgba(93, 64, 55, 0.9);
}

/* 浅色主题（朝暮 Dawn） */
:root[data-theme="dawn"] .icon-inner {
  background: linear-gradient(135deg,
    rgba(245, 176, 65, 0.25) 0%,
    rgba(224, 157, 43, 0.15) 50%,
    rgba(245, 176, 65, 0.1) 100%
  );
  border-color: rgba(93, 64, 55, 0.15);
  box-shadow:
    0 8px 32px rgba(93, 64, 55, 0.08),
    inset 0 0 32px rgba(255, 255, 255, 0.2);
}

:root[data-theme="dawn"] .icon-svg {
  color: rgba(93, 64, 55, 0.5);
  filter: drop-shadow(0 2px 4px rgba(93, 64, 55, 0.15));
}

:root[data-theme="dawn"] .sprinkle {
  fill: rgba(244, 63, 94, 0.7);
}

:root[data-theme="dawn"] .chip {
  fill: rgba(93, 64, 55, 0.7);
}

/* Dawn 主题悬停效果 */
:root[data-theme="dawn"] .coffee-icon:hover .icon-inner {
  transform: scale(1.15) rotate(8deg);
  box-shadow:
    0 12px 40px rgba(245, 176, 65, 0.35),
    0 0 20px rgba(224, 157, 43, 0.25),
    inset 0 0 32px rgba(255, 255, 255, 0.25);
  border-color: rgba(93, 64, 55, 0.3);
}
</style>
