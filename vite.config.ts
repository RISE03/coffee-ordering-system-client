import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// 用户端 frontend-client 的 Vite 配置
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],

  server: {
    host: '0.0.0.0',    // 支持局域网访问
    port: 5174,         // 跟 admin 区分开，client 用 5174
    open: true,

    // API 代理配置 - 将 /api 请求转发到后端服务器
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 如果后端 API 路径不带 /api 前缀，可以重写路径
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  resolve: {
    alias: {
      '@': '/src',
    },
  },

  build: {
    // 生产构建优化
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    // 分块策略
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['naive-ui'],
        },
      },
    },
  },
})
