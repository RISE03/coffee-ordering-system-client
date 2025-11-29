<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <n-spin :size="size">
      <template #description v-if="description">
        <span class="text-gray-500 dark:text-gray-400 mt-2 block">{{ description }}</span>
      </template>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { NSpin } from 'naive-ui'
import { computed } from 'vue'

interface Props {
  size?: 'small' | 'medium' | 'large'
  description?: string
  fullHeight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  fullHeight: false
})

const containerClass = computed(() => ({
  'min-h-[60vh]': props.fullHeight
}))
</script>
