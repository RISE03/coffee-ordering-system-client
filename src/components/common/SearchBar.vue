<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { NIcon } from 'naive-ui'
import { SearchOutline, CloseCircle, TimeOutline } from '@vicons/ionicons5'

interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索商品...'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
  (e: 'clear'): void
}>()

const HISTORY_KEY = 'dawn_dusk_search_history'
const MAX_HISTORY = 6

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const searchHistory = ref<string[]>([])

// 从本地存储加载搜索历史
onMounted(() => {
  const stored = localStorage.getItem(HISTORY_KEY)
  if (stored) {
    try {
      searchHistory.value = JSON.parse(stored)
    } catch {
      searchHistory.value = []
    }
  }
})

// 保存搜索历史
const saveHistory = (keyword: string) => {
  if (!keyword.trim()) return
  const trimmed = keyword.trim()
  // 移除重复项
  searchHistory.value = searchHistory.value.filter(h => h !== trimmed)
  // 添加到开头
  searchHistory.value.unshift(trimmed)
  // 限制数量
  if (searchHistory.value.length > MAX_HISTORY) {
    searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY)
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory.value))
}

const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem(HISTORY_KEY)
}

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)
}

const handleSearch = () => {
  if (props.modelValue.trim()) {
    saveHistory(props.modelValue)
    emit('search', props.modelValue)
  }
  isFocused.value = false
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch()
  }
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

const selectHistory = (keyword: string) => {
  emit('update:modelValue', keyword)
  emit('search', keyword)
  isFocused.value = false
}

const showDropdown = computed(() => {
  return isFocused.value && searchHistory.value.length > 0 && !props.modelValue
})

// 点击外部关闭下拉
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.search-container')) {
    isFocused.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="search-container relative">
    <!-- 搜索输入框 -->
    <div
      class="flex items-center gap-2 px-4 py-2.5 rounded-full glass-card transition-all duration-200"
      :class="{ 'ring-2 ring-[var(--color-primary)]/50': isFocused }"
    >
      <NIcon :component="SearchOutline" class="text-lg text-[var(--color-text-secondary)] flex-shrink-0" />
      <input
        ref="inputRef"
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        class="flex-1 bg-transparent border-none outline-none text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]/60"
        @input="handleInput"
        @focus="isFocused = true"
        @keydown="handleKeydown"
      />
      <button
        v-if="modelValue"
        @click="handleClear"
        class="p-1 rounded-full hover:bg-[var(--glass-bg-hover)] transition-colors"
      >
        <NIcon :component="CloseCircle" class="text-lg text-[var(--color-text-secondary)]" />
      </button>
    </div>

    <!-- 搜索历史下拉 -->
    <Transition name="dropdown">
      <div
        v-if="showDropdown"
        class="absolute top-full left-0 right-0 mt-2 glass-card-strong rounded-xl overflow-hidden shadow-lg z-50"
      >
        <div class="p-3 border-b border-[var(--glass-border)] flex items-center justify-between">
          <span class="text-xs font-medium text-[var(--color-text-secondary)]">搜索历史</span>
          <button
            @click.stop="clearHistory"
            class="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
          >
            清空
          </button>
        </div>
        <div class="p-2">
          <button
            v-for="keyword in searchHistory"
            :key="keyword"
            @click="selectHistory(keyword)"
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-[var(--glass-bg-hover)] transition-colors"
          >
            <NIcon :component="TimeOutline" class="text-sm text-[var(--color-text-secondary)]" />
            <span class="text-sm text-[var(--color-text)] truncate">{{ keyword }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active {
  transition: all 0.2s ease-out;
}
.dropdown-leave-active {
  transition: all 0.15s ease-in;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
