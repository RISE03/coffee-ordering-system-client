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

/**
 * V2.0 首页 UI 刷新 - 主题时间范围定义
 * - Dawn (朝): 07:00 - 16:59 (hour >= 7 && hour < 17)
 * - Dusk (暮): 17:00 - 06:59 (hour >= 17 || hour < 7)
 */
const DAWN_START_HOUR = 7
const DAWN_END_HOUR = 17 // exclusive, so 16:59 is the last Dawn minute

export const useThemeStore = defineStore('theme', () => {
  // 状态：当前选中的模式
  const mode = ref<ThemeMode>((localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'auto')

  // 状态：当前实际生效的主题 ('dawn' | 'dusk')
  // 默认为 dawn，会由 applyTheme 更新
  const activeTheme = ref<'dawn' | 'dusk'>('dawn')

  // 状态：是否正在进行主题切换动画（防止快速连续切换导致闪烁）
  const isTransitioning = ref(false)

  // 计算属性：是否为自动模式
  const isAuto = computed(() => mode.value === 'auto')

  // 计算属性：是否为 Dawn 主题
  const isDawn = computed(() => activeTheme.value === 'dawn')

  // 计算属性：是否为 Dusk 主题
  const isDusk = computed(() => activeTheme.value === 'dusk')

  /**
   * 根据当前时间计算应该使用的主题
   * Dawn: 07:00 - 16:59
   * Dusk: 17:00 - 06:59
   */
  function calculateThemeByTime(): 'dawn' | 'dusk' {
    const hour = new Date().getHours()
    return (hour >= DAWN_START_HOUR && hour < DAWN_END_HOUR) ? 'dawn' : 'dusk'
  }

  // Action: 切换模式
  function setMode(newMode: ThemeMode) {
    mode.value = newMode
    localStorage.setItem(STORAGE_KEY, newMode)
    applyTheme()
  }

  // Action: 恢复自动模式（根据系统时间）
  function syncThemeWithSystemTime() {
    setMode('auto')
  }

  // Action: 快速切换主题（用于手动 toggle）
  // 注意：此操作会将模式切换为手动 (dawn 或 dusk)
  function toggleTheme() {
    if (mode.value === 'auto') {
      // 如果当前是自动模式，切换到与当前显示相反的手动模式
      const newTheme = activeTheme.value === 'dawn' ? 'dusk' : 'dawn'
      setMode(newTheme)
    } else {
      // 如果当前是手动模式，在 dawn 和 dusk 之间切换
      const newTheme = mode.value === 'dawn' ? 'dusk' : 'dawn'
      setMode(newTheme)
    }
  }

  // Action: 应用主题到 DOM
  function applyTheme() {
    // 防止快速连续切换导致闪烁
    if (isTransitioning.value) {
      return
    }

    const root = document.documentElement
    let targetTheme: 'dawn' | 'dusk'

    if (mode.value === 'auto') {
      // 自动模式：根据时间计算主题
      targetTheme = calculateThemeByTime()
    } else {
      // 手动模式：直接使用设定的模式
      targetTheme = mode.value
    }

    // 如果主题没有变化，不执行 DOM 操作
    if (activeTheme.value === targetTheme && root.dataset.theme === targetTheme) {
      return
    }

    // 标记正在切换
    isTransitioning.value = true

    activeTheme.value = targetTheme

    // 移除所有主题类
    root.classList.remove(THEME_CLASS.DAWN, THEME_CLASS.DUSK)
    // 添加目标主题类
    root.classList.add(targetTheme === 'dawn' ? THEME_CLASS.DAWN : THEME_CLASS.DUSK)

    // 设置 data-theme 属性 (关键：style.css 依赖此属性应用 CSS 变量)
    root.dataset.theme = targetTheme

    // 设置 Naive UI 的暗色模式适配 (通过 html class)
    if (targetTheme === 'dusk') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // 400ms 后解除切换锁定（与 CSS 过渡时间一致）
    setTimeout(() => {
      isTransitioning.value = false
    }, 400)
  }

  // 初始化
  applyTheme()

  // 监听模式变化，管理自动模式的定时器
  let intervalId: number | undefined
  
  // 清除定时器的辅助函数
  const clearIntervalTimer = () => {
    if (intervalId) {
      window.clearInterval(intervalId)
      intervalId = undefined
    }
  }

  watch(mode, (newMode) => {
    clearIntervalTimer()
    
    if (newMode === 'auto') {
      // 立即检查一次
      applyTheme()
      // 每分钟检查一次
      intervalId = window.setInterval(applyTheme, 60000)
    }
  }, { immediate: true })

  return {
    mode,
    activeTheme,
    isAuto,
    isDawn,
    isDusk,
    isTransitioning,
    setMode,
    syncThemeWithSystemTime,
    toggleTheme,
    applyTheme,
    calculateThemeByTime
  }
})
