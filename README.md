# 用户管理系统

一个使用 Node.js 构建的全栈用户管理应用，包含 **四种实现版本** 用于学习对比：
- 原生 Node.js
- Express
- Koa.js
- Fastify

## 功能特性

- **用户卡片展示** - 以卡片形式展示所有用户，包含姓名、用户名和邮箱
- **用户详情查看** - 查看特定用户的详细信息
- **用户搜索** - 按用户名或姓名实时搜索
- **用户筛选** - 按姓名、用户名或邮箱升序/降序排序
- **用户编辑** - 修改用户信息，支持保存/取消
- **用户新增** - 通过表单提交添加新用户
- **用户删除** - 删除用户，带确认对话框

## 项目结构

```
.
├── package.json              # 项目依赖和脚本
├── config.js                 # 集中配置管理
├── server-native.js          # 原生 Node.js 服务器实现
├── server-express.js         # Express 服务器实现
├── server-koa.js             # Koa.js 服务器实现
├── fastify/                  # Fastify 版本（独立目录）
│   ├── server.js             # Fastify 服务器实现
│   ├── config.js             # Fastify 配置
│   ├── routes/               # Fastify 路由定义
│   │   ├── health.js         # 健康检查路由
│   │   └── users.js          # 用户管理路由
│   ├── services/
│   │   └── userService.js    # Fastify 业务逻辑
│   └── package.json          # Fastify 依赖配置
├── services/
│   └── userService.js        # 共享业务逻辑模块（CRUD 操作）
├── utils/
│   └── validator.js          # 输入验证工具
├── .gitignore                # Git 忽略配置
└── public/                   # 前端静态文件（所有版本共享）
    ├── index.html            # 主 HTML 页面
    ├── css/
    │   └── style.css         # CSS 样式
    └── js/
        └── app.js            # 前端 JavaScript 逻辑（模块化封装）
```

## 技术架构

### 后端架构

```
┌─────────────────────────────────────────────────────────────┐
│                       HTTP Server                           │
│  (server-native.js / server-express.js / server-koa.js)     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      config.js                              │
│  (配置集中管理：端口、CORS、缓存、验证规则)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   services/userService.js                   │
│  (共享业务逻辑：用户数据的增删改查)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    utils/validator.js                       │
│  (输入验证：邮箱格式、用户名格式、长度限制)                    │
└─────────────────────────────────────────────────────────────┘
```

### 前端架构

```
┌─────────────────────────────────────────────────────────────┐
│                      AppState (状态管理)                    │
│  (用户列表、搜索关键词、筛选条件、编辑状态)                    │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   ApiService    │  │   UIRenderer    │  │  Event Listeners│
│  (API 调用封装)  │  │  (DOM 渲染)     │  │  (事件处理)     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## 开始使用

### 前提条件

- Node.js 18+ 推荐版本
- npm 包管理器

### 安装

```bash
# 安装依赖
npm install
```

### 运行应用

#### 原生 Node.js 版本

```bash
npm start
```

#### Express 版本

```bash
npm run start:express
```

#### Koa.js 版本

```bash
npm run start:koa
```

#### Fastify 版本

```bash
npm run start:fastify
```

#### 停止服务器

```bash
npm run stop
```

### 访问应用

打开浏览器访问:
```
http://localhost:3000
```

## API 端点

所有版本提供相同的 RESTful API：

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/users` | 获取所有用户 |
| GET | `/api/users/:id` | 根据ID获取单个用户 |
| POST | `/api/users` | 创建新用户 |
| PUT | `/api/users/:id` | 更新现有用户 |
| DELETE | `/api/users/:id` | 删除用户 |

### 请求体格式

```json
{
  "name": "张三",
  "username": "zhangsan",
  "email": "zhang@example.com"
}
```

### 输入验证规则

| 字段 | 规则 |
|------|------|
| name | 必填，最大 100 字符 |
| username | 必填，最大 50 字符，只能包含字母、数字、下划线 |
| email | 必填，最大 255 字符，必须是有效邮箱格式 |

## 学习笔记

### 原生 Node.js vs Express vs Koa.js vs Fastify 对比

| 特性 | 原生 Node.js | Express | Koa.js | Fastify |
|------|-------------|---------|--------|---------|
| 代码行数 | ~300 行 | ~150 行 | ~170 行 | ~140 行 |
| 路由处理 | 手动解析 URL | 内置路由 | 外部路由中间件 | 内置路由 |
| 静态文件 | 手动读取文件 | `express.static()` | `koa-static` | `@fastify/static` |
| 请求体 | 手动解析 | `express.json()` | `koa-body` | 内置 JSON 解析 |
| CORS | 手动设置响应头 | 内置支持 | 手动/中间件 | `@fastify/cors` |
| 异步支持 | 回调/Promise | 回调/Promise | 原生 async/await | 原生 async/await |
| 复杂度 | 最高 | 中等 | 中等 | 低 |
| 灵活性 | 完全控制 | 抽象封装 | 非常灵活 | 高 |
| 设计哲学 | 无抽象 | 约定优于配置 | 极简主义 | 高性能优先 |
| 中间件模式 | 无 | Connect 风格 | async/await | async/await + Hooks |
| 性能 | 基础 | 良好 | 良好 | 优秀 |

