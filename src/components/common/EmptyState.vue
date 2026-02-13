<script setup lang="ts">
interface Props {
  /** 主标题 */
  title?: string
  /** 描述文案 */
  description?: string
  /** 行动按钮文案 */
  actionText?: string
  /** 自定义图标（emoji 或文字） */
  icon?: string
  /** 是否隐藏行动按钮 */
  hideAction?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '这里有点安静',
  description: '去挑几样喜欢的，让今天更有味道。',
  actionText: '去逛逛',
  icon: '☕',
  hideAction: false
})

const emit = defineEmits<{
  (e: 'action'): void
}>()
</script>

<template>
  <div class="empty-state">
    <div class="icon">{{ props.icon }}</div>
    <h3 class="title">{{ props.title }}</h3>
    <p class="desc">{{ props.description }}</p>
    <button
      v-if="!props.hideAction"
      class="action-btn"
      @click="emit('action')"
    >
      {{ props.actionText }}
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2.5rem 1.5rem;
  border-radius: 1.25rem;
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur-md);
  -webkit-backdrop-filter: var(--glass-blur-md);
  border: 1px dashed var(--glass-border-subtle);
  box-shadow: var(--glass-shadow);
  color: var(--color-text);
}

.icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.action-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1.5rem;
  border-radius: 999px;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--color-primary);
  background: transparent;
  border: 1.5px solid var(--color-primary);
  box-shadow: none;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
}

.action-btn:hover {
  background: var(--color-primary);
  color: var(--color-bg);
  box-shadow: var(--glass-shadow);
}

.action-btn:active {
  transform: scale(0.97);
}
</style>
