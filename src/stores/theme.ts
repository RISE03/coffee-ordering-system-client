import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

// 主题类型：朝 | 暮 | 自动
export type ThemeMode = 'dawn' | 'dusk' | 'auto'

// 主题对应的 CSS 变量值 (仅用于参考，实际由 CSS 类控制)
export const THEME_CLASS = {
  DAWN: 'theme-dawn',
  DUSK: 'theme-dusk',
}

const STORAGE_KEY = 'dawn_dusk_theme_mode'

export const useThemeStore = defineStore('theme', () => {
  // 状态：当前选中的模式
  const mode = ref<ThemeMode>((localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'auto')
  
  // 状态：当前实际生效的主题 ('dawn' | 'dusk')
  // 默认为 dawn，会由 applyTheme 更新
  const activeTheme = ref<'dawn' | 'dusk'>('dawn')

  // 计算属性：是否为自动模式
  const isAuto = computed(() => mode.value === 'auto')

  // Action: 切换模式
  function setMode(newMode: ThemeMode) {
    mode.value = newMode
    localStorage.setItem(STORAGE_KEY, newMode)
    applyTheme()
  }

  // Action: 应用主题到 DOM
  function applyTheme() {
    const root = document.documentElement
    let targetTheme: 'dawn' | 'dusk'

    if (mode.value === 'auto') {
      // 自动模式：6:00 - 18:00 为朝 (dawn)，其他为暮 (dusk)
      const hour = new Date().getHours()
      targetTheme = (hour >= 6 && hour < 18) ? 'dawn' : 'dusk'
    } else {
      targetTheme = mode.value
    }

    activeTheme.value = targetTheme

    // 移除所有主题类
    root.classList.remove(THEME_CLASS.DAWN, THEME_CLASS.DUSK)
    // 添加目标主题类
    root.classList.add(targetTheme === 'dawn' ? THEME_CLASS.DAWN : THEME_CLASS.DUSK)

    // 设置 data-theme 属性 (关键修复：style.css 依赖此属性应用 CSS 变量)
    root.dataset.theme = targetTheme
    
    // 设置 Naive UI 的暗色模式适配 (通过 html class 或 meta theme-color)
    // 注意: Naive UI 的暗色模式通常需要 NConfigProvider，这里仅处理全局 CSS 变量
    if (targetTheme === 'dusk') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 初始化
  applyTheme()

  // 如果是自动模式，每分钟检查一次时间
  let intervalId: number | undefined
  watch(mode, (newMode) => {
    if (newMode === 'auto') {
      if (!intervalId) {
        intervalId = window.setInterval(applyTheme, 60000)
      }
    } else {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = undefined
      }
    }
  }, { immediate: true })

  return {
    mode,
    activeTheme,
    isAuto,
    setMode,
    applyTheme
  }
})
