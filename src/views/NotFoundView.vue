<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] p-4">
    <n-result
      status="404"
      title="404 资源不存在"
      description="生活总有遗憾，就像这杯咖啡还没做好。"
      size="huge"
    >
      <template #footer>
        <n-button type="primary" @click="$router.push('/')">
          回到首页
        </n-button>
      </template>
    </n-result>
  </div>
</template>

<script setup lang="ts">
import { NResult, NButton } from 'naive-ui'
</script>
