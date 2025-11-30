<template>
  <div
    class="elegant-shape absolute"
    :class="className"
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      animationDelay: `${delay}s`,
      '--rotate': `${rotate}deg`,
    }"
  >
    <div
      class="shape-inner w-full h-full rounded-full"
      :class="gradientClass"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'quinary'
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  delay: 0,
  width: 400,
  height: 100,
  rotate: 0,
  gradient: 'primary',
  className: '',
})

const gradientClass = computed(() => {
  const gradientMap = {
    primary: 'gradient-primary',
    secondary: 'gradient-secondary',
    tertiary: 'gradient-tertiary',
    quaternary: 'gradient-quaternary',
    quinary: 'gradient-quinary',
  }
  return gradientMap[props.gradient]
})
</script>

<style scoped>
.elegant-shape {
  animation: shape-entrance 1.2s ease-out forwards, shape-float 12s ease-in-out infinite;
  animation-delay: var(--delay, 0s), calc(var(--delay, 0s) + 1.2s);
  opacity: 0;
  transform: translateY(-150px) rotate(var(--rotate, 0deg));
  will-change: transform, opacity;
}

@keyframes shape-entrance {
  0% {
    opacity: 0;
    transform: translateY(-150px) rotate(var(--rotate, 0deg));
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(var(--rotate, 0deg));
  }
}

@keyframes shape-float {
  0%, 100% {
    transform: translateY(0) rotate(var(--rotate, 0deg));
  }
  50% {
    transform: translateY(15px) rotate(var(--rotate, 0deg));
  }
}

.shape-inner {
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 0 32px rgba(255, 255, 255, 0.1);
}

/* 深色主题渐变 */
.gradient-primary {
  background: linear-gradient(135deg,
    rgba(99, 102, 241, 0.3) 0%,
    rgba(139, 92, 246, 0.2) 50%,
    rgba(99, 102, 241, 0.1) 100%
  );
}

.gradient-secondary {
  background: linear-gradient(135deg,
    rgba(244, 63, 94, 0.3) 0%,
    rgba(251, 113, 133, 0.2) 50%,
    rgba(244, 63, 94, 0.1) 100%
  );
}

.gradient-tertiary {
  background: linear-gradient(135deg,
    rgba(139, 92, 246, 0.3) 0%,
    rgba(167, 139, 250, 0.2) 50%,
    rgba(139, 92, 246, 0.1) 100%
  );
}

.gradient-quaternary {
  background: linear-gradient(135deg,
    rgba(251, 191, 36, 0.3) 0%,
    rgba(252, 211, 77, 0.2) 50%,
    rgba(251, 191, 36, 0.1) 100%
  );
}

.gradient-quinary {
  background: linear-gradient(135deg,
    rgba(34, 211, 238, 0.3) 0%,
    rgba(103, 232, 249, 0.2) 50%,
    rgba(34, 211, 238, 0.1) 100%
  );
}

/* 浅色主题渐变（朝暮主题适配） */
:root[data-theme="dawn"] .gradient-primary {
  background: linear-gradient(135deg,
    rgba(245, 176, 65, 0.4) 0%,
    rgba(224, 157, 43, 0.25) 50%,
    rgba(245, 176, 65, 0.15) 100%
  );
}

:root[data-theme="dawn"] .gradient-secondary {
  background: linear-gradient(135deg,
    rgba(139, 90, 43, 0.35) 0%,
    rgba(141, 110, 99, 0.2) 50%,
    rgba(139, 90, 43, 0.1) 100%
  );
}

:root[data-theme="dawn"] .gradient-tertiary {
  background: linear-gradient(135deg,
    rgba(232, 199, 139, 0.4) 0%,
    rgba(245, 230, 211, 0.25) 50%,
    rgba(232, 199, 139, 0.15) 100%
  );
}

:root[data-theme="dawn"] .gradient-quaternary {
  background: linear-gradient(135deg,
    rgba(93, 64, 55, 0.3) 0%,
    rgba(141, 110, 99, 0.2) 50%,
    rgba(93, 64, 55, 0.1) 100%
  );
}

:root[data-theme="dawn"] .gradient-quinary {
  background: linear-gradient(135deg,
    rgba(247, 243, 232, 0.5) 0%,
    rgba(252, 249, 242, 0.3) 50%,
    rgba(247, 243, 232, 0.2) 100%
  );
}

:root[data-theme="dawn"] .shape-inner {
  border-color: rgba(93, 64, 55, 0.1);
  box-shadow:
    0 8px 32px rgba(93, 64, 55, 0.08),
    inset 0 0 32px rgba(255, 255, 255, 0.2);
}
</style>
