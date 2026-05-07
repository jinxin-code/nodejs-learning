/**
 * 配置文件 - 集中管理所有配置参数
 */

module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  
  // API 配置
  api: {
    basePath: '/api',
    externalUsersUrl: 'https://jsonplaceholder.typicode.com/users'
  },
  
  // CORS 配置 - 生产环境应限制特定域名
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ]
  },
  
  // 静态文件缓存配置（秒）
  cache: {
    staticFilesMaxAge: 86400 // 1天
  },
  
  // 输入验证规则
  validation: {
    maxNameLength: 100,
    maxUsernameLength: 50,
    maxEmailLength: 255
  }
};