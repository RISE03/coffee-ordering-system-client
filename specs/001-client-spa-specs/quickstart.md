# Quickstart: Frontend Client SPA

**Branch**: `001-client-spa-specs` | **Date**: 2025-11-27

本文档提供 frontend-client 项目的快速启动指南。

---

## 1. 环境要求

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | 20 LTS 或 22 LTS | 推荐 22.x |
| npm | 10.x+ | 随 Node.js 安装 |
| Git | 2.x+ | 版本控制 |

---

## 2. 项目初始化

### 2.1 克隆仓库

```bash
git clone <repository-url>
cd frontend-client
```

### 2.2 安装依赖

```bash
npm install
```

> **Windows 用户注意**: 如遇到 Rollup 平台依赖问题，执行：
> ```bash
> rm -rf node_modules package-lock.json
> npm install
> # 如仍有问题
> npm install @rollup/rollup-win32-x64-msvc --save-dev
> ```

### 2.3 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:5174` 启动。

---

## 3. 项目结构

```
frontend-client/
├── src/
│   ├── api/              # API 客户端模块
│   ├── components/       # 可复用组件
│   ├── composables/      # 组合式函数
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia stores
│   ├── styles/           # 全局样式与主题
│   ├── types/            # TypeScript 类型定义
│   ├── views/            # 页面组件
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── public/               # 静态资源
├── tests/                # 测试文件
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 4. 核心依赖

```json
{
  "dependencies": {
    "vue": "^3.5.x",
    "vue-router": "^4.x",
    "pinia": "^2.x",
    "naive-ui": "^2.x",
    "axios": "^1.x"
  },
  "devDependencies": {
    "vite": "^7.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "@vitejs/plugin-vue": "^5.x",
    "vitest": "^3.x",
    "@vue/test-utils": "^2.x"
  }
}
```

---

## 5. 开发配置

### 5.1 Vite 配置 (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

### 5.2 Tailwind 配置 (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dawn Mode
        'dawn-primary': '#F5B041',
        'dawn-bg': '#FCF9F2',
        'dawn-text': '#5D4037',
        // Dusk Mode
        'dusk-primary': '#FAD7A0',
        'dusk-bg': '#1A2530',
        'dusk-text': '#ECF0F1',
      },
    },
  },
  plugins: [],
}
```

---

## 6. 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (端口 5174) |
| `npm run build` | 类型检查并构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run test` | 运行测试 |
| `npm run lint` | 代码检查 |

---

## 7. 后端对接

### 7.1 API 代理配置

开发环境下，API 请求通过 Vite 代理转发到后端：

- 前端请求: `http://localhost:5174/api/*`
- 代理到: `http://localhost:8080/api/*`

### 7.2 后端服务

确保后端 Spring Boot 服务运行在 `http://localhost:8080`。

---

## 8. 主题系统

### 8.1 CSS 变量

```css
/* Dawn Mode */
:root[data-theme="dawn"] {
  --primary-color: #F5B041;
  --bg-color: #FCF9F2;
  --text-color: #5D4037;
}

/* Dusk Mode */
:root[data-theme="dusk"] {
  --primary-color: #FAD7A0;
  --bg-color: #1A2530;
  --text-color: #ECF0F1;
}
```

### 8.2 主题切换

主题状态存储在 Pinia store 中，并持久化到 localStorage：

- `auto`: 根据时间自动切换 (06:00-17:59 Dawn, 18:00-05:59 Dusk)
- `dawn`: 强制使用 Dawn 主题
- `dusk`: 强制使用 Dusk 主题

---

## 9. 路由结构

| 路由 | 页面 | 权限 |
|------|------|------|
| `/` | 首页 | 公开 |
| `/menu` | 菜单浏览 | 公开 |
| `/product/:id` | 商品详情 | 公开 |
| `/cart` | 购物车 | 公开 |
| `/login` | 登录 | 公开 |
| `/register` | 注册 | 公开 |
| `/checkout` | 结算 | 需登录 |
| `/orders` | 订单列表 | 需登录 |
| `/orders/:orderId` | 订单详情 | 需登录 |
| `/points` | 积分中心 | 需登录 |
| `/coupons` | 我的优惠券 | 需登录 |
| `/profile` | 个人中心 | 需登录 |
| `/addresses` | 收货地址 | 需登录 |

---

## 10. 开发规范

### 10.1 文件命名

- 组件: PascalCase (如 `ProductCard.vue`)
- 组合式函数: camelCase + use 前缀 (如 `useTheme.ts`)
- 类型定义: camelCase (如 `product.ts`)
- Store: camelCase (如 `auth.ts`)

### 10.2 代码风格

- 使用 `<script setup lang="ts">` 语法
- 优先使用 Composition API
- 避免使用 `any` 类型
- 组件保持小而专注

### 10.3 提交规范

```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

---

## 11. 故障排除

### 11.1 依赖安装失败

```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 11.2 端口占用

```bash
# Windows
netstat -ano | findstr :5174
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5174
kill -9 <PID>
```

### 11.3 API 代理不生效

1. 确认后端服务已启动
2. 检查 `vite.config.ts` 中的 proxy 配置
3. 确认请求路径以 `/api` 开头

---

## 12. 相关文档

- [Feature Spec](./spec.md) - 功能规格说明
- [Implementation Plan](./plan.md) - 实施计划
- [Data Model](./data-model.md) - 数据模型
- [API Contracts](./contracts/api-contracts.md) - API 契约
- [Constitution](../../.specify/memory/constitution.md) - 项目宪法
