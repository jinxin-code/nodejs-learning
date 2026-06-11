# 用户管理系统

基于 Fastify + 原生 JavaScript 实现的用户管理应用，采用模块化架构设计，适合学习 Fastify 框架的核心概念和企业级项目架构。

## 功能特性

- **用户卡片展示** - 以网格卡片形式展示所有用户信息
- **用户详情查看** - 点击查看用户完整信息
- **用户搜索** - 实时搜索用户名或姓名
- **用户筛选** - 按用户名或邮箱前缀筛选
- **用户编辑** - 修改用户信息（姓名、用户名、邮箱）
- **用户新增** - 添加新用户
- **用户删除** - 删除用户（带确认框）

## 技术栈

- **后端**: Fastify 4.x（高性能 Node.js Web 框架）
- **前端**: 原生 HTML + CSS + JavaScript（无框架）
- **日志**: Pino + pino-pretty（结构化日志）
- **配置**: dotenv（环境变量管理）
- **数据来源**: https://jsonplaceholder.typicode.com/users

## 安装运行

```bash
# 安装依赖
npm install

# 开发环境启动（带热更新）
npm run dev

# 生产环境启动
npm start
```

服务器启动后访问 http://localhost:3000

## 项目结构

```
├── config.js              # 配置管理模块（环境变量、服务器配置）
├── .env                   # 环境变量文件
├── server.js              # 主服务器入口（应用启动、插件注册）
├── services/              # 服务层（业务逻辑）
│   └── userService.js     # 用户数据服务
├── routes/                # 路由层（API 端点定义）
│   ├── users.js           # 用户管理路由
│   └── health.js          # 健康检查路由
├── public/                # 静态资源（前端代码）
│   ├── index.html         # 用户列表页面
│   ├── user.html          # 用户详情页面
│   ├── styles.css         # 样式文件
│   ├── app.js             # 列表页逻辑
│   ├── api.js             # 统一 API 调用模块
│   └── user-detail.js     # 详情页逻辑
├── README.md              # 项目说明文档
└── .gitignore             # Git 忽略配置
```

## 架构设计

### 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│                     (public/*.html, *.js)                    │
│                      前端展示层                               │
├─────────────────────────────────────────────────────────────┤
│                       Route Layer                            │
│                      (routes/*.js)                           │
│                      路由层 - API 端点定义                    │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                           │
│                   (services/userService.js)                  │
│                      服务层 - 业务逻辑                        │
├─────────────────────────────────────────────────────────────┤
│                      Config Layer                            │
│                      (config.js, .env)                       │
│                      配置层 - 环境配置                        │
└─────────────────────────────────────────────────────────────┘
```

### 设计原则

| 原则 | 说明 | 应用场景 |
|------|------|----------|
| **单一职责** | 每个模块只负责一个功能 | 路由、服务、配置分离 |
| **开闭原则** | 对扩展开放，对修改关闭 | 通过插件扩展功能 |
| **依赖注入** | 通过参数传递依赖 | 路由插件接收 options |
| **DRY** | 不重复代码 | 统一响应格式、错误处理 |

## API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/users | 获取用户列表（支持搜索和筛选） |
| GET | /api/users/:id | 获取单个用户详情 |
| POST | /api/users | 创建新用户 |
| PUT | /api/users/:id | 更新用户信息 |
| DELETE | /api/users/:id | 删除用户 |
| GET | /api/health | 健康检查接口 |

## Fastify 核心概念学习

本项目演示了以下 Fastify 核心特性：

### 1. Schema 验证（Schema Validation）

Fastify 使用 JSON Schema 自动验证请求数据：

- **querystring**: 验证 URL 查询参数
- **params**: 验证路径参数（如用户 ID）
- **body**: 验证请求体
- **response**: 验证响应格式

```javascript
const userSchema = {
  type: 'object',
  required: ['name', 'username', 'email'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    email: { type: 'string', format: 'email' }
  }
}
```

### 2. 生命周期钩子（Hooks）

Fastify 提供多个生命周期钩子：

| 钩子 | 触发时机 | 用途 |
|------|----------|------|
| `onRequest` | 请求到达时 | 记录请求、认证检查 |
| `preValidation` | 验证前 | 修改请求数据 |
| `preHandler` | 处理函数执行前 | 权限检查 |
| `onSend` | 发送响应前 | 修改响应内容 |
| `onResponse` | 响应发送后 | 记录响应时间 |
| `onError` | 出错时 | 错误处理 |

### 3. 装饰器（Decorators）

扩展 Fastify 实例、request 或 reply 对象：

```javascript
// 添加到实例
fastify.decorate('generateResponse', (data, message) => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString()
}))

// 使用
return fastify.generateResponse(users, 'Users fetched')
```

### 4. 统一错误处理（Error Handler）

自定义错误处理，统一响应格式：

```javascript
fastify.setErrorHandler((error, request, reply) => {
  reply.status(error.statusCode || 500).send({
    success: false,
    message: error.message
  })
})
```

### 5. 日志系统（Logging）

Fastify 内置 Pino 日志，支持多种级别：

```javascript
const fastify = require('fastify')({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty'  // 美化日志输出
    }
  }
})

// 使用日志
fastify.log.info('Server started')
fastify.log.error(error)
```

### 6. 插件与路由注册

使用 `register` 组织路由，支持前缀：

```javascript
async function userRoutes(fastify, options) {
  fastify.get('/', async () => ({ /* ... */ }))
}