### 各框架核心概念

#### 原生 Node.js
1. **HTTP 模块** - Node.js 内置模块，用于创建服务器
2. **事件驱动架构** - 通过事件监听器处理请求
3. **流处理** - 以流的方式读取请求体

#### Express
1. **中间件** - 请求处理管道（Connect 风格）
2. **路由** - 声明式路由定义
3. **静态文件** - 内置静态文件服务

#### Koa.js
1. **Async/Await 中间件** - 现代异步中间件模式
2. **Context 对象** - 统一的 ctx 包含请求和响应
3. **极简主义哲学** - 只包含核心功能

#### Fastify
1. **高性能架构** - 基于 Node.js 最快的 HTTP 框架之一
2. **Schema 验证** - 内置 JSON Schema 验证支持
3. **Hooks 系统** - 生命周期钩子（onRequest, preHandler, onSend 等）
4. **插件系统** - 强大的插件架构扩展功能
5. **内置 JSON 解析** - 高性能的请求体解析

### Express vs Koa.js vs Fastify 主要区别

| 方面 | Express | Koa.js | Fastify |
|------|---------|--------|---------|
| **中间件模式** | `(req, res, next)` | `async (ctx, next)` | `async (req, reply)` + Hooks |
| **错误处理** | try-catch 或错误中间件 | try-catch + await | 内置错误处理 + 钩子 |
| **内置功能** | 很多（路由、静态文件等） | 极少 | 核心功能 + 插件系统 |
| **学习曲线** | 较低 | 稍高 | 中等 |
| **灵活性** | 好 | 优秀 | 优秀 |
| **性能** | 良好 | 良好 | 优秀 |
| **Schema 验证** | 需第三方库 | 需第三方库 | 内置支持 |

## 安全特性

- **CORS 限制**：只允许指定域名访问
- **输入验证**：完整的邮箱/用户名格式验证
- **XSS 防护**：前端 HTML 转义处理
- **请求体大小限制**：防止大请求攻击
- **错误信息保护**：不暴露服务器内部细节

## 性能优化

- **静态文件缓存**：设置 1 天缓存时间
- **ETag 禁用**：减少不必要的 HTTP 请求
- **代码模块化**：减少重复代码，提高可维护性

## 许可证

本项目仅供学习使用。

---

# User Management System

A full-stack user management application built with Node.js, featuring **four implementations** for learning purposes:
- Native Node.js (vanilla)
- Express
- Koa.js
- Fastify

## Features

- **User Card Display** - Display all users in card format with name, username, and email
- **User Detail View** - View detailed information about a specific user
- **User Search** - Real-time search by username or name
- **User Filter** - Sort users by name, username, or email in ascending/descending order
- **User Edit** - Modify user information with save/cancel options
- **User Add** - Add new users via form submission
- **User Delete** - Remove users with confirmation dialog

## Project Structure

```
.
├── package.json              # Project dependencies and scripts
├── config.js                 # Centralized configuration management
├── server-native.js          # Native Node.js server implementation
├── server-express.js         # Express server implementation
├── server-koa.js             # Koa.js server implementation
├── fastify/                  # Fastify version (separate directory)
│   ├── server.js             # Fastify server implementation
│   ├── config.js             # Fastify configuration
│   ├── routes/               # Fastify route definitions
│   │   ├── health.js         # Health check route
│   │   └── users.js          # User management routes
│   ├── services/
│   │   └── userService.js    # Fastify business logic
│   └── package.json          # Fastify dependency configuration
├── services/
│   └── userService.js        # Shared business logic module (CRUD operations)
├── utils/
│   └── validator.js          # Input validation utilities
├── .gitignore                # Git ignore configuration
└── public/                   # Frontend static files (shared by all versions)
    ├── index.html            # Main HTML page
    ├── css/
    │   └── style.css         # CSS styling
    └── js/
        └── app.js            # Frontend JavaScript logic (modular encapsulation)
```

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm package manager

### Installation

```bash
# Install dependencies
npm install
```

### Running the Application

#### Native Node.js Version

```bash
npm start
```

#### Express Version

```bash
npm run start:express
```

#### Koa.js Version

```bash
npm run start:koa
```

#### Fastify Version

```bash
npm run start:fastify
```

#### Stop Server

```bash
npm run stop
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

All implementations provide the same RESTful API:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get a single user by ID |
| POST | `/api/users` | Create a new user |
| PUT | `/api/users/:id` | Update an existing user |
| DELETE | `/api/users/:id` | Delete a user |

### Request Body Format

```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com"
}
```

### Validation Rules

| Field | Rule |
|-------|------|
| name | Required, max 100 characters |
| username | Required, max 50 characters, alphanumeric and underscore only |
| email | Required, max 255 characters, valid email format |

## Security Features

- **CORS Restriction**: Only allows specified origins
- **Input Validation**: Complete email/username format validation
- **XSS Protection**: Frontend HTML escaping
- **Request Size Limit**: Prevents large request attacks
- **Error Protection**: Does not expose internal server details

## Performance Optimization

- **Static File Caching**: 1-day cache duration
- **ETag Disabled**: Reduces unnecessary HTTP requests
- **Code Modularization**: Reduces code duplication

## License

This project is for educational purposes only.