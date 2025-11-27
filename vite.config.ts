import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 用户端 frontend-client 的 Vite 配置
export default defineConfig({
  plugins: [vue()],

  server: {
    host: '0.0.0.0',    // 同样支持局域网访问
    port: 5174,         // 跟 admin 区分开，client 用 5174
    open: true,
  },

  // 将来你要配接口代理的话，这里同样可以加
  // proxy: {
  //   '/api': {
  //     target: 'http://localhost:8080',
  //     changeOrigin: true,
  //   },
  // },
})