// 注册带前缀的路由
fastify.register(userRoutes, { prefix: '/api/users' })
```

## 配置管理

### 环境变量

项目使用 `.env` 文件管理环境变量：

```bash
# 服务器配置
PORT=3000
HOST=127.0.0.1

# 日志级别: trace, debug, info, warn, error, fatal
LOG_LEVEL=info

# 环境: development, production
NODE_ENV=development

# CORS 允许的来源
CORS_ORIGIN=*

# 请求体大小限制（字节）
BODY_LIMIT=102400
```

### 配置模块

`config.js` 集中管理所有配置，支持环境变量覆盖默认值。

## 前端优化特性

- **事件委托** - 使用事件委托减少事件监听器数量
- **防抖处理** - 搜索输入使用防抖优化性能（300ms）
- **统一 API 调用** - 提取 api.js 模块，代码复用
- **表单验证** - 前端输入验证，提升用户体验
- **用户反馈** - Loading 指示器和 Toast 提示

## 开发说明

1. 数据存储在内存中，重启服务器后数据会重置
2. 初始数据从 jsonplaceholder 获取
3. 开发环境使用 `npm run dev` 启动热更新
4. 日志输出到控制台，使用 pino-pretty 美化

## 生产环境建议

如需部署到生产环境，建议进行以下优化：

| 优化项 | 说明 |
|--------|------|
| **数据库** | 替换内存存储为 PostgreSQL/MongoDB |
| **认证授权** | 添加 JWT/OAuth2 认证 |
| **API 文档** | 集成 Swagger/OpenAPI |
| **测试覆盖** | 添加单元测试和集成测试 |
| **监控告警** | 集成 Prometheus + Grafana |
| **容器化** | 添加 Dockerfile 和 docker-compose.yml |

---

# User Management System

A user management application built with Fastify + Vanilla JavaScript, featuring modular architecture design, suitable for learning Fastify core concepts and enterprise-level project architecture.

## Features

- **User Card Display** - Display all users in grid card layout
- **View User Details** - Click to view complete user information
- **User Search** - Real-time search by username or name
- **User Filtering** - Filter by username or email prefix
- **Edit User** - Modify user information (name, username, email)
- **Add User** - Create new users
- **Delete User** - Remove users with confirmation dialog

## Tech Stack

- **Backend**: Fastify 4.x (High-performance Node.js web framework)
- **Frontend**: Vanilla HTML + CSS + JavaScript
- **Logging**: Pino + pino-pretty (Structured logging)
- **Config**: dotenv (Environment variable management)
- **Data Source**: https://jsonplaceholder.typicode.com/users

## Installation & Running

```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

Access http://localhost:3000 after server starts

## Project Structure

```
├── config.js              # Configuration module (env vars, server config)
├── .env                   # Environment variables file
├── server.js              # Main server entry (app startup, plugin registration)
├── services/              # Service layer (business logic)
│   └── userService.js     # User data service
├── routes/                # Route layer (API endpoint definitions)
│   ├── users.js           # User management routes
│   └── health.js          # Health check routes
├── public/                # Static assets (frontend code)
│   ├── index.html         # User list page
│   ├── user.html          # User detail page
│   ├── styles.css         # CSS styles
│   ├── app.js             # List page logic
│   ├── api.js             # Unified API module
│   └── user-detail.js     # Detail page logic
├── README.md              # Project documentation
└── .gitignore             # Git ignore configuration
```

