<script setup lang="ts">
import type { Category } from '@/types/product'

interface Props {
  categories: Category[]
  selectedCategoryId?: number | null
  theme?: 'dawn' | 'dusk'
}

withDefaults(defineProps<Props>(), {
  categories: () => [],
  selectedCategoryId: null,
  theme: 'dawn'
})

const emit = defineEmits<{
  (e: 'update:selectedCategoryId', id: number | null): void
  (e: 'select', id: number | null): void
}>()

const handleSelect = (id: number | null) => {
  emit('update:selectedCategoryId', id)
  emit('select', id)
}
</script>

<template>
  <div class="w-full overflow-x-auto hide-scrollbar px-4 py-2 sticky top-[60px] z-40 backdrop-blur-sm mask-linear-fade">
    <div class="flex gap-3 min-w-max pb-2 pt-1 px-1">
      <!-- All Categories Option -->
      <button
        @click="handleSelect(null)"
        class="px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border active:scale-95"
        :class="[
          selectedCategoryId === null
            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-lg transform scale-105'
            : 'glass-light text-[var(--color-text-secondary)] border-transparent hover:bg-[var(--glass-bg-hover)] hover:text-[var(--color-text)]'
        ]"
      >
        全部
      </button>

      <!-- Category Items -->
      <button
        v-for="category in categories"
        :key="category.id"
        @click="handleSelect(category.id)"
        class="px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border active:scale-95"
        :class="[
          selectedCategoryId === category.id
            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-lg transform scale-105'
            : 'glass-light text-[var(--color-text-secondary)] border-transparent hover:bg-[var(--glass-bg-hover)] hover:text-[var(--color-text)]'
        ]"
      >
        {{ category.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
