/**
 * ============================================
 * 配置管理模块 (Configuration Module)
 * ============================================
 * 
 * 【架构师视角】
 * 配置管理是企业级应用的基础设施，良好的配置设计应该：
 * 1. 支持环境变量覆盖（12-Factor App 原则）
 * 2. 集中管理所有配置项
 * 3. 提供合理的默认值
 * 4. 区分开发/生产环境
 * 
 * 【设计模式】
 * 本模块采用"配置对象"模式，将所有配置集中到一个对象中导出
 * 优点：配置项一目了然，便于维护和测试
 * 
 * 【环境变量】
 * 使用 dotenv 库从 .env 文件加载环境变量
 * 环境变量优先级高于默认值，便于不同环境部署
 */

// 加载环境变量（必须在其他模块之前调用）
// dotenv 会从 .env 文件读取变量并添加到 process.env
require('dotenv').config()

/**
 * 配置对象
 * 
 * 结构说明：
 * - server: 服务器相关配置（端口、主机）
 * - logger: 日志相关配置（级别、格式化）
 * - api: API 相关配置（基础路径、请求限制）
 * - cors: 跨域配置（允许的来源、方法）
 * - external: 外部服务配置（第三方 API 地址）
 */
module.exports = {
  /**
   * 服务器配置
   * 
   * @property {number} port - 服务监听端口，默认 3000
   * @property {string} host - 服务监听地址，默认 127.0.0.1
   * 
   * 【最佳实践】
   * - 开发环境使用 127.0.0.1（仅本机访问）
   * - 生产环境使用 0.0.0.0（允许外部访问）
   * - 端口应通过环境变量配置，便于容器化部署
   */
  server: {
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || '127.0.0.1'
  },

  /**
   * 日志配置
   * 
   * @property {string} level - 日志级别
   * @property {boolean} prettyPrint - 是否美化输出
   * 
   * 【日志级别说明】
   * - trace: 最详细，用于调试
   * - debug: 调试信息
   * - info: 常规信息（推荐生产环境使用）
   * - warn: 警告信息
   * - error: 错误信息
   * - fatal: 致命错误
   * 
   * 【生产环境建议】
   * - level: 'warn' 或 'error'
   * - prettyPrint: false（JSON 格式便于日志收集）
   */
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV !== 'production'
  },

  /**
   * API 配置
   * 
   * @property {string} basePath - API 基础路径前缀
   * @property {number} bodyLimit - 请求体大小限制（字节）
   * 
   * 【安全考虑】
   * bodyLimit 防止大文件上传导致服务器内存溢出
   * 默认 100KB，可根据实际需求调整
   */
  api: {
    basePath: '/api',
    bodyLimit: parseInt(process.env.BODY_LIMIT) || 102400 // 100KB in bytes
  },

  /**
   * CORS（跨域资源共享）配置
   * 
   * @property {string} origin - 允许的来源
   * @property {string[]} methods - 允许的 HTTP 方法
   * 
   * 【安全警告】
   * - 开发环境: '*' 允许所有来源
   * - 生产环境: 应指定具体域名，如 ['https://example.com']
   * 
   * 【为什么需要 CORS】
   * 浏览器同源策略限制跨域请求
   * CORS 允许服务器声明哪些来源可以访问资源
   */
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  },

  /**
   * 外部服务配置
   * 
   * @property {string} jsonPlaceholderUrl - JSONPlaceholder API 地址
   * 
   * 【依赖注入思想】
   * 将外部服务地址配置化，便于：
   * - 切换测试环境
   * - 使用 Mock 服务
   * - 服务迁移
   */
  external: {
    jsonPlaceholderUrl: 'https://jsonplaceholder.typicode.com'
  }
}