## Architecture Design

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│                     (public/*.html, *.js)                    │
├─────────────────────────────────────────────────────────────┤
│                       Route Layer                            │
│                      (routes/*.js)                           │
│                  Route Layer - API endpoint definitions      │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                           │
│                   (services/userService.js)                  │
│                  Service Layer - Business logic              │
├─────────────────────────────────────────────────────────────┤
│                      Config Layer                            │
│                      (config.js, .env)                       │
│                  Config Layer - Environment config           │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles

| Principle | Description | Application |
|-----------|-------------|-------------|
| **Single Responsibility** | Each module handles one function | Routes, services, config separated |
| **Open/Closed** | Open for extension, closed for modification | Extend via plugins |
| **Dependency Injection** | Pass dependencies via parameters | Route plugins receive options |
| **DRY** | Don't Repeat Yourself | Unified response format, error handling |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/users | Get user list (supports search and filtering) |
| GET | /api/users/:id | Get single user detail |
| POST | /api/users | Create new user |
| PUT | /api/users/:id | Update user information |
| DELETE | /api/users/:id | Delete user |
| GET | /api/health | Health check endpoint |

## Fastify Core Concepts

This project demonstrates the following Fastify core features:

### 1. Schema Validation

Fastify uses JSON Schema to automatically validate request data:

- **querystring**: Validate URL query parameters
- **params**: Validate route parameters (e.g., user ID)
- **body**: Validate request body
- **response**: Validate response format

### 2. Lifecycle Hooks

Fastify provides multiple lifecycle hooks:

| Hook | Trigger Time | Use Case |
|------|--------------|----------|
| `onRequest` | When request arrives | Logging, authentication |
| `preValidation` | Before validation | Modify request data |
| `preHandler` | Before handler execution | Permission checks |
| `onSend` | Before sending response | Modify response |
| `onResponse` | After response sent | Log response time |
| `onError` | On error | Error handling |

### 3. Decorators

Extend Fastify instance, request, or reply objects:

```javascript
fastify.decorate('generateResponse', (data, message) => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString()
}))
```

### 4. Error Handling

Custom error handler for unified response format:

```javascript
fastify.setErrorHandler((error, request, reply) => {
  reply.status(error.statusCode || 500).send({
    success: false,
    message: error.message
  })
})
```

### 5. Logging

Built-in Pino logger with multiple levels:

```javascript
const fastify = require('fastify')({
  logger: {
    level: 'info',
    transport: { target: 'pino-pretty' }
  }
})
```

### 6. Plugins & Registration

Organize routes with `register` and prefix support:

```javascript
fastify.register(userRoutes, { prefix: '/api/users' })
```

## Configuration Management

### Environment Variables

The project uses `.env` file for environment variables:

```bash
PORT=3000
HOST=127.0.0.1
LOG_LEVEL=info
NODE_ENV=development
CORS_ORIGIN=*
BODY_LIMIT=102400
```

### Configuration Module

`config.js` centrally manages all configurations, supporting environment variable overrides.

## Frontend Optimizations

- **Event Delegation** - Reduce event listeners
- **Debouncing** - Optimize search performance (300ms)
- **Unified API Module** - Code reuse for API calls
- **Form Validation** - Frontend input validation
- **User Feedback** - Loading indicators and Toast notifications

## Development Notes

1. Data is stored in memory, will be reset after server restart
2. Initial data is fetched from jsonplaceholder
3. Use `npm run dev` for hot reload in development
4. Logs are output to console with pino-pretty formatting

## Production Recommendations

For production deployment, consider these optimizations:

| Item | Description |
|------|-------------|
| **Database** | Replace memory storage with PostgreSQL/MongoDB |
| **Authentication** | Add JWT/OAuth2 authentication |
| **API Documentation** | Integrate Swagger/OpenAPI |
| **Test Coverage** | Add unit and integration tests |
| **Monitoring** | Integrate Prometheus + Grafana |
| **Containerization** | Add Dockerfile and docker-compose.yml |
