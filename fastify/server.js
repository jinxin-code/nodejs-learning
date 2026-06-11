/**
 * ============================================
 * 用户管理系统 - Fastify 主服务器入口
 * ============================================
 * 
 * 【架构师视角 - 应用入口设计原则】
 * 1. 单一入口：所有启动逻辑集中在一个文件
 * 2. 清晰的启动顺序：配置 → 插件 → 路由 → 监听
 * 3. 优雅的错误处理：启动失败时给出明确提示
 * 4. 可测试性：导出 app 实例便于测试
 * 
 * 【文件职责】
 * 本文件只负责"组装"工作，不包含业务逻辑：
 * - 创建 Fastify 实例
 * - 注册全局钩子和装饰器
 * - 加载插件和路由
 * - 启动服务器
 * 
 * 【模块化架构】
 * ┌─────────────────────────────────────────────────────────┐
 * │                      server.js                          │
 * │                    (应用入口/组装层)                      │
 * ├─────────────────────────────────────────────────────────┤
 * │  config.js  │  routes/*.js  │  services/*.js            │
 * │  (配置层)   │   (路由层)    │    (服务层)               │
 * └─────────────────────────────────────────────────────────┘
 */

// ============================================
// 依赖导入
// ============================================
// 【模块导入最佳实践】
// 1. 核心模块在前
// 2. 第三方模块在中
// 3. 项目模块在后
const fastify = require('fastify')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

// 项目模块
const config = require('./config')
const userService = require('./services/userService')
const userRoutes = require('./routes/users')
const healthRoutes = require('./routes/health')

// ============================================
// 1. 创建 Fastify 实例
// ============================================
// 【Fastify 构造函数配置】
// Fastify 支持多种配置选项，这里配置了最常用的：
// - logger: 日志系统配置
// - bodyLimit: 请求体大小限制
// 
// 【为什么使用 const app 而不是 const fastify】
// 避免与导入的 fastify 函数重名，使用 app 更语义化
const app = fastify({
  // 日志配置
  logger: {
    level: config.logger.level,
    // 开发环境使用 pino-pretty 美化日志输出
    transport: config.logger.prettyPrint ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',  // 时间格式
        ignore: 'pid,hostname'        // 忽略进程ID和主机名
      }
    } : undefined
  },
  // 请求体大小限制，防止大文件攻击
  bodyLimit: config.api.bodyLimit
})

// ============================================
// 2. 注册全局装饰器 (Decorators)
// ============================================
// 【装饰器模式应用】
// 装饰器允许我们扩展 Fastify 实例的功能
// 
// 【使用场景】
// - 添加通用工具函数
// - 添加数据库连接
// - 添加缓存客户端
// 
// 【三种装饰器】
// - decorate(): 添加到 Fastify 实例
// - decorateRequest(): 添加到 request 对象
// - decorateReply(): 添加到 reply 对象

/**
 * 获取当前时间戳
 * 统一时间格式，便于日志追踪和调试
 * 
 * @returns {string} ISO 格式时间戳
 */
app.decorate('getCurrentTimestamp', () => new Date().toISOString())

/**
 * 生成统一格式的响应对象
 * 
 * 【API 响应规范】
 * 统一的响应格式是 RESTful API 的最佳实践：
 * - success: 操作是否成功
 * - message: 人类可读的消息
 * - data: 实际数据
 * - timestamp: 响应时间戳
 * 
 * @param {any} data - 响应数据
 * @param {string} message - 响应消息
 * @returns {object} 统一响应格式
 */
app.decorate('generateResponse', (data, message = 'success') => ({
  success: true,
  message,
  data,
  timestamp: app.getCurrentTimestamp()
}))

// ============================================
// 3. 注册生命周期钩子 (Hooks)
// ============================================
// 【Fastify 请求生命周期】
// 请求按以下顺序经过各个阶段：
// 1. onRequest    - 请求到达
// 2. preParsing   - 解析请求体前
// 3. preValidation - Schema 验证前
// 4. preHandler   - 路由处理函数执行前
// 5. onSend       - 发送响应前
// 6. onResponse   - 响应发送后
// 7. onError      - 发生错误时
// 
// 【钩子函数签名】
// (request, reply, done) => {}
// - request: 请求对象，包含请求信息
// - reply: 响应对象，用于构建响应
// - done: 回调函数，必须调用才能继续

/**
 * onRequest 钩子 - 请求到达时触发
 * 
 * 【应用场景】
 * - 记录请求日志
 * - 认证检查
 * - 请求计时开始
 * - 限流控制
 */
app.addHook('onRequest', (request, reply, done) => {
  // 记录请求开始时间（用于计算响应时间）
  request.startTime = Date.now()
  
  // 记录请求日志
  app.log.info({
    method: request.method,  // HTTP 方法
    url: request.url,        // 请求 URL
    ip: request.ip           // 客户端 IP
  }, 'Incoming request')
  
  // 必须调用 done() 才能继续处理请求
  done()
})

