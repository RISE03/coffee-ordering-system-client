<template>
  <n-layout-footer class="py-6 px-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-center transition-colors duration-300">
    <div class="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center">
      <div class="mb-4 md:mb-0">
        <span class="text-lg font-serif text-primary-700 dark:text-primary-500">Dawn & Dusk</span>
        <p class="text-xs text-gray-500 mt-1">朝暮咖啡 · 品味时光的流转</p>
      </div>
      
      <div class="text-sm text-gray-500">
        <p>&copy; {{ new Date().getFullYear() }} Dawn & Dusk Cafe. All rights reserved.</p>
      </div>
    </div>
  </n-layout-footer>
</template>

<script setup lang="ts">
import { NLayoutFooter } from 'naive-ui'
</script>
