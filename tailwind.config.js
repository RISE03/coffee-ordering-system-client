/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  // 使用 data-theme 属性切换朝暮主题
  darkMode: ['selector', '[data-theme="dusk"]'],
  theme: {
    extend: {
      colors: {
        // 将 primary 映射到 CSS 变量，以支持动态主题
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          // 兼容常用的 shade 写法，统一映射到主色
          50: 'var(--color-primary)',
          100: 'var(--color-primary)',
          200: 'var(--color-primary)',
          300: 'var(--color-primary)',
          400: 'var(--color-primary)',
          500: 'var(--color-primary)',
          600: 'var(--color-primary)',
          700: 'var(--color-primary)',
          800: 'var(--color-primary)',
          900: 'var(--color-primary)',
          950: 'var(--color-primary)',
        },
        // 朝 (Dawn) 主题色彩
        dawn: {
          primary: '#F5B041',       // 琥珀黄 - 主色调
          'primary-hover': '#E09D2B', // 主色调悬停
          bg: '#FCF9F2',            // 舒芙蕾白 - 背景色
          'bg-secondary': '#F7F3E8', // 次级背景色
          text: '#5D4037',          // 焦糖褐 - 文字色
          'text-secondary': '#8D6E63', // 次级文字色
          border: '#E0D5C5',        // 边框色
          accent: '#8B5A2B',        // 强调色
        },
        // 暮 (Dusk) 主题色彩
        dusk: {
          primary: '#FAD7A0',       // 淡金 - 主色调
          'primary-hover': '#F5C06A', // 主色调悬停
          bg: '#1A2530',            // 黛蓝 - 背景色
          'bg-secondary': '#243342', // 次级背景色
          text: '#ECF0F1',          // 云峰白 - 文字色
          'text-secondary': '#B8C5CC', // 次级文字色
          border: '#3D4F5F',        // 边框色
          accent: '#E8C78B',        // 强调色
        },
        // 通用品牌色
        brand: {
          amber: '#F5B041',
          gold: '#FAD7A0',
          brown: '#5D4037',
          navy: '#1A2530',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans SC',
          'sans-serif',
        ],
      },
      borderRadius: {
        'brand': '12px',
      },
      boxShadow: {
        'dawn': '0 4px 12px rgba(93, 64, 55, 0.1)',
        'dusk': '0 4px 12px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}