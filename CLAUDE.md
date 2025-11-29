# CLAUDE.md

> **⚠️ 核心指令 / CRITICAL**
> **请务必全程使用【简体中文】进行对话、回复、解释代码和编写文档。**
> **Always use Simplified Chinese for all interactions, responses, and documentation.**

本文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指导。

## 重要提示：Windows 系统文件编辑

### ⚠️ 必须遵守：Windows 系统文件路径必须使用反斜杠

**Claude Code 中存在一个文件修改的错误。解决方法是：在所有文件操作中始终使用完整的绝对 Windows 路径，并包含驱动器号和反斜杠（`\`）。此规则应从现在起一直适用，而不仅仅针对当前文件。**
**在 Windows 系统使用 Edit 或 MultiEdit 工具时，文件路径必须使用反斜杠（`\`），不能使用正斜杠（`/`）。**

#### ❌ 错误写法 - 会导致错误：
```
Edit(file_path: "D:/repos/project/file.tsx", ...)
MultiEdit(file_path: "D:/repos/project/file.tsx", ...)
```

#### ✅ 正确写法 - 始终有效：
```
Edit(file_path: "D:\repos\project\file.tsx", ...)
MultiEdit(file_path: "D:\repos\project\file.tsx", ...)
```

## 重要规范

### 规范
- 所有代码注释、文档、提交信息使用中文，专有名词保留原文即可。
- 所有文件的读取、写入、提交等操作必须统一使用 UTF-8 编码

## 项目概述

这是"朝暮"咖啡厅在线点餐与消费积分系统的 **frontend-client**（用户端/会员端）。基于 Vue 3 + TypeScript + Vite 构建的单页应用，为顾客提供商品浏览、下单点餐、积分（光阴值）管理和优惠券兑换等功能。

另有独立的 **frontend-admin** 项目用于管理后台。

## 常用命令

```bash
# 启动开发服务器（端口 5174，支持局域网访问）
npm run dev

# 类型检查并构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 架构说明

### 技术栈
- **框架**：Vue 3，使用 Composition API（`<script setup>`）
- **构建工具**：Vite 7.x（开发服务器端口 5174）
- **语言**：TypeScript 5.x
- **UI 组件库**：Naive UI（待集成）
- **状态管理**：Pinia（待集成）
- **路由**：Vue Router 4（待集成）
- **HTTP 客户端**：Axios（待集成）
- **样式**：Tailwind CSS + CSS 变量实现主题切换（待集成）

### 后端对接
- 后端：Spring Boot 3.5.8 RESTful API（通常运行在 8080 端口）
- 认证：JWT 令牌，通过 `Authorization: Bearer <token>` 请求头传递
- API 代理可在 `vite.config.ts` 的 `server.proxy` 中配置

### 主题系统（朝/暮模式）
应用支持动态"朝/暮"主题切换：
- 根据当前时间自动切换
- 用户可手动切换（本地持久化）
- 通过 CSS 变量实现（`--primary-color`、`--bg-color`、`--text-color`）

### 主要路由（规划中）
- `/login`、`/register` - 登录注册
- `/`、`/products` - 首页/商品浏览，含时间段推荐
- `/cart`、`/checkout` - 购物车与结算下单
- `/orders`、`/orders/:orderId` - 订单管理
- `/points` - 积分中心（光阴值）
- `/coupons` - 我的优惠券
- `/profile`、`/addresses` - 个人中心与收货地址

## 设计文档

详细规格说明位于 `.specify/markdown/` 目录：
- `咖啡厅在线点餐与消费积分系统_需求规格说明书V1.1.md` - 需求规格
- `咖啡厅在线点餐与消费积分系统_页面与模块结构设计V1.1_修改版.md` - 页面结构
- `咖啡厅在线点餐与消费积分系统_接口设计说明V1.2_修改版.md` - 接口设计
- `咖啡厅在线点餐与消费积分系统_技术栈与架构选型说明V1.4_补充ViteConfig示例.md` - 技术栈
- `朝暮_品牌与UI视觉设计方案V1.1.md` - 品牌与UI设计
