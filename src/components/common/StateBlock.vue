<script setup lang="ts">
import { NResult, NButton } from 'naive-ui'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

interface Props {
  loading?: boolean
  error?: any // Error object, boolean, or string
  empty?: boolean
  loadingText?: string
  emptyText?: string
  errorText?: string
  showRetry?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  empty: false,
  loadingText: '时光流转中...',
  emptyText: '这里空空如也，去别处看看吧。',
  errorText: '似乎遇到了一点小插曲。',
  showRetry: true
})

const emit = defineEmits<{
  (e: 'retry'): void
}>()

</script>

<template>
  <div class="state-block w-full h-full min-h-[200px] flex flex-col">
    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
      <slot name="loading">
        <LoadingSpinner size="large" :description="loadingText" />
      </slot>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center p-8">
      <slot name="error">
        <NResult
          status="500"
          :title="errorText"
          :description="typeof error === 'string' ? error : undefined"
          class="state-result"
        >
          <template #footer v-if="showRetry">
            <NButton @click="emit('retry')" type="primary" secondary>
              重试一下
            </NButton>
          </template>
        </NResult>
      </slot>
    </div>

    <!-- Empty State -->
    <div v-else-if="empty" class="flex-1 flex flex-col items-center justify-center p-8">
      <slot name="empty">
         <div class="text-center py-8">
            <div class="text-6xl mb-4 opacity-80">🍃</div>
            <p class="text-dawn-text-secondary dark:text-dusk-text-secondary text-lg">
              {{ emptyText }}
            </p>
            <div class="mt-6" v-if="$slots.emptyAction">
               <slot name="emptyAction"></slot>
            </div>
         </div>
      </slot>
    </div>

    <!-- Content State -->
    <div v-else class="w-full h-full">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
/* Override NResult text colors to match our theme if necessary */
.state-result {
  --n-title-text-color: var(--color-text) !important;
  --n-text-color: var(--color-text-secondary) !important;
}
</style>