/**
 * onResponse 钩子 - 响应发送后触发
 * 
 * 【应用场景】
 * - 记录响应时间
 * - 统计 API 性能
 * - 清理资源
 */
app.addHook('onResponse', (request, reply, done) => {
  // 计算请求处理耗时
  const duration = Date.now() - request.startTime
  
  app.log.info({
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,  // HTTP 状态码
    duration: `${duration}ms`      // 处理耗时
  }, 'Request completed')
  
  done()
})

/**
 * onError 钩子 - 请求出错时触发
 * 
 * 【应用场景】
 * - 记录错误日志
 * - 发送错误告警
 * - 错误统计分析
 */
app.addHook('onError', (request, reply, error, done) => {
  app.log.error({
    method: request.method,
    url: request.url,
    error: error.message,
    stack: error.stack  // 错误堆栈
  }, 'Request error')
  
  done()
})

// ============================================
// 4. 注册插件 (Plugins)
// ============================================
// 【Fastify 插件系统】
// 插件是 Fastify 模块化的核心机制
// 
// 【register 方法特点】
// 1. 创建独立的作用域
// 2. 支持异步加载
// 3. 可传递配置选项
// 4. 支持路由前缀

/**
 * CORS 插件 - 处理跨域请求
 * 
 * 【为什么需要 CORS】
 * 浏览器同源策略限制跨域请求
 * CORS 允许服务器声明哪些来源可以访问资源
 * 
 * 【安全警告】
 * 生产环境应限制 origin 为具体域名
 */
app.register(require('@fastify/cors'), {
  origin: config.cors.origin,
  methods: config.cors.methods
})

/**
 * 静态文件服务插件
 * 
 * 【配置说明】
 * - root: 静态文件根目录
 * - prefix: URL 路径前缀
 * 
 * 【访问方式】
 * public/index.html → http://localhost:3000/index.html
 */
app.register(require('@fastify/static'), {
  root: `${__dirname}/public`,
  prefix: '/'
})

// ============================================
// 5. 注册路由 (Routes)
// ============================================
// 【路由注册最佳实践】
// 1. 按功能模块拆分路由文件
// 2. 使用 prefix 统一添加路径前缀
// 3. 路由文件只负责定义端点，业务逻辑放在 service 层

/**
 * 用户管理路由
 * 所有用户相关 API 都在 /api/users 前缀下
 */
app.register(userRoutes, { prefix: `${config.api.basePath}/users` })

/**
 * 健康检查路由
 * 用于监控和负载均衡健康检查
 */
app.register(healthRoutes, { prefix: `${config.api.basePath}/health` })

// ============================================
// 6. 404 路由处理
// ============================================
// 【为什么需要 404 处理】
// 默认情况下，Fastify 会返回 JSON 格式的 404 错误
// 自定义处理可以返回更友好的错误信息
app.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    success: false,
    message: `Route not found: ${request.method} ${request.url}`,
    timestamp: app.getCurrentTimestamp()
  })
})

// ============================================
// 7. 统一错误处理 (Error Handler)
// ============================================
// 【错误处理策略】
// 1. 验证错误：返回 400 + 详细错误信息
// 2. 业务错误：返回对应状态码 + 错误消息
// 3. 系统错误：返回 500 + 通用错误消息
// 
// 【安全考虑】
// 生产环境不应暴露错误堆栈给客户端
app.setErrorHandler((error, request, reply) => {
  // Schema 验证错误
  if (error.validation) {
    reply.status(400).send({
      success: false,
      message: 'Validation error',
      errors: error.validation.map(v => `${v.instancePath} ${v.message}`),
      timestamp: app.getCurrentTimestamp()
    })
  } else {
    // 其他错误（业务错误、系统错误）
    reply.status(error.statusCode || 500).send({
      success: false,
      message: error.message || 'Internal server error',
      timestamp: app.getCurrentTimestamp()
    })
  }
})

// ============================================
// 8. 启动服务器
// ============================================
// 【启动流程】
// 1. 初始化数据（从外部 API 获取）
// 2. 启动 HTTP 服务器
// 3. 记录启动日志
// 
// 【优雅启动】
// 使用 async/await 确保启动顺序正确
// 错误时记录日志并退出进程
async function start() {
  try {
    // 步骤1: 初始化数据
    app.log.info('Fetching initial data from external API...')
    const response = await fetch(`${config.external.jsonPlaceholderUrl}/users`)
    const initialUsers = await response.json()
    userService.initUsers(initialUsers)
    app.log.info(`Initialized ${initialUsers.length} users`)
    
    // 步骤2: 启动服务器
    await app.listen({ 
      port: config.server.port, 
      host: config.server.host 
    })
    
    // 步骤3: 记录启动成功日志
    app.log.info(`Server running on http://${config.server.host}:${config.server.port}`)
    app.log.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
  } catch (err) {
    app.log.error('Failed to start server:', err)
    process.exit(1)
  }
}

// 执行启动
start()

// 导出 app 实例，便于测试
// 测试时可以导入 app 并使用 app.inject() 模拟请求
module.exports = app
