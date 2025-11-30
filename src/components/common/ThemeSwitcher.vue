<template>
  <div
    class="theme-switcher"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <!-- 主按钮（显示当前模式） -->
    <button
      class="theme-btn main-btn"
      :class="{ expanded: isExpanded }"
      aria-label="切换主题"
    >
      <NIcon :component="currentIcon" class="icon" />
    </button>

    <!-- 展开的选项按钮（向下弹出，浮动定位） -->
    <Transition name="dropdown">
      <div v-show="isExpanded" class="dropdown-options">
        <!-- 自动模式 -->
        <button
          v-if="themeStore.mode !== 'auto'"
          @click="themeStore.setMode('auto')"
          class="theme-btn"
          aria-label="自动模式"
        >
          <NIcon :component="TimeOutline" class="icon" />
        </button>

        <!-- 朝（Dawn）模式 -->
        <button
          v-if="themeStore.mode !== 'dawn'"
          @click="themeStore.setMode('dawn')"
          class="theme-btn"
          aria-label="朝模式"
        >
          <NIcon :component="SunnyOutline" class="icon" />
        </button>

        <!-- 暮（Dusk）模式 -->
        <button
          v-if="themeStore.mode !== 'dusk'"
          @click="themeStore.setMode('dusk')"
          class="theme-btn"
          aria-label="暮模式"
        >
          <NIcon :component="MoonOutline" class="icon" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NIcon } from 'naive-ui'
import { SunnyOutline, MoonOutline, TimeOutline } from '@vicons/ionicons5'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const isExpanded = ref(false)

// 根据当前模式显示对应图标
const currentIcon = computed(() => {
  switch (themeStore.mode) {
    case 'dawn':
      return SunnyOutline
    case 'dusk':
      return MoonOutline
    case 'auto':
    default:
      return TimeOutline
  }
})
</script>

<style scoped>
.theme-switcher {
  position: relative;
  display: inline-flex;
}

/* 下拉选项容器 - 绝对定位，浮动在页面上方 */
.dropdown-options {
  position: absolute;
  top: calc(100% + 8px);
  right: -8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border-radius: 16px;
  z-index: 1000;

  /* 毛玻璃背景 */
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  /* 毛玻璃效果 */
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.theme-btn:hover {
  transform: scale(1.08);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.theme-btn:active {
  transform: scale(0.95);
}

/* 主按钮展开时的高亮边框 */
.main-btn.expanded {
  border: 2px solid var(--color-primary);
  box-shadow: 0 0 12px rgba(var(--color-primary-rgb, 139, 90, 43), 0.4);
}

.icon {
  font-size: 18px;
  color: var(--color-primary);
}

/* Dawn 主题适配 */
:root[data-theme="dawn"] .dropdown-options {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(93, 64, 55, 0.15);
  box-shadow: 0 8px 32px rgba(93, 64, 55, 0.12);
}

:root[data-theme="dawn"] .theme-btn {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(93, 64, 55, 0.15);
  box-shadow: 0 4px 16px rgba(93, 64, 55, 0.1);
}

:root[data-theme="dawn"] .theme-btn:hover {
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 6px 20px rgba(93, 64, 55, 0.15);
}

:root[data-theme="dawn"] .main-btn.expanded {
  border: 2px solid var(--color-primary);
  box-shadow: 0 0 12px rgba(245, 176, 65, 0.5);
}

/* 下拉动画 - 弹跳效果 */
.dropdown-enter-active {
  animation: dropdown-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dropdown-leave-active {
  animation: dropdown-out 0.2s ease-in;
}

@keyframes dropdown-in {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.8);
  }
  60% {
    transform: translateY(4px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes dropdown-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-8px) scale(0.9);
  }
}

/* 选项按钮的交错动画 */
.dropdown-options .theme-btn:nth-child(1) {
  animation: item-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both;
}

.dropdown-options .theme-btn:nth-child(2) {
  animation: item-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}

@keyframes item-in {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
