# Dawn & Dusk Frontend Client

朝暮咖啡厅在线点餐与会员体系的用户端前端项目，基于 Vue 3、TypeScript 与 Vite 构建。当前版本覆盖首页时间流推荐、全日菜单、购物车、结算下单、订单管理、个人中心、积分与优惠券等核心会员能力。

## 功能概览

- 时间流首页：按时段展示推荐商品，支持营业状态提示与相邻时段预加载。
- 全日菜单：支持分类切换、全局搜索、商品详情跳转和加入购物车。
- 购物车与结算：支持购物车结算、立即购买、优惠券选择、订单预览与支付。
- 订单中心：支持订单列表、订单详情、取消订单、退款申请与撤销。
- 会员能力：支持个人资料、头像上传、密码修改、等级展示、积分记录与优惠券兑换。
- 主题体验：支持 Dawn / Dusk 双主题与自动切换。
- 实时通知：通过 SSE 接收订单状态变化与取餐/配送提醒。

## 技术栈

- Vue 3 + Composition API + `<script setup>`
- TypeScript 5
- Vite 7
- Vue Router 4
- Pinia
- Axios
- Naive UI
- Tailwind CSS v4
- Vitest + happy-dom

## 环境要求

- Node.js `20.19+` 或 `22.12+`
- npm `10+`
- 后端服务默认运行在 `http://localhost:8080`

## 快速开始

```bash
npm install
npm run dev
```

开发服务器默认监听 `0.0.0.0:5174`，并自动打开浏览器。

开发环境中，前端会将 `/api` 请求代理到 `http://localhost:8080`。

## 常用命令

```bash
# 启动开发服务器
npm run dev

# 类型检查并构建生产包
npm run build

# 本地预览构建结果
npm run preview

# 运行测试（watch）
npm run test

# 单次运行测试
npm run test:run

# 打开 Vitest UI
npm run test:ui
```

说明：当前仓库没有 `lint` / `format` 脚本。

## 主要路由

| 路径 | 说明 | 是否需要登录 |
| --- | --- | --- |
| `/` | 首页时间流推荐 | 否 |
| `/menu` | 全日菜单 | 否 |
| `/product/:id` | 商品详情 | 否 |
| `/login` | 登录页 | 否 |
| `/register` | 注册页 | 否 |
| `/cart` / `/member/cart` | 购物车 | 是 |
| `/member/checkout` | 结算下单 | 是 |
| `/member/orders` | 订单列表 | 是 |
| `/member/orders/:orderNo` | 订单详情 | 是 |
| `/member/level` | 会员等级页 | 是 |
| `/profile` | 个人中心 | 是 |
| `/points` | 积分中心 | 是 |
| `/coupons` | 我的优惠券 | 是 |

## 目录结构

```text
frontend-client/
├── public/                 # 静态资源
├── bug/                    # 问题复盘记录
├── tools/rg/               # 仓库内置 ripgrep
├── src/
│   ├── api/                # Axios 客户端与领域 API 模块
│   ├── components/         # 通用、布局、首页、登录、会员、商品组件
│   ├── composables/        # 可复用业务逻辑
│   ├── constants/          # 时间流等常量配置
│   ├── router/             # 路由与守卫
│   ├── stores/             # Pinia 状态管理
│   ├── tests/              # Vitest 初始化与示例测试
│   ├── types/              # 业务类型定义
│   ├── utils/              # 错误处理、SSE、营业时间等工具
│   ├── views/              # 页面入口
│   ├── App.vue             # 根组件
│   ├── main.ts             # 应用启动入口
│   └── style.css           # 全局主题与样式变量
├── AGENTS.md               # Agent 协作说明
├── CLAUDE.md               # Claude 兼容说明
├── GEMINI.md               # Gemini 兼容说明
├── vite.config.ts          # Vite 配置
├── vitest.config.ts        # Vitest 配置
└── package.json            # 依赖与脚本
```

## 关键实现说明

### 启动流程

- `main.ts` 会先应用主题，再执行认证检查。
- 已登录用户会在启动阶段绑定购物车用户并拉取购物车数据。
- `App.vue` 会统一挂载 Naive UI Provider，并启用订单通知监听。

### 主题系统

- 主题由 `src/style.css` 中的 CSS 变量驱动。
- 通过 `data-theme="dusk"` 切换 Dawn / Dusk 主题。
- `useThemeStore` 支持手动切换与按时间自动切换。

### 接口与认证

- `src/api/client.ts` 统一处理 `/api` baseURL、token 注入、错误消息和 401 跳转。
- 路由登录守卫在 `src/router/index.ts` 中定义。
- 订单相关通知通过 `src/utils/sse.ts` 与 `src/composables/useOrderNotification.ts` 处理。

## 测试说明

- 测试框架为 Vitest，运行环境为 `happy-dom`。
- 初始化文件位于 `src/tests/setup.ts`。
- 业务测试当前主要分布在：
  - `src/stores/*.spec.ts`
  - `src/utils/*.spec.ts`
  - `src/tests/example.spec.ts`
- `tsconfig.app.json` 默认排除了 `src/**/*.spec.ts` 与 `src/**/*.test.ts`，因此 `npm run build` 不会覆盖测试文件的类型检查。

## 开发建议

- 修改认证、全局请求或登录跳转时，同时检查 `src/api/client.ts`、`src/router/index.ts`、`src/stores/auth.ts`。
- 修改订单流程时，同时检查 `views`、`stores`、`api`、SSE 通知与对应测试，避免状态漂移。
- 修改积分、优惠券、购物车和结算逻辑时，注意同步更新相关类型定义与页面交互。

## 相关文档

- [AGENTS.md](./AGENTS.md)：项目级 agent 协作约定。
- [CLAUDE.md](./CLAUDE.md)：Claude 使用说明。
- [GEMINI.md](./GEMINI.md)：Gemini 使用说明。
