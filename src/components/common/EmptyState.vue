<script setup lang="ts">
import { NButton } from 'naive-ui'

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
    <NButton
      v-if="!props.hideAction"
      type="primary"
      size="medium"
      ghost
      class="action"
      @click="emit('action')"
    >
      {{ props.actionText }}
    </NButton>
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
  background: linear-gradient(
    145deg,
    rgba(var(--color-primary-rgb, 245, 176, 65), 0.08),
    rgba(var(--color-primary-rgb, 245, 176, 65), 0.03)
  );
  border: 1px dashed var(--color-border);
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

.action {
  margin-top: 0.5rem;
}
</style>
